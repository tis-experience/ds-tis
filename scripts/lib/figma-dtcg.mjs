/**
 * figma-dtcg.mjs — funções compartilhadas para ler Figma Variables e
 * convertê-las no formato DTCG do repo. Usado por:
 *   - scripts/sync-tokens-from-figma.mjs (sync Figma → JSON com --write)
 *   - scripts/tokens-verify.mjs (verificação de coerência no CI)
 *
 * Direção canônica conforme ADR-003 revisada: Figma Variables são a
 * autoridade. JSONs em tokens/ são consolidação derivada.
 */

import fs from "node:fs";
import path from "node:path";

export const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || (() => {
  process.emitWarning("FIGMA_FILE_KEY não definido via env — usando fallback. Defina a variável de ambiente para produção.", "SecurityWarning");
  return "IE68amP9Hya5ieFw1rX8S8";
})();

// Prefixo do nome da variável Figma → arquivo em tokens/foundation/
export const FOUNDATION_PREFIX_TO_FILE = {
  color: "colors.json",
  typography: "typography.json",
  dimension: "dimension.json",
  radius: "radius.json",
  opacity: "opacity.json",
  border: "stroke.json",
  stroke: "stroke.json",
};

// Brand tem 3 modos (Default/Ocean/Forest), só Default entra em foundation/brand.json.
export const BRAND_MODE = "Default";
// Component tem 1 modo "Default".
export const COMPONENT_MODE = "Default";

// ─── Obter o snapshot do Figma ───────────────────────────────────────────────
//
// A API REST GET /v1/files/:key/variables/local exige plano Enterprise do
// Figma. No plano Pro (nosso caso), usamos o MCP remoto (`use_figma`) via
// Claude Code: o agente executa um script Plugin API que dumpa as Variables
// num JSON temporário, e este módulo lê esse arquivo.
//
// Formato esperado:
//   { variables: {...}, variableCollections: {...} }
//
// Gerar via MCP: ver docs/process-figma-sync.md.

export function readFigmaSnapshot(snapshotPath) {
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(
      `Snapshot não encontrado em ${snapshotPath}. Gerar via Claude Code com use_figma (ver docs/process-figma-sync.md).`
    );
  }
  const raw = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  if (!raw.variables || !raw.variableCollections) {
    throw new Error(`Snapshot inválido: faltam variables/variableCollections em ${snapshotPath}.`);
  }
  return { variables: raw.variables, variableCollections: raw.variableCollections };
}

// ─── Figma → DTCG conversion ─────────────────────────────────────────────────

export function figmaNameToPath(figmaName) {
  return figmaName.split("/").join(".");
}

export function canonicalPathForVariable(layer, figmaName) {
  const path = figmaNameToPath(figmaName);
  return path === layer || path.startsWith(`${layer}.`) ? path : `${layer}.${path}`;
}

export function colorToString(rgba) {
  const { r, g, b, a } = rgba;
  const to255 = (c) => Math.round(c * 255);
  if (a < 0.999) {
    return `rgba(${to255(r)}, ${to255(g)}, ${to255(b)}, ${parseFloat(a.toFixed(2))})`;
  }
  return (
    "#" +
    [r, g, b]
      .map((c) => to255(c).toString(16).padStart(2, "0").toUpperCase())
      .join("")
  );
}

export function collectionToLayer(collection) {
  if (!collection) return "unknown";
  switch (collection.name) {
    case "Foundation":
      return "foundation";
    case "Brand":
      return "foundation";
    case "Semantic":
      return "semantic";
    case "Component":
      return "component";
    default:
      return collection.name.toLowerCase();
  }
}

export function resolveValue(value, allVarsById, collectionsById) {
  if (value == null) return null;

  if (typeof value === "object" && value.type === "VARIABLE_ALIAS") {
    const target = allVarsById[value.id];
    if (!target) {
      return { __error: "ALIAS_BROKEN", aliasId: value.id };
    }
    const targetColl = collectionsById[target.variableCollectionId];
    const layer = collectionToLayer(targetColl);
    const targetPath = figmaNameToPath(target.name);
    return `{${layer}.${targetPath}}`;
  }

  if (typeof value === "object" && "r" in value && "g" in value && "b" in value) {
    return colorToString(value);
  }

  return value;
}

