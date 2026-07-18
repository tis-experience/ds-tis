#!/usr/bin/env node
/**
 * Protege a distribuição machine-readable e o contrato responsivo consumido
 * por ferramentas, agents IA e projetos instalados.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  COMPONENTS,
  RESPONSIVE_CONTRACT,
  RESPONSIVE_PROFILES,
  RUNTIME_BY_SLUG,
  responsiveFor,
} from './lib/component-catalog.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

console.log('\n═══ test-consumer-context ═══════════════════');

const pkg = readJson('package.json');
const context = readJson('docs/api/consumer-context.json');
const componentsApi = readJson('docs/api/components.json');

expect(context.schema === 'ds-tis/consumer-context', 'consumer-context must expose the canonical schema.');
expect(context.schemaVersion === 1, 'consumer-context schemaVersion must be 1.');
expect(context.version === pkg.version, 'consumer-context version must match package.json.');
expect(context.package === pkg.name, 'consumer-context package must match package.json.');
expect(
  JSON.stringify(context.responsive) === JSON.stringify(RESPONSIVE_CONTRACT),
  'consumer-context responsive contract must match the canonical catalog.',
);
expect(
  JSON.stringify(componentsApi.responsiveContract) === JSON.stringify(RESPONSIVE_CONTRACT),
  'components API responsiveContract must match the canonical catalog.',
);
expect(
  JSON.stringify(componentsApi.responsiveProfiles) === JSON.stringify(RESPONSIVE_PROFILES),
  'components API must publish every canonical responsive profile.',
);
expect(RESPONSIVE_CONTRACT.publicBreakpoints.length === 0, 'DS must not imply public automatic breakpoints.');

const publishedBySlug = new Map(componentsApi.components.map((component) => [component.slug, component]));
for (const component of COMPONENTS) {
  expect(
    JSON.stringify(publishedBySlug.get(component.slug)?.responsive) === JSON.stringify(responsiveFor(component)),
    `${component.slug}: published responsive profile must match responsiveFor(catalog).`,
  );
}

for (const [slug, runtime] of Object.entries(RUNTIME_BY_SLUG)) {
  expect(context.entrypoints.runtimes?.[slug] === runtime.module, `${slug}: consumer context runtime entrypoint drift.`);
}

const exportTargets = {
  './metadata': './docs/api/consumer-context.json',
  './metadata/components': './docs/api/components.json',
  './metadata/tokens': './docs/api/tokens.json',
  './metadata/foundations': './docs/api/foundations.json',
  './metadata/adrs': './docs/api/adrs.json',
  './agent-guide': './docs/agent-consumer-usage.md',
  './llms': './docs/llms.txt',
  './llms-full': './docs/llms-full.txt',
};

for (const [key, target] of Object.entries(exportTargets)) {
  expect(pkg.exports?.[key] === target, `package export ${key} must target ${target}.`);
  expect(fs.existsSync(path.join(ROOT, target)), `package export ${key} target is missing (${target}).`);
  expect(pkg.files?.includes(target.replace(/^\.\//, '')), `package files must include ${target}.`);
}

if (errors.length === 0) {
  console.log(`✅ PASS — metadata instalada + ${COMPONENTS.length} perfis responsivos alinhados`);
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}`);
process.exit(1);
