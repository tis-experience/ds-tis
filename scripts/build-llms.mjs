#!/usr/bin/env node
/**
 * build-llms.mjs — gera docs/llms.txt e docs/llms-full.txt
 *
 * Segue o padrão de llmstxt.org:
 *
 *   docs/llms.txt       — índice estruturado (título, descrição, seções com
 *                         links), leve, legível por humanos e LLMs.
 *   docs/llms-full.txt  — todo o conteúdo textual do DS concatenado em
 *                         markdown puro. Pesado mas completo — permite que
 *                         um LLM consuma o DS inteiro em uma requisição.
 *
 * Conteúdo agregado no llms-full.txt:
 *   - README.md, CONTRIBUTING.md, CLAUDE.md na raiz
 *   - CHANGELOG.md na raiz
 *   - docs/*.md (princípios, schemas, inventários, brand, backlog, process-*)
 *   - docs/decisions/ADR-*.md (todos os ADRs)
 *   - tokens/*.json resumidos (contagens e referência, não valores completos —
 *     a API JSON cobre isso)
 *
 * Páginas HTML-only (componentes, foundations) são referenciadas pela URL
 * no llms.txt mas não têm conteúdo copiado no llms-full.txt (evita dep de
 * turndown; o LLM pode fazer fetch se precisar).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT, "docs");

const DOCS_BASE_URL = (process.env.DS_DOCS_BASE_URL || "").replace(/\/$/, "");

function docUrl(pathname) {
  const normalized = pathname.replace(/^\/+/, "");
  return DOCS_BASE_URL ? `${DOCS_BASE_URL}/${normalized}` : normalized;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function readMd(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

const pkg = readJson(path.join(ROOT, "package.json"));

// -----------------------------------------------------------------------------
// llms.txt — índice
// -----------------------------------------------------------------------------

const decisionsDir = path.join(DOCS_DIR, "decisions");
const adrFiles = fs.existsSync(decisionsDir)
  ? fs.readdirSync(decisionsDir).filter((f) => /^ADR-\d+/i.test(f) && f.endsWith(".md")).sort()
  : [];
const adrs = adrFiles.map((f) => {
  const content = fs.readFileSync(path.join(decisionsDir, f), "utf8");
  const numMatch = f.match(/ADR-(\d+)/i);
  const titleMatch = content.match(/^#\s+ADR-\d+[:\s]+(.+)$/m);
  const statusMatch = content.match(/\*\*Status:\*\*\s*(.+)/);
  return {
    num: numMatch ? numMatch[1] : "?",
    title: titleMatch ? titleMatch[1].trim() : f,
    status: statusMatch ? statusMatch[1].trim() : "",
    slug: f.replace(/\.md$/, "").toLowerCase(),
    file: f,
  };
});

const COMPONENTS = [
  "button", "input", "textarea", "select", "checkbox", "radio", "toggle",
  "badge", "alert", "card", "modal", "tooltip", "tabs", "breadcrumb",
  "avatar", "divider", "form-field", "spinner", "skeleton",
];

const FOUNDATIONS = [
  { slug: "colors", name: "Colors" },
  { slug: "theme-colors", name: "Theme Colors" },
  { slug: "typography", name: "Typography" },
  { slug: "spacing", name: "Spacing" },
  { slug: "radius", name: "Radius" },
  { slug: "elevation", name: "Elevation" },
  { slug: "borders", name: "Borders" },
  { slug: "motion", name: "Motion" },
  { slug: "opacity", name: "Opacity" },
  { slug: "zindex", name: "Z-index" },
];

const llmsTxt = `# Design System Core

> Design system white-label em CSS puro com tokens DTCG em JSON, componentes documentados, modos light/dark e paleta brand única customizável. Versão atual: ${pkg.version}.

Repositório: definir no ambiente de destino.
Site: ${DOCS_BASE_URL || "documentação local"}
Arquivo completo para LLMs: ${docUrl("docs/llms-full.txt")}

## Visão geral

- [Home](${docUrl("index.html")}): visão rápida, quick start e dark mode.
- [README](README.md): instalação e navegação.
- [Token Architecture](${docUrl("docs/token-architecture.html")}): arquitetura 3-layer (Foundation/Core → Semantic/System → Component).
- [Theming](${docUrl("docs/theming.html")}): como customizar brand e alternar modo.
- [Accessibility](${docUrl("docs/accessibility.html")}): WCAG 2.2 AA aplicada.
- [Design Principles](${docUrl("docs/design-principles.html")}): princípios do sistema.
- [Agent Consumer Usage](${docUrl("docs/agent-consumer-usage.html")}): como agents implementam telas em projetos consumidores usando o DS TIS.

## Foundations

${FOUNDATIONS.map((f) => `- [${f.name}](${docUrl(`docs/foundations-${f.slug}.html`)})`).join("\n")}

## Components

${COMPONENTS.map((c) => `- [${c.charAt(0).toUpperCase() + c.slice(1)}](${docUrl(`docs/${c}.html`)})`).join("\n")}

## Decisões arquiteturais (ADRs)

${adrs.map((a) => `- [ADR-${a.num} — ${a.title}](${docUrl(`docs/decisions/${a.slug}.html`)}) — ${a.status}`).join("\n")}

## Processo

- [Contributing](${docUrl("docs/process-contributing.html")}): setup, fluxo de PR, convenções.
- [Versionamento](${docUrl("docs/process-versioning.html")}): releases 1.0.0-beta.N com cadência semanal durante beta.
- [Releases](${docUrl("docs/process-releasing.html")}): passo a passo.
- [Changelog](${docUrl("docs/changelog.html")}): histórico de versões.
- [Backlog](${docUrl("docs/backlog.html")}): itens fora do escopo imediato.

## Marca

- [Brand Principles](${docUrl("docs/brand-principles.html")}): missão, princípios, tom de voz, identidade.

## APIs JSON (consumo programático)

- [components.json](${docUrl("docs/api/components.json")}): catálogo de componentes com variantes e tokens consumidos.
- [tokens.json](${docUrl("docs/api/tokens.json")}): camadas Foundation, Semantic (light/dark) e Component.
- [adrs.json](${docUrl("docs/api/adrs.json")}): índice estruturado das decisões.
- [foundations.json](${docUrl("docs/api/foundations.json")}): catálogo das foundations.
- [tokens-sync.json](${docUrl("docs/api/tokens-sync.json")}): estado de coerência Figma ↔ JSON ↔ CSS.

## Figma

- Arquivo: \`IE68amP9Hya5ieFw1rX8S8\` (TIS, acesso via convite).

---

Gerado por \`scripts/build-llms.mjs\`. Versão atual: ${pkg.version}.
`;

fs.writeFileSync(path.join(DOCS_DIR, "llms.txt"), llmsTxt);
console.log(`✅ docs/llms.txt (${llmsTxt.length} bytes)`);

// -----------------------------------------------------------------------------
// llms-full.txt — conteúdo consolidado
// -----------------------------------------------------------------------------

const sections = [];

function addSection(title, content) {
  if (!content) return;
  sections.push(`\n\n═══════════════════════════════════════════════════════════\n# ${title}\n═══════════════════════════════════════════════════════════\n\n${content.trim()}\n`);
}

// Raiz
addSection("README.md (raiz)", readMd(path.join(ROOT, "README.md")));
addSection("CONTRIBUTING.md (raiz)", readMd(path.join(ROOT, "CONTRIBUTING.md")));
addSection("CHANGELOG.md (raiz)", readMd(path.join(ROOT, "CHANGELOG.md")));

// docs/*.md (exceto decisions e subpastas)
const docsMds = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md")).sort();
for (const f of docsMds) {
  addSection(`docs/${f}`, readMd(path.join(DOCS_DIR, f)));
}

// docs/decisions/ADR-*.md
addSection("Decisões arquiteturais (ADRs)", "Registros de decisão. Cada ADR descreve contexto, decisão, consequências e alternativas consideradas.");
for (const adr of adrs) {
  addSection(`ADR-${adr.num} — ${adr.title}`, readMd(path.join(decisionsDir, adr.file)));
}

// Resumo de tokens
const tokensMd = `
Total por camada (ver docs/api/tokens.json para valores completos).
Arquitetura **3-layer** desde ADR-019: Foundation/Core -> Semantic/System -> Component.

- Foundation: ver \`tokens/foundation/\`
- Semantic (light): ver \`tokens/semantic/light.json\`
- Semantic (dark): ver \`tokens/semantic/dark.json\`
- Component: ver \`tokens/component/\` quando a migracao incremental materializar tokens de componente

Formato canônico: DTCG (Design Token Community Group).
Transformação: \`build-tokens.mjs\` usa Style Dictionary pra gerar \`css/tokens/generated/*.css\`.
Consumo no código: \`var(--ds-...)\` em \`css/components/*.css\`.
Verificação automática de coerência Figma ↔ JSON ↔ CSS: \`scripts/tokens-verify.mjs\`.
`;
addSection("Tokens", tokensMd);

// Rodapé
sections.push(`\n\n═══════════════════════════════════════════════════════════\n\nGerado por scripts/build-llms.mjs.\nVersão: ${pkg.version}\nSite: ${DOCS_BASE_URL || "documentação local"}\n`);

const llmsFull = `# Design System Core — conteúdo consolidado

> Versão ${pkg.version}. Arquivo destinado a consumo por LLMs que precisem
> do design system inteiro em uma requisição. Inclui README, CONTRIBUTING,
> CLAUDE.md, CHANGELOG, todos os MDs em docs/, todos os ADRs e um resumo
> dos tokens. Páginas HTML-only (componentes, foundations) estão referenciadas
> por URL no cabeçalho e no llms.txt — o conteúdo visual delas não é
> transcrito aqui, pois a fonte canônica textual são os arquivos markdown.

Para o índice estruturado, ver ${docUrl("docs/llms.txt")}
Para APIs JSON, ver ${docUrl("docs/api/")}
${sections.join("")}`;

fs.writeFileSync(path.join(DOCS_DIR, "llms-full.txt"), llmsFull);
console.log(`✅ docs/llms-full.txt (${Math.round(llmsFull.length / 1024)} KB)`);

console.log(`\n📁 Gerados em docs/ — versão ${pkg.version}`);