export function mapDtcgType(figmaType) {
  switch (figmaType) {
    case "COLOR":
      return "color";
    case "FLOAT":
      return "dimension";
    case "STRING":
      return "string";
    case "BOOLEAN":
      return "boolean";
    default:
      return "color";
  }
}

/**
 * Dado um Variable + collection, retorna o arquivo-alvo DTCG.
 * Retorna { file, mode, semanticMulti? }. semanticMulti indica que
 * gera em 2 arquivos (light.json e dark.json) — nesse caso, o caller
 * trata separadamente.
 */
export function resolveTargetFile(variable, collection) {
  if (!collection) return { file: null, mode: null };

  if (collection.name === "Foundation") {
    const prefix = variable.name.split("/")[0];
    const file = FOUNDATION_PREFIX_TO_FILE[prefix];
    return file ? { file: `foundation/${file}`, mode: "Value" } : { file: null, mode: null };
  }

  if (collection.name === "Brand") {
    return { file: "foundation/brand.json", mode: BRAND_MODE };
  }

  if (collection.name === "Semantic") {
    return { file: null, mode: null, semanticMulti: true };
  }

  if (collection.name === "Component") {
    const parts = variable.name.split("/");
    const component = parts[0] === "component" ? parts[1] : parts[0];
    return component ? { file: `component/${component}.json`, mode: COMPONENT_MODE } : { file: null, mode: null };
  }

  return { file: null, mode: null };
}

/**
 * Varre todas as Variables e constrói o estado esperado dos JSONs.
 * Retorna { state, issues }:
 *   state = { "foundation/colors.json": { "foundation.color.neutral.50": {$value,$type,$description} }, ... }
 *   issues = [{ category: "ALIAS_BROKEN", token, mode, target }, ...]
 */
export function buildExpectedState(figmaMeta) {
  const { variables, variableCollections } = figmaMeta;
  const allVarsById = variables;
  const collectionsById = variableCollections;
  const issues = [];
  const state = {};

  for (const v of Object.values(variables)) {
    const coll = collectionsById[v.variableCollectionId];
    if (!coll) continue;
    const layer = collectionToLayer(coll);
    const canonicalPath = canonicalPathForVariable(layer, v.name);
    const target = resolveTargetFile(v, coll);

    if (coll.name === "Semantic") {
      for (const m of coll.modes) {
        const file =
          m.name === "Light" ? "semantic/light.json" :
          m.name === "Dark" ? "semantic/dark.json" : null;
        if (!file) continue;
        const resolved = resolveValue(v.valuesByMode[m.modeId], allVarsById, collectionsById);
        if (resolved && typeof resolved === "object" && resolved.__error) {
          issues.push({ category: "ALIAS_BROKEN", token: canonicalPath, mode: m.name, target: resolved.aliasId });
          continue;
        }
        if (!state[file]) state[file] = {};
        state[file][canonicalPath] = {
          $value: resolved,
          $type: mapDtcgType(v.resolvedType),
          ...(v.description ? { $description: v.description } : {}),
        };
      }
      continue;
    }

    if (!target.file) continue;
    const mode = coll.modes.find((m) => m.name === target.mode);
    if (!mode) continue;
    const resolved = resolveValue(v.valuesByMode[mode.modeId], allVarsById, collectionsById);
    if (resolved && typeof resolved === "object" && resolved.__error) {
      issues.push({ category: "ALIAS_BROKEN", token: canonicalPath, mode: target.mode, target: resolved.aliasId });
      continue;
    }
    if (!state[target.file]) state[target.file] = {};
    state[target.file][canonicalPath] = {
      $value: resolved,
      $type: mapDtcgType(v.resolvedType),
      ...(v.description ? { $description: v.description } : {}),
    };
  }

  return { state, issues };
}

// ─── Read current JSON state ────────────────────────────────────────────────

export function flattenDtcg(obj, prefix = "", acc = {}) {
  if (obj && typeof obj === "object" && "$value" in obj) {
    acc[prefix] = obj;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith("$")) continue;
      flattenDtcg(v, prefix ? `${prefix}.${k}` : k, acc);
    }
  }
  return acc;
}

