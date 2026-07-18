#!/usr/bin/env node
/**
 * test-consumer-smoke.mjs
 *
 * Instala o tarball real do ds-tis em um projeto consumidor temporário e
 * valida CSS + runtimes públicos no browser (Playwright + axe).
 *
 * Gate da ADR-020: consumo fora do site de docs.
 */

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

import { RUNTIME_BY_SLUG } from './lib/component-catalog.mjs';
import { createEvidenceRecorder, writeEvidenceReport } from './lib/readiness-evidence.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_DIR = path.join(ROOT, 'tests', 'consumer', 'fixture');
const errors = [];
const evidenceRecorder = createEvidenceRecorder('consumer-smoke');
const runtimeEntries = Object.entries(RUNTIME_BY_SLUG);
const exercisedRuntimeSlugs = ['modal', 'combobox', 'accordion', 'menu', 'tabs'];
let checks = 0;

function ok(condition, message, evidenceItems = []) {
  checks += 1;
  if (!condition) {
    errors.push(message);
    return;
  }
  const items = Array.isArray(evidenceItems) ? evidenceItems : [evidenceItems];
  for (const item of items) {
    if (item) evidenceRecorder.pass(item.slug, item.capability, item.caseId);
  }
}

function run(label, command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: false,
    ...options,
  });
  if (result.status !== 0) {
    errors.push(
      `${label} exited ${result.status ?? 'null'}\n${result.stderr || result.stdout}`,
    );
  }
  return result;
}

async function waitForPort(port, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ready = await new Promise((resolve) => {
      const socket = net.createConnection(port, '127.0.0.1');
      socket.on('connect', () => {
        socket.end();
        resolve(true);
      });
      socket.on('error', () => resolve(false));
    });
    if (ready) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((err) => (err ? reject(err) : resolve(port)));
    });
    server.on('error', reject);
  });
}

console.log('\n═══ test-consumer-smoke ══════════════════════');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-tis-consumer-'));
const packDir = path.join(tmpRoot, 'pack');
const consumerDir = path.join(tmpRoot, 'app');
fs.mkdirSync(packDir);
fs.mkdirSync(consumerDir);

let server = null;
let browser = null;

