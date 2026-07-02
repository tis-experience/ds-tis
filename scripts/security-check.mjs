#!/usr/bin/env node
/**
 * security-check.mjs
 *
 * Verifica se artefatos gerados (docs/, css/) contêm conteúdo sensível
 * que não deve ser publicado. Roda antes do commit de artefatos no CI
 * e pode ser executado localmente: node scripts/security-check.mjs
 *
 * Sai com código 1 se qualquer violação for encontrada.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ─── Padrões proibidos ────────────────────────────────────────────────────────

const FORBIDDEN = [
  // Caminhos locais de sistema (usuário específico)
  { pattern: /\/Users\/[^/\s]+\//g, label: "Caminho local de usuário (/Users/...)" },
  { pattern: /\/home\/[^/\s]+\//g,  label: "Caminho local de usuário (/home/...)" },

  // CLAUDE.md embutido num artefato público (indica que build-llms incluiu o arquivo)
  { pattern: /CLAUDE\.md \(raiz, guia de agente\)/g, label: "CLAUDE.md embutido em artefato público" },

  // Identificador de servidor MCP local (formato: mcp__ + UUID no nome da ferramenta)
  // Bloqueia apenas a forma como aparece em configurações de agente, não em texto livre.
  // Padrão: mcp__ seguido de UUID hexadecimal completo de 8 dígitos
  { pattern: /\bmcp__[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, label: "Identificador de servidor MCP local (UUID completo)" },
];

// ─── Arquivos a verificar ─────────────────────────────────────────────────────

const TARGETS = [
  "docs/llms.txt",
  "docs/llms-full.txt",
  "docs/api/tokens.json",
  "docs/api/components.json",
  "docs/api/foundations.json",
  "docs/api/adrs.json",
];

// Todos os .html em docs/ e docs/decisions/
function collectHtml(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...collectHtml(full));
    else if (entry.name.endsWith(".html")) result.push(full);
  }
  return result;
}

const targets = [
  ...TARGETS.map((t) => path.join(ROOT, t)),
  ...collectHtml(path.join(ROOT, "docs")),
];

// ─── Verificação ──────────────────────────────────────────────────────────────

let violations = 0;

for (const filePath of targets) {
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, "utf8");
  const rel = path.relative(ROOT, filePath);

  for (const { pattern, label } of FORBIDDEN) {
    const matches = content.match(pattern);
    if (matches) {
      console.error(`❌  ${rel}`);
      console.error(`    Padrão: ${label}`);
      console.error(`    Ocorrências: ${matches.length}`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(`\n🚫  ${violations} violação(ões) encontrada(s) em artefatos gerados.`);
  console.error("    Corrija os arquivos fonte antes de commitar.\n");
  process.exit(1);
} else {
  console.log("✅  Verificação de segurança passou — nenhum conteúdo sensível nos artefatos.");
}
