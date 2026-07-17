#!/usr/bin/env node
/**
 * test-api-runtime.mjs — contrato de runtime em docs/api/components.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RUNTIME_BY_SLUG } from './lib/component-catalog.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

console.log('\n═══ test-api-runtime ════════════════════════');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const api = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'api', 'components.json'), 'utf8'));

expect(Array.isArray(api.runtimeModules), 'components.json must expose runtimeModules.');
expect(
  api.runtimeModules.length === Object.keys(RUNTIME_BY_SLUG).length,
  'runtimeModules must contain every runtime from the canonical catalog.',
);

const bySlug = new Map(api.components.map((c) => [c.slug, c]));
const runtimeSlugs = Object.keys(RUNTIME_BY_SLUG);

for (const slug of runtimeSlugs) {
  expect(bySlug.get(slug)?.runtime?.level === 'required', `${slug} runtime.level must be required.`);
}

for (const [slug, component] of bySlug) {
  if (runtimeSlugs.includes(slug)) continue;
  expect(component.runtime == null, `${slug} must not declare runtime module.`);
}

for (const mod of api.runtimeModules) {
  const exportKey = `./${mod.module.replace('ds-tis/', '')}`;
  expect(pkg.exports[exportKey], `package.json must export ${exportKey} for ${mod.module}.`);
  expect(typeof mod.init === 'string' && mod.init.length > 0, `${mod.module} must declare init function.`);
  expect(typeof mod.destroy === 'string' && mod.destroy.length > 0, `${mod.module} must declare destroy function.`);
  expect(Array.isArray(mod.exports) && mod.exports.includes(mod.init), `${mod.module} exports must include ${mod.init}.`);
  expect(mod.exports.includes(mod.destroy), `${mod.module} exports must include ${mod.destroy}.`);
  expect(Array.isArray(mod.events) && mod.events.length > 0, `${mod.module} must declare public events.`);
}

expect(
  JSON.stringify(api.runtimeModules) === JSON.stringify(Object.values(RUNTIME_BY_SLUG)),
  'runtimeModules must preserve the canonical runtime contract without a parallel list.',
);

if (errors.length === 0) {
  console.log('✅ PASS — API runtime contract is aligned');
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}`);
process.exit(1);
