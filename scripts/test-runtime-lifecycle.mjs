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
  ok(
    markers.accordionInit,
    'initAccordions(document) must mark accordion',
    evidence('accordion', 'root-init', 'init-document'),
  );
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

  // --- Accordion: root init, hydration e idempotência ---
  const accordionSetup = await page.evaluate(() => {
    const { initAccordions } = window.__dsLifecycle;
    const markup = (prefix) => `
      <div class="ds-accordion" id="${prefix}">
        <div class="ds-accordion__item" data-state="closed">
          <button class="ds-accordion__trigger" type="button" id="${prefix}-trigger" aria-expanded="false" aria-controls="${prefix}-panel">
            <span class="ds-accordion__title">${prefix}</span>
          </button>
          <div class="ds-accordion__panel" id="${prefix}-panel" role="region" aria-labelledby="${prefix}-trigger" hidden>Conteúdo</div>
        </div>
      </div>`;

    const proofHost = document.createElement('section');
    proofHost.id = 'accordion-proof-host';
    document.body.append(proofHost);

    const containerHost = document.createElement('div');
    containerHost.id = 'accordion-container-host';
    containerHost.innerHTML = markup('accordion-container-root');
    proofHost.append(containerHost);
    const containerCreated = initAccordions(containerHost).length;

    const componentTemplate = document.createElement('template');
    componentTemplate.innerHTML = markup('accordion-component-root').trim();
    const componentRoot = componentTemplate.content.firstElementChild;
    proofHost.append(componentRoot);
    const componentCreated = initAccordions(componentRoot).length;

    const incomplete = document.createElement('div');
    incomplete.className = 'ds-accordion';
    incomplete.id = 'accordion-incomplete-root';
    proofHost.append(incomplete);
    const incompleteFirstCreated = initAccordions(incomplete).length;
    const incompletePoisoned = incomplete.dataset.dsAccordionInit === 'true';
    incomplete.innerHTML = markup('accordion-incomplete-inner')
      .replace('<div class="ds-accordion" id="accordion-incomplete-inner">', '')
      .replace(/<\/div>\s*$/, '');
    const incompleteRecovered = initAccordions(incomplete).length;

    const lateHost = document.createElement('div');
    lateHost.id = 'accordion-late-host';
    proofHost.append(lateHost);
    const lateBefore = initAccordions(lateHost).length;
    lateHost.innerHTML = markup('accordion-late-root');
    const lateAfter = initAccordions(lateHost).length;

    const secondInitCreated = initAccordions(componentRoot).length;
    let duplicateEventCount = 0;
    componentRoot.addEventListener('ds-accordion-open', () => { duplicateEventCount += 1; });
    componentRoot.querySelector('.ds-accordion__trigger').click();

    const scopedHost = document.createElement('div');
    scopedHost.innerHTML = `${markup('accordion-scope-a')}${markup('accordion-scope-b')}`;
    proofHost.append(scopedHost);
    const scopedCreated = initAccordions(scopedHost).length;

    return {
      containerCreated,
      containerMarked: containerHost.querySelector('.ds-accordion').dataset.dsAccordionInit === 'true',
      componentCreated,
      componentMarked: componentRoot.dataset.dsAccordionInit === 'true',
      incompleteFirstCreated,
      incompletePoisoned,
      incompleteRecovered,
      incompleteMarked: incomplete.dataset.dsAccordionInit === 'true',
      lateBefore,
      lateAfter,
      lateMarked: lateHost.querySelector('.ds-accordion').dataset.dsAccordionInit === 'true',
      secondInitCreated,
      duplicateEventCount,
      scopedCreated,
    };
  });

  ok(
    accordionSetup.containerCreated === 1 && accordionSetup.containerMarked,
    'initAccordions(container) must initialize a descendant Accordion exactly once',
    evidence('accordion', 'root-init', 'init-container'),
  );
  ok(
    accordionSetup.componentCreated === 1 && accordionSetup.componentMarked,
    'initAccordions(componentRoot) must initialize the root itself',
    evidence('accordion', 'root-init', 'init-component-root'),
  );
  ok(
    accordionSetup.incompleteFirstCreated === 0
      && !accordionSetup.incompletePoisoned
      && accordionSetup.incompleteRecovered === 1
      && accordionSetup.incompleteMarked,
    'incomplete Accordion markup must remain recoverable after its anatomy arrives',
    evidence('accordion', 'late-hydration', 'incomplete-markup-recoverable'),
  );
  ok(
    accordionSetup.lateBefore === 0 && accordionSetup.lateAfter === 1 && accordionSetup.lateMarked,
    'a late Accordion subtree must initialize when its container is scanned again',
    evidence('accordion', 'late-hydration', 'late-subtree-init'),
  );
  ok(
    accordionSetup.secondInitCreated === 0,
    'double init must create zero additional Accordion instances',
    evidence('accordion', 'idempotent-init', 'double-init-zero-new-instance'),
  );
  ok(
    accordionSetup.duplicateEventCount === 1,
    `double init must not duplicate Accordion events (got ${accordionSetup.duplicateEventCount})`,
    evidence('accordion', 'idempotent-init', 'double-init-no-duplicate-event'),
  );
  ok(accordionSetup.scopedCreated === 2, 'scoped destroy fixture must initialize two Accordions');

  // --- Accordion: teclado, foco, ARIA e evento público ---
  await page.evaluate(() => {
    for (const trigger of document.querySelectorAll('#life-accordion .ds-accordion__trigger')) {
      trigger.setAttribute('aria-expanded', 'false');
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) panel.hidden = true;
      trigger.closest('.ds-accordion__item')?.setAttribute('data-state', 'closed');
    }
    window.__dsLifecycle.clearEvents();
  });

  await page.locator('#acc-trigger-a').focus();
  await page.keyboard.press('Enter');
  const accordionOpenedByEnter = await page.locator('#acc-panel-a').evaluate((el) => !el.hidden);
  await page.keyboard.press('Space');
  const accordionClosedBySpace = await page.locator('#acc-panel-a').evaluate((el) => el.hidden);
  ok(
    accordionOpenedByEnter && accordionClosedBySpace,
    'Accordion trigger must toggle with Enter and Space',
    evidence('accordion', 'keyboard', 'enter-space-toggle'),
  );

  await page.locator('#acc-trigger-a').focus();
  await page.keyboard.press('ArrowDown');
  const arrowDownTarget = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('Home');
  const homeTarget = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('End');
  const endTarget = await page.evaluate(() => document.activeElement?.id);
  ok(
    arrowDownTarget === 'acc-trigger-b'
      && homeTarget === 'acc-trigger-a'
      && endTarget === 'acc-trigger-disabled',
    `Accordion arrows/Home/End must move focus (got ${arrowDownTarget}, ${homeTarget}, ${endTarget})`,
    evidence('accordion', 'keyboard', 'arrows-home-end-focus'),
  );

  await page.keyboard.press('ArrowDown');
  const wrappedForward = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('ArrowUp');
  const wrappedBackward = await page.evaluate(() => document.activeElement?.id);
  ok(
    wrappedForward === 'acc-trigger-a' && wrappedBackward === 'acc-trigger-disabled',
    `Accordion arrow focus must wrap in both directions (got ${wrappedForward}, ${wrappedBackward})`,
    evidence('accordion', 'focus', 'roving-focus-wrap'),
  );

  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  ok(
    await page.locator('#acc-panel-disabled').evaluate((el) => el.hidden),
    'aria-disabled Accordion trigger must not toggle by keyboard',
    evidence('accordion', 'keyboard', 'disabled-no-toggle'),
  );

  await page.locator('#acc-trigger-a').click();
  await page.locator('#acc-trigger-b').click();
  const accordionAria = await page.evaluate(() => {
    const aTrigger = document.getElementById('acc-trigger-a');
    const bTrigger = document.getElementById('acc-trigger-b');
    return {
      aExpanded: aTrigger.getAttribute('aria-expanded'),
      aHidden: document.getElementById('acc-panel-a').hidden,
      aState: aTrigger.closest('.ds-accordion__item').dataset.state,
      bExpanded: bTrigger.getAttribute('aria-expanded'),
      bHidden: document.getElementById('acc-panel-b').hidden,
      bState: bTrigger.closest('.ds-accordion__item').dataset.state,
    };
  });
  ok(
    accordionAria.aExpanded === 'false'
      && accordionAria.aHidden
      && accordionAria.aState === 'closed'
      && accordionAria.bExpanded === 'true'
      && !accordionAria.bHidden
      && accordionAria.bState === 'open',
    'Accordion must synchronize aria-expanded, hidden and data-state',
    evidence('accordion', 'aria', 'expanded-hidden-data-state-sync'),
  );
  ok(
    accordionAria.aHidden && !accordionAria.bHidden,
    'single-mode Accordion must leave only the latest item open',
    evidence('accordion', 'aria', 'single-mode-sync'),
  );

  const accordionEvent = await page.evaluate(() => new Promise((resolve) => {
    document.addEventListener('ds-accordion-open', (event) => {
      resolve({
        bubbles: event.bubbles,
        target: event.target?.id,
        trigger: event.detail?.trigger?.id,
        itemContainsTrigger: event.detail?.item?.contains(event.detail?.trigger),
        panel: event.detail?.panel?.id,
      });
    }, { once: true });
    document.getElementById('acc-trigger-a').click();
  }));
  ok(
    accordionEvent.bubbles
      && accordionEvent.target === 'life-accordion'
      && accordionEvent.trigger === 'acc-trigger-a'
      && accordionEvent.itemContainsTrigger
      && accordionEvent.panel === 'acc-panel-a',
    `Accordion event must bubble from its root with stable detail (${JSON.stringify(accordionEvent)})`,
    evidence('accordion', 'events', 'public-event-bubbling-target-detail'),
  );

  // --- Accordion: destroy escopado/idempotente e re-init sem duplicação ---
  const accordionCleanup = await page.evaluate(() => {
    const { initAccordions, destroyAccordions } = window.__dsLifecycle;
    const scopeA = document.getElementById('accordion-scope-a');
    const scopeB = document.getElementById('accordion-scope-b');
    destroyAccordions(scopeA);
    destroyAccordions(scopeA);
    scopeA.querySelector('.ds-accordion__trigger').click();
    scopeB.querySelector('.ds-accordion__trigger').click();

    const reinitRoot = document.getElementById('accordion-component-root');
    const reinitTrigger = reinitRoot.querySelector('.ds-accordion__trigger');
    const reinitPanel = reinitRoot.querySelector('.ds-accordion__panel');
    destroyAccordions(reinitRoot);
    destroyAccordions(reinitRoot);
    reinitTrigger.setAttribute('aria-expanded', 'false');
    reinitPanel.hidden = true;
    reinitTrigger.closest('.ds-accordion__item').dataset.state = 'closed';
    const reinitCreated = initAccordions(reinitRoot).length;
    let reinitEvents = 0;
    reinitRoot.addEventListener('ds-accordion-open', () => { reinitEvents += 1; });
    reinitTrigger.click();

    return {
      scopeADead: scopeA.querySelector('.ds-accordion__panel').hidden
        && scopeA.dataset.dsAccordionInit !== 'true',
      scopeBAlive: !scopeB.querySelector('.ds-accordion__panel').hidden
        && scopeB.dataset.dsAccordionInit === 'true',
      reinitCreated,
      reinitOpened: !reinitPanel.hidden,
      reinitEvents,
      reinitMarked: reinitRoot.dataset.dsAccordionInit === 'true',
    };
  });
  ok(
    accordionCleanup.scopeADead && accordionCleanup.scopeBAlive,
    'destroyAccordions(root) must destroy only the scoped Accordion',
    evidence('accordion', 'destroy', 'scoped-destroy'),
  );
  ok(
    accordionCleanup.scopeADead,
    'destroyAccordions(root) must be safe when called twice',
    evidence('accordion', 'destroy', 'double-destroy'),
  );
  ok(
    accordionCleanup.reinitCreated === 1
      && accordionCleanup.reinitOpened
      && accordionCleanup.reinitMarked
      && accordionCleanup.reinitEvents === 1,
    `Accordion re-init must restore one listener/event (got ${JSON.stringify(accordionCleanup)})`,
    evidence('accordion', 'reinit', 'reinit-single-event'),
  );

  await page.evaluate(() => {
    for (const trigger of document.querySelectorAll('#life-accordion .ds-accordion__trigger')) {
      trigger.setAttribute('aria-expanded', 'false');
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) panel.hidden = true;
      trigger.closest('.ds-accordion__item')?.setAttribute('data-state', 'closed');
    }
    window.__dsLifecycle.clearEvents();
  });

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
