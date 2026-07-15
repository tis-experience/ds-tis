#!/usr/bin/env node
/**
 * test-interactive.mjs — contrato dos módulos JS opt-in (Modal, Menu, Combobox).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { initComboboxes } from '../js/combobox.js';
import { initModals, openModal, closeModal } from '../js/modal.js';
import { initActionMenus, openActionMenu, closeActionMenu } from '../js/menu.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

console.log('\n═══ test-interactive ═══════════════════════');

expect(typeof initComboboxes === 'function', 'initComboboxes must be exported.');
expect(typeof initModals === 'function', 'initModals must be exported.');
expect(typeof openModal === 'function', 'openModal must be exported.');
expect(typeof closeModal === 'function', 'closeModal must be exported.');
expect(typeof initActionMenus === 'function', 'initActionMenus must be exported.');
expect(typeof openActionMenu === 'function', 'openActionMenu must be exported.');
expect(typeof closeActionMenu === 'function', 'closeActionMenu must be exported.');

for (const subpath of ['./modal', './menu', './combobox']) {
  expect(pkg.exports[subpath], `package.json must export ${subpath}.`);
}

for (const file of ['js/modal.js', 'js/menu.js']) {
  expect(fs.existsSync(path.join(ROOT, file)), `${file} must exist.`);
}

if (errors.length === 0) {
  console.log('✅ PASS — interactive modules contract is aligned');
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}`);
process.exit(1);
