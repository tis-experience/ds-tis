#!/usr/bin/env node
/**
 * test-field-docs.mjs — anatomia pública de form controls nas docs.
 *
 * AGENTS.md §4.2.1: exemplos padrão devem usar ds-field + controle,
 * não ds-input__field / ds-select__field / ds-textarea__field soltos.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function extractDefaultSubsection(html) {
  const match = html.match(
    /<h2 class="ds-subsection__title">[\s\S]*?(?:Padrão|Default)[\s\S]*?<\/h2>([\s\S]*?)(?=<div class="ds-subsection">|$)/,
  );
  return match ? match[1] : '';
}

console.log('\n═══ test-field-docs ═════════════════════════');

const pages = [
  { file: 'docs/input.html', control: 'ds-input' },
  { file: 'docs/select.html', control: 'ds-select' },
  { file: 'docs/textarea.html', control: 'ds-textarea' },
  { file: 'docs/combobox.html', control: 'ds-combobox' },
];

for (const { file, control } of pages) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const defaultSection = extractDefaultSubsection(html);

  expect(defaultSection.length > 0, `${file}: Default/Padrão subsection must exist.`);
  expect(
    defaultSection.includes('class="ds-field"') || defaultSection.includes("class='ds-field'"),
    `${file}: Default preview must wrap ${control} in .ds-field.`,
  );
  expect(
    defaultSection.includes('ds-field__label'),
    `${file}: Default example must include .ds-field__label.`,
  );
  expect(
    defaultSection.includes(`class="${control}"`) || defaultSection.includes(control),
    `${file}: Default example must include .${control}.`,
  );

  const codeMatch = defaultSection.match(/<pre[^>]*><code>([\s\S]*?)<\/code><\/pre>/);
  expect(Boolean(codeMatch), `${file}: Default subsection must include a code sample.`);
  if (codeMatch) {
    const code = codeMatch[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"');
    expect(code.includes('ds-field'), `${file}: Default code sample must include ds-field.`);
    expect(code.includes('ds-field__label'), `${file}: Default code sample must include ds-field__label.`);
  }
}

if (errors.length === 0) {
  console.log('✅ PASS — Form Field anatomy in docs is aligned');
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}`);
process.exit(1);
