#!/usr/bin/env node

import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { ARK_ADAPTERS_BY_SLUG } from './lib/technology-implementations.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE = path.join(ROOT, '_site');
const failures = [];
const browserErrors = [];

if (!existsSync(path.join(SITE, 'next', 'pt-br', 'web', 'components', 'button', 'index.html'))) {
  console.error('Portal vNext ausente em _site/next. Rode npm run build:preview:vnext.');
  process.exit(2);
}

const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/ds-tis' || pathname === '/ds-tis/') pathname = '/';
  else pathname = pathname.replace(/^\/ds-tis\//, '/');

  let file = path.resolve(SITE, pathname.replace(/^\/+/, ''));
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!file.startsWith(`${SITE}${path.sep}`) || !existsSync(file) || !statSync(file).isFile()) {
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

const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const context = await browser.newContext({ colorScheme: 'light' });
const page = await context.newPage();

page.on('pageerror', (error) => browserErrors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) {
    browserErrors.push(`console.error: ${message.text()}`);
  }
});
page.on('response', (response) => {
  if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) {
    browserErrors.push(`http ${response.status()}: ${response.url()}`);
  }
});

try {
  await auditPortalRootRedirect();

  await auditDocsPage('/ds-tis/next/pt-br/web/components/button/', {
    technology: 'HTML/CSS/JS',
    locale: 'pt',
  });
  await auditDocsPage('/ds-tis/next/en/web/components/button/', {
    technology: 'HTML/CSS/JS',
    locale: 'en',
  });

  await auditComponentResourcesAndTechnologySwitch();

  await auditPortalLanding('/ds-tis/next/pt-br/', 'pt');
  await auditPortalLanding('/ds-tis/next/en/', 'en');
  await auditCanonicalCatalog('/ds-tis/next/pt-br/components/', 'pt');
  await auditCanonicalCatalog('/ds-tis/next/en/components/', 'en');
  await auditIntegrationPage('/ds-tis/next/pt-br/web/', 'Web CSS');
  await auditIntegrationPage('/ds-tis/next/pt-br/react/', 'React');
  await auditIntegrationPage('/ds-tis/next/en/web/', 'Web CSS');
  await auditIntegrationPage('/ds-tis/next/en/react/', 'React');
  await auditReactCatalog('/ds-tis/next/pt-br/react/components/', 'pt');
  await auditReactCatalog('/ds-tis/next/en/react/components/', 'en');
  await auditRegistryRedirect('/ds-tis/next/pt-br/react/registry/', '/ds-tis/next/pt-br/react/');
  await auditRegistryRedirect('/ds-tis/next/en/react/registry/', '/ds-tis/next/en/react/');
  await auditReactComponentPage('/ds-tis/next/pt-br/react/components/button/', {
    item: '@tis/button',
    locale: 'pt',
    name: 'Button',
    richGuidance: true,
    technologyLinks: 3,
  });
  await auditReactComponentPage('/ds-tis/next/pt-br/react/components/alert/', {
    item: '@tis/alert',
    locale: 'pt',
    name: 'Alert',
    richGuidance: true,
    structuredUsage: true,
  });
  await auditReactComponentPage('/ds-tis/next/en/react/components/modal/', {
    item: '@tis/dialog',
    locale: 'en',
    name: 'Modal',
    richGuidance: true,
    structuredUsage: true,
  });
  await auditReactComponentPage('/ds-tis/next/pt-br/react/components/toggle/', {
    item: '@tis/switch',
    locale: 'pt',
    name: 'Toggle',
    richGuidance: true,
    structuredUsage: true,
  });
  await auditReactComponentPage('/ds-tis/next/pt-br/react/components/popover/', {
    item: '@tis/popover',
    locale: 'pt',
    name: 'Popover',
    richGuidance: true,
    technologyLinks: 3,
  });
  await auditReactComponentPage('/ds-tis/next/pt-br/react/components/tooltip/', {
    item: '@tis/tooltip',
    locale: 'pt',
    name: 'Tooltip',
    richGuidance: true,
    technologyLinks: 3,
  });
  await auditReactComponentPage('/ds-tis/next/pt-br/react/components/tabs/', {
    item: '@tis/tabs',
    locale: 'pt',
    name: 'Tabs',
    richGuidance: true,
    technologyLinks: 3,
  });
  await auditReactComponentPage('/ds-tis/next/pt-br/react/components/toast/', {
    item: '@tis/toast',
    locale: 'pt',
    name: 'Toast',
    richGuidance: true,
    structuredUsage: true,
    technologyLinks: 4,
  });
  await auditReactComponentPage('/ds-tis/next/pt-br/react/components/checkbox/', {
    item: '@tis/checkbox',
    locale: 'pt',
    name: 'Checkbox',
    richGuidance: true,
    structuredUsage: true,
    technologyLinks: 3,
  });
  await auditReactComponentPage('/ds-tis/next/pt-br/react/components/radio/', {
    item: '@tis/radio-group',
    locale: 'pt',
    name: 'Radio',
    richGuidance: true,
    structuredUsage: true,
    technologyLinks: 3,
  });
  await auditAccordionOutputSelector();
  await auditButtonOutputSelector();
  await auditAlertOutputSelector();
  await auditBadgeOutputSelector();
  await auditCardOutputSelector();
  await auditDividerOutputSelector();
  await auditModalOutputSelector();
  await auditPopoverOutputSelector();
  await auditComboboxOutputSelector();
  await auditSelectOutputSelector();
  await auditMenuOutputSelector();
  await auditTooltipOutputSelector();
  await auditTabsOutputSelector();
  await auditToastOutputSelector();
  await auditCheckboxOutputSelector();
  await auditRadioOutputSelector();
  await auditToggleOutputSelector();
  await auditFormControlGuidance();

  await auditResponsiveButton(390, 844);
  await auditResponsiveButton(320, 720);
  await auditResponsiveButton(600, 800);

  await auditStorybookComponents();

  if (browserErrors.length) failures.push(...browserErrors);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

if (failures.length) {
  console.error('\n❌ Browser vNext falhou:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('✅ Browser vNext: portal, Storybook por componente, Docs, Controls, 320/390, Base UI, dark mode e Axe válidos.');

async function auditDocsPage(route, options) {
  browserErrors.length = 0;
  const { technology, locale } = options;

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.locator('main h1').first().waitFor();
  await assertPageHead(route);
  expect(await page.evaluate(() => window.scrollY) <= 1, `${route}: página abriu fora do topo`);

  expect(
    (await page.locator('main h1').first().textContent())?.trim() === 'Button',
    `${route}: PageTitle padrão do Starlight não identificou Button`,
  );
  expect(
    await page.locator(
      '[data-component-page-heading], .ds-component-status, .ds-component-heading__actions, .sl-badge, .ds-doc-context__label, .ds-component-tabs__label',
    ).count() === 0,
    `${route}: selo, label ou chrome visual rejeitado ainda presente`,
  );
  expect(
    await page.locator('nav[aria-label="Contexto da documentação"], nav[aria-label="Documentation context"]').count() === 1,
    `${route}: contexto da documentação ausente`,
  );
  expect(await page.locator('#ds-doc-version').count() === 0, `${route}: seletor de versão redundante não deveria existir`);

  const activeTechnology = await page.locator('[data-technology-select] option:checked').textContent();
  expect(activeTechnology?.trim() === technology, `${route}: tecnologia ativa incorreta`);
  expect(
    await page.locator('[data-technology-select] option').count() === 4,
    `${route}: seletor deve expor as quatro implementações`,
  );
  expect(
    await page.getByText(locale === 'en' ? 'Implementation' : 'Implementação', { exact: true }).count() >= 1,
    `${route}: seletor de implementação não tem label visível`,
  );
  const technologyNavStyle = await page.locator('.ds-doc-context').evaluate((nav) => {
    const navStyle = getComputedStyle(nav);
    return {
      hasContainerBorder:
        navStyle.borderTopWidth !== '0px' || navStyle.borderBottomWidth !== '0px',
    };
  });
  expect(
    !technologyNavStyle.hasContainerBorder,
    `${route}: seletor de implementação voltou a simular um tablist concorrente`,
  );
  await auditRejectedConcepts(route);

  expect(await page.locator('.ds-section-nav').count() === 0, `${route}: SectionNav duplicado ainda presente`);
  expect(
    await page.locator('.right-sidebar-panel starlight-toc').count() === 0,
    `${route}: ToC global duplicado ainda presente`,
  );

  const layout = page.locator('[data-component-layout]');
  expect(await layout.count() === 1, `${route}: ComponentPageLayout ausente`);
  const mainTabs = layout.locator('[data-component-tab]');
  expect(await mainTabs.count() === 4, `${route}: deve haver quatro tabs principais`);
  await auditPrimaryTabAlignment(route);
  await auditEditorialTabParity(route);
  expect(
    await layout.locator('[data-component-panel]').count() === 4,
    `${route}: deve haver quatro painéis principais`,
  );
  expect(
    (await layout.locator('[data-component-tab="design"]').getAttribute('aria-selected')) === 'true',
    `${route}: Design deveria iniciar selecionado`,
  );
  expect(
    await layout.locator('[data-component-panel="design"]').isVisible(),
    `${route}: painel Design deveria iniciar visível`,
  );
  expect(
    !(await layout.locator('[data-component-panel="usage"]').isVisible()),
    `${route}: painel Uso deveria iniciar oculto`,
  );

  const expectedGuidanceCount = 4;
  expect(
    await page.locator('.ds-source-guidance').count() === expectedGuidanceCount,
    `${route}: conteúdo compartilhado deve ter ${expectedGuidanceCount} tópicos`,
  );
  expect(
    await page.locator('.ds-source-guidance[data-source-path="docs/button.html"]').count() === expectedGuidanceCount,
    `${route}: conteúdo compartilhado não declara a origem HTML`,
  );
  expect(
    await page.locator('.ds-source-guidance[data-component-topic="design"] .ds-button').count() >= 6,
    `${route}: estilos reais do Button não foram renderizados`,
  );
  expect(
    await page.locator('[data-component-panel="design"] .ds-source-guidance[data-component-topic="design"]').count() === 1,
    `${route}: referência de design deveria estar visível sem um disclosure intermediário`,
  );
  const outputPreview = page.locator('[data-output-preview]');
  expect(await outputPreview.count() === 1, `${route}: preview funcional ausente`);
  await page.waitForFunction(() => Boolean(document.querySelector('[data-output-preview]')?.getAttribute('src')));
  await page.waitForFunction(() => document.querySelector('[data-output-preview-shell]')?.getAttribute('aria-busy') === 'false');
  expect(await page.evaluate(() => window.scrollY) <= 1, `${route}: preview exigiu scroll para carregar`);
  expect(
    await page.locator('.ds-source-guidance .ds-preview__tabs, .ds-source-guidance .ds-preview__code').count() === 0,
    `${route}: controles do chrome legado foram preservados`,
  );
  const relatedLinks = page.locator('.ds-source-guidance .ds-related__link');
  expect(await relatedLinks.count() > 0, `${route}: links de componentes relacionados ausentes`);
  expect(
    await relatedLinks.evaluateAll((links) =>
      links.every((link) => link.getAttribute('href')?.startsWith('/ds-tis/docs/'))
    ),
    `${route}: links relacionados não foram reescritos para /ds-tis/docs/`,
  );

  await page.waitForFunction(() => document.querySelectorAll('i[data-lucide]').length === 0);
  expect(await page.locator('svg[data-lucide]').count() > 0, `${route}: ícones Lucide não foram renderizados`);
  expect(
    await page.locator('i[data-lucide]').count() === 0,
    `${route}: placeholder <i data-lucide> vazio permaneceu no DOM`,
  );

  const previewCanvases = page.locator(
    '.ds-source-guidance .ds-preview__canvas, .ds-source-guidance .ds-dodont__preview',
  );
  expect(await previewCanvases.count() > 0, `${route}: previews de Button ausentes`);
  expect(
    await previewCanvases.evaluateAll((elements) => elements.every((element) => element.hasAttribute('inert'))),
    `${route}: todos os previews de exemplo devem ser inertes`,
  );
  const previewChildren = page.locator(
    '.ds-source-guidance :is(.ds-preview__canvas, .ds-dodont__preview, .ds-anatomy, .ds-related) > *',
  );
  expect(
    await previewChildren.evaluateAll((elements) =>
      elements.every((element) => {
        const style = getComputedStyle(element);
        return style.marginTop === '0px' && style.marginBottom === '0px';
      })
    ),
    `${route}: rhythm do Starlight vazou margens verticais para dentro dos canvases`,
  );
  const styleButtons = page.locator(
    '.ds-source-guidance[data-component-topic="design"] .ds-preview__canvas',
  ).first().locator(':scope > .ds-button');
  const styleButtonRows = await styleButtons.evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { height: rect.height, y: rect.y };
    })
  );
  const mediumButtonY = styleButtonRows
    .filter((button) => Math.abs(button.height - 40) <= 0.5)
    .map((button) => button.y);
  expect(
    mediumButtonY.length >= 2 &&
      Math.max(...mediumButtonY) - Math.min(...mediumButtonY) <= 0.5,
    `${route}: botões de mesma altura não estão alinhados no canvas de estilos`,
  );
  const doDontPreviews = page.locator('.ds-source-guidance .ds-dodont__preview');
  expect(await doDontPreviews.count() > 0, `${route}: demos Do/Don't ausentes`);
  expect(
    await doDontPreviews.evaluateAll((elements) => elements.every((element) => element.hasAttribute('inert'))),
    `${route}: demos Do/Don't devem ser inertes`,
  );
  expect(
    await page.locator('.ds-source-guidance button, .ds-source-guidance input, .ds-source-guidance select, .ds-source-guidance textarea').evaluateAll(
      (elements) => elements.every((element) => Boolean(element.closest('[inert]'))),
    ),
    `${route}: há controle de exemplo focável fora de uma região inerte`,
  );

  const expectedGuidance = locale === 'en' ? 'Use buttons when' : 'Use botões quando';
  expect(
    await page.getByText(expectedGuidance, { exact: true }).count() === 1,
    `${route}: conteúdo compartilhado não respeitou o locale`,
  );
  expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em desktop`);

  const panelToc = page.locator('[data-panel-toc]');
  expect(
    await panelToc.locator('a').count() >= 3 && await panelToc.isVisible(),
    `${route}: menu interno do painel Design ausente`,
  );

  const usageTab = layout.locator('[data-component-tab="usage"]');
  await usageTab.click();
  expect((await usageTab.getAttribute('aria-selected')) === 'true', `${route}: tab Uso não foi ativada`);
  expect(
    await layout.locator('[data-component-panel="usage"]').isVisible(),
    `${route}: painel Uso não ficou visível`,
  );
  expect(new URL(page.url()).hash === '#usage', `${route}: ativação por clique não atualizou o hash`);

  await usageTab.focus();
  await page.keyboard.press('ArrowRight');
  const implementationTab = layout.locator('[data-component-tab="implementation"]');
  expect(
    (await implementationTab.getAttribute('aria-selected')) === 'true',
    `${route}: ArrowRight não ativou Implementação/Disponibilidade`,
  );
  expect(
    await implementationTab.evaluate((element) => element === document.activeElement),
    `${route}: ArrowRight não moveu o foco`,
  );
  expect(
    await layout.locator('[data-component-panel="implementation"]').isVisible(),
    `${route}: painel de implementação não ficou visível`,
  );

  const packageTabs = layout.locator('[data-component-panel="implementation"] starlight-tabs');
  expect(await packageTabs.count() === 1, `${route}: tabs de package manager ausentes`);
  await auditPackageTabParity(route);
  const pnpmTab = packageTabs.getByRole('tab', { name: 'pnpm' });
  await pnpmTab.click();
  expect((await pnpmTab.getAttribute('aria-selected')) === 'true', `${route}: tab pnpm não foi ativada`);
  expect(
    await layout.locator('[data-component-topic="code"]').count() === 1,
    `${route}: referência de classes CSS ausente`,
  );

  await page.goto(`${origin}${route}#accessibility`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() =>
    document.querySelector('[data-component-tab="accessibility"]')?.getAttribute('aria-selected') === 'true'
  );
  expect(
    await layout.locator('[data-component-panel="accessibility"]').isVisible(),
    `${route}: deep link #accessibility não ativou o painel`,
  );

  const themeSelect = page.locator('starlight-theme-select select').first();
  await themeSelect.selectOption('dark');
  await page.waitForFunction(() => document.documentElement.dataset.mode === 'dark');
  await themeSelect.selectOption('light');
  await page.waitForFunction(() => document.documentElement.dataset.mode === 'light');

  await auditAxe(route);
  recordBrowserErrors(route);
}

async function auditComponentResourcesAndTechnologySwitch() {
  const route = '/ds-tis/next/pt-br/web/components/button/';
  browserErrors.length = 0;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });

  await activatePanel('accessibility');
  const stableLink = page.getByRole('link', { name: 'Abrir referência estável' });
  const stableHref = await stableLink.getAttribute('href');
  const stableUrl = new URL(stableHref, page.url());
  expect(stableUrl.pathname === '/ds-tis/docs/button.html', 'link de documentação estável aponta para destino incorreto');
  const stableResponse = await context.request.get(stableUrl.toString());
  expect(stableResponse.ok(), `documentação estável respondeu ${stableResponse.status()}`);

  await activatePanel('design');
  const storybookHref = await page.getByRole('link', { name: 'Abrir playground HTML/CSS/JS' }).getAttribute('href');
  expect(
    storybookHref?.includes('components-button--playground'),
    'link Storybook não usa o playground real de Button',
  );

  await page.locator('[data-technology-select]').selectOption({ label: 'React · shadcn/Base UI' });
  await page.waitForURL('**/pt-br/react/components/button/');
  expect(await page.evaluate(() => window.scrollY) <= 1, 'troca de implementação preservou scroll residual');
  expect(
    (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === 'React · shadcn/Base UI',
    'seletor de tecnologia não abriu Button React',
  );
  recordBrowserErrors('recursos e troca de tecnologia');
}

async function auditPortalLanding(route, locale) {
  browserErrors.length = 0;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  await page.locator('h1').first().waitFor();
  await assertPageHead(route);

  expect(
    await page.locator('.ds-doc-context, [data-technology-select], #ds-doc-version').count() === 0,
    `${route}: landing Starlight não deve exigir contexto/version selector`,
  );
  expect(
    await page.locator('a[href*="introduction.html"], a[href*="docs/components.html"]').count() === 0,
    `${route}: landing contém link legado inexistente`,
  );

  const catalogLink = page.locator('main a[href$="/components/"]');
  expect(await catalogLink.count() === 1, `${route}: entrada única do catálogo ausente`);
  const catalogHref = await catalogLink.getAttribute('href');
  const catalogResponse = await context.request.get(new URL(catalogHref, page.url()).toString());
  expect(catalogResponse.ok(), `${route}: catálogo respondeu ${catalogResponse.status()}`);

  expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em desktop`);
  await auditRejectedConcepts(route);

  await auditAxe(route);
  recordBrowserErrors(route);
}

async function auditIntegrationPage(route, expectedTechnology) {
  browserErrors.length = 0;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  await page.locator('h1').first().waitFor();
  await assertPageHead(route);

  expect(
    (await page.locator('main h1').first().textContent())?.includes(expectedTechnology),
    `${route}: título da integração ${expectedTechnology} ausente`,
  );
  expect(
    await page.locator('.ds-doc-context, [data-technology-select]').count() === 0,
    `${route}: integração não deve repetir o seletor de tecnologia`,
  );
  expect(await page.locator('#ds-doc-version').count() === 0, `${route}: version selector antigo ainda presente`);
  expect(await page.locator('.ds-section-nav').count() === 0, `${route}: SectionNav paralelo não deveria existir`);
  expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em desktop`);
  expect(
    await page.locator('.ds-storybook-embed, [data-storybook-embed]').count() === 0,
    `${route}: portal não deve embutir Storybook internamente`,
  );
  await auditRejectedConcepts(route);

  await auditAxe(route);
  recordBrowserErrors(route);
}

async function auditCanonicalCatalog(route, locale) {
  browserErrors.length = 0;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  await page.locator('h1').first().waitFor();
  await assertPageHead(route);

  const catalog = page.locator('[data-component-catalog]');
  expect(await catalog.count() === 1, `${route}: catálogo canônico ausente`);
  expect((await catalog.getAttribute('data-component-count')) === '26', `${route}: catálogo deve declarar 26 componentes`);
  expect(await catalog.locator('[data-component-category]').count() === 6, `${route}: categorias canônicas incorretas`);
  expect(await catalog.locator('.ds-component-catalog__item').count() === 26, `${route}: catálogo deve listar 26 componentes`);

  for (const group of await catalog.locator('[data-component-category]').all()) {
    const names = await group.locator('.ds-component-catalog__name').allTextContents();
    const sorted = [...names].sort(
      new Intl.Collator(locale === 'en' ? 'en' : 'pt', { sensitivity: 'base' }).compare,
    );
    expect(JSON.stringify(names) === JSON.stringify(sorted), `${route}: grupo fora da ordem alfabética`);
  }

  const outputRows = catalog.locator('.ds-component-catalog__outputs');
  expect(await outputRows.count() === 26, `${route}: matriz de implementações incompleta`);
  expect(
    await outputRows.evaluateAll((rows) => rows.every((row) => {
      const outputs = [...row.querySelectorAll(':scope > li')].map((item) => item.getAttribute('data-output'));
      return JSON.stringify(outputs) === JSON.stringify(['web', 'ark', 'react', 'angular']);
    })),
    `${route}: cada componente deve mostrar Web, Ark/Zag, React e Angular nessa ordem`,
  );
  expect(await catalog.locator('[data-output="web"]').count() === 26, `${route}: saída Web ausente`);
  expect(await catalog.locator('[data-output="ark"]').count() === 26, `${route}: saída Ark/Zag ausente`);
  expect(await catalog.locator('[data-output="react"]').count() === 26, `${route}: saída React ausente`);
  expect(await catalog.locator('[data-output="angular"]').count() === 26, `${route}: saída Angular ausente`);
  expect(
    await catalog.locator('[data-output="ark"][data-availability="available"]').count() === Object.keys(ARK_ADAPTERS_BY_SLUG).length,
    `${route}: os adapters Ark disponíveis deveriam aparecer como links`,
  );
  expect(
    await outputRows.evaluateAll((rows) => rows.every((row) => [...row.querySelectorAll(':scope > li')].every((item) => {
      const status = item.querySelector('[data-status]')?.getAttribute('data-status');
      const available = item.getAttribute('data-availability') === 'available';
      const hasLink = item.querySelector(':scope > a') !== null;
      const hasInactiveLabel = item.querySelector(':scope > .ds-component-catalog__output--inactive') !== null;
      return status && (available ? hasLink && !hasInactiveLabel : !hasLink && hasInactiveLabel);
    }))),
    `${route}: disponibilidade visual e navegabilidade das implementações divergiram`,
  );
  expect(
    await catalog.locator('[data-status="planned"], [data-status="unavailable"]').count() > 0,
    `${route}: catálogo deve explicitar saídas planejadas ou indisponíveis`,
  );
  expect(
    await catalog.locator('a.ds-component-catalog__name').count() === 0,
    `${route}: nome do componente não deve escolher implicitamente a saída Web`,
  );
  expect(
    await catalog.locator('[data-availability="unavailable"] a').count() === 0,
    `${route}: saída não utilizável não deve oferecer navegação`,
  );
  expect(
    await catalog.locator('[data-output="web"] .ds-component-catalog__output > span').evaluateAll((labels) => labels.every((label) => {
      const style = getComputedStyle(label);
      return label.textContent?.trim() === 'HTML/CSS/JS' &&
        style.textOverflow !== 'ellipsis' && label.scrollWidth <= label.clientWidth + 1;
    })),
    `${route}: label HTML/CSS/JS foi truncado no catálogo`,
  );

  const buttonItem = catalog.locator('.ds-component-catalog__item').filter({
    has: page.locator('.ds-component-catalog__name', { hasText: /^Button$/ }),
  });
  const buttonLinks = buttonItem.locator('a');
  expect(await buttonLinks.count() === 4, `${route}: Button deve ligar as quatro implementações disponíveis`);
  expect(await buttonItem.locator('[data-output="ark"]').count() === 1, `${route}: Button deve oferecer o adapter Ark disponível`);
  const inputItem = catalog.locator('.ds-component-catalog__item').filter({
    has: page.locator('.ds-component-catalog__name', { hasText: /^Input Text$/ }),
  });
  expect(await inputItem.locator('a').count() === 4, `${route}: Input Text deve ligar as quatro implementações disponíveis`);
  expect(await inputItem.locator('[data-output="ark"]').count() === 1, `${route}: Input Text deve oferecer o adapter Ark disponível`);
  const badgeItem = catalog.locator('.ds-component-catalog__item').filter({
    has: page.locator('.ds-component-catalog__name', { hasText: /^Badge$/ }),
  });
  expect(await badgeItem.locator('a').count() === 3, `${route}: Badge deve ligar Web, React e Angular`);
  expect(await badgeItem.locator('[data-output="ark"]').count() === 1, `${route}: Badge deve exibir a saída Ark planejada`);
  expect(await badgeItem.locator('[data-output="ark"] a').count() === 0, `${route}: Badge não deve ligar a saída Ark ainda planejada`);
  const alertItem = catalog.locator('.ds-component-catalog__item').filter({
    has: page.locator('.ds-component-catalog__name', { hasText: /^Alert$/ }),
  });
  expect(await alertItem.locator('a').count() === 3, `${route}: Alert deve ligar Web, React e Angular`);
  expect(
    (await alertItem.locator('[data-output="web"] a').getAttribute('href'))?.includes(`/next/${locale === 'en' ? 'en' : 'pt-br'}/web/components/alert/`),
    `${route}: Alert Web caiu na documentação HTML antiga`,
  );
  expect(await alertItem.locator('[data-output="ark"] a').count() === 0, `${route}: Alert não deve ligar a saída Ark ainda planejada`);
  const accordionLinks = catalog.locator('.ds-component-catalog__item').filter({ hasText: 'Accordion' }).locator('a');
  expect(await accordionLinks.count() === 4, `${route}: Accordion deve ligar as quatro implementações disponíveis`);
  const popoverLinks = catalog.locator('.ds-component-catalog__item').filter({ hasText: 'Popover' }).locator('a');
  expect(await popoverLinks.count() === 4, `${route}: Popover deve ligar as quatro implementações disponíveis`);
  const menuLinks = catalog.locator('.ds-component-catalog__item').filter({ hasText: 'Menu' }).locator('a');
  expect(await menuLinks.count() === 4, `${route}: Menu deve ligar as quatro implementações disponíveis`);
  const tooltipLinks = catalog.locator('.ds-component-catalog__item').filter({ hasText: 'Tooltip' }).locator('a');
  expect(await tooltipLinks.count() === 4, `${route}: Tooltip deve ligar as quatro implementações disponíveis`);
  const tabsLinks = catalog.locator('.ds-component-catalog__item').filter({ hasText: 'Tabs' }).locator('a');
  expect(await tabsLinks.count() === 4, `${route}: Tabs deve ligar as quatro implementações disponíveis`);
  const toastLinks = catalog.locator('.ds-component-catalog__item').filter({ hasText: 'Toast' }).locator('a');
  expect(await toastLinks.count() === 4, `${route}: Toast deve ligar as quatro implementações disponíveis`);
  const tableItem = catalog.locator('.ds-component-catalog__item').filter({
    has: page.locator('.ds-component-catalog__name', { hasText: /^Table$/ }),
  });
  expect(await tableItem.locator('[data-output]').count() === 4, `${route}: Table deve mostrar as quatro implementações`);
  expect(await tableItem.locator('a').count() === 1, `${route}: Table deve ligar somente a implementação Web disponível`);
  expect(await tableItem.locator('[data-availability="unavailable"]').count() === 3, `${route}: Table deve identificar três implementações não disponíveis`);
  expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);
  await auditAxe(route);
  recordBrowserErrors(route);
}

