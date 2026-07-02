#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { createInitialState, writeState } from "./lib/run-state.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const RUNS_DIR = path.join(ROOT, "docs/agents/runs");
const TEMPLATES_DIR = path.join(ROOT, "docs/agents/templates");
const DEFAULT_FIGMA =
  "https://www.figma.com/design/IE68amP9Hya5ieFw1rX8S8/DS---TIS";

const artifacts = [
  ["01-brief.md", "component-brief.md"],
  ["02-figma-spec.md", "figma-spec.md"],
  ["03-figma-build-report.md", "figma-build-report.md"],
  ["04-figma-audit-report.md", "figma-audit-report.md"],
  ["05-repo-sync-plan.md", "repo-sync-plan.md"],
  ["06-repo-implementation-report.md", "repo-implementation-report.md"],
  ["07-release-report.md", "release-report.md"],
];

function usage() {
  console.log(`Usage:
  npm run agents:create-run -- --slug combobox --title "Combobox"

Options:
  --slug       required-ish; also accepted as first positional argument
  --title      optional; defaults from slug
  --objective  optional; defaults from title
  --figma      optional; defaults to DS Core Figma URL
  --date       optional YYYY-MM-DD; defaults to today
  --force      overwrite an existing run folder`);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) {
      args._.push(item);
      continue;
    }
    const key = item.slice(2);
    if (key === "force" || key === "help") {
      args[key] = true;
      continue;
    }
    args[key] = argv[i + 1];
    i += 1;
  }
  return args;
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, name), "utf8");
}

function applyVars(body, vars) {
  return body.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => vars[key] ?? "");
}

function ensureStatus(body) {
  if (/^- Status:/m.test(body)) return body;
  return `- Status: Pending\n\n${body}`;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  usage();
  process.exit(0);
}

const slug = slugify(args.slug || args._[0]);
if (!slug) {
  usage();
  process.exitCode = 1;
  throw new Error("Missing --slug");
}

const date = args.date || today();
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  throw new Error("--date must use YYYY-MM-DD");
}

const title = args.title || titleFromSlug(slug);
const objective = args.objective || `Planejar e executar ${title} no DS Core.`;
const runId = `${date}-${slug}`;
const runDir = path.join(RUNS_DIR, runId);
const relRunDir = path.relative(ROOT, runDir);

if (fs.existsSync(runDir) && !args.force) {
  throw new Error(`Run already exists: ${relRunDir}. Use --force to overwrite.`);
}

fs.mkdirSync(runDir, { recursive: true });

const vars = {
  RUN_ID: runId,
  TITLE: title,
  DATE: date,
  OBJECTIVE: objective,
  RUN_PATH: relRunDir,
  FIGMA_FILE: args.figma || DEFAULT_FIGMA,
};

const runContext = applyVars(readTemplate("run-context.md"), vars);
fs.writeFileSync(path.join(runDir, "run.md"), runContext);

for (const [file, template] of artifacts) {
  const content = ensureStatus(applyVars(readTemplate(template), vars));
  fs.writeFileSync(path.join(runDir, file), content);
}

const evidenceDir = path.join(runDir, "evidence");
fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(
  path.join(evidenceDir, ".gitkeep"),
  "# Evidence ledger: dumps de nó, screenshots e saídas de validador desta run.\n"
);

writeState(runDir, createInitialState({ runId, title, date }));

console.log(`Agent run created: ${relRunDir}`);
console.log("");
console.log("Next:");
console.log(`  npm run agents:next-step -- ${relRunDir}`);
