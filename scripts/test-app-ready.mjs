#!/usr/bin/env node

/**
 * Gate executável da ADR-020.
 *
 * Cada execução usa um ledger temporário novo. Lifecycle e consumer smoke
 * registram somente cases que passaram; readiness cruza esses resultados com
 * os requisitos de todo ds-runtime atualmente App-ready. A11y e visual ficam
 * no mesmo comando para que CI/Release não possam executar apenas o contrato.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-tis-app-ready-'));
const skipVisual = process.argv.includes('--skip-visual')
  || process.env.DS_APP_READY_SKIP_VISUAL === '1';
const releaseMode = process.argv.includes('--release');

if (skipVisual && (process.env.CI === 'true' || releaseMode)) {
  fs.rmSync(reportDir, { recursive: true, force: true });
  console.error('❌ --skip-visual/DS_APP_READY_SKIP_VISUAL não é permitido em CI ou release.');
  process.exit(2);
}

const suites = [
  { label: 'readiness gate self-test', script: 'scripts/test-readiness-evidence.mjs' },
  { label: 'runtime lifecycle evidence', script: 'scripts/test-runtime-lifecycle.mjs' },
  { label: 'packed consumer evidence', script: 'scripts/test-consumer-smoke.mjs' },
  {
    label: 'readiness contract + executed evidence',
    script: 'scripts/test-component-readiness.mjs',
    args: ['--require-evidence', '--evidence-dir', reportDir],
  },
  {
    label: 'WCAG 2.2 AA docs scan',
    script: 'scripts/test-a11y.mjs',
    args: ['--strict-load', '--server', '--readiness-pages', '--zero-blocking'],
  },
  ...(!skipVisual ? [{ label: 'strict visual regression', script: 'scripts/test-visual.mjs' }] : []),
];

console.log('\n═══ test-app-ready ═══════════════════════════');
console.log(`Evidence ledger: ${reportDir}`);
if (skipVisual) {
  console.log('⚠️ Visual ignorado explicitamente nesta execução local; CI/pack default continuam estritos.');
}

let failed = null;
try {
  for (const suite of suites) {
    console.log(`\n▶ ${suite.label}`);
    const result = spawnSync(process.execPath, [suite.script, ...(suite.args || [])], {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, DS_READINESS_REPORT_DIR: reportDir },
    });
    if (result.status !== 0) {
      failed = { label: suite.label, status: result.status ?? 1, error: result.error };
      break;
    }
  }
} finally {
  fs.rmSync(reportDir, { recursive: true, force: true });
}

if (failed) {
  console.error(`\n❌ FAIL — ${failed.label} (exit ${failed.status})`);
  if (failed.error) console.error(failed.error.stack || failed.error.message);
  process.exit(failed.status || 1);
}

console.log('\n✅ PASS — gate de promoção App-ready para ds-runtime');
