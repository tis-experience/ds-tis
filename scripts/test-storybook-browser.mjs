#!/usr/bin/env node

import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const staticDirIndex = process.argv.indexOf('--static-dir');
const staticDir = staticDirIndex >= 0 ? process.argv[staticDirIndex + 1] : 'storybook-static';
if (!staticDir) {
  console.error('Informe um diretório após --static-dir.');
  process.exit(2);
}
const STATIC_ROOT = path.resolve(ROOT, staticDir);
const externalUrl = process.env.STORYBOOK_URL;
const shouldServe = !externalUrl;
const failures = [];
let server;

const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

if (!existsSync(path.join(STATIC_ROOT, 'index.json'))) {
  console.error('storybook-static ausente. Rode npm run build:storybook antes do teste de browser.');
  process.exit(2);
}

if (shouldServe) {
  server = createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const file = path.resolve(STATIC_ROOT, relative);
    if (!file.startsWith(`${STATIC_ROOT}${path.sep}`) || !existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    createReadStream(file).pipe(response);
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
}

const baseUrl = externalUrl || `http://127.0.0.1:${server.address().port}`;
const index = JSON.parse(readFileSync(path.join(STATIC_ROOT, 'index.json'), 'utf8'));
const entries = Object.values(index.entries);
const stories = entries.filter((entry) => entry.type === 'story');
const docs = entries.filter((entry) => entry.type === 'docs');

const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browserPath = process.env.DS_BROWSER_PATH
  || (process.platform === 'darwin' && existsSync(macChrome) ? macChrome : undefined);
const browserOptions = browserPath ? { executablePath: browserPath } : {};

const browser = await chromium.launch(browserOptions);
const context = await browser.newContext();
const page = await context.newPage();
let browserErrors = [];
page.on('pageerror', (error) => browserErrors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) browserErrors.push(`console.error: ${message.text()}`);
});
page.on('response', (response) => {
  if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) {
    browserErrors.push(`http ${response.status()}: ${response.url()}`);
  }
});

async function visit(entry, viewMode = 'story', mode = 'light') {
  browserErrors = [];
  await page.goto(`${baseUrl}/iframe.html?id=${encodeURIComponent(entry.id)}&viewMode=${viewMode}&globals=a11y.manual:!true;mode:${mode}`, { waitUntil: 'domcontentloaded' });
  await page.locator('#storybook-root, #storybook-docs').first().waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts?.ready);
  try {
    await page.waitForFunction(
      (expectedMode) => document.documentElement.dataset.mode === expectedMode,
      mode,
      { timeout: 3000 },
    );
  } catch {
    failures.push(`${entry.id}: mode=${mode} não foi aplicado dentro do timeout`);
  }
  if (browserErrors.length) failures.push(`${entry.id}: ${browserErrors.join(' | ')}`);
}

let audited = 0;
for (const entry of stories) {
  await page.setViewportSize({ width: 1280, height: 800 });
  await visit(entry);
  const shell = await page.locator('.sb-story-shell--story').count();
  if (!shell) failures.push(`${entry.id}: shell isolado ausente`);
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .disableRules(['region'])
    .analyze();
  for (const violation of axe.violations.filter((item) => ['critical', 'serious'].includes(item.impact))) {
    failures.push(`${entry.id}: axe ${violation.impact} ${violation.id}`);
  }

  await page.setViewportSize({ width: 320, height: 568 });
  await visit(entry);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) failures.push(`${entry.id}: overflow horizontal de ${overflow}px em 320px`);
  audited += 1;
  if (audited % 10 === 0 || audited === stories.length) process.stdout.write(`\rStories auditadas: ${audited}/${stories.length}`);
}

process.stdout.write('\n');
for (const entry of docs) {
  await page.setViewportSize({ width: 1280, height: 800 });
  await visit(entry, 'docs', 'dark');
  const mode = await page.evaluate(() => document.documentElement.dataset.mode);
  if (mode !== 'dark') failures.push(`${entry.id}: Docs não aplicou mode=dark`);
  const docsShells = await page.locator('.sb-story-shell--docs').count();
  if (entry.title !== 'Introdução/Design System TIS' && !docsShells) failures.push(`${entry.id}: amostras Docs sem shell compacto`);
}