async function auditRegistryRedirect(route, expectedPath) {
  browserErrors.length = 0;
  const response = await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  expect(response?.ok(), `${route}: redirect legado do registry respondeu ${response?.status()}`);
  await page.waitForURL((url) => url.pathname === expectedPath);
  expect(new URL(page.url()).pathname === expectedPath, `${route}: redirect não aponta para a integração React`);
  recordBrowserErrors(route);
}

async function auditReactCatalog(route, locale) {
  browserErrors.length = 0;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  await page.locator('h1').first().waitFor();
  await assertPageHead(route);

  const catalog = page.locator('[data-component-catalog]');
  expect(await catalog.count() === 1, `${route}: catálogo semântico ausente`);
  expect(
    (await catalog.getAttribute('data-component-count')) === '22',
    `${route}: contagem declarada do catálogo deve ser vinte e dois`,
  );
  const groups = catalog.locator('[data-component-category]');
  expect(await groups.count() === 6, `${route}: catálogo deve expor seis categorias semânticas`);

  const items = catalog.locator('.ds-component-catalog__group li');
  expect(await items.count() === 22, `${route}: catálogo consolidado deve listar vinte e dois componentes`);
  for (const group of await groups.all()) {
    const names = await group.locator('.ds-component-catalog__name').allTextContents();
    const expectedNames = [...names].sort(
      new Intl.Collator(locale === 'en' ? 'en' : 'pt', { sensitivity: 'base' }).compare,
    );
    expect(names.length > 0, `${route}: categoria sem componentes`);
    expect(
      JSON.stringify(names) === JSON.stringify(expectedNames),
      `${route}: componentes de cada categoria devem permanecer em ordem alfabética`,
    );
  }

  const hrefs = await catalog.locator('.ds-component-catalog__group a').evaluateAll((links) =>
    links.map((link) => link.href),
  );
  expect(new Set(hrefs).size === 22, `${route}: cada componente deve ter uma página única`);
  for (const href of hrefs) {
    const response = await context.request.get(href);
    expect(response.ok(), `${route}: página de componente respondeu ${response.status()} em ${href}`);
  }

  expect(
    await page.getByText(/pilot|onda|wave/i).count() === 0,
    `${route}: catálogo expõe organização técnica interna`,
  );
  const catalogText = await catalog.innerText();
  expect(
    !/Base UI|React composition|Composição React|Native React|React nativo|React presentation|Apresentação React/i.test(catalogText),
    `${route}: catálogo mistura decisões de provider com a organização do produto`,
  );
  expect(await catalog.locator('code').count() === 0, `${route}: catálogo não deve expor identificadores técnicos`);
  expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);
  await auditAxe(route);
  recordBrowserErrors(route);
}

async function auditReactComponentPage(route, {
  item,
  locale,
  name,
  richGuidance = false,
  structuredUsage = false,
}) {
  browserErrors.length = 0;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  await page.locator('main h1').first().waitFor();
  await assertPageHead(route);

  expect(
    (await page.locator('main h1').first().textContent())?.trim() === name,
    `${route}: título do componente ausente`,
  );
  expect(await page.locator('[data-component-breadcrumb]').count() === 1, `${route}: breadcrumb do componente ausente`);
  expect(
    await page.locator('.ds-component-intro dl > div').count() === (richGuidance ? 0 : 2),
    `${route}: metadados de disponibilidade estão na região editorial incorreta`,
  );
  expect(await page.locator('[data-component-layout]').count() === 1, `${route}: layout consolidado ausente`);
  expect(await page.locator('[data-component-tab]').count() === 4, `${route}: quatro visões editoriais ausentes`);
  expect(
    await page.locator('[data-technology-select] option').count() === 4,
    `${route}: seletor não expõe as quatro saídas`,
  );
  expect(
    (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === 'React · shadcn/Base UI',
    `${route}: React não está ativo no contexto`,
  );
  const isPopover = item === '@tis/popover';
  const isModal = item === '@tis/dialog';
  const previewSelector = isPopover || isModal
    ? '[data-output-example="playground"] [data-output-preview]'
    : '[data-output-preview]';
  expect(
    await page.locator('[data-output-preview]').count() === (isModal ? 3 : isPopover ? 2 : 1),
    `${route}: quantidade de previews do Storybook incorreta`,
  );
  await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
  expect(
    (await page.locator(previewSelector).getAttribute('src'))?.includes('viewMode=story&id='),
    `${route}: iframe não aponta para uma story específica`,
  );
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('[data-output-preview-shell]')).every((shell) =>
      shell.getAttribute('aria-busy') === 'false'
    )
  );
  const designHeadings = await page.locator('[data-component-panel="design"] h3').allTextContents();
  const expectedDesignHeadings = locale === 'en'
    ? ['Functional preview', 'Anatomy', 'Variants and states']
    : ['Preview funcional', 'Anatomia', 'Variantes e estados'];
  if (richGuidance) {
    const requiredHeadings = isPopover
      ? (locale === 'en'
          ? ['Interactive example · React · shadcn/Base UI', 'Additional Content Slot · React · shadcn/Base UI', 'Anatomy']
          : ['Exemplo interativo · React · shadcn/Base UI', 'Content Slot adicional · React · shadcn/Base UI', 'Anatomia'])
      : isModal
        ? (locale === 'en'
            ? ['Interactive example · React · shadcn/Base UI', 'Sizes · React · shadcn/Base UI', 'Custom body · React · shadcn/Base UI', 'Anatomy']
            : ['Exemplo interativo · React · shadcn/Base UI', 'Tamanhos · React · shadcn/Base UI', 'Body customizado · React · shadcn/Base UI', 'Anatomia'])
      : (locale === 'en'
          ? ['Functional preview', 'Anatomy']
          : ['Preview funcional', 'Anatomia']);
    expect(
      requiredHeadings.every((heading) => designHeadings.includes(heading)),
      `${route}: painel Design não preservou preview e referência de design`,
    );
    expect(
      await page.locator('[data-component-panel="design"] .ds-source-guidance[data-component-topic="design"]').count() === (isPopover || isModal ? 2 : 1),
      `${route}: referência rica de design ausente`,
    );
  } else {
    expect(
      JSON.stringify(designHeadings) === JSON.stringify(expectedDesignHeadings),
      `${route}: painel Design não segue o contrato editorial único`,
    );
    expect(
      await page.locator('[data-component-panel="design"] .ds-component-anatomy-list li').count() >= 1,
      `${route}: anatomia do componente ausente`,
    );
  }

  const themeSelect = page.locator('starlight-theme-select select').first();
  await themeSelect.evaluate((select) => {
    select.value = 'dark';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('[data-output-preview]')).every((frame) =>
      frame.getAttribute('src')?.includes('mode%3Adark')
    )
  );
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('[data-output-preview-shell]')).every((shell) =>
      shell.getAttribute('aria-busy') === 'false'
    )
  );
  await themeSelect.evaluate((select) => {
    select.value = 'light';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('[data-output-preview]')).every((frame) =>
      frame.getAttribute('src')?.includes('mode%3Alight')
    )
  );
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('[data-output-preview-shell]')).every((shell) =>
      shell.getAttribute('aria-busy') === 'false'
    )
  );

  await activatePanel('usage');
  const usageHeadings = await page.locator('[data-component-panel="usage"] h3').allTextContents();
  if (richGuidance) {
    if (structuredUsage) {
      const expectedUsageHeadings = locale === 'en'
        ? ['When to use', 'When not to use', 'React composition']
        : ['Quando usar', 'Quando não usar', 'Composição React'];
      expect(
        JSON.stringify(usageHeadings) === JSON.stringify(expectedUsageHeadings) &&
          await page.locator('[data-component-panel="usage"] .ds-source-guidance').count() === 0,
        `${route}: painel Uso não preservou a orientação estruturada e a composição React`,
      );
    } else {
      expect(
        usageHeadings.includes(locale === 'en' ? 'React composition' : 'Composição React') &&
          await page.locator('[data-component-panel="usage"] .ds-source-guidance').count() === 1,
        `${route}: painel Uso não preservou orientação compartilhada e composição React`,
      );
    }
  } else {
    const expectedUsageHeadings = locale === 'en'
      ? ['When to use', 'When not to use', 'React composition']
      : ['Quando usar', 'Quando não usar', 'Composição React'];
    expect(
      JSON.stringify(usageHeadings) === JSON.stringify(expectedUsageHeadings),
      `${route}: painel Uso não segue o contrato editorial único`,
    );
  }
  expect(
    await page.locator('[data-component-panel="usage"] pre').textContent().then((text) => text.includes('@/components/ui/')),
    `${route}: composição React copiável ausente`,
  );
  await activatePanel('implementation');
  const implementationHeadings = await page.locator('[data-component-panel="implementation"] h3').allTextContents();
  const expectedImplementationHeadings = locale === 'en'
    ? ['Installation', 'Public contract']
    : ['Instalação', 'Contrato público'];
  expect(
    JSON.stringify(implementationHeadings) === JSON.stringify(expectedImplementationHeadings),
    `${route}: painel Implementação não segue o contrato editorial único`,
  );
  expect(
    await page.getByText(item, { exact: false }).count() >= 1,
    `${route}: item do registry ${item} ausente`,
  );
  expect(
    await page.locator('[data-component-panel="implementation"] starlight-tabs').count() === 1,
    `${route}: comandos por package manager ausentes`,
  );
  expect(
    await page.locator('[data-component-panel="implementation"] details.ds-component-technical-details').count() === 1,
    `${route}: detalhes de arquitetura devem permanecer recolhidos`,
  );
  await activatePanel('accessibility');
  const accessibilityHeadings = await page.locator('[data-component-panel="accessibility"] h3').allTextContents();
  if (richGuidance) {
    const requiredAccessibilityHeadings = locale === 'en'
      ? ['Output responsibility', 'Validation evidence']
      : ['Responsabilidade da saída', 'Evidência de validação'];
    expect(
      requiredAccessibilityHeadings.every((heading) => accessibilityHeadings.includes(heading)) &&
        await page.locator('[data-component-panel="accessibility"] .ds-source-guidance').count() === 1,
      `${route}: painel Acessibilidade não preservou orientação e responsabilidade da saída`,
    );
  } else {
    const expectedAccessibilityHeadings = locale === 'en'
      ? ['Semantics and behavior', 'Consumer responsibility', 'Validation evidence']
      : ['Semântica e comportamento', 'Responsabilidade do consumidor', 'Evidência de validação'];
    expect(
      JSON.stringify(accessibilityHeadings) === JSON.stringify(expectedAccessibilityHeadings),
      `${route}: painel Acessibilidade não segue o contrato editorial único`,
    );
  }
  expect(
    await page.locator('[data-component-panel="accessibility"] p').count() >= 2,
    `${route}: evidência de acessibilidade ausente`,
  );
  expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);
  await auditAxe(route);
  recordBrowserErrors(route);
}

async function auditAccordionOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/accordion/',
      activeLabel: 'HTML/CSS/JS',
      status: 'Estável',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-accordion--playground',
      guidanceCount: 4,
    },
    {
      route: '/ds-tis/next/pt-br/ark/components/accordion/',
      activeLabel: 'Ark/Zag',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'ark-accordion--playground',
      guidanceCount: 3,
    },
    {
      route: '/ds-tis/next/pt-br/react/components/accordion/',
      activeLabel: 'React · shadcn/Base UI',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-accordion--playground',
      guidanceCount: 3,
    },
  ];

  await page.setViewportSize({ width: 390, height: 844 });
  for (const {
    activeLabel,
    guidanceCount,
    previewSelector,
    route,
    status,
    storyId,
  } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    await assertPageHead(route);

    expect(
      (await page.locator('main h1').first().textContent())?.trim() === 'Accordion',
      `${route}: título Accordion ausente`,
    );
    const options = page.locator('[data-technology-select] option');
    expect(await options.count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    expect(await page.locator('[data-component-breadcrumb]').count() === 1, `${route}: breadcrumb compartilhado ausente`);
    expect(await page.locator('[data-component-intro]').count() === 1, `${route}: introdução compartilhada ausente`);
    const availability = await page.locator('[data-component-panel="implementation"] .ds-react-contract dd').allTextContents();
    expect(availability.includes(status), `${route}: status ${status} ausente`);
    expect(await page.locator('[data-component-tab]').count() === 4, `${route}: quatro visões editoriais ausentes`);
    expect(await page.locator('[data-component-panel]').count() === 4, `${route}: quatro painéis editoriais ausentes`);
    expect(
      await page.locator('.ds-source-guidance[data-source-path="docs/accordion.html"]').count() === guidanceCount,
      `${route}: documentação rica compartilhada deveria expor ${guidanceCount} tópicos`,
    );

    const designText = await page.locator('[data-component-panel="design"]').textContent();
    for (const section of ['Anatomia', 'Padrão', 'Conteúdo customizado', 'API no Figma', 'Mapeamento de tokens']) {
      expect(designText.includes(section), `${route}: seção rica ${section} ausente`);
    }
    const editorialToc = await page.locator('[data-panel-toc-list] a').allTextContents();
    expect(
      !editorialToc.some((label) => label.trim() === 'Team Pro'),
      `${route}: índice editorial incluiu heading interno do componente`,
    );

    if (previewSelector && storyId) {
      const previewElement = page.locator(previewSelector);
      expect(await previewElement.count() === 1, `${route}: preview funcional próprio ausente`);
      await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
      expect(
        (await previewElement.getAttribute('src'))?.includes(storyId),
        `${route}: preview não aponta para ${storyId}`,
      );
      const preview = page.frameLocator(previewSelector);
      const triggers = preview.locator('.ds-accordion__trigger');
      expect(await triggers.count() === 3, `${route}: preview deve expor três triggers`);
      expect(
        (await triggers.nth(2).textContent())?.trim() === 'Configuração bloqueada',
        `${route}: terceiro item divergiu do contrato documental`,
      );
      expect(
        await preview.locator('.ds-accordion__leading-icon').count() === 3,
        `${route}: exemplo comparável deve exibir os três leading icons`,
      );
      if (activeLabel === 'React · shadcn/Base UI') {
        expect(
          await preview.locator('.ds-story-canvas--fluid').count() === 1 &&
            await preview.locator('.ds-story-canvas--narrow').count() === 0,
          `${route}: playground deve permitir que o Accordion responda à largura disponível`,
        );
        expect(
          await triggers.nth(2).getAttribute('aria-disabled') === 'true',
          `${route}: terceiro item deve iniciar desabilitado como na referência estável`,
        );
      } else {
        expect(await triggers.nth(2).isDisabled(), `${route}: terceiro item estável deve iniciar desabilitado`);
      }
      const securityTrigger = preview.getByRole('button', { name: 'Segurança' });
      await securityTrigger.waitFor();
      await securityTrigger.click();
      expect(
        await securityTrigger.getAttribute('aria-expanded') === 'true',
        `${route}: Accordion não abriu o item pelo runtime próprio`,
      );
      if (activeLabel === 'Ark/Zag') {
        expect(
          await triggers.first().getAttribute('data-scope') === 'accordion',
          `${route}: preview não está usando o runtime Ark/Zag`,
        );
        await page.keyboard.press('ArrowUp');
        expect(
          await triggers.first().evaluate((element) => element === document.activeElement),
          `${route}: ArrowUp não moveu foco pelo runtime Ark/Zag`,
        );
        await page.keyboard.press('End');
        expect(
          await triggers.nth(1).evaluate((element) => element === document.activeElement),
          `${route}: End não ignorou o item disabled no runtime Ark/Zag`,
        );
      }
    } else {
      expect(await page.locator('[data-output-preview]').count() === 0, `${route}: saída planejada expôs preview falso`);
      expect(
        await page.getByText('Planejada, ainda não instalável', { exact: true }).count() === 1,
        `${route}: estado planejado não está explícito`,
      );
      await activatePanel('implementation');
      expect(
        await page.getByText('Ainda não existe pacote, adapter, item de registry ou story pública para esta saída.', { exact: true }).count() === 1,
        `${route}: implementação planejada não explicou a indisponibilidade`,
      );
    }

    await activatePanel('usage');
    const usageText = await page.locator('[data-component-panel="usage"]').innerText();
    expect(usageText.includes('Quando usar') && usageText.includes('Boas práticas'), `${route}: uso compartilhado incompleto`);
    await activatePanel('accessibility');
    const accessibilityText = await page.locator('[data-component-panel="accessibility"]').innerText();
    expect(
      accessibilityText.includes('Interação por teclado') && accessibilityText.includes('Evidência de validação'),
      `${route}: acessibilidade compartilhada ou evidência ausente`,
    );
    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);
    await auditAxe(`${route} · Accordion`);
  }

  const reactRoute = '/ds-tis/next/pt-br/react/components/accordion/';
  const arkRoute = '/ds-tis/next/pt-br/ark/components/accordion/';
  await page.goto(`${origin}${reactRoute}`, { waitUntil: 'networkidle' });
  await Promise.all([
    page.waitForURL(`${origin}${arkRoute}`),
    page.locator('[data-technology-select]').selectOption({ label: 'Ark/Zag' }),
  ]);
  expect(
    (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === 'Ark/Zag',
    'Accordion: navegação React → Ark/Zag não preservou a implementação selecionada',
  );
  recordBrowserErrors('Accordion · seletor das quatro saídas');
}

async function auditButtonOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/button/',
      activeLabel: 'HTML/CSS/JS',
      status: 'Estável',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-button--playground',
    },
    {
      route: '/ds-tis/next/pt-br/ark/components/button/',
      activeLabel: 'Ark/Zag',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'ark-button--playground',
    },
    {
      route: '/ds-tis/next/pt-br/react/components/button/',
      activeLabel: 'React · shadcn/Base UI',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-button--playground',
    },
  ];

  await page.setViewportSize({ width: 390, height: 844 });
  for (const { activeLabel, previewSelector, route, status, storyId } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    expect(await page.locator('[data-technology-select] option').count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    expect(
      (await page.locator('[data-component-panel="implementation"] .ds-react-contract dd').allTextContents()).includes(status),
      `${route}: status ${status} ausente`,
    );
    expect(await page.locator('[data-component-panel]').count() === 4, `${route}: quatro painéis editoriais ausentes`);
    expect(
      await page.locator('.ds-source-guidance[data-source-path="docs/button.html"]').count() === (activeLabel === 'HTML/CSS/JS' ? 4 : 3),
      `${route}: documentação compartilhada incompleta`,
    );

    const preview = page.locator(previewSelector);
    expect(await preview.count() === 1, `${route}: preview funcional próprio ausente`);
    await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
    expect((await preview.getAttribute('src'))?.includes(storyId), `${route}: preview não aponta para ${storyId}`);

    const previewFrame = page.frameLocator(previewSelector);
    const button = previewFrame.getByRole('button').first();
    await button.waitFor();
    await button.evaluate((element) => {
      element.dataset.activationCount = '0';
      element.addEventListener('click', () => {
        element.dataset.activationCount = String(Number(element.dataset.activationCount) + 1);
      });
    });
    await button.focus();
    await button.press('Enter');
    await button.press('Space');
    expect((await button.getAttribute('data-activation-count')) === '2', `${route}: Enter e Space não ativaram o Button`);
    expect(
      await button.evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return rect.height === 40 && style.outlineStyle === 'solid' && Number.parseFloat(style.outlineWidth) >= 2;
      }),
      `${route}: geometria ou focus ring do Button divergiu do contrato TIS`,
    );

    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);
    await auditAxe(`${route} · Button`);
  }

  recordBrowserErrors('Button · seletor das quatro saídas');
}

async function auditBadgeOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/badge/',
      activeLabel: 'HTML/CSS/JS',
      status: 'Estável',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-badge--playground',
    },
    {
      route: '/ds-tis/next/pt-br/react/components/badge/',
      activeLabel: 'React · shadcn/Base UI',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-badge--playground',
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/badge/',
      activeLabel: 'Angular',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-badge--playground',
    },
  ];

  await page.setViewportSize({ width: 390, height: 844 });
  for (const { activeLabel, previewSelector, route, status, storyId } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    expect((await page.locator('main h1').first().textContent())?.trim() === 'Badge', `${route}: título Badge ausente`);
    const technologyOptions = page.locator('[data-technology-select] option');
    expect(await technologyOptions.count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(await technologyOptions.filter({ hasText: 'Ark/Zag' }).isDisabled(), `${route}: saída Ark planejada deveria permanecer desabilitada`);
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    expect(
      (await page.locator('[data-component-panel="implementation"] .ds-react-contract dd').allTextContents()).includes(status),
      `${route}: status ${status} ausente`,
    );
    const runtimeText = (await page.locator('.ds-output-example__runtime').first().textContent())?.trim() || '';
    if (route.includes('/web/')) {
      expect(runtimeText.includes('sem runtime JavaScript'), `${route}: descrição Web atribuiu runtime incorreto ao Badge`);
    }
    const accessibilityText = (await page.locator('[data-component-panel="accessibility"]').innerText()).toLowerCase();
    expect(!accessibilityText.includes('semântica nativa do button'), `${route}: Badge herdou responsabilidade de Button`);
    if (!route.includes('/web/')) {
      expect(accessibilityText.includes('badge não interativo'), `${route}: responsabilidade acessível do Badge ausente`);
    }

    const documentedBadge = page.locator(
      '[data-component-panel="design"] .ds-source-guidance .ds-badge',
    ).first();
    await documentedBadge.waitFor();
    expect(
      await documentedBadge.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return ['flex', 'inline-flex'].includes(style.display) &&
          style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          Number.parseFloat(style.paddingInlineStart) > 0 &&
          rect.width > rect.height;
      }),
      `${route}: exemplos documentais do Badge perderam o CSS público`,
    );

    const preview = page.locator(previewSelector);
    expect(await preview.count() === 1, `${route}: preview funcional próprio ausente`);
    await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
    expect((await preview.getAttribute('src'))?.includes(storyId), `${route}: preview não aponta para ${storyId}`);
    const badge = page.frameLocator(previewSelector).locator('.ds-badge').first();
    await badge.waitFor();
    expect(
      await badge.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > rect.height && rect.height > 0 &&
          rect.left >= 0 && rect.right <= document.documentElement.clientWidth &&
          ['flex', 'inline-flex'].includes(style.display) &&
          style.backgroundColor !== 'rgba(0, 0, 0, 0)';
      }),
      `${route}: Badge ficou cortado ou perdeu a aparência pública`,
    );
    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);
    await auditAxe(`${route} · Badge`);
  }

  recordBrowserErrors('Badge · seletor das saídas disponíveis');
}

