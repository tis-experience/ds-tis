import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateThemeConfig } from '../packages/theme-schema/src/index.js';
import { mapThemeToVars } from '../packages/theme-engine/src/index.js';
import {
  extractGuidanceHtml,
  getComponentGuidance,
} from '../apps/docs/src/lib/component-source.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const required = [
  'apps/docs/astro.config.mjs',
  'apps/docs/src/content/docs/pt-br/index.mdx',
  'apps/docs/src/content/docs/pt-br/web/index.mdx',
  'apps/docs/src/content/docs/pt-br/react/index.mdx',
  'apps/docs/src/content/docs/pt-br/react/registry.mdx',
  'apps/docs/src/content/docs/pt-br/web/components/button.mdx',
  'apps/docs/src/content/docs/pt-br/react/components/button.mdx',
  'apps/docs/src/content/docs/en/web/index.mdx',
  'apps/docs/src/content/docs/en/react/index.mdx',
  'apps/docs/src/content/docs/en/react/registry.mdx',
  'apps/docs/src/components/DocumentContext.astro',
  'apps/docs/src/components/ComponentPageLayout.astro',
  'apps/docs/src/components/ComponentPanel.astro',
  'apps/docs/src/components/ComponentGuidance.astro',
  'apps/docs/src/lib/component-assets.ts',
  'apps/docs/src/lib/component-source.mjs',
  'apps/docs/public/favicon.svg',
  'apps/docs/README.md',
  'scripts/preview-vnext.mjs',
  '.storybook-vnext/main.mjs',
  'packages/react/src/provider-spike.jsx',
  'packages/react/src/provider-spike.stories.jsx',
  'packages/react/src/shadcn-base-ui.stories.jsx',
  'packages/react/src/shadcn-base-ui-forms.stories.jsx',
  'docs/agents/ark-zag-reference.md',
  'docs/agents/shadcn-base-ui-pilot.md',
  'docs/agents/shadcn-base-ui-implementation-plan.md',
  'docs/decisions/ADR-021-coexistencia-v1-vnext-astro-ark-zag.md',
  'registry.json',
  'registry/tis/accordion.tsx',
  'registry/tis/button.tsx',
  'registry/tis/dialog.tsx',
  'registry/tis/field.tsx',
  'registry/tis/input.tsx',
  'registry/tis/textarea.tsx',
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
if (!documentContext.includes('ds-editorial-tabs ds-editorial-tabs--links')) {
  errors.push('DocumentContext deve reutilizar o contrato visual de tabs editoriais');
}
if (!documentContext.includes('data-technology-link')) {
  errors.push('DocumentContext deve expor navegação por tecnologia baseada em links');
}
if (!documentContext.includes('data-technology-select')) {
  errors.push('DocumentContext deve preservar fallback select para tecnologia');
}
if (
  documentContext.includes('ds-doc-context__label') ||
  documentContext.includes("'View for'") ||
  documentContext.includes("'Ver para'")
) {
  errors.push('DocumentContext não deve exibir label ou chrome de segmented control');
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
for (const component of ['button']) {
  if (!componentAssets.includes(`${component}CssUrl`)) {
    errors.push(`component-assets deve declarar explicitamente o CSS de ${component}`);
  }
}
if (componentAssets.includes('accordionCssUrl')) {
  errors.push('component-assets não deve emitir CSS de Accordion antes de existir uma rota Astro correspondente');
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
for (const icon of ['Plus', 'Download', 'Trash2', 'Pencil', 'Settings', 'Search', 'X']) {
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
if (!copyVnextDocs.includes("entry.name === 'storybook'")) {
  errors.push('copy-vnext-docs deve preservar o Storybook em rebuilds parciais do Astro');
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
  'apps/docs/src/content/docs/pt-br/react/components/button.mdx',
  'apps/docs/src/content/docs/en/web/components/button.mdx',
  'apps/docs/src/content/docs/en/react/components/button.mdx',
];
for (const relative of buttonMdxPaths) {
  const content = read(relative);
  const isReact = relative.includes('/react/');
  const sharedGuidanceCalls = (content.match(/<ComponentGuidance slug="button"/g) || []).length;
  const expectedCalls = isReact ? 2 : 4;
  if (sharedGuidanceCalls !== expectedCalls) {
    errors.push(`${relative}: deve consumir ${expectedCalls} tópicos compartilhados; recebeu ${sharedGuidanceCalls}`);
  }
  const panelCount = (content.match(/<ComponentPanel id="/g) || []).length;
  if (panelCount !== 4) {
    errors.push(`${relative}: deve declarar os 4 painéis principais; recebeu ${panelCount}`);
  }
  for (const panel of ['design', 'usage', 'implementation', 'accessibility']) {
    if (!content.includes(`<ComponentPanel id="${panel}"`)) {
      errors.push(`${relative}: painel ${panel} ausente`);
    }
  }
  if (
    !content.includes('<ComponentPageLayout') ||
    content.includes('ComponentPageChrome') ||
    !content.includes('<DocumentContext') ||
    !content.includes('showVersion={false}') ||
    content.includes('SectionNav') ||
    content.includes('tableOfContents: true')
  ) {
    errors.push(`${relative}: deve usar DocumentContext + ComponentPageLayout sem chrome/ToC paralelo`);
  }
  if (content.includes('ButtonGuidance')) {
    errors.push(`${relative}: ainda referencia a fonte editorial paralela ButtonGuidance`);
  }

  if (isReact) {
    if (
      content.includes('topic="code"') ||
      !content.includes('<Tabs syncKey="package-manager">') ||
      !content.includes('@tis/button') ||
      !/(`@tis\/react` (não é um pacote público|is not a public package))/.test(content) ||
      !/(Gate executado|Executed gate)/.test(content)
    ) {
      errors.push(`${relative}: deve comunicar a distribuição React beta por source sem anunciar @tis/react`);
    }
  } else if (
    !content.includes('topic="code"') ||
    !content.includes("import 'ds-tis/css';") ||
    !content.includes('<Tabs syncKey="package-manager">')
  ) {
    errors.push(`${relative}: implementação Web deve incluir instalação, import e tópico code`);
  }
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
  'apps/docs/src/content/docs/pt-br/web/index.mdx',
  'apps/docs/src/content/docs/en/web/index.mdx',
  'apps/docs/src/content/docs/pt-br/react/index.mdx',
  'apps/docs/src/content/docs/en/react/index.mdx',
  'apps/docs/src/content/docs/pt-br/react/registry.mdx',
  'apps/docs/src/content/docs/en/react/registry.mdx',
  'apps/docs/src/content/docs/pt-br/architecture.mdx',
  'apps/docs/src/content/docs/en/architecture.mdx',
  ...buttonMdxPaths,
];
const portalContent = portalContentPaths.map(read).join('\n');
for (const staleLink of ['/docs/introduction.html', '/ds-tis/docs/components.html']) {
  if (portalContent.includes(staleLink)) {
    errors.push(`portal vNext ainda referencia link inexistente: ${staleLink}`);
  }
}
if (!read('apps/docs/src/content/docs/pt-br/index.mdx').includes('./web/components/button/')) {
  errors.push('landing PT-BR deve usar link base-aware para Button');
}
if (!read('apps/docs/src/content/docs/en/index.mdx').includes('./web/components/button/')) {
  errors.push('landing EN deve usar link base-aware para Button');
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
]) {
  const content = read(technologyLanding);
  if (!content.includes('<DocumentContext') || content.includes('StorybookEmbed')) {
    errors.push(`${technologyLanding}: deve usar DocumentContext discreto sem embed interno de Storybook`);
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
  read('packages/react/src/shadcn-base-ui.stories.jsx'),
  read('packages/react/src/shadcn-base-ui-forms.stories.jsx'),
  read('registry/tis/accordion.tsx'),
  read('registry/tis/button.tsx'),
  read('registry/tis/dialog.tsx'),
  read('registry/tis/field.tsx'),
  read('registry/tis/input.tsx'),
  read('registry/tis/textarea.tsx'),
  read('registry/tis/checkbox.tsx'),
  read('registry/tis/radio-group.tsx'),
  read('registry/tis/switch.tsx'),
].join('\n');
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
  if (!providerSource.includes(className)) {
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
  'ds-accordion',
  'ds-button',
  'ds-checkbox',
  'ds-field',
  'ds-input',
  'ds-modal',
  'ds-radio-group',
  'ds-textarea',
  'ds-toggle',
  'case "ArrowDown"',
  'case "Home"',
  'installRegistryAdapters',
]) {
  if (!shadcnPilotSource.includes(contract)) {
    errors.push(`piloto shadcn/Base UI deve preservar o contrato ${contract}`);
  }
}
if (/@ark-ui|radix-ui|tailwindcss/.test(shadcnPilotSource)) {
  errors.push('piloto shadcn/Base UI não deve misturar Ark, Radix ou Tailwind nos sources');
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
].find((candidate) => fs.existsSync(candidate));
if (staticStorybook) {
  const index = JSON.parse(fs.readFileSync(staticStorybook, 'utf8'));
  const entries = Object.values(index.entries || {});
  for (const storyName of ['Accordion', 'Modal']) {
    if (
      !entries.some(
        (entry) =>
          entry.type === 'story' &&
          entry.title === 'vNext/React components' &&
          entry.name === storyName,
      )
    ) {
      errors.push(`Storybook vNext não publicou ${storyName} em vNext/React components`);
    }
  }
  for (const storyName of [
    'Fields · Input + Textarea',
    'Selection · Checkbox + Radio + Switch',
    'Sizes and states',
    'Native form submission',
  ]) {
    if (
      !entries.some(
        (entry) =>
          entry.type === 'story' &&
          entry.title === 'vNext/shadcn + Base UI forms' &&
          entry.name === storyName,
      )
    ) {
      errors.push(`Storybook vNext não publicou ${storyName} na onda 1 shadcn/Base UI`);
    }
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

console.log('✅ Fundação vNext: Starlight, contexto discreto, conteúdo, componentes públicos, links, Ark/Zag, shadcn/Base UI, schema e tema válidos.');

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
