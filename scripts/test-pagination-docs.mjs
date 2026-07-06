#!/usr/bin/env node
/**
 * Pagination docs contract — token paths item.* e API Figma.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = fs.readFileSync(path.join(ROOT, 'docs', 'pagination.html'), 'utf-8');
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

console.log('\n═══ test-pagination-docs ════════════════════');

expect(docs.includes('API no Figma'), 'Pagination docs must include Figma API section.');
expect(docs.includes('<code>Page Number</code>'), 'Pagination Figma API must document Page Number.');
expect(docs.includes('component.pagination.item.height'), 'Pagination docs must use component.pagination.item.height.*');
expect(docs.includes('--ds-pagination-item-height-'), 'Pagination docs must reference --ds-pagination-item-height-* CSS vars.');
expect(!docs.includes('component.pagination.page.'), 'Pagination docs must not use stale component.pagination.page.* paths.');
expect(!docs.includes('--ds-pagination-page-'), 'Pagination docs must not use stale --ds-pagination-page-* CSS vars.');

if (errors.length === 0) {
  console.log('✅ PASS — Pagination docs contract is aligned');
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}`);
process.exit(1);
