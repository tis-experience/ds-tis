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
  ok(
    markers.modalInit && markers.modalTrigger,
    'initModals(document) must mark overlay and trigger',
    evidence('modal', 'root-init', 'init-document'),
  );
  ok(
    markers.menuInit,
    'initActionMenus(document) must mark action menu',
    evidence('menu', 'root-init', 'init-document'),
  );
  ok(
    markers.comboInit,
    'initComboboxes(document) must mark combobox anchor',
    evidence('combobox', 'root-init', 'init-document'),
  );
  ok(
    markers.accordionInit,
    'initAccordions(document) must mark accordion',
    evidence('accordion', 'root-init', 'init-document'),
  );
  ok(
    markers.tabsInit,
    'initTabs(document) must mark tablist',
    evidence('tabs', 'root-init', 'init-document'),
  );
  ok(
    markers.tooltipInit,
    'initTooltips(document) must mark tooltip',
    evidence('tooltip', 'root-init', 'init-document'),
  );
  ok(
    markers.popoverInit,
    'initPopovers(document) must mark popover',
    evidence('popover', 'root-init', 'init-document'),
  );
  ok(
    markers.toastInit,
    'initToasts(document) must mark the Toast region',
    evidence('toast', 'root-init', 'init-document'),
  );

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

  // --- Popover open/close ---
  await page.locator('#popover-trigger').click();
  ok(
    await page.locator('#life-popover-panel').evaluate((el) => !el.hidden),
    'popover must open after init',
    evidence('popover', 'open-close', 'trigger-opens'),
  );
  await page.keyboard.press('Escape');
  ok(
    await page.locator('#life-popover-panel').evaluate((el) => el.hidden),
    'popover must close on Escape',
    [
      evidence('popover', 'keyboard', 'escape-closes'),
      evidence('popover', 'open-close', 'trigger-opens'),
    ],
  );

  // --- Toast show/dismiss ---
  const toastInitial = await page.evaluate(() => {
    const id = window.__dsLifecycle.showToast({
      id: 'life-toast-initial',
      type: 'success',
      title: 'Salvo',
      duration: 0,
    });
    const toast = document.querySelector(`[data-toast-id="${id}"]`);
    const shown = Boolean(toast);
    const dismissed = window.__dsLifecycle.dismissToast(id);
    return { shown, dismissed, removed: !toast?.isConnected };
  });
  ok(
    toastInitial.shown && toastInitial.dismissed && toastInitial.removed,
    `Toast public API must show and dismiss a notification (${JSON.stringify(toastInitial)})`,
    evidence('toast', 'open-close', 'api-show-dismiss'),
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
    'ds-popover-open': 1,
    'ds-popover-close': 1,
    'ds-toast-show': 1,
    'ds-toast-dismiss': 1,
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
    popover: ['ds-popover-open', 'ds-popover-close'],
    toast: ['ds-toast-show', 'ds-toast-dismiss'],
  };
  for (const [slug, eventNames] of Object.entries(eventExpectationsBySlug)) {
    ok(
      eventNames.every((eventName) => eventCount(eventName) === expectedEventCounts[eventName]),
      `${slug} public event counts must match the exercised transitions`,
      evidence(slug, 'events', 'public-event-count'),
    );
  }

  // --- Modal: root init, hydration e idempotência ---
  const modalSetup = await page.evaluate(() => {
    const { initModals, openModal, closeModal } = window.__dsLifecycle;
    const dialogMarkup = (prefix) => `
      <div class="ds-modal ds-modal--sm" role="dialog" aria-modal="true" aria-labelledby="${prefix}-title">
        <div class="ds-modal__header">
          <h3 id="${prefix}-title" class="ds-modal__title">${prefix}</h3>
          <button class="ds-modal__close" type="button" aria-label="Fechar">×</button>
        </div>
        <div class="ds-modal__body"><button type="button">Ação</button></div>
      </div>`;
    const overlayMarkup = (prefix) => `
      <div class="ds-modal-overlay" id="${prefix}" hidden>${dialogMarkup(prefix)}</div>`;
    const fixtureMarkup = (prefix) => `
      <button type="button" id="${prefix}-trigger" data-ds-modal-open="${prefix}">Abrir</button>
      ${overlayMarkup(prefix)}`;

    const proofHost = document.createElement('section');
    proofHost.id = 'modal-proof-host';
    document.body.append(proofHost);

    const containerHost = document.createElement('div');
    containerHost.id = 'modal-container-host';
    containerHost.innerHTML = fixtureMarkup('modal-container-root');
    proofHost.append(containerHost);
    const containerCreated = initModals(containerHost).length;

    const componentTemplate = document.createElement('template');
    componentTemplate.innerHTML = overlayMarkup('modal-component-root').trim();
    const componentRoot = componentTemplate.content.firstElementChild;
    proofHost.append(componentRoot);
    const componentCreated = initModals(componentRoot).length;

    const incomplete = document.createElement('div');
    incomplete.className = 'ds-modal-overlay';
    incomplete.id = 'modal-incomplete-root';
    incomplete.hidden = true;
    proofHost.append(incomplete);
    const incompleteFirstCreated = initModals(incomplete).length;
    const incompletePoisoned = incomplete.dataset.dsModalInit === 'true';
    incomplete.innerHTML = dialogMarkup('modal-incomplete-root');
    const incompleteRecovered = initModals(incomplete).length;

    const lateHost = document.createElement('div');
    lateHost.id = 'modal-late-host';
    proofHost.append(lateHost);
    const lateBefore = initModals(lateHost).length;
    lateHost.innerHTML = overlayMarkup('modal-late-root');
    const lateAfter = initModals(lateHost).length;

    const secondInitCreated = initModals(containerHost).length;
    let duplicateEventCount = 0;
    const containerOverlay = containerHost.querySelector('.ds-modal-overlay');
    containerOverlay.addEventListener('ds-modal-open', () => { duplicateEventCount += 1; });
    containerHost.querySelector('[data-ds-modal-open]').click();
    closeModal(containerOverlay);

    const scopedHost = document.createElement('div');
    scopedHost.innerHTML = `${overlayMarkup('modal-scope-a')}${overlayMarkup('modal-scope-b')}`;
    proofHost.append(scopedHost);
    const scopedCreated = initModals(scopedHost).length;

    openModal(componentRoot);
    closeModal(componentRoot);

    return {
      containerCreated,
      containerMarked: containerOverlay.dataset.dsModalInit === 'true',
      containerTriggerMarked: containerHost.querySelector('[data-ds-modal-open]').dataset.dsModalTriggerInit === 'true',
      componentCreated,
      componentMarked: componentRoot.dataset.dsModalInit === 'true',
      incompleteFirstCreated,
      incompletePoisoned,
      incompleteRecovered,
      incompleteMarked: incomplete.dataset.dsModalInit === 'true',
      lateBefore,
      lateAfter,
      lateMarked: lateHost.querySelector('.ds-modal-overlay').dataset.dsModalInit === 'true',
      secondInitCreated,
      duplicateEventCount,
      scopedCreated,
    };
  });

  ok(
    modalSetup.containerCreated === 1
      && modalSetup.containerMarked
      && modalSetup.containerTriggerMarked,
    'initModals(container) must initialize a descendant Modal and its trigger exactly once',
    evidence('modal', 'root-init', 'init-container'),
  );
  ok(
    modalSetup.componentCreated === 1 && modalSetup.componentMarked,
    'initModals(componentRoot) must initialize the overlay root itself',
    evidence('modal', 'root-init', 'init-component-root'),
  );
  ok(
    modalSetup.incompleteFirstCreated === 0
      && !modalSetup.incompletePoisoned
      && modalSetup.incompleteRecovered === 1
      && modalSetup.incompleteMarked,
    'incomplete Modal markup must remain recoverable after its dialog arrives',
    evidence('modal', 'late-hydration', 'incomplete-markup-recoverable'),
  );
  ok(
    modalSetup.lateBefore === 0 && modalSetup.lateAfter === 1 && modalSetup.lateMarked,
    'a late Modal subtree must initialize when its container is scanned again',
    evidence('modal', 'late-hydration', 'late-subtree-init'),
  );
  ok(
    modalSetup.secondInitCreated === 0,
    'double init must create zero additional Modal instances',
    evidence('modal', 'idempotent-init', 'double-init-zero-new-instance'),
  );
  ok(
    modalSetup.duplicateEventCount === 1,
    `double init must not duplicate Modal events (got ${modalSetup.duplicateEventCount})`,
    evidence('modal', 'idempotent-init', 'double-init-no-duplicate-event'),
  );
  ok(modalSetup.scopedCreated === 2, 'scoped destroy fixture must initialize two Modals');

  // --- Modal: foco, teclado, ARIA, inert e abertura/fechamento ---
  await page.locator('#open-modal').focus();
  await page.locator('#open-modal').click();
  const modalInitial = await page.evaluate(() => {
    const overlay = document.getElementById('life-modal');
    const dialog = overlay.querySelector('.ds-modal');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    return {
      focusId: document.activeElement?.id,
      role: dialog.getAttribute('role'),
      ariaModal: dialog.getAttribute('aria-modal'),
      labelledBy,
      labelExists: Boolean(labelledBy && document.getElementById(labelledBy)),
    };
  });
  ok(
    modalInitial.focusId === 'modal-close',
    `Modal must move initial focus inside the dialog (got ${modalInitial.focusId})`,
    evidence('modal', 'focus', 'initial-focus'),
  );
  ok(
    modalInitial.role === 'dialog'
      && modalInitial.ariaModal === 'true'
      && modalInitial.labelExists,
    `Modal dialog must be modal and labelled (${JSON.stringify(modalInitial)})`,
    evidence('modal', 'aria', 'dialog-modal-labelled'),
  );

  await page.locator('#modal-primary').focus();
  await page.keyboard.press('Tab');
  const modalWrappedForward = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('Shift+Tab');
  const modalWrappedBackward = await page.evaluate(() => document.activeElement?.id);
  ok(
    modalWrappedForward === 'modal-close' && modalWrappedBackward === 'modal-primary',
    `Modal Tab/Shift+Tab must wrap focus (${modalWrappedForward}, ${modalWrappedBackward})`,
    [
      evidence('modal', 'keyboard', 'tab-shift-tab-wrap'),
      evidence('modal', 'focus', 'focus-trap'),
    ],
  );

  await page.keyboard.press('Escape');
  ok(
    (await page.evaluate(() => document.activeElement?.id)) === 'open-modal',
    'Modal must return focus to its trigger after Escape closes it',
    evidence('modal', 'focus', 'focus-return'),
  );

  await page.locator('#open-modal').click();
  await page.locator('#life-modal').evaluate((overlay) => {
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  ok(
    await page.locator('#life-modal').evaluate((overlay) => overlay.hidden),
    'clicking the Modal backdrop must close it',
    evidence('modal', 'open-close', 'backdrop-closes'),
  );

  const inlineModal = await page.evaluate(() => {
    const { initModals, openModal, closeModal } = window.__dsLifecycle;
    const app = document.createElement('section');
    app.id = 'modal-inline-app';
    app.innerHTML = `
      <button type="button" id="modal-inline-background">Conteúdo do app</button>
      <div class="ds-modal-overlay" id="modal-inline-overlay" hidden>
        <div class="ds-modal" role="dialog" aria-modal="true" aria-labelledby="modal-inline-title">
          <h3 id="modal-inline-title">Inline</h3>
          <button class="ds-modal__close" type="button">Fechar</button>
        </div>
      </div>`;
    document.body.append(app);
    initModals(app);
    const background = app.querySelector('#modal-inline-background');
    const overlay = app.querySelector('#modal-inline-overlay');
    background.focus();
    openModal(overlay);
    const opened = {
      appInert: app.inert,
      backgroundInert: background.inert,
      overlayInert: overlay.inert,
      focusInside: overlay.contains(document.activeElement),
    };
    closeModal(overlay);
    return {
      ...opened,
      backgroundRestored: !background.inert,
      focusReturned: document.activeElement === background,
    };
  });
  ok(
    !inlineModal.appInert
      && inlineModal.backgroundInert
      && !inlineModal.overlayInert
      && inlineModal.focusInside
      && inlineModal.backgroundRestored
      && inlineModal.focusReturned,
    `inline Modal must not inert its own app ancestor (${JSON.stringify(inlineModal)})`,
    evidence('modal', 'open-close', 'inline-app-not-inert'),
  );

  const inertRestoration = await page.evaluate(() => {
    const { openModal, closeModal } = window.__dsLifecycle;
    const preserved = document.createElement('section');
    preserved.id = 'modal-preexisting-inert';
    preserved.inert = true;
    preserved.dataset.dsModalInert = 'preserved';
    document.body.append(preserved);
    const overlay = document.getElementById('life-modal');
    document.getElementById('open-modal').focus();
    openModal(overlay);
    const during = {
      inert: preserved.inert,
      marker: preserved.dataset.dsModalInert,
    };
    closeModal(overlay);
    return {
      during,
      restoredInert: preserved.inert,
      restoredMarker: preserved.dataset.dsModalInert,
    };
  });
  ok(
    inertRestoration.during.inert
      && inertRestoration.during.marker === 'true'
      && inertRestoration.restoredInert
      && inertRestoration.restoredMarker === 'preserved',
    `Modal must restore pre-existing inert state (${JSON.stringify(inertRestoration)})`,
  );

  const modalEvents = await page.evaluate(() => new Promise((resolve) => {
    const result = {};
    document.addEventListener('ds-modal-open', (event) => {
      result.open = {
        bubbles: event.bubbles,
        target: event.target?.id,
        overlay: event.detail?.overlay?.id,
        dialogContainsTarget: event.detail?.dialog?.contains(document.activeElement),
        trigger: event.detail?.trigger?.id,
      };
      document.getElementById('modal-close').click();
    }, { once: true });
    document.addEventListener('ds-modal-close', (event) => {
      result.close = {
        bubbles: event.bubbles,
        target: event.target?.id,
        overlay: event.detail?.overlay?.id,
        returnFocus: event.detail?.returnFocus?.id,
      };
      resolve(result);
    }, { once: true });
    document.getElementById('open-modal').focus();
    document.getElementById('open-modal').click();
  }));
  ok(
    modalEvents.open?.bubbles
      && modalEvents.open.target === 'life-modal'
      && modalEvents.open.overlay === 'life-modal'
      && modalEvents.open.dialogContainsTarget
      && modalEvents.open.trigger === 'open-modal'
      && modalEvents.close?.bubbles
      && modalEvents.close.target === 'life-modal'
      && modalEvents.close.overlay === 'life-modal'
      && modalEvents.close.returnFocus === 'open-modal',
    `Modal events must bubble from overlay with stable detail (${JSON.stringify(modalEvents)})`,
    evidence('modal', 'events', 'public-event-bubbling-target-detail'),
  );

  // --- Modal: destroy escopado/idempotente e re-init sem duplicação ---
  const modalCleanup = await page.evaluate(() => {
    const { initModals, destroyModals, openModal, closeModal } = window.__dsLifecycle;
    const scopeA = document.getElementById('modal-scope-a');
    const scopeB = document.getElementById('modal-scope-b');
    destroyModals(scopeA);
    destroyModals(scopeA);
    openModal(scopeA);
    openModal(scopeB);
    const scopeADead = scopeA.hidden && scopeA.dataset.dsModalInit !== 'true';
    const scopeBAlive = !scopeB.hidden && scopeB.dataset.dsModalInit === 'true';
    closeModal(scopeB);

    const reinitRoot = document.getElementById('modal-component-root');
    destroyModals(reinitRoot);
    destroyModals(reinitRoot);
    const reinitCreated = initModals(reinitRoot).length;
    let reinitEvents = 0;
    reinitRoot.addEventListener('ds-modal-open', () => { reinitEvents += 1; });
    openModal(reinitRoot);
    const reinitOpened = !reinitRoot.hidden;
    closeModal(reinitRoot);

    return {
      scopeADead,
      scopeBAlive,
      reinitCreated,
      reinitOpened,
      reinitEvents,
      reinitMarked: reinitRoot.dataset.dsModalInit === 'true',
    };
  });
  ok(
    modalCleanup.scopeADead && modalCleanup.scopeBAlive,
    'destroyModals(root) must destroy only the scoped Modal',
    evidence('modal', 'destroy', 'scoped-destroy'),
  );
  ok(
    modalCleanup.scopeADead,
    'destroyModals(root) must be safe when called twice',
    evidence('modal', 'destroy', 'double-destroy'),
  );
  ok(
    modalCleanup.reinitCreated === 1
      && modalCleanup.reinitOpened
      && modalCleanup.reinitEvents === 1
      && modalCleanup.reinitMarked,
    `Modal re-init must restore one listener/event (${JSON.stringify(modalCleanup)})`,
    evidence('modal', 'reinit', 'reinit-single-event'),
  );

  // --- Action Menu: root init, hydration e idempotência ---
  const menuSetup = await page.evaluate(() => {
    const { initActionMenus, closeActionMenu } = window.__dsLifecycle;
    const markup = (prefix) => `
      <div class="ds-action-menu" id="${prefix}">
        <button type="button" class="ds-action-menu__trigger" id="${prefix}-trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="${prefix}-list">Ações</button>
        <div class="ds-menu ds-action-menu__content" id="${prefix}-list" role="menu">
          <button type="button" class="ds-menu__item" role="menuitem">Editar</button>
          <button type="button" class="ds-menu__item" role="menuitemradio" aria-checked="false">Confortável</button>
          <button type="button" class="ds-menu__item" role="menuitemcheckbox" aria-checked="false">Fixar</button>
          <button type="button" class="ds-menu__item" role="menuitem" aria-disabled="true">Admin</button>
        </div>
      </div>`;

    const proofHost = document.createElement('section');
    proofHost.id = 'menu-proof-host';
    document.body.append(proofHost);

    const containerHost = document.createElement('div');
    containerHost.id = 'menu-container-host';
    containerHost.innerHTML = markup('menu-container-root');
    proofHost.append(containerHost);
    const containerCreated = initActionMenus(containerHost).length;

    const componentTemplate = document.createElement('template');
    componentTemplate.innerHTML = markup('menu-component-root').trim();
    const componentRoot = componentTemplate.content.firstElementChild;
    proofHost.append(componentRoot);
    const componentCreated = initActionMenus(componentRoot).length;

    const incomplete = document.createElement('div');
    incomplete.className = 'ds-action-menu';
    incomplete.id = 'menu-incomplete-root';
    proofHost.append(incomplete);
    const incompleteFirstCreated = initActionMenus(incomplete).length;
    const incompletePoisoned = incomplete.dataset.dsActionMenuInit === 'true';
    incomplete.innerHTML = markup('menu-incomplete-inner')
      .replace('<div class="ds-action-menu" id="menu-incomplete-inner">', '')
      .replace(/<\/div>\s*$/, '');
    const incompleteRecovered = initActionMenus(incomplete).length;

    const lateHost = document.createElement('div');
    lateHost.id = 'menu-late-host';
    proofHost.append(lateHost);
    const lateBefore = initActionMenus(lateHost).length;
    lateHost.innerHTML = markup('menu-late-root');
    const lateAfter = initActionMenus(lateHost).length;

    const secondInitCreated = initActionMenus(componentRoot).length;
    let duplicateEventCount = 0;
    componentRoot.addEventListener('ds-menu-open', () => { duplicateEventCount += 1; });
    componentRoot.querySelector('.ds-action-menu__trigger').click();
    closeActionMenu(componentRoot);

    const scopedHost = document.createElement('div');
    scopedHost.innerHTML = `${markup('menu-scope-a')}${markup('menu-scope-b')}`;
    proofHost.append(scopedHost);
    const scopedCreated = initActionMenus(scopedHost).length;

    return {
      containerCreated,
      containerMarked: containerHost.querySelector('.ds-action-menu').dataset.dsActionMenuInit === 'true',
      componentCreated,
      componentMarked: componentRoot.dataset.dsActionMenuInit === 'true',
      incompleteFirstCreated,
      incompletePoisoned,
      incompleteRecovered,
      incompleteMarked: incomplete.dataset.dsActionMenuInit === 'true',
      lateBefore,
      lateAfter,
      lateMarked: lateHost.querySelector('.ds-action-menu').dataset.dsActionMenuInit === 'true',
      secondInitCreated,
      duplicateEventCount,
      scopedCreated,
    };
  });

  ok(
    menuSetup.containerCreated === 1 && menuSetup.containerMarked,
    'initActionMenus(container) must initialize a descendant Action Menu exactly once',
    evidence('menu', 'root-init', 'init-container'),
  );
  ok(
    menuSetup.componentCreated === 1 && menuSetup.componentMarked,
    'initActionMenus(componentRoot) must initialize the root itself',
    evidence('menu', 'root-init', 'init-component-root'),
  );
  ok(
    menuSetup.incompleteFirstCreated === 0
      && !menuSetup.incompletePoisoned
      && menuSetup.incompleteRecovered === 1
      && menuSetup.incompleteMarked,
    'incomplete Action Menu markup must remain recoverable after its anatomy arrives',
    evidence('menu', 'late-hydration', 'incomplete-markup-recoverable'),
  );
  ok(
    menuSetup.lateBefore === 0 && menuSetup.lateAfter === 1 && menuSetup.lateMarked,
    'a late Action Menu subtree must initialize when its container is scanned again',
    evidence('menu', 'late-hydration', 'late-subtree-init'),
  );
  ok(
    menuSetup.secondInitCreated === 0,
    'double init must create zero additional Action Menu instances',
    evidence('menu', 'idempotent-init', 'double-init-zero-new-instance'),
  );
  ok(
    menuSetup.duplicateEventCount === 1,
    `double init must not duplicate Action Menu events (got ${menuSetup.duplicateEventCount})`,
    evidence('menu', 'idempotent-init', 'double-init-no-duplicate-event'),
  );
  ok(menuSetup.scopedCreated === 2, 'scoped destroy fixture must initialize two Action Menus');

  // --- Action Menu: teclado, foco, roles, disabled e eventos ---
  await page.evaluate(() => {
    window.__dsLifecycle.closeActionMenu(document.getElementById('life-menu'));
  });
  await page.locator('#menu-trigger').click();
  await page.waitForFunction(() => document.activeElement?.id === 'menu-item-edit');
  const firstMenuState = await page.evaluate(() => ({
    focusId: document.activeElement?.id,
    open: document.getElementById('life-menu').dataset.open,
    expanded: document.getElementById('menu-trigger').getAttribute('aria-expanded'),
    activeId: document.querySelector('#life-menu-list [data-active="true"]')?.id,
  }));
  ok(
    firstMenuState.focusId === 'menu-item-edit',
    `Action Menu must focus its first item on open (${JSON.stringify(firstMenuState)})`,
    evidence('menu', 'focus', 'first-item-focus'),
  );

  await page.keyboard.press('ArrowDown');
  const menuArrowTarget = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('End');
  const menuEndTarget = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('Home');
  const menuHomeTarget = await page.evaluate(() => document.activeElement?.id);
  ok(
    menuArrowTarget === 'menu-item-archive'
      && menuEndTarget === 'menu-item-disabled'
      && menuHomeTarget === 'menu-item-edit',
    `Action Menu arrows/Home/End must move focus (${menuArrowTarget}, ${menuEndTarget}, ${menuHomeTarget})`,
    evidence('menu', 'keyboard', 'arrows-home-end'),
  );

  await page.keyboard.press('f');
  const menuTypeaheadTarget = await page.evaluate(() => document.activeElement?.id);
  ok(
    menuTypeaheadTarget === 'menu-item-checkbox',
    `Action Menu typeahead must focus the matching item (got ${menuTypeaheadTarget})`,
    evidence('menu', 'keyboard', 'typeahead'),
  );
  await page.keyboard.press('Escape');
  ok(
    (await page.evaluate(() => document.activeElement?.id)) === 'menu-trigger',
    'Escape must close Action Menu and return focus to the trigger',
    evidence('menu', 'keyboard', 'escape-returns-focus'),
  );

  const menuRoles = await page.evaluate(() => ({
    roles: [...document.querySelectorAll('#life-menu-list .ds-menu__item')]
      .map((item) => item.getAttribute('role')),
    disabled: document.getElementById('menu-item-disabled').getAttribute('aria-disabled'),
  }));
  ok(
    menuRoles.roles.includes('menuitem')
      && menuRoles.roles.includes('menuitemradio')
      && menuRoles.roles.includes('menuitemcheckbox'),
    `Action Menu must support command, radio and checkbox roles (${menuRoles.roles.join(', ')})`,
    evidence('menu', 'aria', 'menuitem-roles-supported'),
  );

  await page.locator('#menu-trigger').click();
  await page.waitForFunction(() => document.activeElement?.id === 'menu-item-edit');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  const disabledMenuState = await page.evaluate(() => ({
    open: document.getElementById('life-menu').dataset.open === 'true',
    focusId: document.activeElement?.id,
    disabled: document.getElementById('menu-item-disabled').getAttribute('aria-disabled'),
  }));
  ok(
    disabledMenuState.open && disabledMenuState.focusId === 'menu-item-disabled',
    `aria-disabled menu item must remain focusable but not activate (${JSON.stringify(disabledMenuState)})`,
    [
      evidence('menu', 'focus', 'disabled-focusable-not-activatable'),
      evidence('menu', 'open-close', 'disabled-item-stays-open'),
    ],
  );
  ok(
    disabledMenuState.disabled === 'true',
    'Action Menu runtime must preserve aria-disabled state',
    evidence('menu', 'aria', 'disabled-state-preserved'),
  );
  await page.keyboard.press('Escape');

  await page.locator('#menu-trigger').click();
  await page.locator('#menu-item-radio').click();
  const radioState = await page.locator('#menu-item-radio').getAttribute('aria-checked');
  await page.locator('#menu-trigger').click();
  await page.locator('#menu-item-checkbox').click();
  const checkboxState = await page.locator('#menu-item-checkbox').getAttribute('aria-checked');
  ok(
    radioState === 'true' && checkboxState === 'true',
    `radio/checkbox menu items must update aria-checked (${radioState}, ${checkboxState})`,
  );

  await page.locator('#menu-trigger').click();
  await page.locator('#menu-item-archive').click();
  ok(
    await page.locator('#life-menu').evaluate((root) => root.dataset.open !== 'true'),
    'enabled Action Menu item must close the menu',
    evidence('menu', 'open-close', 'enabled-item-closes'),
  );

  const menuEvents = await page.evaluate(() => new Promise((resolve) => {
    const result = {};
    document.addEventListener('ds-menu-open', (event) => {
      result.open = {
        bubbles: event.bubbles,
        target: event.target?.id,
        root: event.detail?.root?.id,
        trigger: event.detail?.trigger?.id,
        menu: event.detail?.menu?.id,
        item: event.detail?.item?.id,
      };
      document.getElementById('menu-item-edit').click();
    }, { once: true });
    document.addEventListener('ds-menu-close', (event) => {
      result.close = {
        bubbles: event.bubbles,
        target: event.target?.id,
        root: event.detail?.root?.id,
        trigger: event.detail?.trigger?.id,
        menu: event.detail?.menu?.id,
      };
      resolve(result);
    }, { once: true });
    document.getElementById('menu-trigger').click();
  }));
  ok(
    menuEvents.open?.bubbles
      && menuEvents.open.target === 'life-menu'
      && menuEvents.open.root === 'life-menu'
      && menuEvents.open.trigger === 'menu-trigger'
      && menuEvents.open.menu === 'life-menu-list'
      && menuEvents.open.item === 'menu-item-edit'
      && menuEvents.close?.bubbles
      && menuEvents.close.target === 'life-menu'
      && menuEvents.close.root === 'life-menu'
      && menuEvents.close.trigger === 'menu-trigger'
      && menuEvents.close.menu === 'life-menu-list',
    `Action Menu events must bubble from root with stable detail (${JSON.stringify(menuEvents)})`,
    evidence('menu', 'events', 'public-event-bubbling-target-detail'),
  );

  // --- Action Menu: destroy escopado/idempotente e re-init sem duplicação ---
  const menuCleanup = await page.evaluate(() => {
    const { initActionMenus, destroyActionMenus, openActionMenu, closeActionMenu } = window.__dsLifecycle;
    const scopeA = document.getElementById('menu-scope-a');
    const scopeB = document.getElementById('menu-scope-b');
    destroyActionMenus(scopeA);
    destroyActionMenus(scopeA);
    scopeA.querySelector('.ds-action-menu__trigger').click();
    scopeB.querySelector('.ds-action-menu__trigger').click();
    const scopeADead = scopeA.dataset.open !== 'true'
      && scopeA.dataset.dsActionMenuInit !== 'true';
    const scopeBAlive = scopeB.dataset.open === 'true'
      && scopeB.dataset.dsActionMenuInit === 'true';
    closeActionMenu(scopeB);

    const reinitRoot = document.getElementById('menu-component-root');
    destroyActionMenus(reinitRoot);
    destroyActionMenus(reinitRoot);
    const reinitCreated = initActionMenus(reinitRoot).length;
    let reinitEvents = 0;
    reinitRoot.addEventListener('ds-menu-open', () => { reinitEvents += 1; });
    openActionMenu(reinitRoot);
    const reinitOpened = reinitRoot.dataset.open === 'true';
    closeActionMenu(reinitRoot);

    return {
      scopeADead,
      scopeBAlive,
      reinitCreated,
      reinitOpened,
      reinitEvents,
      reinitMarked: reinitRoot.dataset.dsActionMenuInit === 'true',
    };
  });
  ok(
    menuCleanup.scopeADead && menuCleanup.scopeBAlive,
    'destroyActionMenus(root) must destroy only the scoped Action Menu',
    evidence('menu', 'destroy', 'scoped-destroy'),
  );
  ok(
    menuCleanup.scopeADead,
    'destroyActionMenus(root) must be safe when called twice',
    evidence('menu', 'destroy', 'double-destroy'),
  );
  ok(
    menuCleanup.reinitCreated === 1
      && menuCleanup.reinitOpened
      && menuCleanup.reinitEvents === 1
      && menuCleanup.reinitMarked,
    `Action Menu re-init must restore one listener/event (${JSON.stringify(menuCleanup)})`,
    evidence('menu', 'reinit', 'reinit-single-event'),
  );

  // --- Combobox: root init, hydration e idempotência ---
  const comboboxSetup = await page.evaluate(() => {
    const { initComboboxes } = window.__dsLifecycle;
    const markup = (prefix) => `
      <div class="ds-combobox-anchor" id="${prefix}">
        <div class="ds-combobox ds-combobox--md">
          <input class="ds-combobox__input" id="${prefix}-input" type="text" role="combobox" aria-expanded="false" aria-controls="${prefix}-list" aria-autocomplete="list">
        </div>
        <ul class="ds-combobox__listbox" id="${prefix}-list" role="listbox" hidden>
          <li class="ds-combobox__option" role="option">Alpha</li>
          <li class="ds-combobox__option" role="option">Beta</li>
        </ul>
      </div>`;

    const proofHost = document.createElement('section');
    proofHost.id = 'combobox-proof-host';
    document.body.append(proofHost);

    const containerHost = document.createElement('div');
    containerHost.id = 'combobox-container-host';
    containerHost.innerHTML = markup('combobox-container-root');
    proofHost.append(containerHost);
    const containerCreated = initComboboxes(containerHost).length;

    const componentTemplate = document.createElement('template');
    componentTemplate.innerHTML = markup('combobox-component-root').trim();
    const componentRoot = componentTemplate.content.firstElementChild;
    proofHost.append(componentRoot);
    const componentCreated = initComboboxes(componentRoot).length;

    const incomplete = document.createElement('div');
    incomplete.className = 'ds-combobox-anchor';
    incomplete.id = 'combobox-incomplete-root';
    proofHost.append(incomplete);
    const incompleteFirstCreated = initComboboxes(incomplete).length;
    const incompletePoisoned = incomplete.dataset.dsComboboxInit === 'true';
    incomplete.innerHTML = markup('combobox-incomplete-inner')
      .replace('<div class="ds-combobox-anchor" id="combobox-incomplete-inner">', '')
      .replace(/<\/div>\s*$/, '');
    const incompleteRecovered = initComboboxes(incomplete).length;

    const lateHost = document.createElement('div');
    lateHost.id = 'combobox-late-host';
    proofHost.append(lateHost);
    const lateBefore = initComboboxes(lateHost).length;
    lateHost.innerHTML = markup('combobox-late-root');
    const lateAfter = initComboboxes(lateHost).length;

    const secondInitCreated = initComboboxes(componentRoot).length;
    let duplicateEventCount = 0;
    componentRoot.addEventListener('ds-combobox-change', () => { duplicateEventCount += 1; });
    componentRoot.querySelector('.ds-combobox__input').focus();
    componentRoot.querySelector('.ds-combobox__option').dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
    );

    const scopedHost = document.createElement('div');
    scopedHost.innerHTML = `${markup('combobox-scope-a')}${markup('combobox-scope-b')}`;
    proofHost.append(scopedHost);
    const scopedCreated = initComboboxes(scopedHost).length;

    return {
      containerCreated,
      containerMarked: containerHost.querySelector('.ds-combobox-anchor').dataset.dsComboboxInit === 'true',
      componentCreated,
      componentMarked: componentRoot.dataset.dsComboboxInit === 'true',
      incompleteFirstCreated,
      incompletePoisoned,
      incompleteRecovered,
      incompleteMarked: incomplete.dataset.dsComboboxInit === 'true',
      lateBefore,
      lateAfter,
      lateMarked: lateHost.querySelector('.ds-combobox-anchor').dataset.dsComboboxInit === 'true',
      secondInitCreated,
      duplicateEventCount,
      scopedCreated,
    };
  });

  ok(
    comboboxSetup.containerCreated === 1 && comboboxSetup.containerMarked,
    'initComboboxes(container) must initialize a descendant Combobox exactly once',
    evidence('combobox', 'root-init', 'init-container'),
  );
  ok(
    comboboxSetup.componentCreated === 1 && comboboxSetup.componentMarked,
    'initComboboxes(componentRoot) must initialize the root itself',
    evidence('combobox', 'root-init', 'init-component-root'),
  );
  ok(
    comboboxSetup.incompleteFirstCreated === 0
      && !comboboxSetup.incompletePoisoned
      && comboboxSetup.incompleteRecovered === 1
      && comboboxSetup.incompleteMarked,
    'incomplete Combobox markup must remain recoverable after its anatomy arrives',
    evidence('combobox', 'late-hydration', 'incomplete-markup-recoverable'),
  );
  ok(
    comboboxSetup.lateBefore === 0 && comboboxSetup.lateAfter === 1 && comboboxSetup.lateMarked,
    'a late Combobox subtree must initialize when its container is scanned again',
    evidence('combobox', 'late-hydration', 'late-subtree-init'),
  );
  ok(
    comboboxSetup.secondInitCreated === 0,
    'double init must create zero additional Combobox instances',
    evidence('combobox', 'idempotent-init', 'double-init-zero-new-instance'),
  );
  ok(
    comboboxSetup.duplicateEventCount === 1,
    `double init must not duplicate Combobox events (got ${comboboxSetup.duplicateEventCount})`,
    evidence('combobox', 'idempotent-init', 'double-init-no-duplicate-event'),
  );
  ok(comboboxSetup.scopedCreated === 2, 'scoped destroy fixture must initialize two Comboboxes');

  // --- Combobox: teclado, foco, ARIA e evento público ---
  await page.locator('#combo-input').fill('');
  await page.locator('#combo-input').focus();
  await page.keyboard.press('ArrowDown');
  const firstActive = await page.evaluate(() => {
    const input = document.getElementById('combo-input');
    const activeId = input.getAttribute('aria-activedescendant');
    const active = activeId ? document.getElementById(activeId) : null;
    return {
      activeId,
      activeText: active?.textContent.trim(),
      activeMarked: active?.dataset.active === 'true',
      focusId: document.activeElement?.id,
    };
  });
  await page.keyboard.press('ArrowDown');
  const secondActiveText = await page.evaluate(() => {
    const activeId = document.getElementById('combo-input').getAttribute('aria-activedescendant');
    return activeId ? document.getElementById(activeId)?.textContent.trim() : null;
  });
  ok(
    firstActive.activeText === 'Alpha' && firstActive.activeMarked && secondActiveText === 'Beta',
    `Combobox arrows must move the active option (got ${JSON.stringify({ firstActive, secondActiveText })})`,
    evidence('combobox', 'keyboard', 'arrows-active-option'),
  );
  ok(
    Boolean(firstActive.activeId) && firstActive.activeText === 'Alpha',
    'Combobox aria-activedescendant must reference the active option',
    evidence('combobox', 'aria', 'active-descendant-valid'),
  );
  ok(
    firstActive.focusId === 'combo-input',
    `Combobox DOM focus must remain on the input (got ${firstActive.focusId})`,
    evidence('combobox', 'focus', 'dom-focus-stays-on-input'),
  );

  await page.keyboard.press('Enter');
  const enterSelection = await page.evaluate(() => {
    const input = document.getElementById('combo-input');
    const selected = document.querySelector('#combo-list [aria-selected="true"]');
    return {
      value: input.value,
      expanded: input.getAttribute('aria-expanded'),
      listHidden: document.getElementById('combo-list').hidden,
      selectedText: selected?.textContent.trim(),
      activeDescendant: input.getAttribute('aria-activedescendant'),
    };
  });
  ok(
    enterSelection.value === 'Beta',
    `Enter must select the active Combobox option (got ${enterSelection.value})`,
    evidence('combobox', 'keyboard', 'enter-selects'),
  );
  ok(
    enterSelection.expanded === 'false'
      && enterSelection.listHidden
      && enterSelection.selectedText === 'Beta'
      && enterSelection.activeDescendant === null,
    `Combobox selection must synchronize expanded/selected state (${JSON.stringify(enterSelection)})`,
    [
      evidence('combobox', 'aria', 'expanded-selected-sync'),
      evidence('combobox', 'open-close', 'selection-closes'),
    ],
  );

  await page.locator('#combo-input').fill('');
  await page.locator('#combo-input').focus();
  await page.keyboard.press('Escape');
  const escapeState = await page.evaluate(() => ({
    focusId: document.activeElement?.id,
    expanded: document.getElementById('combo-input').getAttribute('aria-expanded'),
    listHidden: document.getElementById('combo-list').hidden,
  }));
  ok(
    escapeState.focusId === 'combo-input'
      && escapeState.expanded === 'false'
      && escapeState.listHidden,
    `Escape must close Combobox without moving input focus (${JSON.stringify(escapeState)})`,
    evidence('combobox', 'keyboard', 'escape-keeps-input-focus'),
  );

  const comboboxEvent = await page.evaluate(() => new Promise((resolve) => {
    const input = document.getElementById('combo-input');
    input.value = '';
    document.addEventListener('ds-combobox-change', (event) => {
      resolve({
        bubbles: event.bubbles,
        target: event.target?.id,
        input: event.detail?.input?.id,
        root: event.detail?.root?.id,
        option: event.detail?.option?.textContent.trim(),
        value: event.detail?.value,
      });
    }, { once: true });
    input.focus();
    document.querySelector('#combo-list .ds-combobox__option').dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
    );
  }));
  ok(
    comboboxEvent.bubbles
      && comboboxEvent.target === 'combo-input'
      && comboboxEvent.input === 'combo-input'
      && comboboxEvent.root === 'life-combo'
      && comboboxEvent.option === 'Alpha'
      && comboboxEvent.value === 'Alpha',
    `Combobox event must bubble from the input with stable detail (${JSON.stringify(comboboxEvent)})`,
    evidence('combobox', 'events', 'public-event-bubbling-target-detail'),
  );

  // --- Combobox: destroy escopado/idempotente e re-init sem duplicação ---
  const comboboxCleanup = await page.evaluate(() => {
    const { initComboboxes, destroyComboboxes } = window.__dsLifecycle;
    const scopeA = document.getElementById('combobox-scope-a');
    const scopeB = document.getElementById('combobox-scope-b');
    destroyComboboxes(scopeA);
    destroyComboboxes(scopeA);
    scopeA.querySelector('.ds-combobox__input').focus();
    scopeB.querySelector('.ds-combobox__input').focus();
    const scopeADead = scopeA.querySelector('.ds-combobox__listbox').hidden
      && scopeA.dataset.dsComboboxInit !== 'true';
    const scopeBAlive = !scopeB.querySelector('.ds-combobox__listbox').hidden
      && scopeB.dataset.dsComboboxInit === 'true';

    const reinitRoot = document.getElementById('combobox-component-root');
    const reinitInput = reinitRoot.querySelector('.ds-combobox__input');
    const reinitList = reinitRoot.querySelector('.ds-combobox__listbox');
    destroyComboboxes(reinitRoot);
    destroyComboboxes(reinitRoot);
    reinitInput.value = '';
    const reinitCreated = initComboboxes(reinitRoot).length;
    let reinitEvents = 0;
    reinitRoot.addEventListener('ds-combobox-change', () => { reinitEvents += 1; });
    reinitInput.focus();
    reinitList.querySelector('.ds-combobox__option').dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
    );

    return {
      scopeADead,
      scopeBAlive,
      reinitCreated,
      reinitValue: reinitInput.value,
      reinitEvents,
      reinitMarked: reinitRoot.dataset.dsComboboxInit === 'true',
    };
  });
  ok(
    comboboxCleanup.scopeADead && comboboxCleanup.scopeBAlive,
    'destroyComboboxes(root) must destroy only the scoped Combobox',
    evidence('combobox', 'destroy', 'scoped-destroy'),
  );
  ok(
    comboboxCleanup.scopeADead,
    'destroyComboboxes(root) must be safe when called twice',
    evidence('combobox', 'destroy', 'double-destroy'),
  );
  ok(
    comboboxCleanup.reinitCreated === 1
      && comboboxCleanup.reinitValue === 'Alpha'
      && comboboxCleanup.reinitMarked
      && comboboxCleanup.reinitEvents === 1,
    `Combobox re-init must restore one listener/event (${JSON.stringify(comboboxCleanup)})`,
    evidence('combobox', 'reinit', 'reinit-single-event'),
  );

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

  // --- Tabs: root init, hydration e idempotência ---
  const tabsSetup = await page.evaluate(() => {
    const { initTabs } = window.__dsLifecycle;
    const markup = (prefix) => `
      <div class="ds-tabs" id="${prefix}" role="tablist" aria-label="${prefix}">
        <button class="ds-tab ds-tab--active" role="tab" id="${prefix}-tab-a" aria-selected="true" aria-controls="${prefix}-panel-a">A</button>
        <button class="ds-tab" role="tab" id="${prefix}-tab-b" aria-selected="false" aria-controls="${prefix}-panel-b">B</button>
      </div>
      <div class="ds-tab-panel" id="${prefix}-panel-a" role="tabpanel" aria-labelledby="${prefix}-tab-a">A</div>
      <div class="ds-tab-panel" id="${prefix}-panel-b" role="tabpanel" aria-labelledby="${prefix}-tab-b" hidden>B</div>`;

    const proofHost = document.createElement('section');
    proofHost.id = 'tabs-proof-host';
    document.body.append(proofHost);

    const containerHost = document.createElement('div');
    containerHost.innerHTML = markup('tabs-container-root');
    proofHost.append(containerHost);
    const containerCreated = initTabs(containerHost).length;

    const componentHost = document.createElement('div');
    componentHost.innerHTML = markup('tabs-component-root');
    proofHost.append(componentHost);
    const componentRoot = componentHost.querySelector('.ds-tabs');
    const componentCreated = initTabs(componentRoot).length;

    const incomplete = document.createElement('div');
    incomplete.className = 'ds-tabs';
    incomplete.id = 'tabs-incomplete-root';
    incomplete.setAttribute('role', 'tablist');
    proofHost.append(incomplete);
    const incompleteFirstCreated = initTabs(incomplete).length;
    const incompletePoisoned = incomplete.dataset.dsTabsInit === 'true';
    const incompletePanel = document.createElement('div');
    incompletePanel.id = 'tabs-incomplete-panel';
    incompletePanel.setAttribute('role', 'tabpanel');
    incompletePanel.setAttribute('aria-labelledby', 'tabs-incomplete-tab');
    incompletePanel.textContent = 'Conteúdo';
    incomplete.insertAdjacentHTML('beforeend', '<button class="ds-tab" role="tab" id="tabs-incomplete-tab" aria-controls="tabs-incomplete-panel">Tab</button>');
    incomplete.after(incompletePanel);
    const incompleteRecovered = initTabs(incomplete).length;

    const lateHost = document.createElement('div');
    proofHost.append(lateHost);
    const lateBefore = initTabs(lateHost).length;
    lateHost.innerHTML = markup('tabs-late-root');
    const lateAfter = initTabs(lateHost).length;

    const secondInitCreated = initTabs(componentRoot).length;
    let duplicateEventCount = 0;
    componentRoot.addEventListener('ds-tabs-change', () => { duplicateEventCount += 1; });
    componentRoot.querySelector('#tabs-component-root-tab-b').click();

    const scopedHost = document.createElement('div');
    scopedHost.innerHTML = `${markup('tabs-scope-a')}${markup('tabs-scope-b')}`;
    proofHost.append(scopedHost);
    const scopedCreated = initTabs(scopedHost).length;

    return {
      containerCreated,
      containerMarked: containerHost.querySelector('.ds-tabs').dataset.dsTabsInit === 'true',
      componentCreated,
      componentMarked: componentRoot.dataset.dsTabsInit === 'true',
      incompleteFirstCreated,
      incompletePoisoned,
      incompleteRecovered,
      incompleteMarked: incomplete.dataset.dsTabsInit === 'true',
      lateBefore,
      lateAfter,
      lateMarked: lateHost.querySelector('.ds-tabs').dataset.dsTabsInit === 'true',
      secondInitCreated,
      duplicateEventCount,
      scopedCreated,
    };
  });

  ok(
    tabsSetup.containerCreated === 1 && tabsSetup.containerMarked,
    'initTabs(container) must initialize a descendant tablist exactly once',
    evidence('tabs', 'root-init', 'init-container'),
  );
  ok(
    tabsSetup.componentCreated === 1 && tabsSetup.componentMarked,
    'initTabs(componentRoot) must initialize the tablist root itself',
    evidence('tabs', 'root-init', 'init-component-root'),
  );
  ok(
    tabsSetup.incompleteFirstCreated === 0
      && !tabsSetup.incompletePoisoned
      && tabsSetup.incompleteRecovered === 1
      && tabsSetup.incompleteMarked,
    'incomplete Tabs markup must remain recoverable after its anatomy arrives',
    evidence('tabs', 'late-hydration', 'incomplete-markup-recoverable'),
  );
  ok(
    tabsSetup.lateBefore === 0 && tabsSetup.lateAfter === 1 && tabsSetup.lateMarked,
    'a late Tabs subtree must initialize when its container is scanned again',
    evidence('tabs', 'late-hydration', 'late-subtree-init'),
  );
  ok(
    tabsSetup.secondInitCreated === 0,
    'double init must create zero additional Tabs instances',
    evidence('tabs', 'idempotent-init', 'double-init-zero-new-instance'),
  );
  ok(
    tabsSetup.duplicateEventCount === 1,
    `double init must not duplicate Tabs events (got ${tabsSetup.duplicateEventCount})`,
    evidence('tabs', 'idempotent-init', 'double-init-no-duplicate-event'),
  );
  ok(tabsSetup.scopedCreated === 2, 'scoped destroy fixture must initialize two tablists');

  // --- Tabs: teclado, foco, ARIA, formulário e evento público ---
  await page.locator('#life-tab-a').focus();
  await page.keyboard.press('ArrowRight');
  const tabsArrowTarget = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('Home');
  const tabsHomeTarget = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('End');
  const tabsEndTarget = await page.evaluate(() => document.activeElement?.id);
  ok(
    tabsArrowTarget === 'life-tab-b'
      && tabsHomeTarget === 'life-tab-a'
      && tabsEndTarget === 'life-tab-b',
    `Tabs arrows/Home/End must select and focus enabled tabs (got ${tabsArrowTarget}, ${tabsHomeTarget}, ${tabsEndTarget})`,
    evidence('tabs', 'keyboard', 'arrows-home-end'),
  );

  await page.keyboard.press('ArrowRight');
  const tabsSkippedDisabled = await page.evaluate(() => document.activeElement?.id);
  ok(
    tabsSkippedDisabled === 'life-tab-a'
      && await page.locator('#life-tab-disabled').evaluate((el) => el.getAttribute('aria-selected') === 'false'),
    `Tabs keyboard navigation must skip disabled tabs (focused ${tabsSkippedDisabled})`,
    evidence('tabs', 'keyboard', 'disabled-skipped'),
  );

  const rovingState = await page.evaluate(() => [...document.querySelectorAll('#life-tabs .ds-tab')]
    .map((tab) => ({ id: tab.id, tabIndex: tab.tabIndex, selected: tab.getAttribute('aria-selected') })));
  ok(
    rovingState.filter((tab) => tab.tabIndex === 0).length === 1
      && rovingState.find((tab) => tab.id === 'life-tab-a')?.tabIndex === 0,
    `Tabs must keep exactly one tab in the page tab order (${JSON.stringify(rovingState)})`,
    evidence('tabs', 'focus', 'roving-tabindex'),
  );

  await page.keyboard.press('Tab');
  const tabPanelFocusTarget = await page.evaluate(() => document.activeElement?.id);
  ok(
    tabPanelFocusTarget === 'life-panel-a',
    `Tab from the selected tab must enter its tabpanel (focused ${tabPanelFocusTarget})`,
    evidence('tabs', 'focus', 'tabpanel-focus-entry'),
  );

  await page.locator('#life-tab-b').click();
  const tabsAria = await page.evaluate(() => {
    const a = document.getElementById('life-tab-a');
    const b = document.getElementById('life-tab-b');
    const panelA = document.getElementById(a.getAttribute('aria-controls'));
    const panelB = document.getElementById(b.getAttribute('aria-controls'));
    return {
      aSelected: a.getAttribute('aria-selected'),
      bSelected: b.getAttribute('aria-selected'),
      aHidden: panelA.hidden,
      bHidden: panelB.hidden,
      aLabelledBy: panelA.getAttribute('aria-labelledby'),
      bLabelledBy: panelB.getAttribute('aria-labelledby'),
    };
  });
  ok(
    tabsAria.aSelected === 'false'
      && tabsAria.bSelected === 'true'
      && tabsAria.aHidden
      && !tabsAria.bHidden
      && tabsAria.aLabelledBy === 'life-tab-a'
      && tabsAria.bLabelledBy === 'life-tab-b',
    `Tabs must synchronize selected tabs and controlled panels (${JSON.stringify(tabsAria)})`,
    evidence('tabs', 'aria', 'selected-controls-hidden-sync'),
  );

  const formProof = await page.evaluate(() => {
    const { initTabs } = window.__dsLifecycle;
    const form = document.createElement('form');
    form.id = 'tabs-form-proof';
    form.innerHTML = `
      <div class="ds-tabs" id="tabs-form-root" role="tablist" aria-label="Form tabs">
        <button class="ds-tab ds-tab--active" role="tab" id="tabs-form-tab-a" aria-selected="true" aria-controls="tabs-form-panel-a">A</button>
        <button class="ds-tab" role="tab" id="tabs-form-tab-b" aria-selected="false" aria-controls="tabs-form-panel-b">B</button>
      </div>
      <div id="tabs-form-panel-a" role="tabpanel" aria-labelledby="tabs-form-tab-a">A</div>
      <div id="tabs-form-panel-b" role="tabpanel" aria-labelledby="tabs-form-tab-b" hidden>B</div>`;
    document.body.append(form);
    let submits = 0;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submits += 1;
    });
    initTabs(form);
    const button = form.querySelector('#tabs-form-tab-b');
    button.click();
    return {
      submits,
      normalizedType: button.type,
      selected: button.getAttribute('aria-selected'),
      panelVisible: !form.querySelector('#tabs-form-panel-b').hidden,
    };
  });
  ok(
    formProof.submits === 0
      && formProof.normalizedType === 'button'
      && formProof.selected === 'true'
      && formProof.panelVisible,
    `Tabs selection must never submit an enclosing form (${JSON.stringify(formProof)})`,
    evidence('tabs', 'open-close', 'selection-does-not-submit-form'),
  );

  const tabsEvent = await page.evaluate(() => new Promise((resolve) => {
    const root = document.getElementById('life-tabs');
    root.addEventListener('ds-tabs-change', (event) => {
      resolve({
        bubbles: event.bubbles,
        target: event.target?.id,
        root: event.detail?.root?.id,
        tab: event.detail?.tab?.id,
        panel: event.detail?.panel?.id,
        previousTab: event.detail?.previousTab?.id,
      });
    }, { once: true });
    document.getElementById('life-tab-a').click();
  }));
  ok(
    tabsEvent.bubbles
      && tabsEvent.target === 'life-tabs'
      && tabsEvent.root === 'life-tabs'
      && tabsEvent.tab === 'life-tab-a'
      && tabsEvent.panel === 'life-panel-a'
      && tabsEvent.previousTab === 'life-tab-b',
    `Tabs event must bubble from its root with stable detail (${JSON.stringify(tabsEvent)})`,
    evidence('tabs', 'events', 'public-event-bubbling-target-detail'),
  );

  // --- Tabs: destroy escopado/idempotente e re-init sem duplicação ---
  const tabsCleanup = await page.evaluate(() => {
    const { initTabs, destroyTabs } = window.__dsLifecycle;
    const scopeA = document.getElementById('tabs-scope-a');
    const scopeB = document.getElementById('tabs-scope-b');
    destroyTabs(scopeA);
    destroyTabs(scopeA);
    scopeA.querySelector('#tabs-scope-a-tab-b').click();
    scopeB.querySelector('#tabs-scope-b-tab-b').click();

    const reinitRoot = document.getElementById('tabs-component-root');
    const reinitA = reinitRoot.querySelector('#tabs-component-root-tab-a');
    const reinitB = reinitRoot.querySelector('#tabs-component-root-tab-b');
    destroyTabs(reinitRoot);
    destroyTabs(reinitRoot);
    reinitA.setAttribute('aria-selected', 'true');
    reinitA.classList.add('ds-tab--active');
    reinitB.setAttribute('aria-selected', 'false');
    reinitB.classList.remove('ds-tab--active');
    document.getElementById('tabs-component-root-panel-a').hidden = false;
    document.getElementById('tabs-component-root-panel-b').hidden = true;
    const reinitCreated = initTabs(reinitRoot).length;
    let reinitEvents = 0;
    reinitRoot.addEventListener('ds-tabs-change', () => { reinitEvents += 1; });
    reinitB.click();

    return {
      scopeADead: document.getElementById('tabs-scope-a-panel-b').hidden
        && scopeA.dataset.dsTabsInit !== 'true',
      scopeBAlive: !document.getElementById('tabs-scope-b-panel-b').hidden
        && scopeB.dataset.dsTabsInit === 'true',
      reinitCreated,
      reinitSelected: reinitB.getAttribute('aria-selected') === 'true'
        && !document.getElementById('tabs-component-root-panel-b').hidden,
      reinitEvents,
      reinitMarked: reinitRoot.dataset.dsTabsInit === 'true',
    };
  });
  ok(
    tabsCleanup.scopeADead && tabsCleanup.scopeBAlive,
    'destroyTabs(root) must destroy only the scoped tablist',
    evidence('tabs', 'destroy', 'scoped-destroy'),
  );
  ok(
    tabsCleanup.scopeADead,
    'destroyTabs(root) must be safe when called twice',
    evidence('tabs', 'destroy', 'double-destroy'),
  );
  ok(
    tabsCleanup.reinitCreated === 1
      && tabsCleanup.reinitSelected
      && tabsCleanup.reinitMarked
      && tabsCleanup.reinitEvents === 1,
    `Tabs re-init must restore one listener/event (got ${JSON.stringify(tabsCleanup)})`,
    evidence('tabs', 'reinit', 'reinit-single-event'),
  );

  await page.evaluate(() => {
    const root = document.getElementById('life-tabs');
    const tabA = document.getElementById('life-tab-a');
    const tabB = document.getElementById('life-tab-b');
    tabA.setAttribute('aria-selected', 'false');
    tabA.classList.remove('ds-tab--active');
    tabA.tabIndex = -1;
    tabB.setAttribute('aria-selected', 'true');
    tabB.classList.add('ds-tab--active');
    tabB.tabIndex = 0;
    document.getElementById('life-panel-a').hidden = true;
    document.getElementById('life-panel-b').hidden = false;
    root.focus?.();
    window.__dsLifecycle.clearEvents();
  });

  // --- Tooltip: root init, hydration e idempotência ---
  const tooltipSetup = await page.evaluate(() => {
    const { initTooltips } = window.__dsLifecycle;
    const markup = (prefix, withIds = true) => `
      <div class="ds-tooltip ds-tooltip--top" id="${prefix}">
        <button type="button" id="${prefix}-trigger"${withIds ? ` aria-describedby="${prefix}-content"` : ''}>Ajuda</button>
        <span class="ds-tooltip__content"${withIds ? ` id="${prefix}-content" role="tooltip"` : ''}>${prefix}</span>
      </div>`;

    const proofHost = document.createElement('section');
    proofHost.id = 'tooltip-proof-host';
    document.body.append(proofHost);

    const containerHost = document.createElement('div');
    containerHost.innerHTML = markup('tooltip-container-root');
    proofHost.append(containerHost);
    const containerCreated = initTooltips(containerHost).length;

    const componentTemplate = document.createElement('template');
    componentTemplate.innerHTML = markup('tooltip-component-root', false).trim();
    const componentRoot = componentTemplate.content.firstElementChild;
    proofHost.append(componentRoot);
    const componentCreated = initTooltips(componentRoot).length;

    const incomplete = document.createElement('div');
    incomplete.className = 'ds-tooltip';
    incomplete.id = 'tooltip-incomplete-root';
    incomplete.innerHTML = '<span class="ds-tooltip__content">Conteúdo tardio</span>';
    proofHost.append(incomplete);
    const incompleteFirstCreated = initTooltips(incomplete).length;
    const incompletePoisoned = incomplete.dataset.dsTooltipInit === 'true';
    incomplete.insertAdjacentHTML('afterbegin', '<button type="button" id="tooltip-incomplete-trigger">Ajuda</button>');
    const incompleteRecovered = initTooltips(incomplete).length;

    const lateHost = document.createElement('div');
    proofHost.append(lateHost);
    const lateBefore = initTooltips(lateHost).length;
    lateHost.innerHTML = markup('tooltip-late-root');
    const lateAfter = initTooltips(lateHost).length;

    const secondInitCreated = initTooltips(componentRoot).length;
    let duplicateEventCount = 0;
    componentRoot.addEventListener('ds-tooltip-show', () => { duplicateEventCount += 1; });
    componentRoot.querySelector('button').focus();

    const scopedHost = document.createElement('div');
    scopedHost.innerHTML = `${markup('tooltip-scope-a')}${markup('tooltip-scope-b')}`;
    proofHost.append(scopedHost);
    const scopedCreated = initTooltips(scopedHost).length;

    const generatedContent = componentRoot.querySelector('.ds-tooltip__content');
    const generatedTrigger = componentRoot.querySelector('button');
    return {
      containerCreated,
      containerMarked: containerHost.querySelector('.ds-tooltip').dataset.dsTooltipInit === 'true',
      componentCreated,
      componentMarked: componentRoot.dataset.dsTooltipInit === 'true',
      generatedId: generatedContent.id,
      generatedRole: generatedContent.getAttribute('role'),
      generatedDescribedBy: generatedTrigger.getAttribute('aria-describedby'),
      incompleteFirstCreated,
      incompletePoisoned,
      incompleteRecovered,
      incompleteMarked: incomplete.dataset.dsTooltipInit === 'true',
      lateBefore,
      lateAfter,
      lateMarked: lateHost.querySelector('.ds-tooltip').dataset.dsTooltipInit === 'true',
      secondInitCreated,
      duplicateEventCount,
      scopedCreated,
    };
  });

  ok(
    tooltipSetup.containerCreated === 1 && tooltipSetup.containerMarked,
    'initTooltips(container) must initialize a descendant Tooltip exactly once',
    evidence('tooltip', 'root-init', 'init-container'),
  );
  ok(
    tooltipSetup.componentCreated === 1 && tooltipSetup.componentMarked,
    'initTooltips(componentRoot) must initialize the Tooltip root itself',
    evidence('tooltip', 'root-init', 'init-component-root'),
  );
  ok(
    tooltipSetup.incompleteFirstCreated === 0
      && !tooltipSetup.incompletePoisoned
      && tooltipSetup.incompleteRecovered === 1
      && tooltipSetup.incompleteMarked,
    'incomplete Tooltip markup must remain recoverable after its trigger arrives',
    evidence('tooltip', 'late-hydration', 'incomplete-markup-recoverable'),
  );
  ok(
    tooltipSetup.lateBefore === 0 && tooltipSetup.lateAfter === 1 && tooltipSetup.lateMarked,
    'a late Tooltip subtree must initialize when its container is scanned again',
    evidence('tooltip', 'late-hydration', 'late-subtree-init'),
  );
  ok(
    tooltipSetup.secondInitCreated === 0,
    'double init must create zero additional Tooltip instances',
    evidence('tooltip', 'idempotent-init', 'double-init-zero-new-instance'),
  );
  ok(
    tooltipSetup.duplicateEventCount === 1,
    `double init must not duplicate Tooltip events (got ${tooltipSetup.duplicateEventCount})`,
    evidence('tooltip', 'idempotent-init', 'double-init-no-duplicate-event'),
  );
  ok(
    Boolean(tooltipSetup.generatedId)
      && tooltipSetup.generatedRole === 'tooltip'
      && tooltipSetup.generatedDescribedBy?.split(/\s+/).includes(tooltipSetup.generatedId),
    `Tooltip must generate a valid role/id/aria-describedby relation (${JSON.stringify(tooltipSetup)})`,
  );
  ok(tooltipSetup.scopedCreated === 2, 'scoped destroy fixture must initialize two Tooltips');

  // --- Tooltip: foco, Escape, hover persistente, ARIA e eventos ---
  await page.mouse.move(0, 0);
  await page.locator('#tip-trigger').focus();
  const tooltipFocusState = await page.evaluate(() => ({
    active: document.activeElement?.id,
    open: document.getElementById('life-tooltip').dataset.open,
    hidden: document.getElementById('life-tip').hasAttribute('hidden'),
  }));
  ok(
    tooltipFocusState.active === 'tip-trigger'
      && tooltipFocusState.open === 'true'
      && !tooltipFocusState.hidden,
    `Tooltip focus must open without moving DOM focus (${JSON.stringify(tooltipFocusState)})`,
    evidence('tooltip', 'focus', 'focus-opens-without-moving-focus'),
  );

  await page.locator('#life-tab-a').focus();
  await page.waitForFunction(() => document.getElementById('life-tip').hasAttribute('hidden'));
  ok(
    await page.locator('#life-tip').evaluate((el) => el.hasAttribute('hidden')),
    'Tooltip must close after its trigger loses focus',
    evidence('tooltip', 'focus', 'blur-closes'),
  );

  const tooltipAria = await page.evaluate(() => {
    const trigger = document.getElementById('tip-trigger');
    const content = document.getElementById('life-tip');
    return {
      role: content.getAttribute('role'),
      describedBy: trigger.getAttribute('aria-describedby'),
      resolves: trigger.getAttribute('aria-describedby')?.split(/\s+/)
        .some((id) => document.getElementById(id) === content),
    };
  });
  ok(
    tooltipAria.role === 'tooltip' && tooltipAria.resolves,
    `Tooltip role and aria-describedby must resolve to its content (${JSON.stringify(tooltipAria)})`,
    evidence('tooltip', 'aria', 'role-and-describedby-valid'),
  );

  await page.mouse.move(0, 0);
  await page.locator('#life-tooltip').hover();
  await page.locator('#life-tip').waitFor({ state: 'visible', timeout: 1500 });
  await page.locator('#tip-trigger').focus();
  await page.keyboard.press('Escape');
  const tooltipAfterEscape = await page.locator('#life-tip').evaluate((el) => el.hasAttribute('hidden'));
  await page.waitForTimeout(160);
  const tooltipSuppressed = await page.locator('#life-tip').evaluate((el) => el.hasAttribute('hidden'));
  await page.locator('#life-tab-a').focus();
  await page.mouse.move(0, 0);
  await page.locator('#life-tooltip').hover();
  await page.locator('#life-tip').waitFor({ state: 'visible', timeout: 1500 });
  ok(
    tooltipAfterEscape && tooltipSuppressed,
    'Escape must dismiss Tooltip and suppress re-open until pointer/focus exits',
    evidence('tooltip', 'keyboard', 'escape-dismisses-until-exit'),
  );

  await page.locator('#life-tip').hover();
  await page.waitForTimeout(160);
  const tooltipPersistsOnContent = await page.locator('#life-tip').evaluate((el) => !el.hasAttribute('hidden'));
  ok(
    tooltipPersistsOnContent,
    'Tooltip must remain open while pointer moves from trigger to hoverable content',
    evidence('tooltip', 'open-close', 'trigger-to-content-persists'),
  );
  await page.mouse.move(0, 0);
  await page.waitForFunction(() => document.getElementById('life-tip').hasAttribute('hidden'));
  ok(
    await page.locator('#life-tip').evaluate((el) => el.hasAttribute('hidden')),
    'Tooltip must close after pointer and focus both leave',
    evidence('tooltip', 'open-close', 'leave-both-closes'),
  );

  const tooltipEvent = await page.evaluate(() => new Promise((resolve) => {
    const root = document.getElementById('life-tooltip');
    root.addEventListener('ds-tooltip-show', (event) => {
      resolve({
        bubbles: event.bubbles,
        target: event.target?.id,
        root: event.detail?.root?.id,
        trigger: event.detail?.trigger?.id,
        content: event.detail?.content?.id,
      });
    }, { once: true });
    document.getElementById('tip-trigger').focus();
  }));
  ok(
    tooltipEvent.bubbles
      && tooltipEvent.target === 'life-tooltip'
      && tooltipEvent.root === 'life-tooltip'
      && tooltipEvent.trigger === 'tip-trigger'
      && tooltipEvent.content === 'life-tip',
    `Tooltip event must bubble from its root with stable detail (${JSON.stringify(tooltipEvent)})`,
    evidence('tooltip', 'events', 'public-event-bubbling-target-detail'),
  );
  await page.keyboard.press('Escape');
  await page.locator('#life-tab-a').focus();
  await page.mouse.move(0, 0);

  // --- Tooltip: destroy escopado, timers e re-init sem duplicação ---
  const tooltipCleanup = await page.evaluate(async () => {
    const { initTooltips, destroyTooltips } = window.__dsLifecycle;
    const scopeA = document.getElementById('tooltip-scope-a');
    const scopeB = document.getElementById('tooltip-scope-b');
    let scopeAEvents = 0;
    scopeA.addEventListener('ds-tooltip-show', () => { scopeAEvents += 1; });
    scopeA.dispatchEvent(new PointerEvent('pointerenter'));
    destroyTooltips(scopeA);
    destroyTooltips(scopeA);
    await new Promise((resolve) => setTimeout(resolve, 180));
    scopeB.querySelector('button').focus();

    const reinitRoot = document.getElementById('tooltip-component-root');
    const reinitTrigger = reinitRoot.querySelector('button');
    destroyTooltips(reinitRoot);
    destroyTooltips(reinitRoot);
    const reinitCreated = initTooltips(reinitRoot).length;
    let reinitEvents = 0;
    reinitRoot.addEventListener('ds-tooltip-show', () => { reinitEvents += 1; });
    reinitTrigger.focus();

    return {
      scopeADead: scopeA.querySelector('.ds-tooltip__content').hasAttribute('hidden')
        && scopeA.dataset.dsTooltipInit !== 'true'
        && scopeAEvents === 0,
      scopeBAlive: !scopeB.querySelector('.ds-tooltip__content').hasAttribute('hidden')
        && scopeB.dataset.dsTooltipInit === 'true',
      reinitCreated,
      reinitOpened: !reinitRoot.querySelector('.ds-tooltip__content').hasAttribute('hidden'),
      reinitEvents,
      reinitMarked: reinitRoot.dataset.dsTooltipInit === 'true',
    };
  });
  ok(
    tooltipCleanup.scopeADead && tooltipCleanup.scopeBAlive,
    'destroyTooltips(root) must cancel pending timers and destroy only the scoped Tooltip',
    evidence('tooltip', 'destroy', 'scoped-destroy'),
  );
  ok(
    tooltipCleanup.scopeADead,
    'destroyTooltips(root) must be safe when called twice',
    evidence('tooltip', 'destroy', 'double-destroy'),
  );
  ok(
    tooltipCleanup.reinitCreated === 1
      && tooltipCleanup.reinitOpened
      && tooltipCleanup.reinitMarked
      && tooltipCleanup.reinitEvents === 1,
    `Tooltip re-init must restore one listener/event (got ${JSON.stringify(tooltipCleanup)})`,
    evidence('tooltip', 'reinit', 'reinit-single-event'),
  );

  // --- Popover: root init, hydration, idempotência e ARIA ---
  const popoverSetup = await page.evaluate(() => {
    const { initPopovers, closePopover } = window.__dsLifecycle;
    const markup = (prefix) => `
      <div class="ds-popover ds-popover--bottom" id="${prefix}">
        <button class="ds-popover__trigger" type="button" id="${prefix}-trigger">Abrir</button>
        <div class="ds-popover__panel" role="dialog" aria-label="${prefix}" hidden>
          <button class="ds-popover__close" type="button" id="${prefix}-close">Fechar</button>
          <button type="button" id="${prefix}-action">Ação</button>
        </div>
      </div>`;

    const host = document.createElement('div');
    host.id = 'popover-proof-host';
    document.body.appendChild(host);

    const containerHost = document.createElement('div');
    containerHost.innerHTML = markup('popover-container-root');
    host.appendChild(containerHost);
    const containerCreated = initPopovers(containerHost).length;

    const componentTemplate = document.createElement('template');
    componentTemplate.innerHTML = markup('popover-component-root').trim();
    const componentRoot = componentTemplate.content.firstElementChild;
    host.appendChild(componentRoot);
    const componentCreated = initPopovers(componentRoot).length;

    const incomplete = document.createElement('div');
    incomplete.className = 'ds-popover';
    incomplete.id = 'popover-incomplete-root';
    incomplete.innerHTML = '<div class="ds-popover__panel" role="dialog" aria-label="Tardio" hidden></div>';
    host.appendChild(incomplete);
    const incompleteFirstCreated = initPopovers(incomplete).length;
    const incompletePoisoned = incomplete.dataset.dsPopoverInit === 'true';
    incomplete.insertAdjacentHTML('afterbegin', '<button class="ds-popover__trigger" type="button">Abrir</button>');
    const incompleteRecovered = initPopovers(incomplete).length;

    const lateHost = document.createElement('div');
    host.appendChild(lateHost);
    const lateBefore = initPopovers(lateHost).length;
    lateHost.innerHTML = markup('popover-late-root');
    const lateAfter = initPopovers(lateHost).length;

    const secondInitCreated = initPopovers(componentRoot).length;
    let duplicateEventCount = 0;
    componentRoot.addEventListener('ds-popover-open', () => { duplicateEventCount += 1; });
    componentRoot.querySelector('.ds-popover__trigger').click();

    const panel = componentRoot.querySelector('.ds-popover__panel');
    const trigger = componentRoot.querySelector('.ds-popover__trigger');
    const aria = {
      role: panel.getAttribute('role'),
      controls: trigger.getAttribute('aria-controls'),
      panelId: panel.id,
      expanded: trigger.getAttribute('aria-expanded'),
      open: componentRoot.dataset.open,
    };
    closePopover(componentRoot);

    const scopedHost = document.createElement('div');
    scopedHost.innerHTML = `${markup('popover-scope-a')}${markup('popover-scope-b')}`;
    host.appendChild(scopedHost);
    const scopedCreated = initPopovers(scopedHost).length;

    return {
      containerCreated,
      containerMarked: containerHost.querySelector('.ds-popover').dataset.dsPopoverInit === 'true',
      componentCreated,
      componentMarked: componentRoot.dataset.dsPopoverInit === 'true',
      incompleteFirstCreated,
      incompletePoisoned,
      incompleteRecovered,
      incompleteMarked: incomplete.dataset.dsPopoverInit === 'true',
      lateBefore,
      lateAfter,
      lateMarked: lateHost.querySelector('.ds-popover').dataset.dsPopoverInit === 'true',
      secondInitCreated,
      duplicateEventCount,
      aria,
      scopedCreated,
    };
  });

  ok(
    popoverSetup.containerCreated === 1 && popoverSetup.containerMarked,
    'initPopovers(container) must initialize one descendant Popover',
    evidence('popover', 'root-init', 'init-container'),
  );
  ok(
    popoverSetup.componentCreated === 1 && popoverSetup.componentMarked,
    'initPopovers(componentRoot) must initialize the Popover root itself',
    evidence('popover', 'root-init', 'init-component-root'),
  );
  ok(
    popoverSetup.incompleteFirstCreated === 0
      && !popoverSetup.incompletePoisoned
      && popoverSetup.incompleteRecovered === 1
      && popoverSetup.incompleteMarked,
    'incomplete Popover markup must remain recoverable',
    evidence('popover', 'late-hydration', 'incomplete-markup-recoverable'),
  );
  ok(
    popoverSetup.lateBefore === 0 && popoverSetup.lateAfter === 1 && popoverSetup.lateMarked,
    'a late Popover subtree must initialize when scanned again',
    evidence('popover', 'late-hydration', 'late-subtree-init'),
  );
  ok(
    popoverSetup.secondInitCreated === 0,
    'double init must create zero additional Popover instances',
    evidence('popover', 'idempotent-init', 'double-init-zero-new-instance'),
  );
  ok(
    popoverSetup.duplicateEventCount === 1,
    `double init must not duplicate Popover events (${popoverSetup.duplicateEventCount})`,
    evidence('popover', 'idempotent-init', 'double-init-no-duplicate-event'),
  );
  ok(
    popoverSetup.aria.role === 'dialog'
      && popoverSetup.aria.controls === popoverSetup.aria.panelId
      && popoverSetup.aria.expanded === 'true'
      && popoverSetup.aria.open === 'true',
    `Popover must synchronize dialog/id/controls/expanded (${JSON.stringify(popoverSetup.aria)})`,
    evidence('popover', 'aria', 'dialog-controls-expanded-sync'),
  );
  ok(popoverSetup.scopedCreated === 2, 'scoped destroy fixture must initialize two Popovers');

  // --- Popover: foco, close, click externo e evento público ---
  await page.locator('#popover-trigger').click();
  ok(
    (await page.evaluate(() => document.activeElement?.id)) === 'popover-close',
    'Popover must focus its first interactive control on open',
    evidence('popover', 'focus', 'initial-focus'),
  );
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  ok(
    await page.evaluate(() => !document.getElementById('life-popover-panel').contains(document.activeElement)),
    'Popover must not trap focus',
    evidence('popover', 'focus', 'no-focus-trap'),
  );
  await page.evaluate(() => window.__dsLifecycle.closePopover(document.getElementById('life-popover')));

  await page.locator('#popover-trigger').click();
  await page.keyboard.press('Escape');
  ok(
    await page.evaluate(() => (
      document.getElementById('life-popover-panel').hidden
      && document.activeElement?.id === 'popover-trigger'
    )),
    'Escape must close Popover and return focus to trigger',
    [
      evidence('popover', 'keyboard', 'escape-closes'),
      evidence('popover', 'focus', 'focus-return'),
    ],
  );

  await page.locator('#popover-trigger').click();
  await page.locator('#popover-close').click();
  ok(
    await page.locator('#life-popover-panel').evaluate((el) => el.hidden),
    'close button must close Popover',
    evidence('popover', 'open-close', 'close-button-closes'),
  );

  await page.locator('#popover-trigger').click();
  await page.mouse.click(1, 1);
  ok(
    await page.locator('#life-popover-panel').evaluate((el) => el.hidden),
    'outside pointer interaction must close Popover',
    evidence('popover', 'open-close', 'outside-closes'),
  );

  // Opening a second Popover must make it the sole focus-return owner.
  await page.locator('#popover-scope-a-trigger').click();
  await page.locator('#popover-scope-b-trigger').click();
  const popoverReplacementOpen = await page.evaluate(() => ({
    firstHidden: document.querySelector('#popover-scope-a .ds-popover__panel').hidden,
    secondHidden: document.querySelector('#popover-scope-b .ds-popover__panel').hidden,
    active: document.activeElement?.id,
  }));
  ok(
    popoverReplacementOpen.firstHidden
      && !popoverReplacementOpen.secondHidden
      && popoverReplacementOpen.active === 'popover-scope-b-close',
    `opening Popover B must close A and focus B (${JSON.stringify(popoverReplacementOpen)})`,
    evidence('popover', 'open-close', 'latest-popover-replaces-previous'),
  );
  await page.keyboard.press('Escape');
  const popoverReplacementClosed = await page.evaluate(() => ({
    firstHidden: document.querySelector('#popover-scope-a .ds-popover__panel').hidden,
    secondHidden: document.querySelector('#popover-scope-b .ds-popover__panel').hidden,
    active: document.activeElement?.id,
  }));
  ok(
    popoverReplacementClosed.firstHidden
      && popoverReplacementClosed.secondHidden
      && popoverReplacementClosed.active === 'popover-scope-b-trigger',
    `Escape after A → B must return focus to trigger B (${JSON.stringify(popoverReplacementClosed)})`,
    [
      evidence('popover', 'keyboard', 'escape-returns-focus-to-latest-trigger'),
      evidence('popover', 'focus', 'latest-trigger-focus-return'),
    ],
  );

  // Pointerdown on a non-focusable outside target must not strand focus in a
  // panel that was just hidden.
  const popoverOutsideFocus = await page.evaluate(() => {
    const outside = document.createElement('div');
    outside.id = 'popover-outside-nonfocusable';
    document.body.append(outside);
    const root = document.getElementById('life-popover');
    const panel = document.getElementById('life-popover-panel');
    root.querySelector('.ds-popover__trigger').click();
    const focusedInsideBefore = panel.contains(document.activeElement);
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    const result = {
      focusedInsideBefore,
      panelHidden: panel.hidden,
      focusedInsideAfter: panel.contains(document.activeElement),
      active: document.activeElement?.id,
      outsideFocusable: outside.matches('a, button, input, select, textarea, [tabindex]'),
    };
    outside.remove();
    return result;
  });
  ok(
    popoverOutsideFocus.focusedInsideBefore
      && popoverOutsideFocus.panelHidden
      && !popoverOutsideFocus.focusedInsideAfter
      && !popoverOutsideFocus.outsideFocusable,
    `outside pointerdown must not leave focus inside a hidden Popover (${JSON.stringify(popoverOutsideFocus)})`,
    evidence('popover', 'focus', 'outside-nonfocusable-no-hidden-focus'),
  );

  // Collision handling must flip every preferred placement when its side is
  // constrained and then shift the resolved panel inside a narrow viewport.
  await page.setViewportSize({ width: 320, height: 240 });
  const popoverCollision = await page.evaluate(() => {
    const {
      initPopovers,
      destroyPopovers,
      openPopover,
      closePopover,
    } = window.__dsLifecycle;
    const fixture = document.createElement('div');
    fixture.id = 'popover-collision-fixture';
    document.body.append(fixture);
    const definitions = [
      { placement: 'bottom', expected: 'top', left: 4, top: 208, shift: '--popover-collision-inline' },
      { placement: 'top', expected: 'bottom', left: 288, top: 4, shift: '--popover-collision-inline' },
      { placement: 'left', expected: 'right', left: 4, top: 4, shift: '--popover-collision-block' },
      { placement: 'right', expected: 'left', left: 288, top: 208, shift: '--popover-collision-block' },
    ];

    for (const definition of definitions) {
      const root = document.createElement('div');
      root.className = `ds-popover ds-popover--${definition.placement}`;
      root.id = `popover-collision-${definition.placement}`;
      root.style.position = 'fixed';
      root.style.insetInlineStart = `${definition.left}px`;
      root.style.insetBlockStart = `${definition.top}px`;
      root.innerHTML = `
        <button class="ds-popover__trigger" type="button"
          style="inline-size:24px;block-size:24px;padding:0">Abrir</button>
        <div class="ds-popover__panel" role="dialog"
          aria-label="Collision ${definition.placement}" hidden>
          <button class="ds-popover__close" type="button">Fechar</button>
          <div style="inline-size:240px;block-size:120px">Conteúdo para collision</div>
        </div>`;
      fixture.append(root);
    }
    initPopovers(fixture);

    const results = definitions.map((definition) => {
      const root = document.getElementById(`popover-collision-${definition.placement}`);
      const panel = root.querySelector('.ds-popover__panel');
      openPopover(root);
      const rect = panel.getBoundingClientRect();
      const result = {
        preferred: definition.placement,
        resolved: root.dataset.dsPopoverPlacement,
        expected: definition.expected,
        shift: panel.style.getPropertyValue(definition.shift),
        rect: {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        },
        inViewport: rect.left >= -0.5
          && rect.right <= window.innerWidth + 0.5
          && rect.top >= -0.5
          && rect.bottom <= window.innerHeight + 0.5,
      };
      closePopover(root);
      return result;
    });
    destroyPopovers(fixture);
    fixture.remove();
    return results;
  });
  await page.setViewportSize({ width: 1280, height: 800 });
  ok(
    popoverCollision.length === 4
      && popoverCollision.every((result) => (
        result.resolved === result.expected
        && result.resolved !== result.preferred
        && result.shift !== ''
        && result.inViewport
      )),
    `all four Popover placements must flip/shift inside a narrow viewport (${JSON.stringify(popoverCollision)})`,
    evidence('popover', 'open-close', 'four-placement-collision-within-viewport'),
  );

  const popoverEvent = await page.evaluate(() => new Promise((resolve) => {
    const root = document.getElementById('life-popover');
    root.addEventListener('ds-popover-open', (event) => {
      resolve({
        bubbles: event.bubbles,
        target: event.target.id,
        root: event.detail.root.id,
        trigger: event.detail.trigger.id,
        panel: event.detail.panel.id,
        reason: event.detail.reason,
      });
    }, { once: true });
    root.querySelector('.ds-popover__trigger').click();
  }));
  ok(
    popoverEvent.bubbles
      && popoverEvent.target === 'life-popover'
      && popoverEvent.root === 'life-popover'
      && popoverEvent.trigger === 'popover-trigger'
      && popoverEvent.panel === 'life-popover-panel'
      && popoverEvent.reason === 'trigger',
    `Popover event must bubble with stable detail (${JSON.stringify(popoverEvent)})`,
    evidence('popover', 'events', 'public-event-bubbling-target-detail'),
  );
  await page.keyboard.press('Escape');
  const popoverEventCounts = await page.evaluate(() => window.__dsLifecycle.events()
    .filter((name) => name === 'ds-popover-open' || name === 'ds-popover-close'));
  ok(
    popoverEventCounts.length >= 2,
    'Popover must emit public open and close events',
    evidence('popover', 'events', 'public-event-count'),
  );

  const popoverCleanup = await page.evaluate(() => {
    const { initPopovers, destroyPopovers } = window.__dsLifecycle;
    const scopeA = document.getElementById('popover-scope-a');
    const scopeB = document.getElementById('popover-scope-b');
    destroyPopovers(scopeA);
    destroyPopovers(scopeA);
    scopeA.querySelector('.ds-popover__trigger').click();
    scopeB.querySelector('.ds-popover__trigger').click();
    const scopeADeadBeforeReinit = scopeA.querySelector('.ds-popover__panel').hidden
      && scopeA.dataset.dsPopoverInit !== 'true';
    const scopeBAliveBeforeReinit = !scopeB.querySelector('.ds-popover__panel').hidden
      && scopeB.dataset.dsPopoverInit === 'true';

    let reinitEvents = 0;
    scopeA.addEventListener('ds-popover-open', () => { reinitEvents += 1; });
    const reinitCreated = initPopovers(scopeA).length;
    scopeA.querySelector('.ds-popover__trigger').click();

    return {
      scopeADeadBeforeReinit,
      scopeBAliveBeforeReinit,
      reinitCreated,
      reinitOpened: !scopeA.querySelector('.ds-popover__panel').hidden,
      reinitEvents,
      reinitMarked: scopeA.dataset.dsPopoverInit === 'true',
    };
  });
  ok(
    popoverCleanup.scopeADeadBeforeReinit && popoverCleanup.scopeBAliveBeforeReinit,
    'destroyPopovers(root) must destroy only the scoped Popover',
    evidence('popover', 'destroy', 'scoped-destroy'),
  );
  ok(
    popoverCleanup.reinitCreated === 1,
    'destroyPopovers(root) must be safe when called twice',
    evidence('popover', 'destroy', 'double-destroy'),
  );
  ok(
    popoverCleanup.reinitOpened && popoverCleanup.reinitMarked && popoverCleanup.reinitEvents === 1,
    `Popover re-init must restore one listener/event (${JSON.stringify(popoverCleanup)})`,
    evidence('popover', 'reinit', 'reinit-single-event'),
  );

  // --- Toast: roots, hydration, idempotência e live regions ---
  const toastSetup = await page.evaluate(() => {
    const { initToasts } = window.__dsLifecycle;
    const regionMarkup = (id) => `
      <div class="ds-toast-region" data-ds-toast-region id="${id}">
        <div class="ds-toast-region__polite" role="status" aria-live="polite" aria-relevant="additions"></div>
        <div class="ds-toast-region__assertive" role="alert" aria-live="assertive" aria-relevant="additions"></div>
      </div>`;

    const host = document.createElement('section');
    host.id = 'toast-proof-host';
    document.body.append(host);

    const containerHost = document.createElement('div');
    containerHost.innerHTML = regionMarkup('toast-container-region');
    host.append(containerHost);
    const [containerController] = initToasts(containerHost);

    const componentTemplate = document.createElement('template');
    componentTemplate.innerHTML = regionMarkup('toast-component-region').trim();
    const componentRoot = componentTemplate.content.firstElementChild;
    host.append(componentRoot);
    const [componentController] = initToasts(componentRoot);

    const incomplete = document.createElement('div');
    incomplete.className = 'ds-toast-region';
    incomplete.setAttribute('data-ds-toast-region', '');
    incomplete.id = 'toast-incomplete-region';
    host.append(incomplete);
    const [incompleteController] = initToasts(incomplete);

    const lateHost = document.createElement('div');
    host.append(lateHost);
    const lateBefore = lateHost.querySelectorAll('[data-ds-toast-region]').length;
    lateHost.innerHTML = regionMarkup('toast-late-region');
    const [lateController] = initToasts(lateHost);

    const [secondComponentController] = initToasts(componentRoot);
    let duplicateEventCount = 0;
    componentRoot.addEventListener('ds-toast-show', () => { duplicateEventCount += 1; });
    const duplicateId = componentController.show({
      id: 'toast-idempotent',
      title: 'Único',
      duration: 0,
    });
    componentController.dismiss(duplicateId);

    return {
      containerMarked: containerController.root.id === 'toast-container-region'
        && containerController.root.dataset.dsToastInit === 'true',
      componentMarked: componentController.root === componentRoot
        && componentRoot.dataset.dsToastInit === 'true'
        && componentRoot.querySelectorAll('[data-ds-toast-region]').length === 0,
      incompleteRecovered: incompleteController.root === incomplete
        && incomplete.dataset.dsToastInit === 'true'
        && incomplete.querySelector('.ds-toast-region__polite')?.getAttribute('role') === 'status'
        && incomplete.querySelector('.ds-toast-region__assertive')?.getAttribute('role') === 'alert',
      lateBefore,
      lateInitialized: lateController.root.id === 'toast-late-region'
        && lateController.root.dataset.dsToastInit === 'true',
      sameController: componentController === secondComponentController,
      duplicateEventCount,
      aria: {
        politeRole: containerController.root.querySelector('.ds-toast-region__polite')?.getAttribute('role'),
        politeLive: containerController.root.querySelector('.ds-toast-region__polite')?.getAttribute('aria-live'),
        assertiveRole: containerController.root.querySelector('.ds-toast-region__assertive')?.getAttribute('role'),
        assertiveLive: containerController.root.querySelector('.ds-toast-region__assertive')?.getAttribute('aria-live'),
      },
    };
  });
  ok(
    toastSetup.containerMarked,
    'initToasts(container) must initialize its descendant Toast region',
    evidence('toast', 'root-init', 'init-container'),
  );
  ok(
    toastSetup.componentMarked,
    'initToasts(componentRoot) must initialize the Toast region itself without nesting another region',
    evidence('toast', 'root-init', 'init-component-root'),
  );
  ok(
    toastSetup.incompleteRecovered,
    'an incomplete Toast region must be repaired with both live-region hosts',
    evidence('toast', 'late-hydration', 'incomplete-markup-recoverable'),
  );
  ok(
    toastSetup.lateBefore === 0 && toastSetup.lateInitialized,
    'a Toast region mounted after the initial document scan must initialize in its subtree',
    evidence('toast', 'late-hydration', 'late-subtree-init'),
  );
  ok(
    toastSetup.sameController,
    'double init must reuse the same Toast controller',
    evidence('toast', 'idempotent-init', 'double-init-zero-new-instance'),
  );
  ok(
    toastSetup.duplicateEventCount === 1,
    `double init must not duplicate Toast events (${toastSetup.duplicateEventCount})`,
    evidence('toast', 'idempotent-init', 'double-init-no-duplicate-event'),
  );
  ok(
    toastSetup.aria.politeRole === 'status'
      && toastSetup.aria.politeLive === 'polite'
      && toastSetup.aria.assertiveRole === 'alert'
      && toastSetup.aria.assertiveLive === 'assertive',
    `Toast must expose separate polite and assertive live regions (${JSON.stringify(toastSetup.aria)})`,
    evidence('toast', 'aria', 'polite-assertive-live-regions'),
  );

  // --- Toast: foco, timer, teclado, fila, action e eventos públicos ---
  const toastFocus = await page.evaluate(() => {
    const { initToasts, showToast } = window.__dsLifecycle;
    initToasts(document);
    const before = document.activeElement?.id;
    const id = showToast({
      id: 'toast-focus-pause',
      type: 'info',
      title: 'Pausável',
      duration: 140,
    });
    return {
      id,
      before,
      after: document.activeElement?.id,
    };
  });
  ok(
    toastFocus.before === toastFocus.after,
    `showToast must not move focus (${JSON.stringify(toastFocus)})`,
    evidence('toast', 'focus', 'does-not-move-focus'),
  );
  await page.locator(`[data-toast-id="${toastFocus.id}"] .ds-toast__close`).focus();
  await page.waitForTimeout(220);
  const toastStillPaused = await page.locator(`[data-toast-id="${toastFocus.id}"]`).count() === 1;
  await page.locator('#life-tab-a').focus();
  await page.waitForTimeout(180);
  const toastResumed = await page.locator(`[data-toast-id="${toastFocus.id}"]`).count() === 0;
  ok(
    toastStillPaused && toastResumed,
    `Toast focus must pause and then resume auto-hide (${JSON.stringify({ toastStillPaused, toastResumed })})`,
    evidence('toast', 'focus', 'focus-pauses-timer'),
  );

  const toastEscapeId = await page.evaluate(() => window.__dsLifecycle.showToast({
    id: 'toast-escape',
    type: 'warning',
    title: 'Teclado',
    duration: 0,
  }));
  await page.locator(`[data-toast-id="${toastEscapeId}"] .ds-toast__close`).focus();
  await page.keyboard.press('Escape');
  ok(
    await page.locator(`[data-toast-id="${toastEscapeId}"]`).count() === 0,
    'Escape must dismiss the Toast that contains focus',
    evidence('toast', 'keyboard', 'escape-dismisses-focused-toast'),
  );

  const toastTimeoutId = await page.evaluate(() => window.__dsLifecycle.showToast({
    id: 'toast-timeout',
    type: 'info',
    title: 'Temporário',
    duration: 40,
  }));
  await page.waitForTimeout(100);
  ok(
    await page.locator(`[data-toast-id="${toastTimeoutId}"]`).count() === 0,
    'Toast without action must dismiss after its configured duration',
    evidence('toast', 'open-close', 'timeout-dismisses'),
  );

  const toastQueue = await page.evaluate(() => {
    const { initToasts, destroyToasts } = window.__dsLifecycle;
    const host = document.createElement('div');
    host.id = 'toast-queue-host';
    host.innerHTML = `
      <div class="ds-toast-region" data-ds-toast-region id="toast-queue-region">
        <div class="ds-toast-region__polite" role="status" aria-live="polite"></div>
        <div class="ds-toast-region__assertive" role="alert" aria-live="assertive"></div>
      </div>`;
    document.body.append(host);
    const [controller] = initToasts(host);
    const reasons = [];
    controller.root.addEventListener('ds-toast-dismiss', (event) => reasons.push(event.detail.reason));
    for (let index = 0; index < 6; index += 1) {
      controller.show({ id: `toast-queue-${index}`, title: `Toast ${index}`, duration: 0 });
    }
    const result = {
      count: controller.root.querySelectorAll('[data-ds-toast]').length,
      oldestPresent: Boolean(controller.root.querySelector('[data-toast-id="toast-queue-0"]')),
      overflowCount: reasons.filter((reason) => reason === 'overflow').length,
    };
    destroyToasts(host);
    return result;
  });
  ok(
    toastQueue.count === 5 && !toastQueue.oldestPresent && toastQueue.overflowCount === 1,
    `Toast queue must evict only the oldest item after five visible notifications (${JSON.stringify(toastQueue)})`,
    evidence('toast', 'open-close', 'queue-limit-oldest'),
  );

  const toastEventId = await page.evaluate(() => {
    const { initToasts } = window.__dsLifecycle;
    const host = document.createElement('div');
    host.id = 'toast-event-host';
    host.innerHTML = `
      <div class="ds-toast-region" data-ds-toast-region id="toast-event-region">
        <div class="ds-toast-region__polite" role="status" aria-live="polite"></div>
        <div class="ds-toast-region__assertive" role="alert" aria-live="assertive"></div>
      </div>`;
    document.body.append(host);
    const [controller] = initToasts(host);
    window.__toastEventController = controller;
    window.__toastActionCalls = 0;
    window.__toastPublicEvents = [];
    for (const name of ['ds-toast-show', 'ds-toast-action', 'ds-toast-dismiss']) {
      controller.root.addEventListener(name, (event) => {
        window.__toastPublicEvents.push({
          name,
          bubbles: event.bubbles,
          target: event.target.id,
          id: event.detail.id,
          type: event.detail.type,
          root: event.detail.root.id,
          toastId: event.detail.toast?.dataset.toastId,
          actionIndex: event.detail.actionIndex,
          label: event.detail.label,
          reason: event.detail.reason,
        });
      });
    }
    return controller.show({
      id: 'toast-event',
      type: 'success',
      title: 'Com ação',
      actions: [{
        label: 'Desfazer',
        onAction: () => { window.__toastActionCalls += 1; },
      }],
    });
  });
  await page.locator(`[data-toast-id="${toastEventId}"] .ds-toast__actions .ds-button`).click();
  const toastActionResult = await page.evaluate((id) => {
    const stillVisibleAfterAction = Boolean(document.querySelector(`[data-toast-id="${id}"]`));
    window.__toastEventController.dismiss(id);
    return {
      calls: window.__toastActionCalls,
      stillVisibleAfterAction,
      events: window.__toastPublicEvents,
    };
  }, toastEventId);
  const toastEventNames = toastActionResult.events.map((event) => event.name);
  const toastEventDetailValid = toastActionResult.events.every((event) => (
    event.bubbles
      && event.target === 'toast-event-region'
      && event.id === 'toast-event'
      && event.type === 'success'
      && event.root === 'toast-event-region'
      && event.toastId === 'toast-event'
  ));
  const toastActionEvent = toastActionResult.events.find((event) => event.name === 'ds-toast-action');
  const toastDismissEvent = toastActionResult.events.find((event) => event.name === 'ds-toast-dismiss');
  ok(
    toastActionResult.calls === 1
      && toastActionResult.stillVisibleAfterAction
      && toastActionEvent?.actionIndex === 0
      && toastActionEvent?.label === 'Desfazer',
    `Toast action must call its callback once without dismissing implicitly (${JSON.stringify(toastActionResult)})`,
    evidence('toast', 'open-close', 'action-callback-runs'),
  );
  ok(
    toastEventNames.length === 3
      && ['ds-toast-show', 'ds-toast-action', 'ds-toast-dismiss']
        .every((name) => toastEventNames.filter((eventName) => eventName === name).length === 1),
    `Toast public events must emit exactly once per exercised transition (${toastEventNames.join(', ')})`,
    evidence('toast', 'events', 'public-event-count'),
  );
  ok(
    toastEventDetailValid
      && toastActionEvent?.actionIndex === 0
      && toastActionEvent?.label === 'Desfazer'
      && toastDismissEvent?.reason === 'dismiss',
    `Toast events must bubble with stable target/detail (${JSON.stringify(toastActionResult.events)})`,
    evidence('toast', 'events', 'public-event-bubbling-target-detail'),
  );

  // --- Toast: destroy escopado, timers e re-init ---
  const toastCleanup = await page.evaluate(async () => {
    const { initToasts, destroyToasts } = window.__dsLifecycle;
    const markup = (id) => `
      <div class="ds-toast-region" data-ds-toast-region id="${id}">
        <div class="ds-toast-region__polite" role="status" aria-live="polite"></div>
        <div class="ds-toast-region__assertive" role="alert" aria-live="assertive"></div>
      </div>`;
    const hostA = document.createElement('div');
    hostA.id = 'toast-scope-a';
    hostA.innerHTML = markup('toast-scope-a-region');
    document.body.append(hostA);
    const hostB = document.createElement('div');
    hostB.id = 'toast-scope-b';
    hostB.innerHTML = markup('toast-scope-b-region');
    document.body.append(hostB);
    const [controllerA] = initToasts(hostA);
    const [controllerB] = initToasts(hostB);
    const dismissReasons = [];
    controllerA.root.addEventListener('ds-toast-dismiss', (event) => dismissReasons.push(event.detail.reason));
    controllerA.show({ id: 'toast-scope-a-item', title: 'A', duration: 40 });
    controllerB.show({ id: 'toast-scope-b-item', title: 'B', duration: 0 });

    destroyToasts(hostA);
    destroyToasts(hostA);
    const dismissCountAfterDestroy = dismissReasons.length;
    const scopeADeadBeforeReinit = controllerA.root.dataset.dsToastInit !== 'true'
      && !controllerA.root.querySelector('[data-toast-id="toast-scope-a-item"]');
    await new Promise((resolve) => setTimeout(resolve, 100));

    let reinitEvents = 0;
    controllerA.root.addEventListener('ds-toast-show', () => { reinitEvents += 1; });
    const [reinitialized] = initToasts(hostA);
    reinitialized.show({ id: 'toast-scope-a-reinit', title: 'A novamente', duration: 0 });

    const result = {
      scopeADead: scopeADeadBeforeReinit,
      scopeBAlive: controllerB.root.dataset.dsToastInit === 'true'
        && Boolean(controllerB.root.querySelector('[data-toast-id="toast-scope-b-item"]')),
      dismissCountAfterDestroy,
      dismissCountAfterWait: dismissReasons.length,
      destroyReason: dismissReasons[0],
      reinitialized: reinitialized.root.dataset.dsToastInit === 'true'
        && Boolean(reinitialized.root.querySelector('[data-toast-id="toast-scope-a-reinit"]')),
      reinitEvents,
    };
    destroyToasts(hostA);
    destroyToasts(hostB);
    return result;
  });
  ok(
    toastCleanup.scopeADead && toastCleanup.scopeBAlive,
    `destroyToasts(root) must destroy only the scoped controller (${JSON.stringify(toastCleanup)})`,
    evidence('toast', 'destroy', 'scoped-destroy'),
  );
  ok(
    toastCleanup.dismissCountAfterDestroy === 1
      && toastCleanup.dismissCountAfterWait === 1
      && toastCleanup.destroyReason === 'destroy',
    `double destroy must remain safe and cancel pending Toast timers (${JSON.stringify(toastCleanup)})`,
    [
      evidence('toast', 'destroy', 'double-destroy'),
      evidence('toast', 'destroy', 'no-post-destroy-effects'),
    ],
  );
  ok(
    toastCleanup.reinitialized && toastCleanup.reinitEvents === 1,
    `Toast re-init must restore one controller/event (${JSON.stringify(toastCleanup)})`,
    evidence('toast', 'reinit', 'reinit-single-event'),
  );

  await page.evaluate(() => {
    document.getElementById('life-tab-a').focus();
    window.__dsLifecycle.clearEvents();
  });
  await page.mouse.move(0, 0);

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
  ok(!markers.popoverInit, 'destroyPopovers must clear init markers');
  ok(!markers.toastInit, 'destroyToasts must clear the Toast init marker');

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

  await page.locator('#popover-trigger').click();
  ok(
    await page.locator('#life-popover-panel').evaluate((el) => el.hidden),
    'destroyed popover trigger must not open panel',
    evidence('popover', 'destroy', 'no-post-destroy-effects'),
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

  await page.keyboard.press('Escape');
  await page.locator('#popover-trigger').click();
  ok(
    await page.locator('#life-popover-panel').evaluate((el) => !el.hidden),
    're-init must restore popover trigger',
    evidence('popover', 'reinit', 'reinit-restores-behavior'),
  );

  const toastReinit = await page.evaluate(() => {
    const id = window.__dsLifecycle.showToast({
      id: 'toast-reinit',
      title: 'Restaurado',
      duration: 0,
    });
    const shown = Boolean(document.querySelector(`[data-toast-id="${id}"]`));
    const dismissed = window.__dsLifecycle.dismissToast(id);
    return { shown, dismissed };
  });
  ok(
    toastReinit.shown && toastReinit.dismissed,
    `re-init must restore Toast show/dismiss behavior (${JSON.stringify(toastReinit)})`,
    evidence('toast', 'reinit', 'reinit-restores-behavior'),
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
