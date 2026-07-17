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
const exercisedRuntimeSlugs = ['modal', 'combobox'];
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

  // Axe no consumidor
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const blocking = axe.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  ok(
    blocking.length === 0,
    `axe found ${blocking.length} critical/serious violation(s):\n${blocking
      .map((v) => `  - ${v.id}: ${v.help}`)
      .join('\n')}`,
    [
      { slug: 'modal', capability: 'axe-closed', caseId: 'axe-closed-no-blocking' },
      { slug: 'combobox', capability: 'axe-closed', caseId: 'axe-closed-no-blocking' },
    ],
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
