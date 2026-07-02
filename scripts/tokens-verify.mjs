#!/usr/bin/env node
/**
 * tokens-verify.mjs — verificação de coerência da cadeia de tokens.
 *
 * Três checagens:
 *   1. JSONs em tokens/ — referências `{x.y.z}` resolvem, valores válidos.
 *   2. JSON ↔ CSS — tokens gerados em css/tokens/generated/*.css batem com os JSONs.
 *   3. JSON ↔ Figma Variables — valores e nomes batem com o snapshot Figma
 *      em `.figma-snapshot.json` (gitignored, gerado por use_figma via Claude Code).
 *      Se o snapshot não existir, a checagem é pulada com aviso (não falha o build).
 *      Se o snapshot tiver mais de 24h, a checagem roda mas reporta warning
 *      para evitar falsa segurança com VALUE_DRIFT=0 sobre dado antigo.
 *      Ver docs/process-figma-sync.md para gerar o snapshot.
 *
 * Saídas:
 *   - Terminal: tabela texto com sumário e divergências.
 *   - JSON:     docs/api/tokens-sync.json — estado estruturado para consumo.
 *   - HTML:     docs/tokens-sync.html — página amigável no site.
 *
 * Exit codes:
 *   0 — sem divergências (ou apenas warnings).
 *   1 — divergências detectadas.
 *   2 — erro de execução (arquivo inexistente, JSON inválido, etc.).
 *
 * Uso:
 *   node scripts/tokens-verify.mjs
 *   (sem flags — se .figma-snapshot.json existir, inclui checagem Figma ↔ JSON)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  readFigmaSnapshot,
  buildExpectedState,
  readCurrentState as readFigmaCurrentState,
  compareStates,
} from "./lib/figma-dtcg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

const TOKENS_DIR = path.join(ROOT, "tokens");
const CSS_DIR = path.join(ROOT, "css", "tokens", "generated");
const OUT_JSON = path.join(ROOT, "docs", "api", "tokens-sync.json");
const OUT_HTML = path.join(ROOT, "docs", "tokens-sync.html");
const FIGMA_SNAPSHOT_PATH = path.join(ROOT, ".figma-snapshot.json");
const STALE_SNAPSHOT_HOURS = 24;

// -----------------------------------------------------------------------------
// utilidades
// -----------------------------------------------------------------------------

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function walkJsonFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJsonFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

// Achata um objeto aninhado em pares { "a.b.c": { $value, $type } } apenas nas
// folhas DTCG (objetos com $value).
function flattenTokens(obj, prefix = "", acc = {}) {
  if (obj && typeof obj === "object" && "$value" in obj) {
    acc[prefix] = obj;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith("$")) continue;
      const next = prefix ? `${prefix}.${k}` : k;
      flattenTokens(v, next, acc);
    }
  }
  return acc;
}

function resolveRefs(value, all, seen = new Set()) {
  if (typeof value !== "string") return value;
  const m = value.match(/^\{([^}]+)\}$/);
  if (!m) return value;
  const ref = m[1];
  if (seen.has(ref)) return { __error: `circular: ${ref}` };
  if (!(ref in all)) return { __error: `missing: ${ref}` };
  seen.add(ref);
  return resolveRefs(all[ref].$value, all, seen);
}

// Normaliza hex/rgb/rgba/px/rem para comparação tolerante a formatação.
function normalize(value) {
  if (value == null) return "";
  // Array de 4 números (DTCG cubicBezier) → string cubic-bezier para seguir
  // o path normal de normalização de string.
  if (Array.isArray(value) && value.length === 4 && value.every((n) => typeof n === "number")) {
    value = `cubic-bezier(${value.join(",")})`;
  }
  if (typeof value === "object") {
    if (value.__error) return `ERROR:${value.__error}`;
    return JSON.stringify(value);
  }
  // Dimension equivalence: número puro (vindo do Figma como Float) e string
  // "Npx"/"Nrem" representam o mesmo valor visual. Style Dictionary emite
  // unit no CSS; JSON pode ter número raw (espelhando Figma). Normaliza pra
  // forma "px:N" pra comparação.
  if (typeof value === "number") return `px:${value}`;
  let v = String(value).trim().toLowerCase();
  const remMatch = v.match(/^(-?[\d.]+)rem$/);
  if (remMatch) return `px:${parseFloat(remMatch[1]) * 16}`;
  const pxMatch = v.match(/^(-?[\d.]+)px$/);
  if (pxMatch) return `px:${parseFloat(pxMatch[1])}`;
  if (/^-?[\d.]+$/.test(v)) return `px:${parseFloat(v)}`;
  // #fff -> #ffffff
  if (/^#[0-9a-f]{3}$/.test(v)) {
    v = "#" + v.slice(1).split("").map((c) => c + c).join("");
  }
  // remove espaços dentro de rgba/rgb e dentro de cubic-bezier
  v = v.replace(/\s+/g, "");
  return v;
}

// -----------------------------------------------------------------------------
// 1. Validar JSONs internos
// -----------------------------------------------------------------------------

function loadAllTokens() {
  // Tokens são separados por modo. Semantic light e dark compartilham nomes
  // mas têm valores distintos. Foundation e component são mode-invariant.
  const modes = { light: {}, dark: {}, shared: {} };
  for (const file of walkJsonFiles(TOKENS_DIR)) {
    try {
      const data = readJson(file);
      const flat = flattenTokens(data);
      const mode = file.includes(path.sep + "semantic" + path.sep + "light")
        ? "light"
        : file.includes(path.sep + "semantic" + path.sep + "dark")
        ? "dark"
        : "shared";
      for (const [k, v] of Object.entries(flat)) {
        modes[mode][k] = v;
      }
    } catch (e) {
      console.error(`erro ao ler ${file}: ${e.message}`);
      process.exit(2);
    }
  }
  // Para resolver referências, a pool combinada por modo precisa incluir os
  // tokens shared (foundation + component).
  const lightAll = { ...modes.shared, ...modes.light };
  const darkAll = { ...modes.shared, ...modes.dark };
  return { lightAll, darkAll, shared: modes.shared, light: modes.light, dark: modes.dark };
}

function checkJsonIntegrity(lightAll, darkAll) {
  const errors = [];
  const check = (pool, modeLabel) => {
    for (const [name, token] of Object.entries(pool)) {
      const resolved = resolveRefs(token.$value, pool);
      if (resolved && typeof resolved === "object" && resolved.__error) {
        errors.push({
          level: "error",
          token: name,
          mode: modeLabel,
          message: `Referência ${resolved.__error} em $value=${token.$value}`,
        });
      }
    }
  };
  check(lightAll, "light");
  check(darkAll, "dark");
  return errors;
}

// -----------------------------------------------------------------------------
// 1b. CSS foundation leak — ADR-013/019
//
// Component CSS (`css/components/*.css`) e base CSS (`css/base/*.css`) não
// podem consumir tokens Foundation direto. Componentes migrados consomem
// Component; componentes ainda não migrados podem consumir Semantic direto.
//
// Pós-migração 2-layer (0.7.0) + reintrodução Component (ADR-019):
//   Foundation usa naming NUMÉRICO   (radius-8, spacing-16, font-size-14)
//   Semantic   usa naming T-SHIRT    (radius-md, space-sm, body-font-size-sm)
//
// Padrões proibidos (= Foundation direto):
//   --ds-dimension-{N}                 (numérico) — Semantic equivalente: space-{2xs..2xl}
//   --ds-radius-{N}                  (numérico) — Semantic equivalente: radius-{xs..2xl,full}
//   --ds-font-size-{N}               (numérico) — Semantic: body-font-size-* / control-font-size-*
//   --ds-border-width-{N}            (numérico) — Semantic: border-width-default
//   --ds-font-family-{sans,display,mono}        — Semantic: body-font-family-sans
//   --ds-font-weight-{regular,medium,semibold,bold} — Semantic: body-font-weight-*
//   --ds-line-height-{none,tight,snug,normal,relaxed,loose} — Semantic: body-line-height-*
//   --ds-letter-spacing-{tight,normal,wide}     — Semantic: body-letter-spacing-*
//   --ds-shadow-{xs,sm,md,lg,xl,2xl,none}       — sem Semantic equivalente hoje
//   --ds-duration-{fast,normal,slow}            — sem Semantic
//   --ds-ease-{default,in,out,in-out,linear}    — sem Semantic
//   --ds-opacity-{N}                            — sem Semantic
//   --ds-z-{N}                                  — Semantic: z-{base,sticky,modal,...}
//   --ds-color-{family}-{N}                     — Semantic semantic intent (primary, neutral, etc.)
// -----------------------------------------------------------------------------

const FOUNDATION_LEAK_RE = /var\(\s*--ds-(?:spacing-[0-9]+|radius-[0-9]+|border-width-[0-9]+|font-family-(?:sans|display|mono)|font-weight-(?:regular|medium|semibold|bold)|font-size-[0-9]+|line-height-(?:none|tight|snug|normal|relaxed|loose)|letter-spacing-(?:tight|normal|wide)|shadow-(?:xs|sm|md|lg|xl|2xl|none)|duration-(?:fast|normal|slow)|ease-(?:default|in|out|in-out|linear)|opacity-[0-9]+|z-[0-9]+|color-[a-z]+-[0-9]+)\s*\)/gi;

function scanCssFileForLeaks(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const leaks = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    FOUNDATION_LEAK_RE.lastIndex = 0;
    let m;
    while ((m = FOUNDATION_LEAK_RE.exec(line)) !== null) {
      leaks.push({
        line: i + 1,
        column: m.index + 1,
        match: m[0],
      });
    }
  }
  return leaks;
}

function checkCssFoundationLeak() {
  const diagnostics = [];
  // components/ segue regra estrita (ADR-013 Fase 5 já refatorou)
  // base/ ainda não foi refatorado — downgrade pra warning até o PR de base ser mergeado
  const dirs = [
    { path: path.join(ROOT, "css", "components"), level: "error", scope: "components" },
    { path: path.join(ROOT, "css", "base"),       level: "warning", scope: "base" },
  ];
  for (const { path: dir, level, scope } of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".css")) continue;
      if (file === "index.css") continue; // only @imports
      const full = path.join(dir, file);
      const leaks = scanCssFileForLeaks(full);
      for (const leak of leaks) {
        diagnostics.push({
          level,
          scope,
          file: path.relative(ROOT, full),
          line: leak.line,
          column: leak.column,
          match: leak.match,
          message: `Foundation token consumido direto: ${leak.match}. Use Semantic/Component layer (ADR-013).`,
        });
      }
    }
  }
  return diagnostics;
}

// -----------------------------------------------------------------------------
// 1c. Registry completude — ADR-013
//
// Toda variável em tokens/**/*.json precisa ter entry em tokens/registry.json
// com campos sentido, contexto, decisao preenchidos (não "TODO").
//
// Durante a migração (enquanto há TODOs massivos), opera como WARNING em vez
// de ERROR pra não bloquear CI. Flip pra error quando completude atingir ~80%.
// -----------------------------------------------------------------------------

