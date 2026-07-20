#!/usr/bin/env node
/**
 * Combobox docs contract — Figma API, classes públicas e estados documentados.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = fs.readFileSync(path.join(ROOT, 'docs', 'combobox.html'), 'utf-8');
const anatomy = docs.match(/<div class="ds-anatomy"[\s\S]*?<div class="ds-anatomy-legend">/)?.[0] ?? '';
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

console.log('\n═══ test-combobox-docs ══════════════════════');

expect(docs.includes('API no Figma'), 'Combobox docs must include Figma API section.');
expect(docs.includes('<code>Show Label</code>'), 'Combobox Figma API must document Show Label.');
expect(docs.includes('<code>Read-only</code>'), 'Combobox Figma API must document Read-only.');
expect(docs.includes('ds-combobox--readonly'), 'Combobox docs must document readonly modifier class.');
expect(docs.includes('<code>ds-combobox__clear</code>'), 'Combobox docs must document __clear class.');
expect(docs.includes('<code>ds-combobox__icon</code>'), 'Combobox docs must document __icon class.');
expect(!docs.includes('component.combobox.gap'), 'Combobox docs must not cite stale combobox/gap tokens.');
expect((anatomy.match(/class="ds-anatomy__marker"/g) ?? []).length === 6, 'Combobox anatomy must render exactly six markers.');
for (let marker = 1; marker <= 6; marker += 1) {
  expect(anatomy.includes(`>${marker}</span>`), `Combobox anatomy must render marker ${marker}.`);
}
expect(anatomy.includes('role="combobox"'), 'Combobox anatomy input must expose role="combobox".');
expect(anatomy.includes('role="listbox"'), 'Combobox anatomy popup must expose role="listbox".');
expect(anatomy.includes('role="option"'), 'Combobox anatomy item must expose role="option".');
expect(anatomy.includes('<div class="ds-combobox-anchor">'), 'Combobox anatomy must preserve the public popup anchor.');

if (errors.length === 0) {
  console.log('✅ PASS — Combobox docs contract is aligned');
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}`);
process.exit(1);
