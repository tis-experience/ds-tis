#!/usr/bin/env node
/**
 * agent-preflight — sanity check que qualquer agente (Claude, Codex, Gemini) deve
 * rodar como primeira ação ao começar a operar no repo. Resume o estado atual e
 * sinaliza o que precisa de atenção antes de qualquer escrita.
 *
 * Saída: relatório human-readable em stdout. Exit code 0 sempre — preflight é
 * informativo, não bloqueante. Bloqueio é responsabilidade do `verify:tokens`.
 *
 * Cobre:
 *   - branch atual + clean/dirty
 *   - último commit (hash + subject + idade)
 *   - idade do .figma-snapshot.json (gitignored, regenerado manualmente)
 *   - resumo do último resultado de verify:tokens (lido de docs/api/tokens-sync.json)
 *   - estado da seção [Não publicado] do CHANGELOG (vazia, populada, etc.)
 *
 * Uso: npm run agent:preflight
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function sh(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
  } catch (e) {
    return null;
  }
}

function ageHuman(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

const sections = [];
const warnings = [];

// ── git ──────────────────────────────────────────────────────────────
const branch = sh("git rev-parse --abbrev-ref HEAD") || "?";
const status = sh("git status --porcelain") || "";
const dirty = status.length > 0;
const modifiedCount = status.split("\n").filter((l) => l.trim()).length;
const lastCommit = sh("git log -1 --format='%h %s (%cr, %an)'") || "?";
const ahead = sh("git rev-list --count @{u}..HEAD") || "0";
const behind = sh("git rev-list --count HEAD..@{u}") || "0";

sections.push([
  "Git",
  [
    `branch:        ${branch}${branch !== "main" ? "  ⚠ não é main" : ""}`,
    `working tree:  ${dirty ? `dirty (${modifiedCount} arquivos)` : "clean"}`,
    `last commit:   ${lastCommit}`,
    `ahead/behind:  ${ahead}↑ ${behind}↓ vs upstream`,
  ],
]);

if (branch !== "main") warnings.push(`branch atual é "${branch}", não main — confirmar se é intencional antes de commitar`);
if (parseInt(behind) > 0) warnings.push(`branch atrás do upstream em ${behind} commit(s) — rodar git pull antes de mexer`);
if (dirty && modifiedCount > 20) warnings.push(`${modifiedCount} arquivos modificados — rodada grande, considerar commits incrementais`);

// ── figma snapshot ───────────────────────────────────────────────────
const snapshotPath = path.join(ROOT, ".figma-snapshot.json");
if (fs.existsSync(snapshotPath)) {
  const stat = fs.statSync(snapshotPath);
  const age = Date.now() - stat.mtimeMs;
  const ageStr = ageHuman(age);
  const stale = age > 24 * 60 * 60 * 1000;
  sections.push([
    "Figma snapshot",
    [
      `arquivo:       .figma-snapshot.json`,
      `idade:         ${ageStr}${stale ? "  ⚠ stale (>24h)" : ""}`,
      `tamanho:       ${(stat.size / 1024).toFixed(0)} KB`,
    ],
  ]);
  if (stale) warnings.push(`.figma-snapshot.json tem ${ageStr} — regenerar via use_figma se for tocar tokens Figma-canônicos (color/dimension/radius/opacity/border-width/typography)`);
} else {
  sections.push([
    "Figma snapshot",
    [
      `arquivo:       não existe`,
      `regenerar via: chamar use_figma para dumpar Variables (ver docs/process-figma-sync.md)`,
    ],
  ]);
  warnings.push(`.figma-snapshot.json ausente — verify:tokens não consegue checar drift Figma↔JSON`);
}

// ── verify:tokens (resumo do último run) ─────────────────────────────
const tokensSyncPath = path.join(ROOT, "docs/api/tokens-sync.json");
if (fs.existsSync(tokensSyncPath)) {
  try {
    const report = JSON.parse(fs.readFileSync(tokensSyncPath, "utf8"));
    const checks = report.checks || {};
    const summary = checks.jsonVsFigma?.summary || {};
    const errors = [];
    const counts = [];

    for (const [name, val] of Object.entries(checks)) {
      if (Array.isArray(val)) {
        const errs = val.filter((v) => v.level === "error").length;
        if (errs > 0) errors.push(`${name}: ${errs} erro(s)`);
      }
    }

    sections.push([
      "verify:tokens (último run)",
      [
        `tokens JSON:   ${report.totals?.tokens ?? "?"} (foundation ${report.totals?.foundation ?? "?"}, semantic ${report.totals?.semantic ?? "?"} × 2)`,
        `JSON ↔ Figma:  VALUE_DRIFT=${summary.VALUE_DRIFT ?? 0}  NEEDS_SYNC=${summary.NEEDS_SYNC ?? 0}  ALIAS_BROKEN=${summary.ALIAS_BROKEN ?? 0}  CSS_ONLY=${summary.CSS_ONLY ?? 0}  BY_DESIGN=${summary.BY_DESIGN ?? 0}`,
        `erros:         ${errors.length === 0 ? "nenhum" : errors.join(", ")}`,
      ],
    ]);

    if (errors.length > 0) warnings.push(`verify:tokens reporta erros: ${errors.join(", ")} — rodar npm run verify:tokens para detalhes`);
    if ((summary.VALUE_DRIFT ?? 0) > 0) warnings.push(`${summary.VALUE_DRIFT} VALUE_DRIFT pendente — rodar npm run sync:tokens-from-figma:write se intencional`);
    if ((summary.NEEDS_SYNC ?? 0) > 0) warnings.push(`${summary.NEEDS_SYNC} token(s) NEEDS_SYNC — Figma divergiu`);
  } catch (e) {
    sections.push(["verify:tokens", [`relatório existe mas está corrompido: ${e.message}`]]);
  }
} else {
  sections.push(["verify:tokens", [`relatório não existe — rodar npm run verify:tokens para gerar`]]);
}

// ── changelog ────────────────────────────────────────────────────────
const changelogPath = path.join(ROOT, "CHANGELOG.md");
if (fs.existsSync(changelogPath)) {
  const txt = fs.readFileSync(changelogPath, "utf8");
  const match = txt.match(/## \[Não publicado\][\s\S]*?(?=^## \[)/m);
  const unreleasedBody = match ? match[0].replace(/^## \[Não publicado\]\s*/, "").trim() : "";
  const entryCount = (unreleasedBody.match(/^- /gm) || []).length;
  sections.push([
    "CHANGELOG",
    [
      `[Não publicado]: ${entryCount === 0 ? "vazio" : `${entryCount} entrada(s)`}`,
      `package.json version: ${JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version}`,
    ],
  ]);
}

// ── render ───────────────────────────────────────────────────────────
console.log("");
console.log("═══ agent-preflight ════════════════════════════════════════");
console.log("");

for (const [title, lines] of sections) {
  console.log(`▸ ${title}`);
  for (const l of lines) console.log(`  ${l}`);
  console.log("");
}

if (warnings.length > 0) {
  console.log("⚠ Atenção:");
  for (const w of warnings) console.log(`  · ${w}`);
  console.log("");
} else {
  console.log("✓ Nenhum aviso. Estado limpo.");
  console.log("");
}

console.log("Próximos passos sugeridos:");
console.log("  · ler AGENTS.md se ainda não leu nesta sessão");
console.log("  · planejar a mudança antes de escrever");
console.log("  · rodar npm run verify:tokens antes de cada commit");
console.log("");