function flattenTokenPaths(obj, prefix = "") {
  const paths = [];
  if (!obj || typeof obj !== "object") return paths;
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    const p = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object") {
      if ("$value" in val) paths.push(p);
      paths.push(...flattenTokenPaths(val, p));
    }
  }
  return paths;
}

function checkRegistryCompleteness() {
  const registryPath = path.join(ROOT, "tokens", "registry.json");
  if (!fs.existsSync(registryPath)) {
    return [{
      level: "warning",
      message: "tokens/registry.json não existe. Rode `npm run build:registry:init`.",
    }];
  }
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const entries = registry.entries || {};

  // Collect paths from all tokens/ JSONs
  const tokenPaths = new Set();
  const tokenDirs = ["foundation", "semantic", "component"];
  for (const dir of tokenDirs) {
    const dirPath = path.join(ROOT, "tokens", dir);
    if (!fs.existsSync(dirPath)) continue;
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith(".json")) continue;
      if (file === "registry.json") continue;
      const full = path.join(dirPath, file);
      let json;
      try { json = JSON.parse(fs.readFileSync(full, "utf8")); } catch { continue; }
      for (const p of flattenTokenPaths(json)) tokenPaths.add(p);
    }
  }

  const diagnostics = [];
  const missing = [...tokenPaths].filter(p => !entries[p]);
  const withTodos = Object.entries(entries).filter(([p, e]) =>
    tokenPaths.has(p) && (e.sentido === "TODO" || e.contexto === "TODO" || e.decisao === "TODO")
  );
  const stale = Object.keys(entries).filter(p => !tokenPaths.has(p));

  if (missing.length) {
    diagnostics.push({
      level: "error",
      message: `${missing.length} tokens em tokens/ sem entry em registry.json. Rode \`npm run build:registry:init\`.`,
      sample: missing.slice(0, 5),
    });
  }
  if (withTodos.length) {
    // Downgrade to warning during migration (expected mass of TODOs)
    diagnostics.push({
      level: "warning",
      message: `${withTodos.length} entries com campos TODO (sentido/contexto/decisao). Preencha incrementalmente.`,
      sample: withTodos.slice(0, 5).map(([p]) => p),
    });
  }
  if (stale.length) {
    diagnostics.push({
      level: "warning",
      message: `${stale.length} entries em registry.json sem token correspondente em tokens/ (stale).`,
      sample: stale.slice(0, 5),
    });
  }
  return diagnostics;
}

