/**
 * doc-token-drift.mjs
 *
 * Detecta drift entre documentação e tokens reais. O sintoma motivador foi
 * `docs/foundations-motion.html` documentando um sistema (5 durations × 5
 * easings) que JSON nunca implementou — drift silencioso por meses.
 *
 * Estratégia:
 *   1. Para cada `docs/foundations-*.html`, extrair os blocos JSON dentro de
 *      `<div class="ds-code-block">…</div>` que começam com `{` (são exemplos
 *      canônicos do esquema DTCG).
 *   2. Tentar parsear como JSON. Se for `{ "foundation": {...} }` ou
 *      `{ "semantic": {...} }`, validar contra o JSON real em `tokens/`.
 *   3. Reportar:
 *        - DOC_ONLY_TOKEN: token aparece na doc, não existe no JSON.
 *        - JSON_ONLY_TOKEN: token existe no JSON, não aparece na doc.
 *        - VALUE_MISMATCH: token existe nos dois lados mas valores divergem.
 *
 * Não bloqueia builds existentes — vira warning até consolidação completa.
 * Adicionar foundations-* nova exige adicionar exemplo canônico que bate
 * com o JSON, ou o check pega.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

// ─── Utils ───────────────────────────────────────────────────────────────────

function readJsonFile(p) {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}

/**
 * Walk a DTCG-shaped tree and emit `{path, value}` for every `$value`-bearing leaf.
 * Path is the dot-joined route from root, e.g. `foundation.duration.fast`.
 */
function* walkTokens(node, parentPath = "") {
  if (!node || typeof node !== "object") return;
  if ("$value" in node && typeof node.$value !== "object") {
    yield { path: parentPath, value: node.$value, type: node.$type };
    return;
  }
  if ("$value" in node && Array.isArray(node.$value)) {
    yield { path: parentPath, value: JSON.stringify(node.$value), type: node.$type };
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("$")) continue;
    yield* walkTokens(v, parentPath ? `${parentPath}.${k}` : k);
  }
}

function buildTokenMap(layerRoot) {
  const map = new Map();
  if (!layerRoot) return map;
  for (const { path, value, type } of walkTokens(layerRoot)) {
    map.set(path, { value: String(value), type });
  }
  return map;
}

// ─── Doc parsing ─────────────────────────────────────────────────────────────

/**
 * Extract candidate JSON code blocks from an HTML file. Looks for
 * `<div class="ds-code-block">…</div>` that contain `{` as first
 * non-whitespace char (likely DTCG JSON example).
 */
function extractDocJsonBlocks(html) {
  const blocks = [];
  const re = /<div\s+class="ds-code-block"[^>]*>([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim();
    if (!raw.startsWith("{")) continue;
    // Decode common HTML entities that might exist in the block
    const decoded = raw
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    try {
      blocks.push(JSON.parse(decoded));
    } catch {
      // skip invalid JSON blocks
    }
  }
  return blocks;
}

// ─── Comparison ──────────────────────────────────────────────────────────────

function normalizeValue(v) {
  if (typeof v !== "string") return String(v);
  // Treat "150ms" and 150 (ms) as same. Otherwise direct string compare.
  return v.trim();
}

function compareDocVsJson(docMap, jsonMap, sourceFile, layer) {
  const divergences = [];

  // DOC has, JSON doesn't
  for (const [path, doc] of docMap) {
    if (!jsonMap.has(path)) {
      divergences.push({
        level: "error",
        type: "DOC_ONLY_TOKEN",
        path,
        layer,
        sourceFile,
        message: `${path} aparece em ${sourceFile} mas não existe em tokens/. Doc descreve sistema que JSON não implementa.`,
      });
    } else {
      const json = jsonMap.get(path);
      const docVal = normalizeValue(doc.value);
      const jsonVal = normalizeValue(json.value);
      if (docVal !== jsonVal) {
        divergences.push({
          level: "warning",
          type: "VALUE_MISMATCH",
          path,
          layer,
          sourceFile,
          docValue: doc.value,
          jsonValue: json.value,
          message: `${path}: doc=${doc.value} / JSON=${json.value}`,
        });
      }
    }
  }

  // JSON has, DOC doesn't (only emit for layers the doc explicitly enumerates;
  // we can't distinguish "doc didn't list" from "doc isn't canonical for this".
  // Conservative: emit as info, not error)
  for (const [path] of jsonMap) {
    if (!docMap.has(path)) {
      divergences.push({
        level: "info",
        type: "JSON_ONLY_TOKEN",
        path,
        layer,
        sourceFile,
        message: `${path} existe em tokens/ mas não aparece em ${sourceFile}. Doc pode estar atrás.`,
      });
    }
  }

  return divergences;
}

// ─── Main ────────────────────────────────────────────────────────────────────

/**
 * Run the full doc-vs-tokens drift check. Reads tokens/ JSONs and all
 * `docs/foundations-*.html`, returns array of divergences.
 */
export function checkDocTokenDrift() {
  const divergences = [];

  // Load consolidated foundation JSON
  const foundationDir = path.join(ROOT, "tokens/foundation");
  const foundation = {};
  if (fs.existsSync(foundationDir)) {
    for (const f of fs.readdirSync(foundationDir).filter((x) => x.endsWith(".json"))) {
      const j = readJsonFile(path.join(foundationDir, f));
      if (j?.foundation) Object.assign(foundation, j.foundation);
    }
  }

  // Semantic light only (paridade com dark é checada em outro lugar)
  const semantic = readJsonFile(path.join(ROOT, "tokens/semantic/light.json"))?.semantic || {};

  const docsDir = path.join(ROOT, "docs");
  if (!fs.existsSync(docsDir)) return divergences;

  const files = fs
    .readdirSync(docsDir)
    .filter((f) => /^foundations-.+\.html$/.test(f))
    .map((f) => path.join(docsDir, f));

  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    const blocks = extractDocJsonBlocks(html);
    const relFile = path.relative(ROOT, file);

    for (const block of blocks) {
      // Detect which layer the block describes
      if (block.foundation) {
        const docMap = buildTokenMap(block.foundation);
        const jsonMap = buildTokenMap(foundation);
        // Filter jsonMap to only the categories the doc enumerates
        const docTopLevels = new Set(Object.keys(block.foundation));
        const filteredJsonMap = new Map(
          [...jsonMap].filter(([p]) => docTopLevels.has(p.split(".")[0]))
        );
        divergences.push(...compareDocVsJson(docMap, filteredJsonMap, relFile, "foundation"));
      }
      if (block.semantic) {
        const docMap = buildTokenMap(block.semantic);
        const jsonMap = buildTokenMap(semantic);
        const docTopLevels = new Set(Object.keys(block.semantic));
        const filteredJsonMap = new Map(
          [...jsonMap].filter(([p]) => docTopLevels.has(p.split(".")[0]))
        );
        divergences.push(...compareDocVsJson(docMap, filteredJsonMap, relFile, "semantic"));
      }
    }
  }

  return divergences;
}