try {
  // 1. Empacotar o DS
  const pack = run('npm pack', 'npm', ['pack', '--json', '--pack-destination', packDir], {
    cwd: ROOT,
    env: { ...process.env, npm_config_cache: path.join(tmpRoot, 'npm-cache') },
  });
  if (errors.length) throw new Error('pack failed');

  const packed = JSON.parse(pack.stdout.slice(pack.stdout.indexOf('[')));
  const tarballName = packed[0]?.filename;
  ok(Boolean(tarballName), 'npm pack must produce a tarball filename');
  const tarballPath = path.join(packDir, tarballName);
  ok(fs.existsSync(tarballPath), `tarball missing: ${tarballPath}`);

  // 2. Projeto consumidor mínimo
  fs.writeFileSync(
    path.join(consumerDir, 'package.json'),
    JSON.stringify(
      {
        name: 'ds-tis-consumer-smoke',
        private: true,
        type: 'module',
        dependencies: {
          'ds-tis': `file:${tarballPath}`,
        },
      },
      null,
      2,
    ),
  );

  for (const file of ['index.html', 'app.js']) {
    fs.copyFileSync(path.join(FIXTURE_DIR, file), path.join(consumerDir, file));
  }

  run('npm install (consumer)', 'npm', ['install', '--no-fund', '--no-audit'], {
    cwd: consumerDir,
    env: { ...process.env, npm_config_cache: path.join(tmpRoot, 'npm-cache') },
  });
  if (errors.length) throw new Error('install failed');

  const installedCss = path.join(consumerDir, 'node_modules', 'ds-tis', 'css', 'design-system.css');
  ok(fs.existsSync(installedCss), 'consumer must receive ds-tis/css/design-system.css');
  for (const [, runtime] of runtimeEntries) {
    const slug = runtime.module.replace('ds-tis/', '');
    const installedRuntime = path.join(consumerDir, 'node_modules', 'ds-tis', 'js', `${slug}.js`);
    ok(fs.existsSync(installedRuntime), `consumer must receive ${runtime.module}`);
  }

  // 3. Resolução Node dos exports públicos (como bundler/Node resolveria)
  const publicContracts = [
    ...runtimeEntries.map(([slug, runtime]) => ({ slug, module: runtime.module, exports: runtime.exports })),
    { slug: 'theme', module: 'ds-tis/theme', exports: ['applyTheme', 'toCssSnippet', 'generateBrandScale'] },
  ];
  const probeSource = `
    const contracts = ${JSON.stringify(publicContracts)};
    for (const contract of contracts) {
      const publicModule = await import(contract.module);
      for (const exportName of contract.exports) {
        if (typeof publicModule[exportName] !== 'function') {
          console.error(contract.module + ' missing ' + exportName);
          process.exit(2);
        }
      }
    }
  `;
  const exportProbe = run(
    'node resolve canonical ds-tis runtime exports',
    'node',
    ['--input-type=module', '-e', probeSource],
    { cwd: consumerDir },
  );
  ok(exportProbe.status === 0, 'Node must resolve every canonical bare runtime import from the consumer');
  if (exportProbe.status === 0) {
    for (const [slug] of runtimeEntries) {
      evidenceRecorder.pass(slug, 'package-export', 'bare-import');
      evidenceRecorder.pass(slug, 'package-export', 'declared-exports');
    }
  }

  // 4. Browser: CSS + interação
  const port = await freePort();
  server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
    cwd: consumerDir,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  const listening = await waitForPort(port);
  ok(listening, `http.server failed to listen on ${port}`);

  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const browserErrors = [];
  let captureBrowserErrors = true;
  page.on('pageerror', (error) => {
    if (captureBrowserErrors) browserErrors.push(`pageerror: ${error.message}`);
  });
  page.on('console', (message) => {
    if (captureBrowserErrors && message.type() === 'error') {
      const location = message.location();
      const source = location.url ? ` (${location.url})` : '';
      browserErrors.push(`console.error: ${message.text()}${source}`);
    }
  });
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });

  await page.waitForFunction(() => document.documentElement.dataset.smokeReady === 'true', null, {
    timeout: 5000,
  }).catch(() => {});
  const ready = await page.evaluate(() => document.documentElement.dataset.smokeReady);
  ok(ready === 'true', `consumer runtime did not initialize (smokeReady=${ready})`);

  const buttonBg = await page.locator('#submit-login').evaluate((el) => getComputedStyle(el).backgroundColor);
  ok(
    Boolean(buttonBg) && buttonBg !== 'rgba(0, 0, 0, 0)' && buttonBg !== 'transparent',
    `Brand button must receive packaged CSS background (got ${buttonBg})`,
  );

  const tokenProbe = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      brand: styles.getPropertyValue('--ds-brand-background-default').trim(),
      content: styles.getPropertyValue('--ds-content-default').trim(),
    };
  });
  ok(tokenProbe.brand.length > 0, 'CSS tokens --ds-brand-background-default must load from package');
  ok(tokenProbe.content.length > 0, 'CSS tokens --ds-content-default must load from package');

  // Modal open / Escape close
  await page.locator('#open-modal').click();
  const modalVisible = await page.locator('#confirm-modal').evaluate((el) => !el.hidden);
  ok(modalVisible, 'initModals must open modal via data-ds-modal-open');

  await page.keyboard.press('Escape');
  const modalClosed = await page.locator('#confirm-modal').evaluate((el) => el.hidden);
  ok(modalClosed, 'initModals must close modal on Escape');
  ok(
    modalVisible && modalClosed,
    'packed Modal must complete an installed open/close interaction',
    { slug: 'modal', capability: 'consumer-tarball', caseId: 'installed-interaction' },
  );

  // Combobox open + select
  await page.locator('#country').click();
  const listOpen = await page.locator('#country-list').evaluate((el) => !el.hidden);
  ok(listOpen, 'initComboboxes must open listbox on focus/click');
  await page.locator('#country-list .ds-combobox__option', { hasText: 'Brazil' }).click();
  const countryValue = await page.locator('#country').inputValue();
  ok(countryValue === 'Brazil', `combobox selection must update input (got "${countryValue}")`);
  ok(
    listOpen && countryValue === 'Brazil',
    'packed Combobox must complete an installed selection interaction',
    { slug: 'combobox', capability: 'consumer-tarball', caseId: 'installed-interaction' },
  );

  // Accordion open + single mode
  await page.locator('#consumer-accordion-trigger-a').click();
  const accordionAOpen = await page.locator('#consumer-accordion-panel-a').evaluate((el) => !el.hidden);
  await page.locator('#consumer-accordion-trigger-b').click();
  const accordionBOpen = await page.locator('#consumer-accordion-panel-b').evaluate((el) => !el.hidden);
  const accordionAClosed = await page.locator('#consumer-accordion-panel-a').evaluate((el) => el.hidden);
  ok(accordionAOpen, 'packed Accordion must open the first item');
  ok(accordionBOpen && accordionAClosed, 'packed Accordion single mode must close the previous item');
  ok(
    accordionAOpen && accordionBOpen && accordionAClosed,
    'packed Accordion must complete an installed single-mode interaction',
    { slug: 'accordion', capability: 'consumer-tarball', caseId: 'installed-interaction' },
  );

  // Action Menu open + enabled item closes.
  await page.locator('#consumer-menu-trigger').click();
  const menuOpen = await page.locator('#consumer-menu').evaluate((el) => el.dataset.open === 'true');
  await page.locator('#consumer-menu-edit').click();
  const menuClosed = await page.locator('#consumer-menu').evaluate((el) => el.dataset.open !== 'true');
  ok(menuOpen, 'packed Action Menu must open from its trigger');
  ok(menuClosed, 'packed Action Menu must close after an enabled item activates');
  ok(
    menuOpen && menuClosed,
    'packed Action Menu must complete an installed open/select interaction',
    { slug: 'menu', capability: 'consumer-tarball', caseId: 'installed-interaction' },
  );

  // Tabs select a panel without submitting the enclosing form.
  await page.locator('#consumer-tab-b').click();
  const tabsInstalled = await page.evaluate(() => ({
    selected: document.getElementById('consumer-tab-b').getAttribute('aria-selected'),
    panelVisible: !document.getElementById('consumer-panel-b').hidden,
    submitCount: document.getElementById('consumer-tabs-form').dataset.submitCount,
    normalizedType: document.getElementById('consumer-tab-b').type,
  }));
  ok(
    tabsInstalled.selected === 'true'
      && tabsInstalled.panelVisible
      && tabsInstalled.submitCount === '0'
      && tabsInstalled.normalizedType === 'button',
    `packed Tabs must select a panel without submitting its form (${JSON.stringify(tabsInstalled)})`,
    { slug: 'tabs', capability: 'consumer-tarball', caseId: 'installed-interaction' },
  );
  await page.locator('#consumer-tab-a').click();

  // Exceções assíncronas e console.error invalidam o consumidor. A coleta
  // termina antes do axe: a instrumentação do axe reinsere @imports no
  // documento e o Chromium pode reportar 404s artificiais relativos à raiz.
  await page.waitForTimeout(50);
  ok(
    browserErrors.length === 0,
    `consumer emitted browser error(s):\n${browserErrors.map((error) => `  - ${error}`).join('\n')}`,
    exercisedRuntimeSlugs.map((slug) => ({
      slug,
      capability: 'browser-errors',
      caseId: 'no-page-or-console-errors',
    })),
  );
  captureBrowserErrors = false;

  // Axe no consumidor com Accordion fechado.
  await page.locator('#consumer-accordion-trigger-b').click();
  const axeClosed = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const blockingClosed = axeClosed.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  ok(
    blockingClosed.length === 0,
    `axe closed state found ${blockingClosed.length} critical/serious violation(s):\n${blockingClosed
      .map((v) => `  - ${v.id}: ${v.help}`)
      .join('\n')}`,
    [
      { slug: 'modal', capability: 'axe-closed', caseId: 'axe-closed-no-blocking' },
      { slug: 'combobox', capability: 'axe-closed', caseId: 'axe-closed-no-blocking' },
      { slug: 'accordion', capability: 'axe-closed', caseId: 'axe-closed-no-blocking' },
      { slug: 'menu', capability: 'axe-closed', caseId: 'axe-closed-no-blocking' },
      { slug: 'tabs', capability: 'axe-closed', caseId: 'axe-closed-no-blocking' },
    ],
  );

  // Axe com o Modal aberto no tarball instalado.
  await page.locator('#open-modal').click();
  const axeModalOpen = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const blockingModalOpen = axeModalOpen.violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious');
  ok(
    blockingModalOpen.length === 0,
    `axe open Modal found ${blockingModalOpen.length} critical/serious violation(s):\n${blockingModalOpen
      .map((v) => `  - ${v.id}: ${v.help}`)
      .join('\n')}`,
    { slug: 'modal', capability: 'axe-open', caseId: 'axe-open-no-blocking' },
  );
  await page.keyboard.press('Escape');

  // Axe com o listbox do Combobox aberto no tarball instalado.
  await page.locator('#country').fill('');
  await page.locator('#country').focus();
  const axeComboboxOpen = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const blockingComboboxOpen = axeComboboxOpen.violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious');
  ok(
    blockingComboboxOpen.length === 0,
    `axe open Combobox found ${blockingComboboxOpen.length} critical/serious violation(s):\n${blockingComboboxOpen
      .map((v) => `  - ${v.id}: ${v.help}`)
      .join('\n')}`,
    { slug: 'combobox', capability: 'axe-open', caseId: 'axe-open-no-blocking' },
  );
  await page.keyboard.press('Escape');

  // Axe com o Action Menu aberto no tarball instalado.
  await page.locator('#consumer-menu-trigger').click();
  await page.waitForFunction(() => {
    const menu = document.getElementById('consumer-menu-list');
    return getComputedStyle(menu).visibility === 'visible'
      && getComputedStyle(menu).opacity === '1';
  });
  const axeMenuOpen = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const blockingMenuOpen = axeMenuOpen.violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious');
  ok(
    blockingMenuOpen.length === 0,
    `axe open Action Menu found ${blockingMenuOpen.length} critical/serious violation(s):\n${blockingMenuOpen
      .map((v) => `  - ${v.id}: ${v.help}\n${v.nodes
        .map((node) => `      ${node.html}\n      ${node.failureSummary}`)
        .join('\n')}`)
      .join('\n')}`,
    { slug: 'menu', capability: 'axe-open', caseId: 'axe-open-no-blocking' },
  );
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => (
    getComputedStyle(document.getElementById('consumer-menu-list')).visibility === 'hidden'
  ));

  // Axe com o segundo tabpanel selecionado no tarball instalado.
  await page.locator('#consumer-tab-b').click();
  const axeTabsOpen = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const blockingTabsOpen = axeTabsOpen.violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious');
  ok(
    blockingTabsOpen.length === 0,
    `axe selected Tabs panel found ${blockingTabsOpen.length} critical/serious violation(s):\n${blockingTabsOpen
      .map((v) => `  - ${v.id}: ${v.help}`)
      .join('\n')}`,
    { slug: 'tabs', capability: 'axe-open', caseId: 'axe-open-no-blocking' },
  );

  // Axe com o painel do Accordion aberto.
  await page.locator('#consumer-accordion-trigger-b').click();
  const axeOpen = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const blockingOpen = axeOpen.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  ok(
    blockingOpen.length === 0,
    `axe open Accordion found ${blockingOpen.length} critical/serious violation(s):\n${blockingOpen
      .map((v) => `  - ${v.id}: ${v.help}`)
      .join('\n')}`,
    { slug: 'accordion', capability: 'axe-open', caseId: 'axe-open-no-blocking' },
  );

  console.log(`Checks: ${checks}`);
  console.log(`Tarball: ${tarballName}`);
  console.log(`Consumer temp: ${consumerDir}`);
} catch (error) {
  errors.push(error.stack || String(error));
} finally {
  if (browser) await browser.close().catch(() => {});
  if (server) {
    server.kill('SIGTERM');
  }
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

writeEvidenceReport(evidenceRecorder, { passed: errors.length === 0 });

if (errors.length === 0) {
  console.log(`✅ PASS — consumer smoke with packed ds-tis@${pkg.version}`);
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}\n`);
process.exit(1);
