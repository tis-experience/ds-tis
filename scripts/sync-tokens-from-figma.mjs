#!/usr/bin/env node
/**
 * sync-tokens-from-figma.mjs — sincroniza Figma Variables para os arquivos
 * JSON DTCG em `tokens/`.
 *
 * Direção canônica (ADR-003 revisada em 0.5.8): Figma é autoridade de
 * valores de token. JSONs em tokens/ são consolidação derivada.
 *
 * COMO FUNCIONA NO PLANO PRO:
 *   A REST API de Figma Variables exige plano Enterprise. No plano Pro
 *   (nosso caso), o sync funciona via **snapshot JSON** gerado pelo MCP
 *   remoto (`use_figma`) dentro de uma sessão Claude Code. Fluxo:
 *
 *     1. Agente Claude executa use_figma com código Plugin API que
 *        serializa as Variables num JSON e salva em
 *        `.figma-snapshot.json` (gitignored).
 *     2. Este script lê esse snapshot.
 *     3. Compara com tokens/. Em --write, aplica VALUE_DRIFT.
 *
 *   Ver docs/process-figma-sync.md pro passo-a-passo.
 *
 * Uso:
 *   node scripts/sync-tokens-from-figma.mjs                                  (dry-run, lê .figma-snapshot.json)
 *   node scripts/sync-tokens-from-figma.mjs --write                          (aplica VALUE_DRIFT e regenera CSS)
 *   node scripts/sync-tokens-from-figma.mjs --snapshot path/to/other.json    (snapshot em outro caminho)
 *   node scripts/sync-tokens-from-figma.mjs --require-fresh                  (falha se snapshot >24h)
 *
 * Categorias (mesmas usadas em tokens-verify.mjs):
 *   VALUE_DRIFT        mesmo nome, valor diferente. `--write` corrige.
 *   NEW_IN_FIGMA       Figma tem, JSON não. `--write` não cria — ação manual.
 *   MISSING_IN_FIGMA   JSON tem, Figma não. `--write` não deleta — ação manual.
 *   ALIAS_BROKEN       variável Figma aponta pra ID inexistente.
 *   CSS_ONLY           token existe em ambos, mas representação diverge por
 *                      capacidade CSS (font family stack, rem, weight numérico).
 *                      Não aplica em `--write` (evita regressão CSS).
 *   BY_DESIGN          token existe só em um lado por escolha arquitetural
 *                      documentada (ADR-012 — line-height/letter-spacing em
 *                      PX no Figma vs ratio/em no JSON). Informativo, não sync.
 *
 * Exit codes:
 *   0 — sem divergências ou --write bem sucedido.
 *   1 — dry-run com divergências.
 *   2 — erro de execução (snapshot ausente/inválido, build falhou).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import {
  readFigmaSnapshot,
  buildExpectedState,
  readCurrentState,
  compareStates,
} from "./lib/figma-dtcg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TOKENS_DIR = path.join(ROOT, "tokens");

const args = process.argv.slice(2);
const isWrite = args.includes("--write");
const requireFresh = args.includes("--require-fresh");
const STALE_SNAPSHOT_HOURS = 24;
const snapshotFlagIdx = args.indexOf("--snapshot");
const snapshotPath = path.resolve(
  ROOT,
  snapshotFlagIdx !== -1 && args[snapshotFlagIdx + 1]
    ? args[snapshotFlagIdx + 1]
    : ".figma-snapshot.json"
);

if (!snapshotPath.startsWith(ROOT + path.sep) && snapshotPath !== path.join(ROOT, ".figma-snapshot.json")) {
  console.error(`Erro: --snapshot deve apontar para um arquivo dentro do projeto (${ROOT}).`);
  process.exit(2);
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`sync-tokens-from-figma.mjs

Uso:
  node scripts/sync-tokens-from-figma.mjs                                  # dry-run
  node scripts/sync-tokens-from-figma.mjs --write                          # aplica
  node scripts/sync-tokens-from-figma.mjs --snapshot path/to/dump.json     # snapshot alternativo
  node scripts/sync-tokens-from-figma.mjs --require-fresh                  # exige snapshot <=24h

Espera um snapshot em .figma-snapshot.json (ou --snapshot <path>) no formato
gerado pelo helper MCP. Ver docs/process-figma-sync.md pra detalhes.`);
  process.exit(0);
}

function snapshotFreshness(file) {
  const stat = fs.statSync(file);
  const ageMs = Date.now() - stat.mtimeMs;
  const ageHours = Math.round(ageMs / (1000 * 60 * 60));
  return {
    ageHours,
    stale: ageMs > STALE_SNAPSHOT_HOURS * 60 * 60 * 1000,
  };
}

// ─── Report ─────────────────────────────────────────────────────────────────

function fmt(v) {
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function report(diffs, issues) {
  const total = diffs.VALUE_DRIFT.length + diffs.NEW_IN_FIGMA.length + diffs.MISSING_IN_FIGMA.length;
  const aliasBroken = issues.filter((i) => i.category === "ALIAS_BROKEN").length;
  const cssOnly = (diffs.CSS_ONLY || []).length;
  const byDesign = (diffs.BY_DESIGN || []).length;

  console.log("");
  console.log("═══ sync-tokens-from-figma ═════════════════════════════");
  console.log(`VALUE_DRIFT      (mesmo nome, valor difere): ${diffs.VALUE_DRIFT.length}`);
  console.log(`NEW_IN_FIGMA     (Figma tem, JSON não):      ${diffs.NEW_IN_FIGMA.length}`);
  console.log(`MISSING_IN_FIGMA (JSON tem, Figma não):      ${diffs.MISSING_IN_FIGMA.length}`);
  console.log(`ALIAS_BROKEN     (Figma aponta pra órfão):   ${aliasBroken}`);
  console.log(`CSS_ONLY         (repr. CSS-específica):     ${cssOnly}`);
  console.log(`BY_DESIGN        (divergência arquit. ADR):  ${byDesign}`);
  console.log("═════════════════════════════════════════════════════════");

  const section = (title, items, format) => {
    if (!items.length) return;
    console.log(`\n┌ ${title} `.padEnd(60, "─"));
    for (const d of items.slice(0, 50)) console.log("  " + format(d));
    if (items.length > 50) console.log(`  ... +${items.length - 50} mais`);
  };

  section(
    "VALUE_DRIFT",
    diffs.VALUE_DRIFT,
    (d) => `${d.token}\n    Figma: ${fmt(d.figma)}\n    JSON:  ${fmt(d.json)}`
  );
  section(
    "NEW_IN_FIGMA (requer adição manual)",
    diffs.NEW_IN_FIGMA,
    (d) => `${d.token} = ${fmt(d.figma)} → ${d.file}`
  );
  section(
    "MISSING_IN_FIGMA (requer remoção manual ou adição no Figma)",
    diffs.MISSING_IN_FIGMA,
    (d) => `${d.token} (valor JSON: ${fmt(d.json)}) ← ${d.file}`
  );
  section(
    "ALIAS_BROKEN",
    issues.filter((i) => i.category === "ALIAS_BROKEN"),
    (i) => `${i.token}${i.mode ? ` (${i.mode})` : ""} → alvo: ${i.target}`
  );
  section(
    "CSS_ONLY (representação CSS-específica — JSON preserva, Figma aproxima)",
    diffs.CSS_ONLY || [],
    (d) => `${d.token}\n    Figma: ${fmt(d.figma)}\n    JSON:  ${fmt(d.json)}`
  );
  section(
    "BY_DESIGN (ADR-012 — divergência arquitetural line-height/letter-spacing)",
    diffs.BY_DESIGN || [],
    (d) => d.side === 'figma-only'
      ? `${d.token} = ${fmt(d.figma)} (só no Figma, ${d.side})`
      : `${d.token} = ${fmt(d.json)} (só no JSON, ${d.side})`
  );

  console.log("");
  return total;
}

// ─── Write ──────────────────────────────────────────────────────────────────

function applyValueDrifts(drifts) {
  const byFile = {};
  for (const d of drifts) (byFile[d.file] ||= []).push(d);

  for (const [relFile, fixes] of Object.entries(byFile)) {
    const abs = path.join(TOKENS_DIR, relFile);
    const json = JSON.parse(fs.readFileSync(abs, "utf8"));
    for (const fix of fixes) {
      const parts = fix.token.split(".");
      let cur = json;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!cur || !(parts[i] in cur)) {
          console.warn(`  [skip] ${fix.token}: path ausente em ${relFile}`);
          cur = null;
          break;
        }
        cur = cur[parts[i]];
      }
      if (!cur) continue;
      const leaf = parts[parts.length - 1];
      if (!cur[leaf] || typeof cur[leaf] !== "object" || !("$value" in cur[leaf])) {
        console.warn(`  [skip] ${fix.token}: folha inválida em ${relFile}`);
        continue;
      }
      cur[leaf].$value = fix.figma;
    }
    fs.writeFileSync(abs, JSON.stringify(json, null, 2) + "\n");
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Lendo snapshot Figma em ${path.relative(ROOT, snapshotPath)}...`);
  const freshness = snapshotFreshness(snapshotPath);
  if (freshness.stale) {
    const msg = `.figma-snapshot.json está stale (${freshness.ageHours}h > ${STALE_SNAPSHOT_HOURS}h). Regenerar via use_figma antes de concluir sync/release.`;
    if (requireFresh) {
      console.error(`Erro: ${msg}`);
      process.exit(2);
    }
    console.warn(`Aviso: ${msg}`);
  }
  const meta = readFigmaSnapshot(snapshotPath);
  console.log(
    `  ${Object.keys(meta.variables).length} variables em ${Object.keys(meta.variableCollections).length} collections`
  );

  console.log("Construindo estado esperado...");
  const { state: expected, issues } = buildExpectedState(meta);

  console.log("Lendo JSONs atuais...");
  const actual = readCurrentState(TOKENS_DIR);

  console.log("Comparando...");
  const diffs = compareStates(expected, actual);
  const total = report(diffs, issues);

  if (!isWrite) {
    if (total === 0) {
      console.log("Figma e JSON em dia.");
      process.exit(0);
    }
    console.log(
      `Dry-run: ${total} divergência(s). Use --write pra aplicar VALUE_DRIFT (${diffs.VALUE_DRIFT.length}).`
    );
    process.exit(1);
  }

  if (diffs.VALUE_DRIFT.length === 0) {
    console.log("Nada a aplicar (VALUE_DRIFT vazio).");
    if (diffs.NEW_IN_FIGMA.length || diffs.MISSING_IN_FIGMA.length) {
      console.log("Há pendências que exigem revisão manual — ver relatório acima.");
    }
    process.exit(0);
  }

  console.log(`Aplicando ${diffs.VALUE_DRIFT.length} VALUE_DRIFT(s)...`);
  applyValueDrifts(diffs.VALUE_DRIFT);

  for (const step of ["build:tokens", "sync:docs"]) {
    console.log(`Rodando npm run ${step}...`);
    const r = spawnSync("npm", ["run", step], { cwd: ROOT, stdio: "inherit" });
    if (r.status !== 0) {
      console.error(`${step} falhou.`);
      process.exit(2);
    }
  }

  console.log("");
  console.log("✅ VALUE_DRIFT aplicados. Revisar git diff antes de commitar.");
  if (diffs.NEW_IN_FIGMA.length || diffs.MISSING_IN_FIGMA.length) {
    console.log("⚠ Pendências NEW_IN_FIGMA / MISSING_IN_FIGMA exigem ação manual. Ver relatório.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