async function auditCardOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/card/',
      activeLabel: 'HTML/CSS/JS',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-card--playground',
      rootSelector: '.ds-card',
    },
    {
      route: '/ds-tis/next/pt-br/react/components/card/',
      activeLabel: 'React · shadcn/Base UI',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-card--playground',
      rootSelector: '[data-slot="card"]',
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/card/',
      activeLabel: 'Angular',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-card--playground',
      rootSelector: '[data-tis-angular-card]',
    },
  ];

  await page.setViewportSize({ width: 390, height: 844 });
  for (const { activeLabel, previewSelector, rootSelector, route, storyId } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    expect((await page.locator('main h1').first().textContent())?.trim() === 'Card', `${route}: título Card ausente`);
    const technologyOptions = page.locator('[data-technology-select] option');
    expect(await technologyOptions.count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(await technologyOptions.filter({ hasText: 'Ark/Zag' }).isDisabled(), `${route}: saída Ark planejada deveria permanecer desabilitada`);
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );

    const documentedCard = page.locator('[data-component-panel="design"] .ds-anatomy .ds-card').first();
    await documentedCard.waitFor();
    expect(
      await documentedCard.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const title = element.querySelector('.ds-card__title')?.getBoundingClientRect();
        const body = element.querySelector('.ds-card__body')?.getBoundingClientRect();
        return style.display === 'flex' && style.flexDirection === 'column' &&
          style.backgroundColor !== 'rgba(0, 0, 0, 0)' && Number.parseFloat(style.borderRadius) > 0 &&
          Boolean(title && body) && title.left >= rect.left && title.right <= rect.right &&
          body.left >= rect.left && body.right <= rect.right && rect.left >= 0 &&
          rect.right <= document.documentElement.clientWidth;
      }),
      `${route}: anatomia do Card perdeu CSS ou alinhamento interno`,
    );

    const documentedCanvases = page.locator(
      '[data-component-panel="design"] .ds-source-guidance .ds-preview__canvas',
    );
    expect(
      await documentedCanvases.evaluateAll((elements) => elements.length > 0 && elements.every((element) => {
        const panel = element.closest('.ds-preview__panel');
        if (!panel) return false;
        const canvasRect = element.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        return Math.abs(canvasRect.width - panelRect.width) <= 1;
      })),
      `${route}: canvas documental do Card não preenche a largura do preview`,
    );

    const previews = page.locator(previewSelector);
    expect(await previews.count() === 2, `${route}: previews funcional e documentado próprios ausentes`);
    const preview = previews.first();
    await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
    expect((await preview.getAttribute('src'))?.includes(storyId), `${route}: preview não aponta para ${storyId}`);
    const card = page.frameLocator(previewSelector).first().locator(rootSelector).first();
    await card.waitFor();
    expect(
      await card.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && rect.left >= 0 &&
          rect.right <= document.documentElement.clientWidth && style.display === 'flex' &&
          style.flexDirection === 'column' && style.backgroundColor !== 'rgba(0, 0, 0, 0)';
      }),
      `${route}: Card ficou cortado ou perdeu a aparência pública`,
    );
    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);
    await auditAxe(`${route} · Card`);
  }

  recordBrowserErrors('Card · seletor das saídas disponíveis');
}

async function auditDividerOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/divider/',
      activeLabel: 'HTML/CSS/JS',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-divider--playground',
      rootSelector: '.ds-divider',
    },
    {
      route: '/ds-tis/next/pt-br/react/components/divider/',
      activeLabel: 'React · shadcn/Base UI',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-divider--playground',
      rootSelector: '[data-slot="separator"]',
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/divider/',
      activeLabel: 'Angular',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-divider--playground',
      rootSelector: '[data-tis-angular-divider]',
    },
  ];

  await page.setViewportSize({ width: 390, height: 844 });
  for (const { activeLabel, previewSelector, rootSelector, route, storyId } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    expect((await page.locator('main h1').first().textContent())?.trim() === 'Divider', `${route}: título Divider ausente`);
    expect(await page.locator('[data-technology-select] option').count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(await page.locator('[data-technology-select] option').filter({ hasText: 'Ark/Zag' }).isDisabled(), `${route}: saída Ark planejada deveria permanecer desabilitada`);
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );

    const anatomy = page.locator('[data-component-panel="design"] .ds-source-guidance .ds-anatomy').first();
    await anatomy.waitFor();
    expect(await anatomy.locator('.ds-anatomy__marker').count() === 3, `${route}: anatomia não contém os três bullets numerados`);
    expect(
      await anatomy.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const divider = element.querySelector('.ds-divider')?.getBoundingClientRect();
        const markers = [...element.querySelectorAll('.ds-anatomy__marker')].map((marker) => marker.getBoundingClientRect());
        return Boolean(divider && divider.width > 0 && divider.height > 0) && markers.every((marker) =>
          marker.left >= bounds.left - 1 && marker.right <= bounds.right + 1 &&
          marker.top >= bounds.top - 1 && marker.bottom <= bounds.bottom + 1
        );
      }),
      `${route}: anatomia do Divider está colapsada ou com bullets cortados`,
    );

    const documentedCanvases = page.locator('[data-component-panel="design"] .ds-source-guidance .ds-preview__canvas');
    expect(
      await documentedCanvases.evaluateAll((elements) => elements.length > 0 && elements.every((element) => {
        const card = element.closest('.ds-preview');
        if (!card) return false;
        return Math.abs(element.getBoundingClientRect().width - (card.getBoundingClientRect().width - 2)) <= 1;
      })),
      `${route}: canvases documentais do Divider não preenchem a largura dos cards`,
    );

    const previews = page.locator(previewSelector);
    expect(await previews.count() === 2, `${route}: previews funcional e documentado próprios ausentes`);
    const preview = previews.first();
    await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
    expect((await preview.getAttribute('src'))?.includes(storyId), `${route}: preview não aponta para ${storyId}`);
    const divider = page.frameLocator(previewSelector).first().locator(rootSelector).first();
    await divider.waitFor();
    expect(
      await divider.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && rect.left >= 0 &&
          rect.right <= document.documentElement.clientWidth && style.backgroundColor !== 'rgba(0, 0, 0, 0)';
      }),
      `${route}: Divider ficou cortado ou perdeu a aparência pública`,
    );
    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);
    await auditAxe(`${route} · Divider`);
  }

  recordBrowserErrors('Divider · seletor das saídas disponíveis');
}

async function auditAlertOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/alert/',
      activeLabel: 'HTML/CSS/JS',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-alert--playground',
    },
    {
      route: '/ds-tis/next/pt-br/react/components/alert/',
      activeLabel: 'React · shadcn/Base UI',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-alert--playground',
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/alert/',
      activeLabel: 'Angular',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-alert--playground',
    },
  ];

  await page.setViewportSize({ width: 390, height: 844 });
  for (const { activeLabel, previewSelector, route, storyId } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    expect((await page.locator('main h1').first().textContent())?.trim() === 'Alert', `${route}: título Alert ausente`);
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    expect(await page.locator('[data-technology-select] option').count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(await page.locator('[data-technology-select] option').filter({ hasText: 'Ark/Zag' }).isDisabled(), `${route}: Ark planejado deveria permanecer desabilitado`);
    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);

    const documentedAlert = page.locator(
      '[data-component-panel="design"] .ds-anatomy .ds-alert',
    ).first();
    await documentedAlert.waitFor();
    expect(
      await documentedAlert.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const close = element.querySelector('.ds-alert__close');
        const closeStyle = close ? getComputedStyle(close) : null;
        const icon = element.querySelector('.ds-alert__icon svg');
        return style.display === 'flex' &&
          style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          Number.parseFloat(style.paddingInlineStart) > 0 &&
          ['flex', 'inline-flex'].includes(closeStyle?.display || '') && Boolean(icon) &&
          rect.left >= 0 && rect.right <= document.documentElement.clientWidth;
      }),
      `${route}: anatomia do Alert perdeu CSS, ícone ou alinhamento do close`,
    );

    const preview = page.locator(previewSelector);
    await preview.waitFor();
    await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
    expect((await preview.getAttribute('src'))?.includes(storyId), `${route}: preview não aponta para ${storyId}`);
    const frame = page.frameLocator(previewSelector);
    const alert = frame.locator('.ds-alert').first();
    await alert.waitFor();
    expect((await alert.getAttribute('role')) === 'status', `${route}: mensagem de sucesso deveria usar role status`);
    expect(
      await alert.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const content = element.querySelector('.ds-alert__content')?.getBoundingClientRect();
        const close = element.querySelector('.ds-alert__close')?.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.left >= 0 &&
          rect.right <= document.documentElement.clientWidth && Boolean(content && close) &&
          content.left >= rect.left && content.right <= close.left;
      }),
      `${route}: Alert ficou cortado ou com partes desalinhadas`,
    );
    const close = frame.getByRole('button', { name: /Fechar alerta|Dispensar alerta/ });
    await close.click();
    await alert.waitFor({ state: 'detached' });
    await auditAxe(`${route} · Alert`);
  }

  recordBrowserErrors('Alert · seletor das saídas disponíveis');
}

async function auditModalOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/modal/',
      activeLabel: 'HTML/CSS/JS',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-modal--playground',
      triggerName: 'Abrir modal md',
      closeState: 'hidden',
      guidanceCount: 4,
      runtimeSelector: '[data-ds-modal-trigger-init="true"]',
      exampleStoryIds: ['components-modal--tamanhos', 'components-modal--corpo-customizado'],
    },
    {
      route: '/ds-tis/next/pt-br/ark/components/modal/',
      activeLabel: 'Ark/Zag',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'ark-modal--playground',
      triggerName: 'Abrir modal',
      closeState: 'detached',
      guidanceCount: 3,
      runtimeSelector: '[data-scope="dialog"]',
      exampleStoryIds: ['ark-modal--sizes', 'ark-modal--custom-body'],
    },
    {
      route: '/ds-tis/next/pt-br/react/components/modal/',
      activeLabel: 'React · shadcn/Base UI',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-modal--playground',
      triggerName: 'Abrir modal',
      closeState: 'detached',
      guidanceCount: 3,
      runtimeSelector: '[data-slot="dialog-trigger"]',
      exampleStoryIds: ['react-modal--sizes', 'react-modal--custom-body'],
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/modal/',
      activeLabel: 'Angular',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-modal--playground',
      triggerName: 'Abrir modal',
      closeState: 'detached',
      guidanceCount: 3,
      runtimeSelector: 'tis-modal',
      exampleStoryIds: ['angular-modal--tamanhos', 'angular-modal--corpo-customizado'],
    },
  ];

  await page.setViewportSize({ width: 390, height: 844 });
  for (const {
    activeLabel,
    closeState,
    exampleStoryIds,
    guidanceCount,
    previewSelector,
    route,
    runtimeSelector,
    storyId,
    triggerName,
  } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    expect(
      (await page.locator('main h1').first().textContent())?.trim() === 'Modal',
      `${route}: título Modal ausente`,
    );
    const options = page.locator('[data-technology-select] option');
    expect(await options.count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    expect(
      await page.locator('.ds-source-guidance[data-source-path="docs/modal.html"]').count() === guidanceCount,
      `${route}: documentação compartilhada deveria expor ${guidanceCount} tópicos`,
    );
    const staticModalExamples = page.locator(
      '[data-component-panel="design"] .ds-source-guidance .ds-modal',
    );
    expect(
      await staticModalExamples.count() === 1 &&
        await staticModalExamples.evaluateAll((examples) => examples.every((example) => {
          const style = getComputedStyle(example);
          return style.display === 'flex' &&
            style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
            parseFloat(style.padding) > 0 &&
            parseFloat(style.borderRadius) > 0;
        })),
      `${route}: anatomia estática do Modal perdeu a folha CSS pública`,
    );
    expect(
      await page
        .locator('[data-component-panel="design"] .ds-source-guidance .ds-button')
        .evaluateAll((buttons) => buttons.length > 0 && buttons.every((button) => {
          const style = getComputedStyle(button);
          return style.display === 'flex' && parseFloat(style.borderRadius) > 0;
        })),
      `${route}: Buttons compostos na anatomia do Modal perderam seu CSS público`,
    );
    expect(
      await staticModalExamples.evaluateAll((examples) => examples.every((example) => {
        const hasZeroMargin = (element) => {
          if (!element) return true;
          const style = getComputedStyle(element);
          return Math.abs(Number.parseFloat(style.marginTop)) <= 0.5 &&
            Math.abs(Number.parseFloat(style.marginBottom)) <= 0.5;
        };
        const close = example.querySelector('.ds-modal__close');
        const footer = example.querySelector('.ds-modal__footer');
        const footerButtons = footer ? [...footer.querySelectorAll(':scope > .ds-button')] : [];
        const footerAligned = footerButtons.length < 2 || footerButtons.every((button) => {
          const reference = footerButtons[0].getBoundingClientRect();
          const current = button.getBoundingClientRect();
          return Math.abs(current.top - reference.top) <= 1 &&
            Math.abs(current.bottom - reference.bottom) <= 1;
        });
        const customInput = example.querySelector('.ds-modal__body .ds-field > .ds-input');
        const customAction = example.querySelector('.ds-modal__body > .ds-button');
        const title = example.querySelector('.ds-modal__title');
        const description = example.querySelector('.ds-modal__description');
        const bodyParagraph = example.querySelector('.ds-modal__body > p');

        return hasZeroMargin(close) &&
          hasZeroMargin(title) &&
          hasZeroMargin(description) &&
          hasZeroMargin(bodyParagraph) &&
          hasZeroMargin(footer) &&
          footerButtons.every(hasZeroMargin) &&
          footerAligned &&
          hasZeroMargin(customInput) &&
          hasZeroMargin(customAction);
      })),
      `${route}: rhythm editorial deslocou anatomia, footer ou composição interna do Modal`,
    );
    const anatomy = page.locator(
      '[data-component-panel="design"] .ds-source-guidance .ds-anatomy',
    );
    expect(await anatomy.count() === 1, `${route}: anatomia do Modal ausente`);
    expect(
      await anatomy.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const markers = [...element.querySelectorAll('.ds-anatomy__marker')];
        const labels = markers.map((marker) => marker.textContent?.trim());
        const contained = markers.every((marker) => {
            const rect = marker.getBoundingClientRect();
            return rect.left >= bounds.left - 1 &&
              rect.right <= bounds.right + 1 &&
              rect.top >= bounds.top - 1 &&
              rect.bottom <= bounds.bottom + 1;
          });
        const separated = markers.every((marker, index) => {
          const rect = marker.getBoundingClientRect();
          return markers.slice(index + 1).every((other) => {
            const otherRect = other.getBoundingClientRect();
            return rect.right <= otherRect.left || otherRect.right <= rect.left ||
              rect.bottom <= otherRect.top || otherRect.bottom <= rect.top;
          });
        });
        return getComputedStyle(element).overflow === 'visible' &&
          labels.join(',') === '1,2,3,4,5,6,7' && contained && separated;
      }),
      `${route}: marcadores da anatomia do Modal estão ausentes, recortados ou sobrepostos`,
    );
    expect(
      await page
        .locator('[data-panel-toc-list]')
        .getByText(/Review changes|Revisar alterações/)
        .count() === 0,
      `${route}: sumário editorial capturou um heading interno da demonstração`,
    );
    await activatePanel('usage');
    const usageText = await page.locator('[data-component-panel="usage"]').innerText();
    expect(
      usageText.includes('Quando usar') &&
        usageText.includes('Quando não usar') &&
        usageText.includes('Alert Dialog'),
      `${route}: separação entre Modal e Alert Dialog ausente`,
    );
    await activatePanel('design');

    const mainPreviewSelector = `[data-output-example="playground"] ${previewSelector}`;
    const previewElement = page.locator(mainPreviewSelector);
    expect(await previewElement.count() === 1, `${route}: preview funcional próprio ausente`);
    await page.waitForFunction(
      (selector) => Boolean(document.querySelector(selector)?.getAttribute('src')),
      mainPreviewSelector,
    );
    expect(
      (await previewElement.getAttribute('src'))?.includes(storyId),
      `${route}: preview não aponta para ${storyId}`,
    );

    const preview = page.frameLocator(mainPreviewSelector);
    await preview.locator(runtimeSelector).first().waitFor({ state: 'attached' });
    const trigger = preview.getByRole('button', { name: triggerName });
    await trigger.waitFor();
    await trigger.click();
    const dialog = preview.getByRole('dialog');
    await dialog.waitFor();
    expect(
      await dialog.evaluate((element) => element.classList.contains('ds-modal')),
      `${route}: preview não preservou a anatomia ds-modal`,
    );
    expect(
      await dialog.getAttribute('aria-modal') === 'true',
      `${route}: dialog não expôs aria-modal`,
    );
    expect(
      await dialog.evaluate((element) => element.contains(document.activeElement)),
      `${route}: foco não entrou no Modal`,
    );
    expect(
      await dialog.evaluate((element) => {
        const dialogRect = element.getBoundingClientRect();
        const close = element.querySelector('.ds-modal__close');
        const closeRect = close?.getBoundingClientRect();
        const footerButtons = [...element.querySelectorAll('.ds-modal__footer .ds-button')];
        const firstButtonRect = footerButtons[0]?.getBoundingClientRect();
        const zeroMargin = (selector) => {
          const target = element.querySelector(selector);
          if (!target) return true;
          const style = getComputedStyle(target);
          return Math.abs(Number.parseFloat(style.marginTop)) <= 0.5 &&
            Math.abs(Number.parseFloat(style.marginBottom)) <= 0.5;
        };
        return dialogRect.left >= 0 && dialogRect.right <= innerWidth &&
          dialogRect.top >= 0 && dialogRect.bottom <= innerHeight &&
          Boolean(closeRect) && closeRect.left >= dialogRect.left && closeRect.right <= dialogRect.right &&
          closeRect.top >= dialogRect.top && closeRect.bottom <= dialogRect.bottom &&
          footerButtons.length >= 2 && footerButtons.every((button) => {
            const rect = button.getBoundingClientRect();
            return firstButtonRect && Math.abs(rect.top - firstButtonRect.top) <= 1 &&
              Math.abs(rect.bottom - firstButtonRect.bottom) <= 1;
          }) &&
          zeroMargin('.ds-modal__title') && zeroMargin('.ds-modal__description') &&
          zeroMargin('.ds-modal__body > p');
      }),
      `${route}: conteúdo, close ou ações do preview funcional estão desalinhados ou recortados`,
    );
    if (activeLabel === 'Ark/Zag') {
      expect(
        await dialog.getAttribute('data-scope') === 'dialog' &&
          await dialog.evaluate((element) => element.classList.contains('ds-modal--md')),
        `${route}: adapter Ark/Zag não aplicou runtime Dialog e tamanho md padrão`,
      );
    }
    for (const key of ['Tab', 'Tab', 'Shift+Tab']) {
      await page.keyboard.press(key);
      expect(
        await dialog.evaluate((element) => element.contains(document.activeElement)),
        `${route}: focus trap deixou o Modal após ${key}`,
      );
    }
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: closeState });
    expect(
      await trigger.evaluate(async (element) => {
        for (let frame = 0; frame < 10; frame += 1) {
          if (element === document.activeElement) return true;
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
        return element === document.activeElement;
      }),
      `${route}: foco não retornou ao trigger`,
    );

    const documentedExamples = page.locator('[data-output-example="documented"]');
    expect(await documentedExamples.count() === 2, `${route}: exemplos próprios de tamanho e body estão ausentes`);
    expect(
      JSON.stringify(await documentedExamples.evaluateAll((elements) => elements.map((element) => element.getAttribute('data-output-story-id')))) === JSON.stringify(exampleStoryIds),
      `${route}: exemplos não apontam para os stories próprios da saída`,
    );

    const sizesPreviewSelector = `[data-output-story-id="${exampleStoryIds[0]}"] ${previewSelector}`;
    const sizesPreview = page.frameLocator(sizesPreviewSelector);
    const mediumTrigger = sizesPreview.getByRole('button', { name: 'Abrir modal md' });
    await mediumTrigger.waitFor();
    if (activeLabel === 'HTML/CSS/JS') {
      await sizesPreview.locator('[data-ds-modal-trigger-init="true"]').first().waitFor();
    }
    await mediumTrigger.click();
    const mediumDialog = sizesPreview.getByRole('dialog');
    await mediumDialog.waitFor();
    expect(
      await mediumDialog.evaluate((element) => element.classList.contains('ds-modal--md') && element.getBoundingClientRect().bottom <= innerHeight),
      `${route}: exemplo de tamanhos abriu o Modal md errado ou recortado`,
    );
    await page.keyboard.press('Escape');
    await mediumDialog.waitFor({ state: closeState });

    const customPreviewSelector = `[data-output-story-id="${exampleStoryIds[1]}"] ${previewSelector}`;
    const customPreview = page.frameLocator(customPreviewSelector);
    const customTrigger = customPreview.getByRole('button', { name: 'Convidar pessoa' });
    await customTrigger.waitFor();
    if (activeLabel === 'HTML/CSS/JS') {
      await customPreview.locator('[data-ds-modal-trigger-init="true"]').first().waitFor();
    }
    await customTrigger.click();
    const customDialog = customPreview.getByRole('dialog');
    await customDialog.waitFor();
    expect(
      await customDialog.evaluate((element) => {
        const dialogRect = element.getBoundingClientRect();
        const input = element.querySelector('.ds-input__field');
        const inputRect = input?.getBoundingClientRect();
        const footerButtons = [...element.querySelectorAll('.ds-modal__footer .ds-button')];
        const firstButtonRect = footerButtons[0]?.getBoundingClientRect();
        return dialogRect.top >= 0 && dialogRect.bottom <= innerHeight &&
          Boolean(inputRect) && inputRect.height >= 32 && inputRect.height <= 48 && inputRect.width > inputRect.height &&
          input === document.activeElement &&
          footerButtons.length >= 2 && footerButtons.every((button) => {
            const rect = button.getBoundingClientRect();
            return firstButtonRect && Math.abs(rect.top - firstButtonRect.top) <= 1 &&
              Math.abs(rect.bottom - firstButtonRect.bottom) <= 1;
          });
      }),
      `${route}: exemplo de body tem input, ações ou superfície deformados/recortados`,
    );
    await page.keyboard.press('Escape');
    await customDialog.waitFor({ state: closeState });

    const themeSelect = page.locator('starlight-theme-select select').first();
    await themeSelect.evaluate((select) => {
      select.value = 'dark';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await page.waitForFunction(
      () => [...document.querySelectorAll('[data-output-preview]')].every((frame) => frame.getAttribute('src')?.includes('mode%3Adark')),
    );
    await page.waitForFunction(
      () => [...document.querySelectorAll('[data-output-preview-shell]')].every((shell) => shell.getAttribute('aria-busy') === 'false'),
    );
    await page.waitForFunction(
      () => {
        const frames = [...document.querySelectorAll('[data-output-preview]')];
        return frames.length === 3 && frames.every((frame) => frame.contentDocument?.documentElement.dataset.mode === 'dark');
      },
    );
    expect(
      await page.locator('[data-output-preview]').evaluateAll((frames) => frames.length === 3 && frames.every((frame) => frame.contentDocument?.documentElement.dataset.mode === 'dark')),
      `${route}: os três exemplos funcionais não receberam o tema dark`,
    );
    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);
    await auditAxe(`${route} · Modal`);
    await themeSelect.evaluate((select) => {
      select.value = 'light';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  }

  const reactRoute = '/ds-tis/next/pt-br/react/components/modal/';
  const arkRoute = '/ds-tis/next/pt-br/ark/components/modal/';
  await page.goto(`${origin}${reactRoute}`, { waitUntil: 'networkidle' });
  await Promise.all([
    page.waitForURL(`${origin}${arkRoute}`),
    page.locator('[data-technology-select]').selectOption({ label: 'Ark/Zag' }),
  ]);
  expect(
    (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === 'Ark/Zag',
    'Modal: navegação React → Ark/Zag não preservou a implementação selecionada',
  );
  recordBrowserErrors('Modal · seletor das quatro saídas');
}

async function auditPopoverOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/popover/',
      activeLabel: 'HTML/CSS/JS',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-popover--playground',
      contentStoryId: 'components-popover--com-slot',
      triggerName: 'Abrir popover',
      dialogClass: 'ds-popover__panel',
      arrowTarget: 'parent',
      closeState: 'hidden',
      guidanceCount: 5,
    },
    {
      route: '/ds-tis/next/pt-br/ark/components/popover/',
      activeLabel: 'Ark/Zag',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'ark-popover--playground',
      contentStoryId: 'ark-popover--content-slot',
      triggerName: 'Abrir popover',
      dialogClass: 'ds-ark-popover__panel',
      arrowTarget: 'parent',
      closeState: 'detached',
      guidanceCount: 4,
    },
    {
      route: '/ds-tis/next/pt-br/react/components/popover/',
      activeLabel: 'React · shadcn/Base UI',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-popover--playground',
      contentStoryId: 'react-popover--content-slot',
      triggerName: 'Abrir popover',
      dialogClass: 'ds-tis-popover__popup',
      arrowTarget: 'parent',
      closeState: 'detached',
      guidanceCount: 4,
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/popover/',
      activeLabel: 'Angular',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-popover--playground',
      contentStoryId: 'angular-popover--content-slot',
      triggerName: 'Abrir popover',
      dialogClass: 'ds-popover__panel',
      arrowTarget: 'parent',
      closeState: 'detached',
      guidanceCount: 4,
    },
  ];

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const {
    activeLabel,
    arrowTarget,
    closeState,
    contentStoryId,
    dialogClass,
    guidanceCount,
    previewSelector: storybookPreviewSelector,
    route,
    storyId,
    triggerName,
  } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    const options = page.locator('[data-technology-select] option');
    expect(await options.count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    for (const label of ['HTML/CSS/JS', 'Ark/Zag', 'React · shadcn/Base UI', 'Angular']) {
      expect(await options.filter({ hasText: label }).count() === 1, `${route}: saída ${label} ausente`);
    }
    expect(await page.locator('[data-component-breadcrumb]').count() === 1, `${route}: breadcrumb compartilhado ausente`);
    expect(await page.locator('[data-component-intro]').count() === 1, `${route}: introdução compartilhada ausente`);
    expect(
      await page.locator('[data-component-intro] dl > div').count() === 0 &&
        await page.locator('[data-component-panel="implementation"] .ds-react-contract').count() >= 1,
      `${route}: status e distribuição deveriam ficar em Implementação`,
    );
    expect(await page.locator('[data-component-tab]').count() === 4, `${route}: quatro visões editoriais ausentes`);
    expect(await page.locator('[data-component-panel]').count() === 4, `${route}: quatro painéis editoriais ausentes`);
    expect(
      await page.locator('.ds-source-guidance[data-source-path="docs/popover.html"]').count() === guidanceCount,
      `${route}: documentação rica compartilhada deveria expor ${guidanceCount} tópicos`,
    );
    const editorialToc = await page.locator('[data-panel-toc-list] a').allTextContents();
    expect(
      !editorialToc.some((label) => ['Título do Popover', 'Renomear item'].includes(label.trim())),
      `${route}: índice editorial incluiu headings internos do componente`,
    );
    const designGuidance = page.locator(
      '.ds-source-guidance[data-component-source="popover"][data-component-topic="design"]',
    );
    expect(
      await designGuidance.count() === 2 &&
        await designGuidance.locator('[data-doc-order="20"], [data-doc-order="30"]').count() === 0,
      `${route}: exemplos Web antigos ainda foram misturados à documentação compartilhada`,
    );
    expect(
      await designGuidance.locator('.ds-anatomy__marker').count() === 6 &&
        await designGuidance.locator('.ds-component-anatomy-list > li').count() === 6,
      `${route}: anatomia deve identificar visualmente e descrever as seis partes`,
    );
    const anatomyPopover = designGuidance.locator('.ds-popover--documentation');
    const anatomyArrowState = await anatomyPopover.evaluate((element) => {
      const arrow = element.querySelector('.ds-popover-documentation__arrow');
      const panel = element.querySelector('.ds-popover__panel');
      if (!(arrow instanceof HTMLElement) || !(panel instanceof HTMLElement)) return null;
      const arrowRect = arrow.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        after: getComputedStyle(element, '::after').content,
        arrowBottom: arrowRect.bottom,
        arrowZIndex: Number.parseFloat(getComputedStyle(arrow).zIndex),
        before: getComputedStyle(element, '::before').content,
        documentationArrow: getComputedStyle(arrow).display,
        panelTop: panelRect.top,
        panelZIndex: Number.parseFloat(getComputedStyle(panel).zIndex),
      };
    });
    expect(
      anatomyArrowState?.before === 'none' &&
        anatomyArrowState.after === 'none' &&
        anatomyArrowState.documentationArrow !== 'none' &&
        anatomyArrowState.arrowZIndex > anatomyArrowState.panelZIndex &&
        Math.abs((anatomyArrowState.arrowBottom - anatomyArrowState.panelTop) - 1) <= 0.5,
      `${route}: anatomia do Popover renderizou seta residual (${JSON.stringify(anatomyArrowState)})`,
    );
    const anatomyActionsGeometry = await anatomyPopover.evaluate((element) => {
      const actions = element.querySelector('.ds-popover__actions');
      const close = element.querySelector('.ds-popover__close');
      const closeIcon = close?.querySelector('.ds-icon');
      const panel = element.querySelector('.ds-popover__panel');
      if (
        !(actions instanceof HTMLElement) ||
        !(close instanceof HTMLElement) ||
        !(closeIcon instanceof SVGElement) ||
        !(panel instanceof HTMLElement)
      ) return null;
      const closeRect = close.getBoundingClientRect();
      const closeIconRect = closeIcon.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        buttons: Array.from(actions.querySelectorAll('.ds-button')).map((button) => {
          const rect = button.getBoundingClientRect();
          return { height: rect.height, top: rect.top };
        }),
        close: {
          height: closeRect.height,
          iconHeight: closeIconRect.height,
          iconWidth: closeIconRect.width,
          offsetRight: panelRect.right - closeRect.right,
          offsetTop: closeRect.top - panelRect.top,
          width: closeRect.width,
        },
        connectors: element.closest('.ds-anatomy')?.querySelectorAll('.ds-popover-anatomy__connector').length || 0,
      };
    });
    expect(
      anatomyActionsGeometry?.connectors === 6 &&
        anatomyActionsGeometry.buttons.length === 2 &&
        anatomyActionsGeometry.buttons.every((button) => Math.abs(button.height - 32) <= 0.5) &&
        Math.abs(anatomyActionsGeometry.buttons[0].top - anatomyActionsGeometry.buttons[1].top) <= 0.5 &&
        Math.abs(anatomyActionsGeometry.close.width - 24) <= 0.5 &&
        Math.abs(anatomyActionsGeometry.close.height - 24) <= 0.5 &&
        Math.abs(anatomyActionsGeometry.close.offsetTop - 14) <= 0.5 &&
        Math.abs(anatomyActionsGeometry.close.offsetRight - 16) <= 0.5 &&
        Math.abs(anatomyActionsGeometry.close.iconWidth - 16) <= 0.5 &&
        Math.abs(anatomyActionsGeometry.close.iconHeight - 16) <= 0.5,
      `${route}: anatomia não preservou conectores, close e alinhamento das actions (${JSON.stringify(anatomyActionsGeometry)})`,
    );
    const outputExamples = page.locator(`.ds-output-example[data-output-technology="${route.split('/')[4]}"]`);
    expect(await outputExamples.count() === 2, `${route}: deve haver dois exemplos próprios da implementação selecionada`);
    const previewSelector = `[data-output-example="playground"] ${storybookPreviewSelector}`;
    const contentPreviewSelector = `[data-output-example="content-slot"] ${storybookPreviewSelector}`;
    expect(await page.locator(previewSelector).count() === 1, `${route}: Playground próprio ausente`);
    expect(await page.locator(contentPreviewSelector).count() === 1, `${route}: Content Slot próprio ausente`);
    await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
    await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), contentPreviewSelector);
    expect(
      (await page.locator(previewSelector).getAttribute('src'))?.includes(storyId),
      `${route}: preview não aponta para ${storyId}`,
    );
    expect(
      (await page.locator(contentPreviewSelector).getAttribute('src'))?.includes(contentStoryId),
      `${route}: exemplo adicional não aponta para ${contentStoryId}`,
    );

    const preview = page.frameLocator(previewSelector);
    const trigger = preview.getByRole('button', { name: triggerName });
    await trigger.waitFor();
    expect(
      Math.abs(await trigger.evaluate((element) => element.getBoundingClientRect().height) - 32) <= 0.5,
      `${route}: trigger comparável do Popover deve usar Button sm de 32px`,
    );
    const triggerBounds = await trigger.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      return {
        bottom: rect.bottom,
        centerX,
        viewportAlignment: Math.abs(centerX - (document.documentElement.clientWidth / 2)),
      };
    });
    expect(triggerBounds.viewportAlignment <= 1, `${route}: trigger do Playground não está centralizado (${triggerBounds.viewportAlignment}px)`);
    await trigger.click();
    const dialog = preview.getByRole('dialog');
    await dialog.waitFor();
    expect(
      await dialog.evaluate((element, expectedClass) => element.classList.contains(expectedClass), dialogClass),
      `${route}: preview não preservou a implementação ${dialogClass}`,
    );
    const arrowGeometry = await dialog.evaluate((element, target) => {
      if (target === 'element' || target === 'ark-element') {
        const arrow = element.querySelector(
          target === 'element' ? '.ds-tis-popover__arrow' : '.ds-ark-popover__arrow',
        );
        if (!(arrow instanceof HTMLElement)) return null;
        const outer = getComputedStyle(arrow, target === 'ark-element' ? '::before' : null);
        const inner = getComputedStyle(arrow, '::after');
        const canvas = element.ownerDocument.querySelector('.sb-story-shell, .ds-story-shell') || element.ownerDocument.body;
        return {
          canvasColor: getComputedStyle(canvas).backgroundColor,
          clipPath: outer.clipPath,
          content: target === 'element' ? 'element' : outer.content,
          height: Number.parseFloat(outer.height),
          innerColor: inner.backgroundColor,
          innerContent: inner.content,
          innerHeight: Number.parseFloat(inner.height),
          innerWidth: Number.parseFloat(inner.width),
          outerColor: outer.backgroundColor,
          panelColor: getComputedStyle(element).backgroundColor,
          stackingVisible: true,
          width: Number.parseFloat(outer.width),
        };
      }
      const arrowHost = target === 'parent' ? element.parentElement : element;
      if (!(arrowHost instanceof HTMLElement)) return null;
      const outer = getComputedStyle(arrowHost, '::before');
      const inner = getComputedStyle(arrowHost, '::after');
      const canvas = element.ownerDocument.querySelector('.sb-story-shell, .ds-story-shell') || element.ownerDocument.body;
      return {
        canvasColor: getComputedStyle(canvas).backgroundColor,
        clipPath: outer.clipPath,
        content: outer.content,
        height: Number.parseFloat(outer.height),
        innerColor: inner.backgroundColor,
        innerContent: inner.content,
        innerHeight: Number.parseFloat(inner.height),
        innerWidth: Number.parseFloat(inner.width),
        outerColor: outer.backgroundColor,
        panelColor: getComputedStyle(element).backgroundColor,
        stackingVisible: Number.parseFloat(outer.zIndex) > Number.parseFloat(getComputedStyle(element).zIndex),
        width: Number.parseFloat(outer.width),
      };
    }, arrowTarget);
    expect(
      arrowGeometry?.content !== 'none' &&
        arrowGeometry?.innerContent !== 'none' &&
        Math.abs((arrowGeometry?.width || 0) - 16) <= 0.5 &&
        Math.abs((arrowGeometry?.height || 0) - 9) <= 0.5 &&
        Math.abs((arrowGeometry?.innerWidth || 0) - 14) <= 0.5 &&
        Math.abs((arrowGeometry?.innerHeight || 0) - 8) <= 0.5 &&
        arrowGeometry?.clipPath !== 'none' &&
        arrowGeometry?.outerColor !== arrowGeometry?.innerColor &&
        arrowGeometry?.innerColor === arrowGeometry?.panelColor &&
        arrowGeometry?.innerColor !== arrowGeometry?.canvasColor &&
        arrowGeometry?.stackingVisible,
      `${route}: Arrow não preservou a geometria triangular esperada (${JSON.stringify(arrowGeometry)})`,
    );
    expect(
      (await dialog.locator('.ds-popover__title').textContent())?.trim() === 'Detalhes da ação',
      `${route}: título comparável ausente`,
    );
    expect(await dialog.getByText('Conteúdo breve associado ao trigger.', { exact: true }).count() === 1, `${route}: descrição comparável ausente`);
    const iconClose = dialog.getByRole('button', { name: 'Fechar popover' });
    const actionCancel = dialog.getByRole('button', { exact: true, name: 'Cancelar' });
    const actionConfirm = dialog.getByRole('button', { exact: true, name: 'Confirmar' });
    expect(await iconClose.isVisible(), `${route}: close icon-only ausente`);
    expect(await actionCancel.isVisible() && await actionConfirm.isVisible(), `${route}: ações Cancelar e Confirmar ausentes`);
    expect(
      await actionCancel.evaluate((element) => Boolean(element.closest('.ds-popover__actions'))) &&
        await actionConfirm.evaluate((element) => Boolean(element.closest('.ds-popover__actions'))),
      `${route}: ações saíram do footer do Popover`,
    );
    const actionsGeometry = await dialog.locator('.ds-popover__actions').evaluate((element) => {
      const panel = element.closest('.ds-popover__panel');
      const buttons = Array.from(element.querySelectorAll('button')).map((button) => {
        const rect = button.getBoundingClientRect();
        return { bottom: rect.bottom, height: rect.height, left: rect.left, right: rect.right, top: rect.top };
      });
      if (!(panel instanceof HTMLElement)) return null;
      const panelRect = panel.getBoundingClientRect();
      return {
        buttons,
        contentRight: panelRect.right - Number.parseFloat(getComputedStyle(panel).paddingRight),
      };
    });
    expect(
      actionsGeometry?.buttons.length === 2 &&
        actionsGeometry.buttons.every((button) => Math.abs(button.height - 32) <= 0.5) &&
        Math.abs(actionsGeometry.buttons[0].top - actionsGeometry.buttons[1].top) <= 0.5 &&
        Math.abs(actionsGeometry.buttons[1].right - actionsGeometry.contentRight) <= 1.5 &&
        actionsGeometry.buttons[1].left > actionsGeometry.buttons[0].right,
      `${route}: actions não preservaram altura, alinhamento e gap (${JSON.stringify(actionsGeometry)})`,
    );
    const dialogBounds = await dialog.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        bottom: rect.bottom,
        centerX: rect.left + rect.width / 2,
        height: document.documentElement.clientHeight,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        width: document.documentElement.clientWidth,
      };
    });
    expect(
      dialogBounds.top >= 0 && dialogBounds.left >= 0 &&
        dialogBounds.right <= dialogBounds.width && dialogBounds.bottom <= dialogBounds.height,
      `${route}: painel saiu da área visível do preview (${JSON.stringify(dialogBounds)})`,
    );
    expect(
      Math.abs(dialogBounds.centerX - triggerBounds.centerX) <= 1,
      `${route}: painel não abriu centralizado no trigger`,
    );
    expect(
      Math.abs((dialogBounds.top - triggerBounds.bottom) - 8) <= 1.5,
      `${route}: painel não preservou o gap inferior de 8px`,
    );
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: closeState });

    const contentPreview = page.frameLocator(contentPreviewSelector);
    const contentTrigger = contentPreview.getByRole('button', { exact: true, name: 'Renomear' });
    await contentTrigger.waitFor();
    await contentTrigger.click();
    const contentDialog = contentPreview.getByRole('dialog');
    await contentDialog.waitFor();
    expect(
      (await contentDialog.locator('.ds-popover__title').textContent())?.trim() === 'Renomear item' &&
        await contentDialog.getByLabel('Nome').inputValue() === 'Relatório mensal',
      `${route}: Content Slot próprio não abriu com o campo esperado`,
    );
    const contentSlotGeometry = await contentDialog.evaluate((element) => {
      const field = element.querySelector('.ds-input');
      const input = element.querySelector('.ds-input__field');
      const dialogRect = element.getBoundingClientRect();
      const viewportHeight = element.ownerDocument.documentElement.clientHeight;
      const buttons = Array.from(element.querySelectorAll('.ds-popover__actions .ds-button')).map((button) => {
        const rect = button.getBoundingClientRect();
        return { height: rect.height, top: rect.top };
      });
      if (!(field instanceof HTMLElement) || !(input instanceof HTMLInputElement)) return null;
      return {
        buttons,
        dialogBottom: dialogRect.bottom,
        dialogHeight: dialogRect.height,
        dialogScrollHeight: element.scrollHeight,
        fieldHeight: field.getBoundingClientRect().height,
        inputHeight: input.getBoundingClientRect().height,
        viewportHeight,
      };
    });
    expect(
      Math.abs((contentSlotGeometry?.fieldHeight || 0) - 40) <= 0.5 &&
        Math.abs((contentSlotGeometry?.inputHeight || 0) - 40) <= 0.5 &&
        contentSlotGeometry?.buttons.length === 2 &&
        contentSlotGeometry.buttons.every((button) => Math.abs(button.height - 32) <= 0.5) &&
        Math.abs(contentSlotGeometry.buttons[0].top - contentSlotGeometry.buttons[1].top) <= 0.5 &&
        contentSlotGeometry.dialogBottom <= contentSlotGeometry.viewportHeight &&
        contentSlotGeometry.dialogScrollHeight <= contentSlotGeometry.dialogHeight + 1,
      `${route}: Content Slot recortou o painel ou não preservou input de 40px e actions alinhadas (${JSON.stringify(contentSlotGeometry)})`,
    );
    await contentDialog.getByRole('button', { name: 'Fechar popover' }).click();
    await contentDialog.waitFor({ state: closeState });
    expect(
      await contentTrigger.evaluate((element) => element === document.activeElement),
      `${route}: Content Slot não devolveu foco ao trigger`,
    );
    await auditAxe(`${route} · seletor de saídas`);
  }

  recordBrowserErrors('Popover · seletor das quatro saídas');
}