// -----------------------------------------------------------------------------
// 2. Comparar JSON resolvido com CSS gerado
// -----------------------------------------------------------------------------

function parseCssVars(file) {
  const content = fs.readFileSync(file, "utf8");
  const vars = {};
  // captura --nome: valor; (pode ter comentários /* ... */ antes)
  const re = /--(ds-[a-z0-9_-]+):\s*([^;]+);/gi;
  let match;
  while ((match = re.exec(content)) !== null) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

// Traduz nome canônico DTCG (foundation.color.neutral.50) para a CSS var
// gerada (ds-color-neutral-50). Espelha exatamente o transform
// `name/strip-layer` definido em build-tokens.mjs:
//   1. Remove prefixo de camada (foundation/semantic/component).
//   2. Se o próximo segmento for 'typography', remove também
//      (foundation.typography.font.size.md → font-size-md).
//   3. Se o próximo segmento for 'color' seguido de 'overlay', remove 'color'
//      (foundation.color.overlay.black.5 → overlay-black-5).
//      Mas mantém 'color' para paletas (foundation.color.blue.500 → color-blue-500).
function canonicalToCssVar(name) {
  const path = name.split(".");
  path.shift(); // layer
  if (path[0] === "typography") path.shift();
  if (path[0] === "color" && path[1] === "overlay") path.shift();
  return "ds-" + path.join("-");
}

function compareJsonToCss({ shared, light, dark, lightAll, darkAll }) {
  const sharedCss = {};
  for (const f of ["foundation.css", "component.css"].map((x) => path.join(CSS_DIR, x)).filter(fs.existsSync)) {
    Object.assign(sharedCss, parseCssVars(f));
  }
  const lightCss = fs.existsSync(path.join(CSS_DIR, "theme-light.css"))
    ? parseCssVars(path.join(CSS_DIR, "theme-light.css"))
    : {};
  const darkCss = fs.existsSync(path.join(CSS_DIR, "theme-dark.css"))
    ? parseCssVars(path.join(CSS_DIR, "theme-dark.css"))
    : {};

  const divergences = [];

  const compare = (pool, resolvePool, cssPool, modeLabel) => {
    for (const [name, token] of Object.entries(pool)) {
      const cssName = canonicalToCssVar(name);
      if (!(cssName in cssPool)) {
        divergences.push({
          level: "warning",
          token: name,
          cssVar: cssName,
          mode: modeLabel,
          message: "token definido em JSON mas sem CSS custom property equivalente",
        });
        continue;
      }
      if (cssPool[cssName].startsWith("var(--")) continue;
      const jsonResolved = resolveRefs(token.$value, resolvePool);
      const jsonN = normalize(jsonResolved);
      const cssN = normalize(cssPool[cssName]);
      if (jsonN !== cssN) {
        divergences.push({
          level: "error",
          token: name,
          cssVar: cssName,
          mode: modeLabel,
          json: jsonResolved,
          css: cssPool[cssName],
          message: "valor do CSS gerado difere do JSON",
        });
      }
    }
  };

  compare(shared, shared, sharedCss, "shared");
  compare(light, lightAll, lightCss, "light");
  compare(dark, darkAll, darkCss, "dark");

  return divergences;
}

// -----------------------------------------------------------------------------
// 3. Comparar com Figma Variables (via snapshot local)
// -----------------------------------------------------------------------------
//
// A REST API GET /v1/files/:key/variables/local exige plano Enterprise.
// No plano Pro (nosso caso), usamos o snapshot gerado por use_figma numa
// sessão Claude Code (ver docs/process-figma-sync.md).
//
// Se .figma-snapshot.json não existir, a verificação é pulada com aviso.
// Para gerar o snapshot: iniciar sessão Claude Code e pedir o dump de Variables.

async function compareJsonToFigma() {
  if (!fs.existsSync(FIGMA_SNAPSHOT_PATH)) {
    return {
      skipped: true,
      reason: "Snapshot Figma não encontrado (.figma-snapshot.json). Gerar via Claude Code (ver docs/process-figma-sync.md).",
      divergences: [],
      diffs: null,
    };
  }

  let meta;
  try {
    meta = readFigmaSnapshot(FIGMA_SNAPSHOT_PATH);
  } catch (e) {
    return {
      skipped: true,
      reason: `Snapshot inválido: ${e.message}`,
      divergences: [],
      diffs: null,
    };
  }

  const snapshotStat = fs.statSync(FIGMA_SNAPSHOT_PATH);
  const snapshotAgeH = Math.round((Date.now() - snapshotStat.mtimeMs) / (1000 * 60 * 60));
  const snapshotIsStale = snapshotAgeH > STALE_SNAPSHOT_HOURS;

  const { state: expected, issues } = buildExpectedState(meta);
  const actual = readFigmaCurrentState(TOKENS_DIR);
  const diffs = compareStates(expected, actual);

  // Categorias → severidade (conforme ADR-003 revisada — Figma é fonte canônica):
  //   VALUE_DRIFT      → error   (mesmo token, valores divergem — sync pendente)
  //   MISSING_IN_FIGMA → error   (JSON tem, Figma não — JSON foi editado direto)
  //   NEW_IN_FIGMA     → warning (Figma tem, JSON não — sync pendente, ação manual)
  //   ALIAS_BROKEN     → warning (alias Figma quebrado — investigar no Figma)
  const divergences = [
    ...(snapshotIsStale ? [{
      level: "warning",
      category: "STALE_SNAPSHOT",
      token: ".figma-snapshot.json",
      message: `snapshot Figma tem ${snapshotAgeH}h (> ${STALE_SNAPSHOT_HOURS}h). Regenerar via use_figma antes de concluir sync/release.`,
    }] : []),
    ...diffs.VALUE_DRIFT.map((d) => ({
      level: "error",
      category: "VALUE_DRIFT",
      token: d.token,
      message: `valor difere: Figma=${JSON.stringify(d.figma)} / JSON=${JSON.stringify(d.json)}`,
      figma: d.figma,
      json: d.json,
    })),
    ...diffs.MISSING_IN_FIGMA.map((d) => ({
      level: "error",
      category: "DRIFT_FROM_SOURCE",
      token: d.token,
      message: `existe no JSON mas não no Figma — JSON foi editado sem passar pelo Figma`,
      json: d.json,
    })),
    ...diffs.NEW_IN_FIGMA.map((d) => ({
      level: "warning",
      category: "NEEDS_SYNC",
      token: d.token,
      message: `existe no Figma mas não no JSON — rode npm run sync:tokens-from-figma`,
      figma: d.figma,
    })),
    ...issues
      .filter((i) => i.category === "ALIAS_BROKEN")
      .map((i) => ({
        level: "warning",
        category: "ALIAS_BROKEN",
        token: i.token,
        message: `alias Figma quebrado — alvo: ${i.target}`,
      })),
  ];

  return {
    skipped: false,
    snapshotAge: `${snapshotAgeH}h`,
    snapshotFreshness: snapshotIsStale ? "stale" : "fresh",
    snapshotMaxAgeHours: STALE_SNAPSHOT_HOURS,
    summary: {
      figmaVariableCount: Object.keys(meta.variables).length,
      figmaCollectionCount: Object.keys(meta.variableCollections).length,
      VALUE_DRIFT: diffs.VALUE_DRIFT.length,
      NEEDS_SYNC: diffs.NEW_IN_FIGMA.length,
      DRIFT_FROM_SOURCE: diffs.MISSING_IN_FIGMA.length,
      ALIAS_BROKEN: issues.filter((i) => i.category === "ALIAS_BROKEN").length,
      CSS_ONLY: (diffs.CSS_ONLY || []).length,
      BY_DESIGN: (diffs.BY_DESIGN || []).length,
    },
    divergences,
    diffs,
  };
}

// -----------------------------------------------------------------------------
// saídas
// -----------------------------------------------------------------------------

function writeJsonReport(report) {
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2) + "\n");
}

