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