async function auditComboboxOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/combobox/',
      activeLabel: 'HTML/CSS/JS',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-form-combobox--playground',
      guidanceCount: 4,
    },
    {
      route: '/ds-tis/next/pt-br/ark/components/combobox/',
      activeLabel: 'Ark/Zag',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'ark-combobox--playground',
      guidanceCount: 3,
    },
    {
      route: '/ds-tis/next/pt-br/react/components/combobox/',
      activeLabel: 'React · shadcn/Base UI',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-combobox--playground',
      guidanceCount: 3,
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/combobox/',
      activeLabel: 'Angular',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-combobox--playground',
      guidanceCount: 3,
    },
  ];

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const { activeLabel, guidanceCount, previewSelector, route, storyId } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    const options = page.locator('[data-technology-select] option');
    expect(await options.count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    for (const label of ['HTML/CSS/JS', 'Ark/Zag', 'React · shadcn/Base UI', 'Angular']) {
      expect(
        await options.filter({ hasText: label }).count() === 1 &&
          !(await options.filter({ hasText: label }).isDisabled()),
        `${route}: saída ${label} ausente ou indisponível`,
      );
    }
    expect(await page.locator('[data-component-tab]').count() === 4, `${route}: quatro visões editoriais ausentes`);
    expect(
      await page.locator('.ds-source-guidance[data-source-path="docs/combobox.html"]').count() === guidanceCount,
      `${route}: documentação rica do Combobox deveria expor ${guidanceCount} tópicos`,
    );
    expect(await page.locator(previewSelector).count() === 1, `${route}: preview funcional próprio ausente`);
    await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
    expect(
      (await page.locator(previewSelector).getAttribute('src'))?.includes(storyId),
      `${route}: preview não aponta para ${storyId}`,
    );

    const preview = page.frameLocator(previewSelector);
    const input = preview.getByRole('combobox', { name: 'País' });
    await input.waitFor();
    expect(
      await preview.getByRole('button', { name: 'Limpar seleção' }).count() === 0,
      `${route}: clear não deveria ocupar espaço com o valor vazio`,
    );

    await input.click();
    await input.fill('Chi');
    const chile = preview.getByRole('option', { name: 'Chile' });
    await chile.waitFor();
    expect(
      (await preview.locator('[role="option"]:visible').allTextContents()).join('|') === 'Chile',
      `${route}: filtro visual não reduziu a lista para Chile`,
    );
    await input.press('ArrowDown');
    await input.press('Enter');
    await page.waitForTimeout(50);
    expect(await input.inputValue() === 'Chile', `${route}: Enter não selecionou Chile`);
    expect(await input.getAttribute('aria-expanded') === 'false', `${route}: seleção não fechou o listbox`);

    const clear = preview.getByRole('button', { name: 'Limpar seleção' });
    await clear.waitFor();
    await clear.click();
    await clear.waitFor({ state: 'hidden' });
    expect(await input.inputValue() === '', `${route}: clear não removeu o valor`);
    expect(
      await input.evaluate((element) => element === element.ownerDocument.activeElement),
      `${route}: clear não devolveu foco ao input`,
    );
    expect(
      await preview.getByRole('button', { name: 'Limpar seleção' }).count() === 0,
      `${route}: clear permaneceu visível após limpar`,
    );

    await input.fill('Indis');
    const unavailable = preview.getByRole('option', { name: 'Indisponível' });
    await unavailable.waitFor();
    expect(await unavailable.getAttribute('aria-disabled') === 'true', `${route}: opção indisponível sem aria-disabled`);
    expect(await unavailable.getAttribute('aria-selected') !== 'true', `${route}: opção disabled iniciou selecionada`);
    await input.press('ArrowDown');
    await input.press('Enter');
    expect(await input.inputValue() !== 'Indisponível', `${route}: opção disabled foi selecionada`);
    await input.press('ArrowDown');
    expect(
      await input.evaluate(async (element) => {
        for (let frame = 0; frame < 30; frame += 1) {
          if (element.getAttribute('aria-expanded') === 'true') return true;
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
        return element.getAttribute('aria-expanded') === 'true';
      }),
      `${route}: ArrowDown não abriu o listbox`,
    );
    await page.waitForTimeout(50);
    await input.press('Escape');
    expect(
      await input.evaluate(async (element) => {
        for (let frame = 0; frame < 30; frame += 1) {
          if (element.getAttribute('aria-expanded') === 'false') return true;
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
        return element.getAttribute('aria-expanded') === 'false';
      }),
      `${route}: Escape não fechou o listbox`,
    );
    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em desktop`);
    await auditAxe(`${route} · Combobox`);
  }

  recordBrowserErrors('Combobox · seletor das quatro saídas');
}

async function auditSelectOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/select/',
      activeLabel: 'HTML/CSS/JS',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-form-select--playground',
      guidanceCount: 4,
      native: true,
      nativeValue: 'Chile',
    },
    {
      route: '/ds-tis/next/pt-br/ark/components/select/',
      activeLabel: 'Ark/Zag',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'ark-select--playground',
      guidanceCount: 3,
      native: false,
      nativeValue: null,
    },
    {
      route: '/ds-tis/next/pt-br/react/components/select/',
      activeLabel: 'React · shadcn/Base UI',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-select--playground',
      guidanceCount: 3,
      native: false,
      nativeValue: null,
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/select/',
      activeLabel: 'Angular',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-select--playground',
      guidanceCount: 3,
      native: true,
      nativeValue: 'cl',
    },
  ];

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const { activeLabel, guidanceCount, native, nativeValue, previewSelector, route, storyId } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    const options = page.locator('[data-technology-select] option');
    expect(await options.count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    for (const label of ['HTML/CSS/JS', 'Ark/Zag', 'React · shadcn/Base UI', 'Angular']) {
      expect(
        await options.filter({ hasText: label }).count() === 1 &&
          !(await options.filter({ hasText: label }).isDisabled()),
        `${route}: saída ${label} ausente ou indisponível`,
      );
    }
    expect(await page.locator('[data-component-tab]').count() === 4, `${route}: quatro visões editoriais ausentes`);
    expect(
      await page.locator('.ds-source-guidance[data-source-path="docs/select.html"]').count() === guidanceCount,
      `${route}: documentação rica do Select deveria expor ${guidanceCount} tópicos`,
    );
    const anatomy = page.locator('[data-component-panel="design"] .ds-source-guidance .ds-anatomy');
    expect(await anatomy.count() === 1, `${route}: anatomia do Select ausente`);
    expect(
      await anatomy.locator('.ds-anatomy__marker').count() === 7 &&
        await anatomy.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return [...element.querySelectorAll('.ds-anatomy__marker')].every((marker) => {
            const rect = marker.getBoundingClientRect();
            return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1 &&
              rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1;
          });
        }),
      `${route}: bullets numerados da anatomia estão ausentes ou recortados`,
    );
    expect(
      await page.locator('[data-component-panel="design"] .ds-source-guidance .ds-select').evaluateAll((controls) =>
        controls.length > 0 && controls.every((control) => {
          const rect = control.getBoundingClientRect();
          return rect.width > rect.height && rect.height >= 32 && rect.height <= 48;
        })
      ),
      `${route}: exemplos estáticos têm Select cortado ou deformado`,
    );
    expect(
      await page.locator('[data-component-panel="design"] .ds-table-scroll').evaluateAll((regions) =>
        regions.length > 0 && regions.every((region) => {
          const table = region.querySelector('table');
          if (!table) return false;
          return table.getBoundingClientRect().width >= region.clientWidth - 1;
        })
      ),
      `${route}: tabela visível não preenche a largura do container`,
    );
    expect(await page.locator(previewSelector).count() === 1, `${route}: preview funcional próprio ausente`);
    await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
    expect(
      (await page.locator(previewSelector).getAttribute('src'))?.includes(storyId),
      `${route}: preview não aponta para ${storyId}`,
    );

    const preview = page.frameLocator(previewSelector);
    const trigger = preview.getByRole('combobox', { name: 'País' });
    await trigger.waitFor();

    if (native) {
      await trigger.selectOption({ label: 'Chile' });
      expect(await trigger.inputValue() === nativeValue, `${route}: select nativo não selecionou Chile`);
      const unavailable = preview.getByRole('option', { name: 'Indisponível' });
      expect(await unavailable.isDisabled(), `${route}: opção indisponível do select nativo não está disabled`);
    } else {
      await trigger.click();
      const unavailable = preview.getByRole('option', { name: 'Indisponível' });
      await unavailable.waitFor();
      expect(await unavailable.getAttribute('aria-disabled') === 'true', `${route}: opção indisponível sem aria-disabled`);
      await preview.getByRole('option', { name: 'Chile' }).click();
      expect((await trigger.textContent())?.includes('Chile'), `${route}: click não selecionou Chile`);
      expect(await trigger.getAttribute('aria-expanded') === 'false', `${route}: seleção não fechou o listbox`);

      await trigger.press('p');
      expect((await trigger.textContent())?.includes('Portugal'), `${route}: typeahead não selecionou Portugal`);
      await trigger.press('ArrowDown');
      expect(await trigger.getAttribute('aria-expanded') === 'true', `${route}: ArrowDown não abriu o listbox`);
      await page.waitForTimeout(50);
      await trigger.press('Escape');
      expect(
        await trigger.evaluate(async (element) => {
          for (let frame = 0; frame < 30; frame += 1) {
            if (element.getAttribute('aria-expanded') === 'false') return true;
            await new Promise((resolve) => requestAnimationFrame(resolve));
          }
          return element.getAttribute('aria-expanded') === 'false';
        }),
        `${route}: Escape não fechou o listbox`,
      );
    }

    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em desktop`);
    await auditAxe(`${route} · Select`);
  }

  recordBrowserErrors('Select · seletor das quatro saídas');
}

