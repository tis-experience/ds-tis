import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateThemeConfig } from '../packages/theme-schema/src/index.js';
import { mapThemeToVars } from '../packages/theme-engine/src/index.js';
import {
  extractGuidanceHtml,
  getComponentGuidance,
} from '../apps/docs/src/lib/component-source.mjs';
import {
  getReactComponentGroups,
  getReactComponents,
} from '../apps/docs/src/lib/react-component-catalog.mjs';
import {
  ANGULAR_COMPONENTS_BY_SLUG,
  ANGULAR_LIBRARY,
  SHADCN_REGISTRY,
  TECHNOLOGY_OUTPUTS,
} from './lib/technology-implementations.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const required = [
  'apps/docs/astro.config.mjs',
  'apps/docs/src/content/docs/pt-br/index.mdx',
  'apps/docs/src/content/docs/pt-br/components/index.mdx',
  'apps/docs/src/content/docs/pt-br/ai.mdx',
  'apps/docs/src/content/docs/pt-br/web/index.mdx',
  'apps/docs/src/content/docs/pt-br/react/index.mdx',
  'apps/docs/src/content/docs/pt-br/react/components/index.mdx',
  'apps/docs/src/content/docs/pt-br/angular/index.mdx',
  'apps/docs/src/content/docs/pt-br/web/components/accordion.mdx',
  'apps/docs/src/content/docs/pt-br/ark/components/accordion.mdx',
  'apps/docs/src/content/docs/pt-br/ark/components/button.mdx',
  'apps/docs/src/content/docs/pt-br/ark/components/modal.mdx',
  'apps/docs/src/content/docs/pt-br/ark/components/menu.mdx',
  'apps/docs/src/content/docs/pt-br/ark/components/popover.mdx',
  'apps/docs/src/content/docs/pt-br/ark/components/tabs.mdx',
  'apps/docs/src/content/docs/pt-br/ark/components/toast.mdx',
  'apps/docs/src/content/docs/pt-br/web/components/button.mdx',
  'apps/docs/src/content/docs/pt-br/web/components/modal.mdx',
  'apps/docs/src/content/docs/pt-br/web/components/menu.mdx',
  'apps/docs/src/content/docs/pt-br/web/components/tabs.mdx',
  'apps/docs/src/content/docs/pt-br/web/components/toast.mdx',
  'apps/docs/src/content/docs/en/ai.mdx',
  'apps/docs/src/content/docs/en/components/index.mdx',
  'apps/docs/src/content/docs/en/web/index.mdx',
  'apps/docs/src/content/docs/en/react/index.mdx',
  'apps/docs/src/content/docs/en/react/components/index.mdx',
  'apps/docs/src/content/docs/en/angular/index.mdx',
  'apps/docs/src/content/docs/en/web/components/accordion.mdx',
  'apps/docs/src/content/docs/en/ark/components/accordion.mdx',
  'apps/docs/src/content/docs/en/ark/components/button.mdx',
  'apps/docs/src/content/docs/en/ark/components/modal.mdx',
  'apps/docs/src/content/docs/en/ark/components/menu.mdx',
  'apps/docs/src/content/docs/en/ark/components/popover.mdx',
  'apps/docs/src/content/docs/en/ark/components/tabs.mdx',
  'apps/docs/src/content/docs/en/ark/components/toast.mdx',
  'apps/docs/src/content/docs/en/web/components/modal.mdx',
  'apps/docs/src/content/docs/en/web/components/menu.mdx',
  'apps/docs/src/content/docs/en/web/components/tabs.mdx',
  'apps/docs/src/content/docs/en/web/components/toast.mdx',
  'apps/docs/src/components/DocumentContext.astro',
  'apps/docs/src/components/ComponentPageHeader.astro',
  'apps/docs/src/components/ComponentPageLayout.astro',
  'apps/docs/src/components/ComponentPanel.astro',
  'apps/docs/src/components/ComponentGuidance.astro',
  'apps/docs/src/components/ComponentDocumentationPage.astro',
  'apps/docs/src/components/ComponentCatalog.astro',
  'apps/docs/src/components/ReactComponentCatalog.astro',
  'apps/docs/src/components/ReactComponentPage.astro',
  'apps/docs/src/components/OutputStoryPreview.astro',
  'apps/docs/src/lib/component-assets.ts',
  'apps/docs/src/lib/component-documentation.ts',
  'apps/docs/src/lib/component-source.mjs',
  'apps/docs/src/lib/react-component-catalog.mjs',
  'apps/docs/src/pages/[locale]/react/components/[slug].astro',
  'apps/docs/src/pages/[locale]/angular/components/[slug].astro',
  'apps/docs/public/favicon.svg',
  'apps/docs/README.md',
  'scripts/preview-vnext.mjs',
  '.storybook-vnext/main.mjs',
  '.storybook-angular/main.mjs',
  '.storybook-angular/preview.ts',
  'packages/angular/package.json',
  'packages/angular/badge/src/badge.ts',
  'packages/angular/button/src/button.ts',
  'packages/angular/accordion/src/accordion.ts',
  'packages/angular/combobox/src/combobox.ts',
  'packages/angular/menu/src/menu.ts',
  'packages/angular/popover/src/popover.ts',
  'packages/angular/select/src/select.ts',
  'packages/angular/stories/select.stories.ts',
  'packages/angular/stories/badge.stories.ts',
  'packages/angular/stories/combobox.stories.ts',
  'packages/angular/stories/menu.stories.ts',
  'packages/react/src/provider-spike.jsx',
  'packages/react/src/provider-spike.stories.jsx',
  'packages/react/src/ark/accordion.jsx',
  'packages/react/src/ark/combobox.jsx',
  'packages/react/src/ark/modal.jsx',
  'packages/react/src/ark/menu.jsx',
  'packages/react/src/ark/popover.jsx',
  'packages/react/src/ark/select.jsx',
  'packages/react/src/ark/tabs.jsx',
  'packages/react/src/ark/toast.jsx',
  'packages/react/src/ark/tooltip.jsx',
  'packages/react/src/stories/_shared.jsx',
  'packages/react/src/stories/ark-accordion.stories.jsx',
  'packages/react/src/stories/ark-combobox.stories.jsx',
  'packages/react/src/stories/ark-modal.stories.jsx',
  'packages/react/src/stories/ark-menu.stories.jsx',
  'packages/react/src/stories/ark-popover.stories.jsx',
  'packages/react/src/stories/ark-select.stories.jsx',
  'packages/react/src/stories/ark-tabs.stories.jsx',
  'packages/react/src/stories/ark-toast.stories.jsx',
  'packages/react/src/stories/ark-tooltip.stories.jsx',
  'packages/react/src/stories/overview.stories.jsx',
  'packages/react/src/stories/accordion.stories.jsx',
  'packages/react/src/stories/alert.stories.jsx',
  'packages/react/src/stories/badge.stories.jsx',
  'packages/react/src/stories/button.stories.jsx',
  'packages/react/src/stories/card.stories.jsx',
  'packages/react/src/stories/checkbox.stories.jsx',
  'packages/react/src/stories/divider.stories.jsx',
  'packages/react/src/stories/form-field.stories.jsx',
  'packages/react/src/stories/input.stories.jsx',
  'packages/react/src/stories/modal.stories.jsx',
  'packages/react/src/stories/menu.stories.jsx',
  'packages/react/src/stories/radio.stories.jsx',
  'packages/react/src/stories/skeleton.stories.jsx',
  'packages/react/src/stories/spinner.stories.jsx',
  'packages/react/src/stories/textarea.stories.jsx',
  'packages/react/src/stories/tabs.stories.jsx',
  'packages/react/src/stories/toast.stories.jsx',
  'packages/react/src/stories/tooltip.stories.jsx',
  'packages/react/src/stories/toggle.stories.jsx',
  'docs/agents/ark-zag-reference.md',
  'docs/popover.html',
  'docs/agents/shadcn-base-ui-pilot.md',
  'docs/agents/shadcn-base-ui-implementation-plan.md',
  'docs/decisions/ADR-021-coexistencia-v1-vnext-astro-ark-zag.md',
  'docs/decisions/ADR-023-quatro-saidas-com-angular-nativo.md',
  'registry.json',
  'registry/tis/accordion.tsx',
  'registry/tis/button.tsx',
  'registry/tis/dialog.tsx',
  'registry/tis/field.tsx',
  'registry/tis/input.tsx',
  'registry/tis/menu.tsx',
  'registry/tis/textarea.tsx',
  'registry/tis/tabs.tsx',
  'registry/tis/toast.tsx',
  'registry/tis/tooltip.tsx',
  'registry/tis/checkbox.tsx',
  'registry/tis/radio-group.tsx',
  'registry/tis/switch.tsx',
  'registry/tis/tis-utils.ts',
  'scripts/build-shadcn-registry.mjs',
  'scripts/lib/technology-implementations.mjs',
  'scripts/test-shadcn-consumer.mjs',
  'tests/consumer/react-vite/components.json',
  'tests/consumer/react-vite/src/App.tsx',
  'packages/theme-schema/src/theme.schema.json',
];

for (const relative of required) {
  if (!fs.existsSync(path.join(ROOT, relative))) errors.push(`${relative}: arquivo obrigatório ausente`);
}

