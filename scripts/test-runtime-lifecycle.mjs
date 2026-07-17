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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
let checks = 0;

function ok(condition, message) {
  checks += 1;
  if (!condition) errors.push(message);
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
  );
  await page.keyboard.press('Escape');
  ok(
    await page.locator('#life-modal').evaluate((el) => el.hidden),
    'modal must close on Escape',
  );

  // --- Menu open/close ---
  await page.locator('#menu-trigger').click();
  ok(
    await page.locator('#life-menu').evaluate((el) => el.dataset.open === 'true'),
    'action menu must open after init',
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
  );
  await page.locator('#acc-trigger-b').click();
  ok(
    await page.locator('#acc-panel-b').evaluate((el) => !el.hidden),
    'accordion must open panel B',
  );
  ok(
    await page.locator('#acc-panel-a').evaluate((el) => el.hidden),
    'single mode must close panel A when B opens',
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
  );
  ok(
    await page.locator('#life-tab-b').evaluate((el) => el.getAttribute('aria-selected') === 'true'),
    'tabs must mark selected tab',
  );

  // --- Tooltip show on hover + Escape hide ---
  await page.locator('#tip-trigger').hover();
  await page.waitForTimeout(150);
  ok(
    await page.locator('#life-tip').evaluate((el) => !el.hasAttribute('hidden')),
    'tooltip must show on hover',
  );
  await page.keyboard.press('Escape');
  ok(
    await page.locator('#life-tip').evaluate((el) => el.hasAttribute('hidden')),
    'tooltip must hide on Escape',
  );

  const eventsAfterUse = await page.evaluate(() => window.__dsLifecycle.events());
  ok(eventsAfterUse.includes('ds-modal-open'), 'must emit ds-modal-open');
  ok(eventsAfterUse.includes('ds-modal-close'), 'must emit ds-modal-close');
  ok(eventsAfterUse.includes('ds-menu-open'), 'must emit ds-menu-open');
  ok(eventsAfterUse.includes('ds-menu-close'), 'must emit ds-menu-close');
  ok(eventsAfterUse.includes('ds-combobox-change'), 'must emit ds-combobox-change');
  ok(eventsAfterUse.includes('ds-accordion-open'), 'must emit ds-accordion-open');
  ok(eventsAfterUse.includes('ds-accordion-close'), 'must emit ds-accordion-close');
  ok(eventsAfterUse.includes('ds-tabs-change'), 'must emit ds-tabs-change');
  ok(eventsAfterUse.includes('ds-tooltip-show'), 'must emit ds-tooltip-show');
  ok(eventsAfterUse.includes('ds-tooltip-hide'), 'must emit ds-tooltip-hide');

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
  );

  await page.locator('#menu-trigger').click();
  ok(
    await page.locator('#life-menu').evaluate((el) => el.dataset.open !== 'true'),
    'destroyed menu trigger must not open menu',
  );

  // Document click leftover must not throw / re-open after destroy+reselect
  await page.locator('#combo-input').click();
  ok(
    await page.locator('#combo-list').evaluate((el) => el.hidden),
    'destroyed combobox must not open listbox',
  );

  await page.locator('#acc-trigger-a').click();
  ok(
    await page.locator('#acc-panel-a').evaluate((el) => el.hidden),
    'destroyed accordion trigger must not toggle panel',
  );

  await page.locator('#life-tab-a').click();
  ok(
    await page.locator('#life-panel-a').evaluate((el) => el.hidden),
    'destroyed tabs must not switch panels',
  );

  await page.locator('#tip-trigger').hover();
  await page.waitForTimeout(150);
  ok(
    await page.locator('#life-tip').evaluate((el) => el.hasAttribute('hidden')),
    'destroyed tooltip must not show on hover',
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
  );
  await page.keyboard.press('Escape');

  await page.locator('#menu-trigger').click();
  ok(
    await page.locator('#life-menu').evaluate((el) => el.dataset.open === 'true'),
    're-init must restore action menu',
  );
  await page.keyboard.press('Escape');

  await page.locator('#combo-input').fill('');
  await page.locator('#combo-input').click();
  await page.locator('#combo-list .ds-combobox__option', { hasText: 'Alpha' }).click();
  ok(
    (await page.locator('#combo-input').inputValue()) === 'Alpha',
    're-init must restore combobox selection',
  );

  await page.locator('#acc-trigger-a').click();
  ok(
    await page.locator('#acc-panel-a').evaluate((el) => !el.hidden),
    're-init must restore accordion toggle',
  );

  await page.locator('#life-tab-a').click();
  ok(
    await page.locator('#life-panel-a').evaluate((el) => !el.hidden),
    're-init must restore tabs selection',
  );

  await page.locator('#tip-trigger').hover();
  await page.waitForTimeout(150);
  ok(
    await page.locator('#life-tip').evaluate((el) => !el.hasAttribute('hidden')),
    're-init must restore tooltip hover',
  );

  console.log(`Checks: ${checks}`);
} catch (error) {
  errors.push(error.stack || String(error));
} finally {
  if (browser) await browser.close().catch(() => {});
  if (server) server.kill('SIGTERM');
}

if (errors.length === 0) {
  console.log('✅ PASS — runtime lifecycle (init/destroy/re-init)');
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}\n`);
process.exit(1);
