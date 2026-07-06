#!/usr/bin/env node
/**
 * refresh-figma-snapshot.mjs
 *
 * Fluxo completo após o designer colocar figma-snapshot.json na raiz:
 *   install → sync (dry-run) → verify:tokens
 *
 * Uso (agentes e humanos):
 *   npm run figma:snapshot:refresh
 *
 * Quando o owner sinalizar que atualizou o export do plugin, o agente deve
 * rodar este comando imediatamente — sem pedir confirmação.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const steps = [
  { name: 'figma:snapshot:install', cmd: 'npm', args: ['run', 'figma:snapshot:install'] },
  { name: 'sync:tokens-from-figma', cmd: 'npm', args: ['run', 'sync:tokens-from-figma'] },
  { name: 'verify:tokens', cmd: 'npm', args: ['run', 'verify:tokens'] },
];

console.log('═══ figma:snapshot:refresh ═══════════════════════════════\n');

for (const step of steps) {
  console.log(`▶ ${step.name}\n`);
  const result = spawnSync(step.cmd, step.args, {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    console.error(`\n✗ ${step.name} falhou (exit ${result.status ?? 1}).`);
    process.exit(result.status ?? 1);
  }

  console.log('');
}

console.log('✅ Snapshot instalado, sync conferido e verify:tokens passou.');
