#!/usr/bin/env node
/**
 * Token integrity test — pega bugs que aparecem em migrações de naming/aliases.
 *
 * Verifica:
 *   1. Todo alias `{path.to.token}` aponta para um token que existe
 *   2. Sem ciclos no grafo de aliases
 *   3. Description com "Npx" bate com o valor resolvido
 *      (pegou o bug body.font-size.sm: alias →12px mas description "14px")
 *   4. Sem duplicação tipo "border-default-default" em paths
 *   5. light.json e dark.json têm o mesmo conjunto de chaves (ADR)
 *
 * Saída: imprime erros encontrados, exit code 1 se houver.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

// ──────────────────────────────────────────────────────────────────
// 1. Build flat map of all token paths → resolved leaf value
// ──────────────────────────────────────────────────────────────────

function flattenTokens(obj, prefix = '', acc = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    if (k.startsWith('$')) continue;
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') {
      if ('$value' in v) {
        acc[p] = { value: v.$value, type: v.$type, description: v.$description, source: '__pending__' };
      }
      flattenTokens(v, p, acc);
    }
  }
  return acc;
}

const allTokens = {};

// Foundation
for (const file of fs.readdirSync(path.join(ROOT, 'tokens', 'foundation'))) {
  if (!file.endsWith('.json')) continue;
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens', 'foundation', file), 'utf-8'));
  const flat = flattenTokens(data);
  for (const [p, v] of Object.entries(flat)) {
    v.source = `tokens/foundation/${file}`;
    allTokens[p] = v;
  }
}

// Semantic light + dark — colocar com prefix `__light__` / `__dark__` pra distinguir
const semanticLight = flattenTokens(JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens', 'semantic', 'light.json'), 'utf-8')));
const semanticDark = flattenTokens(JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens', 'semantic', 'dark.json'), 'utf-8')));

for (const [p, v] of Object.entries(semanticLight)) { v.source = 'tokens/semantic/light.json'; allTokens[p] = v; }
// Não sobrescreve light com dark — só usamos light pra audit (mesmas chaves esperadas)

// Component — mode-invariant contracts (ADR-019)
const componentDir = path.join(ROOT, 'tokens', 'component');
if (fs.existsSync(componentDir)) {
  for (const file of fs.readdirSync(componentDir)) {
    if (!file.endsWith('.json')) continue;
    const data = JSON.parse(fs.readFileSync(path.join(componentDir, file), 'utf-8'));
    const flat = flattenTokens(data);
    for (const [p, v] of Object.entries(flat)) {
      v.source = `tokens/component/${file}`;
      allTokens[p] = v;
    }
  }
}

// ──────────────────────────────────────────────────────────────────
// 2. Test: aliases existem
// ──────────────────────────────────────────────────────────────────

const ALIAS_RE = /^\{(.+)\}$/;

function resolve(path, seen = new Set()) {
  if (seen.has(path)) return { error: `cycle: ${[...seen, path].join(' → ')}` };
  if (!allTokens[path]) return { error: `not found: ${path}` };
  const t = allTokens[path];
  const m = String(t.value).match(ALIAS_RE);
  if (!m) return { value: t.value };
  return resolve(m[1], new Set([...seen, path]));
}

for (const [tokenPath, token] of Object.entries(allTokens)) {
  const valStr = String(token.value);
  const m = valStr.match(ALIAS_RE);
  if (m) {
    const target = m[1];
    if (!allTokens[target]) {
      errors.push(`[broken-alias] ${tokenPath} → {${target}} (target does not exist)`);
    } else {
      const r = resolve(target);
      if (r.error) errors.push(`[${r.error}] originating from ${tokenPath}`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────
// 3. Test: description claim "Npx" matches resolved value
//    Foundation tokens com naming numérico (radius/N, spacing/N,
//    typography.font.size.N) têm valor predizível pelo nome.
// ──────────────────────────────────────────────────────────────────

const NUMERIC_PATH_RE = /^foundation\.(radius|spacing|typography\.(font\.size|line\.height|letter\.spacing|font\.weight))\.(\d+)$/;

function resolveFully(path) {
  let cur = path;
  const seen = new Set();
  while (true) {
    if (seen.has(cur)) return null;
    seen.add(cur);
    const t = allTokens[cur];
    if (!t) return null;
    const m = String(t.value).match(ALIAS_RE);
    if (!m) return cur; // returns the foundation path
    cur = m[1];
  }
}

for (const [tokenPath, token] of Object.entries(allTokens)) {
  if (!token.description) continue;

  // Look for "Npx" in description
  const pxMatch = token.description.match(/(\d+)px/);
  if (!pxMatch) continue;
  const claimedPx = parseInt(pxMatch[1], 10);

  // Resolve to foundation
  const valStr = String(token.value);
  const aliasMatch = valStr.match(ALIAS_RE);
  if (!aliasMatch) continue;

  const fdnPath = resolveFully(aliasMatch[1]);
  if (!fdnPath) continue;

  // Foundation paths with numeric naming → number IS the px value
  const numMatch = fdnPath.match(NUMERIC_PATH_RE);
  if (numMatch) {
    const actualPx = parseInt(numMatch[3], 10);
    if (actualPx !== claimedPx) {
      errors.push(
        `[description-mismatch] ${tokenPath} aliases ${fdnPath} (${actualPx}px) ` +
        `but description claims "${claimedPx}px"`
      );
    }
  }
}

// ──────────────────────────────────────────────────────────────────
// 4. Test: no duplicated suffixes like "-default-default"
//    Pegou o bug do regex de rename que duplicou border-default
// ──────────────────────────────────────────────────────────────────

for (const tokenPath of Object.keys(allTokens)) {
  const segments = tokenPath.split('.');
  for (let i = 0; i < segments.length - 1; i++) {
    if (segments[i] === segments[i + 1] && segments[i].length > 2) {
      errors.push(`[duplicated-segment] ${tokenPath} has consecutive identical segments "${segments[i]}"`);
    }
    // Check within hyphenated names: "border-default-default"
    const parts = segments[i].split('-');
    for (let j = 0; j < parts.length - 1; j++) {
      if (parts[j] === parts[j + 1] && parts[j].length > 2 && !/^\d+$/.test(parts[j])) {
        errors.push(`[duplicated-suffix] ${tokenPath}: segment "${segments[i]}" has consecutive identical parts`);
      }
    }
  }
}

// ──────────────────────────────────────────────────────────────────
// 5. Test: light/dark have same key set
// ──────────────────────────────────────────────────────────────────

const lightKeys = new Set(Object.keys(semanticLight));
const darkKeys = new Set(Object.keys(semanticDark));
for (const k of lightKeys) if (!darkKeys.has(k)) errors.push(`[mode-mismatch] ${k} in light.json but not dark.json`);
for (const k of darkKeys) if (!lightKeys.has(k)) errors.push(`[mode-mismatch] ${k} in dark.json but not light.json`);

// ──────────────────────────────────────────────────────────────────
// Report
// ──────────────────────────────────────────────────────────────────

console.log(`\n═══ test-token-integrity ═════════════════════`);
console.log(`Tokens analisados: ${Object.keys(allTokens).length} foundation + semantic light + component`);
console.log(`Light/Dark mode: ${lightKeys.size} chaves cada lado\n`);

if (errors.length === 0) {
  console.log(`✅ PASS — 0 erros`);
  if (warnings.length > 0) console.log(`⚠️  ${warnings.length} avisos`);
  process.exit(0);
} else {
  console.log(`❌ FAIL — ${errors.length} erro(s):\n`);
  for (const e of errors) console.log(`  ${e}`);
  process.exit(1);
}
