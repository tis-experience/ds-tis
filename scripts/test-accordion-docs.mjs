#!/usr/bin/env node
/**
 * Accordion docs/behavior contract.
 *
 * Guards the Figma -> repo handoff for the public Accordion API:
 * - Figma property is Title, not Label.
 * - Content Slot is documented.
 * - Docs examples expose data-state and optional single mode.
 * - The docs runtime synchronizes aria-expanded, hidden, and data-state.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = fs.readFileSync(path.join(ROOT, 'docs', 'accordion.html'), 'utf-8');
const js = fs.readFileSync(path.join(ROOT, 'js', 'main.js'), 'utf-8');
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

console.log('\n═══ test-accordion-docs ═════════════════════');

expect(docs.includes('<code>Title</code>'), 'Accordion docs must expose Figma property Title.');
expect(!docs.includes('<code>Label</code>'), 'Accordion docs must not expose Label as a public Figma property.');
expect(docs.includes('<code>Content Slot</code>'), 'Accordion docs must document Content Slot.');
expect(docs.includes('data-accordion-mode="single"'), 'Accordion examples must document optional single mode.');
expect(docs.includes('data-state="open"') && docs.includes('data-state="closed"'), 'Accordion examples must include open/closed data-state.');
expect(docs.includes('<code>aria-expanded</code>') && docs.includes('<code>hidden</code>'), 'Accordion behavior docs must explain aria-expanded and hidden.');

expect(js.includes('function initAccordions()'), 'Accordion behavior initializer is missing.');
expect(js.includes("querySelectorAll('.ds-accordion')"), 'Accordion initializer must target .ds-accordion.');
expect(js.includes("trigger.setAttribute('aria-expanded', String(expanded))"), 'Accordion initializer must sync aria-expanded.');
expect(js.includes('panel.hidden = !expanded'), 'Accordion initializer must sync panel hidden state.');
expect(js.includes("item.setAttribute('data-state', expanded ? 'open' : 'closed')"), 'Accordion initializer must sync data-state.');
expect(js.includes("accordion.getAttribute('data-accordion-mode') === 'single'"), 'Accordion initializer must support single mode.');
expect(js.includes('initAccordions();'), 'Accordion initializer must run on DOMContentLoaded.');

if (errors.length === 0) {
  console.log('✅ PASS — Accordion docs and behavior contract are aligned');
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}`);
process.exit(1);