const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const reactStoryFiles = fs.readdirSync(path.join(ROOT, 'packages/react/src/stories'))
  .filter((name) => name.endsWith('.stories.jsx'))
  .map((name) => `packages/react/src/stories/${name}`)
  .sort();

const astroConfig = read('apps/docs/astro.config.mjs');
if (!astroConfig.includes("site: 'https://tis-experience.github.io'")) {
  errors.push('Astro deve declarar a origem pública usada pelos canonicals');
}
if (
  !astroConfig.includes("const base = process.env.DS_DOCS_BASE || '/ds-tis/next'") ||
  !astroConfig.includes("'/': `${base}/pt-br/`")
) {
  errors.push('Astro deve redirecionar a raiz para o locale PT-BR dentro do base path');
}
if (
  !astroConfig.includes("{ slug: 'components' }") ||
  astroConfig.includes("items: [{ slug: 'react/components' }]") ||
  astroConfig.includes("{ slug: 'react/components/button' }") ||
  astroConfig.includes("{ slug: 'react/registry' }")
) {
  errors.push('Sidebar deve apontar para o catálogo único e não expor páginas técnicas ou componentes isolados');
}
if (!astroConfig.includes("label: 'Integração'") || !astroConfig.includes("{ slug: 'ai' }")) {
  errors.push('Sidebar deve separar catálogo de componentes e guias de integração');
}

for (const locale of ['pt-br', 'en']) {
  const components = getReactComponents(locale);
  if (components.length !== 22) {
    errors.push(`catálogo React ${locale} deve expor 22 componentes; recebeu ${components.length}`);
  }
  const names = components.map((component) => component.name);
  const expectedNames = [...names].sort(
    new Intl.Collator(locale === 'en' ? 'en' : 'pt', { sensitivity: 'base' }).compare,
  );
  if (JSON.stringify(names) !== JSON.stringify(expectedNames)) {
    errors.push(`catálogo React ${locale} deve permanecer em ordem alfabética`);
  }
  for (const component of components) {
    if (
      !component.category?.id ||
      !component.anatomy?.length ||
      !component.useWhen?.length ||
      !component.avoidWhen?.length ||
      !component.storyId ||
      !component.usage ||
      !component.accessibility ||
      !component.sourcePath ||
      !component.providerLabel ||
      !component.providerRoleLabel
    ) {
      errors.push(`${component.slug}: página React consolidada está sem preview, uso, acessibilidade ou source`);
    }
  }
  const groups = getReactComponentGroups(locale);
  if (groups.length !== 6) {
    errors.push(`catálogo React ${locale} deve agrupar os componentes em 6 categorias semânticas`);
  }
  for (const group of groups) {
    const groupNames = group.components.map((component) => component.name);
    const sortedGroupNames = [...groupNames].sort(
      new Intl.Collator(locale === 'en' ? 'en' : 'pt', { sensitivity: 'base' }).compare,
    );
    if (JSON.stringify(groupNames) !== JSON.stringify(sortedGroupNames)) {
      errors.push(`categoria ${group.id} do catálogo ${locale} deve permanecer em ordem alfabética`);
    }
  }
  const providerLabels = components.map((component) => component.providerLabel);
  if (
    locale === 'pt-br' &&
    providerLabels.some((label) => ['Native React', 'React composition', 'React presentation'].includes(label))
  ) {
    errors.push('catálogo React PT-BR deve localizar os providers exibidos sem alterar a API técnica');
  }
  for (const component of components) {
    const expectedRole = component.react.provider === 'Base UI'
      ? 'output-provider'
      : 'native-or-composition';
    if (component.react.providerRole !== expectedRole) {
      errors.push(`${component.slug}: papel do provider deve ser ${expectedRole}`);
    }
  }
}

if (
  SHADCN_REGISTRY.distribution !== 'shadcn-registry' ||
  SHADCN_REGISTRY.behaviorArchitecture !== 'base-ui' ||
  SHADCN_REGISTRY.currentReactBehaviorTrack !== 'react-shadcn-base-ui'
) {
  errors.push('contrato machine-readable deve identificar a saída React/shadcn/Base UI sem confundi-la com Ark/Zag');
}
if (
  TECHNOLOGY_OUTPUTS.length !== 4 ||
  ANGULAR_LIBRARY.package !== '@tis/angular' ||
  ANGULAR_LIBRARY.publicRegistry !== false ||
  Object.keys(ANGULAR_COMPONENTS_BY_SLUG).sort().join(',') !== 'accordion,badge,button,checkbox,combobox,input,menu,modal,popover,radio,select,tabs,textarea,toast,toggle,tooltip'
) {
  errors.push('contrato machine-readable deve declarar Angular nativo como quarta saída beta de workspace');
}

const favicon = read('apps/docs/public/favicon.svg');
if (!/<svg\b/.test(favicon) || favicon.length < 100) {
  errors.push('favicon.svg deve existir como SVG válido e não vazio');
}

if (astroConfig.includes('PageTitle:')) {
  errors.push('Astro deve usar o PageTitle padrão do Starlight, sem override customizado');
}
if (/\bbadge\s*:/.test(astroConfig)) {
  errors.push('Navegação do portal não deve decorar disponibilidade com badges de status');
}
if (fs.existsSync(path.join(ROOT, 'apps', 'docs', 'src', 'components', 'PageTitle.astro'))) {
  errors.push('PageTitle.astro customizado não deve sobreviver ao retorno para o padrão Starlight');
}

const documentContext = read('apps/docs/src/components/DocumentContext.astro');
if (!documentContext.includes('data-technology-select')) {
  errors.push('DocumentContext deve expor um único seletor de implementação');
}
if (
  !documentContext.includes("'Implementation'") ||
  !documentContext.includes("'Implementação'") ||
  documentContext.includes('data-technology-link')
) {
  errors.push('DocumentContext deve rotular a implementação sem manter um segundo tablist concorrente');
}
if (
  !documentContext.includes('ds-doc-context__stable-link') ||
  !documentContext.includes('Open stable v1 documentation') ||
  !documentContext.includes('Abrir documentação estável v1')
) {
  errors.push('DocumentContext deve oferecer uma referência discreta para a documentação v1');
}
if (!documentContext.includes("'astro:before-swap'") || !documentContext.includes('controller.abort()')) {
  errors.push('DocumentContext deve liberar listeners antes da troca de página');
}

const pageLayout = read('apps/docs/src/components/ComponentPageLayout.astro');
if (!pageLayout.includes('ds-editorial-tabs ds-editorial-tabs--panels')) {
  errors.push('ComponentPageLayout deve reutilizar o contrato visual de tabs editoriais');
}
if (pageLayout.includes('ds-component-tabs__label')) {
  errors.push('ComponentPageLayout não deve repetir um label visual antes de tabs autoexplicativas');
}
for (const id of ['design', 'usage', 'implementation', 'accessibility']) {
  if (!pageLayout.includes(`{ id: '${id}'`)) {
    errors.push(`ComponentPageLayout deve declarar a tab principal ${id}`);
  }
}
for (const contract of [
  'role="tablist"',
  'data-component-tab',
  'data-component-panel',
  'ArrowLeft',
  'ArrowRight',
  "'Home'",
  "'End'",
  'activateFromHash',
  "'hashchange'",
  'IntersectionObserver',
  "'astro:before-swap'",
  'controller.abort()',
  'headingObserver?.disconnect()',
  'editorialHeadings',
  '.ds-preview__canvas, .ds-dodont__preview, .ds-output-preview',
]) {
  if (!pageLayout.includes(contract)) {
    errors.push(`ComponentPageLayout deve preservar o contrato ${contract}`);
  }
}

const componentPanel = read('apps/docs/src/components/ComponentPanel.astro');
for (const contract of ['role="tabpanel"', 'aria-labelledby', 'data-component-panel', 'hidden={!active}']) {
  if (!componentPanel.includes(contract)) {
    errors.push(`ComponentPanel deve preservar o contrato ${contract}`);
  }
}

const componentAssets = read('apps/docs/src/lib/component-assets.ts');
for (const component of ['accordion', 'button']) {
  if (!componentAssets.includes(`${component}CssUrl`)) {
    errors.push(`component-assets deve declarar explicitamente o CSS de ${component}`);
  }
}
if (componentAssets.includes('index.css') || componentAssets.includes('reset.css')) {
  errors.push('component-assets não deve importar o bundle completo ou reset global do DS');
}

const componentGuidanceSource = read('apps/docs/src/components/ComponentGuidance.astro');
if (!componentGuidanceSource.includes('getComponentAssets')) {
  errors.push('ComponentGuidance deve resolver assets por componente');
}
if (!componentGuidanceSource.includes("'code'")) {
  errors.push('ComponentGuidance deve aceitar o tópico code para implementação Web');
}
if (!componentGuidanceSource.includes('linkBase')) {
  errors.push('ComponentGuidance deve passar a base pública para reescrever links HTML legados');
}
if (componentGuidanceSource.includes('initPopovers') || componentGuidanceSource.includes('destroyPopovers')) {
  errors.push('ComponentGuidance não deve reutilizar o runtime Web nos exemplos das outras saídas');
}
for (const icon of ['ChevronDown', 'Plus', 'Download', 'Trash2', 'Pencil', 'Settings', 'Search', 'X']) {
  if (!componentGuidanceSource.includes(icon)) {
    errors.push(`ComponentGuidance deve preservar o ícone Lucide tree-shaken ${icon}`);
  }
}