async function auditMenuOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/menu/',
      activeLabel: 'HTML/CSS/JS',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-menu--action-menu',
      guidanceCount: 4,
    },
    {
      route: '/ds-tis/next/pt-br/ark/components/menu/',
      activeLabel: 'Ark/Zag',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'ark-menu--playground',
      guidanceCount: 3,
    },
    {
      route: '/ds-tis/next/pt-br/react/components/menu/',
      activeLabel: 'React · shadcn/Base UI',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-menu--playground',
      guidanceCount: 3,
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/menu/',
      activeLabel: 'Angular',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-menu--playground',
      guidanceCount: 3,
    },
  ];

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const { activeLabel, guidanceCount, previewSelector, route, storyId } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    const options = page.locator('[data-technology-select] option');
    expect(await options.count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    for (const label of ['HTML/CSS/JS', 'Ark/Zag', 'React · shadcn/Base UI', 'Angular']) {
      expect(
        await options.filter({ hasText: label }).count() === 1 &&
          !(await options.filter({ hasText: label }).isDisabled()),
        `${route}: saída ${label} ausente ou indisponível`,
      );
    }
    expect(await page.locator('[data-component-tab]').count() === 4, `${route}: quatro visões editoriais ausentes`);
    expect(
      await page.locator('.ds-source-guidance[data-source-path="docs/menu.html"]').count() === guidanceCount,
      `${route}: documentação rica do Menu deveria expor ${guidanceCount} tópicos`,
    );
    expect(await page.locator(previewSelector).count() === 1, `${route}: preview funcional próprio ausente`);
    await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
    expect(
      (await page.locator(previewSelector).getAttribute('src'))?.includes(storyId),
      `${route}: preview não aponta para ${storyId}`,
    );

    const preview = page.frameLocator(previewSelector);
    const trigger = preview.getByRole('button', { name: 'Ações do projeto' });
    await trigger.waitFor();
    await trigger.click();
    const menu = preview.getByRole('menu', { name: 'Ações do projeto' });
    await menu.waitFor({ state: 'visible' });
    expect(
      await trigger.evaluate(async (element) => {
        for (let frame = 0; frame < 30; frame += 1) {
          if (element.getAttribute('aria-expanded') === 'true') return true;
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
        return element.getAttribute('aria-expanded') === 'true';
      }),
      `${route}: trigger não abriu o Menu`,
    );
    const items = preview.getByRole('menuitem');
    expect(await items.count() >= 3, `${route}: Menu não expôs os comandos esperados`);

    await trigger.press('Escape');
    await menu.waitFor({ state: 'hidden' });
    await trigger.press('ArrowDown');
    await menu.waitFor({ state: 'visible' });
    const duplicate = preview.getByRole('menuitem', { name: 'Duplicar projeto' });
    if (activeLabel === 'Ark/Zag') {
      expect(
        await menu.evaluate(async (element) => {
          for (let frame = 0; frame < 30; frame += 1) {
            const activeId = element.getAttribute('aria-activedescendant');
            if (element === document.activeElement && activeId === element.querySelector('[role="menuitem"]')?.id) return true;
            await new Promise((resolve) => requestAnimationFrame(resolve));
          }
          const activeId = element.getAttribute('aria-activedescendant');
          return element === document.activeElement && activeId === element.querySelector('[role="menuitem"]')?.id;
        }),
        `${route}: ArrowDown não ativou o primeiro comando por aria-activedescendant`,
      );
      await menu.press('End');
      expect(
        await items.last().evaluate((element) => element.hasAttribute('data-highlighted')),
        `${route}: End não ativou o último comando`,
      );
      await menu.press('Home');
      expect(
        await items.first().evaluate((element) => element.hasAttribute('data-highlighted')),
        `${route}: Home não retornou ao primeiro comando`,
      );
      await menu.press('d');
      expect(
        await duplicate.evaluate((element) => element.hasAttribute('data-highlighted')),
        `${route}: typeahead não ativou Duplicar projeto`,
      );
      await menu.press('Escape');
    } else {
      expect(
        await items.first().evaluate(async (element) => {
          for (let frame = 0; frame < 30; frame += 1) {
            if (element === document.activeElement) return true;
            await new Promise((resolve) => requestAnimationFrame(resolve));
          }
          return element === document.activeElement;
        }),
        `${route}: ArrowDown no trigger não focou o primeiro comando`,
      );
      await items.first().press('End');
      expect(
        await items.last().evaluate((element) => element === document.activeElement),
        `${route}: End não focou o último comando`,
      );
      await items.last().press('Home');
      expect(
        await items.first().evaluate((element) => element === document.activeElement),
        `${route}: Home não retornou ao primeiro comando`,
      );
      await items.first().press('d');
      expect(
        await duplicate.evaluate((element) => element === document.activeElement),
        `${route}: typeahead não focou Duplicar projeto`,
      );
      await duplicate.press('Escape');
    }
    await menu.waitFor({ state: 'hidden' });
    expect(
      await trigger.evaluate((element) => element === document.activeElement),
      `${route}: Escape não devolveu o foco ao trigger`,
    );
    expect(await trigger.getAttribute('aria-expanded') === 'false', `${route}: Escape não fechou o Menu`);
    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em desktop`);
    await auditAxe(`${route} · Menu`);
  }

  recordBrowserErrors('Menu · seletor das quatro saídas');
}

async function auditTooltipOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/tooltip/',
      activeLabel: 'HTML/CSS/JS',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-tooltip--playground',
      triggerName: 'Configurações',
      guidanceCount: 4,
    },
    {
      route: '/ds-tis/next/pt-br/ark/components/tooltip/',
      activeLabel: 'Ark/Zag',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'ark-tooltip--playground',
      triggerName: 'Informações do projeto',
      guidanceCount: 3,
    },
    {
      route: '/ds-tis/next/pt-br/react/components/tooltip/',
      activeLabel: 'React · shadcn/Base UI',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-tooltip--playground',
      triggerName: 'Informações do projeto',
      guidanceCount: 3,
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/tooltip/',
      activeLabel: 'Angular',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-tooltip--playground',
      triggerName: 'Editar',
      guidanceCount: 3,
    },
  ];

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const { activeLabel, guidanceCount, previewSelector, route, storyId, triggerName } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    const options = page.locator('[data-technology-select] option');
    expect(await options.count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    expect(
      await page.locator('.ds-source-guidance[data-source-path="docs/tooltip.html"]').count() === guidanceCount,
      `${route}: documentação rica do Tooltip deveria expor ${guidanceCount} tópicos`,
    );
    const outputPreview = page.locator(previewSelector);
    expect(await outputPreview.count() === 1, `${route}: preview funcional próprio ausente`);
    await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
    expect((await outputPreview.getAttribute('src'))?.includes(storyId), `${route}: preview não aponta para ${storyId}`);

    const preview = page.frameLocator(previewSelector);
    const trigger = preview.getByRole('button', { name: triggerName });
    await trigger.waitFor();
    await trigger.hover();
    const tooltip = preview.getByRole('tooltip');
    await tooltip.waitFor({ state: 'visible' });
    const tooltipId = await tooltip.getAttribute('id');
    expect(Boolean(tooltipId), `${route}: Tooltip não possui id`);
    expect(
      (await trigger.getAttribute('aria-describedby'))?.split(/\s+/).includes(tooltipId),
      `${route}: trigger não referencia o Tooltip com aria-describedby`,
    );
    expect(
      await tooltip.evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 &&
          style.backgroundColor === 'rgb(15, 23, 42)' &&
          style.color === 'rgb(248, 250, 252)' &&
          style.fontSize === '14px' &&
          style.lineHeight === '20px' &&
          style.borderRadius === '8px';
      }),
      `${route}: Tooltip não preservou o contrato visual tokenizado`,
    );
    const tooltipBox = await tooltip.boundingBox();
    if (tooltipBox) {
      await page.mouse.move(tooltipBox.x + tooltipBox.width / 2, tooltipBox.y + tooltipBox.height / 2);
      await page.waitForTimeout(180);
      expect(await tooltip.isVisible(), `${route}: conteúdo não permaneceu hoverable`);
    }
    await trigger.focus();
    await tooltip.waitFor({ state: 'visible' });
    await trigger.press('Escape');
    await tooltip.waitFor({ state: 'hidden' });
    expect(
      await trigger.evaluate((element) => element === document.activeElement),
      `${route}: Escape moveu foco para fora do trigger`,
    );
    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em desktop`);
    await auditAxe(`${route} · Tooltip`);
  }

  recordBrowserErrors('Tooltip · seletor das quatro saídas');
}

async function auditTabsOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/tabs/',
      activeLabel: 'HTML/CSS/JS',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-tabs--playground',
      tablistName: 'Configurações da conta',
      guidanceCount: 4,
      skipsDisabledEnd: false,
    },
    {
      route: '/ds-tis/next/pt-br/ark/components/tabs/',
      activeLabel: 'Ark/Zag',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'ark-tabs--playground',
      tablistName: 'Seções do projeto',
      guidanceCount: 3,
      skipsDisabledEnd: true,
    },
    {
      route: '/ds-tis/next/pt-br/react/components/tabs/',
      activeLabel: 'React · shadcn/Base UI',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-tabs--playground',
      tablistName: 'Seções do projeto',
      guidanceCount: 3,
      skipsDisabledEnd: true,
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/tabs/',
      activeLabel: 'Angular',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-tabs--playground',
      tablistName: 'Seções do projeto',
      guidanceCount: 3,
      skipsDisabledEnd: true,
    },
  ];

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const {
    activeLabel,
    guidanceCount,
    previewSelector,
    route,
    skipsDisabledEnd,
    storyId,
    tablistName,
  } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    expect(
      await page.locator('.ds-source-guidance[data-source-path="docs/tabs.html"]').count() === guidanceCount,
      `${route}: documentação rica de Tabs deveria expor ${guidanceCount} tópicos`,
    );
    const outputPreview = page.locator(previewSelector);
    expect(await outputPreview.count() === 1, `${route}: preview funcional próprio ausente`);
    await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
    expect((await outputPreview.getAttribute('src'))?.includes(storyId), `${route}: preview não aponta para ${storyId}`);

    const preview = page.frameLocator(previewSelector);
    const tablist = preview.getByRole('tablist', { name: tablistName });
    const tabs = tablist.getByRole('tab');
    await tablist.waitFor();
    expect(await tabs.count() === 3, `${route}: exemplo deve expor três tabs`);
    expect(await tabs.first().getAttribute('aria-selected') === 'true', `${route}: primeira tab não iniciou selecionada`);
    expect(
      await tabs.first().evaluate((element) => {
        const style = getComputedStyle(element);
        return style.fontSize === '14px' &&
          style.fontWeight === '700' &&
          style.lineHeight === '20px' &&
          style.padding === '12px 16px' &&
          style.borderBottomWidth === '2px';
      }),
      `${route}: tab ativa não preservou o contrato visual tokenizado`,
    );
    expect(
      await tabs.evaluateAll((elements) => elements.every((element) => getComputedStyle(element).whiteSpace === 'nowrap')),
      `${route}: labels das tabs não devem quebrar em múltiplas linhas`,
    );
    expect(
      await tablist.evaluate((element) => getComputedStyle(element).overflowX === 'auto'),
      `${route}: tablist deve permitir overflow horizontal local quando necessário`,
    );

    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(75);
    expect(
      await tabs.nth(1).getAttribute('aria-selected') === 'true' &&
        await tabs.nth(1).evaluate((element) => element === document.activeElement),
      `${route}: ArrowRight não ativou a segunda tab`,
    );
    await page.keyboard.press('End');
    await page.waitForTimeout(75);
    const expectedEndIndex = skipsDisabledEnd ? 1 : 2;
    expect(
      await tabs.nth(expectedEndIndex).evaluate((element) => element === document.activeElement),
      `${route}: End não respeitou a lista de tabs habilitadas`,
    );
    if (skipsDisabledEnd) {
      expect(await tabs.nth(2).getAttribute('aria-disabled') === 'true', `${route}: tab disabled perdeu aria-disabled`);
    }
    await page.keyboard.press('Home');
    await page.waitForTimeout(75);
    expect(
      await tabs.first().getAttribute('aria-selected') === 'true' &&
        await tabs.first().evaluate((element) => element === document.activeElement),
      `${route}: Home não restaurou a primeira tab`,
    );
    const panelContract = await preview.locator('[role="tabpanel"]').evaluateAll((elements) => {
      const visible = elements.filter((element) => !element.hidden && getComputedStyle(element).display !== 'none');
      return {
        count: visible.length,
        labelledBy: visible[0]?.getAttribute('aria-labelledby') ?? null,
      };
    });
    expect(panelContract.count === 1, `${route}: deve existir um único painel visível`);
    expect(
      panelContract.labelledBy === await tabs.first().getAttribute('id'),
      `${route}: painel não referencia a tab selecionada`,
    );
    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em desktop`);
    await auditAxe(`${route} · Tabs`);
  }

  await page.setViewportSize({ width: 320, height: 844 });
  const mobileRoute = '/ds-tis/next/pt-br/angular/components/tabs/';
  await page.goto(`${origin}${mobileRoute}`, { waitUntil: 'networkidle' });
  await page.locator('main h1').first().waitFor();
  const anatomy = page.locator('.ds-source-guidance[data-source-path="docs/tabs.html"] .ds-anatomy').first();
  const anatomyTablist = anatomy.locator('[role="tablist"]').first();
  const anatomyBounds = await anatomy.boundingBox();
  const markerBounds = await anatomy.locator('.ds-anatomy__marker').evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  }));
  expect(Boolean(anatomyBounds), `${mobileRoute}: anatomia não foi renderizada em 320px`);
  expect(
    await anatomyTablist.evaluate((element) => getComputedStyle(element).overflow === 'visible'),
    `${mobileRoute}: tablist demonstrativo não pode recortar os marcadores da anatomia`,
  );
  expect(
    markerBounds.length === 4 && markerBounds.every((marker) =>
      marker.left >= anatomyBounds.x - 1 &&
      marker.right <= anatomyBounds.x + anatomyBounds.width + 1 &&
      marker.top >= anatomyBounds.y - 1 &&
      marker.bottom <= anatomyBounds.y + anatomyBounds.height + 1),
    `${mobileRoute}: marcadores da anatomia ficaram cortados em 320px`,
  );
  expect(await horizontalOverflow() <= 1, `${mobileRoute}: overflow horizontal da página em 320px`);
  await auditAxe(`${mobileRoute} · Tabs · 320px`);

  recordBrowserErrors('Tabs · seletor das quatro saídas');
}

async function auditToastOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/toast/',
      activeLabel: 'HTML/CSS/JS',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-toast--playground',
      interactive: false,
    },
    {
      route: '/ds-tis/next/pt-br/ark/components/toast/',
      activeLabel: 'Ark/Zag',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'ark-toast--playground',
      interactive: true,
    },
    {
      route: '/ds-tis/next/pt-br/react/components/toast/',
      activeLabel: 'React · shadcn/Base UI',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-toast--playground',
      interactive: true,
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/toast/',
      activeLabel: 'Angular',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-toast--playground',
      interactive: true,
    },
  ];

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const { activeLabel, interactive, previewSelector, route, storyId } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    const expectedGuidanceCount = activeLabel === 'HTML/CSS/JS' ? 3 : 2;
    expect(
      await page.locator('.ds-source-guidance[data-source-path="docs/toast.html"]').count() === expectedGuidanceCount,
      `${route}: documentação rica de Toast deveria expor ${expectedGuidanceCount} blocos compartilhados`,
    );

    const outputPreview = page.locator(previewSelector);
    expect(await outputPreview.count() === 1, `${route}: preview funcional próprio ausente`);
    await page.waitForFunction((selector) => Boolean(document.querySelector(selector)?.getAttribute('src')), previewSelector);
    expect((await outputPreview.getAttribute('src'))?.includes(storyId), `${route}: preview não aponta para ${storyId}`);

    const preview = page.frameLocator(previewSelector);
    if (interactive) {
      await preview.getByRole('button', { name: 'Mostrar Toast' }).click();
    }
    const toast = preview.locator('.ds-toast').first();
    await toast.waitFor({ state: 'visible' });
    await page.waitForTimeout(300);
    expect(
      await toast.evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return element.classList.contains('ds-toast--success') &&
          element.classList.contains('ds-toast--subtle') &&
          rect.width > 0 && rect.width <= 640 &&
          rect.height >= 80 &&
          style.backgroundColor === 'rgb(213, 242, 217)' &&
          style.color === 'rgb(15, 23, 42)' &&
          style.padding === '12px' &&
          style.gap === '8px' &&
          style.borderRadius === '12px';
      }),
      `${route}: Toast não preservou o contrato visual tokenizado`,
    );
    const expectedTitle = activeLabel === 'Angular' || !interactive ? 'Alterações salvas' : 'Preferências salvas';
    expect(await toast.getByText(expectedTitle).isVisible(), `${route}: título ausente`);
    expect(await toast.getByRole('button', { name: 'Desfazer' }).isVisible(), `${route}: action ausente`);
    expect(await toast.getByRole('button', { name: 'Dispensar' }).isVisible(), `${route}: close ausente`);

    if (interactive) {
      const rect = await toast.evaluate((element) => {
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right, width: box.width, viewport: innerWidth };
      });
      expect(
        rect.left >= 0 && rect.right <= rect.viewport && rect.width <= 480,
        `${route}: Toast excedeu o viewport ou o limite de 480px (${JSON.stringify(rect)})`,
      );
      const action = toast.getByRole('button', { name: 'Desfazer' });
      expect(
        await action.evaluate((element) => {
          const box = element.getBoundingClientRect();
          return box.width > 0 && box.height > 0 && box.left >= 0 && box.top >= 0 &&
            box.right <= innerWidth && box.bottom <= innerHeight;
        }),
        `${route}: action do Toast ficou fora do viewport`,
      );
      await action.evaluate((element) => element.click());
      expect(
        await toast.isVisible(),
        `${route}: action deveria manter o Toast disponível até dismiss explícito`,
      );
      await preview.getByText(/(?:Ações|Actions) executadas:\s*1/).waitFor();
      expect(
        (await preview.getByText(/(?:Ações|Actions) executadas:/).textContent())?.includes('1'),
        `${route}: action não executou o callback`,
      );

      await toast.getByRole('button', { name: 'Dispensar' }).evaluate((element) => element.click());
      expect(
        await toast.waitFor({ state: 'hidden', timeout: 3000 }).then(() => true, () => false),
        `${route}: close não dispensou o Toast`,
      );
    }

    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em desktop`);
    await auditAxe(`${route} · Toast`);
  }

  recordBrowserErrors('Toast · seletor das quatro saídas');
}

async function auditCheckboxOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/checkbox/',
      activeLabel: 'HTML/CSS/JS',
      status: 'Estável',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-form-checkbox--playground',
      controlSelector: '.ds-checkbox',
      guidanceCount: 3,
      runtimeSelector: 'input.ds-checkbox',
    },
    {
      route: '/ds-tis/next/pt-br/ark/components/checkbox/',
      activeLabel: 'Ark/Zag',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'ark-checkbox--playground',
      controlSelector: '.ds-ark-checkbox__control',
      guidanceCount: 2,
      runtimeSelector: '[data-scope="checkbox"]',
    },
    {
      route: '/ds-tis/next/pt-br/react/components/checkbox/',
      activeLabel: 'React · shadcn/Base UI',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-checkbox--playground',
      controlSelector: '[data-slot="checkbox"]',
      guidanceCount: 2,
      runtimeSelector: '[data-slot="checkbox"]',
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/checkbox/',
      activeLabel: 'Angular',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-checkbox--playground',
      controlSelector: '.ds-checkbox',
      guidanceCount: 2,
      runtimeSelector: '[data-tis-angular-checkbox]',
    },
  ];

  await page.setViewportSize({ width: 390, height: 844 });
  for (const {
    activeLabel,
    controlSelector,
    guidanceCount,
    previewSelector,
    route,
    runtimeSelector,
    status,
    storyId,
  } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    expect((await page.locator('main h1').first().textContent())?.trim() === 'Checkbox', `${route}: título Checkbox ausente`);
    const technologyOptions = page.locator('[data-technology-select] option');
    expect(await technologyOptions.count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(
      await technologyOptions.filter({ hasText: 'Angular' }).isEnabled(),
      `${route}: saída Angular ainda aparece desabilitada`,
    );
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    expect(
      (await page.locator('[data-component-panel="implementation"] .ds-react-contract dd').allTextContents()).includes(status),
      `${route}: status ${status} ausente`,
    );
    expect(
      await page.locator('.ds-source-guidance[data-source-path="docs/checkbox.html"]').count() === guidanceCount,
      `${route}: documentação compartilhada deveria expor ${guidanceCount} tópicos`,
    );
    const anatomy = page.locator('[data-component-panel="design"] .ds-source-guidance .ds-anatomy');
    expect(await anatomy.count() === 1, `${route}: anatomia do Checkbox ausente`);
    expect(
      await anatomy.locator('.ds-anatomy__marker').count() === 4 &&
        await anatomy.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return [...element.querySelectorAll('.ds-anatomy__marker')].every((marker) => {
            const rect = marker.getBoundingClientRect();
            return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1 &&
              rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1;
          });
        }),
      `${route}: bullets numerados da anatomia estão ausentes ou recortados`,
    );
    expect(
      await page.locator('[data-component-panel="design"] .ds-source-guidance .ds-checkbox').evaluateAll((controls) =>
        controls.length > 0 && controls.every((control) => {
          const rect = control.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && Math.abs(rect.width - rect.height) <= 0.5;
        })
      ),
      `${route}: exemplos estáticos têm Checkbox cortado ou deformado`,
    );
    expect(
      await page.locator('[data-component-panel="design"] .ds-table-scroll').evaluateAll((regions) =>
        regions.length > 0 && regions.every((region) => {
          const table = region.querySelector('table');
          if (!table) return false;
          const tableRect = table.getBoundingClientRect();
          return tableRect.width >= region.clientWidth - 1;
        })
      ),
      `${route}: tabela visível não preenche a largura do container`,
    );
    expect(await page.locator(previewSelector).count() === 1, `${route}: preview funcional próprio ausente`);
    expect((await page.locator(previewSelector).getAttribute('src'))?.includes(storyId), `${route}: preview não aponta para ${storyId}`);

    const preview = page.frameLocator(previewSelector);
    expect(await preview.locator(runtimeSelector).count() >= 1, `${route}: preview não usa o runtime independente de ${activeLabel}`);
    const checkbox = preview.getByRole('checkbox');
    const control = preview.locator(controlSelector).first();
    await checkbox.waitFor();
    const initial = await checkbox.isChecked();
    await checkbox.focus();
    await checkbox.press('Space');
    await page.waitForTimeout(150);
    expect(await checkbox.isChecked() !== initial, `${route}: Space não alternou o Checkbox`);
    expect(
      await control.evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return rect.width === 20 && rect.height === 20 &&
          style.outlineStyle === 'solid' && Number.parseFloat(style.outlineWidth) >= 2;
      }),
      `${route}: geometria ou focus ring do Checkbox divergiu do contrato TIS`,
    );
    const themeSelect = page.locator('starlight-theme-select select').first();
    await themeSelect.evaluate((select) => {
      select.value = 'dark';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await page.waitForFunction((selector) => document.querySelector(selector)?.getAttribute('src')?.includes('mode%3Adark'), previewSelector);
    await page.waitForFunction((selector) => document.querySelector(selector)?.closest('[data-output-preview-shell]')?.getAttribute('aria-busy') === 'false', previewSelector);
    expect(
      await preview.locator('html').getAttribute('data-mode') === 'dark',
      `${route}: exemplo interativo não recebeu o tema dark`,
    );
    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);
    await auditAxe(`${route} · Checkbox`);
  }

  recordBrowserErrors('Checkbox · seletor das quatro saídas');
}

async function auditRadioOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/radio/',
      activeLabel: 'HTML/CSS/JS',
      status: 'Estável',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-form-radio--playground',
      controlSelector: '.ds-radio',
      guidanceCount: 3,
      runtimeSelector: 'input.ds-radio',
    },
    {
      route: '/ds-tis/next/pt-br/ark/components/radio/',
      activeLabel: 'Ark/Zag',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'ark-radio--playground',
      controlSelector: '.ds-ark-radio__control',
      guidanceCount: 2,
      runtimeSelector: '[data-scope="radio-group"]',
    },
    {
      route: '/ds-tis/next/pt-br/react/components/radio/',
      activeLabel: 'React · shadcn/Base UI',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-radio--playground',
      controlSelector: '[data-slot="radio-group-item"]',
      guidanceCount: 2,
      runtimeSelector: '[data-slot="radio-group-item"]',
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/radio/',
      activeLabel: 'Angular',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-radio--playground',
      controlSelector: '.ds-radio',
      guidanceCount: 2,
      runtimeSelector: '[data-tis-angular-radio-group]',
    },
  ];

  await page.setViewportSize({ width: 390, height: 844 });
  for (const {
    activeLabel,
    controlSelector,
    guidanceCount,
    previewSelector,
    route,
    runtimeSelector,
    status,
    storyId,
  } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    expect((await page.locator('main h1').first().textContent())?.trim() === 'Radio', `${route}: título Radio ausente`);
    const technologyOptions = page.locator('[data-technology-select] option');
    expect(await technologyOptions.count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(
      await technologyOptions.filter({ hasText: 'Angular' }).isEnabled(),
      `${route}: saída Angular ainda aparece desabilitada`,
    );
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    expect(
      (await page.locator('[data-component-panel="implementation"] .ds-react-contract dd').allTextContents()).includes(status),
      `${route}: status ${status} ausente`,
    );
    expect(
      await page.locator('.ds-source-guidance[data-source-path="docs/radio.html"]').count() === guidanceCount,
      `${route}: documentação compartilhada deveria expor ${guidanceCount} tópicos`,
    );
    const anatomy = page.locator('[data-component-panel="design"] .ds-source-guidance .ds-anatomy');
    expect(await anatomy.count() === 1, `${route}: anatomia do Radio ausente`);
    expect(
      await anatomy.locator('.ds-anatomy__marker').count() === 5 &&
        await anatomy.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return [...element.querySelectorAll('.ds-anatomy__marker')].every((marker) => {
            const rect = marker.getBoundingClientRect();
            return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1 &&
              rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1;
          });
        }),
      `${route}: bullets numerados da anatomia estão ausentes ou recortados`,
    );
    expect(
      await page.locator('[data-component-panel="design"] .ds-source-guidance .ds-radio').evaluateAll((controls) =>
        controls.length > 0 && controls.every((control) => {
          const rect = control.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && Math.abs(rect.width - rect.height) <= 0.5;
        })
      ),
      `${route}: exemplos estáticos têm Radio cortado ou deformado`,
    );
    expect(
      await page.locator('[data-component-panel="design"] .ds-table-scroll').evaluateAll((regions) =>
        regions.length > 0 && regions.every((region) => {
          const table = region.querySelector('table');
          if (!table) return false;
          const tableRect = table.getBoundingClientRect();
          return tableRect.width >= region.clientWidth - 1;
        })
      ),
      `${route}: tabela visível não preenche a largura do container`,
    );
    expect(await page.locator(previewSelector).count() === 1, `${route}: preview funcional próprio ausente`);
    expect((await page.locator(previewSelector).getAttribute('src'))?.includes(storyId), `${route}: preview não aponta para ${storyId}`);

    const preview = page.frameLocator(previewSelector);
    expect(await preview.locator(runtimeSelector).count() >= 1, `${route}: preview não usa o runtime independente de ${activeLabel}`);
    const radios = preview.getByRole('radio');
    await radios.first().waitFor();
    expect(await radios.count() === 2, `${route}: o exemplo comparável deve conter duas opções`);
    expect(await radios.first().isChecked(), `${route}: a primeira opção deveria iniciar selecionada`);
    await radios.first().focus();
    await radios.first().press('ArrowDown');
    await page.waitForTimeout(150);
    expect(await radios.nth(1).isChecked(), `${route}: ArrowDown não selecionou a próxima opção`);
    expect(
      await preview.locator(controlSelector).nth(1).evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return rect.width === 20 && rect.height === 20 &&
          style.outlineStyle === 'solid' && Number.parseFloat(style.outlineWidth) >= 2;
      }),
      `${route}: geometria ou focus ring do Radio divergiu do contrato TIS`,
    );
    const themeSelect = page.locator('starlight-theme-select select').first();
    await themeSelect.evaluate((select) => {
      select.value = 'dark';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await page.waitForFunction((selector) => document.querySelector(selector)?.getAttribute('src')?.includes('mode%3Adark'), previewSelector);
    await page.waitForFunction((selector) => document.querySelector(selector)?.closest('[data-output-preview-shell]')?.getAttribute('aria-busy') === 'false', previewSelector);
    expect(
      await preview.locator('html').getAttribute('data-mode') === 'dark',
      `${route}: exemplo interativo não recebeu o tema dark`,
    );
    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);
    await auditAxe(`${route} · Radio`);
  }

  recordBrowserErrors('Radio · seletor das quatro saídas');
}

