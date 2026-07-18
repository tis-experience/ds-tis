#!/usr/bin/env node
/**
 * Protege a documentação pública e o corpus entregue a agents consumidores.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}

console.log('\n═══ test-docs-consumption ══════════');

const bilingualPages = [
  ['docs/brand-principles.md', 'docs/brand-principles.en.md', 'docs/brand-principles.html'],
  ['docs/documentation-guidelines.md', 'docs/documentation-guidelines.en.md', 'docs/documentation-guidelines.html'],
  ['docs/agent-consumer-usage.md', 'docs/agent-consumer-usage.en.md', 'docs/agent-consumer-usage.html'],
  ['docs/process-contributing.md', 'docs/process-contributing.en.md', 'docs/process-contributing.html'],
  ['docs/process-versioning.md', 'docs/process-versioning.en.md', 'docs/process-versioning.html'],
  ['docs/process-releasing.md', 'docs/process-releasing.en.md', 'docs/process-releasing.html'],
];

for (const [ptSource, enSource, htmlPath] of bilingualPages) {
  expect(fs.existsSync(path.join(ROOT, ptSource)), `${ptSource}: fonte PT-BR ausente.`);
  expect(fs.existsSync(path.join(ROOT, enSource)), `${enSource}: fonte EN ausente.`);
  expect(fs.existsSync(path.join(ROOT, htmlPath)), `${htmlPath}: HTML gerado ausente.`);
  if (!fs.existsSync(path.join(ROOT, htmlPath))) continue;
  const html = read(htmlPath);
  expect(html.includes('data-lang="pt"'), `${htmlPath}: conteúdo PT-BR não publicado.`);
  expect(html.includes('data-lang="en"'), `${htmlPath}: conteúdo EN não publicado.`);
  expect(html.includes('id="lang-switcher"'), `${htmlPath}: seletor de idioma ausente.`);
}

const generatedHtml = [
  'docs/changelog.html',
  'docs/backlog.html',
  ...bilingualPages.map(([, , htmlPath]) => htmlPath),
  ...fs.readdirSync(path.join(ROOT, 'docs', 'decisions'))
    .filter((file) => file.endsWith('.html'))
    .map((file) => `docs/decisions/${file}`),
];

for (const htmlPath of generatedHtml) {
  const html = read(htmlPath);
  const markdownHref = html.match(/href="[^"]+\.md(?:#[^"]*)?"/i);
  expect(!markdownHref, `${htmlPath}: link público ainda aponta para Markdown (${markdownHref?.[0]}).`);
}

const brandPt = read('docs/brand-principles.md');
const brandEn = read('docs/brand-principles.en.md');
const placeholderPattern = /\[NOME|\[Uma frase|\[Princípio|\[Descrição|\[exemplo\]|\[font\]|\[hex\]|Template para ser preenchido/i;
expect(!placeholderPattern.test(brandPt), 'brand-principles.md ainda contém placeholders.');
expect(!placeholderPattern.test(brandEn), 'brand-principles.en.md ainda contém placeholders.');

const designPrinciples = read('docs/design-principles.html');
expect(!/Mude o valor do token no JSON/i.test(designPrinciples), 'design-principles ainda orienta alterar token Figma-canônico no JSON.');
expect(designPrinciples.includes('Figma Variables are the value authority'), 'design-principles EN não explica a autoridade de valor do Figma.');

const llmsFull = read('docs/llms-full.txt');
expect(!llmsFull.includes('# docs/audit-figma-2026-04-25.md'), 'llms-full inclui auditoria histórica superseded.');
expect(!llmsFull.includes('# docs/agent-consumer-usage.en.md'), 'llms-full duplica traduções EN no corpus canônico.');
expect(!placeholderPattern.test(llmsFull), 'llms-full inclui placeholders de Brand Principles.');

if (errors.length === 0) {
  console.log(`✅ PASS — ${bilingualPages.length} páginas bilíngues, links HTML e corpus IA alinhados`);
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  - ${error}`);
process.exit(1);