const componentSource = read('apps/docs/src/lib/component-source.mjs');
if (!componentSource.includes("'code'")) {
  errors.push('component-source deve permitir o tópico code');
}
if (
  !componentSource.includes("'ds-preview__canvas'") ||
  !componentSource.includes("setBooleanAttribute(child, 'inert')")
) {
  errors.push('component-source deve tornar canvases de preview inertes');
}

const copyVnextDocs = read('scripts/copy-vnext-docs.mjs');
if (
  !copyVnextDocs.includes("['storybook', 'storybook-angular'].includes(entry.name)")
) {
  errors.push('copy-vnext-docs deve preservar os Storybooks vNext e Angular em rebuilds parciais do Astro');
}

const buttonSource = read('docs/button.html');
const expectedTopicMinimums = {
  design: 10,
  usage: 4,
  code: 1,
  accessibility: 2,
};
for (const [topic, minimum] of Object.entries(expectedTopicMinimums)) {
  const count = (buttonSource.match(new RegExp(`data-doc-topic="${topic}"`, 'g')) || []).length;
  if (count < minimum) {
    errors.push(`Button deve expor ao menos ${minimum} landmarks ${topic}; recebeu ${count}`);
  }
}

for (const locale of ['pt', 'en']) {
  for (const topic of Object.keys(expectedTopicMinimums)) {
    const guidance = getComponentGuidance('button', topic, locale);
    if (!guidance.html.trim()) {
      errors.push(`Button ${locale}/${topic}: conteúdo compartilhado vazio`);
    }
    if (/data-lang=|<script|<iframe|ds-preview__tabs|ds-preview__code/.test(guidance.html)) {
      errors.push(`Button ${locale}/${topic}: adaptador preservou markup legado bloqueado`);
    }
  }
}

const demoGuidance = [
  getComponentGuidance('button', 'design', 'pt').html,
  getComponentGuidance('button', 'usage', 'pt').html,
].join('\n');
const previewCount = (
  demoGuidance.match(/class="[^"]*(?:ds-preview__canvas|ds-dodont__preview)[^"]*"/g) || []
).length;
const inertPreviewCount = (
  demoGuidance.match(/class="[^"]*(?:ds-preview__canvas|ds-dodont__preview)[^"]*"[^>]*\sinert(?:=""|(?=[\s>]))/g) || []
).length;
if (previewCount === 0 || inertPreviewCount !== previewCount) {
  errors.push(`Button: todas as ${previewCount} demos devem ser inertes; recebeu ${inertPreviewCount}`);
}
if (!/class="[^"]*ds-dodont__preview[^"]*"[^>]*\sinert/.test(demoGuidance)) {
  errors.push('Button usage: demos Do/Don’t devem permanecer inertes');
}

const hostileGuidance = extractGuidanceHtml(
  `
    <div data-doc-topic="usage" onclick="alert(1)" style="color: red">
      <script>alert(1)</script>
      <a href="javascript:alert(1)" onfocus="alert(1)">Unsafe link</a>
      <a href="../outside.html">Traversal link</a>
      <a href="safe.html?tab=usage#example">Safe document link</a>
      <img src="safe.png" srcset="unsafe.png 2x" onerror="alert(1)">
      <div class="ds-preview__canvas"><button type="button">Ação de exemplo</button></div>
      <span style="background: url(javascript:alert(1))">Unsafe style</span>
      <span data-lang="pt">Conteúdo seguro</span>
      <span data-lang="en">Safe content</span>
    </div>
  `,
  {
    slug: 'fixture',
    topic: 'usage',
    locale: 'pt',
    linkBase: '/ds-tis/docs',
  },
);
if (
  /<script|onclick|onfocus|onerror|javascript:|srcset|data-lang=/i.test(hostileGuidance) ||
  !hostileGuidance.includes('Conteúdo seguro') ||
  hostileGuidance.includes('Safe content') ||
  /href="[^"]*outside\.html"/.test(hostileGuidance) ||
  !hostileGuidance.includes('href="/ds-tis/docs/safe.html?tab=usage#example"') ||
  !/ds-preview__canvas[^>]*\sinert/.test(hostileGuidance)
) {
  errors.push('component-source não neutralizou a fixture hostil, filtrou seu locale ou tornou o preview inerte');
}
const interactiveGuidance = extractGuidanceHtml(
  '<div data-doc-topic="design"><div class="ds-preview__canvas" data-doc-interactive><button type="button">Abrir</button></div></div>',
  { slug: 'interactive-fixture', topic: 'design', locale: 'pt' },
);
if (!interactiveGuidance.includes('data-doc-interactive') || !/data-doc-interactive[^>]*\sinert/.test(interactiveGuidance)) {
  errors.push('component-source deve manter inerte qualquer demo importada da documentação compartilhada');
}
const tableGuidance = extractGuidanceHtml(
  '<div data-doc-topic="design"><table class="ds-token-table"><tbody><tr><td>Token</td></tr></tbody></table></div>',
  { slug: 'table-fixture', topic: 'design', locale: 'pt' },
);
if (!/<div class="ds-table-scroll"><table class="ds-token-table">/.test(tableGuidance)) {
  errors.push('component-source deve envolver tabelas de referência em uma região de rolagem');
}
const orderedGuidance = extractGuidanceHtml(
  '<div data-doc-topic="design" data-doc-order="10">Anatomia</div><div data-doc-topic="design" data-doc-order="20">Exemplo Web</div><div data-doc-topic="design" data-doc-order="30">Outro exemplo Web</div>',
  { slug: 'ordered-fixture', topic: 'design', locale: 'pt', includeOrders: [10, 30], excludeOrders: [30] },
);
if (!orderedGuidance.includes('Anatomia') || orderedGuidance.includes('Exemplo Web') || orderedGuidance.includes('Outro exemplo Web')) {
  errors.push('component-source deve filtrar landmarks por includeOrders e excludeOrders');
}
try {
  extractGuidanceHtml(
    '<script data-doc-topic="usage">alert(1)</script>',
    { slug: 'fixture-root', topic: 'usage', locale: 'pt' },
  );
  errors.push('component-source deveria rejeitar um landmark com raiz bloqueada');
} catch (error) {
  if (!String(error).includes('raiz div/section permitida')) {
    errors.push(`component-source rejeitou raiz hostil com erro inesperado: ${error}`);
  }
}

const buttonMdxPaths = [
  'apps/docs/src/content/docs/pt-br/web/components/button.mdx',
  'apps/docs/src/content/docs/en/web/components/button.mdx',
];
for (const relative of buttonMdxPaths) {
  const content = read(relative);
  if (
    !content.includes('<ComponentDocumentationPage slug="button" technology="web"') ||
    content.includes('<ComponentGuidance') ||
    content.includes('<ComponentPageLayout') ||
    content.includes('<DocumentContext')
  ) {
    errors.push(`${relative}: deve delegar integralmente para o renderer documental único`);
  }
}

const accordionHtml = read('docs/accordion.html');
const expectedAccordionTopics = { design: 6, usage: 3, code: 3, accessibility: 2 };
for (const [topic, expectedCount] of Object.entries(expectedAccordionTopics)) {
  const count = (accordionHtml.match(new RegExp(`data-doc-topic="${topic}"`, 'g')) || []).length;
  if (count !== expectedCount) {
    errors.push(`docs/accordion.html deve expor ${expectedCount} landmarks ${topic}; recebeu ${count}`);
  }
}
for (const locale of ['pt', 'en']) {
  for (const topic of Object.keys(expectedAccordionTopics)) {
    const guidance = getComponentGuidance('accordion', topic, locale);
    if (!guidance.html.trim()) {
      errors.push(`Accordion ${locale}/${topic}: conteúdo compartilhado vazio`);
    }
    if (/data-lang=|<script|<iframe|ds-preview__tabs|ds-preview__code/.test(guidance.html)) {
      errors.push(`Accordion ${locale}/${topic}: adaptador preservou markup legado bloqueado`);
    }
  }
}

const componentDocumentation = read('apps/docs/src/lib/component-documentation.ts');
for (const contract of [
  "storyId: 'components-accordion--playground'",
  "storyId: 'components-badge--playground'",
  "storyId: 'components-button--playground'",
  "storyId: 'components-modal--playground'",
  "storyId: 'components-popover--playground'",
  "storyId: 'components-tabs--playground'",
  "storyId: 'components-toast--playground'",
  'getReactComponents(locale).find',
  "technology === 'react' && status === 'beta' && !react",
  'config.ark?.adapterImport',
  "from '@tis/react/ark/accordion'",
  "from '@tis/react/ark/combobox'",
  "from '@tis/angular/combobox'",
  "from '@tis/angular/badge'",
  "from '@tis/angular/menu'",
  "from '@tis/react/ark/menu'",
  "from '@tis/react/ark/modal'",
  "from '@tis/react/ark/select'",
  "from '@tis/react/ark/tabs'",
  "from '@tis/react/ark/toast'",
  "implementation.storyId || undefined",
]) {
  if (!componentDocumentation.includes(contract)) {
    errors.push(`modelo documental único deve preservar o contrato ${contract}`);
  }
}

