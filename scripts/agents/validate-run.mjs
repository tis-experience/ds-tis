#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { ROOT, readState, resolveRunDir, validateState } from "./lib/run-state.mjs";

const requiredRunFiles = [
  "run.md",
  "state.json",
  "01-brief.md",
  "02-figma-spec.md",
  "03-figma-build-report.md",
  "04-figma-audit-report.md",
  "05-repo-sync-plan.md",
  "06-repo-implementation-report.md",
  "07-release-report.md",
];

const requiredSharedFiles = [
  "AGENTS.md",
  "docs/agents/README.md",
  "docs/agents/protocol.md",
  "docs/agents/orchestration.md",
  "docs/agents/grounding.md",
  "docs/agents/quick-commands.md",
  "docs/agents/roles/ds-architect.md",
  "docs/agents/roles/figma-builder.md",
  "docs/agents/roles/figma-auditor.md",
  "docs/agents/roles/token-sync-agent.md",
  "docs/agents/roles/repo-component-agent.md",
  "docs/agents/roles/release-agent.md",
  "docs/agents/checklists/figma-build-checklist.md",
  "docs/agents/checklists/figma-audit-checklist.md",
  "docs/agents/checklists/token-sync-checklist.md",
  "docs/agents/checklists/repo-implementation-checklist.md",
  "docs/agents/checklists/release-checklist.md",
  "docs/agents/templates/figma-contract-matrix.md",
];

function usage() {
  console.log("Usage: npm run agents:validate-run -- docs/agents/runs/YYYY-MM-DD-slug");
}

if (!process.argv[2]) {
  usage();
  process.exit(1);
}

const runDir = resolveRunDir(process.argv[2]);
const errors = [];

for (const rel of requiredSharedFiles) {
  if (!fs.existsSync(path.join(ROOT, rel))) errors.push(`missing shared file: ${rel}`);
}

for (const file of requiredRunFiles) {
  const full = path.join(runDir, file);
  if (!fs.existsSync(full)) {
    errors.push(`missing run file: ${path.relative(ROOT, full)}`);
    continue;
  }
  const body = fs.readFileSync(full, "utf8");
  if (body.trim().length === 0) errors.push(`empty run file: ${path.relative(ROOT, full)}`);
}

const runMd = path.join(runDir, "run.md");
if (fs.existsSync(runMd)) {
  const body = fs.readFileSync(runMd, "utf8");
  for (const expected of ["Run ID:", "Current gate:", "Active role:", "Artifacts"]) {
    if (!body.includes(expected)) errors.push(`run.md missing field: ${expected}`);
  }
}

if (fs.existsSync(path.join(runDir, "state.json"))) {
  try {
    const state = readState(runDir);
    for (const error of validateState(state)) errors.push(`state.json: ${error}`);
  } catch (error) {
    errors.push(`state.json: ${error.message}`);
  }
}

if (errors.length) {
  console.error("agents:validate-run failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`agents:validate-run ok: ${path.relative(ROOT, runDir)}`);