export function readCurrentState(tokensDir) {
  const state = {};
  const readIfExists = (relFile) => {
    const abs = path.join(tokensDir, relFile);
    if (!fs.existsSync(abs)) return null;
    return flattenDtcg(JSON.parse(fs.readFileSync(abs, "utf8")));
  };
  for (const f of Object.values(FOUNDATION_PREFIX_TO_FILE)) {
    const rel = `foundation/${f}`;
    const flat = readIfExists(rel);
    if (flat) state[rel] = flat;
  }
  const brand = readIfExists("foundation/brand.json");
  if (brand) state["foundation/brand.json"] = brand;
  const light = readIfExists("semantic/light.json");
  if (light) state["semantic/light.json"] = light;
  const dark = readIfExists("semantic/dark.json");
  if (dark) state["semantic/dark.json"] = dark;
  const compDir = path.join(tokensDir, "component");
  if (fs.existsSync(compDir)) {
    for (const f of fs.readdirSync(compDir)) {
      if (!f.endsWith(".json")) continue;
      const rel = `component/${f}`;
      const flat = readIfExists(rel);
      if (flat) state[rel] = flat;
    }
  }
  return state;
}

// ─── Compare ────────────────────────────────────────────────────────────────

/**
 * Converte valor de dimensão pra número em px. Retorna null se não for dimensão.
 *   16     → 16 (Figma retorna números puros pra FLOAT)
 *   "16px" → 16
 *   "1rem" → 16
 *   "1.5rem" → 24
 */
function asPx(v) {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  const rem = s.match(/^(-?[\d.]+)rem$/);
  if (rem) return parseFloat(rem[1]) * 16;
  const px = s.match(/^(-?[\d.]+)px$/);
  if (px) return parseFloat(px[1]);
  // Número puro em string
  if (/^-?[\d.]+$/.test(s)) return parseFloat(s);
  return null;
}

// Arredonda pra 4 casas decimais pra amortecer ruído de ponto flutuante do Figma
// (ex.: 0.05 vs 0.05000000074505806) sem perder precisão útil (ex.: 1.5 ≠ 1.6).
function roundFloat(n) {
  return Math.round(n * 10000) / 10000;
}

export function normalizeForCompare(v) {
  if (v == null) return "";
  // Tenta dimensão primeiro
  const px = asPx(v);
  if (px != null) return `px:${roundFloat(px)}`;
  if (typeof v === "object") return JSON.stringify(v);
  let s = String(v).trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(s)) s = "#" + s.slice(1).split("").map((c) => c + c).join("");
  s = s.replace(/\s+/g, "");
  // Normaliza números dentro de strings (ex.: rgba) arredondando pra 4 casas.
  s = s.replace(/-?\d+\.\d+/g, (m) => String(roundFloat(parseFloat(m))));
  // Normaliza hífens dentro de aliases DTCG ({foundation.color.brand-light} ↔
  // {foundation.color.brand.light}). Figma usa "/" → "." na conversão pra path,
  // enquanto JSON pode ter chaves kebab ("content-default"). Pra equivalência
  // semântica entre ambos os lados, colapsamos hífen em ponto dentro de
  // referências entre chaves.
  s = s.replace(/\{([^}]+)\}/g, (_, inner) => `{${inner.replace(/-/g, ".")}}`);
  return s;
}

/**
 * Normaliza um path DTCG para forma canônica unificando o separador entre Figma
 * e JSON. Figma converte `a/b/c` → `a.b.c`. JSON pode armazenar `a.b-c` (com
 * último segmento kebab) representando o mesmo token. Esta função colapsa todos
 * os hífens em pontos pra que ambas as origens produzam a mesma chave.
 */
export function canonicalPathKey(path) {
  return path.replace(/-/g, ".");
}

// Tokens com representação CSS-específica no JSON (fallback stack, weight numérico,
// unidades rem/em) que o Figma não consegue representar adequadamente. Sync pularia
// informação importante — então só registramos como CSS_ONLY (informativo, não aplicável).
const CSS_ONLY_TOKENS = [
  /^foundation\.typography\.font\.family\./,
  /^foundation\.typography\.font\.weight\./,
  /^foundation\.typography\.font\.size\./,
];