for (const modalStoryId of [
  'components-modal--tamanhos',
  'components-modal--corpo-customizado',
  'ark-modal--sizes',
  'ark-modal--custom-body',
  'react-modal--sizes',
  'react-modal--custom-body',
  'angular-modal--tamanhos',
  'angular-modal--corpo-customizado',
]) {
  if (!componentDocumentation.includes(`storyId: '${modalStoryId}'`)) {
    errors.push(`Modal deve publicar o exemplo executável próprio ${modalStoryId}`);
  }
}

const technologyImplementations = read('scripts/lib/technology-implementations.mjs');
if (!technologyImplementations.includes('badge: { entrypoint: "badge", primitive: "presentational host element", storyId: "angular-badge--playground" }')) {
  errors.push('catálogo canônico deve preservar o entrypoint, primitive e storyId do Badge Angular');
}
if (!technologyImplementations.includes('modal: { entrypoint: "modal", primitive: "@angular/cdk/overlay + portal + a11y", storyId: "angular-modal--playground" }')) {
  errors.push('catálogo canônico deve preservar o entrypoint e storyId do Modal Angular');
}
if (!technologyImplementations.includes('checkbox: { entrypoint: "checkbox", primitive: "native checkbox + Angular Forms", storyId: "angular-checkbox--playground" }')) {
  errors.push('catálogo canônico deve preservar o entrypoint, primitive e storyId do Checkbox Angular');
}
if (!technologyImplementations.includes('combobox: { entrypoint: "combobox", primitive: "@angular/aria/combobox + listbox + Angular Forms", storyId: "angular-combobox--playground" }')) {
  errors.push('catálogo canônico deve preservar o entrypoint, primitive e storyId do Combobox Angular');
}
if (!technologyImplementations.includes('menu: { entrypoint: "menu", primitive: "@angular/aria/menu", storyId: "angular-menu--playground" }')) {
  errors.push('catálogo canônico deve preservar o entrypoint, primitive e storyId do Menu Angular');
}
if (!technologyImplementations.includes('radio: { entrypoint: "radio", primitive: "native radio group + Angular Forms", storyId: "angular-radio--playground" }')) {
  errors.push('catálogo canônico deve preservar o entrypoint, primitive e storyId do Radio Angular');
}
if (!technologyImplementations.includes('toggle: { entrypoint: "toggle", primitive: "native switch + Angular Forms", storyId: "angular-toggle--playground" }')) {
  errors.push('catálogo canônico deve preservar o entrypoint, primitive e storyId do Toggle Angular');
}
if (!technologyImplementations.includes('tabs: { entrypoint: "tabs", primitive: "@angular/aria/tabs", storyId: "angular-tabs--playground" }')) {
  errors.push('catálogo canônico deve preservar o entrypoint, primitive e storyId do Tabs Angular');
}
if (!technologyImplementations.includes('tooltip: { entrypoint: "tooltip", primitive: "@angular/cdk/overlay + portal", storyId: "angular-tooltip--playground" }')) {
  errors.push('catálogo canônico deve preservar o entrypoint, primitive e storyId do Tooltip Angular');
}

const componentDocumentationPage = read('apps/docs/src/components/ComponentDocumentationPage.astro');
if (
  !componentDocumentationPage.includes('includeOrders={[10]}') ||
  !componentDocumentationPage.includes('data-output-example="playground"') ||
  !componentDocumentationPage.includes("slug === 'popover' ? [40, 50] : [60]") ||
  !componentDocumentationPage.includes("slug === 'popover' ? 'content-slot' : 'documented'")
) {
  errors.push('Popover deve separar anatomia compartilhada de exemplos executáveis próprios de cada saída');
}
if (
  !componentDocumentationPage.includes("slug === 'popover' || slug === 'modal'") ||
  !componentDocumentationPage.includes("slug === 'popover' ? [40, 50] : [60]") ||
  !componentDocumentationPage.includes("slug === 'popover' ? 'content-slot' : 'documented'") ||
  !componentDocumentationPage.includes('data-output-story-id={example.storyId}')
) {
  errors.push('Modal deve separar anatomia e tokens compartilhados de exemplos executáveis próprios de cada saída');
}
for (const contract of [
  '<ComponentPageHeader',
  '<ComponentPageLayout',
  '<ComponentGuidance slug={slug} topic="design"',
  '<ComponentGuidance slug={slug} topic="usage"',
  '<ComponentGuidance slug={slug} topic="code"',
  '<ComponentGuidance slug={slug} topic="accessibility"',
  '<OutputStoryPreview',
  "documentation.status === 'planned'",
  'Planejada, ainda não instalável',
  'Nenhuma evidência de implementação é alegada',
]) {
  if (!componentDocumentationPage.includes(contract)) {
    errors.push(`renderer documental único deve preservar o contrato ${contract}`);
  }
}

const unifiedOutputMdxPaths = ['accordion', 'button', 'combobox', 'menu', 'modal', 'popover', 'select', 'tabs', 'toast'].flatMap((slug) =>
  ['pt-br', 'en'].flatMap((locale) =>
    ['web', 'ark'].map((technology) =>
      `apps/docs/src/content/docs/${locale}/${technology}/components/${slug}.mdx`
    )
  )
);
for (const relative of unifiedOutputMdxPaths) {
  const content = read(relative);
  if (
    !content.includes('<ComponentDocumentationPage') ||
    content.includes('<ComponentGuidance') ||
    content.includes('<ComponentPageLayout') ||
    content.includes('<DocumentContext')
  ) {
    errors.push(`${relative}: deve delegar integralmente para o renderer documental único`);
  }
}

const reactComponentPage = read('apps/docs/src/components/ReactComponentPage.astro');
for (const section of [
  'Preview funcional',
  'Anatomia',
  'Variantes e estados',
  'Quando usar',
  'Quando não usar',
  'Composição React',
  'Instalação',
  'Contrato público',
  'Arquitetura técnica',
  'Semântica e comportamento',
  'Responsabilidade do consumidor',
  'Evidência de validação',
]) {
  if (!reactComponentPage.includes(section)) {
    errors.push(`template React único deve declarar a seção ${section}`);
  }
}
for (const contract of [
  '<ComponentDocumentationPage slug={unifiedSlug} technology="react"',
  '<ComponentPageHeader',
  '<OutputStoryPreview',
  'data-doc-secondary',
  '<ComponentPageLayout',
]) {
  if (!reactComponentPage.includes(contract)) {
    errors.push(`template React único deve preservar o contrato ${contract}`);
  }
}
const componentPageHeader = read('apps/docs/src/components/ComponentPageHeader.astro');
for (const contract of [
  'data-component-breadcrumb',
  'data-component-intro',
  '<DocumentContext',
  "`${base}/${locale}/components/`",
  'distribution',
]) {
  if (!componentPageHeader.includes(contract)) {
    errors.push(`header compartilhado de componente deve preservar o contrato ${contract}`);
  }
}

const popoverHtml = read('docs/popover.html');
const expectedPopoverTopics = { design: 5, usage: 2, code: 1, accessibility: 1 };
for (const [topic, expectedCount] of Object.entries(expectedPopoverTopics)) {
  const count = (popoverHtml.match(new RegExp(`data-doc-topic="${topic}"`, 'g')) || []).length;
  if (count !== expectedCount) {
    errors.push(`docs/popover.html deve expor ${expectedCount} landmarks ${topic}; recebeu ${count}`);
  }
}

const modalHtml = read('docs/modal.html');
const expectedModalTopics = { design: 6, code: 2, accessibility: 2 };
for (const [topic, expectedCount] of Object.entries(expectedModalTopics)) {
  const count = (modalHtml.match(new RegExp(`data-doc-topic="${topic}"`, 'g')) || []).length;
  if (count !== expectedCount) {
    errors.push(`docs/modal.html deve expor ${expectedCount} landmarks ${topic}; recebeu ${count}`);
  }
}

