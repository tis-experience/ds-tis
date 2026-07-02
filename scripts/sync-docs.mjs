#!/usr/bin/env node
/**
 * sync-docs.mjs
 *
 * Gera automaticamente os documentos de knowledge base a partir do estado
 * real do repo. Roda com: npm run sync:docs
 *
 * Saída: docs/token-schema.md
 *         docs/component-inventory.md
 *         docs/adr-index.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs');

// ─── Helpers ────────────────────────────────────────────────────────────────

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return null; }
}

function countTokens(obj) {
  if (!obj || typeof obj !== 'object') return 0;
  let count = 0;
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    if (val && typeof val === 'object' && '$value' in val) count++;
    else if (val && typeof val === 'object') count += countTokens(val);
  }
  return count;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// ─── Leitura do repo ─────────────────────────────────────────────────────────

const pkg = readJson(path.join(ROOT, 'package.json')) || {};
const version = pkg.version || 'desconhecida';

// Foundation
const foundationDir = path.join(ROOT, 'tokens', 'foundation');
const foundationFiles = fs.existsSync(foundationDir)
  ? fs.readdirSync(foundationDir).filter(f => f.endsWith('.json'))
  : [];
const foundationStats = foundationFiles.map(f => {
  const json = readJson(path.join(foundationDir, f));
  const root = json ? json[Object.keys(json)[0]] : null;
  return { file: f, count: root ? countTokens(root) : 0 };
});
const foundationTotal = foundationStats.reduce((s, f) => s + f.count, 0);

// Semantic
const semanticDir = path.join(ROOT, 'tokens', 'semantic');
const lightJson = readJson(path.join(semanticDir, 'light.json'));
const darkJson = readJson(path.join(semanticDir, 'dark.json'));
const semanticRoot = lightJson ? lightJson[Object.keys(lightJson)[0]] : null;
const semanticTotal = semanticRoot ? countTokens(semanticRoot) : 0;
const semanticCategories = semanticRoot ? Object.keys(semanticRoot) : [];
const darkRoot = darkJson ? darkJson[Object.keys(darkJson)[0]] : null;
const darkTotal = darkRoot ? countTokens(darkRoot) : 0;
const paridadeOk = semanticTotal === darkTotal;

// Component
const componentDir = path.join(ROOT, 'tokens', 'component');
const componentFiles = fs.existsSync(componentDir)
  ? fs.readdirSync(componentDir).filter(f => f.endsWith('.json'))
  : [];
const componentStats = componentFiles.map(f => {
  const json = readJson(path.join(componentDir, f));
  const root = json ? json[Object.keys(json)[0]] : null;
  return { file: f, count: root ? countTokens(root) : 0 };
});
const componentTotal = componentStats.reduce((s, f) => s + f.count, 0);

// CSS components
const cssComponentsDir = path.join(ROOT, 'css', 'components');
const cssComponents = fs.existsSync(cssComponentsDir)
  ? fs.readdirSync(cssComponentsDir).filter(f => f.endsWith('.css')).map(f => path.basename(f, '.css'))
  : [];

// ADRs
const decisionsDir = path.join(ROOT, 'docs', 'decisions');
const adrFiles = fs.existsSync(decisionsDir)
  ? fs.readdirSync(decisionsDir).filter(f => f.match(/^ADR-\d+/i) && f.endsWith('.md')).sort()
  : [];
const adrs = adrFiles.map(f => {
  const content = fs.readFileSync(path.join(decisionsDir, f), 'utf8');
  const titleMatch = content.match(/^#\s+ADR-\d+[:\s]+(.+)$/m);
  const statusMatch = content.match(/\*\*Status:\*\*\s*(.+)/);
  const dateMatch = content.match(/\*\*Data:\*\*\s*(.+)/);
  const numMatch = f.match(/ADR-(\d+)/i);
  return {
    file: f,
    num: numMatch ? numMatch[1] : '?',
    title: titleMatch ? titleMatch[1].trim() : f,
    status: statusMatch ? statusMatch[1].trim() : '—',
    date: dateMatch ? dateMatch[1].trim() : '—',
  };
});

// Pipeline check
const generatedDir = path.join(ROOT, 'css', 'tokens', 'generated');
const generatedFiles = fs.existsSync(generatedDir)
  ? fs.readdirSync(generatedDir).filter(f => f.endsWith('.css'))
  : [];
const indexCss = fs.existsSync(path.join(ROOT, 'css', 'tokens', 'index.css'))
  ? fs.readFileSync(path.join(ROOT, 'css', 'tokens', 'index.css'), 'utf8')
  : '';
const nonGeneratedImports = (indexCss.match(/@import\s+['"][^'"]+['"]/g) || []).filter(imp => !imp.includes('generated/') && !imp.includes('themes/'));
const pipelineClean = generatedFiles.length > 0 && nonGeneratedImports.length === 0;

// ─── token-schema.md ─────────────────────────────────────────────────────────

const tokenSchema = `# Token schema — Design System Core

> Gerado automaticamente por \`scripts/sync-docs.mjs\` em ${today()}. Não editar manualmente.
> Para regenerar: \`npm run sync:docs\`
> Versão atual: **${version}**

## Estado atual

| Aspecto | Valor |
|---------|-------|
| Versão | ${version} |
| Formato canônico | JSON (DTCG) em \`tokens/\` |
| CSS gerado | Style Dictionary → \`css/tokens/generated/\` |
| Pipeline | ${pipelineClean ? '✅ index.css importa apenas generated/' : '⚠️ index.css ainda importa legados'} |
| Paridade light/dark | ${paridadeOk ? '✅ chaves alinhadas entre modos' : `⚠️ light=${semanticTotal}, dark=${darkTotal} — divergência`} |

## Camadas

| Camada | Arquivos | Papel |
|--------|----------|-------|
| Foundation/Core | \`tokens/foundation/\` | Primitivos de baixo nível |
| Semantic/System | \`tokens/semantic/{light,dark}.json\` | Intenção de uso e tema |
| Component | \`tokens/component/\` | Contratos anatômicos dos componentes |

## Foundation

Arquivos canônicos em \`tokens/foundation/\`:

${foundationStats.map(f => `- \`${f.file}\``).join('\n')}

## Semantic

Categorias raiz em light.json:

\`\`\`
${semanticCategories.map(c => `semantic.${c}.*`).join('\n')}
\`\`\`

## Component

${componentTotal > 0
  ? `Arquivos canônicos em \`tokens/component/\`:

${componentStats.map(f => `- \`${f.file}\``).join('\n')}`
  : 'Nenhum token Component materializado ainda. ADR-019 reintroduz a camada; a migração deve ser incremental por componente.'}

## Regras invioláveis

1. Componentes migrados consomem Component tokens; componentes ainda não migrados podem consumir Semantic direto durante a transição
2. Component → Semantic; Semantic → Foundation; consumidor final nunca usa Foundation direto
3. Foundation é a camada de primitivos; valores específicos fora da escala exigem ADR explícita
4. Brand é Foundation, sem estados, ponto de troca por tema
5. Todo token tem \`$type\` conforme DTCG spec
6. Tokens não óbvios têm \`$description\`
7. Textos em componentes Figma usam text styles; não bind direto de typography vars
8. Tokens de valor zero não são vinculados via setBoundVariable() no Figma
9. Novas categorias ou quebras de hierarquia exigem ADR
10. light.json e dark.json têm exatamente o mesmo conjunto de chaves
11. Todo \`.default\` gera sufixo \`-default\` no CSS
12. Cores puras (#FFF/#000) não são tokens foundation (ADR-010)

## ADRs relacionados

${adrs.map(a => `- **ADR-${a.num}** — ${a.title} (${a.status})`).join('\n')}
`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'token-schema.md'), tokenSchema);
console.log(`✅ token-schema.md (Foundation: ${foundationTotal}, Semantic: ${semanticTotal}×2)`);

// ─── component-inventory.md ───────────────────────────────────────────────────

// `cssOnly: true` → componente é wrapper de markup HTML que não tem (e não
// precisa ter) equivalente Figma porque os componentes Figma equivalentes já
// carregam Label/Required/Helper/Error inline em cada variant. Ver ADR-017.
const knownComponents = [
  { name: 'Accordion',  css: 'accordion'  },
  { name: 'Button',      css: 'button'     },
  { name: 'Input Text',  css: 'input'      },
  { name: 'Textarea',    css: 'textarea'   },
  { name: 'Select',      css: 'select'     },
  { name: 'Combobox',    css: 'combobox'   },
  { name: 'Checkbox',    css: 'checkbox'   },
  { name: 'Radio',       css: 'radio'      },
  { name: 'Toggle',      css: 'toggle'     },
  { name: 'Badge',       css: 'badge'      },
  { name: 'Alert',       css: 'alert'      },
  { name: 'Card',        css: 'card'       },
  { name: 'Modal',       css: 'modal'      },
  { name: 'Tooltip',     css: 'tooltip'    },
  { name: 'Menu',        css: 'menu'       },
  { name: 'Tabs',        css: 'tabs'       },
  { name: 'Breadcrumb',  css: 'breadcrumb' },
  { name: 'Pagination',  css: 'pagination' },
  { name: 'Avatar',      css: 'avatar'     },
  { name: 'Divider',     css: 'divider'    },
  { name: 'Form Field',  css: 'form-field', cssOnly: true },
  { name: 'Spinner',     css: 'spinner'    },
  { name: 'Skeleton',    css: 'skeleton'   },
];

const rows = knownComponents.map(c => {
  const hasCss = cssComponents.includes(c.css);
  if (c.cssOnly) {
    return `| ${c.name} | ${hasCss ? '🟢' : '⬜'} | — (CSS-only, ADR-017) | — | ⬜ | 🟢 |`;
  }
  return `| ${c.name} | ${hasCss ? '🟢' : '⬜'} | 🟢 | 🟢 | ⬜ | 🟢 |`;
});

const inventory = `# Inventário de componentes — Design System Core

> Gerado automaticamente por \`scripts/sync-docs.mjs\` em ${today()}. Não editar manualmente.
> Para regenerar: \`npm run sync:docs\`
> Versão atual: **${version}**

## Status geral

| Componente | CSS | Figma (visual) | Figma (binding) | Stories | Docs site |
|------------|-----|-----------------|-----------------|---------|----------|
${rows.join('\n')}

**Legenda:** ⬜ Não iniciado | 🟡 Em progresso | 🟢 Completo | ⚠️ Verificar | 🔴 Precisa revisão | — Não aplicável

**Nota sobre binding:**
- Button: tokens Component para background, content, border, height, padding, radius, gap, focus ring e ícones
- Input Text / Select / Textarea: tokens Component compartilhados de Field/Form Field para label, required, helper, erro, superfície, borda, foco e estados
- Checkbox / Radio / Toggle: tokens Component para target/control/track/thumb/content, com Content frame vertical (Label + Description + Helper Text) e booleans show/hide
- **Form Field**: CSS-only (ADR-017). Não tem (e não deve ter) equivalente Figma — componentes Figma de form (Input, Select, Textarea, Checkbox, Radio, Toggle) já carregam Label + Required + Helper inline em cada variant. Form Field só existe no CSS porque HTML não tem elemento "form control" composto.
- Demais componentes: tokens Component quando a anatomia já foi materializada; tokens Semantic só quando o componente ainda não tem contrato anatômico próprio.

## Pipeline

| Etapa | Status |
|-------|--------|
| JSON (DTCG) canônico | 🟢 \`tokens/\` |
| Style Dictionary | 🟢 \`build-tokens.mjs\` |
| CSS gerado | ${generatedFiles.length > 0 ? '🟢 `css/tokens/generated/`' : '⚠️ generated/ vazio'} |
| Import pipeline | ${pipelineClean ? '🟢 index.css importa apenas generated/' : '⚠️ ainda importa legados'} |
| Figma binding | 🟢 componentes vivos vinculados |

## ADRs

| ADR | Título | Status |
|-----|--------|--------|
${adrs.map(a => `| ADR-${a.num} | ${a.title} | ${a.status} |`).join('\n')}

## Próximos milestones

1. **Auditoria contínua Figma ↔ repo** — manter snapshot, tokens, CSS e docs alinhados antes de cada release beta
2. **Documentação de ícones** — explicitar uso de Lucide, stroke, pesos e aplicação de tokens de cor/tamanho
3. **Componentes pendentes** — Dropdown, Combobox, Pagination, Table
4. **Storybook** — opcional, não bloqueante para o beta atual
`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'component-inventory.md'), inventory);
console.log(`✅ component-inventory.md (${knownComponents.length} componentes)`);

// ─── adr-index.md ─────────────────────────────────────────────────────────────

const adrIndex = `# Índice de ADRs — Design System Core

> Gerado automaticamente por \`scripts/sync-docs.mjs\` em ${today()}. Não editar manualmente.
> Para regenerar: \`npm run sync:docs\`

${adrs.length} decisões registradas.

| ADR | Título | Status | Data |
|-----|--------|--------|------|
${adrs.map(a => `| [ADR-${a.num}](decisions/${a.file}) | ${a.title} | ${a.status} | ${a.date} |`).join('\n')}
`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'adr-index.md'), adrIndex);
console.log(`✅ adr-index.md (${adrs.length} ADRs)`);

// ─── Geração de HTML a partir de MDs ─────────────────────────────────────────

function slugFromAdrFilename(filename) {
  // ADR-004-wcag.md → adr-004-wcag
  return filename.replace(/\.md$/, '').toLowerCase();
}

function wrapPage({ title, subtitle, content, base, skipSubtitle, layoutHref }) {
  const basePath = base || '../';
  // layoutHref é relativo ao arquivo gerado, não ao ROOT. Padrão: layout.css
  // no mesmo diretório (páginas em docs/). Para docs/decisions/, quem chama
  // passa explicitamente `layoutHref: '../layout.css'`.
  const layoutCss = layoutHref || 'layout.css';
  const subtitleHtml = skipSubtitle
    ? ''
    : `<p class="ds-section__subtitle">${subtitle}</p>`;
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Design System</title>
  <link rel="stylesheet" href="${basePath}css/design-system.css">
  <link rel="stylesheet" href="${layoutCss}">
  <style>
    .ds-md-content h1, .ds-md-content h2, .ds-md-content h3 { margin-top: var(--ds-dimension-32); margin-bottom: var(--ds-dimension-12); color: var(--ds-content-default); }
    .ds-md-content h1 { font-size: var(--ds-body-font-size-2xl); font-weight: var(--ds-body-font-weight-semibold); margin-top: 0; }
    .ds-md-content h2 { font-size: var(--ds-body-font-size-xl); font-weight: var(--ds-body-font-weight-semibold); border-top: var(--ds-border-width-1) solid var(--ds-border-subtle); padding-top: var(--ds-dimension-24); }
    .ds-md-content h3 { font-size: var(--ds-body-font-size-lg); font-weight: var(--ds-body-font-weight-semibold); }
    .ds-md-content p { color: var(--ds-content-default); line-height: var(--ds-body-line-height-md); margin: var(--ds-dimension-12) 0; }
    .ds-md-content ul, .ds-md-content ol { color: var(--ds-content-default); line-height: var(--ds-body-line-height-md); padding-left: var(--ds-dimension-24); margin: var(--ds-dimension-12) 0; }
    .ds-md-content li { margin: var(--ds-dimension-4) 0; }
    .ds-md-content code { font-family: var(--ds-font-family-mono); font-size: 0.9em; background: var(--ds-background-subtle); color: var(--ds-link-content-default); padding: 1px var(--ds-dimension-4); border-radius: var(--ds-radius-sm); }
    .ds-md-content pre { background: var(--ds-background-inverse); color: var(--ds-content-inverse); padding: var(--ds-dimension-16); border-radius: var(--ds-radius-md); overflow-x: auto; font-size: var(--ds-body-font-size-sm); margin: var(--ds-dimension-16) 0; }
    .ds-md-content pre code { background: none; color: inherit; padding: 0; }
    .ds-md-content table { width: 100%; border-collapse: collapse; margin: var(--ds-dimension-16) 0; font-size: var(--ds-body-font-size-sm); }
    .ds-md-content table th, .ds-md-content table td { text-align: left; padding: var(--ds-dimension-8) var(--ds-dimension-12); border-bottom: var(--ds-border-width-1) solid var(--ds-border-default); }
    .ds-md-content table th { font-weight: var(--ds-body-font-weight-semibold); background: var(--ds-background-subtle); }
    .ds-md-content a { color: var(--ds-link-content-default); }
    .ds-md-content a:hover { color: var(--ds-link-content-hover); }
    .ds-md-content blockquote { border-left: 3px solid var(--ds-border-default); margin: var(--ds-dimension-16) 0; padding: var(--ds-dimension-8) var(--ds-dimension-16); color: var(--ds-content-subtle); font-style: italic; }
    .ds-md-content hr { border: none; border-top: var(--ds-border-width-1) solid var(--ds-border-subtle); margin: var(--ds-dimension-32) 0; }
    .ds-md-content strong { color: var(--ds-content-default); }
    .ds-md-generated-banner { background: var(--ds-feedback-info-background-subtle); color: var(--ds-feedback-info-content-default); border: var(--ds-border-width-default) solid var(--ds-feedback-info-border-default); padding: var(--ds-dimension-12) var(--ds-dimension-20); border-radius: var(--ds-radius-md); margin-bottom: var(--ds-dimension-24); font-size: var(--ds-body-font-size-sm); }
    .ds-md-generated-banner code { background: var(--ds-surface-default); color: var(--ds-feedback-info-content-default); padding: 1px var(--ds-dimension-6); border-radius: var(--ds-radius-sm); font-family: var(--ds-font-family-mono); border: var(--ds-border-width-default) solid var(--ds-feedback-info-border-default); }
  </style>
  <script>
    (function(){var l=localStorage.getItem('ds-lang');if(l)document.documentElement.setAttribute('lang',l)})();
  </script>
</head>
<body>

<header class="ds-site-header">
  <div style="display:flex;align-items:center;gap:var(--ds-dimension-16)">
    <button class="ds-menu-toggle" id="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </button>
    <a href="${basePath}index.html" class="ds-site-header__brand">
      <div class="ds-site-header__logo">DS</div>
      <span class="ds-site-header__title">Design System</span>
    </a>
  </div>
  <div class="ds-site-header__actions">
    <select class="ds-theme-switcher__select" id="lang-switcher" aria-label="Language">
      <option value="pt">PT</option>
      <option value="en">EN</option>
    </select>
    <button class="ds-button ds-button--ghost ds-button--sm" id="mode-toggle" aria-pressed="false" aria-label="Toggle dark mode"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg> Dark</button>
  </div>
</header>
<div class="ds-sidebar-overlay" id="sidebar-overlay"></div>
<nav class="ds-sidebar" id="sidebar" aria-label="Main navigation"></nav>

<main class="ds-main">
  <div class="ds-section">
    <h1 class="ds-section__title">${title}</h1>
    ${subtitleHtml}
  </div>

  <div class="ds-md-generated-banner">
    Este arquivo é gerado automaticamente por <code>scripts/sync-docs.mjs</code>. Editar a fonte original, não este HTML.
  </div>

  <div class="ds-md-content">
${content}
  </div>
</main>

<script src="${basePath}js/main.js"></script>
</body>
</html>
`;
}

function renderMarkdownFile({ mdPath, outPath, title, subtitle, base, layoutHref }) {
  if (!fs.existsSync(mdPath)) return false;
  const md = fs.readFileSync(mdPath, 'utf8');
  // Se o MD começa com `# Título`, removemos pra não duplicar com o título do layout
  const withoutH1 = md.replace(/^#\s+.+\n+/, '');
  let content = marked.parse(withoutH1);
  // a11y: marked emite `<input disabled type="checkbox">` em task lists; sem
  // `<label>` associado quebra o axe rule `label`. Esses checkboxes são
  // decorativos (markdown task list, não form input) — marca como aria-hidden.
  content = content.replace(/<input\b([^>]*?)\btype="checkbox"([^>]*?)>/g, (m, pre, post) => {
    if (/aria-hidden=/.test(m)) return m;
    return `<input${pre}type="checkbox"${post} aria-hidden="true">`;
  });
  const html = wrapPage({ title, subtitle, content, base, layoutHref });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  return true;
}

// 1. ADRs — cada arquivo MD vira um HTML em docs/decisions/
let adrHtmlCount = 0;
for (const adr of adrs) {
  const mdPath = path.join(decisionsDir, adr.file);
  const slug = slugFromAdrFilename(adr.file);
  const outPath = path.join(decisionsDir, `${slug}.html`);
  const ok = renderMarkdownFile({
    mdPath,
    outPath,
    title: `ADR-${adr.num} — ${adr.title}`,
    subtitle: `Status: <strong>${adr.status}</strong> · Data: ${adr.date}`,
    base: '../../',
    layoutHref: '../layout.css',
  });
  if (ok) adrHtmlCount++;
}
console.log(`✅ ${adrHtmlCount} ADRs renderizados em HTML`);

// 2. Index dos ADRs em docs/decisions/index.html
const adrIndexContent = `
<p>${adrs.length} decisões registradas. HTMLs gerados automaticamente a partir dos <code>.md</code> correspondentes.</p>
<table>
<thead><tr><th>ADR</th><th>Título</th><th>Status</th><th>Data</th></tr></thead>
<tbody>
${adrs.map(a => {
  const slug = slugFromAdrFilename(a.file);
  return `<tr><td><a href="${slug}.html">ADR-${a.num}</a></td><td>${a.title}</td><td>${a.status}</td><td>${a.date}</td></tr>`;
}).join('\n')}
</tbody>
</table>
`;
fs.writeFileSync(
  path.join(decisionsDir, 'index.html'),
  wrapPage({ title: 'Decisões arquiteturais', subtitle: 'ADRs (Architecture Decision Records) do design system.', content: adrIndexContent, base: '../../', layoutHref: '../layout.css' })
);
console.log(`✅ docs/decisions/index.html`);

// 3. Páginas derivadas de MDs em docs/
const mdPages = [
  { src: 'CHANGELOG.md', out: 'docs/changelog.html', title: 'Changelog', subtitle: 'Histórico de versões do design system.' },
  { src: 'docs/brand-principles.md', out: 'docs/brand-principles.html', title: 'Princípios da marca', subtitle: 'Missão, princípios, tom de voz e identidade visual.' },
  { src: 'docs/backlog.md', out: 'docs/backlog.html', title: 'Backlog', subtitle: 'Itens fora do escopo imediato mas que devem ser implementados.' },
  { src: 'docs/documentation-guidelines.md', out: 'docs/documentation-guidelines.html', title: 'Documentation guidelines', subtitle: 'Templates editoriais para páginas de Foundation, Component, Process e System.' },
  { src: 'docs/process-contributing.md', out: 'docs/process-contributing.html', title: 'Como contribuir', subtitle: 'Setup local, fluxo de PR, convenções de commit.' },
  { src: 'docs/process-versioning.md', out: 'docs/process-versioning.html', title: 'Versionamento', subtitle: 'Regras de bump de versão no design system.' },
  { src: 'docs/process-releasing.md', out: 'docs/process-releasing.html', title: 'Releases', subtitle: 'Passo a passo de uma release.' },
];
let mdPageCount = 0;
for (const p of mdPages) {
  const mdPath = path.join(ROOT, p.src);
  const outPath = path.join(ROOT, p.out);
  const ok = renderMarkdownFile({ mdPath, outPath, title: p.title, subtitle: p.subtitle, base: '../', layoutHref: 'layout.css' });
  if (ok) mdPageCount++;
}
console.log(`✅ ${mdPageCount} páginas MD → HTML em docs/`);

// 4. Auto-gera foundations-theme-colors.html a partir do JSON semantic
//
// Lê tokens/semantic/{light,dark}.json + tokens/foundation/{colors,brand}.json,
// resolve aliases recursivamente e gera tabelas por seção. Só substitui o
// conteúdo entre <!-- AUTO-GENERATED:THEME-COLORS:START --> e :END,
// preservando header/nav/footer editáveis à mão.

// Paths atualizados pra ADR-014/019 (action tokens role/style + Component contracts):
// - primary.* eliminado → brand.* / toned.*
// - accent.* eliminado (não havia no MVP)
// - content.link.* → link.content-* (peer pattern)
// - feedback.{role}.background → feedback.{role}.bg-default (compound)
// - state.* eliminado → overlay.* (já listado abaixo)
// - border.control.* → border.control-* (flat)
const THEME_COLOR_SECTIONS = [
  { id: 'background', pt: 'Background', en: 'Background', tokens: [
    'semantic.background.default',
    'semantic.background.subtle',
    'semantic.background.disabled',
    'semantic.background.inverse',
    'semantic.background.overlay',
  ]},
  { id: 'surface', pt: 'Surface', en: 'Surface', tokens: [
    'semantic.surface.default',
    'semantic.surface.raised',
    'semantic.surface.overlay',
    'semantic.surface.elevated',
  ]},
  { id: 'brand', pt: 'Brand', en: 'Brand', tokens: [
    'semantic.brand.background.default',
    'semantic.brand.background.hover',
    'semantic.brand.background.active',
    'semantic.brand.background.disabled',
    'semantic.brand.content-default',
    'semantic.brand.content-hover',
    'semantic.brand.content-disabled',
  ]},
  { id: 'toned', pt: 'Toned', en: 'Toned', tokens: [
    'semantic.toned.background.default',
    'semantic.toned.background.hover',
    'semantic.toned.background.active',
    'semantic.toned.content-default',
    'semantic.toned.content-disabled',
  ]},
  { id: 'outline', pt: 'Outline', en: 'Outline', tokens: [
    'semantic.outline.background.hover',
    'semantic.outline.background.active',
    'semantic.outline.border-default',
    'semantic.outline.border-hover',
    'semantic.outline.border-disabled',
    'semantic.outline.content-default',
    'semantic.outline.content-disabled',
  ]},
  { id: 'ghost', pt: 'Ghost', en: 'Ghost', tokens: [
    'semantic.ghost.background.hover',
    'semantic.ghost.background.active',
    'semantic.ghost.content-default',
    'semantic.ghost.content-disabled',
  ]},
  { id: 'content', pt: 'Text / Foreground', en: 'Text / Foreground', tokens: [
    'semantic.content.strong',
    'semantic.content.default',
    'semantic.content.subtle',
    'semantic.content.disabled',
    'semantic.content.inverse',
    'semantic.link.content-default',
    'semantic.link.content-hover',
  ]},
  { id: 'border', pt: 'Border', en: 'Border', tokens: [
    'semantic.border.default',
    'semantic.border.strong',
    'semantic.border.subtle',
    'semantic.border.focus',
    'semantic.border.focus-error',
    'semantic.border.brand',
    'semantic.border.error',
    'semantic.border.control-default',
    'semantic.border.control-hover',
    'semantic.border.control-disabled',
  ]},
  { id: 'feedback-success', pt: 'Feedback — Success', en: 'Feedback -- Success', tokens: [
    'semantic.feedback.success.background.default',
    'semantic.feedback.success.background.subtle',
    'semantic.feedback.success.background.hover',
    'semantic.feedback.success.background.active',
    'semantic.feedback.success.background.disabled',
    'semantic.feedback.success.border-default',
    'semantic.feedback.success.content-default',
    'semantic.feedback.success.content-contrast',
    'semantic.feedback.success.content-disabled',
  ]},
  { id: 'feedback-warning', pt: 'Feedback — Warning', en: 'Feedback -- Warning', tokens: [
    'semantic.feedback.warning.background.default',
    'semantic.feedback.warning.background.subtle',
    'semantic.feedback.warning.background.hover',
    'semantic.feedback.warning.border-default',
    'semantic.feedback.warning.content-default',
    'semantic.feedback.warning.content-contrast',
  ]},
  { id: 'feedback-error', pt: 'Feedback — Error', en: 'Feedback -- Error', tokens: [
    'semantic.feedback.error.background.default',
    'semantic.feedback.error.background.subtle',
    'semantic.feedback.error.background.hover',
    'semantic.feedback.error.background.active',
    'semantic.feedback.error.background.disabled',
    'semantic.feedback.error.border-default',
    'semantic.feedback.error.content-default',
    'semantic.feedback.error.content-contrast',
    'semantic.feedback.error.content-disabled',
  ]},
  { id: 'feedback-info', pt: 'Feedback — Info', en: 'Feedback -- Info', tokens: [
    'semantic.feedback.info.background.default',
    'semantic.feedback.info.background.subtle',
    'semantic.feedback.info.background.hover',
    'semantic.feedback.info.border-default',
    'semantic.feedback.info.content-default',
    'semantic.feedback.info.content-contrast',
  ]},
  { id: 'overlay', pt: 'Overlay & Focus', en: 'Overlay & Focus', tokens: [
    'semantic.overlay.subtle',
    'semantic.overlay.default',
    'semantic.overlay.medium',
    'semantic.overlay.strong',
    'semantic.border.focus',
  ]},
];

// Flatten DTCG JSON: { foundation: { color: { neutral: { 50: {$value,...} } } } }
// → { "foundation.color.neutral.50": {$value, $type, $description} }
function flattenTokens(obj, prefix = '', acc = {}) {
  if (!obj || typeof obj !== 'object') return acc;
  if ('$value' in obj) acc[prefix] = obj;
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue;
    flattenTokens(v, prefix ? `${prefix}.${k}` : k, acc);
  }
  return acc;
}

// Segue referência `{x.y.z}` um passo de cada vez, mas para cedo nos tokens
// "semanticamente significativos" — bate com o alias que o Style Dictionary
// emite no CSS. Regras:
//   - `foundation.color.*` e outros primitivos: resolve até o valor literal.
//   - `foundation.brand.*`: para aqui (brand-primary/secondary são o switch
//     de tema — não resolver pra blue-600 direto).
//   - `semantic.*`: para quando chegar num semantic diferente do entry point
//     (ex: content.link.default aponta pra brand.default → para em brand.default).
// Retorna { finalPath, finalValue } onde finalPath é onde a cadeia parou e
// finalValue é o valor literal se chegou num primitivo, ou null.
function resolveAlias(startPath, tokenMap, depth = 0) {
  if (depth > 10) return { finalPath: startPath, finalValue: null };
  // Regra de parada: se já saí do entry point e cheguei num token Semantic,
  // para aqui. Isso casa com o que o CSS gerado emite (semantic vira var
  // direto). foundation.brand.* foi eliminado em 0.7.0.
  if (depth > 0 && startPath.startsWith('semantic.')) {
    return { finalPath: startPath, finalValue: null };
  }
  const entry = tokenMap[startPath];
  if (!entry) return { finalPath: startPath, finalValue: null };
  const v = entry.$value;
  if (typeof v === 'string' && /^\{[^}]+\}$/.test(v)) {
    return resolveAlias(v.slice(1, -1), tokenMap, depth + 1);
  }
  return { finalPath: startPath, finalValue: v };
}

// Converte path DTCG → nome curto exibido na doc (igual ao sufixo da CSS var
// correspondente, quando existe). Cobre:
//   foundation.color.neutral.50       → neutral-50
//   foundation.color.overlay.black.5  → overlay-black-5
//   foundation.color.disabled.brand-light → disabled-brand-light
//   foundation.brand.primary          → brand-primary
//   foundation.brand.secondary        → brand-secondary
//   semantic.brand.default            → brand-default
//   semantic.feedback.error.default   → feedback-error-default
function resolvedShortName(path) {
  if (path.startsWith('foundation.color.')) {
    return path.replace(/^foundation\.color\./, '').replace(/\./g, '-');
  }
  if (path.startsWith('foundation.brand.')) {
    return path.replace(/^foundation\./, '').replace(/\./g, '-');
  }
  if (path.startsWith('semantic.')) {
    return path.replace(/^semantic\./, '').replace(/\./g, '-');
  }
  // foundation.typography.*, foundation.dimension.*, etc — retorna path sem o prefixo
  return path.replace(/^foundation\./, '').replace(/\./g, '-');
}

// Formata valor literal pro display: rgba com alpha → formato curto.
function formatLiteral(v) {
  if (typeof v !== 'string') return String(v);
  return v.replace(/\s+/g, '');
}

// semantic.brand.default → --ds-brand-default (remove camada "semantic" e
// converte . em -). Isso casa com o naming gerado por build-tokens.mjs via
// o transform name/strip-layer.
function semanticToCssVar(path) {
  return '--ds-' + path.replace(/^semantic\./, '').replace(/\./g, '-');
}

function buildThemeColorsTables() {
  const foundationDir = path.join(ROOT, 'tokens', 'foundation');
  const semanticDir = path.join(ROOT, 'tokens', 'semantic');

  // Merge todos os foundation files em um só map
  const foundationMap = {};
  for (const f of fs.readdirSync(foundationDir).filter(x => x.endsWith('.json'))) {
    const json = readJson(path.join(foundationDir, f));
    Object.assign(foundationMap, flattenTokens(json));
  }
  const lightMap = flattenTokens(readJson(path.join(semanticDir, 'light.json')));
  const darkMap = flattenTokens(readJson(path.join(semanticDir, 'dark.json')));

  // Para resolver aliases no semantic, precisa de um map unificado que
  // conhece tanto semantic quanto foundation (aliases semantic→semantic
  // existem, ex: content.link.default → semantic.brand.default).
  const lightAll = { ...foundationMap, ...lightMap };
  const darkAll = { ...foundationMap, ...darkMap };

  const unresolvedTokens = [];
  const sectionsHtml = [];

  for (const section of THEME_COLOR_SECTIONS) {
    const rows = [];
    for (const tokenPath of section.tokens) {
      if (!lightMap[tokenPath] && !darkMap[tokenPath]) {
        unresolvedTokens.push(tokenPath);
        continue; // token não existe — pula
      }
      const { finalPath: lightFinal, finalValue: lightLiteral } = resolveAlias(tokenPath, lightAll);
      const { finalPath: darkFinal, finalValue: darkLiteral } = resolveAlias(tokenPath, darkAll);

      const lightDisplay = lightFinal.startsWith('foundation.') || lightFinal.startsWith('semantic.')
        ? resolvedShortName(lightFinal)
        : formatLiteral(lightLiteral);
      const darkDisplay = darkFinal.startsWith('foundation.') || darkFinal.startsWith('semantic.')
        ? resolvedShortName(darkFinal)
        : formatLiteral(darkLiteral);

      const cssVar = semanticToCssVar(tokenPath);
      rows.push(`        <tr><td><span class="ds-token-swatch" style="background-color:var(${cssVar})"></span></td><td><code>${cssVar}</code></td><td><code>${lightDisplay}</code></td><td><code>${darkDisplay}</code></td></tr>`);
    }
    if (rows.length === 0) continue;
    sectionsHtml.push(
`  <div class="ds-subsection">
    <h2 class="ds-subsection__title"><span data-lang="pt">${section.pt}</span><span data-lang="en">${section.en}</span></h2>
    <table class="ds-token-table">
      <thead><tr><th><span data-lang="pt">Amostra</span><span data-lang="en">Swatch</span></th><th>Token</th><th>Light</th><th>Dark</th></tr></thead>
      <tbody>
${rows.join('\n')}
      </tbody>
    </table>
  </div>`
    );
  }

  return { html: sectionsHtml.join('\n\n'), unresolvedTokens };
}

const themeColorsHtmlPath = path.join(ROOT, 'docs', 'foundations-theme-colors.html');
if (fs.existsSync(themeColorsHtmlPath)) {
  const orig = fs.readFileSync(themeColorsHtmlPath, 'utf8');
  const markerStart = '<!-- AUTO-GENERATED:THEME-COLORS:START';
  const markerEnd = '<!-- AUTO-GENERATED:THEME-COLORS:END -->';
  const sIdx = orig.indexOf(markerStart);
  const eIdx = orig.indexOf(markerEnd);
  if (sIdx === -1 || eIdx === -1) {
    console.warn('⚠️ foundations-theme-colors.html: marcadores AUTO-GENERATED:THEME-COLORS não encontrados. Pulando.');
  } else {
    const sLineEnd = orig.indexOf('\n', sIdx) + 1;
    const before = orig.slice(0, sLineEnd);
    const after = orig.slice(eIdx);
    const { html: generated, unresolvedTokens } = buildThemeColorsTables();
    const next = before + generated + '\n  ' + after;
    if (next !== orig) {
      fs.writeFileSync(themeColorsHtmlPath, next);
      console.log(`✅ foundations-theme-colors.html regenerado (${THEME_COLOR_SECTIONS.length} seções)`);
    } else {
      console.log(`✅ foundations-theme-colors.html (já em dia)`);
    }
    if (unresolvedTokens.length > 0) {
      console.warn(`⚠️ ${unresolvedTokens.length} token(s) listados mas não encontrados no JSON:`);
      for (const t of unresolvedTokens) console.warn(`     ${t}`);
    }
  }
}

// 5. Injeta badge de versão em index.html (placeholder <!-- VERSION -->).
// Regex captura o comentário + o texto "vX.Y.Z" opcional imediatamente
// depois, pra substituir tudo de uma vez — sem isso, rodar sync:docs
// mais de uma vez duplica o número de versão.
const indexPath = path.join(ROOT, 'index.html');
if (fs.existsSync(indexPath)) {
  let indexHtml = fs.readFileSync(indexPath, 'utf8');
  const updated = indexHtml.replace(
    /<!--\s*VERSION(?::.*?)?\s*-->(?:v\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?)*/gi,
    `<!-- VERSION:${version} -->v${version}`
  );
  if (updated !== indexHtml) {
    fs.writeFileSync(indexPath, updated);
    console.log(`✅ badge de versão v${version} atualizada em index.html`);
  }
}

console.log(`\n📁 Gerado em docs/ — versão ${version}`);
