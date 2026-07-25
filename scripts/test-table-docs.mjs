#!/usr/bin/env node
/**
 * Contrato focado da Table: snapshot, tokens, CSS e documentação.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const snapshotPath = path.join(ROOT, '.figma-snapshot.json');
const snapshot = !process.env.DS_TABLE_TEST_NO_SNAPSHOT && fs.existsSync(snapshotPath)
  ? JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
  : null;
const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens', 'component', 'table.json'), 'utf8'));
const css = fs.readFileSync(path.join(ROOT, 'css', 'components', 'table.css'), 'utf8');
const docs = fs.readFileSync(path.join(ROOT, 'docs', 'table.html'), 'utf8');
const generatedCss = [
  'foundation.css',
  'theme-light.css',
  'component.css',
].map((file) => fs.readFileSync(path.join(ROOT, 'css', 'tokens', 'generated', file), 'utf8')).join('\n');
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function flattenTokens(node, parts = [], output = new Map()) {
  for (const [key, value] of Object.entries(node || {})) {
    if (value && typeof value === 'object' && '$value' in value) {
      output.set([...parts, key].join('/'), value);
    } else if (value && typeof value === 'object') {
      flattenTokens(value, [...parts, key], output);
    }
  }
  return output;
}

const tokenMap = flattenTokens(tokens.component.table);
const figmaVariables = snapshot ? Object.values(snapshot.variables)
  .filter((variable) => variable.name.startsWith('table/'))
  .sort((a, b) => a.name.localeCompare(b.name)) : [];
const figmaMap = new Map(figmaVariables.map((variable) => [variable.name.slice('table/'.length), variable]));

function resolveFigmaValue(variableId, seen = new Set()) {
  if (seen.has(variableId)) throw new Error(`Alias circular no snapshot: ${variableId}`);
  seen.add(variableId);
  const variable = snapshot.variables[variableId];
  if (!variable) throw new Error(`Variable ausente no snapshot: ${variableId}`);
  const modeValue = Object.values(variable.valuesByMode)[0];
  if (modeValue?.type === 'VARIABLE_ALIAS') return resolveFigmaValue(modeValue.id, seen);
  return { value: modeValue, type: variable.resolvedType };
}

function toCssValue({ value, type }) {
  if (type === 'FLOAT') return `${value}px`;
  if (type === 'COLOR') {
    const alpha = value.a ?? 1;
    return `rgba(${Math.round(value.r * 255)}, ${Math.round(value.g * 255)}, ${Math.round(value.b * 255)}, ${alpha})`;
  }
  return JSON.stringify(value);
}

expect(tokenMap.size === 40, `Table deve ter 40 tokens Component; encontrados ${tokenMap.size}.`);
if (snapshot) expect(figmaMap.size === 40, `Snapshot deve ter 40 variables table/*; encontradas ${figmaMap.size}.`);

for (const [name, token] of tokenMap) {
  const figmaVariable = figmaMap.get(name);
  if (snapshot) expect(Boolean(figmaVariable), `Token component.table.${name.replaceAll('/', '.')} não existe no snapshot.`);
  expect(
    typeof token.$value === 'string' && token.$value.startsWith('{semantic.'),
    `Token ${name} precisa aliasar Semantic.`,
  );
  if (!snapshot || !figmaVariable) continue;
  const modeValue = Object.values(figmaVariable.valuesByMode)[0];
  const figmaAlias = modeValue?.type === 'VARIABLE_ALIAS' ? snapshot.variables[modeValue.id]?.name : null;
  const jsonAlias = token.$value.slice(1, -1).replace(/^semantic\./, '').replaceAll('.', '/');
  expect(figmaAlias === jsonAlias, `${name}: JSON → ${jsonAlias}; Figma → ${figmaAlias || 'valor cru'}.`);
  expect(Boolean(figmaVariable.codeSyntax?.WEB), `${figmaVariable.name} precisa de WEB code syntax.`);
}

if (snapshot) {
  for (const name of figmaMap.keys()) {
    expect(tokenMap.has(name), `Variable table/${name} do snapshot não foi espelhada no JSON.`);
  }
}

expect(!/(?:^|[^\w-])-?\d*\.?\d+(?:px|rem)\b/i.test(css), 'Table CSS não pode conter hardcodes px/rem.');
expect(!/var\(--ds-(?:color|dimension|radius-|opacity-|border-width-)/.test(css), 'Table CSS não pode consumir Foundation.');
expect(css.includes('.ds-table'), 'Table precisa ser uma classe pública.');
expect(css.includes('.ds-table__row'), 'Row precisa ser uma parte pública.');
expect(css.includes('.ds-table__cell'), 'Cell precisa ser uma parte pública.');
expect(css.includes('.ds-table__sort:focus-visible::after'), 'Sort precisa de Focus Ring dedicado.');
expect(css.includes('var(--ds-focus-ring-color-default)') && css.includes('var(--ds-focus-ring-width)'), 'Focus Ring precisa usar tokens Component.');

for (const fragment of [
  '<table class="ds-table',
  '<caption class="ds-table__caption"',
  '<thead class="ds-table__header"',
  '<tbody class="ds-table__body"',
  '<tr class="ds-table__row"',
  '<th class="ds-table__header-cell"',
  '<td class="ds-table__cell"',
  'scope="col"',
  'aria-sort="none"',
]) {
  expect(docs.includes(fragment), `Docs precisam usar anatomia HTML nativa: ${fragment}.`);
}

expect(!/<[^>]+\brole="grid"/i.test(docs), 'Table de apresentação não pode usar role=grid.');
expect(docs.includes('../css/components/table.css'), 'Docs precisam carregar table.css enquanto o index compartilhado está fora do escopo.');
expect(
  (docs.match(/<span class="ds-button__label">Abrir<\/span>/g) || []).length === 2,
  'Buttons compostos na Table precisam usar a anatomia pública completa.',
);
expect(
  (docs.match(/class="ds-checkbox__content"/g) || []).length === 2
    && (docs.match(/class="ds-checkbox__label ds-sr-only"/g) || []).length === 2,
  'Checkboxes compostos na Table precisam usar a anatomia pública completa.',
);
for (const publicPart of ['Table', 'Table/Header Row', 'Table/Header Cell', 'Table/Row', 'Table/Cell']) {
  expect(docs.includes(`<code>${publicPart}</code>`), `Docs precisam publicar ${publicPart}.`);
}
expect(docs.indexOf('Small') < docs.indexOf('Medium'), 'Sizes precisam aparecer na ordem Small → Medium.');

async function verifyGeometry() {
  const tokenStyles = snapshot
    ? figmaVariables.map((variable) => {
      const customProperty = variable.codeSyntax.WEB.match(/--ds-[\w-]+/)?.[0];
      return `${customProperty}: ${toCssValue(resolveFigmaValue(variable.id))};`;
    }).join('\n')
    : generatedCss;
  const styleSource = snapshot ? `:root { ${tokenStyles} }` : tokenStyles;
  const fixture = docs
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace('</head>', `<style>${styleSource}\n${css}</style></head>`);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.setContent(fixture, { waitUntil: 'domcontentloaded' });
    const table = page.locator('table.ds-table').first();
    const measure = async (size) => {
      await table.evaluate((node, targetSize) => node.classList.toggle('ds-table--md', targetSize === 'md'), size);
      return table.evaluate((node) => ({
        header: node.querySelector('thead tr').getBoundingClientRect().height,
        rows: [...node.querySelectorAll('tbody tr')].map((row) => row.getBoundingClientRect().height),
      }));
    };
    const small = await measure('sm');
    const medium = await measure('md');
    expect(small.header === 40, `Header Small deve medir 40px; mediu ${small.header}px.`);
    expect(small.rows.every((height) => height === 40), `Rows Small devem medir 40px; mediram ${small.rows.join(', ')}px.`);
    expect(medium.header === 48, `Header Medium deve medir 48px; mediu ${medium.header}px.`);
    expect(medium.rows.every((height) => height === 48), `Rows Medium devem medir 48px; mediram ${medium.rows.join(', ')}px.`);
  } finally {
    await browser.close();
  }
}

await verifyGeometry();

if (errors.length) {
  console.error(`❌ FAIL — ${errors.length} issue(s)`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

const source = snapshot ? 'snapshot' : 'tokens commitados';
console.log(`✅ PASS — Table alinhada a ${tokenMap.size} tokens do ${source} e à semântica HTML nativa.`);