async function auditToggleOutputSelector() {
  browserErrors.length = 0;
  const routes = [
    {
      route: '/ds-tis/next/pt-br/web/components/toggle/',
      activeLabel: 'HTML/CSS/JS',
      status: 'Estável',
      previewSelector: '[data-output-preview][data-output-storybook="stable"]',
      storyId: 'components-form-toggle--playground',
      controlSelector: '.ds-toggle',
      guidanceCount: 3,
      runtimeSelector: 'input.ds-toggle',
    },
    {
      route: '/ds-tis/next/pt-br/ark/components/toggle/',
      activeLabel: 'Ark/Zag',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'ark-toggle--playground',
      controlSelector: '.ds-ark-toggle__control',
      guidanceCount: 2,
      runtimeSelector: '[data-scope="switch"]',
    },
    {
      route: '/ds-tis/next/pt-br/react/components/toggle/',
      activeLabel: 'React · shadcn/Base UI',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="vnext"]',
      storyId: 'react-toggle--playground',
      controlSelector: '[data-slot="switch"]',
      guidanceCount: 2,
      runtimeSelector: '[data-slot="switch"]',
    },
    {
      route: '/ds-tis/next/pt-br/angular/components/toggle/',
      activeLabel: 'Angular',
      status: 'Beta',
      previewSelector: '[data-output-preview][data-output-storybook="angular"]',
      storyId: 'angular-toggle--playground',
      controlSelector: '.ds-toggle',
      guidanceCount: 2,
      runtimeSelector: '[data-tis-angular-toggle]',
    },
  ];

  await page.setViewportSize({ width: 390, height: 844 });
  for (const {
    activeLabel,
    controlSelector,
    guidanceCount,
    previewSelector,
    route,
    runtimeSelector,
    status,
    storyId,
  } of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();
    expect((await page.locator('main h1').first().textContent())?.trim() === 'Toggle', `${route}: título Toggle ausente`);
    const technologyOptions = page.locator('[data-technology-select] option');
    expect(await technologyOptions.count() === 4, `${route}: seletor não expõe as quatro saídas`);
    expect(
      await technologyOptions.filter({ hasText: 'Angular' }).isEnabled(),
      `${route}: saída Angular ainda aparece desabilitada`,
    );
    expect(
      (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === activeLabel,
      `${route}: saída ativa incorreta`,
    );
    expect(
      (await page.locator('[data-component-panel="implementation"] .ds-react-contract dd').allTextContents()).includes(status),
      `${route}: status ${status} ausente`,
    );
    expect(
      await page.locator('.ds-source-guidance[data-source-path="docs/toggle.html"]').count() === guidanceCount,
      `${route}: documentação compartilhada deveria expor ${guidanceCount} tópicos`,
    );
    const anatomy = page.locator('[data-component-panel="design"] .ds-source-guidance .ds-anatomy');
    expect(await anatomy.count() === 1, `${route}: anatomia do Toggle ausente`);
    expect(
      await anatomy.locator('.ds-anatomy__marker').count() === 4 &&
        await anatomy.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return [...element.querySelectorAll('.ds-anatomy__marker')].every((marker) => {
            const rect = marker.getBoundingClientRect();
            return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1 &&
              rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1;
          });
        }),
      `${route}: bullets numerados da anatomia estão ausentes ou recortados`,
    );
    expect(
      await page.locator('[data-component-panel="design"] .ds-source-guidance .ds-toggle').evaluateAll((controls) =>
        controls.length > 0 && controls.every((control) => {
          const rect = control.getBoundingClientRect();
          return rect.width > rect.height && rect.height > 0;
        })
      ),
      `${route}: exemplos estáticos têm Toggle cortado ou deformado`,
    );
    expect(
      await page.locator('[data-component-panel="design"] .ds-table-scroll').evaluateAll((regions) =>
        regions.length > 0 && regions.every((region) => {
          const table = region.querySelector('table');
          if (!table) return false;
          const tableRect = table.getBoundingClientRect();
          return tableRect.width >= region.clientWidth - 1;
        })
      ),
      `${route}: tabela visível não preenche a largura do container`,
    );
    expect(await page.locator(previewSelector).count() === 1, `${route}: preview funcional próprio ausente`);
    expect((await page.locator(previewSelector).getAttribute('src'))?.includes(storyId), `${route}: preview não aponta para ${storyId}`);

    const preview = page.frameLocator(previewSelector);
    expect(await preview.locator(runtimeSelector).count() >= 1, `${route}: preview não usa o runtime independente de ${activeLabel}`);
    const toggle = preview.getByRole('switch');
    const control = preview.locator(controlSelector).first();
    await toggle.waitFor();
    const labelBefore = (await preview.locator('.ds-toggle__label').first().textContent())?.trim();
    expect(await toggle.isChecked(), `${route}: Toggle deveria iniciar ligado`);
    await toggle.focus();
    await toggle.press('Space');
    await page.waitForTimeout(150);
    expect(!await toggle.isChecked(), `${route}: Space não alternou o Toggle`);
    expect(
      (await preview.locator('.ds-toggle__label').first().textContent())?.trim() === labelBefore,
      `${route}: label do Toggle mudou com o estado`,
    );
    expect(
      await control.evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return rect.width === 44 && rect.height === 24 &&
          style.outlineStyle === 'solid' && Number.parseFloat(style.outlineWidth) >= 2;
      }),
      `${route}: geometria ou focus ring do Toggle divergiu do contrato TIS`,
    );
    const themeSelect = page.locator('starlight-theme-select select').first();
    await themeSelect.evaluate((select) => {
      select.value = 'dark';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await page.waitForFunction((selector) => document.querySelector(selector)?.getAttribute('src')?.includes('mode%3Adark'), previewSelector);
    await page.waitForFunction((selector) => document.querySelector(selector)?.closest('[data-output-preview-shell]')?.getAttribute('aria-busy') === 'false', previewSelector);
    expect(
      await preview.locator('html').getAttribute('data-mode') === 'dark',
      `${route}: exemplo interativo não recebeu o tema dark`,
    );
    expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);
    await auditAxe(`${route} · Toggle`);
  }

  recordBrowserErrors('Toggle · seletor das quatro saídas');
}

async function auditFormControlGuidance() {
  const cases = [
    {
      slug: 'input',
      controlSelector: '.ds-input',
      sizeSelectors: ['.ds-input--sm', '.ds-input--md', '.ds-input--lg'],
      expectedHeights: [32, 40, 48],
      minimumCanvases: 7,
    },
    {
      slug: 'textarea',
      controlSelector: '.ds-textarea',
      sizeSelectors: [
        '.ds-textarea--sm .ds-textarea__field',
        '.ds-textarea--md .ds-textarea__field',
        '.ds-textarea--lg .ds-textarea__field',
      ],
      expectedHeights: [80, 96, 120],
      minimumCanvases: 6,
    },
  ];

  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });

    for (const config of cases) {
      browserErrors.length = 0;
      const route = `/ds-tis/next/pt-br/angular/components/${config.slug}/`;
      const label = `${route} · documentação compartilhada @ ${width}px`;

      await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
      await page.locator('[data-component-panel-select]').evaluate((select) => {
        select.value = 'design';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      const themeSelect = page.locator('starlight-theme-select select').first();
      await themeSelect.evaluate((select) => {
        select.value = 'dark';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');

      const guidance = page.locator(
        `[data-component-panel="design"] .ds-source-guidance[data-component-source="${config.slug}"]`,
      );
      await guidance.waitFor();

      const geometry = await guidance.evaluate((root, current) => {
        const anatomy = root.querySelector('.ds-anatomy');
        const anatomyBounds = anatomy?.getBoundingClientRect();
        const markers = [...(anatomy?.querySelectorAll('.ds-anatomy__marker') || [])].map((marker) => {
          const rect = marker.getBoundingClientRect();
          return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
        });
        const markerOverlap = markers.some((marker, index) => markers.slice(index + 1).some((other) =>
          Math.min(marker.right, other.right) > Math.max(marker.left, other.left) &&
          Math.min(marker.bottom, other.bottom) > Math.max(marker.top, other.top)
        ));
        const canvases = [...root.querySelectorAll('.ds-preview__canvas')];
        const controls = [...root.querySelectorAll(`.ds-preview__canvas ${current.controlSelector}`)];

        return {
          anatomyControlHeight: anatomy?.querySelector(current.controlSelector)?.getBoundingClientRect().height || 0,
          canvasBackgrounds: canvases.map((canvas) => getComputedStyle(canvas).backgroundColor),
          canvasCount: canvases.length,
          canvasesFillCards: canvases.every((canvas) => {
            const canvasBounds = canvas.getBoundingClientRect();
            const cardBounds = canvas.closest('.ds-preview')?.getBoundingClientRect();
            return cardBounds && Math.abs(canvasBounds.width - (cardBounds.width - 2)) <= 1;
          }),
          controlsHaveGeometry: controls.length > 0 && controls.every((control) => {
            const rect = control.getBoundingClientRect();
            return getComputedStyle(control).display === 'flex' && rect.width >= 180 && rect.height > 0;
          }),
          iconCounts: {
            eye: root.querySelectorAll('svg.lucide-eye').length,
            mail: root.querySelectorAll('svg.lucide-mail').length,
            search: root.querySelectorAll('svg.lucide-search').length,
          },
          markerCount: markers.length,
          markerOverlap,
          markersFit: Boolean(anatomyBounds) && markers.every((marker) =>
            marker.left >= anatomyBounds.left - 1 && marker.right <= anatomyBounds.right + 1 &&
            marker.top >= anatomyBounds.top - 1 && marker.bottom <= anatomyBounds.bottom + 1
          ),
          sizeHeights: current.sizeSelectors.map((selector) =>
            root.querySelector(selector)?.getBoundingClientRect().height || 0
          ),
        };
      }, config);

      expect(geometry.markerCount === 6, `${label}: anatomia não contém os seis bullets numerados`);
      expect(geometry.markersFit, `${label}: bullets da anatomia estão recortados`);
      expect(!geometry.markerOverlap, `${label}: bullets da anatomia estão sobrepostos`);
      expect(geometry.anatomyControlHeight >= 40, `${label}: controle da anatomia está colapsado`);
      expect(
        geometry.canvasCount >= config.minimumCanvases && geometry.canvasesFillCards,
        `${label}: canvases não preenchem a largura dos cards`,
      );
      expect(geometry.controlsHaveGeometry, `${label}: exemplos têm controles colapsados ou estreitos`);
      expect(
        geometry.canvasBackgrounds.every((color) => color !== 'rgb(255, 255, 255)'),
        `${label}: canvases não acompanharam o tema dark`,
      );
      expect(
        geometry.sizeHeights.every((height, index) => Math.abs(height - config.expectedHeights[index]) <= 1),
        `${label}: tamanhos renderizados divergiram (${geometry.sizeHeights.join('/')})`,
      );
      if (config.slug === 'input') {
        expect(
          geometry.iconCounts.mail === 2 && geometry.iconCounts.eye === 1 && geometry.iconCounts.search === 1,
          `${label}: ícones Mail, Eye ou Search não foram renderizados`,
        );
      }
      expect(await horizontalOverflow() <= 1, `${label}: página possui overflow horizontal`);
      if (width === 390) await auditAxe(label);
      recordBrowserErrors(label);
    }
  }
}

async function auditResponsiveButton(width, height) {
  const route = `/ds-tis/next/pt-br/web/components/button/`;
  const label = `${route} @ ${width}px`;
  browserErrors.length = 0;
  await page.setViewportSize({ width, height });
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  await page.locator('main h1').first().waitFor();

  expect(await page.locator('[data-technology-select]').isVisible(), `${label}: select de tecnologia ausente`);
  expect(await page.locator('#ds-doc-version').count() === 0, `${label}: seletor de versão redundante reapareceu`);
  expect(await page.locator('.ds-section-nav').count() === 0, `${label}: SectionNav duplicado reapareceu`);
  expect(await horizontalOverflow() <= 1, `${label}: página possui overflow horizontal`);
  await auditPrimaryTabAlignment(label);

  for (const selector of [
    '.ds-doc-context',
    '[data-component-layout]',
    '.ds-component-tabs',
  ]) {
    expect(
      await elementFitsViewport(selector),
      `${label}: ${selector} ultrapassa o viewport`,
    );
  }

  const tokenTable = page.locator('.ds-token-table').first();
  if (await tokenTable.count()) {
    const tableScroller = page.locator('.ds-table-scroll').first();
    expect(await tableScroller.count() === 1, `${label}: tabela de tokens não possui invólucro responsivo`);
    expect(await elementFitsViewport('.ds-table-scroll'), `${label}: região da tabela de tokens vaza do viewport`);
    expect(
      await tokenTable.evaluate((table) => {
        const wrapper = table.parentElement;
        const row = table.querySelector('tr');
        if (!wrapper || !row) return false;
        const tableWidth = table.getBoundingClientRect().width;
        const rowWidth = row.getBoundingClientRect().width;
        return getComputedStyle(table).display === 'table' &&
          tableWidth >= wrapper.clientWidth - 2 &&
          Math.abs(tableWidth - rowWidth) <= 2;
      }),
      `${label}: grid interno da tabela não preenche a largura disponível`,
    );
    if (width === 320) {
      expect(
        await tableScroller.evaluate((element) => {
          const overflowX = getComputedStyle(element).overflowX;
          return ['auto', 'scroll'].includes(overflowX);
        }),
        `${label}: tabela de tokens deve ter scroll local`,
      );
    }
  }

  for (const panelId of ['design', 'usage', 'implementation', 'accessibility']) {
    await activatePanel(panelId);
    await waitForLayoutStability();
    expect(
      await page.locator(`[data-component-panel="${panelId}"]`).isVisible(),
      `${label}: tab ${panelId} não funciona`,
    );
    expect(
      await horizontalOverflow() <= 1,
      `${label}: painel ${panelId} cria overflow horizontal`,
    );

    if (panelId === 'implementation') {
      for (const selector of [
        '[data-component-panel="implementation"] starlight-tabs',
        '[data-component-panel="implementation"] .expressive-code',
        '[data-component-panel="implementation"] pre',
      ]) {
        if (await page.locator(selector).count()) {
          expect(
            await elementFitsViewport(selector),
            `${label}: ${selector} ultrapassa o viewport`,
          );
        }
      }
      if (await page.locator('[data-component-panel="implementation"] starlight-tabs').count()) {
        await auditPackageTabParity(label);
      }
    }

    expect(
      await page.locator(
        `[data-component-panel="${panelId}"] :is(.ds-table-scroll, pre)`,
      ).evaluateAll((elements) =>
        elements.every((element) => {
          if (element.scrollWidth <= element.clientWidth + 2) return true;
          return element.tabIndex >= 0 && Boolean(element.getAttribute('aria-label'));
        })
      ),
      `${label}: região rolável do painel ${panelId} não é focável ou não tem nome acessível`,
    );
    await auditAxe(`${label} · ${panelId}`);
  }

  await auditRejectedConcepts(label);
  recordBrowserErrors(label);
}

async function auditPrimaryTabAlignment(label) {
  if (!(await page.locator('.ds-component-tabs [role="tablist"]').isVisible())) {
    expect(
      await page.locator('[data-component-panel-select]').isVisible(),
      `${label}: navegação compacta das seções ausente`,
    );
    return;
  }
  const geometry = await page.locator('.ds-component-tabs [role="tab"]').evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        y: rect.y,
        height: rect.height,
        marginTop: style.marginTop,
        marginBottom: style.marginBottom,
      };
    })
  );
  const yPositions = geometry.map((tab) => tab.y);
  const heights = geometry.map((tab) => tab.height);
  expect(
    geometry.length === 4 &&
      geometry.every((tab) => tab.marginTop === '0px' && tab.marginBottom === '0px') &&
      Math.max(...yPositions) - Math.min(...yPositions) <= 0.5 &&
      Math.max(...heights) - Math.min(...heights) <= 0.5,
    `${label}: tabs principais não compartilham a mesma linha e altura`,
  );
}

async function activatePanel(panelId) {
  const compactSelect = page.locator('[data-component-panel-select]');
  if (await compactSelect.isVisible()) {
    await compactSelect.selectOption(panelId);
  } else {
    await page.locator(`[data-component-tab="${panelId}"]`).click();
  }
}

async function waitForLayoutStability() {
  await page.evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

async function auditEditorialTabParity(label) {
  const contract = await page.evaluate(() => {
    const implementationSelect = document.querySelector('[data-technology-select]');
    const panelTablist = document.querySelector('.ds-component-tabs [role="tablist"]');
    return {
      implementationIsSelect: implementationSelect instanceof HTMLSelectElement,
      implementationTabs: document.querySelectorAll('.ds-doc-context [role="tab"]').length,
      panelTabs: panelTablist?.querySelectorAll('[role="tab"]').length || 0,
      labeled: implementationSelect?.labels?.length === 1,
    };
  });
  expect(
    contract.implementationIsSelect && contract.labeled && contract.implementationTabs === 0 && contract.panelTabs === 4,
    `${label}: seletor de implementação e tabs documentais voltaram a competir ${JSON.stringify(contract)}`,
  );
}

async function auditPackageTabParity(label) {
  const contract = await page.evaluate(() => {
    const snapshot = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        y: rect.y,
        height: rect.height,
        marginTop: style.marginTop,
        marginBottom: style.marginBottom,
        paddingTop: style.paddingTop,
        paddingBottom: style.paddingBottom,
        borderTopWidth: style.borderTopWidth,
        borderBottomWidth: style.borderBottomWidth,
        borderBottomColor: style.borderBottomColor,
        color: style.color,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        boxShadow: style.boxShadow,
        active: element.getAttribute('aria-selected') === 'true',
      };
    };
    const packageRoot = document.querySelector(
      '[data-component-panel="implementation"] starlight-tabs',
    );
    return {
      packageTabs: Array.from(packageRoot?.querySelectorAll('[role="tab"]') || [], snapshot),
      panelTabs: Array.from(
        document.querySelectorAll('.ds-component-tabs [role="tab"]'),
        snapshot,
      ),
      packageWrapper: packageRoot?.querySelector('.tablist-wrapper')
        ? snapshot(packageRoot.querySelector('.tablist-wrapper'))
        : null,
      panelWrapper: document.querySelector('.ds-component-tabs')
        ? snapshot(document.querySelector('.ds-component-tabs'))
        : null,
      panelTablistVisible: Boolean(document.querySelector('.ds-component-tabs [role="tablist"]')?.getClientRects().length),
    };
  });

  const packageY = contract.packageTabs.map((item) => item.y);
  const packageHeights = contract.packageTabs.map((item) => item.height);
  const activePackage = contract.packageTabs.find((item) => item.active);
  const inactivePackage = contract.packageTabs.find((item) => !item.active);
  const activePanel = contract.panelTabs.find((item) => item.active);
  const inactivePanel = contract.panelTabs.find((item) => !item.active);
  const itemProperties = [
    'height',
    'marginTop',
    'marginBottom',
    'paddingTop',
    'paddingBottom',
    'borderBottomWidth',
    'borderBottomColor',
    'color',
    'fontSize',
    'fontWeight',
    'lineHeight',
    'boxShadow',
  ];
  const wrapperProperties = [
    'height',
    'paddingTop',
    'paddingBottom',
    'borderTopWidth',
    'borderBottomWidth',
  ];

  expect(
    contract.packageTabs.length === 4 &&
      Math.max(...packageY) - Math.min(...packageY) <= 0.5 &&
      Math.max(...packageHeights) - Math.min(...packageHeights) <= 0.5,
    `${label}: tabs de package manager não compartilham a mesma linha e altura`,
  );
  if (!contract.panelTablistVisible) {
    expect(
      Boolean(contract.packageWrapper) && contract.packageWrapper.height > 0,
      `${label}: package manager não permaneceu utilizável com navegação compacta`,
    );
    return;
  }
  expect(
    Boolean(activePackage && inactivePackage && activePanel && inactivePanel) &&
      itemProperties.every((property) => activePackage[property] === activePanel[property]) &&
      itemProperties.every((property) => inactivePackage[property] === inactivePanel[property]),
    `${label}: package manager deixou de compartilhar o contrato visual das tabs`,
  );
  expect(
    Boolean(contract.packageWrapper && contract.panelWrapper) &&
      wrapperProperties.every(
        (property) => contract.packageWrapper[property] === contract.panelWrapper[property],
      ),
    `${label}: faixa do package manager deixou de compartilhar a geometria das tabs`,
  );
}

