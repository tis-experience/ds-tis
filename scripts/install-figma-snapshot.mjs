#!/usr/bin/env node
/**
 * install-figma-snapshot.mjs
 *
 * O plugin Figma baixa `figma-snapshot.json` (sem ponto). Os scripts do repo
 * leem `.figma-snapshot.json` (com ponto, gitignored). Este script instala o
 * export na raiz do projeto quando o designer coloca o arquivo na pasta.
 *
 * Uso:
 *   npm run figma:snapshot:install
 *   node scripts/install-figma-snapshot.mjs
 *   node scripts/install-figma-snapshot.mjs --from path/to/figma-snapshot.json
 *   node scripts/install-figma-snapshot.mjs --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fromIdx = args.indexOf('--from');
const SOURCE = path.resolve(
  ROOT,
  fromIdx !== -1 && args[fromIdx + 1] ? args[fromIdx + 1] : 'figma-snapshot.json'
);
const TARGET = path.join(ROOT, '.figma-snapshot.json');

function usage() {
  console.log(`Uso:
  npm run figma:snapshot:install
  node scripts/install-figma-snapshot.mjs [--from <caminho>] [--dry-run]

Coloque figma-snapshot.json na raiz do repo (export do plugin) e rode o comando.
`);
}

if (args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(0);
}

if (!fs.existsSync(SOURCE)) {
  console.error(`Arquivo não encontrado: ${path.relative(ROOT, SOURCE)}`);
  console.error('');
  console.error('1. Exporte pelo plugin DS Core Snapshot Exporter');
  console.error('2. Salve figma-snapshot.json na raiz deste projeto');
  console.error('3. Rode: npm run figma:snapshot:install');
  process.exit(2);
}

let snapshot;
try {
  snapshot = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
} catch (err) {
  console.error(`JSON inválido em ${path.relative(ROOT, SOURCE)}: ${err.message}`);
  process.exit(2);
}

const varCount = snapshot.variables ? Object.keys(snapshot.variables).length : 0;
const collCount = snapshot.variableCollections ? Object.keys(snapshot.variableCollections).length : 0;

if (!varCount || !collCount) {
  console.error('Snapshot inválido: faltam variableCollections ou variables.');
  process.exit(2);
}

const generatedAt = snapshot.generatedAt || '(sem generatedAt)';
const relSource = path.relative(ROOT, SOURCE);
const relTarget = path.relative(ROOT, TARGET);

if (dryRun) {
  console.log(`[dry-run] ${relSource} → ${relTarget}`);
  console.log(`  collections: ${collCount}`);
  console.log(`  variables:   ${varCount}`);
  console.log(`  generatedAt: ${generatedAt}`);
  process.exit(0);
}

if (path.resolve(SOURCE) === path.resolve(TARGET)) {
  console.log(`Snapshot já está em ${relTarget} (${varCount} variables, ${collCount} collections).`);
  process.exit(0);
}

const hadTarget = fs.existsSync(TARGET);
fs.copyFileSync(SOURCE, TARGET);

if (relSource !== relTarget && path.dirname(SOURCE) === ROOT) {
  try {
    fs.unlinkSync(SOURCE);
  } catch {
    // mantém cópia sem ponto se não puder remover
  }
}

console.log(`✅ Snapshot instalado em ${relTarget}`);
console.log(`   origem:      ${relSource}`);
console.log(`   collections: ${collCount}`);
console.log(`   variables:   ${varCount}`);
console.log(`   generatedAt: ${generatedAt}`);
if (hadTarget) console.log('   (substituiu snapshot anterior)');
console.log('');
console.log('Próximo passo automático para agentes: npm run figma:snapshot:refresh');
console.log('(ou rode sync + verify manualmente se já instalou o snapshot com ponto)');
