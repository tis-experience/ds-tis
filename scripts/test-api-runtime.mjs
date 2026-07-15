#!/usr/bin/env node
/**
 * test-api-runtime.mjs — contrato de runtime em docs/api/components.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

console.log('\n═══ test-api-runtime ════════════════════════');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const api = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'api', 'components.json'), 'utf8'));

expect(Array.isArray(api.runtimeModules), 'components.json must expose runtimeModules.');
expect(api.runtimeModules.length === 3, 'runtimeModules must list combobox, modal and menu.');

const bySlug = new Map(api.components.map((c) => [c.slug, c]));

expect(bySlug.get('combobox')?.runtime?.level === 'required', 'combobox runtime.level must be required.');
expect(bySlug.get('modal')?.runtime?.level === 'optional', 'modal runtime.level must be optional.');
expect(bySlug.get('menu')?.runtime?.level === 'optional', 'menu runtime.level must be optional.');

for (const [slug, component] of bySlug) {
  if (['combobox', 'modal', 'menu'].includes(slug)) continue;
  expect(component.runtime == null, `${slug} must not declare runtime module.`);
}

for (const mod of api.runtimeModules) {
  const exportKey = `./${mod.module.replace('ds-tis/', '')}`;
  expect(pkg.exports[exportKey], `package.json must export ${exportKey} for ${mod.module}.`);
  expect(typeof mod.init === 'string' && mod.init.length > 0, `${mod.module} must declare init function.`);
  expect(Array.isArray(mod.exports) && mod.exports.includes(mod.init), `${mod.module} exports must include ${mod.init}.`);
}

if (errors.length === 0) {
  console.log('✅ PASS — API runtime contract is aligned');
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}`);
process.exit(1);