async function auditStorybookComponents() {
  browserErrors.length = 0;
  const storyBase = `${origin}/ds-tis/next/storybook/iframe.html?viewMode=story&globals=a11y.manual:!true;mode:light&id=`;

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    `${origin}/ds-tis/next/storybook/?path=/story/react-button--playground`,
    { waitUntil: 'networkidle' },
  );
  await page.getByRole('navigation').waitFor();
  const sidebarText = await page.getByRole('navigation').innerText();
  for (const category of [
    'Actions',
    'Content and structure',
    'Input and selection',
    'Feedback and status',
    'Overlay and disclosure',
  ]) {
    expect(sidebarText.includes(category), `Storybook vNext não expõe a categoria ${category}`);
  }
  expect(
    !/Internal|Alert \+ Badge|Checkbox, Radio|Divider, Skeleton|Form Field, Input/i.test(sidebarText),
    'Storybook vNext ainda expõe comparação interna ou story que mistura componentes',
  );
  expect(
    await page.getByRole('tab', { name: 'Controls' }).count() === 1,
    'Playground de Button deve expor Controls',
  );
  expect(
    await page.getByText('This story has no controls', { exact: true }).count() === 0,
    'Playground de Button não pode abrir sem Controls',
  );
  recordBrowserErrors('Storybook vNext · navegação pública');

  browserErrors.length = 0;
  await page.goto(
    `${origin}/ds-tis/next/storybook/?path=/story/react-registry-overview--catalog`,
    { waitUntil: 'networkidle' },
  );
  await page.waitForFunction(() => {
    const frame = document.querySelector('#storybook-preview-iframe');
    return frame?.contentDocument?.body?.innerText?.includes('Componentes por problema, não por provider');
  });
  expect(
    await page.frameLocator('#storybook-preview-iframe').getByRole('heading', {
      name: 'Componentes por problema, não por provider',
    }).count() === 1,
    'Overview do registry React deve abrir a entrada pública do catálogo',
  );
  recordBrowserErrors('Storybook vNext · Overview');

  browserErrors.length = 0;
  await page.goto(
    `${origin}/ds-tis/next/storybook/?path=/docs/react-button--documenta%C3%A7%C3%A3o`,
    { waitUntil: 'networkidle' },
  );
  const docsFrame = page.locator('#storybook-preview-iframe');
  await docsFrame.waitFor();
  await page.waitForFunction(() => {
    const frame = document.querySelector('#storybook-preview-iframe');
    return frame?.contentDocument?.body?.innerText?.includes('Button');
  });
  expect(
    (await page.frameLocator('#storybook-preview-iframe').locator('body').innerText()).trim().length > 200,
    'Docs de Button deve renderizar conteúdo real',
  );
  expect(
    await page.frameLocator('#storybook-preview-iframe').locator('.ds-story-shell--docs').first().evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.height < window.innerHeight * 0.75;
    }),
    'Docs de Button não deve transformar cada exemplo em uma viewport vazia',
  );
  recordBrowserErrors('Storybook vNext · Docs de Button');

  browserErrors.length = 0;
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${storyBase}ark-button--playground`, { waitUntil: 'networkidle' });
  const arkButton = page.getByRole('button', { name: 'Continuar' });
  await arkButton.waitFor();
  await arkButton.focus();
  await arkButton.press('Enter');
  await arkButton.press('Space');
  expect(
    (await page.getByText(/Ativações:/).textContent())?.includes('2'),
    'Button Ark não respondeu a Enter e Space',
  );
  expect(
    await arkButton.evaluate((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return element.tagName === 'BUTTON' && rect.height === 40 &&
        style.outlineStyle === 'solid' && Number.parseFloat(style.outlineWidth) >= 2;
    }),
    'Button Ark perdeu semântica, geometria ou focus ring TIS',
  );
  await auditAxe('Storybook vNext · Button Ark');
  recordBrowserErrors('Storybook vNext · Button Ark');

  await page.goto(`${storyBase}ark-button--variants`, { waitUntil: 'networkidle' });
  await page.locator('.ds-ark-button').first().waitFor();
  expect(
    await page.locator('.ds-ark-button').count() === 6 &&
      await page.locator('.ds-button--brand').count() === 1 &&
      await page.locator('.ds-button--toned').count() === 1 &&
      await page.locator('.ds-button--outline').count() === 1 &&
      await page.locator('.ds-button--ghost').count() === 1 &&
      await page.locator('.ds-button--success').count() === 1 &&
      await page.locator('.ds-button--danger').count() === 1,
    'Button Ark não preservou as seis variantes TIS',
  );
  await auditAxe('Storybook vNext · Button Ark variants');
  recordBrowserErrors('Storybook vNext · Button Ark variants');

  await page.goto(`${storyBase}ark-button--sizes-and-icons`, { waitUntil: 'networkidle' });
  const arkButtonSizes = page.locator('.ds-story-section').first().locator('.ds-ark-button');
  await arkButtonSizes.first().waitFor();
  expect(
    await arkButtonSizes.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height))
      .then((heights) => JSON.stringify(heights) === JSON.stringify([32, 40, 48])),
    'Button Ark não preservou a escala sm, md e lg',
  );
  const arkIconOnly = page.locator('.ds-ark-button.ds-button--icon-only');
  expect(
    await arkIconOnly.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width === 40 && rect.height === 40;
    }),
    'Button Ark icon-only não permaneceu quadrado',
  );
  await auditAxe('Storybook vNext · Button Ark sizes and icons');
  recordBrowserErrors('Storybook vNext · Button Ark sizes and icons');

  await page.goto(`${storyBase}ark-button--states`, { waitUntil: 'networkidle' });
  await page.locator('.ds-ark-button').first().waitFor();
  expect(await page.locator('.ds-ark-button[disabled]').count() === 2, 'Button Ark deve preservar disabled e loading inativos');
  expect(await page.locator('.ds-ark-button[aria-busy="true"]').count() === 1, 'Button Ark loading deve anunciar aria-busy');
  await auditAxe('Storybook vNext · Button Ark states');
  recordBrowserErrors('Storybook vNext · Button Ark states');

  await page.goto(`${storyBase}ark-button--form-submission`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Enviar' }).click();
  expect(
    (await page.getByText(/Valor enviado:/).textContent())?.includes('ark'),
    'Button Ark não preservou a submissão nativa do formulário',
  );
  await auditAxe('Storybook vNext · Button Ark form');
  recordBrowserErrors('Storybook vNext · Button Ark form');

  browserErrors.length = 0;
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${storyBase}react-accordion--disabled-item`, { waitUntil: 'networkidle' });
  await page.locator('.ds-accordion').waitFor();
  expect(await page.locator('.ds-accordion').count() === 1, 'Storybook deve renderizar o Accordion público');
  expect(
    await page.locator('.ds-accordion__item').count() === 3 &&
      await page.locator('.ds-accordion__trigger').count() === 3 &&
      await page.locator('.ds-accordion__panel').count() === 1,
    'Accordion não preservou a anatomia pública ds-accordion*',
  );
  expect(
    await page.locator('.ds-accordion__item--disabled').count() === 1,
    'Accordion deve expor exatamente um item visualmente desabilitado',
  );
  await auditRejectedConcepts('Storybook vNext · Accordion');

  const accordionTriggers = page.locator('[data-slot="accordion-trigger"]');
  expect(await accordionTriggers.count() === 3, 'Accordion deve expor três triggers públicos');
  expect(
    (await accordionTriggers.nth(2).getAttribute('aria-disabled')) === 'true',
    'terceiro trigger do Accordion deve preservar o estado disabled de Base UI',
  );
  expect(
    (await accordionTriggers.first().getAttribute('aria-expanded')) === 'true',
    'primeiro item do Accordion deveria iniciar aberto',
  );
  await accordionTriggers.nth(1).click();
  expect(
    (await accordionTriggers.nth(1).getAttribute('aria-expanded')) === 'true',
    'segundo item do Accordion não abriu',
  );
  await page.keyboard.press('ArrowUp');
  expect(
    await accordionTriggers.first().evaluate((element) => element === document.activeElement),
    'ArrowUp não moveu foco para o trigger anterior',
  );
  await auditAxe('Storybook vNext · Accordion');

  await page.goto(`${storyBase}react-modal--playground`, { waitUntil: 'networkidle' });
  const modalTrigger = page.getByRole('button', { name: 'Abrir modal' });
  await modalTrigger.waitFor();
  expect(await modalTrigger.locator('xpath=ancestor-or-self::*[contains(@class, "ds-button")]').count() === 1, 'trigger do Modal deve usar ds-button');
  await auditRejectedConcepts('Storybook vNext · Modal');

  await modalTrigger.click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  expect(await dialog.locator('.ds-modal').count() === 1 || await dialog.evaluate((element) => element.classList.contains('ds-modal')), 'Modal deve usar a anatomia pública ds-modal*');
  expect(
    await page.locator('[data-slot="dialog-overlay"].ds-tis-dialog__backdrop').count() === 1,
    'Modal deve usar o backdrop tokenizado do adapter Base UI',
  );
  const baseModalCloseIcon = dialog.getByRole('button', { name: 'Fechar modal' }).locator('svg');
  expect(await baseModalCloseIcon.count() === 1, 'Modal Base UI deve renderizar um único ícone de fechar');
  expect(
    await baseModalCloseIcon.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }),
    'ícone de fechar do Modal Base UI colapsou visualmente',
  );
  expect(
    await dialog.getByRole('button', { name: 'Fechar modal' }).evaluate((closeButton) => {
      const closeRect = closeButton.getBoundingClientRect();
      const dialogRect = closeButton.closest('[role="dialog"]')?.getBoundingClientRect();
      return Boolean(
        dialogRect &&
        closeRect.top >= dialogRect.top &&
        closeRect.right <= dialogRect.right,
      );
    }),
    'controle de fechar do Modal Base UI ficou fora da superfície',
  );
  expect(
    await dialog.locator('.ds-sr-only').count() === 0,
    'Modal Base UI não deve depender de texto auxiliar visível no preview',
  );
  expect(
    await dialog.evaluate((element) => element.contains(document.activeElement)),
    'Modal não moveu foco para dentro do overlay',
  );
  for (const key of ['Tab', 'Tab', 'Tab', 'Tab', 'Shift+Tab']) {
    await page.keyboard.press(key);
    const focusReturned = await page
      .waitForFunction(
        () => document.querySelector('[role="dialog"]')?.contains(document.activeElement),
        undefined,
        { timeout: 500 },
      )
      .then(() => true)
      .catch(() => false);
    expect(
      focusReturned,
      `focus trap do Modal deixou o diálogo após ${key}`,
    );
  }
  await auditAxe('Storybook vNext · Modal aberto');
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  await page.waitForFunction(
    () => document.activeElement?.textContent?.trim() === 'Abrir modal',
    undefined,
    { timeout: 2_000 },
  );
  expect(
    await modalTrigger.evaluate((element) => element === document.activeElement),
    'Modal não restaurou foco ao trigger',
  );

  await page.goto(`${storyBase}react-popover--playground`, { waitUntil: 'networkidle' });
  const basePopoverTrigger = page.getByRole('button', { name: 'Abrir popover' });
  await basePopoverTrigger.click();
  const basePopover = page.getByRole('dialog');
  await basePopover.waitFor();
  expect(await basePopover.evaluate((element) => element.classList.contains('ds-tis-popover__popup')), 'Popover Base UI não preservou o adapter TIS');
  expect(await page.getByText('Conteúdo breve associado ao trigger.').isVisible(), 'Popover Base UI não exibiu o conteúdo');
  await auditAxe('Storybook vNext · Popover Base UI aberto');
  await page.keyboard.press('Escape');
  await basePopover.waitFor({ state: 'detached' });
  expect(await basePopoverTrigger.evaluate((element) => element === document.activeElement), 'Popover Base UI não restaurou foco');

  await page.goto(`${storyBase}ark-popover--playground`, { waitUntil: 'networkidle' });
  const arkPopoverTrigger = page.getByRole('button', { name: 'Abrir popover' });
  await arkPopoverTrigger.click();
  const arkPopover = page.getByRole('dialog');
  await arkPopover.waitFor();
  expect(await arkPopover.evaluate((element) => element.classList.contains('ds-ark-popover__panel')), 'Popover Ark/Zag não preservou o adapter independente');
  expect(await page.getByText('Conteúdo breve associado ao trigger.').isVisible(), 'Popover Ark/Zag não exibiu o conteúdo');
  await auditAxe('Storybook vNext · Popover Ark/Zag aberto');
  await page.keyboard.press('Escape');
  await arkPopover.waitFor({ state: 'detached' });
  expect(await arkPopoverTrigger.evaluate((element) => element === document.activeElement), 'Popover Ark/Zag não restaurou foco');

  for (const placement of ['top', 'right', 'bottom', 'left']) {
    await page.goto(`${storyBase}ark-popover--placements`, { waitUntil: 'networkidle' });
    const placementTrigger = page.getByRole('button', { name: placement, exact: true });
    await placementTrigger.click();
    const placementDialog = page.getByRole('dialog');
    await placementDialog.waitFor();
    expect(
      (await placementDialog.getAttribute('data-placement')) === placement,
      `Popover Ark/Zag não aplicou placement ${placement}`,
    );
    await page.waitForTimeout(50);
    await page.keyboard.press('Escape');
    await placementDialog.waitFor({ state: 'detached' });
    expect(
      await placementTrigger.evaluate((element) => element === document.activeElement),
      `Popover Ark/Zag não restaurou foco no trigger ${placement}`,
    );
  }
  await auditAxe('Storybook vNext · placements do Popover Ark/Zag');

  for (const provider of ['react', 'ark']) {
    await page.goto(`${storyBase}${provider}-tooltip--playground`, { waitUntil: 'networkidle' });
    const tooltipTrigger = page.getByRole('button', { name: 'Informações do projeto' });
    await tooltipTrigger.hover();
    const tooltip = page.getByRole('tooltip');
    await tooltip.waitFor({ state: 'visible' });
    const tooltipId = await tooltip.getAttribute('id');
    expect(
      Boolean(tooltipId) && (await tooltipTrigger.getAttribute('aria-describedby'))?.split(/\s+/).includes(tooltipId),
      `Tooltip ${provider} não preservou aria-describedby`,
    );
    expect(
      await tooltip.evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 &&
          style.backgroundColor === 'rgb(15, 23, 42)' &&
          style.color === 'rgb(248, 250, 252)' &&
          style.padding === '8px 12px' &&
          style.borderRadius === '8px';
      }),
      `Tooltip ${provider} não preservou os tokens visuais TIS`,
    );
    const arrowSelector = provider === 'ark' ? '.ds-ark-tooltip__arrow' : '.ds-tis-tooltip__arrow';
    expect(
      await page.locator(arrowSelector).evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }),
      `Tooltip ${provider} não renderizou a seta`,
    );
    const tooltipBox = await tooltip.boundingBox();
    if (tooltipBox) {
      await page.mouse.move(tooltipBox.x + tooltipBox.width / 2, tooltipBox.y + tooltipBox.height / 2);
      await page.waitForTimeout(180);
      expect(await tooltip.isVisible(), `Tooltip ${provider} não permaneceu hoverable`);
    }
    await tooltipTrigger.focus();
    await tooltip.waitFor({ state: 'visible' });
    await auditAxe(`Storybook vNext · Tooltip ${provider} aberto`);
    await tooltipTrigger.press('Escape');
    await tooltip.waitFor({ state: 'hidden' });
    expect(
      await tooltipTrigger.evaluate((element) => element === document.activeElement),
      `Tooltip ${provider} moveu foco para fora do trigger`,
    );
  }

  for (const provider of ['react', 'ark']) {
    await page.goto(`${storyBase}${provider}-tabs--playground`, { waitUntil: 'networkidle' });
    const tablist = page.getByRole('tablist', { name: 'Seções do projeto' });
    const tabs = tablist.getByRole('tab');
    await tablist.waitFor();
    expect(await tabs.count() === 3, `Tabs ${provider} não expôs três tabs`);
    expect(await tabs.first().getAttribute('aria-selected') === 'true', `Tabs ${provider} não iniciou selecionado`);
    expect(await tabs.nth(2).getAttribute('aria-disabled') === 'true', `Tabs ${provider} perdeu aria-disabled`);
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(75);
    expect(
      await tabs.nth(1).getAttribute('aria-selected') === 'true' &&
        await tabs.nth(1).evaluate((element) => element === document.activeElement),
      `Tabs ${provider} não ativou a segunda tab com ArrowRight`,
    );
    await page.keyboard.press('End');
    await page.waitForTimeout(75);
    expect(
      await tabs.nth(1).evaluate((element) => element === document.activeElement),
      `Tabs ${provider} não ignorou a tab disabled com End`,
    );
    await page.keyboard.press('Home');
    await page.waitForTimeout(75);
    expect(await tabs.first().getAttribute('aria-selected') === 'true', `Tabs ${provider} não voltou ao início`);
    expect(
      await page.locator('[role="tabpanel"]').evaluateAll((elements) =>
        elements.filter((element) => !element.hidden && getComputedStyle(element).display !== 'none').length,
      ) === 1,
      `Tabs ${provider} não manteve um único painel visível`,
    );
    await auditAxe(`Storybook vNext · Tabs ${provider}`);
  }

  for (const provider of ['react', 'ark']) {
    await page.goto(`${storyBase}${provider}-toast--playground`, { waitUntil: 'networkidle' });
    const trigger = page.getByRole('button', { name: 'Mostrar Toast' });
    await trigger.click();
    const toast = page.locator('.ds-toast').first();
    await toast.waitFor({ state: 'visible' });
    expect(
      await toast.evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return rect.width <= 480 && rect.right <= innerWidth &&
          style.backgroundColor === 'rgb(213, 242, 217)' &&
          style.padding === '12px' && style.borderRadius === '12px';
      }),
      `Toast ${provider} não preservou geometria e tokens TIS`,
    );
    await toast.getByRole('button', { name: 'Desfazer' }).click();
    expect(
      await toast.isVisible(),
      `Toast ${provider} deveria permanecer disponível depois da action`,
    );
    expect(
      (await page.getByText(/Actions executadas:/).textContent())?.includes('1'),
      `Toast ${provider} não executou a action`,
    );

    await toast.getByRole('button', { name: 'Dispensar' }).click();
    await toast.waitFor({ state: 'hidden', timeout: 3000 });

    for (let index = 0; index < 6; index += 1) await trigger.click();
    await page.waitForTimeout(100);
    expect(
      await page.locator('.ds-toast:visible').count() === 5,
      `Toast ${provider} não limitou a fila visível a cinco mensagens`,
    );

    await page.goto('about:blank');
    await page.goto(`${storyBase}${provider}-toast--solid-error`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Mostrar Toast' }).click();
    const errorToast = page.locator('.ds-toast').first();
    await errorToast.waitFor({ state: 'visible' });
    await page.waitForTimeout(350);
    expect(
      await errorToast.evaluate((element) =>
        element.classList.contains('ds-toast--error') &&
        element.classList.contains('ds-toast--solid') &&
        !element.querySelector('.ds-toast__actions')),
      `Toast ${provider} não preservou o exemplo error/solid sem action`,
    );
    await auditAxe(`Storybook vNext · Toast ${provider}`);
  }

  const combinedDarkUrl = `${origin}/ds-tis/next/storybook/iframe.html?id=react-button--variants&viewMode=story&globals=a11y.manual:!true;mode:dark`;
  await page.goto(combinedDarkUrl, { waitUntil: 'networkidle' });
  await page.locator('.ds-button').first().waitFor();
  expect(await page.locator('.ds-button').count() >= 1, 'composição escura não renderizou Button público');
  expect((await page.locator('html').getAttribute('data-mode')) === 'dark', 'componentes React não aplicaram o modo dark');
  await auditRejectedConcepts('Storybook vNext · dark');
  await auditAxe('Storybook vNext · Button dark');

  for (const [width, height] of [[390, 844], [320, 720]]) {
    await page.setViewportSize({ width, height });
    expect(await horizontalOverflow() <= 1, `Button possui overflow horizontal em ${width}px`);
  }
  recordBrowserErrors('Storybook vNext · componentes públicos');

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${storyBase}react-accordion--disabled-item`, { waitUntil: 'networkidle' });
  const baseAccordion = page.locator('.ds-accordion');
  await baseAccordion.waitFor();
  const baseTriggers = baseAccordion.getByRole('button');
  expect(await baseTriggers.count() === 3, 'Accordion Base UI deve expor três triggers');
  expect(
    (await baseTriggers.nth(2).getAttribute('aria-disabled')) === 'true',
    'Accordion Base UI deve preservar o item disabled',
  );
  await baseTriggers.nth(1).click();
  expect(
    (await baseTriggers.nth(1).getAttribute('aria-expanded')) === 'true',
    'segundo item do Accordion Base UI não abriu',
  );
  await baseTriggers.nth(1).focus();
  await page.keyboard.press('Home');
  expect(
    await baseTriggers.first().evaluate((element) => element === document.activeElement),
    'Home não moveu foco ao primeiro trigger do adapter TIS',
  );
  await page.keyboard.press('End');
  expect(
    await baseTriggers.nth(1).evaluate((element) => element === document.activeElement),
    'End não moveu foco ao último trigger habilitado do adapter TIS',
  );
  await auditAxe('Storybook vNext · Accordion Base UI');
  recordBrowserErrors('Storybook vNext · Accordion Base UI');

  await page.goto(`${storyBase}react-modal--playground`, { waitUntil: 'networkidle' });
  const baseDialogTrigger = page.getByRole('button', { name: 'Abrir modal' });
  await baseDialogTrigger.waitFor();
  await baseDialogTrigger.click();
  const baseDialog = page.getByRole('dialog');
  await baseDialog.waitFor();
  expect(await baseDialog.evaluate((element) => element.classList.contains('ds-modal')), 'Dialog Base UI deve preservar ds-modal');
  expect(await page.locator('.ds-tis-dialog__backdrop').count() === 1, 'Dialog Base UI deve renderizar o Backdrop tokenizado');
  expect(
    await baseDialog.evaluate((element) => element.contains(document.activeElement)),
    'Dialog Base UI não moveu o foco para o overlay',
  );
  for (const key of ['Tab', 'Tab', 'Tab', 'Shift+Tab']) {
    await page.keyboard.press(key);
    const focusReturned = await page
      .waitForFunction(
        () => document.querySelector('[role="dialog"]')?.contains(document.activeElement),
        undefined,
        { timeout: 500 },
      )
      .then(() => true)
      .catch(() => false);
    expect(
      focusReturned,
      `focus trap do Dialog Base UI deixou o diálogo após ${key}`,
    );
  }
  await auditAxe('Storybook vNext · Dialog Base UI aberto');
  await page.keyboard.press('Escape');
  await baseDialog.waitFor({ state: 'detached' });
  expect(
    await baseDialogTrigger.evaluate((element) => element === document.activeElement),
    'Dialog Base UI não restaurou foco ao trigger',
  );
  recordBrowserErrors('Storybook vNext · Dialog Base UI');

  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(`${storyBase}ark-modal--playground`, { waitUntil: 'networkidle' });
  const arkDialogTrigger = page.getByRole('button', { name: 'Abrir modal' });
  await arkDialogTrigger.waitFor();
  await arkDialogTrigger.click();
  const arkDialog = page.getByRole('dialog');
  await arkDialog.waitFor();
  expect(
    await arkDialog.getAttribute('data-scope') === 'dialog' &&
      await arkDialog.evaluate((element) =>
        element.classList.contains('ds-modal') &&
        element.classList.contains('ds-modal--md'),
      ),
    'Modal Ark/Zag deve preservar o runtime Dialog, a anatomia TIS e o tamanho md padrão',
  );
  expect(
    await page.locator('.ds-ark-modal__backdrop[data-scope="dialog"][data-part="backdrop"]').count() === 1,
    'Modal Ark/Zag deve manter o Backdrop como part interna',
  );
  expect(
    await arkDialog.evaluate((element) => element.contains(document.activeElement)),
    'Modal Ark/Zag não moveu foco para dentro do diálogo',
  );
  const arkDialogRect = await arkDialog.boundingBox();
  expect(
    arkDialogRect && arkDialogRect.x >= 0 && arkDialogRect.x + arkDialogRect.width <= 321,
    'Modal Ark/Zag ultrapassou a viewport de 320px',
  );
  for (const key of ['Tab', 'Tab', 'Tab', 'Shift+Tab']) {
    await page.keyboard.press(key);
    expect(
      await arkDialog.evaluate((element) => element.contains(document.activeElement)),
      `focus trap do Modal Ark/Zag deixou o diálogo após ${key}`,
    );
  }
  await auditAxe('Storybook vNext · Modal Ark/Zag aberto');
  await page.mouse.click(4, 4);
  await arkDialog.waitFor({ state: 'detached' });
  expect(
    await arkDialogTrigger.evaluate((element) => element === document.activeElement),
    'Modal Ark/Zag não restaurou foco após interação externa',
  );
  expect(await horizontalOverflow() <= 1, 'Modal Ark/Zag possui overflow horizontal em 320px');

  await page.goto(`${storyBase}ark-modal--controlled`, { waitUntil: 'networkidle' });
  const controlledState = page.locator('[data-modal-controlled-state]');
  const controlledTrigger = page.locator('[data-scope="dialog"][data-part="trigger"]');
  expect((await controlledState.textContent())?.trim() === 'Modal fechado', 'Modal controlado deveria iniciar fechado');
  await controlledTrigger.click();
  expect((await controlledState.textContent())?.trim() === 'Modal aberto', 'onOpenChange não abriu o Modal controlado');
  const controlledDialog = page.getByRole('dialog');
  await controlledDialog.waitFor();
  expect(
    await controlledDialog.evaluate(async (element) => {
      for (let frame = 0; frame < 30; frame += 1) {
        if (element.contains(document.activeElement)) return true;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      return element.contains(document.activeElement);
    }),
    'Modal controlado não moveu foco para o diálogo antes do Escape',
  );
  await page.keyboard.press('Escape');
  expect(
    await controlledState.evaluate(async (element) => {
      for (let frame = 0; frame < 30; frame += 1) {
        if (element.textContent?.trim() === 'Modal fechado') return true;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      return element.textContent?.trim() === 'Modal fechado';
    }),
    'onOpenChange não fechou o Modal controlado',
  );
  expect(
    await controlledTrigger.evaluate(async (element) => {
      for (let frame = 0; frame < 30; frame += 1) {
        if (element === document.activeElement) return true;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      return element === document.activeElement;
    }),
    'Modal controlado não restaurou foco ao trigger',
  );
  recordBrowserErrors('Storybook vNext · Modal Ark/Zag');

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${storyBase}react-form-field--playground`, { waitUntil: 'networkidle' });
  await page.locator('[data-slot="field"]').waitFor();
  expect(await page.locator('.ds-input').count() === 1, 'Form Field deve compor um Input público');
  expect(
    (await page.getByLabel('E-mail').getAttribute('aria-describedby')) === 'story-field-help',
    'Form Field não preservou a associação com helper text',
  );
  await auditAxe('Storybook vNext · Form Field');
  recordBrowserErrors('Storybook vNext · Form Field');

  await page.goto(`${storyBase}react-form-field--invalid`, { waitUntil: 'networkidle' });
  await page.locator('[data-slot="field"][data-invalid]').waitFor();
  expect(
    await page.locator('[data-slot="input"][aria-invalid="true"]').count() === 1,
    'estado inválido deve ligar data-invalid no Field e aria-invalid no Input',
  );
  await auditAxe('Storybook vNext · Form Field invalid');
  recordBrowserErrors('Storybook vNext · Form Field invalid');

  await page.goto(`${storyBase}react-checkbox--playground`, { waitUntil: 'networkidle' });
  const baseCheckbox = page.locator('[data-slot="checkbox"]');
  await baseCheckbox.waitFor();
  expect((await baseCheckbox.getAttribute('aria-checked')) === 'true', 'Checkbox deveria iniciar checked');
  await baseCheckbox.click();
  expect((await baseCheckbox.getAttribute('aria-checked')) === 'false', 'Checkbox não alternou para unchecked');
  await auditAxe('Storybook vNext · Checkbox');
  recordBrowserErrors('Storybook vNext · Checkbox');

  await page.goto(`${storyBase}ark-checkbox--playground`, { waitUntil: 'networkidle' });
  const arkCheckboxInput = page.getByRole('checkbox');
  const arkCheckboxRoot = page.locator('.ds-ark-checkbox');
  const arkCheckboxControl = page.locator('.ds-ark-checkbox__control');
  await arkCheckboxInput.waitFor();
  expect(await arkCheckboxInput.isChecked(), 'Checkbox Ark deveria iniciar checked');
  expect(await arkCheckboxRoot.getAttribute('data-state') === 'checked', 'Checkbox Ark não expôs data-state checked');
  await arkCheckboxInput.focus();
  await arkCheckboxInput.press('Space');
  await page.waitForTimeout(150);
  expect(!await arkCheckboxInput.isChecked(), 'Space não alternou o Checkbox Ark para unchecked');
  expect(
    await arkCheckboxControl.evaluate((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return rect.width === 20 && rect.height === 20 && style.outlineStyle === 'solid';
    }),
    'Checkbox Ark perdeu geometria ou focus ring TIS',
  );
  await auditAxe('Storybook vNext · Checkbox Ark');
  recordBrowserErrors('Storybook vNext · Checkbox Ark');

  await page.goto(`${storyBase}ark-checkbox--states`, { waitUntil: 'networkidle' });
  await page.locator('.ds-ark-checkbox').first().waitFor();
  expect(
    await page.locator('.ds-ark-checkbox[data-state="indeterminate"]').count() === 1,
    'Checkbox Ark deve preservar o estado mixed',
  );
  expect(
    await page.locator('.ds-ark-checkbox[data-disabled]').count() === 1,
    'Checkbox Ark deve preservar disabled',
  );
  expect(
    await page.locator('.ds-ark-checkbox[data-invalid]').count() === 1,
    'Checkbox Ark deve preservar invalid',
  );
  await auditAxe('Storybook vNext · Checkbox Ark states');
  recordBrowserErrors('Storybook vNext · Checkbox Ark states');

  await page.goto(`${storyBase}ark-checkbox--form-submission`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Enviar' }).click();
  expect(
    (await page.getByText(/Valor enviado:/).textContent())?.includes('enabled'),
    'Checkbox Ark não serializou o hidden input no formulário',
  );
  await auditAxe('Storybook vNext · Checkbox Ark form');
  recordBrowserErrors('Storybook vNext · Checkbox Ark form');

  await page.goto(`${storyBase}react-radio--playground`, { waitUntil: 'networkidle' });
  const baseRadios = page.locator('[data-slot="radio-group-item"]');
  await baseRadios.first().waitFor();
  expect(await baseRadios.count() === 2, 'Radio Group deve renderizar duas opções');
  expect((await baseRadios.first().getAttribute('aria-checked')) === 'true', 'primeiro Radio deveria iniciar checked');
  await baseRadios.first().focus();
  await page.keyboard.press('ArrowDown');
  expect((await baseRadios.nth(1).getAttribute('aria-checked')) === 'true', 'ArrowDown não selecionou o próximo Radio');
  await auditAxe('Storybook vNext · Radio');
  recordBrowserErrors('Storybook vNext · Radio');

  await page.goto(`${storyBase}ark-radio--playground`, { waitUntil: 'networkidle' });
  const arkRadios = page.getByRole('radio');
  await arkRadios.first().waitFor();
  expect(await arkRadios.count() === 2, 'Radio Ark deve renderizar duas opções comparáveis');
  expect(await arkRadios.first().isChecked(), 'primeiro Radio Ark deveria iniciar checked');
  await arkRadios.first().focus();
  await arkRadios.first().press('ArrowDown');
  await page.waitForTimeout(150);
  expect(await arkRadios.nth(1).isChecked(), 'ArrowDown não selecionou o próximo Radio Ark');
  expect(
    await page.locator('.ds-ark-radio__control').nth(1).evaluate((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return rect.width === 20 && rect.height === 20 && style.outlineStyle === 'solid';
    }),
    'Radio Ark perdeu geometria ou focus ring TIS',
  );
  await auditAxe('Storybook vNext · Radio Ark');
  recordBrowserErrors('Storybook vNext · Radio Ark');

  await page.goto(`${storyBase}ark-radio--states`, { waitUntil: 'networkidle' });
  await page.locator('.ds-ark-radio-group').first().waitFor();
  expect(await page.locator('.ds-ark-radio__option[data-disabled]').count() === 1, 'Radio Ark deve preservar uma opção disabled');
  expect(await page.locator('.ds-ark-radio-group[data-invalid]').count() === 1, 'Radio Ark deve preservar invalid no grupo');
  await auditAxe('Storybook vNext · Radio Ark states');
  recordBrowserErrors('Storybook vNext · Radio Ark states');

  await page.goto(`${storyBase}ark-radio--form-submission`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Enviar' }).click();
  expect(
    (await page.getByText(/Valor enviado:/).textContent())?.includes('sms'),
    'Radio Ark não serializou o hidden input selecionado no formulário',
  );
  await auditAxe('Storybook vNext · Radio Ark form');
  recordBrowserErrors('Storybook vNext · Radio Ark form');

  await page.goto(`${storyBase}react-toggle--playground`, { waitUntil: 'networkidle' });
  const baseSwitch = page.locator('[data-slot="switch"]');
  await baseSwitch.waitFor();
  expect((await baseSwitch.getAttribute('aria-checked')) === 'true', 'Switch deveria iniciar on');
  await expectCheckedSwitchThumbInset(baseSwitch, 'Switch md on');
  await baseSwitch.click();
  expect((await baseSwitch.getAttribute('aria-checked')) === 'false', 'Switch não alternou para off');
  await auditAxe('Storybook vNext · Toggle');
  recordBrowserErrors('Storybook vNext · Toggle');

  await page.goto(`${storyBase}react-input--sizes`, { waitUntil: 'networkidle' });
  await page.locator('[data-slot="input-root"]').first().waitFor();
  expect(
    await page.locator('.ds-input--sm').count() === 1 &&
      await page.locator('.ds-input--md').count() === 1 &&
      await page.locator('.ds-input--lg').count() === 1,
    'Input deve preservar os tamanhos sm, md e lg',
  );
  await auditAxe('Storybook vNext · Input sizes');
  recordBrowserErrors('Storybook vNext · Input sizes');

  await page.goto(`${storyBase}react-checkbox--states`, { waitUntil: 'networkidle' });
  await page.locator('[data-slot="checkbox"]').first().waitFor();
  expect(
    await page.locator('[data-slot="checkbox"][data-indeterminate]').count() === 1,
    'Checkbox deve preservar o estado indeterminate',
  );
  expect(
    await page.locator('[data-slot="checkbox"][data-disabled]').count() === 1,
    'Checkbox deve preservar disabled',
  );
  await auditAxe('Storybook vNext · Checkbox states');
  recordBrowserErrors('Storybook vNext · Checkbox states');

  await page.goto(`${storyBase}react-toggle--states`, { waitUntil: 'networkidle' });
  await page.locator('[data-slot="switch"]').first().waitFor();
  expect(await page.locator('[data-slot="switch"][data-disabled]').count() === 2, 'Toggle deve preservar disabled');
  await expectCheckedSwitchThumbInset(
    page.locator('[data-slot="switch"][data-checked][data-disabled]'),
    'Switch lg on disabled',
  );
  await auditAxe('Storybook vNext · Toggle states');
  recordBrowserErrors('Storybook vNext · Toggle states');

  await page.goto(`${storyBase}ark-toggle--playground`, { waitUntil: 'networkidle' });
  const arkSwitch = page.getByRole('switch');
  const arkSwitchControl = page.locator('.ds-ark-toggle__control');
  await arkSwitch.waitFor();
  expect(await arkSwitch.isChecked(), 'Toggle Ark deveria iniciar ligado');
  await arkSwitch.focus();
  await arkSwitch.press('Space');
  await page.waitForTimeout(150);
  expect(!await arkSwitch.isChecked(), 'Space não alternou o Toggle Ark');
  expect(
    await arkSwitchControl.evaluate((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return rect.width === 44 && rect.height === 24 && style.outlineStyle === 'solid';
    }),
    'Toggle Ark perdeu geometria ou focus ring TIS',
  );
  await auditAxe('Storybook vNext · Toggle Ark');
  recordBrowserErrors('Storybook vNext · Toggle Ark');

  await page.goto(`${storyBase}ark-toggle--states`, { waitUntil: 'networkidle' });
  await page.locator('.ds-ark-toggle').first().waitFor();
  expect(await page.locator('.ds-ark-toggle[data-disabled]').count() === 2, 'Toggle Ark deve preservar dois estados disabled');
  await auditAxe('Storybook vNext · Toggle Ark states');
  recordBrowserErrors('Storybook vNext · Toggle Ark states');

  await page.goto(`${storyBase}ark-toggle--sizes`, { waitUntil: 'networkidle' });
  const arkToggleSizes = page.locator('.ds-ark-toggle__control');
  await arkToggleSizes.first().waitFor();
  expect(
    await arkToggleSizes.evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return [rect.width, rect.height];
    })).then((sizes) => JSON.stringify(sizes) === JSON.stringify([[28, 16], [44, 24], [56, 32]])),
    'Toggle Ark não preservou a escala sm, md e lg',
  );
  await auditAxe('Storybook vNext · Toggle Ark sizes');
  recordBrowserErrors('Storybook vNext · Toggle Ark sizes');

  await page.goto(`${storyBase}ark-toggle--form-submission`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Enviar' }).click();
  expect(
    (await page.getByText(/Valor enviado:/).textContent())?.includes('enabled'),
    'Toggle Ark não serializou o hidden input no formulário',
  );
  await auditAxe('Storybook vNext · Toggle Ark form');
  recordBrowserErrors('Storybook vNext · Toggle Ark form');

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${storyBase}react-form-field--form-composition`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Enviar' }).click();
  const submitted = await page.locator('[data-slot="form-result"]').textContent();
  expect(submitted === 'Ana', 'Form Field não preservou o valor do Input no submit nativo');
  await auditAxe('Storybook vNext · form composition');
  recordBrowserErrors('Storybook vNext · form composition');

  await page.goto(`${storyBase}ark-input--playground`, { waitUntil: 'networkidle' });
  const arkInput = page.getByLabel('E-mail');
  const arkInputRoot = page.locator('.ds-ark-input');
  await arkInput.waitFor();
  await arkInput.fill('ana@empresa.com');
  expect(await arkInput.inputValue() === 'ana@empresa.com', 'Input Ark não preservou edição nativa');
  expect(await arkInputRoot.getAttribute('data-filled') === 'true', 'Input Ark não refletiu o estado filled');
  await page.getByRole('button', { name: 'Limpar' }).click();
  expect(await arkInput.inputValue() === '', 'Input Ark não limpou o valor controlado');
  expect(await arkInput.evaluate((element) => element === document.activeElement), 'Input Ark não recuperou foco após limpar');
  await arkInput.fill('teste@empresa.com');
  expect(
    (await page.locator('[data-slot="input-result"]').textContent())?.includes('teste@empresa.com'),
    'Input Ark não atualizou a saída acessível do valor',
  );
  await auditAxe('Storybook vNext · Input Ark');
  recordBrowserErrors('Storybook vNext · Input Ark');

  await page.goto(`${storyBase}ark-input--sizes`, { waitUntil: 'networkidle' });
  const arkInputSizes = page.locator('.ds-ark-input');
  await arkInputSizes.first().waitFor();
  expect(
    await arkInputSizes.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height))
      .then((sizes) => JSON.stringify(sizes) === JSON.stringify([32, 40, 48])),
    'Input Ark não preservou os tamanhos sm, md e lg',
  );
  await auditAxe('Storybook vNext · Input Ark sizes');
  recordBrowserErrors('Storybook vNext · Input Ark sizes');

  await page.goto(`${storyBase}ark-input--states`, { waitUntil: 'networkidle' });
  await page.locator('.ds-ark-input').first().waitFor();
  expect(await page.locator('.ds-ark-input[data-filled]').count() === 1, 'Input Ark deve preservar filled');
  expect(await page.locator('.ds-ark-input[data-invalid] input[aria-invalid="true"]').count() === 1, 'Input Ark deve associar invalid ao input nativo');
  expect(await page.locator('.ds-ark-input[data-readonly] input[readonly]').count() === 1, 'Input Ark deve preservar readonly');
  expect(await page.locator('.ds-ark-input[data-disabled] input:disabled').count() === 1, 'Input Ark deve preservar disabled');
  await auditAxe('Storybook vNext · Input Ark states');
  recordBrowserErrors('Storybook vNext · Input Ark states');

  await page.goto(`${storyBase}ark-input--form-submission`, { waitUntil: 'networkidle' });
  const arkFormInput = page.getByLabel('E-mail');
  await arkFormInput.fill('ana@empresa.com');
  await page.getByRole('button', { name: 'Enviar' }).click();
  expect(
    (await page.locator('[data-slot="form-result"]').textContent()) === 'ana@empresa.com',
    'Input Ark não preservou nome e valor no submit nativo',
  );
  await auditAxe('Storybook vNext · Input Ark form');
  recordBrowserErrors('Storybook vNext · Input Ark form');

  await page.goto(
    `${origin}/ds-tis/next/storybook/iframe.html?viewMode=story&globals=a11y.manual:!true;mode:dark&id=ark-input--states`,
    { waitUntil: 'networkidle' },
  );
  await page.locator('.ds-ark-input').first().waitFor();
  expect(await page.locator('html').getAttribute('data-mode') === 'dark', 'Input Ark não ativou o tema escuro');
  await auditAxe('Storybook vNext · Input Ark dark');
  recordBrowserErrors('Storybook vNext · Input Ark dark');

  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(`${storyBase}ark-input--playground`, { waitUntil: 'networkidle' });
  await page.locator('.ds-ark-input').waitFor();
  expect(await horizontalOverflow() <= 1, 'Input Ark possui overflow horizontal em 320px');
  await auditAxe('Storybook vNext · Input Ark 320px');
  recordBrowserErrors('Storybook vNext · Input Ark 320px');
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto(`${storyBase}ark-textarea--playground`, { waitUntil: 'networkidle' });
  const textareaArk = page.getByRole('textbox', { name: 'Mensagem' });
  await textareaArk.waitFor();
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  expect(await textareaArk.evaluate((el) => !el.validity.valid), 'Textarea Ark deve validar required');
  await textareaArk.fill('Primeira linha\nSegunda linha');
  expect(await page.locator('[data-slot="textarea-counter"]').textContent() === '28/200', 'Textarea Ark deve contar edição multilinha');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  expect(await page.locator('[data-slot="textarea-result"]').textContent() === 'Primeira linha\nSegunda linha', 'Textarea Ark perdeu nome ou linhas no FormData');
  await page.getByRole('button', { name: 'Limpar', exact: true }).click();
  expect(await textareaArk.inputValue() === '', 'Textarea Ark deve limpar o valor controlado');
  expect(await textareaArk.evaluate((el) => el === document.activeElement), 'Textarea Ark perdeu ref/foco na limpeza');
  await textareaArk.fill('x'.repeat(210));
  expect((await textareaArk.inputValue()).length === 200, 'Textarea Ark deve preservar maxlength nativo');
  await auditAxe('Storybook · Textarea Ark formulário');

  await page.goto(`${storyBase}ark-textarea--uncontrolled`, { waitUntil: 'networkidle' });
  const notes = page.getByRole('textbox', { name: 'Observações' });
  expect(await notes.inputValue() === 'Primeira linha\nSegunda linha', 'Textarea Ark perdeu defaultValue');
  await notes.fill('Editado');
  expect(await notes.inputValue() === 'Editado', 'Textarea Ark deve permitir edição não controlada');

  await page.goto(`${storyBase}ark-textarea--sizes`, { waitUntil: 'networkidle' });
  await page.locator('.ds-ark-textarea').first().waitFor();
  expect(await page.locator('.ds-textarea__field').evaluateAll((els) => {
    const sizes = els.map((el) => el.getBoundingClientRect().height);
    return sizes.length === 3 && sizes[0] < sizes[1] && sizes[1] < sizes[2] && els.every((el) => getComputedStyle(el).resize === 'vertical');
  }), 'Textarea Ark deve preservar tamanhos crescentes e resize vertical');

  for (const mode of ['light', 'dark']) {
    await page.goto(`${origin}/ds-tis/next/storybook/iframe.html?viewMode=story&globals=a11y.manual:!true;mode:${mode}&id=ark-textarea--states`, { waitUntil: 'networkidle' });
    await page.locator('.ds-ark-textarea').first().waitFor();
    expect(await page.getByRole('textbox', { name: 'Desabilitado' }).isDisabled(), 'Textarea Ark deve desabilitar controle');
    expect(await page.getByRole('textbox', { name: 'Somente leitura' }).getAttribute('readonly') !== null, 'Textarea Ark deve preservar readonly');
    expect(await page.getByRole('textbox', { name: 'Inválido' }).getAttribute('aria-invalid') === 'true', 'Textarea Ark deve associar erro');
    await auditAxe(`Storybook · Textarea Ark ${mode}`);
  }
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(`${storyBase}ark-textarea--playground`, { waitUntil: 'networkidle' });
  await page.locator('.ds-ark-textarea').waitFor();
  expect(await horizontalOverflow() <= 1, 'Textarea Ark tem overflow em 320px');
  await auditAxe('Storybook · Textarea Ark 320px');
  recordBrowserErrors('Storybook · Textarea Ark');
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto(`${storyBase}react-alert--playground`, { waitUntil: 'networkidle' });
  await page.locator('[data-slot="alert"]').first().waitFor();
  expect(await page.locator('[data-slot="alert"]').count() === 1, 'Alert deve ter uma story isolada');
  await page.getByRole('button', { name: 'Dispensar alerta' }).click();
  expect(
    (await page.locator('[data-slot="alert-result"]').textContent()) === 'Alerta dispensado.',
    'AlertClose não delegou o estado de dismiss ao consumer React',
  );
  await auditAxe('Storybook vNext · Alert');
  recordBrowserErrors('Storybook vNext · Alert');

  await page.goto(`${storyBase}react-badge--tones`, { waitUntil: 'networkidle' });
  await page.locator('[data-slot="badge"]').first().waitFor();
  expect(await page.locator('[data-slot="badge"]').count() === 12, 'Badge deve cobrir seis tons em solid e subtle');
  await auditAxe('Storybook vNext · Badge');
  recordBrowserErrors('Storybook vNext · Badge');

  await page.goto(
    `${origin}/ds-tis/next/storybook/iframe.html?viewMode=story&globals=a11y.manual:!true;mode:dark&id=react-card--interactive`,
    { waitUntil: 'networkidle' },
  );
  await page.locator('[data-slot="card"]').first().waitFor();
  expect(await page.locator('[data-slot="card"]').count() === 2, 'Cards deve renderizar duas composições públicas');
  expect(
    await page.locator('[data-slot="card-header"]').count() === 2 &&
      await page.locator('[data-slot="card-content"]').count() === 2,
    'Card não preservou header e content públicos',
  );
  const interactiveCard = page.getByRole('button', { name: /Segurança/ });
  expect(await interactiveCard.count() === 1, 'Card interactive deve usar button semântico');
  await interactiveCard.focus();
  expect(
    await interactiveCard.evaluate((element) => element === document.activeElement),
    'Card interactive não recebeu foco por teclado',
  );
  expect((await page.locator('html').getAttribute('data-mode')) === 'dark', 'Cards não preservaram dark mode');
  await auditAxe('Storybook vNext · Card dark');
  recordBrowserErrors('Storybook vNext · Card dark');

  await page.goto(`${storyBase}react-skeleton--types`, { waitUntil: 'networkidle' });
  await page.locator('[data-slot="skeleton"]').first().waitFor();
  expect(
    await page.locator('[data-slot="skeleton"][aria-hidden="true"]').count() === 5,
    'Skeleton deve permanecer silencioso nos exemplos de tipo',
  );
  await auditAxe('Storybook vNext · Skeleton');
  recordBrowserErrors('Storybook vNext · Skeleton');

  await page.goto(`${storyBase}react-spinner--sizes`, { waitUntil: 'networkidle' });
  await page.locator('[data-slot="spinner"]').first().waitFor();
  expect(await page.locator('[data-slot="spinner"]').count() === 3, 'Spinner deve preservar sm, md e lg');
  await auditAxe('Storybook vNext · Spinner');
  recordBrowserErrors('Storybook vNext · Spinner');

  await page.goto(`${storyBase}react-divider--toolbar`, { waitUntil: 'networkidle' });
  await page.locator('[data-slot="separator"]').waitFor();
  expect(await page.locator('[data-slot="separator"]').count() === 1, 'Divider deve permanecer isolado no exemplo de toolbar');
  expect(
    await page.locator('[data-slot="separator"][aria-orientation="vertical"]').count() === 1,
    'Separator vertical deve anunciar a orientação',
  );
  await auditAxe('Storybook vNext · Divider');
  recordBrowserErrors('Storybook vNext · Divider');

  const publicPlaygrounds = [
    'ark-button--playground',
    'ark-checkbox--playground',
    'ark-input--playground',
    'ark-textarea--playground',
    'ark-radio--playground',
    'ark-toggle--playground',
    'react-accordion--playground',
    'react-alert--playground',
    'react-badge--playground',
    'react-button--playground',
    'react-card--playground',
    'react-checkbox--playground',
    'react-divider--playground',
    'react-form-field--playground',
    'react-input--playground',
    'react-modal--playground',
    'react-popover--playground',
    'react-radio--playground',
    'react-skeleton--playground',
    'react-spinner--playground',
    'react-tabs--playground',
    'react-textarea--playground',
    'react-toast--playground',
    'react-toggle--playground',
  ];
  await page.setViewportSize({ width: 390, height: 844 });
  for (const storyId of publicPlaygrounds) {
    browserErrors.length = 0;
    await page.goto(`${storyBase}${storyId}`, { waitUntil: 'networkidle' });
    await page.locator('.ds-story-canvas').waitFor();
    expect(await horizontalOverflow() <= 1, `${storyId} possui overflow horizontal em 390px`);
    await auditAxe(`Storybook vNext · ${storyId} mobile`);
    recordBrowserErrors(`Storybook vNext · ${storyId} mobile`);
  }
}

async function expectCheckedSwitchThumbInset(locator, label) {
  const geometry = await locator.evaluate((element) => {
    const track = getComputedStyle(element);
    const thumb = getComputedStyle(element, '::after');
    return {
      actual: Number.parseFloat(thumb.insetBlockStart),
      expected:
        (Number.parseFloat(track.height) - Number.parseFloat(thumb.height)) / 2,
    };
  });
  expect(
    Number.isFinite(geometry.actual) &&
      Number.isFinite(geometry.expected) &&
      Math.abs(geometry.actual - geometry.expected) <= 0.5,
    `${label}: thumb desalinhado no eixo vertical (${geometry.actual}px; esperado ${geometry.expected}px)`,
  );
}

async function auditPortalRootRedirect() {
  const route = '/ds-tis/next/';
  browserErrors.length = 0;
  const redirectResponse = await context.request.get(`${origin}${route}`);
  const redirectHtml = await redirectResponse.text();
  expect(redirectResponse.ok(), `raiz vNext respondeu ${redirectResponse.status()}`);
  expect(
    redirectHtml.includes('url=/ds-tis/next/pt-br/') &&
      redirectHtml.includes('href="/ds-tis/next/pt-br/"'),
    'raiz vNext não aponta para /ds-tis/next/pt-br/',
  );
  expect(
    redirectHtml.includes('href="https://tis-experience.github.io/ds-tis/next/pt-br/"'),
    'canonical do redirect raiz não respeita o base path',
  );

  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  await page.waitForURL('**/ds-tis/next/pt-br/');
  expect(new URL(page.url()).pathname === '/ds-tis/next/pt-br/', 'redirect raiz terminou fora do base path');
  await assertPageHead('/ds-tis/next/pt-br/');

  const faviconResponse = await context.request.get(`${origin}/ds-tis/next/favicon.svg`);
  const faviconBody = await faviconResponse.text();
  expect(faviconResponse.ok(), `favicon respondeu ${faviconResponse.status()}`);
  expect(
    faviconResponse.headers()['content-type']?.includes('image/svg+xml') && /<svg\b/.test(faviconBody),
    'favicon publicado não é um SVG válido',
  );
  recordBrowserErrors('redirect/canonical/favicon raiz');
}

async function assertPageHead(route) {
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(
    canonical === `https://tis-experience.github.io${route}`,
    `${route}: canonical incorreto (${canonical || 'ausente'})`,
  );
  expect(
    (await page.locator('link[rel~="icon"]').getAttribute('href')) === '/ds-tis/next/favicon.svg',
    `${route}: favicon não respeita o base path`,
  );
}

