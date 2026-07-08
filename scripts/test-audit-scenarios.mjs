#!/usr/bin/env node
/**
 * test-audit-scenarios
 *
 * Regression scenarios derived from the Design System audit. These checks are
 * intentionally higher-level than token integrity tests: they validate that the
 * repo can be consumed by real projects, that agent gates remain machine
 * verifiable, and that the local Figma snapshot has the structural evidence the
 * audit relies on.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { readState, validateState } from "./agents/lib/run-state.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
let checks = 0;

function ok(condition, message) {
  checks += 1;
  if (!condition) errors.push(message);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function fileExists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function runCommand(label, command, args) {
  const finalArgs = command === "npm"
    ? ["--cache", "/private/tmp/npm-cache-ds-tis-scenarios", ...args]
    : args;
  const result = spawnSync(command, finalArgs, {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
    env: process.env,
  });

  ok(result.status === 0, `${label} exited ${result.status ?? "null"}\n${result.stderr || result.stdout}`);
  return result;
}

function parseNpmPackJson(stdout) {
  const start = stdout.indexOf("[");
  const end = stdout.lastIndexOf("]");
  if (start < 0 || end < start) {
    throw new Error(`npm pack --json did not return a JSON array:\n${stdout}`);
  }
  return JSON.parse(stdout.slice(start, end + 1));
}

function assertPackageConsumerContract() {
  const pkg = readJson("package.json");
  const expectedFiles = [
    "css/",
    "docs/templates/",
    "js/combobox.js",
    "js/package.json",
    "js/theme/",
  ];
  const expectedExports = [
    ".",
    "./css",
    "./css/design-system.css",
    "./combobox",
    "./combobox.js",
    "./theme",
    "./theme/*",
    "./templates/*",
    "./package.json",
  ];

  for (const entry of expectedFiles) {
    ok(pkg.files.includes(entry), `package.json files missing ${entry}`);
  }
  for (const key of expectedExports) {
    ok(Object.hasOwn(pkg.exports, key), `package.json exports missing ${key}`);
  }

  for (const [key, target] of Object.entries(pkg.exports)) {
    if (typeof target !== "string") continue;
    if (target.includes("*")) {
      const base = target.slice(0, target.indexOf("*")).replace(/\/$/, "").replace(/^\.\//, "");
      ok(fileExists(base), `export ${key} points to missing base ${base}`);
    } else {
      ok(fileExists(target.replace(/^\.\//, "")), `export ${key} points to missing file ${target}`);
    }
  }
}

async function assertPublicModuleImports() {
  const combobox = await import("ds-tis/combobox");
  const theme = await import("ds-tis/theme");

  ok(typeof combobox.initComboboxes === "function", "ds-tis/combobox must export initComboboxes()");
  ok(typeof combobox.syncComboboxState === "function", "ds-tis/combobox must export syncComboboxState()");
  ok(typeof theme.applyTheme === "function", "ds-tis/theme must export applyTheme()");
  ok(typeof theme.toCssSnippet === "function", "ds-tis/theme must export toCssSnippet()");
  ok(typeof theme.generateBrandScale === "function", "ds-tis/theme must export generateBrandScale()");
}

function assertPackDryRun() {
  const result = runCommand("npm pack --dry-run", "npm", ["pack", "--dry-run", "--json"]);
  let packed;
  try {
    packed = parseNpmPackJson(result.stdout);
  } catch (error) {
    errors.push(error.message);
    return;
  }
  const files = new Set((packed[0]?.files || []).map((entry) => entry.path));
  for (const rel of [
    "css/design-system.css",
    "css/components/button.css",
    "docs/templates/index.html",
    "docs/templates/login.html",
    "js/combobox.js",
    "js/package.json",
    "js/theme/index.js",
    "package.json",
    "README.md",
  ]) {
    ok(files.has(rel), `npm package missing ${rel}`);
  }
}

function assertReadmeConsumerGuidance() {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  ok(!readme.includes("cdn.example.com"), "README must not document the placeholder CDN");
  ok(readme.includes("import 'ds-tis/css'"), "README must document CSS package import");
  ok(readme.includes("ds-tis/combobox"), "README must document Combobox package import");
  ok(readme.includes("ds-tis/theme"), "README must document theme package import");
}

function assertAgentConsumerUsageGuide() {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  const guideMd = fs.readFileSync(path.join(ROOT, "docs/agent-consumer-usage.md"), "utf8");
  const llmsTxt = fs.readFileSync(path.join(ROOT, "docs/llms.txt"), "utf8");

  ok(readme.includes("docs/agent-consumer-usage.html"), "README must link the agent consumer usage guide");
  ok(fileExists("docs/agent-consumer-usage.html"), "docs/agent-consumer-usage.html must be generated");
  ok(llmsTxt.includes("docs/agent-consumer-usage.html"), "docs/llms.txt must reference the agent consumer usage guide");
  ok(guideMd.includes("Prompt curto para agent consumidor"), "agent consumer guide must include the short prompt block");

  for (const required of [
    "ds-tis/css",
    "ds-tis/combobox",
    "ds-tis/theme",
    "ds-tis/templates/*",
    "docs/api/components.json",
    "docs/api/tokens.json",
    "docs/llms-full.txt",
    "ds-field",
    "ds-input__field",
    "aria-*",
    "focus ring",
    "nao invente wrappers oficiais",
  ]) {
    ok(guideMd.includes(required), `agent consumer guide missing ${required}`);
  }
}

function assertComponentTokenAuditContract() {
  const buttonCss = fs.readFileSync(path.join(ROOT, "css/components/button.css"), "utf8");
  ok(
    buttonCss.includes("--ds-button-label-letter-spacing-default"),
    "Button CSS must consume the Component token for label letter-spacing",
  );

  const registry = readJson("tokens/registry.json");
  const entry = registry.entries?.["component.button.label.letter-spacing.default"];
  ok(Boolean(entry), "registry missing component.button.label.letter-spacing.default");
  const cssUses = entry?.usos?.css || [];
  ok(
    cssUses.some((use) => use.file === "css/components/button.css" && use.count >= 1),
    "registry must link button label letter-spacing to css/components/button.css",
  );

  const snapshot = readJson(".figma-snapshot.json");
  const usage = snapshot.structureAudit?.variableUsage;
  ok(Boolean(usage), ".figma-snapshot.json must include structureAudit.variableUsage");

  const unused = usage?.unusedComponentVariables || [];
  const unexpectedUnused = unused
    .map((item) => item.name)
    .filter((name) => !name.startsWith("form-field/"));
  ok(
    unexpectedUnused.length === 0,
    `only CSS-only form-field Component vars may be unused; got ${unexpectedUnused.join(", ")}`,
  );
  ok(
    !unused.some((item) => item.name.startsWith("button/label/")),
    "Button label Component vars must be used in the Figma snapshot",
  );
}

function assertAgentRunContract() {
  const runDir = path.join(ROOT, "docs/agents/runs/2026-07-06-stabilize-recent-components");
  const state = readState(runDir);
  ok(Boolean(state), "stabilize-recent-components run must have state.json");
  if (!state) return;

  const stateErrors = validateState(state);
  ok(stateErrors.length === 0, `agent run state invalid: ${stateErrors.join("; ")}`);

  const releaseGate = state.gates.find((gate) => gate.id === "release");
  ok(releaseGate?.status === "pending", "Release gate must remain pending without owner approval");

  ok(state.checks?.["verify:tokens"]?.exitCode === 0, "run state must record verify:tokens passing");
  ok(state.checks?.["audit:component-tokens"]?.exitCode === 0, "run state must record audit:component-tokens passing");
  ok(state.checks?.["verify:figma-structure"]?.issues === 0, "run state must record zero Figma structure issues");
}

function assertPathWithSpacesBuild() {
  runCommand("npm run build:icons", "npm", ["run", "build:icons"]);
}

console.log("\n=== test-audit-scenarios =====================");

assertPackageConsumerContract();
await assertPublicModuleImports();
assertPackDryRun();
assertReadmeConsumerGuidance();
assertAgentConsumerUsageGuide();
assertComponentTokenAuditContract();
runCommand("npm run audit:component-tokens", "npm", ["run", "audit:component-tokens"]);
assertAgentRunContract();
runCommand("npm run agents:validate-run", "npm", [
  "run",
  "agents:validate-run",
  "--",
  "docs/agents/runs/2026-07-06-stabilize-recent-components",
]);
assertPathWithSpacesBuild();

console.log(`Checks: ${checks}`);
if (errors.length) {
  console.log(`\nFAIL - ${errors.length} scenario issue(s):`);
  for (const error of errors) console.log(`- ${error}`);
  process.exit(1);
}

console.log("\nPASS - audit scenarios covered");
