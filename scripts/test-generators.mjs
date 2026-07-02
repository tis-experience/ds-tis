#!/usr/bin/env node
/**
 * Generator output validation — pega bugs em scripts que geram HTML.
 *
 * Verifica que `var(--ds-X)` e DTCG paths emitidos por scripts/sync-docs.mjs
 * e scripts/tokens-verify.mjs apontam para tokens que existem.
 *
 * Pega o bug do sync-docs emitindo `var(--ds-feedback-info-background)` que
 * não existe mais pós-2-layer.
 *
 * Saída: imprime refs inválidas em scripts, exit code 1.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

// Build set of valid CSS vars
const validVars = new Set();
const generatedDir = path.join(ROOT, 'css', 'tokens', 'generated');
for (const f of fs.readdirSync(generatedDir)) {
  if (!f.endsWith('.css')) continue;
  const content = fs.readFileSync(path.join(generatedDir, f), 'utf-8');
  for (const m of content.matchAll(/^\s+(--ds-[a-z0-9-]+)\s*:/gm)) validVars.add(m[1]);
}

// Build set of valid DTCG paths
function flattenTokenPaths(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj || {})) {
    if (k.startsWith('$')) continue;
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') {
      if ('$value' in v) out.push(p);
      else flattenTokenPaths(v, p, out);
    }
  }
  return out;
}

const validPaths = new Set();
for (const dir of ['foundation', 'semantic']) {
  for (const f of fs.readdirSync(path.join(ROOT, 'tokens', dir))) {
    if (!f.endsWith('.json') || f === 'registry.json') continue;
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens', dir, f), 'utf-8'));
    for (const p of flattenTokenPaths(data)) validPaths.add(p);
  }
}

// Scan generator scripts
const generators = [
  'scripts/sync-docs.mjs',
  'scripts/tokens-verify.mjs',
  'scripts/build-llms.mjs',
];

console.log(`\n═══ test-generators ══════════════════════════`);
console.log(`Valid CSS vars: ${validVars.size}`);
console.log(`Valid DTCG paths: ${validPaths.size}`);

for (const file of generators) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // CSS vars: var(--ds-X)
    for (const m of line.matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*[,)]/g)) {
      if (!validVars.has(m[1])) {
        errors.push(`[orphan-css-ref] ${file}:${i + 1} → ${m[1]}`);
      }
    }
    // DTCG paths in template literals (semantic.X.Y inside backticks/quotes)
    for (const m of line.matchAll(/'(semantic\.[a-z][a-z0-9.-]+)'/g)) {
      // skip wildcards/comments
      if (m[1].endsWith('.*') || m[1].includes('TODO')) continue;
      if (!validPaths.has(m[1])) {
        errors.push(`[orphan-dtcg-ref] ${file}:${i + 1} → ${m[1]}`);
      }
    }
  }
}

console.log(`Generators scanned: ${generators.length}\n`);

if (errors.length === 0) {
  console.log(`✅ PASS — 0 refs inválidas em geradores`);
  process.exit(0);
} else {
  console.log(`❌ FAIL — ${errors.length} ref(s):\n`);
  for (const e of errors) console.log(`  ${e}`);
  process.exit(1);
}
