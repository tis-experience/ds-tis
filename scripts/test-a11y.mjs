#!/usr/bin/env node
/**
 * test-a11y.mjs — scan WCAG 2.2 AA em todas as páginas docs via axe-core + Playwright.
 *
 * Roda contra http://localhost:8765 (sobe servidor local automaticamente).
 * Cada página é testada em light e dark mode.
 *
 * Threshold:
 *   critical | serious   → exit 1 (bloqueia CI)
 *   moderate | minor     → reporta como aviso, exit 0
 *
 * Uso:
 *   node scripts/test-a11y.mjs                     # scan completo
 *   node scripts/test-a11y.mjs --filter button     # só páginas que casam o filtro
 *   node scripts/test-a11y.mjs --mode light        # só light mode (default ambos)
 *   node scripts/test-a11y.mjs --json out.json     # dump JSON pra CI artifact
 *   node scripts/test-a11y.mjs --port 9999         # porta alternativa do server
 */

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import { readdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import net from 'node:net';

const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
};
const filter = arg('--filter');
const modeArg = arg('--mode');
const jsonOut = arg('--json');
const port = parseInt(arg('--port') || '8765', 10);
const updateBaseline = args.includes('--update-baseline');
const useServer = args.includes('--server'); // default: file:// (mais robusto em CI Linux)

const ROOT = path.resolve(import.meta.dirname, '..');
const BASELINE_PATH = path.join(ROOT, '.a11y-baseline.json');

/**
 * Cria fingerprint estável duma violação pra deduplicar entre runs.
 * Incluímos rule id, file, mode, e selector do primeiro target — suficiente
 * pra distinguir violações distintas sem ser sensível a ordem.
 */
function fingerprint(file, mode, ruleId, node) {
  const target = (node.target && node.target[0]) || '';
  return `${ruleId}|${file}|${mode}|${target}`;
}

// Wait for port to be listening
async function waitForPort(p, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await new Promise((resolve) => {
      const s = net.createConnection(p, '127.0.0.1');
      s.on('connect', () => { s.end(); resolve(true); });
      s.on('error', () => resolve(false));
    });
    if (ok) return true;
    await new Promise(r => setTimeout(r, 100));
  }
  return false;
}

// Build URL pra navegação. file:// é mais robusto em CI (sem dependência de
// servidor) — usado por padrão. --server força http.server pra debug local.
function buildUrl(file) {
  if (useServer) return `http://localhost:${port}/${file}`;
  return `file://${path.join(ROOT, file)}`;
}

// Subir servidor local só se --server explícito
let server = null;
if (useServer) {
  server = spawn('python3', ['-m', 'http.server', String(port)], {
    cwd: ROOT,
    stdio: ['ignore', 'ignore', 'pipe']
  });
  server.on('error', (e) => { console.error('server failed:', e.message); process.exit(2); });

  const ready = await waitForPort(port);
  if (!ready) {
    console.error(`Servidor não subiu na porta ${port} em 5s.`);
    server.kill();
    process.exit(2);
  }
}