const popoverOutputMdxPaths = [
  'apps/docs/src/content/docs/pt-br/web/components/popover.mdx',
  'apps/docs/src/content/docs/en/web/components/popover.mdx',
  'apps/docs/src/content/docs/pt-br/ark/components/popover.mdx',
  'apps/docs/src/content/docs/en/ark/components/popover.mdx',
];
for (const relative of popoverOutputMdxPaths) {
  const content = read(relative);
  if (
    !content.includes('<ComponentDocumentationPage slug="popover"') ||
    content.includes('<ComponentGuidance') ||
    content.includes('<ComponentPageLayout') ||
    content.includes('<DocumentContext')
  ) {
    errors.push(`${relative}: deve delegar integralmente para o renderer documental único`);
  }
}
if (
  !componentDocumentation.includes("storyId: 'components-popover--playground'") ||
  !componentDocumentation.includes("storyId: 'components-popover--com-slot'") ||
  !componentDocumentation.includes("storyId: 'ark-popover--content-slot'") ||
  !componentDocumentation.includes("storyId: 'react-popover--content-slot'") ||
  !componentDocumentation.includes("storyId: 'angular-popover--content-slot'") ||
  !componentDocumentation.includes("size: 'large'") ||
  !componentDocumentation.includes('size: example.size') ||
  !componentDocumentationPage.includes('storybook={documentation.storybook}') ||
  !componentDocumentationPage.includes('size={example.size || config.previewSize}')
) {
  errors.push('cada saída do Popover deve carregar Playground e Content Slot do seu próprio Storybook');
}
const outputStoryPreview = read('apps/docs/src/components/OutputStoryPreview.astro');
const angularPreview = read('.storybook-angular/preview.ts');
const angularPreviewCss = read('.storybook-angular/preview.css');
if (
  !angularPreview.includes('document.documentElement.dataset["mode"]') ||
  angularPreview.includes('document.documentElement.dataset["theme"]') ||
  !angularPreviewCss.includes(':root[data-mode="dark"]')
) {
  errors.push('Storybook Angular deve aplicar o global mode no atributo data-mode consumido pelos tokens do DS');
}
if (
  !outputStoryPreview.includes("storybook?: 'stable' | 'vnext' | 'angular'") ||
  !outputStoryPreview.includes('data-output-storybook') ||
  !outputStoryPreview.includes("`${projectBase}/storybook`") ||
  !outputStoryPreview.includes("`${base}/storybook-angular`") ||
  !outputStoryPreview.includes('data-output-preview-shell aria-busy="true"') ||
  !outputStoryPreview.includes('loading="eager"') ||
  !outputStoryPreview.includes('syncFrame(frame)') ||
  !outputStoryPreview.includes("shell?.setAttribute('aria-busy', 'false')") ||
  outputStoryPreview.includes("rootMargin: '0px 0px -35% 0px'") ||
  outputStoryPreview.includes('src={`${storyUrl}&globals=mode:light`}')
) {
  errors.push('OutputStoryPreview deve distinguir Storybooks, carregar sem scroll, sincronizar tema antes do src e anunciar loading');
}
const componentCatalog = read('apps/docs/src/components/ComponentCatalog.astro');
const webVnextMatch = componentCatalog.match(/const webVnextSlugs = new Set\(\[([\s\S]*?)\]\);/);
const declaredWebVnextSlugs = webVnextMatch
  ? [...webVnextMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]).sort()
  : [];
const webPagesByLocale = ['pt-br', 'en'].map((locale) => fs
  .readdirSync(path.join(ROOT, 'apps', 'docs', 'src', 'content', 'docs', locale, 'web', 'components'))
  .filter((name) => name.endsWith('.mdx'))
  .map((name) => path.basename(name, '.mdx'))
  .sort());
if (
  !webVnextMatch ||
  JSON.stringify(webPagesByLocale[0]) !== JSON.stringify(webPagesByLocale[1]) ||
  JSON.stringify(declaredWebVnextSlugs) !== JSON.stringify(webPagesByLocale[0])
) {
  errors.push('catálogo canônico deve apontar cada página Web vNext existente para a rota vNext nos dois idiomas');
}
for (const contract of [
  'data-component-count={getComponents().length}',
  "['web', 'HTML/CSS/JS']",
  "['ark', 'Ark/Zag']",
  "['react', 'React']",
  "['angular', 'Angular']",
  'implementation.status',
  '.filter((output) => output.href)',
]) {
  if (!componentCatalog.includes(contract)) {
    errors.push(`catálogo canônico deve preservar o contrato ${contract}`);
  }
}
if (componentCatalog.includes('Contrato de design estável com a disponibilidade')) {
  errors.push('catálogo não deve repetir uma descrição genérica para componentes sem saída React');
}
if (documentContext.includes('localStorage')) {
  errors.push('seletor documental não deve gravar preferência que o portal não consome');
}
const arkPopoverSource = read('packages/react/src/ark/popover.jsx');
const arkPopoverStories = read('packages/react/src/stories/ark-popover.stories.jsx');
const arkAccordionSource = read('packages/react/src/ark/accordion.jsx');
const arkAccordionStories = read('packages/react/src/stories/ark-accordion.stories.jsx');
const arkModalSource = read('packages/react/src/ark/modal.jsx');
const arkModalStories = read('packages/react/src/stories/ark-modal.stories.jsx');
const arkMenuSource = read('packages/react/src/ark/menu.jsx');
const arkMenuStyles = read('packages/react/src/ark/menu.css');
const arkMenuStories = read('packages/react/src/stories/ark-menu.stories.jsx');
const arkSelectSource = read('packages/react/src/ark/select.jsx');
const arkSelectStories = read('packages/react/src/stories/ark-select.stories.jsx');
const arkTabsSource = read('packages/react/src/ark/tabs.jsx');
const arkTabsStories = read('packages/react/src/stories/ark-tabs.stories.jsx');
const arkToastSource = read('packages/react/src/ark/toast.jsx');
const arkToastStyles = read('packages/react/src/ark/toast.css');
const arkToastStories = read('packages/react/src/stories/ark-toast.stories.jsx');
if (
  !arkMenuSource.includes("from '@ark-ui/react/menu'") ||
  !arkMenuSource.includes('ds-ark-menu__positioner') ||
  !arkMenuSource.includes('<ArkMenu.CheckboxItem') ||
  !arkMenuSource.includes('<ArkMenu.RadioItem') ||
  !arkMenuStyles.includes('.ds-ark-menu__content:focus') ||
  !arkMenuStyles.includes('var(--ds-focus-ring-color-default)') ||
  !arkMenuStyles.includes('var(--ds-focus-ring-color-error)') ||
  arkMenuSource.includes('ds-tis-menu__') ||
  arkMenuSource.includes('@base-ui') ||
  arkMenuStories.includes('@base-ui') ||
  !arkMenuStories.includes("id: 'ark-menu'")
) {
  errors.push('Menu Ark/Zag deve preservar command, checkbox, radio, disabled e independência de Base UI');
}
if (
  !arkAccordionSource.includes("from '@ark-ui/react/accordion'") ||
  !arkAccordionSource.includes("defaultValue={defaultExpandedItems}") ||
  !arkAccordionSource.includes("multiple={mode === 'multiple'}") ||
  !arkAccordionSource.includes('onExpandedItemsChange(value)') ||
  arkAccordionSource.includes('@base-ui') ||
  arkAccordionStories.includes('@base-ui') ||
  !arkAccordionStories.includes("id: 'ark-accordion'") ||
  !arkAccordionStories.includes('<StoryCanvas fluid>')
) {
  errors.push('Accordion Ark/Zag deve expor adapter independente, API neutra e playground responsivo');
}
if (
  !arkModalSource.includes("from '@ark-ui/react/dialog'") ||
  !arkModalSource.includes("size = 'md'") ||
  !arkModalSource.includes('role="dialog"') ||
  !arkModalSource.includes('closeOnInteractOutside={closeOnInteractOutside}') ||
  !arkModalSource.includes("className={joinClasses('ds-modal', sizeClass, className)}") ||
  arkModalSource.includes('@base-ui') ||
  arkModalSource.includes('alertdialog') ||
  arkModalStories.includes('@base-ui') ||
  arkModalStories.includes('Excluir') ||
  arkModalStories.includes('danger') ||
  !arkModalStories.includes("id: 'ark-modal'") ||
  !arkModalStories.includes("options: ['sm', 'md', 'lg']")
) {
  errors.push('Modal Ark/Zag deve preservar o Dialog modal comum, a anatomia TIS e os três tamanhos sem simular Alert Dialog');
}
if (
  !arkPopoverSource.includes("export function Popover({ placement = 'bottom', positioning, ...props })") ||
  arkPopoverSource.includes("PopoverContent({\n  children,\n  className = '',\n  placement") ||
  !arkPopoverStories.includes("['top', 'right', 'bottom', 'left']")
) {
  errors.push('Popover Ark/Zag deve controlar placement no Root e comprovar os quatro lados');
}
if (
  !arkSelectSource.includes("from '@ark-ui/react/select'") ||
  !arkSelectSource.includes('createListCollection') ||
  !arkSelectSource.includes('<ArkSelect.HiddenSelect') ||
  !arkSelectSource.includes('ds-ark-select__positioner') ||
  arkSelectSource.includes('ds-tis-select__') ||
  arkSelectSource.includes('@base-ui') ||
  arkSelectStories.includes('@base-ui') ||
  !arkSelectStories.includes("id: 'ark-select'") ||
  !arkSelectStories.includes('isItemDisabled')
) {
  errors.push('Select Ark/Zag deve preservar coleção, opção disabled, valor de formulário e independência de Base UI');
}
if (
  !arkTabsSource.includes("from '@ark-ui/react/tabs'") ||
  !arkTabsSource.includes("activationMode = 'automatic'") ||
  !arkTabsSource.includes("className={joinClasses('ds-tabs'") ||
  !arkTabsSource.includes("className={joinClasses('ds-tab-panel'") ||
  arkTabsSource.includes('@base-ui') ||
  arkTabsStories.includes('@base-ui') ||
  !arkTabsStories.includes("id: 'ark-tabs'")
) {
  errors.push('Tabs Ark/Zag deve preservar seleção automática, anatomia TIS e independência de Base UI');
}
if (
  !arkToastSource.includes("from '@ark-ui/react/toast'") ||
  !arkToastSource.includes('createToaster({') ||
  !arkToastSource.includes('max: 5') ||
  !arkToastSource.includes("duration: options.duration ?? (action ? Infinity : DEFAULT_DURATION)") ||
  !arkToastSource.includes('ds-toast--${type}') ||
  !arkToastSource.includes('onClick={() => toast.action?.onClick?.()}') ||
  !arkToastSource.includes('<ArkToast.CloseTrigger') ||
  !arkToastStyles.includes('var(--ds-motion-duration-moderate)') ||
  arkToastSource.includes('@base-ui') ||
  arkToastStories.includes('@base-ui') ||
  !arkToastStories.includes("id: 'ark-toast'")
) {
  errors.push('Toast Ark/Zag deve preservar fila, timer, actions, dismiss, anatomia TIS e independência de Base UI');
}
if (!componentAssets.includes('popoverCssUrl') || !componentAssets.includes('popover: { css:')) {
  errors.push('guidance rica do Popover deve carregar as folhas CSS reais do componente e suas composições');
}
if (
  !componentAssets.includes('modalCssUrl') ||
  !componentAssets.includes('modal: { css: [buttonCssUrl, formFieldCssUrl, inputCssUrl, modalCssUrl] }')
) {
  errors.push('guidance rica do Modal deve carregar seu CSS e os componentes reais usados nas composições');
}
if (
  !componentAssets.includes('menuCssUrl') ||
  !componentAssets.includes('menu: { css: [buttonCssUrl, menuCssUrl] }') ||
  !componentAssets.includes('select: { css: [formFieldCssUrl, menuCssUrl, selectCssUrl] }')
) {
  errors.push('guidance rica do Select deve carregar Form Field, Menu e Select sem depender do CSS global do portal');
}
const dynamicReactRoute = read('apps/docs/src/pages/[locale]/react/components/[slug].astro');
if (dynamicReactRoute.includes("component.slug !== 'button'")) {
  errors.push('Button não pode manter uma página React paralela fora do template dinâmico');
}
const dynamicAngularRoute = read('apps/docs/src/pages/[locale]/angular/components/[slug].astro');
if (
  !dynamicAngularRoute.includes("'badge'") ||
  !dynamicAngularRoute.includes("badge: 'Badge'") ||
  !dynamicAngularRoute.includes("'combobox'") ||
  !dynamicAngularRoute.includes("combobox: 'Combobox'")
) {
  errors.push('rota Angular deve gerar e nomear as páginas do Badge e Combobox');
}

