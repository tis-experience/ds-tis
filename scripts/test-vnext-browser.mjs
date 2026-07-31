#!/usr/bin/env node

import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

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
    technology: 'Web CSS',
    locale: 'pt',
    stack: 'web',
  });
  await auditDocsPage('/ds-tis/next/pt-br/react/components/button/', {
    technology: 'React',
    locale: 'pt',
    stack: 'react',
  });
  await auditDocsPage('/ds-tis/next/en/web/components/button/', {
    technology: 'Web CSS',
    locale: 'en',
    stack: 'web',
  });
  await auditDocsPage('/ds-tis/next/en/react/components/button/', {
    technology: 'React',
    locale: 'en',
    stack: 'react',
  });

  await auditComponentResourcesAndTechnologySwitch();

  await auditPortalLanding('/ds-tis/next/pt-br/', 'pt');
  await auditPortalLanding('/ds-tis/next/en/', 'en');
  await auditTechnologyLanding('/ds-tis/next/pt-br/web/', 'Web CSS');
  await auditTechnologyLanding('/ds-tis/next/pt-br/react/', 'React');
  await auditTechnologyLanding('/ds-tis/next/en/web/', 'Web CSS');
  await auditTechnologyLanding('/ds-tis/next/en/react/', 'React');
  await auditReactRegistry('/ds-tis/next/pt-br/react/registry/', 'pt');
  await auditReactRegistry('/ds-tis/next/en/react/registry/', 'en');

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

console.log('✅ Browser vNext: Starlight, contexto, tabs/ToC, 320/390, Accordion, Modal, Ark/Zag, shadcn/Base UI, dark mode e Axe válidos.');

