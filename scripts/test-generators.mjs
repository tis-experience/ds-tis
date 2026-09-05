#!/usr/bin/env node
/**
 * Generator output validation — pega bugs em scripts que geram HTML.
 *
 * Verifica que `var(--ds-X)` e DTCG paths emitidos por scripts/sync-docs.mjs
 * e scripts/tokens-verify.mjs apontam para tokens que existem. Também garante
 * que os cabeçalhos gerados por sync-docs não dependem da data de execução.
 *
 * Pega o bug do sync-docs emitindo `var(--ds-feedback-info-background)` que
 * não existe mais pós-2-layer.
 *
 * Saída: imprime refs inválidas em scripts, exit code 1.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { renderHtmlReport } from './tokens-verify.mjs';

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

for (const file of [
  'docs/token-schema.md',
  'docs/component-inventory.md',
  'docs/adr-index.md',
]) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf-8');
  const generatedHeader = content.split('\n').find(line => line.includes('Gerado automaticamente por `scripts/sync-docs.mjs`'));
  if (/\b\d{4}-\d{2}-\d{2}\b/.test(generatedHeader || '')) {
    errors.push(`[non-deterministic-date] ${file} → ${generatedHeader}`);
  }
}

console.log(`Generators scanned: ${generators.length}\n`);

// Presentation fixtures only: never synthesize a local Figma snapshot or
// replace a verifier result. The renderer must preserve incomplete evidence.
const baseReport = {
  version: 'test',
  totals: { errors: 0, warnings: 0 },
  checks: {
    jsonIntegrity: [],
    jsonVsCss: [],
    jsonVsFigma: {
      skipped: false,
      snapshotFreshness: 'fresh',
      snapshotAge: '1h',
      snapshotMaxAgeHours: 24,
      divergences: [],
    },
  },
};

function renderStatus(figmaOverrides = {}, totalOverrides = {}) {
  const report = structuredClone(baseReport);
  Object.assign(report.checks.jsonVsFigma, figmaOverrides);
  Object.assign(report.totals, totalOverrides);
  const original = structuredClone(report);
  const html = renderHtmlReport(report);
  assert.deepEqual(report, original, 'HTML presentation must not modify verifier results');
  return html;
}

const freshHtml = renderStatus();
assert.match(freshHtml, /class="ds-sync-status ok"/);
assert.match(freshHtml, /data-lang="pt">Em dia<\/span>/);
assert.match(freshHtml, /data-lang="en">Up to date<\/span>/);
assert.match(freshHtml, /data-figma-status="fresh"/);

for (const reason of [
  'Snapshot Figma não encontrado (.figma-snapshot.json).',
  'Snapshot inválido: faltam variables/variableCollections.',
]) {
  const skippedHtml = renderStatus({ skipped: true, reason, snapshotFreshness: undefined });
  assert.match(skippedHtml, /class="ds-sync-status warning"/);
  assert.match(skippedHtml, /data-figma-status="skipped"/);
  assert.match(skippedHtml, /Verificação parcial — Figma: SKIP/);
  assert.match(skippedHtml, /Partial verification — Figma: SKIP/);
  assert.ok(skippedHtml.includes(reason), 'SKIP must explain why Figma was not checked');
  assert.match(skippedHtml, /sincronização com o Figma não foi confirmada/);
  assert.match(skippedHtml, /checagens executadas/);
  assert.doesNotMatch(skippedHtml, /class="ds-sync-status ok"|>Em dia<|>Up to date</);
}

const staleHtml = renderStatus({ snapshotFreshness: 'stale', snapshotAge: '49h' }, { warnings: 1 });
assert.match(staleHtml, /class="ds-sync-status warning"/);
assert.match(staleHtml, /Snapshot Figma desatualizado/);
assert.match(staleHtml, /data-figma-status="stale"/);
assert.match(staleHtml, /STALE — snapshot com 49h, acima do limite de 24h/);
assert.match(staleHtml, /Stale Figma snapshot/);
assert.doesNotMatch(staleHtml, /class="ds-sync-status ok"|>Em dia<|>Up to date</);

const unknownHtml = renderStatus({ snapshotFreshness: undefined });
assert.match(unknownHtml, /Snapshot freshness unconfirmed/);
assert.doesNotMatch(unknownHtml, /class="ds-sync-status ok"|>Em dia<|>Up to date</);
const warningHtml = renderStatus({}, { warnings: 1 });
assert.match(warningHtml, /class="ds-sync-status warning"/);
assert.match(warningHtml, /1 aviso\(s\)/);

for (const figmaOverrides of [{}, { skipped: true }, { snapshotFreshness: 'stale' }]) {
  const errorHtml = renderStatus(figmaOverrides, { errors: 2, warnings: 1 });
  assert.match(errorHtml, /class="ds-sync-status error"/);
  assert.match(errorHtml, /2 divergência\(s\)/);
  assert.match(errorHtml, /Detected errors:<\/span><\/strong> 2/);
  assert.doesNotMatch(errorHtml, /class="ds-sync-status ok"|>Em dia<|>Up to date</);
}

const escapedReasonHtml = renderStatus({ skipped: true, reason: 'Snapshot inválido: <script>"&\'</script>' });
assert.match(escapedReasonHtml, /&lt;script&gt;&quot;&amp;&#39;&lt;\/script&gt;/);
assert.doesNotMatch(escapedReasonHtml, /Snapshot inválido: <script>/);

// Exercise the unchanged CLI error gate in an isolated fixture, including a
// symlink entrypoint. Never write synthetic evidence to the working checkout.
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-tis-token-report-test-'));
try {
  fs.mkdirSync(path.join(fixtureRoot, 'scripts', 'lib'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'docs'));
  for (const file of [
    'package.json', 'scripts/tokens-verify.mjs',
    'scripts/lib/figma-dtcg.mjs', 'scripts/lib/doc-token-drift.mjs',
  ]) fs.copyFileSync(path.join(ROOT, file), path.join(fixtureRoot, file));
  for (const directory of ['tokens', 'css']) {
    fs.cpSync(path.join(ROOT, directory), path.join(fixtureRoot, directory), { recursive: true });
  }
  fs.writeFileSync(path.join(fixtureRoot, 'docs', 'foundations-negative-test.html'),
    '<div class="ds-code-block">{"foundation":{"negative-test-only":{"$type":"number","$value":1}}}</div>');
  const entrypoint = path.join(fixtureRoot, 'scripts', 'tokens-verify.mjs');
  const linkedEntrypoint = path.join(fixtureRoot, 'tokens-verify-link.mjs');
  fs.symlinkSync(entrypoint, linkedEntrypoint);
  for (const script of [entrypoint, linkedEntrypoint]) {
    const result = spawnSync(process.execPath, [script], { encoding: 'utf8', cwd: fixtureRoot });
    assert.equal(result.status, 1, `Verifier errors must fail through ${script}: ${result.stderr}`);
    const cliReport = JSON.parse(fs.readFileSync(path.join(fixtureRoot, 'docs', 'api', 'tokens-sync.json'), 'utf8'));
    const cliHtml = fs.readFileSync(path.join(fixtureRoot, 'docs', 'tokens-sync.html'), 'utf8');
    assert.equal(cliReport.totals.errors, 1);
    assert.equal(cliReport.checks.jsonVsFigma.skipped, true);
    assert.match(cliHtml, /class="ds-sync-status error"/);
    assert.match(cliHtml, /SKIP — comparação não executada/);
  }
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}
console.log('Token report statuses: PASS — fresh, skipped (missing/invalid), stale, unknown, warnings, errors and escaped reason\n');
console.log('Token verifier CLI: PASS — errors still exit 1 through real and symlink entrypoints\n');

if (errors.length === 0) {
  console.log(`✅ PASS — 0 refs inválidas em geradores`);
  process.exit(0);
} else {
  console.log(`❌ FAIL — ${errors.length} ref(s):\n`);
  for (const e of errors) console.log(`  ${e}`);
  process.exit(1);
}