function isCssOnlyToken(token) {
  return CSS_ONLY_TOKENS.some((rx) => rx.test(token));
}

// ADR-012: tokens de line-height e letter-spacing têm representação divergente
// por design — Figma usa PX (limite da Plugin API pra lineHeight/letterSpacing
// em text styles); JSON usa ratio unitless / rem / em (requisito CSS + WCAG
// 1.4.4 "Resize Text"). Não sincronizam entre si; cada lado é canônico no seu
// contexto. Vão pra categoria BY_DESIGN (informativa, 0 drift).
const FIGMA_ONLY_PATHS = [
  /^foundation\.typography\.font\.line-height\./,      // px absoluto nos text styles Figma
  /^foundation\.typography\.font\.letter-spacing\./,   // px absoluto
];
const JSON_ONLY_PATHS = [
  /^foundation\.typography\.line\.height\./,           // ratio / rem no CSS gerado
  /^foundation\.typography\.letter\.spacing\./,        // em no CSS gerado
  // ADR-016: categorias CSS-only sem equivalência Figma Variable
  /^semantic\.motion\./,                               // motion (runtime — Smart Animate)
  /^semantic\.z\./,                                    // z-index (Figma usa layer order)
  /^semantic\.shadow\./,                               // shadow (Figma Effect Style, não Variable)
  /^component\.breadcrumb\.focus-ring\.radius\.default$/, // focus ring existe só no CSS; Figma Breadcrumb não tem focus variant
  /^component\.modal\.close\.(icon-size|padding)\.default$/, // Modal usa instância de ícone no Figma; CSS controla botão HTML
  /^component\.tabs\.panel\.padding-y\.default$/,       // painel de Tabs é estrutura CSS, não variant Figma
  // 2xs (11px) é micro-text usado em docs/layout.css. Figma omite por estar
  // abaixo do mínimo recomendado WCAG 1.4.4 (12px); CSS mantém pra meta-info.
  /^foundation\.typography\.font\.size\.11$/,
  /^semantic\.typography\.body\.font-size\.2xs$/,
  /^semantic\.typography\.body\.line-height\.2xs$/,
];