async function auditDocsPage(route, options) {
  browserErrors.length = 0;
  const { technology, locale, stack } = options;
  const isWeb = stack === 'web';

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  await page.locator('main h1').first().waitFor();
  await assertPageHead(route);

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
    (await page.locator('.ds-doc-context__technology-links a[aria-current="page"]').textContent())?.trim() ===
      technology,
    `${route}: link de tecnologia ativo incorreto`,
  );
  expect(
    await page.locator('.ds-doc-context__technology-links a').count() === 2,
    `${route}: página de componente deve alternar somente Web CSS e React`,
  );
  const technologyNavStyle = await page.locator('.ds-doc-context').evaluate((nav) => {
    const navStyle = getComputedStyle(nav);
    const links = Array.from(nav.querySelectorAll('.ds-doc-context__technology-links a'));
    return {
      hasContainerBorder:
        navStyle.borderTopWidth !== '0px' || navStyle.borderBottomWidth !== '0px',
      linksArePills: links.some((link) => {
        const style = getComputedStyle(link);
        const transparent = style.backgroundColor === 'transparent' ||
          /rgba?\([^)]*,\s*0\)$/.test(style.backgroundColor);
        return !transparent || style.borderRadius !== '0px';
      }),
    };
  });
  expect(
    !technologyNavStyle.hasContainerBorder && !technologyNavStyle.linksArePills,
    `${route}: navegação por tecnologia voltou a simular segmented control`,
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

  const expectedGuidanceCount = isWeb ? 4 : 2;
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
    await panelToc.locator('a').count() >= 2 && await panelToc.isVisible(),
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

  if (isWeb) {
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
  } else {
    expect(
      await layout.locator('[data-component-panel="implementation"] starlight-tabs').count() === 1,
      `${route}: React beta deve exibir instalação pelo registry`,
    );
    const availabilityText = locale === 'en'
      ? 'Beta registry'
      : 'Registry beta';
    expect(
      await page.getByText(availabilityText, { exact: true }).count() === 1,
      `${route}: status beta do registry React não está explícito`,
    );
    expect(
      await page.getByText('@tis/button', { exact: false }).count() >= 1,
      `${route}: comando @tis/button ausente`,
    );
    expect(
      await page.locator('[data-component-topic="code"]').count() === 0,
      `${route}: React não pode reutilizar o código Web como se fosse uma API pronta`,
    );
  }

  await page.goto(`${origin}${route}#accessibility`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() =>
    document.querySelector('[data-component-tab="accessibility"]')?.getAttribute('aria-selected') === 'true'
  );
  expect(
    await layout.locator('[data-component-panel="accessibility"]').isVisible(),
    `${route}: deep link #accessibility não ativou o painel`,
  );

  if (!isWeb) {
    const evaluatedText = locale === 'en' ? 'Executed gate' : 'Gate executado';
    expect(
      await page.getByText(evaluatedText, { exact: true }).count() === 1,
      `${route}: acessibilidade React não comunica a evidência executada`,
    );
    expect(
      await layout.locator('[data-component-panel="accessibility"] .ds-source-guidance').count() === 0,
      `${route}: React não deve herdar a evidência WCAG da Web`,
    );
  }

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

  const stableLink = page.getByRole('link', { name: 'referência detalhada da v1' });
  const stableHref = await stableLink.getAttribute('href');
  const stableUrl = new URL(stableHref, page.url());
  expect(stableUrl.pathname === '/ds-tis/docs/button.html', 'link de documentação estável aponta para destino incorreto');
  const stableResponse = await context.request.get(stableUrl.toString());
  expect(stableResponse.ok(), `documentação estável respondeu ${stableResponse.status()}`);

  const storybookHref = await page.getByRole('link', { name: 'Storybook' }).getAttribute('href');
  expect(
    storybookHref?.includes('components-button--documenta%C3%A7%C3%A3o'),
    'link Storybook não usa o id real da documentação de Button',
  );

  const reactTechnologyLink = page.locator('[data-technology-link="react"]');
  await reactTechnologyLink.click();
  await page.waitForURL('**/pt-br/react/components/button/');
  expect(
    (await page.evaluate(() => localStorage.getItem('ds-doc-technology'))) === 'react',
    'preferência React não foi persistida',
  );
  expect(
    (await page.locator('[data-technology-select] option:checked').textContent())?.trim() === 'React',
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

  const buttonLink = page.locator('a[href$="/web/components/button/"]').first();
  expect(await buttonLink.count() === 1, `${route}: CTA base-aware para Button ausente`);
  const buttonHref = await buttonLink.getAttribute('href');
  const buttonResponse = await context.request.get(new URL(buttonHref, page.url()).toString());
  expect(buttonResponse.ok(), `${route}: CTA Button respondeu ${buttonResponse.status()}`);

  expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em desktop`);
  await auditRejectedConcepts(route);

  await auditAxe(route);
  recordBrowserErrors(route);
}

async function auditTechnologyLanding(route, expectedTechnology) {
  browserErrors.length = 0;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  await page.locator('h1').first().waitFor();
  await assertPageHead(route);

  expect(
    (await page.locator('.ds-doc-context__technology-links a[aria-current="page"]').textContent())?.trim() ===
      expectedTechnology,
    `${route}: tecnologia ativa incorreta`,
  );
  expect(
    await page.locator('.ds-doc-context__technology-links a').count() === 3,
    `${route}: landing deve permitir alternar visão geral, Web CSS e React`,
  );
  expect(await page.locator('[data-technology-select]').count() === 1, `${route}: seletor de tecnologia discreto ausente`);
  expect(
    await page.locator('.ds-doc-context__stable-link').count() === 1,
    `${route}: link discreto para a documentação v1 ausente`,
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

async function auditReactRegistry(route, locale) {
  browserErrors.length = 0;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  await page.locator('h1').first().waitFor();
  await assertPageHead(route);

  expect(
    (await page.locator('h1').first().textContent())?.includes(locale === 'en' ? 'React Registry' : 'Registry React'),
    `${route}: título do catálogo React ausente`,
  );
  expect(
    await page.getByText('https://tis-experience.github.io/ds-tis/registry/v1/{name}.json', { exact: false }).count() >= 1,
    `${route}: template versionado do registry ausente`,
  );
  expect(
    await page.locator('table tbody tr').count() === 9,
    `${route}: catálogo deve listar nove componentes beta`,
  );
  expect(
    await page.getByText('@tis/react', { exact: false }).count() >= 1,
    `${route}: limite do pacote @tis/react ausente`,
  );
  expect(await horizontalOverflow() <= 1, `${route}: overflow horizontal em 390px`);
  await auditAxe(route);
  recordBrowserErrors(route);
}

async function auditResponsiveButton(width, height) {
  const route = `/ds-tis/next/pt-br/web/components/button/`;
  const label = `${route} @ ${width}px`;
  browserErrors.length = 0;
  await page.setViewportSize({ width, height });
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  await page.locator('main h1').first().waitFor();

  expect(await page.locator('[data-technology-select]').isVisible(), `${label}: select de tecnologia ausente`);
  expect(
    !(await page.locator('.ds-doc-context__technology-links').isVisible()),
    `${label}: links de tecnologia desktop deveriam ocultar`,
  );
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
    expect(await elementFitsViewport('.ds-token-table'), `${label}: tabela de tokens vaza do viewport`);
    if (width === 320) {
      expect(
        await tokenTable.evaluate((element) => {
          const overflowX = getComputedStyle(element).overflowX;
          return ['auto', 'scroll'].includes(overflowX);
        }),
        `${label}: tabela de tokens deve ter scroll local`,
      );
    }
  }

  for (const panelId of ['design', 'usage', 'implementation', 'accessibility']) {
    const panelTab = page.locator(`[data-component-tab="${panelId}"]`);
    await panelTab.click();
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
        `[data-component-panel="${panelId}"] :is(.ds-token-table, pre)`,
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

async function auditEditorialTabParity(label) {
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
        borderBottomWidth: style.borderBottomWidth,
        borderBottomColor: style.borderBottomColor,
        color: style.color,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        active:
          element.getAttribute('aria-current') === 'page' ||
          element.getAttribute('aria-selected') === 'true',
      };
    };
    return {
      technology: Array.from(
        document.querySelectorAll('.ds-doc-context__technology-links a'),
        snapshot,
      ),
      panels: Array.from(
        document.querySelectorAll('.ds-component-tabs [role="tab"]'),
        snapshot,
      ),
    };
  });

  const technologyY = contract.technology.map((item) => item.y);
  const technologyHeights = contract.technology.map((item) => item.height);
  expect(
    contract.technology.length === 2 &&
      Math.max(...technologyY) - Math.min(...technologyY) <= 0.5 &&
      Math.max(...technologyHeights) - Math.min(...technologyHeights) <= 0.5 &&
      contract.technology.every(
        (item) => item.marginTop === '0px' && item.marginBottom === '0px',
      ),
    `${label}: links de tecnologia não compartilham a mesma linha e altura`,
  );

  const activeTechnology = contract.technology.find((item) => item.active);
  const inactiveTechnology = contract.technology.find((item) => !item.active);
  const activePanel = contract.panels.find((item) => item.active);
  const inactivePanel = contract.panels.find((item) => !item.active);
  const comparableProperties = [
    'height',
    'paddingTop',
    'paddingBottom',
    'borderBottomWidth',
    'borderBottomColor',
    'color',
    'fontSize',
    'fontWeight',
    'lineHeight',
  ];
  expect(
    Boolean(activeTechnology && inactiveTechnology && activePanel && inactivePanel) &&
      comparableProperties.every(
        (property) => activeTechnology[property] === activePanel[property],
      ) &&
      comparableProperties.every(
        (property) => inactiveTechnology[property] === inactivePanel[property],
      ),
    `${label}: tecnologia e painéis deixaram de compartilhar o mesmo contrato visual`,
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
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${storyBase}vnext-provider-spike--accordion`, { waitUntil: 'networkidle' });
  await page.locator('.ds-accordion').waitFor();
  expect(await page.locator('.ds-accordion').count() === 1, 'Storybook deve renderizar o Accordion público');
  expect(
    await page.locator('.ds-accordion__item').count() === 3 &&
      await page.locator('.ds-accordion__trigger').count() === 3 &&
      await page.locator('.ds-accordion__panel').count() === 3,
    'Accordion não preservou a anatomia pública ds-accordion*',
  );
  expect(
    await page.locator('.ds-accordion__item--disabled').count() === 1,
    'Accordion deve expor exatamente um item visualmente desabilitado',
  );
  await auditRejectedConcepts('Storybook vNext · Accordion');

  const accordionTriggers = page.locator('[data-scope="accordion"][data-part="item-trigger"]');
  expect(await accordionTriggers.count() === 3, 'Accordion deve expor três triggers Ark/Zag');
  expect(
    await accordionTriggers.nth(2).isDisabled(),
    'terceiro trigger do Accordion deve preservar o estado disabled de Ark/Zag',
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

  await page.goto(`${storyBase}vnext-provider-spike--modal`, { waitUntil: 'networkidle' });
  const modalTrigger = page.getByRole('button', { name: 'Abrir modal' });
  await modalTrigger.waitFor();
  expect(await modalTrigger.locator('xpath=ancestor-or-self::*[contains(@class, "ds-button")]').count() === 1, 'trigger do Modal deve usar ds-button');
  await auditRejectedConcepts('Storybook vNext · Modal');

  await modalTrigger.click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  expect(await dialog.locator('.ds-modal').count() === 1 || await dialog.evaluate((element) => element.classList.contains('ds-modal')), 'Modal deve usar a anatomia pública ds-modal*');
  expect(await page.locator('.ds-modal-overlay').count() === 1, 'Modal deve usar ds-modal-overlay');
  expect(
    await dialog.evaluate((element) => element.contains(document.activeElement)),
    'Modal não moveu foco para dentro do overlay',
  );
  for (const key of ['Tab', 'Tab', 'Tab', 'Tab', 'Shift+Tab']) {
    await page.keyboard.press(key);
    expect(
      await dialog.evaluate((element) => element.contains(document.activeElement)),
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

  const combinedDarkUrl = `${origin}/ds-tis/next/storybook/iframe.html?id=vnext-provider-spike--accordion-and-dialog&viewMode=story&globals=a11y.manual:!true;mode:dark`;
  await page.goto(combinedDarkUrl, { waitUntil: 'networkidle' });
  await page.locator('.ds-accordion').waitFor();
  expect(await page.locator('.ds-button').count() >= 1, 'composição escura não renderizou Button público');
  expect((await page.locator('html').getAttribute('data-mode')) === 'dark', 'componentes React não aplicaram o modo dark');
  await auditRejectedConcepts('Storybook vNext · dark');
  await auditAxe('Storybook vNext · Accordion + Modal dark');

  for (const [width, height] of [[390, 844], [320, 720]]) {
    await page.setViewportSize({ width, height });
    expect(await horizontalOverflow() <= 1, `Accordion + Modal possui overflow horizontal em ${width}px`);
  }
  recordBrowserErrors('Storybook vNext · componentes Ark/Zag');

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${storyBase}vnext-shadcn-base-ui-pilot--accordion-base-ui`, { waitUntil: 'networkidle' });
  const baseAccordion = page.locator('.ds-accordion');
  await baseAccordion.waitFor();
  const baseTriggers = baseAccordion.getByRole('button');
  expect(await baseTriggers.count() === 3, 'Accordion Base UI deve expor três triggers');
  expect(await baseTriggers.nth(2).isDisabled(), 'Accordion Base UI deve preservar o item disabled');
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

  await page.goto(`${storyBase}vnext-shadcn-base-ui-pilot--dialog-base-ui`, { waitUntil: 'networkidle' });
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

  await page.goto(`${storyBase}vnext-shadcn-base-ui-forms--fields`, { waitUntil: 'networkidle' });
  await page.locator('[data-slot="field-group"]').waitFor();
  expect(await page.locator('.ds-input').count() === 2, 'Fields deve renderizar dois Input Text públicos');
  expect(await page.locator('.ds-textarea').count() === 1, 'Fields deve renderizar um Textarea público');
  expect(
    await page.locator('[data-slot="field"][data-invalid]').count() === 1 &&
      await page.locator('[data-slot="input"][aria-invalid="true"]').count() === 1,
    'estado inválido deve ligar data-invalid no Field e aria-invalid no Input',
  );
  expect(
    (await page.getByLabel('E-mail').getAttribute('aria-describedby')) === 'tis-email-helper',
    'Input não preservou a associação com helper text',
  );
  await auditAxe('Storybook vNext · Fields Base UI');
  recordBrowserErrors('Storybook vNext · Fields Base UI');

  await page.goto(`${storyBase}vnext-shadcn-base-ui-forms--selection-controls`, { waitUntil: 'networkidle' });
  const baseCheckbox = page.locator('[data-slot="checkbox"]');
  const baseRadios = page.locator('[data-slot="radio-group-item"]');
  const baseSwitch = page.locator('[data-slot="switch"]');
  await baseCheckbox.waitFor();
  expect((await baseCheckbox.getAttribute('aria-checked')) === 'true', 'Checkbox deveria iniciar checked');
  await baseCheckbox.click();
  expect((await baseCheckbox.getAttribute('aria-checked')) === 'false', 'Checkbox não alternou para unchecked');
  expect(await baseRadios.count() === 2, 'Radio Group deve renderizar duas opções');
  expect((await baseRadios.first().getAttribute('aria-checked')) === 'true', 'primeiro Radio deveria iniciar checked');
  await baseRadios.first().focus();
  await page.keyboard.press('ArrowDown');
  expect((await baseRadios.nth(1).getAttribute('aria-checked')) === 'true', 'ArrowDown não selecionou o próximo Radio');
  expect((await baseSwitch.getAttribute('aria-checked')) === 'true', 'Switch deveria iniciar on');
  await expectCheckedSwitchThumbInset(baseSwitch, 'Switch md on');
  await baseSwitch.click();
  expect((await baseSwitch.getAttribute('aria-checked')) === 'false', 'Switch não alternou para off');
  await auditAxe('Storybook vNext · selection controls Base UI');
  recordBrowserErrors('Storybook vNext · selection controls Base UI');

  await page.goto(`${storyBase}vnext-shadcn-base-ui-forms--states`, { waitUntil: 'networkidle' });
  await page.locator('[data-slot="field-group"]').waitFor();
  expect(
    await page.locator('.ds-input--sm').count() === 1 &&
      await page.locator('.ds-input--md').count() === 1 &&
      await page.locator('.ds-input--lg').count() === 1,
    'Input deve preservar os tamanhos sm, md e lg',
  );
  expect(
    await page.locator('[data-slot="checkbox"][data-indeterminate]').count() === 1,
    'Checkbox deve preservar o estado indeterminate',
  );
  expect(
    await page.locator('[data-slot="checkbox"][data-disabled]').count() === 1 &&
      await page.locator('[data-slot="switch"][data-disabled]').count() === 1,
    'Checkbox e Switch devem preservar disabled',
  );
  await expectCheckedSwitchThumbInset(
    page.locator('[data-slot="switch"][data-checked][data-disabled]'),
    'Switch lg on disabled',
  );
  await auditAxe('Storybook vNext · sizes and states Base UI');
  for (const [width, height] of [[390, 844], [320, 720]]) {
    await page.setViewportSize({ width, height });
    expect(await horizontalOverflow() <= 1, `forms Base UI possui overflow horizontal em ${width}px`);
  }
  recordBrowserErrors('Storybook vNext · sizes and states Base UI');

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${storyBase}vnext-shadcn-base-ui-forms--form-submission`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Enviar' }).click();
  const submitted = await page.locator('[data-slot="form-result"]').textContent();
  for (const contract of ['"name":"Ana"', '"terms":"accepted"', '"channel":"email"', '"alerts":"enabled"']) {
    expect(submitted?.includes(contract), `form submit não preservou ${contract}`);
  }
  await auditAxe('Storybook vNext · native form submission Base UI');
  recordBrowserErrors('Storybook vNext · native form submission Base UI');
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
