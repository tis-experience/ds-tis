#!/usr/bin/env node
/**
 * test-runtime-lifecycle.mjs
 *
 * Gate ADR-020: init → interação → destroy → re-init sem listeners órfãos
 * para Modal, Menu, Combobox, Accordion, Tabs e Tooltip.
 */

import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import { createEvidenceRecorder, writeEvidenceReport } from './lib/readiness-evidence.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const evidenceRecorder = createEvidenceRecorder('runtime-lifecycle');
let checks = 0;

function evidence(slug, capability, caseId) {
  return { slug, capability, caseId };
}

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

console.log('\n═══ test-runtime-lifecycle ═══════════════════');

let server = null;
let browser = null;

try {
  const port = await freePort();
  server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
    cwd: ROOT,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  ok(await waitForPort(port), `http.server failed on ${port}`);

  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/tests/runtime/lifecycle.html`, {
    waitUntil: 'networkidle',
  });

  await page.waitForFunction(() => document.documentElement.dataset.lifecycleReady === 'true', null, {
    timeout: 5000,
  });

  // --- Init ---
  await page.evaluate(() => window.__dsLifecycle.init());
  let markers = await page.evaluate(() => window.__dsLifecycle.markers());
  ok(markers.modalInit && markers.modalTrigger, 'initModals must mark overlay and trigger');
  ok(markers.menuInit, 'initActionMenus must mark action menu');
  ok(markers.comboInit, 'initComboboxes must mark combobox anchor');
  ok(markers.accordionInit, 'initAccordions must mark accordion');
  ok(markers.tabsInit, 'initTabs must mark tablist');
  ok(markers.tooltipInit, 'initTooltips must mark tooltip');

  await page.evaluate(() => window.__dsLifecycle.clearEvents());

  // --- Modal open/close + events ---
  await page.locator('#open-modal').click();
  ok(
    await page.locator('#life-modal').evaluate((el) => !el.hidden),
    'modal must open via trigger after init',
    evidence('modal', 'open-close', 'trigger-opens'),
  );
  await page.keyboard.press('Escape');
  ok(
    await page.locator('#life-modal').evaluate((el) => el.hidden),
    'modal must close on Escape',
    [
      evidence('modal', 'keyboard', 'escape-closes'),
      evidence('modal', 'open-close', 'escape-closes'),
    ],
  );

  // --- Menu open/close ---
  await page.locator('#menu-trigger').click();
  ok(
    await page.locator('#life-menu').evaluate((el) => el.dataset.open === 'true'),
    'action menu must open after init',
    evidence('menu', 'open-close', 'trigger-opens'),
  );
  await page.keyboard.press('Escape');
  ok(
    await page.locator('#life-menu').evaluate((el) => el.dataset.open !== 'true'),
    'action menu must close on Escape',
  );

  // --- Combobox select + change event ---
  await page.locator('#combo-input').focus();
  ok(
    await page.locator('#combo-list').evaluate((el) => !el.hidden),
    'combobox listbox must open on focus',
    evidence('combobox', 'open-close', 'focus-opens'),
  );
  await page.locator('#combo-list .ds-combobox__option', { hasText: 'Beta' }).click();
  ok(
    (await page.locator('#combo-input').inputValue()) === 'Beta',
    'combobox must update value on select',
  );

  // --- Accordion toggle + single mode ---
  await page.locator('#acc-trigger-a').click();
  ok(
    await page.locator('#acc-panel-a').evaluate((el) => !el.hidden),
    'accordion must open panel A',
    evidence('accordion', 'open-close', 'toggle-item'),
  );
  await page.locator('#acc-trigger-b').click();
  ok(
    await page.locator('#acc-panel-b').evaluate((el) => !el.hidden),
    'accordion must open panel B',
  );
  ok(
    await page.locator('#acc-panel-a').evaluate((el) => el.hidden),
    'single mode must close panel A when B opens',
    evidence('accordion', 'open-close', 'single-closes-previous'),
  );

  // --- Tabs selection + change event ---
  await page.locator('#life-tab-b').click();
  ok(
    await page.locator('#life-panel-b').evaluate((el) => !el.hidden),
    'tabs must show panel B',
  );
  ok(
    await page.locator('#life-panel-a').evaluate((el) => el.hidden),
    'tabs must hide panel A',
    evidence('tabs', 'open-close', 'selection-switches-panel'),
  );
  ok(
    await page.locator('#life-tab-b').evaluate((el) => el.getAttribute('aria-selected') === 'true'),
    'tabs must mark selected tab',
  );

  // --- Tooltip show on hover + Escape hide ---
  await page.locator('#tip-trigger').hover();
  await page.locator('#life-tip').waitFor({ state: 'visible', timeout: 1500 });
  ok(
    await page.locator('#life-tip').evaluate((el) => !el.hasAttribute('hidden')),
    'tooltip must show on hover',
    evidence('tooltip', 'open-close', 'hover-delay-opens'),
  );
  await page.keyboard.press('Escape');
  ok(
    await page.locator('#life-tip').evaluate((el) => el.hasAttribute('hidden')),
    'tooltip must hide on Escape',
  );

  const eventsAfterUse = await page.evaluate(() => window.__dsLifecycle.events());
  const eventCount = (name) => eventsAfterUse.filter((eventName) => eventName === name).length;
  const expectedEventCounts = {
    'ds-modal-open': 1,
    'ds-modal-close': 1,
    'ds-menu-open': 1,
    'ds-menu-close': 1,
    'ds-combobox-change': 1,
    'ds-accordion-open': 2,
    'ds-accordion-close': 1,
    'ds-tabs-change': 1,
    'ds-tooltip-show': 1,
    'ds-tooltip-hide': 1,
  };
  for (const [eventName, expectedCount] of Object.entries(expectedEventCounts)) {
    ok(
      eventCount(eventName) === expectedCount,
      `${eventName} must emit exactly ${expectedCount} time(s), got ${eventCount(eventName)}`,
    );
  }
  const eventExpectationsBySlug = {
    modal: ['ds-modal-open', 'ds-modal-close'],
    menu: ['ds-menu-open', 'ds-menu-close'],
    combobox: ['ds-combobox-change'],
    accordion: ['ds-accordion-open', 'ds-accordion-close'],
    tabs: ['ds-tabs-change'],
    tooltip: ['ds-tooltip-show', 'ds-tooltip-hide'],
  };
  for (const [slug, eventNames] of Object.entries(eventExpectationsBySlug)) {
    ok(
      eventNames.every((eventName) => eventCount(eventName) === expectedEventCounts[eventName]),
      `${slug} public event counts must match the exercised transitions`,
      evidence(slug, 'events', 'public-event-count'),
    );
  }

  // --- Destroy: markers gone, triggers dead ---
  await page.evaluate(() => {
    window.__dsLifecycle.clearEvents();
    window.__dsLifecycle.destroy();
  });
  markers = await page.evaluate(() => window.__dsLifecycle.markers());
  ok(!markers.modalInit && !markers.modalTrigger, 'destroyModals must clear init markers');
  ok(!markers.menuInit, 'destroyActionMenus must clear init markers');
  ok(!markers.comboInit, 'destroyComboboxes must clear init markers');
  ok(!markers.accordionInit, 'destroyAccordions must clear init markers');
  ok(!markers.tabsInit, 'destroyTabs must clear init markers');
  ok(!markers.tooltipInit, 'destroyTooltips must clear init markers');

  await page.locator('#open-modal').click();
  ok(
    await page.locator('#life-modal').evaluate((el) => el.hidden),
    'destroyed modal trigger must not open overlay',
    evidence('modal', 'destroy', 'no-post-destroy-effects'),
  );

  await page.locator('#menu-trigger').click();
  ok(
    await page.locator('#life-menu').evaluate((el) => el.dataset.open !== 'true'),
    'destroyed menu trigger must not open menu',
    evidence('menu', 'destroy', 'no-post-destroy-effects'),
  );

  // Document click leftover must not throw / re-open after destroy+reselect
  await page.locator('#combo-input').click();
  ok(
    await page.locator('#combo-list').evaluate((el) => el.hidden),
    'destroyed combobox must not open listbox',
    evidence('combobox', 'destroy', 'no-post-destroy-effects'),
  );

  await page.locator('#acc-trigger-a').click();
  ok(
    await page.locator('#acc-panel-a').evaluate((el) => el.hidden),
    'destroyed accordion trigger must not toggle panel',
    evidence('accordion', 'destroy', 'no-post-destroy-effects'),
  );

  await page.locator('#life-tab-a').click();
  ok(
    await page.locator('#life-panel-a').evaluate((el) => el.hidden),
    'destroyed tabs must not switch panels',
    evidence('tabs', 'destroy', 'no-post-destroy-effects'),
  );

  await page.locator('#tip-trigger').hover();
  await page.waitForTimeout(300);
  ok(
    await page.locator('#life-tip').evaluate((el) => el.hasAttribute('hidden')),
    'destroyed tooltip must not show on hover',
    evidence('tooltip', 'destroy', 'no-post-destroy-effects'),
  );

  const eventsAfterDestroy = await page.evaluate(() => window.__dsLifecycle.events());
  ok(
    eventsAfterDestroy.length === 0,
    `destroy must stop emitting lifecycle events (got ${eventsAfterDestroy.join(', ')})`,
  );

  // --- Re-init restores behavior ---
  await page.evaluate(() => window.__dsLifecycle.init());
  await page.locator('#open-modal').click();
  ok(
    await page.locator('#life-modal').evaluate((el) => !el.hidden),
    're-init must restore modal trigger',
    evidence('modal', 'reinit', 'reinit-restores-behavior'),
  );
  await page.keyboard.press('Escape');

  await page.locator('#menu-trigger').click();
  ok(
    await page.locator('#life-menu').evaluate((el) => el.dataset.open === 'true'),
    're-init must restore action menu',
    evidence('menu', 'reinit', 'reinit-restores-behavior'),
  );
  await page.keyboard.press('Escape');

  await page.locator('#combo-input').fill('');
  await page.locator('#combo-input').click();
  await page.locator('#combo-list .ds-combobox__option', { hasText: 'Alpha' }).click();
  ok(
    (await page.locator('#combo-input').inputValue()) === 'Alpha',
    're-init must restore combobox selection',
    evidence('combobox', 'reinit', 'reinit-restores-behavior'),
  );

  await page.locator('#acc-trigger-a').click();
  ok(
    await page.locator('#acc-panel-a').evaluate((el) => !el.hidden),
    're-init must restore accordion toggle',
    evidence('accordion', 'reinit', 'reinit-restores-behavior'),
  );

  await page.locator('#life-tab-a').click();
  ok(
    await page.locator('#life-panel-a').evaluate((el) => !el.hidden),
    're-init must restore tabs selection',
    evidence('tabs', 'reinit', 'reinit-restores-behavior'),
  );

  await page.locator('#tip-trigger').hover();
  await page.locator('#life-tip').waitFor({ state: 'visible', timeout: 1500 });
  ok(
    await page.locator('#life-tip').evaluate((el) => !el.hasAttribute('hidden')),
    're-init must restore tooltip hover',
    evidence('tooltip', 'reinit', 'reinit-restores-behavior'),
  );

  console.log(`Checks: ${checks}`);
} catch (error) {
  errors.push(error.stack || String(error));
} finally {
  if (browser) await browser.close().catch(() => {});
  if (server) server.kill('SIGTERM');
}

writeEvidenceReport(evidenceRecorder, { passed: errors.length === 0 });

if (errors.length === 0) {
  console.log('✅ PASS — runtime lifecycle (init/destroy/re-init)');
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}\n`);
process.exit(1);
