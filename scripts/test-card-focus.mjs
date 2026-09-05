#!/usr/bin/env node
// Verifica pixels fora do Card: opacity computada não prova foco visível.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const root = path.resolve(import.meta.dirname, '..');
const artifactsIndex = process.argv.indexOf('--artifacts');
const artifacts = artifactsIndex < 0 ? null : path.resolve(process.argv[artifactsIndex + 1]);
const baseline = process.argv.includes('--baseline');
const baselineCss = baseline ? execFileSync('git', ['show', 'HEAD:css/components/card.css'], { cwd: root }) : null;
const fixture = (tag, selected, mode) => `<!doctype html><html lang="pt-BR" data-mode="${mode}"><head>
  <meta charset="utf-8"><title>Regressão de foco Card</title><link rel="icon" href="data:,">
  <link rel="stylesheet" href="/css/design-system.css">
  <style>body { margin: 0; padding: 20px; background: var(--ds-card-bg-default); }
  #sample { padding: 12px; width: 280px; }
  .ds-card { width: 100%; text-align: left; text-decoration: none; }
  .ds-card__media { background: var(--ds-card-interactive-border-color-selected); }
  .ds-card__media img { display: block; }
  </style></head><body><main id="sample">
  <${tag} class="ds-card ds-card--interactive${selected ? ' ds-card--selected' : ''}"
    ${tag === 'button' ? `type="button" aria-pressed="${selected}"` : 'href="#destination"'}>
    <span class="ds-card__media"><img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Crect width='300' height='150' fill='orange'/%3E%3C/svg%3E"></span>
    <span class="ds-card__container"><span class="ds-card__header"><span class="ds-card__title">Configurações</span></span>
    <span class="ds-card__body">Acesso da organização.</span></span>
  </${tag}>
  </main><p id="destination">Destino</p></body></html>`;

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/') {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end(fixture(url.searchParams.get('tag'), url.searchParams.get('selected') === 'true', url.searchParams.get('mode')));
      return;
    }
    const file = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    response.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : 'application/octet-stream');
    response.end(baselineCss && url.pathname === '/css/components/card.css' ? baselineCss : await readFile(file));
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
const results = [];
const surfaces = new Map();
try {
  browser = await chromium.launch();
  if (artifacts) await mkdir(artifacts, { recursive: true });
  for (const mode of ['light', 'dark']) for (const width of [320, 1280]) {
    for (const tag of ['button', 'a']) for (const selected of [false, true]) {
      const page = await browser.newPage({ viewport: { width, height: 720 }, colorScheme: mode, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
      await page.goto(`http://127.0.0.1:${server.address().port}/?tag=${tag}&selected=${selected}&mode=${mode}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const card = page.locator('.ds-card');
      const surface = await card.evaluate(node => ({ mode: document.documentElement.dataset.mode, color: getComputedStyle(node).backgroundColor }));
      assert.equal(surface.mode, mode);
      const surfaceKey = `${width}-${tag}-${selected}`;
      if (mode === 'light') surfaces.set(surfaceKey, surface.color);
      else assert.notEqual(surface.color, surfaces.get(surfaceKey), 'O tema dark deve alterar a superfície realmente renderizada');
      const box = await card.boundingBox();
      const before = await page.screenshot();
      await page.keyboard.press('Tab');
      assert(await card.evaluate(node => node === document.activeElement && node.matches(':focus-visible')), 'Tab deve focar o Card');
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const after = await page.screenshot();
      const geometry = await card.evaluate(node => {
        const own = getComputedStyle(node), ring = getComputedStyle(node, '::after');
        return { outerInset: parseFloat(ring.left) + parseFloat(own.borderLeftWidth), width: parseFloat(ring.borderLeftWidth) };
      });
      const first = PNG.sync.read(before), second = PNG.sync.read(after);
      const sides = { top: 0, right: 0, bottom: 0, left: 0 };
      for (let y = Math.floor(box.y - 6); y < box.y + box.height + 6; y++) {
        for (let x = Math.floor(box.x - 6); x < box.x + box.width + 6; x++) {
          if (x < 0 || y < 0 || x >= first.width || y >= first.height) continue;
          const index = (y * first.width + x) * 4;
          const changed = [0, 1, 2].some(channel => first.data[index + channel] !== second.data[index + channel]);
          if (!changed) continue;
          if (y < box.y) sides.top++;
          if (x >= box.x + box.width) sides.right++;
          if (y >= box.y + box.height) sides.bottom++;
          if (x < box.x) sides.left++;
        }
      }
      const name = `${mode}-${width}-${tag}-${selected ? 'selected' : 'default'}`;
      if (Object.values(sides).some(count => count <= 30)) {
        console.error(await card.evaluate(node => {
          const own = getComputedStyle(node), ring = getComputedStyle(node, '::after');
          return { active: document.activeElement === node, documentFocus: document.hasFocus(), focused: node.matches(':focus-visible'), overflow: own.overflow, opacity: ring.opacity, inset: ring.inset, border: ring.border, display: ring.display, visibility: ring.visibility, content: ring.content };
        }));
      }
      if (artifacts) {
        await writeFile(path.join(artifacts, `${name}-before.png`), before);
        await writeFile(path.join(artifacts, `${name}-focus.png`), after);
      }
      for (const [side, count] of Object.entries(sides)) assert(count > 30, `${name}: foco recortado no lado ${side} (${count} pixels)`);
      assert.equal(geometry.outerInset, -2 * geometry.width, `${name}: a borda do Card não deve consumir o afastamento do foco`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false, `${name}: overflow horizontal`);
      assert.deepEqual(errors, [], `${name}: erros de carregamento`);
      const media = await page.locator('.ds-card__media').evaluate(node => {
        const style = getComputedStyle(node);
        return { radius: parseFloat(style.borderTopLeftRadius), overflow: style.overflow };
      });
      assert(media.radius > 0 && media.overflow === 'hidden', `${name}: a mídia deve manter cantos arredondados e recorte próprio`);
      results.push({ name, sides, media, overflow, surface, geometry });
      await page.close();
    }
  }
  if (artifacts) await writeFile(path.join(artifacts, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`✅ Card: foco externo visível nos quatro lados em ${results.length} cenários (button/link, selected, light/dark, 320/1280).`);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