function writeHtmlReport(report) {
  const status =
    report.totals.errors > 0
      ? { label: `${report.totals.errors} divergência(s)`, klass: "error" }
      : report.totals.warnings > 0
      ? { label: `${report.totals.warnings} aviso(s)`, klass: "warning" }
      : { label: "Em dia", klass: "ok" };
  const rows = [
    ...report.checks.jsonIntegrity.map((d) => ({ check: "JSON integrity", ...d })),
    ...report.checks.jsonVsCss.filter((d) => d.level === "error").map((d) => ({ check: "JSON ↔ CSS", ...d })),
    ...report.checks.jsonVsFigma.divergences.map((d) => ({ check: "JSON ↔ Figma", ...d })),
  ];
  const rowsHtml = rows.length
    ? rows
        .map(
          (r) => `
    <tr>
      <td><code>${r.check}</code></td>
      <td><code>${r.token || "—"}</code></td>
      <td>${r.message}</td>
      <td><code>${r.json ?? "—"}</code></td>
      <td><code>${r.css ?? "—"}</code></td>
    </tr>`
        )
        .join("")
    : `<tr><td colspan="5" style="text-align:center;color:var(--ds-content-default)">Nenhuma divergência registrada.</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sincronização de tokens — Design System</title>
<link rel="stylesheet" href="../css/design-system.css">
<link rel="stylesheet" href="layout.css">
<style>
  /* Status badge — usa o componente Badge do DS, não Button */
  .ds-sync-status { display:inline-flex; align-items:center; gap: var(--ds-dimension-8); padding: var(--ds-dimension-2) var(--ds-dimension-8); border-radius: var(--ds-radius-full); font-size: var(--ds-body-font-size-sm); font-weight: var(--ds-body-font-weight-semibold); }
  .ds-sync-status.ok { background: var(--ds-feedback-success-background-subtle); color: var(--ds-feedback-success-content-default); border: var(--ds-border-width-default) solid var(--ds-feedback-success-border-default); }
  .ds-sync-status.warning { background: var(--ds-feedback-warning-background-subtle); color: var(--ds-feedback-warning-content-default); border: var(--ds-border-width-default) solid var(--ds-feedback-warning-border-default); }
  .ds-sync-status.error { background: var(--ds-feedback-error-background-subtle); color: var(--ds-feedback-error-content-default); border: var(--ds-border-width-default) solid var(--ds-feedback-error-border-default); }
  .ds-sync-meta { display:flex; gap: var(--ds-dimension-24); margin-top: var(--ds-dimension-16); font-size: var(--ds-body-font-size-sm); color: var(--ds-content-default); }
  .ds-sync-meta strong { color: var(--ds-content-default); font-weight: var(--ds-body-font-weight-semibold); }
  .ds-sync-table { width:100%; border-collapse: collapse; margin-top: var(--ds-dimension-24); font-size: var(--ds-body-font-size-sm); }
  .ds-sync-table th, .ds-sync-table td { text-align:left; padding: var(--ds-dimension-12); border-bottom: 1px solid var(--ds-border-default); color: var(--ds-content-default); }
  .ds-sync-table th { font-weight: var(--ds-body-font-weight-semibold); background: var(--ds-background-subtle); }
  .ds-sync-table code { background: var(--ds-surface-raised); color: var(--ds-content-default); border: var(--ds-border-width-default) solid var(--ds-border-subtle); padding: var(--ds-dimension-2) var(--ds-dimension-6); border-radius: var(--ds-radius-sm); }
  /* Banner info — usa subtle bg pra <code> ter contraste */
  .ds-sync-banner { background: var(--ds-feedback-info-background-subtle); color: var(--ds-feedback-info-content-default); border: var(--ds-border-width-default) solid var(--ds-feedback-info-border-default); padding: var(--ds-dimension-16) var(--ds-dimension-20); border-radius: var(--ds-radius-md); margin-bottom: var(--ds-dimension-24); font-size: var(--ds-body-font-size-sm); }
  .ds-sync-banner code { background: var(--ds-surface-default); color: var(--ds-feedback-info-content-default); padding: var(--ds-dimension-2) var(--ds-dimension-6); border-radius: var(--ds-radius-sm); font-family: var(--ds-body-font-family-sans); font-size: 0.9em; border: var(--ds-border-width-default) solid var(--ds-feedback-info-border-default); }
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
    <a href="../index.html" class="ds-site-header__brand">
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
    <h1 class="ds-section__title"><span data-lang="pt">Sincronização de tokens</span><span data-lang="en">Token sync status</span></h1>
    <p class="ds-section__subtitle"><span data-lang="pt">Coerência entre JSONs canônicos, CSS gerado e Figma Variables.</span><span data-lang="en">Coherence between canonical JSON, generated CSS, and Figma Variables.</span></p>
  </div>

  <div class="ds-sync-banner">
    <span data-lang="pt">Esta página é gerada automaticamente por <code>scripts/tokens-verify.mjs</code>. Não editar manualmente.</span>
    <span data-lang="en">This page is generated automatically by <code>scripts/tokens-verify.mjs</code>. Do not edit by hand.</span>
  </div>

  <div class="ds-section">
    <span class="ds-sync-status ${status.klass}">${status.label}</span>
    <div class="ds-sync-meta">
      <div><strong>Versão:</strong> ${report.version || ""}</div>
      <div><strong>Divergências:</strong> ${report.totals.errors}</div>
      <div><strong>Avisos:</strong> ${report.totals.warnings}</div>
    </div>
  </div>

  <div class="ds-section">
    <h2 class="ds-subsection__title">Detalhamento</h2>
    <table class="ds-sync-table">
      <thead>
        <tr><th>Checagem</th><th>Token</th><th>Mensagem</th><th>JSON</th><th>CSS</th></tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div>
</main>

<script src="../js/main.js"></script>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(OUT_HTML), { recursive: true });
  fs.writeFileSync(OUT_HTML, html);
}

// -----------------------------------------------------------------------------
// main
// -----------------------------------------------------------------------------

async function main() {
  const bundle = loadAllTokens();
  const totalTokens = Object.keys(bundle.shared).length + Object.keys(bundle.light).length + Object.keys(bundle.dark).length;
  const jsonIntegrity = checkJsonIntegrity(bundle.lightAll, bundle.darkAll);
  const jsonVsCss = compareJsonToCss(bundle);
  const cssFoundationLeak = checkCssFoundationLeak();
  const registryCompleteness = checkRegistryCompleteness();
  // Para a verificação Figma usa o pool combinado (light) como representativo.
  // A comparação específica por modo será implementada junto com a resolução
  // de alias Figma.
  const jsonVsFigma = await compareJsonToFigma();
  const docTokenDrift = (await import("./lib/doc-token-drift.mjs")).checkDocTokenDrift();

  const figmaErrors = (jsonVsFigma.divergences ?? []).filter((d) => d.level === "error").length;
  const figmaWarnings = (jsonVsFigma.divergences ?? []).filter((d) => d.level === "warning").length;

  const errors = jsonIntegrity.filter((d) => d.level === "error").length +
    jsonVsCss.filter((d) => d.level === "error").length +
    cssFoundationLeak.filter((d) => d.level === "error").length +
    registryCompleteness.filter((d) => d.level === "error").length +
    docTokenDrift.filter((d) => d.level === "error").length +
    figmaErrors;
  const warnings = jsonIntegrity.filter((d) => d.level === "warning").length +
    jsonVsCss.filter((d) => d.level === "warning").length +
    cssFoundationLeak.filter((d) => d.level === "warning").length +
    registryCompleteness.filter((d) => d.level === "warning").length +
    docTokenDrift.filter((d) => d.level === "warning").length +
    figmaWarnings;

  const report = {
    version: pkg.version,
    totals: {
      jsonTokens: totalTokens,
      sharedTokens: Object.keys(bundle.shared).length,
      lightTokens: Object.keys(bundle.light).length,
      darkTokens: Object.keys(bundle.dark).length,
      errors,
      warnings,
    },
    checks: {
      jsonIntegrity,
      jsonVsCss,
      cssFoundationLeak,
      registryCompleteness,
      docTokenDrift,
      jsonVsFigma,
    },
  };

  // terminal
  console.log("");
  console.log("═══ tokens-verify ════════════════════════════");
  console.log(`Tokens JSON:      ${report.totals.jsonTokens} (shared ${report.totals.sharedTokens}, light ${report.totals.lightTokens}, dark ${report.totals.darkTokens})`);
  console.log(`JSON integrity:   ${jsonIntegrity.length === 0 ? "OK" : `${jsonIntegrity.length} erros`}`);
  console.log(`JSON ↔ CSS:       ${jsonVsCss.filter((d) => d.level === "error").length === 0 ? "OK" : `${jsonVsCss.filter((d) => d.level === "error").length} divergências`}`);
  const cssLeakErrors = cssFoundationLeak.filter((d) => d.level === "error").length;
  const cssLeakWarnings = cssFoundationLeak.filter((d) => d.level === "warning").length;
  const cssLeakLabel = cssLeakErrors === 0 && cssLeakWarnings === 0 ? "OK"
    : cssLeakErrors > 0 ? `${cssLeakErrors} leaks em components/`
    : `${cssLeakWarnings} leaks em base/ (warning, débito)`;
  console.log(`CSS leak (ADR-013): ${cssLeakLabel}`);
  const regErrors = registryCompleteness.filter((d) => d.level === "error").length;
  const regWarnings = registryCompleteness.filter((d) => d.level === "warning").length;
  const regLabel = regErrors === 0 && regWarnings === 0 ? "OK"
    : regErrors > 0 ? `${regErrors} erros`
    : `${regWarnings} warnings (migração em curso)`;
  console.log(`Registry:         ${regLabel}`);
  const docDriftErrors = docTokenDrift.filter((d) => d.level === "error").length;
  const docDriftWarnings = docTokenDrift.filter((d) => d.level === "warning").length;
  const docDriftLabel = docDriftErrors === 0 && docDriftWarnings === 0 ? "OK"
    : docDriftErrors > 0 ? `${docDriftErrors} doc-only token(s) (doc descreve sistema que JSON não tem)`
    : `${docDriftWarnings} value mismatch(es) entre doc e JSON`;
  console.log(`Doc ↔ JSON:       ${docDriftLabel}`);
  if (jsonVsFigma.skipped) {
    console.log(`JSON ↔ Figma:     SKIP — ${jsonVsFigma.reason}`);
  } else {
    const s = jsonVsFigma.summary;
    const figmaStatus = figmaErrors === 0 && figmaWarnings === 0
      ? "OK"
      : `${figmaErrors} error(s) / ${figmaWarnings} warning(s)`;
    console.log(`JSON ↔ Figma:     ${figmaStatus} — snapshot ${jsonVsFigma.snapshotAge} atrás`);
    console.log(`  VALUE_DRIFT=${s.VALUE_DRIFT}  DRIFT_FROM_SOURCE=${s.DRIFT_FROM_SOURCE}  NEEDS_SYNC=${s.NEEDS_SYNC}  ALIAS_BROKEN=${s.ALIAS_BROKEN}  CSS_ONLY=${s.CSS_ONLY}  BY_DESIGN=${s.BY_DESIGN}`);
  }
  console.log(`Avisos:           ${warnings}`);
  console.log(`Erros:            ${errors}`);
  console.log("═════════════════════════════════════════════");
  console.log("");

  if (errors > 0 || warnings > 0) {
    const figmaDivergences = jsonVsFigma.divergences ?? [];
    const allIssues = [
      ...jsonIntegrity,
      ...jsonVsCss.filter((x) => x.level === "error"),
      ...figmaDivergences,
    ];
    console.log(`Divergências (${allIssues.length}):`);
    for (const d of allIssues) {
      const tag = d.category ? `${d.level}/${d.category}` : (d.level || "error");
      console.log(`  • [${tag}] ${d.token}${d.cssVar ? ` → ${d.cssVar}` : ""}`);
      console.log(`      ${d.message}`);
      if (d.json !== undefined && d.css !== undefined) {
        console.log(`      JSON: ${JSON.stringify(d.json)}  /  CSS: ${JSON.stringify(d.css)}`);
      } else if (d.figma !== undefined && d.json !== undefined) {
        console.log(`      Figma: ${JSON.stringify(d.figma)}  /  JSON: ${JSON.stringify(d.json)}`);
      }
    }
    console.log("");
  }

  writeJsonReport(report);
  writeHtmlReport(report);
  console.log(`Relatório: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`Página:    ${path.relative(ROOT, OUT_HTML)}`);

  process.exit(errors > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