if (fs.existsSync(path.join(ROOT, 'apps', 'docs', 'src', 'components', 'ComponentPageChrome.astro'))) {
  errors.push('ComponentPageChrome.astro não deve sobreviver à composição Starlight + ComponentPageLayout');
}
if (fs.existsSync(path.join(ROOT, 'apps', 'docs', 'src', 'components', 'ButtonGuidance.astro'))) {
  errors.push('ButtonGuidance.astro não deve sobreviver como fonte editorial paralela');
}

const portalContentPaths = [
  'apps/docs/src/content/docs/pt-br/index.mdx',
  'apps/docs/src/content/docs/en/index.mdx',
  'apps/docs/src/content/docs/pt-br/ai.mdx',
  'apps/docs/src/content/docs/en/ai.mdx',
  'apps/docs/src/content/docs/pt-br/web/index.mdx',
  'apps/docs/src/content/docs/en/web/index.mdx',
  'apps/docs/src/content/docs/pt-br/react/index.mdx',
  'apps/docs/src/content/docs/pt-br/react/components/index.mdx',
  'apps/docs/src/content/docs/en/react/index.mdx',
  'apps/docs/src/content/docs/en/react/components/index.mdx',
  'apps/docs/src/content/docs/pt-br/angular/index.mdx',
  'apps/docs/src/content/docs/en/angular/index.mdx',
  'apps/docs/src/content/docs/pt-br/architecture.mdx',
  'apps/docs/src/content/docs/en/architecture.mdx',
  ...buttonMdxPaths,
];
const portalContent = portalContentPaths.map(read).join('\n');
const architectureContract = [
  read('docs/decisions/ADR-021-coexistencia-v1-vnext-astro-ark-zag.md'),
  read('docs/decisions/ADR-022-tres-saidas-de-implementacao-coexistentes.md'),
  read('docs/decisions/ADR-023-quatro-saidas-com-angular-nativo.md'),
  read('docs/agents/shadcn-base-ui-pilot.md'),
  read('docs/agents/shadcn-base-ui-implementation-plan.md'),
  read('apps/docs/src/content/docs/pt-br/architecture.mdx'),
  read('apps/docs/src/content/docs/en/architecture.mdx'),
].join('\n');
for (const contract of [
  'web-html-css-js',
  'ark-zag',
  'react-shadcn-base-ui',
  'angular-native',
  'Comparação significa paridade, não seleção de vencedor',
]) {
  if (!architectureContract.includes(contract)) {
    errors.push(`arquitetura de coexistência deve preservar o contrato: ${contract}`);
  }
}
if (!portalContent.includes('shadcn fornece estrutura de composição e distribui o source desta saída')) {
  errors.push('guia React PT-BR deve registrar estrutura/distribuição shadcn na saída React');
}
if (!portalContent.includes("shadcn provides composition structure and distributes this output's source")) {
  errors.push('guia React EN deve registrar estrutura/distribuição shadcn na saída React');
}
for (const staleLink of ['/docs/introduction.html', '/ds-tis/docs/components.html']) {
  if (portalContent.includes(staleLink)) {
    errors.push(`portal vNext ainda referencia link inexistente: ${staleLink}`);
  }
}
if (!read('apps/docs/src/content/docs/pt-br/index.mdx').includes('./components/')) {
  errors.push('landing PT-BR deve apontar diretamente para o catálogo de componentes');
}
if (!read('apps/docs/src/content/docs/en/index.mdx').includes('./components/')) {
  errors.push('landing EN deve apontar diretamente para o catálogo de componentes');
}
if (!read('apps/docs/src/content/docs/pt-br/index.mdx').includes('adapters beta independentes')) {
  errors.push('landing PT-BR deve refletir os adapters Ark/Zag realmente disponíveis');
}
if (!read('apps/docs/src/content/docs/en/index.mdx').includes('independent beta adapters')) {
  errors.push('landing EN deve refletir os adapters Ark/Zag realmente disponíveis');
}
if (!read('apps/docs/src/content/docs/pt-br/index.mdx').includes('[Angular](./angular/)')) {
  errors.push('landing PT-BR deve apresentar a quarta saída Angular');
}
if (!read('apps/docs/src/content/docs/en/index.mdx').includes('[Angular](./angular/)')) {
  errors.push('landing EN deve apresentar a quarta saída Angular');
}
for (const rootLanding of [
  'apps/docs/src/content/docs/pt-br/index.mdx',
  'apps/docs/src/content/docs/en/index.mdx',
]) {
  const content = read(rootLanding);
  if (content.includes('DocumentContext') || content.includes('StorybookEmbed')) {
    errors.push(`${rootLanding}: landing Starlight não deve exigir contexto/versionamento ou embed interno`);
  }
}
for (const technologyLanding of [
  'apps/docs/src/content/docs/pt-br/web/index.mdx',
  'apps/docs/src/content/docs/pt-br/react/index.mdx',
  'apps/docs/src/content/docs/en/web/index.mdx',
  'apps/docs/src/content/docs/en/react/index.mdx',
  'apps/docs/src/content/docs/pt-br/angular/index.mdx',
  'apps/docs/src/content/docs/en/angular/index.mdx',
]) {
  const content = read(technologyLanding);
  if (content.includes('<DocumentContext') || content.includes('StorybookEmbed')) {
    errors.push(`${technologyLanding}: integração não deve repetir a troca de tecnologia nem embutir Storybook`);
  }
}

const providerSource = [
  read('packages/react/src/provider-spike.jsx'),
  read('packages/react/src/provider-spike.stories.jsx'),
  read('packages/react/src/storybook.css'),
  read('apps/docs/src/styles/custom.css'),
].join('\n');
const shadcnPilotSource = [
  read('.storybook-vnext/preview.js'),
  ...reactStoryFiles.map(read),
  read('registry/tis/accordion.tsx'),
  read('registry/tis/alert.tsx'),
  read('registry/tis/badge.tsx'),
  read('registry/tis/button.tsx'),
  read('registry/tis/card.tsx'),
  read('registry/tis/dialog.tsx'),
  read('registry/tis/field.tsx'),
  read('registry/tis/input.tsx'),
  read('registry/tis/separator.tsx'),
  read('registry/tis/skeleton.tsx'),
  read('registry/tis/spinner.tsx'),
  read('registry/tis/textarea.tsx'),
  read('registry/tis/tabs.tsx'),
  read('registry/tis/toast.tsx'),
  read('registry/tis/tooltip.tsx'),
  read('registry/tis/checkbox.tsx'),
  read('registry/tis/radio-group.tsx'),
  read('registry/tis/switch.tsx'),
].join('\n');
const vnextStorybookMain = read('.storybook-vnext/main.mjs');
if (
  !vnextStorybookMain.includes("../packages/react/src/stories/**/*.stories") ||
  vnextStorybookMain.includes("../packages/react/src/**/*.stories")
) {
  errors.push('Storybook vNext deve indexar somente o catálogo público em packages/react/src/stories');
}
for (const component of getReactComponents('en')) {
  const storyFile = `packages/react/src/stories/${component.slug}.stories.jsx`;
  if (!reactStoryFiles.includes(storyFile)) {
    errors.push(`${component.slug}: arquivo de stories público ausente`);
    continue;
  }
  const storySource = read(storyFile);
  const expectedTitle = `Components/${component.category.label.en}/${component.name}`;
  if (
    !storySource.includes(`id: 'react-${component.slug}'`) ||
    !storySource.includes(`title: '${expectedTitle}'`) ||
    !storySource.includes("tags: ['autodocs']") ||
    !storySource.includes('export const Playground') ||
    !storySource.includes('storyArg({') ||
    !storySource.includes('description:')
  ) {
    errors.push(`${component.slug}: meta CSF deve declarar id estável, categoria canônica, Docs, Playground e API documentada`);
  }
}