// ADR-016: Semantic/Component tokens whose alias targets a Foundation
// category that Figma Variables can't represent (shadow objects, motion
// curves/durations, z-index stacks). These tokens exist in JSON only and
// propagate to CSS — Figma equivalent is N/A. Classified as BY_DESIGN
// instead of DRIFT_FROM_SOURCE. To add a new category: include a regex
// AND amend ADR-016.
const JSON_ONLY_COMPONENT_ALIAS_TARGETS = [
  /^\{foundation\.shadow\./,         // shadow objects — Figma Effect Styles only, not Variables
  /^\{foundation\.z\./,              // z-index — no Figma primitive
  /^\{foundation\.duration\./,       // motion duration — no Figma primitive
  /^\{foundation\.ease\./,           // cubic-bezier — no Figma primitive
  /^\{semantic\.motion\./,           // semantic wrappers pra motion
  /^\{semantic\.z\./,                // semantic wrappers pra z-index
  /^\{semantic\.shadow\./,           // semantic wrappers pra shadow
];

function isFigmaOnlyToken(token) {
  return FIGMA_ONLY_PATHS.some((rx) => rx.test(token));
}
function isJsonOnlyToken(token) {
  return JSON_ONLY_PATHS.some((rx) => rx.test(token));
}

/**
 * ADR-012 extended: quando um token (típico em semantic ou component) existe
 * nos dois lados mas os valores apontam para aliases Foundation em subárvores
 * divergentes por design — Figma em `foundation.typography.font.line-height.*`
 * (px) vs JSON em `foundation.typography.line.height.*` (ratio); mesma coisa
 * pra letter-spacing — classifica como BY_DESIGN em vez de VALUE_DRIFT.
 */
function isDivergentAliasByDesign(figmaVal, jsonVal) {
  if (typeof figmaVal !== 'string' || typeof jsonVal !== 'string') return false;
  const figLH = /^\{foundation\.typography\.font\.line-height\./.test(figmaVal);
  const jsnLH = /^\{foundation\.typography\.line\.height\./.test(jsonVal);
  if (figLH && jsnLH) return true;
  const figLS = /^\{foundation\.typography\.font\.letter-spacing\./.test(figmaVal);
  const jsnLS = /^\{foundation\.typography\.letter\.spacing\./.test(jsonVal);
  if (figLS && jsnLS) return true;
  return false;
}

/**
 * Compara expected (Figma) vs actual (JSON). Retorna:
 *   { VALUE_DRIFT, NEW_IN_FIGMA, MISSING_IN_FIGMA, CSS_ONLY, BY_DESIGN }
 *
 * - VALUE_DRIFT: mesmo nome, valor diferente. Aplicável em --write.
 * - NEW_IN_FIGMA: Figma tem, JSON não. Ação manual.
 * - MISSING_IN_FIGMA: JSON tem, Figma não. Ação manual.
 * - CSS_ONLY (ADR-011 followup): mesmo token, representação diferente por
 *   capacidade CSS (fallback stack, rem, weight numérico). Informativo.
 * - BY_DESIGN (ADR-012): token existe só de um lado por escolha arquitetural
 *   documentada (line-height/letter-spacing). Informativo, 0 drift.
 */
export function compareStates(expected, actual) {
  const diffs = {
    VALUE_DRIFT: [], NEW_IN_FIGMA: [], MISSING_IN_FIGMA: [],
    CSS_ONLY: [], BY_DESIGN: [],
  };
  const allFiles = new Set([...Object.keys(expected), ...Object.keys(actual)]);
  for (const file of allFiles) {
    const exp = expected[file] || {};
    const act = actual[file] || {};
    // Build canonical lookup tables. Figma e JSON podem usar separadores
    // diferentes pro mesmo token (ex.: `primary.content.default` vs
    // `primary.content-default`). Indexa-se cada lado por chave canônica
    // (hífen→ponto) preservando a chave original pra reporting/--write.
    const expByCanon = new Map();
    for (const k of Object.keys(exp)) expByCanon.set(canonicalPathKey(k), k);
    const actByCanon = new Map();
    for (const k of Object.keys(act)) actByCanon.set(canonicalPathKey(k), k);
    const allCanon = new Set([...expByCanon.keys(), ...actByCanon.keys()]);
    for (const canonKey of allCanon) {
      const expKey = expByCanon.get(canonKey);
      const actKey = actByCanon.get(canonKey);
      // Pra reporting, usa a chave do JSON se existir (preserva forma kebab),
      // senão a chave do Figma.
      const key = actKey || expKey;
      const e = expKey ? exp[expKey] : undefined;
      const a = actKey ? act[actKey] : undefined;
      if (e && !a) {
        // Token só no Figma
        if (isFigmaOnlyToken(key)) {
          diffs.BY_DESIGN.push({ file, token: key, side: 'figma-only', figma: e.$value });
        } else {
          diffs.NEW_IN_FIGMA.push({ file, token: key, figma: e.$value });
        }
      } else if (!e && a) {
        // Token só no JSON
        if (isJsonOnlyToken(key)) {
          diffs.BY_DESIGN.push({ file, token: key, side: 'json-only', json: a.$value });
        } else if (
          (key.startsWith('component.') || key.startsWith('semantic.')) &&
          typeof a.$value === 'string' &&
          JSON_ONLY_COMPONENT_ALIAS_TARGETS.some((rx) => rx.test(a.$value))
        ) {
          // Semantic/Component tokens aliasing Foundation categories Figma can't represent
          diffs.BY_DESIGN.push({ file, token: key, side: 'json-only-downstream', json: a.$value });
        } else {
          diffs.MISSING_IN_FIGMA.push({ file, token: key, json: a.$value });
        }
      } else if (e && a) {
        if (normalizeForCompare(e.$value) !== normalizeForCompare(a.$value)) {
          if (isCssOnlyToken(key)) {
            diffs.CSS_ONLY.push({ file, token: key, figma: e.$value, json: a.$value });
          } else if (isDivergentAliasByDesign(e.$value, a.$value)) {
            diffs.BY_DESIGN.push({ file, token: key, side: 'divergent-alias', figma: e.$value, json: a.$value });
          } else {
            diffs.VALUE_DRIFT.push({ file, token: key, figma: e.$value, json: a.$value });
          }
        }
      }
    }
  }
  return diffs;
}
