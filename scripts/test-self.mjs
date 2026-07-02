#!/usr/bin/env node
/**
 * Self-test — provoca regressões conhecidas e confirma que os testes pegam.
 *
 * Roda em cada teste:
 *   1. Aplica uma mutation conhecida (ex: corrompe um alias)
 *   2. Roda o teste correspondente
 *   3. Verifica que o teste FALHA (exit 1)
 *   4. Reverte a mutation
 *   5. Roda o teste de novo e verifica que PASSA (exit 0)
 *
 * Garante que os testes não viram silenciosamente verdes (regressão de teste).
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function runTest(script) {
  try {
    execSync(`node ${script}`, { cwd: ROOT, stdio: 'pipe' });
    return 0;
  } catch (e) {
    return e.status || 1;
  }
}

function withMutation(file, before, after, fn) {
  const fullPath = path.join(ROOT, file);
  const orig = fs.readFileSync(fullPath, 'utf-8');
  if (!orig.includes(before)) throw new Error(`mutation marker not found in ${file}: ${before}`);
  fs.writeFileSync(fullPath, orig.replace(before, after));
  try { fn(); } finally { fs.writeFileSync(fullPath, orig); }
}

console.log(`\n═══ test-self ═══════════════════════════════`);

// ──────────────────────────────────────────────────────────────────
// Test 1: token-integrity catches description mismatch
// ──────────────────────────────────────────────────────────────────
console.log('\n[1] description-mismatch detection...');
withMutation(
  'tokens/semantic/light.json',
  '"$value": "{foundation.typography.font.size.14}",\n            "$description": "14px. Body padrão',
  '"$value": "{foundation.typography.font.size.12}",\n            "$description": "14px. Body padrão',
  () => {
    const code = runTest('scripts/test-token-integrity.mjs');
    if (code === 0) failures.push('token-integrity did NOT detect description mismatch');
    else console.log('  ✅ detected');
  }
);

// ──────────────────────────────────────────────────────────────────
// Test 2: token-integrity catches broken alias
// ──────────────────────────────────────────────────────────────────
console.log('[2] broken-alias detection...');
withMutation(
  'tokens/semantic/light.json',
  '"{foundation.color.neutral.900}"',
  '"{foundation.color.nonexistent}"',
  () => {
    const code = runTest('scripts/test-token-integrity.mjs');
    if (code === 0) failures.push('token-integrity did NOT detect broken alias');
    else console.log('  ✅ detected');
  }
);

// ──────────────────────────────────────────────────────────────────
// Test 3: css-references catches orphan var()
// ──────────────────────────────────────────────────────────────────
console.log('[3] orphan-css-ref detection...');
withMutation(
  'css/components/button.css',
  'var(--ds-button-radius-default)',
  'var(--ds-button-radius-nonexistent)',
  () => {
    const code = runTest('scripts/test-css-references.mjs');
    if (code === 0) failures.push('css-references did NOT detect orphan ref');
    else console.log('  ✅ detected');
  }
);

// ──────────────────────────────────────────────────────────────────
// Test 4: css-references catches broken @import
// ──────────────────────────────────────────────────────────────────
console.log('[4] broken-import detection...');
withMutation(
  'css/tokens/index.css',
  "@import 'generated/foundation.css';",
  "@import 'generated/foundation.css';\n@import 'generated/nonexistent.css';",
  () => {
    const code = runTest('scripts/test-css-references.mjs');
    if (code === 0) failures.push('css-references did NOT detect broken @import');
    else console.log('  ✅ detected');
  }
);

// ──────────────────────────────────────────────────────────────────
// Test 5: generator test catches orphan var() in script
// ──────────────────────────────────────────────────────────────────
console.log('[5] orphan-css-ref in generator detection...');
withMutation(
  'scripts/sync-docs.mjs',
  'var(--ds-dimension-12)',
  'var(--ds-dimension-nonexistent)',
  () => {
    const code = runTest('scripts/test-generators.mjs');
    if (code === 0) failures.push('test-generators did NOT detect orphan in generator');
    else console.log('  ✅ detected');
  }
);

// ──────────────────────────────────────────────────────────────────
// Report
// ──────────────────────────────────────────────────────────────────

console.log();
if (failures.length === 0) {
  console.log(`✅ PASS — todos os 5 cenários de regressão são detectados\n`);
  process.exit(0);
} else {
  console.log(`❌ FAIL — ${failures.length} cenário(s) NÃO detectado(s):`);
  for (const f of failures) console.log(`  ${f}`);
  process.exit(1);
}