const reactModalStories = read('packages/react/src/stories/modal.stories.jsx');
const registryDialog = read('registry/tis/dialog.tsx');
if (
  reactModalStories.includes('destructive') ||
  reactModalStories.includes('Excluir') ||
  !reactModalStories.includes("size: 'md'") ||
  !reactModalStories.includes('export const CustomBody') ||
  !registryDialog.includes('size = "md"') ||
  !registryDialog.includes('aria-modal="true"')
) {
  errors.push('Modal React deve usar md como padrão, compor body próprio, reservar destrutividade para Alert Dialog e expor aria-modal');
}
for (const staleStoryFile of [
  'packages/react/src/shadcn-base-ui.stories.jsx',
  'packages/react/src/shadcn-base-ui-forms.stories.jsx',
  'packages/react/src/shadcn-presentation.stories.jsx',
]) {
  if (fs.existsSync(path.join(ROOT, staleStoryFile))) {
    errors.push(`${staleStoryFile}: story combinada/orientada a onda não deve sobreviver ao catálogo por componente`);
  }
}
const portalStyles = read('apps/docs/src/styles/custom.css');
if (
  !portalStyles.includes("starlight-tabs .tablist-wrapper") ||
  !portalStyles.includes("starlight-tabs [role='tablist']") ||
  !portalStyles.includes("starlight-tabs [role='tab'][aria-selected='true']")
) {
  errors.push('Tabs nativas do Starlight devem reutilizar o contrato visual editorial do portal');
}
for (const className of [
  'ds-accordion',
  'ds-accordion__item--disabled',
  'ds-accordion__trigger',
  'ds-modal',
  'ds-modal-overlay',
  'ds-button',
]) {
  if (!`${providerSource}\n${arkAccordionSource}`.includes(className)) {
    errors.push(`Storybook React deve compor a classe pública ${className}`);
  }
}
if (!providerSource.includes('disabled={item.disabled}')) {
  errors.push('Accordion público deve encaminhar o estado disabled para Ark/Zag');
}
for (const contract of [
  '@base-ui/react/accordion',
  '@base-ui/react/button',
  '@base-ui/react/dialog',
  '@base-ui/react/input',
  '@base-ui/react/checkbox',
  '@base-ui/react/radio-group',
  '@base-ui/react/switch',
  '@base-ui/react/toast',
  'ds-accordion',
  'ds-alert',
  'ds-badge',
  'ds-button',
  'ds-card',
  'ds-checkbox',
  'ds-divider',
  'ds-field',
  'ds-input',
  'ds-modal',
  'ds-radio-group',
  'ds-skeleton',
  'ds-spinner',
  'ds-textarea',
  'ds-toggle',
  'ds-toast',
  'case "ArrowDown"',
  'case "Home"',
  'installRegistryAdapters',
]) {
  if (!shadcnPilotSource.includes(contract)) {
    errors.push(`piloto shadcn/Base UI deve preservar o contrato ${contract}`);
  }
}
if (/radix-ui|tailwindcss/.test(shadcnPilotSource)) {
  errors.push('registry React não deve introduzir Radix ou Tailwind nos sources atuais');
}
for (const component of getReactComponents('en')) {
  const source = read(component.sourcePath);
  if (source.includes('@ark-ui') && source.includes('@base-ui')) {
    errors.push(`${component.slug}: item do registry não pode misturar Ark e Base UI`);
  }
}
for (const rejected of [
  'Provider spike · não público',
  'Sem Tailwind',
  'vnext-accordion',
  'vnext-dialog',
  'vnext-button',
  'vnext-provider__eyebrow',
  'vnext-provider__badge',
  'vnext-provider__steps',
  'vnext-provider__step',
  'AvailabilityGrid',
  'ds-component-status',
  'Disponível · v1',
  'Available · v1',
  'Web · v1',
]) {
  if (portalContent.includes(rejected) || providerSource.includes(rejected)) {
    errors.push(`conceito visual rejeitado ainda presente: ${rejected}`);
  }
}
if (/(?:^|[^\d])01(?:[^\d]|$)|(?:^|[^\d])02(?:[^\d]|$)/m.test(providerSource)) {
  errors.push('Storybook React não deve preservar os steps visuais 01/02');
}

const reactPackage = JSON.parse(read('packages/react/package.json'));
if (reactPackage.dependencies?.['@ark-ui/react'] !== '5.37.2') {
  errors.push('@tis/react deve fixar @ark-ui/react em 5.37.2 durante o spike');
}
if (reactPackage.dependencies?.lucide !== '1.18.0') {
  errors.push('@tis/react deve declarar diretamente a biblioteca de ícones usada pelo preview');
}
if (reactPackage.exports?.['./provider-spike']) {
  errors.push('provider spike não pode ser exportado como API pública de @tis/react');
}
if (
  reactPackage.exports?.['./ark/accordion'] !== './src/ark/accordion.jsx' ||
  reactPackage.exports?.['./ark/menu'] !== './src/ark/menu.jsx' ||
  reactPackage.exports?.['./ark/modal'] !== './src/ark/modal.jsx' ||
  reactPackage.exports?.['./ark/popover'] !== './src/ark/popover.jsx' ||
  reactPackage.exports?.['./ark/select'] !== './src/ark/select.jsx'
) {
  errors.push('@tis/react deve expor apenas os adapters Ark/Zag aprovados por subpath explícito');
}
const reactIndex = read('packages/react/src/index.js');
if (reactIndex.includes('VNEXT_REACT_STATUS')) {
  errors.push('@tis/react não deve publicar placeholder de status como API root');
}

const validTheme = validateThemeConfig({
  brand: { seed: '#0056E0' },
  radius: 'default',
  typography: { sans: 'Inter', mono: 'DM Mono' },
  mode: 'light',
});
if (!validTheme.valid) errors.push(`theme-schema rejeitou config válida: ${validTheme.errors.join(' | ')}`);

const invalidTheme = validateThemeConfig({ brand: { seed: 'blue' }, mode: 'auto' });
if (invalidTheme.valid || invalidTheme.errors.length < 2) {
  errors.push('theme-schema deveria rejeitar seed e mode inválidos');
}

const unknownTheme = validateThemeConfig({
  brand: { seed: '#0056E0', legacy: true },
  platform: 'web',
});
if (unknownTheme.valid || unknownTheme.errors.length < 2) {
  errors.push('theme-schema deveria rejeitar propriedades fora do contrato');
}

const invalidScale = validateThemeConfig({
  brand: { seed: '#0056E0', scale: null },
});
if (invalidScale.valid || !invalidScale.errors.includes('brand.scale deve ser um objeto.')) {
  errors.push('theme-schema deveria rejeitar brand.scale não-objeto sem lançar exceção');
}

const mapped = mapThemeToVars({
  brand: { seed: '#0056E0' },
  radius: 'default',
  typography: { sans: 'Inter', mono: 'DM Mono' },
  mode: 'light',
}, 'light');
if (!mapped.vars['--ds-brand-background-default']) {
  errors.push('theme-engine bridge não emitiu --ds-brand-background-default');
}

const staticStorybook = [
  path.join(ROOT, 'storybook-vnext-static', 'index.json'),
  path.join(ROOT, '_site', 'next', 'storybook', 'index.json'),
]
  .filter((candidate) => fs.existsSync(candidate))
  .sort((left, right) => fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs)[0];