async function story(title, name) {
  const entry = stories.find((item) => item.title === title && item.name === name);
  if (!entry) throw new Error(`Story não encontrada: ${title} / ${name}`);
  await page.setViewportSize({ width: 1280, height: 800 });
  await visit(entry);
}

try {
  await story('Components/Accordion', 'Playground');
  const accordionTrigger = page.locator('.ds-accordion__trigger').nth(1);
  await accordionTrigger.click();
  if (await accordionTrigger.getAttribute('aria-expanded') !== 'true') failures.push('Accordion: trigger não abriu o painel');

  await story('Components/Form/Combobox', 'Playground');
  await page.locator('.ds-combobox-anchor[data-ds-combobox-init="true"]').waitFor();
  const combobox = page.locator('.ds-combobox__input');
  await combobox.focus();
  if (await combobox.getAttribute('aria-expanded') !== 'true') failures.push('Combobox: focus não abriu o listbox');

  await story('Components/Menu', 'Action Menu');
  const menuTrigger = page.locator('.ds-action-menu__trigger');
  await menuTrigger.click();
  if (await menuTrigger.getAttribute('aria-expanded') !== 'true') failures.push('Menu: trigger não abriu Action Menu');

  await story('Components/Modal', 'Playground');
  await page.locator('[data-ds-modal-open]').click();
  if (await page.locator('.ds-modal-overlay').getAttribute('hidden') !== null) failures.push('Modal: trigger não abriu o dialog');
  await page.keyboard.press('Escape');
  if (await page.locator('.ds-modal-overlay').getAttribute('hidden') === null) failures.push('Modal: Escape não fechou o dialog');

  await story('Components/Popover', 'Playground');
  const popoverTrigger = page.locator('.ds-popover__trigger');
  const popoverPanel = page.locator('.ds-popover__panel');
  let popoverVisualContract = null;
  if (await popoverTrigger.count() !== 1 || await popoverPanel.count() !== 1) {
    failures.push('Popover: Playground deve expor exatamente um trigger e um panel');
  } else {
    await popoverTrigger.click();
    if (await popoverTrigger.getAttribute('aria-expanded') !== 'true') failures.push('Popover: trigger não sincronizou aria-expanded ao abrir');
    if (await popoverPanel.getAttribute('hidden') !== null) failures.push('Popover: trigger não abriu o panel');
    popoverVisualContract = await page.locator('.ds-popover').evaluate((root) => {
      const panel = root.querySelector('.ds-popover__panel');
      const close = root.querySelector('.ds-popover__close');
      const outerArrow = getComputedStyle(root, '::before');
      const innerArrow = getComputedStyle(root, '::after');
      const clippedPanelArrow = getComputedStyle(panel, '::before');
      const panelStyle = getComputedStyle(panel);
      const closeStyle = getComputedStyle(close);
      const panelRect = panel.getBoundingClientRect();
      const closeRect = close.getBoundingClientRect();
      const arrowBase = Number.parseFloat(outerArrow.width);
      const borderWidth = Number.parseFloat(panelStyle.borderTopWidth);
      const panelPaddingTop = Number.parseFloat(panelStyle.paddingTop);
      const panelPaddingRight = Number.parseFloat(panelStyle.paddingRight);
      const closePadding = Number.parseFloat(closeStyle.paddingTop);
      const transform = new DOMMatrixReadOnly(outerArrow.transform);
      return {
        outerContent: outerArrow.content,
        outerWidth: Number.parseFloat(outerArrow.width),
        outerHeight: Number.parseFloat(outerArrow.height),
        innerContent: innerArrow.content,
        innerWidth: Number.parseFloat(innerArrow.width),
        innerHeight: Number.parseFloat(innerArrow.height),
        clipPath: outerArrow.clipPath,
        rotated: Math.abs(transform.b) > 0.001 || Math.abs(transform.c) > 0.001,
        panelContent: clippedPanelArrow.content,
        panelOverflow: getComputedStyle(panel).overflow,
        closeWidth: closeRect.width,
        closeHeight: closeRect.height,
        closeTop: closeRect.top - panelRect.top,
        closeRight: panelRect.right - closeRect.right,
        expectedOuterHeight: (arrowBase / 2) + borderWidth,
        expectedInnerWidth: arrowBase - (borderWidth * 2),
        expectedInnerHeight: arrowBase / 2,
        expectedCloseTop: panelPaddingTop - (closePadding / 2),
        expectedCloseRight: panelPaddingRight,
      };
    });
    const within = (actual, expected) => Math.abs(actual - expected) <= 0.25;
    if (
      popoverVisualContract.outerContent === 'none'
      || popoverVisualContract.innerContent === 'none'
      || popoverVisualContract.outerWidth !== 16
      || !within(popoverVisualContract.outerHeight, popoverVisualContract.expectedOuterHeight)
      || !within(popoverVisualContract.innerWidth, popoverVisualContract.expectedInnerWidth)
      || !within(popoverVisualContract.innerHeight, popoverVisualContract.expectedInnerHeight)
      || popoverVisualContract.clipPath === 'none'
      || popoverVisualContract.rotated
      || popoverVisualContract.panelContent !== 'none'
    ) {
      failures.push(`Popover: Arrow deve usar geometria triangular 16×9 sem base horizontal (${JSON.stringify(popoverVisualContract)})`);
    }
    if (
      popoverVisualContract.closeWidth !== 24
      || popoverVisualContract.closeHeight !== 24
      || !within(popoverVisualContract.closeTop, popoverVisualContract.expectedCloseTop)
      || !within(popoverVisualContract.closeRight, popoverVisualContract.expectedCloseRight)
    ) {
      failures.push(`Popover: close deve alinhar ao content box do panel como no Figma (${JSON.stringify(popoverVisualContract)})`);
    }
    await page.keyboard.press('Escape');
    if (await popoverPanel.getAttribute('hidden') === null) failures.push('Popover: Escape não fechou o panel');
  }

  await story('Components/Popover', 'Posicoes');
  const placementRoots = page.locator('.ds-popover');
  if (await placementRoots.count() !== 4) {
    failures.push('Popover: matriz de posições deve expor quatro exemplos');
  } else {
    for (const [index, placement] of ['bottom', 'top', 'left', 'right'].entries()) {
      const placementRoot = placementRoots.nth(index);
      const preferredArrowPositioned = await placementRoot.evaluate((root, expectedPlacement) => {
        const arrow = getComputedStyle(root, '::before');
        const insetProperties = expectedPlacement === 'bottom'
          ? [arrow.top, arrow.left]
          : expectedPlacement === 'top'
            ? [arrow.bottom, arrow.left]
            : expectedPlacement === 'left'
              ? [arrow.right, arrow.top]
              : [arrow.left, arrow.top];
        return root.classList.contains(`ds-popover--${expectedPlacement}`)
          && insetProperties.every((value) => value !== 'auto');
      }, placement);
      await placementRoot.locator('.ds-popover__trigger').click();
      const resolvedArrowVisible = await placementRoot.evaluate((root) => {
        const arrow = getComputedStyle(root, '::before');
        const resolvedPlacement = root.dataset.dsPopoverPlacement;
        const insetProperties = resolvedPlacement === 'bottom'
          ? [arrow.top, arrow.left]
          : resolvedPlacement === 'top'
            ? [arrow.bottom, arrow.left]
            : resolvedPlacement === 'left'
              ? [arrow.right, arrow.top]
              : [arrow.left, arrow.top];
        return arrow.content !== 'none'
          && insetProperties.every((value) => value !== 'auto');
      });
      if (!preferredArrowPositioned || !resolvedArrowVisible) {
        failures.push(`Popover: Arrow não ficou visível e ancorada para a preferência ${placement}`);
      }
    }
  }

  const popoverDocs = docs.find((item) => item.title === 'Components/Popover');
  if (!popoverDocs) {
    failures.push('Popover: documentação não encontrada no índice do Storybook');
  } else {
    await page.setViewportSize({ width: 1280, height: 800 });
    await visit(popoverDocs, 'docs');
    await page.waitForFunction(() => {
      const popovers = [...document.querySelectorAll('.ds-popover')]
        .filter((root) => !root.closest('[inert]'));
      return popovers.length > 0
        && popovers.every((root) => root.dataset.dsPopoverInit === 'true');
    });
    await page.evaluate(() => new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    }));
    const docsPopover = page.locator('.ds-popover').first();
    const docsTrigger = docsPopover.locator('.ds-popover__trigger');
    const docsPanel = docsPopover.locator('.ds-popover__panel');
    if (await docsPopover.count() !== 1 || await docsPanel.getAttribute('hidden') === null) {
      failures.push('Popover: primeiro exemplo de Docs deve iniciar fechado e interativo');
    } else {
      if (await docsPopover.getAttribute('data-ds-popover-init') !== 'true') {
        failures.push('Popover: runtime não inicializou o exemplo dentro de #storybook-docs');
      }
      await docsTrigger.click();
      if (await docsTrigger.getAttribute('aria-expanded') !== 'true' || await docsPanel.getAttribute('hidden') !== null) {
        failures.push('Popover: exemplo dentro de #storybook-docs não abriu ao clicar');
      }
      const docsVisualContract = await docsPopover.evaluate((root) => {
        const panel = root.querySelector('.ds-popover__panel');
        const close = root.querySelector('.ds-popover__close');
        const panelRect = panel.getBoundingClientRect();
        const closeRect = close.getBoundingClientRect();
        const outerArrow = getComputedStyle(root, '::before');
        const innerArrow = getComputedStyle(root, '::after');
        return {
          outerWidth: Number.parseFloat(outerArrow.width),
          outerHeight: Number.parseFloat(outerArrow.height),
          innerWidth: Number.parseFloat(innerArrow.width),
          innerHeight: Number.parseFloat(innerArrow.height),
          closeWidth: closeRect.width,
          closeHeight: closeRect.height,
          closeTop: closeRect.top - panelRect.top,
          closeRight: panelRect.right - closeRect.right,
        };
      });
      const storyVisualContract = popoverVisualContract && {
        outerWidth: popoverVisualContract.outerWidth,
        outerHeight: popoverVisualContract.outerHeight,
        innerWidth: popoverVisualContract.innerWidth,
        innerHeight: popoverVisualContract.innerHeight,
        closeWidth: popoverVisualContract.closeWidth,
        closeHeight: popoverVisualContract.closeHeight,
        closeTop: popoverVisualContract.closeTop,
        closeRight: popoverVisualContract.closeRight,
      };
      if (JSON.stringify(docsVisualContract) !== JSON.stringify(storyVisualContract)) {
        failures.push(`Popover: Storybook Docs divergiu do Playground (${JSON.stringify({ storyVisualContract, docsVisualContract })})`);
      }
    }
  }

  await story('Components/Tabs', 'Playground');
  const secondTab = page.locator('[role="tab"]').nth(1);
  await secondTab.click();
  if (await secondTab.getAttribute('aria-selected') !== 'true') failures.push('Tabs: seleção não sincronizou tab e painel');

  await story('Components/Tooltip', 'Playground');
  await page.locator('.ds-tooltip[data-ds-tooltip-init="true"]').waitFor();
  const tooltipTrigger = page.locator('.ds-tooltip button');
  await tooltipTrigger.focus();
  if (await page.locator('.ds-tooltip__content').getAttribute('hidden') !== null) failures.push('Tooltip: focus não abriu conteúdo');
  await page.keyboard.press('Escape');
  if (await page.locator('.ds-tooltip__content').getAttribute('hidden') === null) failures.push('Tooltip: Escape não fechou conteúdo');
} catch (error) {
  failures.push(`runtime Storybook: ${error.message}`);
}

await browser.close();
if (server) await new Promise((resolve) => server.close(resolve));

if (failures.length) {
  console.error(`❌ Storybook browser: ${failures.length} falha(s)`);
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(`✅ Storybook browser: ${stories.length} stories em desktop/mobile, ${docs.length} Docs dark, axe critical/serious zero e 7 runtimes funcionais.`);
