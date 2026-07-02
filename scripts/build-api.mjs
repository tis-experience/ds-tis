#!/usr/bin/env node
/**
 * build-api.mjs — gera APIs JSON estáticas em docs/api/ a partir das
 * fontes canônicas do repo.
 *
 * Saídas:
 *   docs/api/components.json
 *   docs/api/tokens.json
 *   docs/api/adrs.json
 *   docs/api/foundations.json
 *
 * Consumidas por ferramentas externas que queiram navegar o DS
 * programaticamente, sem precisar parsear HTML.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const API_DIR = path.join(ROOT, "docs", "api");

const DOCS_BASE_URL = (process.env.DS_DOCS_BASE_URL || "").replace(/\/$/, "");
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || "IE68amP9Hya5ieFw1rX8S8";

function docUrl(pathname) {
  const normalized = pathname.replace(/^\/+/, "");
  return DOCS_BASE_URL ? `${DOCS_BASE_URL}/${normalized}` : normalized;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}

const pkg = readJson(path.join(ROOT, "package.json"));

// -----------------------------------------------------------------------------
// components.json
// -----------------------------------------------------------------------------

// Component layer reintroduzida por ADR-019 como contrato anatômico.
// Nem todos os componentes foram migrados ainda; consumers podem consultar
// `tokens` extraidos do CSS e `componentTokenFile` quando existir.
const COMPONENTS = [
  { name: "Accordion", slug: "accordion", css: "accordion.css", html: "accordion.html", figmaPage: "Accordion" },
  { name: "Button", slug: "button", css: "button.css", html: "button.html" },
  { name: "Input Text", slug: "input", css: "input.css", html: "input.html" },
  { name: "Textarea", slug: "textarea", css: "textarea.css", html: "textarea.html" },
  { name: "Select", slug: "select", css: "select.css", html: "select.html" },
  { name: "Combobox", slug: "combobox", css: "combobox.css", html: "combobox.html", figmaPage: "Combobox" },
  { name: "Checkbox", slug: "checkbox", css: "checkbox.css", html: "checkbox.html" },
  { name: "Radio", slug: "radio", css: "radio.css", html: "radio.html" },
  { name: "Toggle", slug: "toggle", css: "toggle.css", html: "toggle.html" },
  { name: "Badge", slug: "badge", css: "badge.css", html: "badge.html" },
  { name: "Alert", slug: "alert", css: "alert.css", html: "alert.html" },
  { name: "Card", slug: "card", css: "card.css", html: "card.html" },
  { name: "Modal", slug: "modal", css: "modal.css", html: "modal.html" },
  { name: "Tooltip", slug: "tooltip", css: "tooltip.css", html: "tooltip.html" },
  { name: "Menu", slug: "menu", css: "menu.css", html: "menu.html" },
  { name: "Tabs", slug: "tabs", css: "tabs.css", html: "tabs.html" },
  { name: "Breadcrumb", slug: "breadcrumb", css: "breadcrumb.css", html: "breadcrumb.html" },
  { name: "Pagination", slug: "pagination", css: "pagination.css", html: "pagination.html", figmaPage: "Pagination" },
  { name: "Avatar", slug: "avatar", css: "avatar.css", html: "avatar.html" },
  { name: "Divider", slug: "divider", css: "divider.css", html: "divider.html" },
  { name: "Form Field", slug: "form-field", css: "form-field.css", html: "form-field.html", cssClass: "ds-field", cssOnly: true },
  { name: "Spinner", slug: "spinner", css: "spinner.css", html: "spinner.html" },
  { name: "Skeleton", slug: "skeleton", css: "skeleton.css", html: "skeleton.html" },
];

function extractTokensFromCss(cssPath) {
  if (!fs.existsSync(cssPath)) return [];
  const content = fs.readFileSync(cssPath, "utf8");
  const tokens = new Set();
  const re = /var\(--(ds-[a-z0-9-]+)\)/gi;
  let m;
  while ((m = re.exec(content)) !== null) tokens.add(m[1]);
  return [...tokens].sort();
}

function extractVariantsFromCss(cssPath) {
  if (!fs.existsSync(cssPath)) return [];
  const content = fs.readFileSync(cssPath, "utf8");
  const variants = new Set();
  const re = /\.ds-[a-z-]+--([a-z0-9-]+)/gi;
  let m;
  while ((m = re.exec(content)) !== null) variants.add(m[1]);
  return [...variants].sort();
}

const components = COMPONENTS.map((c) => {
  const cssPath = path.join(ROOT, "css", "components", c.css);
  return {
    name: c.name,
    slug: c.slug,
    url: docUrl(`docs/${c.html}`),
    cssClass: c.cssClass || `ds-${c.slug === "input" ? "input" : c.slug}`,
    cssFile: `css/components/${c.css}`,
    tokens: extractTokensFromCss(cssPath),
    variants: extractVariantsFromCss(cssPath),
    figma: {
      fileKey: FIGMA_FILE_KEY,
      page: c.name,
    },
  };
});

writeJson(path.join(API_DIR, "components.json"), {
  version: pkg.version,
  count: components.length,
  components,
});
console.log(`✅ docs/api/components.json (${components.length} componentes)`);

// -----------------------------------------------------------------------------
// tokens.json
// -----------------------------------------------------------------------------

function flattenTokens(obj, prefix = "", acc = {}) {
  if (obj && typeof obj === "object" && "$value" in obj) {
    acc[prefix] = { value: obj.$value, type: obj.$type, description: obj.$description };
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith("$")) continue;
      flattenTokens(v, prefix ? `${prefix}.${k}` : k, acc);
    }
  }
  return acc;
}

const tokensRoot = path.join(ROOT, "tokens");
const foundationTokens = {};
const semanticLight = {};
const semanticDark = {};
const componentTokens = {};

for (const f of fs.readdirSync(path.join(tokensRoot, "foundation")).filter((x) => x.endsWith(".json"))) {
  const data = readJson(path.join(tokensRoot, "foundation", f));
  Object.assign(foundationTokens, flattenTokens(data));
}
Object.assign(semanticLight, flattenTokens(readJson(path.join(tokensRoot, "semantic", "light.json"))));
Object.assign(semanticDark, flattenTokens(readJson(path.join(tokensRoot, "semantic", "dark.json"))));
const componentDir = path.join(tokensRoot, "component");
if (fs.existsSync(componentDir)) {
  for (const f of fs.readdirSync(componentDir).filter((x) => x.endsWith(".json"))) {
    Object.assign(componentTokens, flattenTokens(readJson(path.join(componentDir, f))));
  }
}

writeJson(path.join(API_DIR, "tokens.json"), {
  version: pkg.version,
  counts: {
    foundation: Object.keys(foundationTokens).length,
    semanticLight: Object.keys(semanticLight).length,
    semanticDark: Object.keys(semanticDark).length,
    component: Object.keys(componentTokens).length,
  },
  foundation: foundationTokens,
  semantic: { light: semanticLight, dark: semanticDark },
  component: componentTokens,
});
console.log(`✅ docs/api/tokens.json (${Object.keys(foundationTokens).length + Object.keys(semanticLight).length * 2 + Object.keys(componentTokens).length} tokens)`);

// -----------------------------------------------------------------------------
// adrs.json
// -----------------------------------------------------------------------------

const decisionsDir = path.join(ROOT, "docs", "decisions");
const adrFiles = fs
  .readdirSync(decisionsDir)
  .filter((f) => /^ADR-\d+/i.test(f) && f.endsWith(".md"))
  .sort();

const adrs = adrFiles.map((f) => {
  const content = fs.readFileSync(path.join(decisionsDir, f), "utf8");
  const numMatch = f.match(/ADR-(\d+)/i);
  const titleMatch = content.match(/^#\s+ADR-\d+[:\s]+(.+)$/m);
  const statusMatch = content.match(/\*\*Status:\*\*\s*(.+)/);
  const dateMatch = content.match(/\*\*Data:\*\*\s*(.+)/) || content.match(/\*\*Date:\*\*\s*(.+)/);
  const slug = f.replace(/\.md$/, "").toLowerCase();
  return {
    id: `ADR-${numMatch[1]}`,
    num: parseInt(numMatch[1], 10),
    title: titleMatch ? titleMatch[1].trim() : f,
    status: statusMatch ? statusMatch[1].trim() : "desconhecido",
    date: dateMatch ? dateMatch[1].trim() : "—",
    sourceFile: `docs/decisions/${f}`,
    url: docUrl(`docs/decisions/${slug}.html`),
  };
});

writeJson(path.join(API_DIR, "adrs.json"), {
  version: pkg.version,
  count: adrs.length,
  adrs,
});
console.log(`✅ docs/api/adrs.json (${adrs.length} ADRs)`);

// -----------------------------------------------------------------------------
// foundations.json
// -----------------------------------------------------------------------------

const FOUNDATIONS_META = [
  { slug: "colors", name: "Colors", file: "colors.json", url: "foundations-colors.html" },
  { slug: "theme-colors", name: "Theme Colors", file: null, url: "foundations-theme-colors.html", note: "Derived from semantic layer" },
  { slug: "typography", name: "Typography", file: "typography.json", url: "foundations-typography.html" },
  { slug: "dimension", name: "Dimension", file: "dimension.json", url: "foundations-spacing.html" },
  { slug: "radius", name: "Radius", file: "radius.json", url: "foundations-radius.html" },
  { slug: "elevation", name: "Elevation", file: "shadows.json", url: "foundations-elevation.html" },
  { slug: "borders", name: "Borders", file: "stroke.json", url: "foundations-borders.html" },
  { slug: "motion", name: "Motion", file: "motion.json", url: "foundations-motion.html" },
  { slug: "opacity", name: "Opacity", file: "opacity.json", url: "foundations-opacity.html" },
  { slug: "z-index", name: "Z-index", file: "z-index.json", url: "foundations-zindex.html" },
  { slug: "brand", name: "Brand", file: "brand.json", url: null },
];

const foundations = FOUNDATIONS_META.map((f) => {
  const filePath = f.file ? path.join(tokensRoot, "foundation", f.file) : null;
  const tokenCount = filePath && fs.existsSync(filePath) ? Object.keys(flattenTokens(readJson(filePath))).length : 0;
  return {
    slug: f.slug,
    name: f.name,
    sourceFile: f.file ? `tokens/foundation/${f.file}` : null,
    tokenCount,
    url: f.url ? docUrl(`docs/${f.url}`) : null,
    note: f.note || null,
  };
});

writeJson(path.join(API_DIR, "foundations.json"), {
  version: pkg.version,
  count: foundations.length,
  foundations,
});
console.log(`✅ docs/api/foundations.json (${foundations.length} foundations)`);

console.log(`\n📁 APIs JSON geradas em docs/api/`);