if (staticStorybook) {
  const index = JSON.parse(fs.readFileSync(staticStorybook, 'utf8'));
  const entries = Object.values(index.entries || {});
  const publicComponents = getReactComponents('en');
  const componentEntries = entries.filter((entry) => entry.title?.startsWith('Components/'));
  const componentTitles = new Set(componentEntries.map((entry) => entry.title));
  if (componentTitles.size !== 22) {
    errors.push(`Storybook vNext deve publicar 22 grupos de componente; recebeu ${componentTitles.size}`);
  }
  for (const component of publicComponents) {
    const expectedTitle = `Components/${component.category.label.en}/${component.name}`;
    const componentGroup = entries.filter((entry) => entry.title === expectedTitle);
    const docsCount = componentGroup.filter((entry) => entry.type === 'docs').length;
    const playground = componentGroup.find(
      (entry) => entry.type === 'story' && entry.name === 'Playground',
    );
    const storiesCount = componentGroup.filter((entry) => entry.type === 'story').length;
    if (docsCount !== 1 || !playground || storiesCount < 3) {
      errors.push(`${component.slug}: Storybook deve ter uma Docs, Playground e ao menos dois exemplos`);
    }
    if (playground?.id !== component.storyId) {
      errors.push(`${component.slug}: portal e Storybook divergem no id ${component.storyId}`);
    }
  }
  const overview = entries.filter((entry) => entry.title === 'Overview/React registry');
  if (
    overview.filter((entry) => entry.type === 'docs').length !== 1 ||
    !overview.some((entry) => entry.type === 'story' && entry.name === 'Start here')
  ) {
    errors.push('Storybook vNext deve abrir com uma visão geral operacional do registry React');
  }
  const arkPopoverOutput = entries.filter((entry) => entry.title === 'Outputs/Ark + Zag/Popover');
  if (
    arkPopoverOutput.filter((entry) => entry.type === 'docs').length !== 1 ||
    !arkPopoverOutput.some((entry) => entry.id === 'ark-popover--playground')
  ) {
    errors.push('Storybook vNext deve publicar o Popover Ark/Zag em uma saída separada');
  }
  const arkAccordionOutput = entries.filter((entry) => entry.title === 'Outputs/Ark + Zag/Accordion');
  if (
    arkAccordionOutput.filter((entry) => entry.type === 'docs').length !== 1 ||
    !arkAccordionOutput.some((entry) => entry.id === 'ark-accordion--playground')
  ) {
    errors.push('Storybook vNext deve publicar o Accordion Ark/Zag em uma saída separada');
  }
  const arkModalOutput = entries.filter((entry) => entry.title === 'Outputs/Ark + Zag/Modal');
  if (
    arkModalOutput.filter((entry) => entry.type === 'docs').length !== 1 ||
    !arkModalOutput.some((entry) => entry.id === 'ark-modal--playground')
  ) {
    errors.push('Storybook vNext deve publicar o Modal Ark/Zag em uma saída separada');
  }
  const arkSelectOutput = entries.filter((entry) => entry.title === 'Outputs/Ark + Zag/Select');
  if (
    arkSelectOutput.filter((entry) => entry.type === 'docs').length !== 1 ||
    !arkSelectOutput.some((entry) => entry.id === 'ark-select--playground')
  ) {
    errors.push('Storybook vNext deve publicar o Select Ark/Zag em uma saída separada');
  }
  const arkMenuOutput = entries.filter((entry) => entry.title === 'Outputs/Ark + Zag/Menu');
  if (
    arkMenuOutput.filter((entry) => entry.type === 'docs').length !== 1 ||
    !arkMenuOutput.some((entry) => entry.id === 'ark-menu--playground')
  ) {
    errors.push('Storybook vNext deve publicar o Menu Ark/Zag em uma saída separada');
  }
  const arkTooltipOutput = entries.filter((entry) => entry.title === 'Outputs/Ark + Zag/Tooltip');
  if (
    arkTooltipOutput.filter((entry) => entry.type === 'docs').length !== 1 ||
    !arkTooltipOutput.some((entry) => entry.id === 'ark-tooltip--playground')
  ) {
    errors.push('Storybook vNext deve publicar o Tooltip Ark/Zag em uma saída separada');
  }
  const arkTabsOutput = entries.filter((entry) => entry.title === 'Outputs/Ark + Zag/Tabs');
  if (
    arkTabsOutput.filter((entry) => entry.type === 'docs').length !== 1 ||
    !arkTabsOutput.some((entry) => entry.id === 'ark-tabs--playground')
  ) {
    errors.push('Storybook vNext deve publicar Tabs Ark/Zag em uma saída separada');
  }
  const arkToastOutput = entries.filter((entry) => entry.title === 'Outputs/Ark + Zag/Toast');
  if (
    arkToastOutput.filter((entry) => entry.type === 'docs').length !== 1 ||
    !arkToastOutput.some((entry) => entry.id === 'ark-toast--playground')
  ) {
    errors.push('Storybook vNext deve publicar Toast Ark/Zag em uma saída separada');
  }
  const internalEntries = entries.filter((entry) => /internal|comparison|provider/i.test(entry.title));
  if (internalEntries.length > 0) {
    errors.push('Storybook vNext não pode expor comparações internas na navegação pública');
  }
  const mixedNames = entries.filter(
    (entry) => entry.type === 'story' && /Alert \+ Badge|Checkbox, Radio|Divider, Skeleton|Form Field, Input/i.test(entry.name),
  );
  if (mixedNames.length > 0) {
    errors.push('Storybook vNext ainda possui stories públicas que misturam componentes no mesmo nome');
  }
  const technicalTitles = entries.filter(
    (entry) => entry.type === 'story' && /vnext|pilot|forms|presentation|shadcn/i.test(entry.title),
  );
  if (technicalTitles.length > 0) {
    errors.push('Storybook vNext ainda expõe ondas/providers técnicos na navegação pública');
  }
  const reactDocs = componentEntries.filter((entry) => entry.type === 'docs');
  if (reactDocs.length !== 22) {
    errors.push(`Storybook React deve ter uma Docs por componente; recebeu ${reactDocs.length}`);
  }
}

const staticPortal = path.join(ROOT, '_site', 'next');
if (fs.existsSync(staticPortal)) {
  const redirectHtml = fs.readFileSync(path.join(staticPortal, 'index.html'), 'utf8');
  if (
    !redirectHtml.includes('url=/ds-tis/next/pt-br/') ||
    !redirectHtml.includes('href="/ds-tis/next/pt-br/"') ||
    !redirectHtml.includes('href="https://tis-experience.github.io/ds-tis/next/pt-br/"')
  ) {
    errors.push('artefato vNext raiz não redireciona/canonicaliza para /ds-tis/next/pt-br/');
  }
  for (const locale of ['pt-br', 'en']) {
    for (const component of getReactComponents(locale)) {
      const componentPage = path.join(
        staticPortal,
        locale,
        'react',
        'components',
        component.slug,
        'index.html',
      );
      if (!fs.existsSync(componentPage)) {
        errors.push(`portal vNext não publicou ${locale}/react/components/${component.slug}`);
      }
    }
  }

  const representativePages = [
    ['pt-br/index.html', 'https://tis-experience.github.io/ds-tis/next/pt-br/'],
    ['pt-br/web/components/button/index.html', 'https://tis-experience.github.io/ds-tis/next/pt-br/web/components/button/'],
    ['en/react/components/button/index.html', 'https://tis-experience.github.io/ds-tis/next/en/react/components/button/'],
  ];
  for (const [relative, canonical] of representativePages) {
    const htmlPath = path.join(staticPortal, relative);
    if (!fs.existsSync(htmlPath)) {
      errors.push(`artefato vNext ausente para validar canonical: ${relative}`);
      continue;
    }
    const html = fs.readFileSync(htmlPath, 'utf8');
    if (!html.includes(`<link rel="canonical" href="${canonical}"`)) {
      errors.push(`${relative}: canonical não respeita o base path`);
    }
    if (!html.includes('href="/ds-tis/next/favicon.svg"')) {
      errors.push(`${relative}: favicon base-aware ausente`);
    }
  }
  if (!fs.existsSync(path.join(staticPortal, 'favicon.svg'))) {
    errors.push('artefato vNext não publicou favicon.svg');
  }

  const brokenReferences = findBrokenLocalReferences(staticPortal);
  for (const reference of brokenReferences.slice(0, 20)) {
    errors.push(`referência local quebrada: ${reference}`);
  }
  if (brokenReferences.length > 20) {
    errors.push(`referências locais quebradas adicionais omitidas: ${brokenReferences.length - 20}`);
  }
}

if (errors.length) {
  console.error('\n❌ Fundação vNext inválida:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('✅ Fundação vNext: Starlight, quatro saídas coexistentes, catálogos, schema e tema válidos.');

function findBrokenLocalReferences(portalRoot) {
  const siteRoot = path.join(ROOT, '_site');
  const productionOrigin = 'https://tis-experience.github.io';
  const htmlFiles = listFiles(portalRoot).filter((file) => file.endsWith('.html'));
  const broken = new Set();

  for (const htmlPath of htmlFiles) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const pagePath = artifactPathToPublicPath(siteRoot, htmlPath);
    const pageUrl = new URL(pagePath, productionOrigin);
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const rawReference = match[1].trim();
      if (
        !rawReference ||
        rawReference.startsWith('#') ||
        /^(?:data|mailto|tel|javascript):/i.test(rawReference)
      ) {
        continue;
      }

      const target = new URL(rawReference, pageUrl);
      if (target.origin !== productionOrigin) continue;
      const artifactPath = publicPathToArtifact(siteRoot, target.pathname);
      if (!artifactPath) {
        broken.add(`${path.relative(siteRoot, htmlPath)} → ${target.pathname}`);
      }
    }
  }
  return [...broken].sort();
}

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(target) : [target];
  });
}

function artifactPathToPublicPath(siteRoot, htmlPath) {
  const relative = path.relative(siteRoot, htmlPath).split(path.sep).join('/');
  if (relative.endsWith('/index.html')) return `/ds-tis/${relative.slice(0, -'index.html'.length)}`;
  return `/ds-tis/${relative}`;
}

function publicPathToArtifact(siteRoot, pathname) {
  let relative;
  if (pathname === '/ds-tis' || pathname === '/ds-tis/') relative = 'index.html';
  else if (pathname.startsWith('/ds-tis/')) relative = decodeURIComponent(pathname.slice('/ds-tis/'.length));
  else return null;

  const direct = path.resolve(siteRoot, relative);
  if (!direct.startsWith(`${siteRoot}${path.sep}`) && direct !== path.join(siteRoot, 'index.html')) return null;
  const candidates = [
    direct,
    path.join(direct, 'index.html'),
    `${direct.replace(/\/$/, '')}.html`,
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}
