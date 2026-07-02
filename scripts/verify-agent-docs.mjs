#!/usr/bin/env node
/**
 * Verifica que instruções de agentes continuam agnósticas e centralizadas.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const requiredFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  "docs/agent-integrations.md",
  "docs/agents/README.md",
  "docs/agents/product-designer-workflow.md",
  "docs/agents/protocol.md",
  "docs/agents/orchestration.md",
  "docs/agents/grounding.md",
  "docs/agents/quick-commands.md",
  "docs/agents/templates/figma-contract-matrix.md",
  "docs/agents/adapters/codex.md",
  "docs/agents/adapters/claude.md",
  "docs/agents/adapters/gemini.md",
  "docs/agents/adapters/cursor.md",
  ".claude/settings.example.json",
];

const requiredIgnores = [
  ".claude/settings.local.json",
  ".gemini/settings.json",
  ".codex/config.toml",
];

const adapterRequirements = [
  { file: "CLAUDE.md", includes: ["AGENTS.md", "docs/agent-integrations.md", "docs/agents/protocol.md"] },
  { file: "GEMINI.md", includes: ["AGENTS.md", "docs/agent-integrations.md", "docs/agents/protocol.md"] },
];

const forbiddenPatterns = [
  {
    file: "AGENTS.md",
    pattern: /~\/\.claude\.json/,
    message: "AGENTS.md não deve apontar segredo para config específica do Claude.",
  },
  {
    file: "GEMINI.md",
    pattern: /igual ao Claude Code/i,
    message: "GEMINI.md não deve depender de comparação com Claude Code.",
  },
  {
    file: "AGENTS.md",
    pattern: /Claude Code session/i,
    message: "AGENTS.md não deve exigir sessão Claude para fluxo compartilhado.",
  },
  {
    file: "docs/agent-integrations.md",
    pattern: /FIGMA_PAT|GitHub token/i,
    allow: /Segredos nunca entram/,
    message: "docs/agent-integrations.md só pode citar tokens em regra de segredo.",
  },
];

const errors = [];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

for (const rel of requiredFiles) {
  if (!fs.existsSync(path.join(ROOT, rel))) {
    errors.push(`arquivo obrigatório ausente: ${rel}`);
  }
}

if (fs.existsSync(path.join(ROOT, ".gitignore"))) {
  const gitignore = read(".gitignore");
  for (const entry of requiredIgnores) {
    if (!gitignore.split(/\r?\n/).includes(entry)) {
      errors.push(`.gitignore deve conter ${entry}`);
    }
  }
}

for (const { file, includes } of adapterRequirements) {
  if (!fs.existsSync(path.join(ROOT, file))) continue;
  const body = read(file);
  for (const expected of includes) {
    if (!body.includes(expected)) {
      errors.push(`${file} deve apontar para ${expected}`);
    }
  }
}

for (const rule of forbiddenPatterns) {
  if (!fs.existsSync(path.join(ROOT, rule.file))) continue;
  const body = read(rule.file);
  const matches = body.match(rule.pattern);
  if (matches && !(rule.allow && rule.allow.test(body))) {
    errors.push(rule.message);
  }
}

try {
  const trackedLocalSettings = execSync("git ls-files .claude/settings.local.json", {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
  if (trackedLocalSettings) {
    errors.push(".claude/settings.local.json não deve ser versionado; use .claude/settings.example.json");
  }
} catch {
  errors.push("não foi possível verificar git ls-files para .claude/settings.local.json");
}

if (errors.length > 0) {
  console.error("verify:agent-docs falhou:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("verify:agent-docs ok");
