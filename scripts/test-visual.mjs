#!/usr/bin/env node
/**
 * test-visual.mjs — visual regression testing via Playwright + pixelmatch.
 *
 * Captura screenshot full-page de cada documentação (light + dark) e compara
 * com baseline em `tests/visual/baseline/`. Se diff > THRESHOLD, falha e
 * grava imagem de diff em `tests/visual/diff/` (gitignored).
 *
 * Threshold: 0.5% de pixels com diferença significativa. Permite micro-
 * variações de antialiasing/font rendering, bloqueia mudanças visuais reais.
 *
 * Uso:
 *   node scripts/test-visual.mjs                  # full scan, falha em diff
 *   node scripts/test-visual.mjs --update         # regenera baseline
 *   node scripts/test-visual.mjs --filter button  # filtra por nome
 *   node scripts/test-visual.mjs --mode light     # só um modo
 *
 * Atenção: baseline images são versionadas em git. A referência canônica é o
 * rendering Linux do GitHub Actions; ao atualizar em outro SO, valide que o
 * diff não é apenas variação de fonte/rasterização antes de commitar.
 */

import { chromium } from 'playwright';
import { readdirSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(n); return i !== -1 && args[i + 1] ? args[i + 1] : null; };
const filter = arg('--filter');
const modeArg = arg('--mode');
const updateBaseline = args.includes('--update');

const ROOT = path.resolve(import.meta.dirname, '..');
const BASELINE_DIR = path.join(ROOT, 'tests/visual/baseline');
const ACTUAL_DIR = path.join(ROOT, 'tests/visual/actual');
const DIFF_DIR = path.join(ROOT, 'tests/visual/diff');

// Threshold: ratio de pixels diferentes que ainda passa.
// 0.005 = 0.5% — tolera anti-aliasing sub-pixel, bloqueia mudanças de cor/layout.
const THRESHOLD = 0.005;
// Pixelmatch threshold: 0..1 em diferença de cor. 0.1 ignora pequenas variações.
const PIXEL_THRESHOLD = 0.1;

// Páginas testadas: componentes + foundations (skip ADRs e docs estáticos).
function shouldTest(file) {
  if (file === 'index.html') return true;
  if (!file.startsWith('docs/')) return false;
  const name = path.basename(file, '.html');
  // Componentes (18) + foundations (10) + índices visuais relevantes.
  // Skip docs com pouco visual/dependentes de markdown gerado.
  const skip = ['changelog', 'backlog', 'process-contributing', 'process-releasing', 'process-versioning',
                'brand-principles', 'design-principles', 'control-sizing', 'token-architecture',
                'tokens-sync', 'theming'];
  return !skip.includes(name);
}

mkdirSync(BASELINE_DIR, { recursive: true });
mkdirSync(ACTUAL_DIR, { recursive: true });
mkdirSync(DIFF_DIR, { recursive: true });

const allPages = ['index.html', ...readdirSync(path.join(ROOT, 'docs'))
  .filter(f => f.endsWith('.html'))
  .map(f => `docs/${f}`)];

const pages = allPages.filter(shouldTest).filter(p => !filter || p.includes(filter));

if (pages.length === 0) {
  console.error('Nenhuma página pra testar.');
  process.exit(2);
}

const modes = modeArg ? [modeArg] : ['light', 'dark'];

console.log(`═══ test-visual ═══════════════════════════════════════`);
console.log(`Páginas: ${pages.length} × modos: ${modes.length} = ${pages.length * modes.length} screenshots`);
console.log(`Threshold: ${THRESHOLD * 100}% pixel diff (pixel-level threshold ${PIXEL_THRESHOLD})`);
if (updateBaseline) console.log(`⚠️  Modo --update: regenerando baseline`);
console.log('');

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();

// Silencia logs/erros da página
page.on('pageerror', () => {});
page.on('console', () => {});

const results = { pass: 0, fail: 0, baseline: 0, errored: [] };

for (const file of pages) {
  for (const mode of modes) {
    const slug = file.replace(/\//g, '-').replace('.html', '');
    const name = `${slug}-${mode}.png`;
    const baselinePath = path.join(BASELINE_DIR, name);
    const actualPath = path.join(ACTUAL_DIR, name);
    const diffPath = path.join(DIFF_DIR, name);

    process.stdout.write(`  ${file} (${mode}) ... `);

    try {
      await page.goto(`file://${path.join(ROOT, file)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate((m) => document.documentElement.dataset.mode = m, mode);
      // Aguarda fontes carregarem pra screenshot estável
      await page.evaluate(() => document.fonts && document.fonts.ready);
      await page.waitForTimeout(300);
      // Esconde elementos animados (spinners, skeletons) pra evitar flakiness
      await page.addStyleTag({ content: `
        .ds-spinner, .ds-skeleton { animation: none !important; }
        * { caret-color: transparent !important; }
      ` });
      await page.waitForTimeout(50);

      const buf = await page.screenshot({ fullPage: true });
      writeFileSync(actualPath, buf);

      if (updateBaseline || !existsSync(baselinePath)) {
        writeFileSync(baselinePath, buf);
        console.log(updateBaseline ? '🔄 baseline atualizado' : '✨ baseline criado');
        results.baseline++;
        continue;
      }

      // Compare
      const baselinePng = PNG.sync.read(readFileSync(baselinePath));
      const actualPng = PNG.sync.read(buf);
      // Sizes diferentes = falha imediata
      if (baselinePng.width !== actualPng.width || baselinePng.height !== actualPng.height) {
        console.log(`❌ FAIL — tamanho mudou (${baselinePng.width}x${baselinePng.height} → ${actualPng.width}x${actualPng.height})`);
        results.fail++;
        // Também gera diff visual de tamanho mínimo pra inspeção
        writeFileSync(diffPath, buf);
        continue;
      }
      const { width, height } = baselinePng;
      const diff = new PNG({ width, height });
      const diffPixels = pixelmatch(
        baselinePng.data, actualPng.data, diff.data,
        width, height, { threshold: PIXEL_THRESHOLD }
      );
      const diffRatio = diffPixels / (width * height);

      if (diffRatio > THRESHOLD) {
        writeFileSync(diffPath, PNG.sync.write(diff));
        console.log(`❌ FAIL — ${(diffRatio * 100).toFixed(2)}% diff (${diffPixels} px)`);
        results.fail++;
      } else {
        console.log(`✅ ${diffPixels === 0 ? '0 diff' : `${(diffRatio * 100).toFixed(3)}% diff (within tolerance)`}`);
        results.pass++;
      }
    } catch (e) {
      console.log(`⚠️ ERROR — ${e.message}`);
      results.errored.push({ file, mode, error: e.message });
    }
  }
}

await browser.close();

console.log('');
console.log(`Pass: ${results.pass}  ·  Fail: ${results.fail}  ·  Baseline: ${results.baseline}  ·  Errored: ${results.errored.length}`);

if (results.fail > 0) {
  console.error(`\n❌ FAIL — ${results.fail} regressão(ões) visual(is). Veja diff em tests/visual/diff/`);
  console.error(`Se a mudança é intencional: rode \`npm run test:visual -- --update\` pra atualizar baseline.`);
  process.exit(1);
} else if (results.errored.length > 0) {
  console.error(`\n⚠️ ${results.errored.length} erro(s) durante captura — investigar`);
  process.exit(2);
} else if (results.baseline > 0 && !updateBaseline) {
  console.log(`\n✨ ${results.baseline} baseline(s) criado(s) — commit em tests/visual/baseline/`);
  process.exit(0);
} else {
  console.log(`\n✅ PASS — 0 regressões visuais`);
  process.exit(0);
}
