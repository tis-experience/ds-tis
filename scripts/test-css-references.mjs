#!/usr/bin/env node
/**
 * CSS reference resolution test — pega refs órfãos.
 *
 * Verifica em todos `var(--ds-X)` em:
 *   - `css/components/*.css`     (consumidores diretos)
 *   - `css/base/*.css`           (consumidores base)
 *   - `css/utilities/*.css`      (utility classes)
 *   - `css/tokens/index.css`     (manifest manual)
 *   - docs/HTML files            (CSS inline + tabelas, exclui changelog/llms)
 *   - `docs/layout.css`          (CSS shared do site)
 *
 * Cada `var(--ds-X)` precisa existir em `css/tokens/generated/*.css`.
 *
 * Também verifica `@import` em css/ — todos os arquivos importados existem.
 *
 * Pega o bug do `@import 'generated/component.css'` (deletado em 0.7.0).
 *
 * Saída: imprime refs órfãos, exit code 1.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

// ──────────────────────────────────────────────────────────────────
// 1. Build set of valid CSS variables (from generated CSS)
// ──────────────────────────────────────────────────────────────────

const validVars = new Set();
const generatedDir = path.join(ROOT, 'css', 'tokens', 'generated');
for (const f of fs.readdirSync(generatedDir)) {
  if (!f.endsWith('.css')) continue;
  const content = fs.readFileSync(path.join(generatedDir, f), 'utf-8');
  for (const m of content.matchAll(/^\s+(--ds-[a-z0-9-]+)\s*:/gm)) {
    validVars.add(m[1]);
  }
}

console.log(`\n═══ test-css-references ══════════════════════`);
console.log(`Valid CSS vars (Foundation + Semantic + Component): ${validVars.size}`);

// ──────────────────────────────────────────────────────────────────
// 2. Check var() refs in CSS files
// ──────────────────────────────────────────────────────────────────

const cssFiles = execSync('find css -name "*.css" -type f -not -path "css/tokens/generated/*"',
  { cwd: ROOT }).toString().trim().split('\n').filter(Boolean);

for (const file of cssFiles) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf-8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*[,)]/g)) {
      if (!validVars.has(m[1])) {
        errors.push(`[orphan-css-ref] ${file}:${i + 1} → ${m[1]}`);
      }
    }
  }
}

// ──────────────────────────────────────────────────────────────────
// 3. Check @import paths in CSS files
// ──────────────────────────────────────────────────────────────────

for (const file of cssFiles) {
  const fullPath = path.join(ROOT, file);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const dir = path.dirname(fullPath);
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/@import\s+['"]([^'"]+)['"]/);
    if (!m) continue;
    const importPath = m[1];
    if (importPath.startsWith('http')) continue; // remote imports ok
    const resolved = path.resolve(dir, importPath);
    if (!fs.existsSync(resolved)) {
      errors.push(`[broken-import] ${file}:${i + 1} → ${importPath} (resolved: ${path.relative(ROOT, resolved)})`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────
// 4. Check var() refs in docs/**/*.html (CSS inline) and docs/layout.css
//    Skip: changelog.html, decisions/*.html, llms-full.txt, api/*.json
//    Skip: refs that appear ONLY inside <pre>/<code> (visual examples)
// ──────────────────────────────────────────────────────────────────

const docFiles = execSync(
  'find docs -name "*.html" -type f -not -path "docs/decisions/*" ' +
  '-not -name "changelog.html" -not -name "llms-full.txt"',
  { cwd: ROOT }
).toString().trim().split('\n').filter(Boolean);
docFiles.push('docs/layout.css');
// Root index.html — landing page com style inline (badge de versão).
// Foi pulado anteriormente; agora incluído pra pegar refs órfãos lá também.
docFiles.push('index.html');

for (const file of docFiles) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, 'utf-8');

  // Strip <pre>...</pre> and <code>...</code> blocks (visual examples — refs
  // there are descriptive, not active styles)
  const stripped = content
    .replace(/<pre[^>]*>[\s\S]*?<\/pre>/g, '')
    .replace(/<code[^>]*>[\s\S]*?<\/code>/g, '');

  const lines = stripped.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*[,)]/g)) {
      if (!validVars.has(m[1])) {
        errors.push(`[orphan-html-ref] ${file}:${i + 1} → ${m[1]}`);
      }
    }
  }
}

// ──────────────────────────────────────────────────────────────────
// Report
// ──────────────────────────────────────────────────────────────────

console.log(`Files scanned: ${cssFiles.length} CSS + ${docFiles.length} docs\n`);

if (errors.length === 0) {
  console.log(`✅ PASS — 0 refs órfãos`);
  process.exit(0);
} else {
  // Group by error type
  const byType = {};
  for (const e of errors) {
    const tag = e.match(/^\[(.+?)\]/)?.[1] || 'other';
    byType[tag] = (byType[tag] || 0) + 1;
  }
  console.log(`❌ FAIL — ${errors.length} ref(s) inválida(s):`);
  for (const [tag, n] of Object.entries(byType)) console.log(`  ${tag}: ${n}`);
  console.log();
  for (const e of errors.slice(0, 50)) console.log(`  ${e}`);
  if (errors.length > 50) console.log(`  ... e mais ${errors.length - 50} erros`);
  process.exit(1);
}
