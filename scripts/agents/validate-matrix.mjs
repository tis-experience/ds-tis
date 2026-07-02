#!/usr/bin/env node
/**
 * validate-matrix — valida uma matriz de contrato Figma como artefato executável.
 *
 * O contrato vem ANTES do desenho. Esta verificação impede que o Figma Builder
 * comece (ou declare "pronto") com uma matriz incompleta — a causa raiz dos
 * erros do Combobox: linhas sem token, sem evidência de modelo vivo, ou exceções
 * inventadas sem aprovação.
 *
 * Regra dura (sempre bloqueia): `unmappedRows = 0`.
 *   Uma linha é "unmapped" se faltar qualquer célula obrigatória
 *   (part, targetNode, figmaProperty, validation) OU se faltar `modelEvidence`
 *   sem uma `exception` explícita. Inspiração não é contrato: toda linha deriva
 *   de um modelo vivo OU é uma exceção declarada.
 *
 * Uso:
 *   node scripts/agents/validate-matrix.mjs <caminho-da-matriz.md>
 *   node scripts/agents/validate-matrix.mjs <caminho> --strict-exceptions
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");

const REQUIRED_COLUMNS = [
  "part",
  "targetnode",
  "figmaproperty",
  "componentproperty",
  "componenttoken",
  "semanticalias",
  "modelevidence",
  "validation",
  "exception",
];

// Células que devem ter conteúdo real (não basta "n/a").
const REQUIRED_NON_EMPTY = ["part", "targetnode", "figmaproperty", "validation"];

const PLACEHOLDERS = new Set(["", "todo", "tbd", "?", "...", "—", "-", "pendente", "pending"]);
const NO_EXCEPTION = new Set(["", "none", "n/a", "na", "nenhuma", "nenhum"]);

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  console.log("Uso: node scripts/agents/validate-matrix.mjs <matriz.md> [--strict-exceptions]");
  process.exit(args.length === 0 ? 2 : 0);
}

const strictExceptions = args.includes("--strict-exceptions");
const fileArg = args.find((arg) => !arg.startsWith("--"));
const filePath = path.resolve(ROOT, fileArg);

if (!fs.existsSync(filePath)) {
  console.error(`Matriz não encontrada: ${path.relative(ROOT, filePath)}`);
  process.exit(2);
}

const body = fs.readFileSync(filePath, "utf8");
const table = extractTable(body, REQUIRED_COLUMNS);

if (!table) {
  console.error("Nenhuma tabela com as colunas obrigatórias foi encontrada.");
  console.error(`Colunas exigidas: ${REQUIRED_COLUMNS.join(", ")}`);
  process.exit(2);
}

const { columns, rows } = table;
const idx = Object.fromEntries(columns.map((name, i) => [name, i]));

const unmapped = [];
const missingModelEvidence = [];
const flaggedExceptions = [];

for (const row of rows) {
  const cell = (name) => (row.cells[idx[name]] ?? "").trim();
  const isPlaceholder = (value) => PLACEHOLDERS.has(value.toLowerCase());

  const reasons = [];
  for (const col of REQUIRED_NON_EMPTY) {
    if (isPlaceholder(cell(col))) reasons.push(`coluna obrigatória vazia: ${col}`);
  }

  const exceptionValue = cell("exception");
  const hasException = !NO_EXCEPTION.has(exceptionValue.toLowerCase());
  if (hasException) flaggedExceptions.push({ row, exception: exceptionValue });

  const modelEvidence = cell("modelevidence");
  if (isPlaceholder(modelEvidence) && !hasException) {
    reasons.push("modelEvidence ausente sem exceção declarada");
    missingModelEvidence.push(row);
  }

  if (reasons.length) {
    unmapped.push({ row, reasons });
  }
}

const approvedExceptions = extractApprovedExceptions(body);

console.log("");
console.log("═══ validate-matrix ════════════════════════════════════════");
console.log("");
console.log(`matriz:              ${path.relative(ROOT, filePath)}`);
console.log(`linhas de contrato:  ${rows.length}`);
console.log(`unmappedRows:        ${unmapped.length}`);
console.log(`sem modelEvidence:   ${missingModelEvidence.length}`);
console.log(`exceções marcadas:   ${flaggedExceptions.length}`);
console.log(`exceções aprovadas:  ${approvedExceptions.length}`);
console.log("");

let failed = false;

if (unmapped.length) {
  failed = true;
  console.log("Linhas não mapeadas (bloqueiam o build):");
  for (const { row, reasons } of unmapped.slice(0, 40)) {
    const part = (row.cells[idx.part] ?? "(sem part)").trim() || "(sem part)";
    console.log(`  • ${part}`);
    for (const reason of reasons) console.log(`      - ${reason}`);
  }
  console.log("");
}

if (flaggedExceptions.length) {
  const hasApprovalSection = approvedExceptions.length > 0;
  const severity = strictExceptions && !hasApprovalSection ? "ERRO" : "aviso";
  if (strictExceptions && !hasApprovalSection) failed = true;
  console.log(`Exceções declaradas (${severity}): precisam de aprovação registrada do owner.`);
  for (const { row, exception } of flaggedExceptions.slice(0, 40)) {
    const part = (row.cells[idx.part] ?? "(sem part)").trim() || "(sem part)";
    console.log(`  • ${part}: ${exception}`);
  }
  if (strictExceptions && !hasApprovalSection) {
    console.log("");
    console.log('  Adicione uma seção "## Exceções aprovadas" com a decisão do owner por exceção.');
  }
  console.log("");
}

if (failed) {
  console.log("Resultado: matriz NÃO está pronta para o Figma Builder.");
  console.log("");
  process.exit(1);
}

console.log("Resultado: matriz válida (unmappedRows=0). Pronta para handoff ao Figma Builder.");
console.log("");

/**
 * Extrai a primeira tabela markdown cujo cabeçalho contém todas as colunas
 * obrigatórias. Retorna { columns: string[], rows: [{ cells: string[] }] }.
 */
function extractTable(markdown, requiredColumns) {
  const lines = markdown.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    if (!isTableRow(lines[i])) continue;
    const header = splitRow(lines[i]).map((cell) => cell.toLowerCase());
    const allPresent = requiredColumns.every((col) => header.includes(col));
    if (!allPresent) continue;
    const separator = lines[i + 1] || "";
    if (!/^\s*\|?[\s:|-]+\|?\s*$/.test(separator) || !separator.includes("-")) continue;

    const rows = [];
    for (let j = i + 2; j < lines.length; j += 1) {
      if (!isTableRow(lines[j])) break;
      rows.push({ cells: splitRow(lines[j]) });
    }
    return { columns: header, rows };
  }
  return null;
}

function isTableRow(line) {
  return typeof line === "string" && /^\s*\|.*\|\s*$/.test(line);
}

function splitRow(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  // Divide em pipes não escapados.
  const cells = trimmed.split(/(?<!\\)\|/).map((cell) => cell.replace(/\\\|/g, "|").trim());
  return cells;
}

function extractApprovedExceptions(markdown) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => /^#{1,6}\s+Exce[cç][õo]es aprovadas/i.test(line));
  if (start === -1) return [];
  const approved = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^#{1,6}\s+/.test(lines[i])) break;
    const match = lines[i].match(/^\s*[-*]\s+(.*\S)\s*$/);
    if (match) approved.push(match[1]);
  }
  return approved;
}