let exitCode = 0;
try {
  // Listar páginas
  const allPages = ['index.html', ...readdirSync(path.join(ROOT, 'docs'))
    .filter(f => f.endsWith('.html'))
    .map(f => `docs/${f}`)];

  const pages = filter ? allPages.filter(p => p.includes(filter)) : allPages;

  if (pages.length === 0) {
    console.error(`Nenhuma página casou com --filter "${filter}"`);
    process.exit(2);
  }

  const modes = modeArg ? [modeArg] : ['light', 'dark'];

  // Launch browser
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Silencia console errors da página (não relevantes pra a11y)
  page.on('pageerror', () => {});
  page.on('console', () => {});

  const results = [];
  let runIdx = 0;
  const totalRuns = pages.length * modes.length;

  // CI runners (Linux) podem ser mais lentos que Mac local — timeout maior + retry.
  const NAV_TIMEOUT = 30000;
  const NAV_RETRIES = 2;

  for (const file of pages) {
    for (const mode of modes) {
      runIdx++;
      process.stdout.write(`\r[${runIdx}/${totalRuns}] ${file} (${mode})${' '.repeat(20)}`);
      let lastErr = null;
      let success = false;
      for (let attempt = 0; attempt <= NAV_RETRIES && !success; attempt++) {
        try {
          await page.goto(buildUrl(file), { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
          await page.evaluate((m) => document.documentElement.dataset.mode = m, mode);
          // Aguarda fontes carregarem (axe color-contrast é sensível a timing)
          // antes de capturar — sem isso, scan pode flagar contrastes
          // intermitentes durante o swap font-display.
          await page.evaluate(() => document.fonts && document.fonts.ready);
          await page.waitForTimeout(200);
          const r = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
          results.push({ file, mode, violations: r.violations });
          success = true;
        } catch (e) {
          lastErr = e;
          if (attempt < NAV_RETRIES) await page.waitForTimeout(500); // pequena pausa antes do retry
        }
      }
      if (!success) {
        results.push({ file, mode, violations: [], error: lastErr?.message || 'unknown' });
      }
    }
  }
  process.stdout.write(`\r${' '.repeat(80)}\r`);

  await browser.close();

  // Aggregate por impact
  const byImpact = { critical: [], serious: [], moderate: [], minor: [] };
  const errored = [];
  for (const { file, mode, violations, error } of results) {
    if (error) errored.push({ file, mode, error });
    for (const v of violations) {
      const impact = v.impact || 'minor';
      byImpact[impact].push({ file, mode, ...v });
    }
  }

  // Pretty print
  console.log('═══ test-a11y ═════════════════════════════════════════');
  console.log(`Páginas: ${pages.length} × modos: ${modes.length} = ${totalRuns} runs`);
  console.log(`Tags WCAG: 2A, 2AA, 2.1A, 2.1AA, 2.2AA`);
  console.log(`critical=${byImpact.critical.length}  serious=${byImpact.serious.length}  moderate=${byImpact.moderate.length}  minor=${byImpact.minor.length}`);
  if (errored.length) console.log(`⚠️  ${errored.length} run(s) com erro de carregamento`);

  for (const impact of ['critical', 'serious', 'moderate', 'minor']) {
    if (byImpact[impact].length === 0) continue;
    console.log(`\n┌ ${impact.toUpperCase()} (${byImpact[impact].length}) ─────────────────────────`);
    // Group identical violations across pages
    const grouped = {};
    for (const v of byImpact[impact]) {
      const key = `${v.id}::${v.help}`;
      if (!grouped[key]) grouped[key] = { id: v.id, help: v.help, helpUrl: v.helpUrl, occurrences: [] };
      grouped[key].occurrences.push({ file: v.file, mode: v.mode, nodes: v.nodes });
    }
    for (const g of Object.values(grouped)) {
      console.log(`  ${g.id}: ${g.help}`);
      console.log(`    Help: ${g.helpUrl}`);
      console.log(`    Ocorrências: ${g.occurrences.length}`);
      for (const occ of g.occurrences.slice(0, 3)) {
        const tgt = occ.nodes[0]?.target?.join(' ') || '?';
        console.log(`      [${occ.file} · ${occ.mode}] ${tgt}`);
      }
      if (g.occurrences.length > 3) console.log(`      ... +${g.occurrences.length - 3} mais`);
    }
  }

  if (errored.length) {
    console.log(`\n┌ ERRORS (${errored.length}) ─────────────────────────`);
    for (const e of errored) console.log(`  [${e.file} · ${e.mode}] ${e.error}`);
  }

  // JSON output (CI artifact)
  if (jsonOut) {
    const out = {
      totals: {
        pages: pages.length,
        runs: totalRuns,
        critical: byImpact.critical.length,
        serious: byImpact.serious.length,
        moderate: byImpact.moderate.length,
        minor: byImpact.minor.length,
        errors: errored.length,
      },
      byImpact,
      errored,
    };
    writeFileSync(jsonOut, JSON.stringify(out, null, 2));
    console.log(`\n📁 JSON: ${jsonOut}`);
  }

  // Build current fingerprint set (critical + serious only — moderate/minor sempre só avisam)
  const currentFingerprints = new Set();
  for (const impact of ['critical', 'serious']) {
    for (const v of byImpact[impact]) {
      for (const node of v.nodes) {
        currentFingerprints.add(fingerprint(v.file, v.mode, v.id, node));
      }
    }
  }

  // Update baseline mode — escreve fingerprints atuais como accepted
  if (updateBaseline) {
    const baseline = {
      generatedAt: '__rolling__',
      acceptedFingerprints: [...currentFingerprints].sort(),
      note: 'Violações WCAG conhecidas e aceitas como baseline. Reduzir incrementalmente. Regenerar com `npm run test:a11y -- --update-baseline` após corrigir violações.',
    };
    writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2));
    console.log(`\n📁 Baseline atualizado: .a11y-baseline.json (${currentFingerprints.size} fingerprints)`);
    process.exit(0);
  }

  // Carregar baseline e calcular delta
  let acceptedFingerprints = new Set();
  if (existsSync(BASELINE_PATH)) {
    try {
      const b = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
      acceptedFingerprints = new Set(b.acceptedFingerprints || []);
    } catch { /* ignore parse errors */ }
  }

  const newViolations = [...currentFingerprints].filter(fp => !acceptedFingerprints.has(fp));
  const fixedViolations = [...acceptedFingerprints].filter(fp => !currentFingerprints.has(fp));

  // Se >50% das pages errarem, scan é inválido — não pode reportar PASS
  if (errored.length > totalRuns / 2) {
    console.error(`\n❌ FAIL — ${errored.length}/${totalRuns} runs com erro de carregamento. Servidor pode ter caído.`);
    process.exit(2);
  }

  console.log(`\nBaseline: ${acceptedFingerprints.size} aceitas  ·  Atual: ${currentFingerprints.size}  ·  Novas: ${newViolations.length}  ·  Resolvidas: ${fixedViolations.length}`);

  // Exit code: bloqueia em violações NOVAS (não na baseline)
  if (newViolations.length > 0) {
    console.error(`\n❌ FAIL — ${newViolations.length} violação(ões) NOVA(s) critical/serious (não na baseline)`);
    console.error(`Listadas acima. Pra fixá-las, edite o arquivo. Pra aceitar (não recomendado), rode \`npm run test:a11y -- --update-baseline\`.`);
    exitCode = 1;
  } else if (fixedViolations.length > 0) {
    console.log(`\n✅ PASS — 0 violações novas. ${fixedViolations.length} resolvida(s) desde baseline. Rode \`npm run test:a11y -- --update-baseline\` pra atualizar.`);
  } else if (currentFingerprints.size === 0) {
    console.log(`\n✅ PASS — 0 violações`);
  } else {
    console.log(`\n✅ PASS — ${currentFingerprints.size} violação(ões) na baseline aceita; 0 novas`);
  }
} finally {
  if (server) server.kill();
  // server takes a moment to release port; not blocking
}

process.exit(exitCode);