async function auditRejectedConcepts(label) {
  const rejectedTexts = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const exactSteps = Array.from(document.body.querySelectorAll('*'))
      .map((element) => element.textContent?.trim())
      .filter((text) => text === '01' || text === '02');
    return {
      providerBadge: bodyText.includes('Provider spike · não público'),
      tailwindBadge: bodyText.includes('Sem Tailwind'),
      exactSteps,
    };
  });
  expect(!rejectedTexts.providerBadge, `${label}: badge "Provider spike · não público" ainda presente`);
  expect(!rejectedTexts.tailwindBadge, `${label}: badge "Sem Tailwind" ainda presente`);
  expect(rejectedTexts.exactSteps.length === 0, `${label}: steps visuais 01/02 ainda presentes`);
  expect(
    await page.locator([
      '.vnext-accordion',
      '.vnext-dialog',
      '.vnext-button',
      '.vnext-provider__eyebrow',
      '.vnext-provider__badge',
      '.vnext-provider__steps',
      '.vnext-provider__step',
      '.ds-component-tabs__label',
    ].join(', ')).count() === 0,
    `${label}: classes visuais rejeitadas ainda presentes`,
  );
}

async function horizontalOverflow() {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

async function elementFitsViewport(selector) {
  return page.locator(selector).first().evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.left >= -1 && rect.right <= document.documentElement.clientWidth + 1;
  });
}

async function auditAxe(label) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  for (const violation of result.violations.filter((item) => ['critical', 'serious'].includes(item.impact))) {
    const targets = violation.nodes
      .slice(0, 3)
      .flatMap((node) => node.target)
      .join(', ');
    failures.push(`${label}: axe ${violation.impact} ${violation.id} (${targets})`);
  }
}

function recordBrowserErrors(label) {
  if (browserErrors.length) {
    failures.push(...browserErrors.map((error) => `${label}: ${error}`));
    browserErrors.length = 0;
  }
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}
