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
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { readState, validateState } from "./agents/lib/run-state.mjs";
import { RUNTIME_BY_SLUG } from "./lib/component-catalog.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
let checks = 0;
const runtimeEntries = Object.entries(RUNTIME_BY_SLUG);
const skipLocalFigma = process.argv.includes("--skip-local-figma");
const npmCacheDir = path.join(os.tmpdir(), "npm-cache-ds-tis-scenarios");

function runtimeFile(runtime) {
  return `js/${runtime.module.replace("ds-tis/", "")}.js`;
}

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

function listHtmlFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listHtmlFiles(absolutePath, files);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(absolutePath);
    }
  }
  return files;
}

function runCommand(label, command, args) {
  const finalArgs = command === "npm"
    ? ["--cache", npmCacheDir, ...args]
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
    "js/package.json",
    "js/theme/",
    ...runtimeEntries.map(([, runtime]) => runtimeFile(runtime)),
  ];
  const expectedExports = [
    ".",
    "./css",
    "./css/design-system.css",
    "./theme",
    "./theme/*",
    "./templates/*",
    "./package.json",
    ...runtimeEntries.flatMap(([, runtime]) => {
      const slug = runtime.module.replace("ds-tis/", "");
      return [`./${slug}`, `./${slug}.js`];
    }),
  ];

  for (const entry of expectedFiles) {
    ok(pkg.files.includes(entry), `package.json files missing ${entry}`);
  }
  for (const key of expectedExports) {
    ok(Object.hasOwn(pkg.exports, key), `package.json exports missing ${key}`);
  }
  ok(
    pkg.scripts?.prepublishOnly?.includes("test:app-ready -- --release"),
    "prepublishOnly must run the executable App-ready gate in non-bypassable release mode",
  );
  ok(
    !`${pkg.scripts?.prepack || ""} ${pkg.scripts?.prepare || ""}`.includes("test:app-ready"),
    "test:app-ready must not run in prepack/prepare because consumer smoke invokes npm pack",
  );

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
  for (const [slug, runtime] of runtimeEntries) {
    const publicModule = await import(runtime.module);
    for (const exportName of runtime.exports) {
      ok(
        typeof publicModule[exportName] === "function",
        `${runtime.module} must export ${exportName}() for ${slug}`,
      );
    }
  }
  const theme = await import("ds-tis/theme");

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
    "js/package.json",
    "js/theme/index.js",
    "package.json",
    "README.md",
    ...runtimeEntries.map(([, runtime]) => runtimeFile(runtime)),
  ]) {
    ok(files.has(rel), `npm package missing ${rel}`);
  }
}

function assertReadmeConsumerGuidance() {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  ok(!readme.includes("cdn.example.com"), "README must not document the placeholder CDN");
  ok(
    readme.includes("github:tis-experience/ds-tis"),
    "README must document GitHub install while npm registry publish is pending",
  );
  ok(
    /ainda não está no npm registry|não está no npm registry/i.test(readme),
    "README must state that the package is not on the npm registry yet",
  );
  ok(
    !/```(?:bash)?\s*\nnpm install ds-tis\s*\n```/.test(readme),
    "README must not present bare `npm install ds-tis` as the current install path",
  );
  ok(readme.includes("import 'ds-tis/css'"), "README must document CSS package import");
  for (const [, runtime] of runtimeEntries) {
    ok(readme.includes(runtime.module), `README must document ${runtime.module} package import`);
  }
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
    ...runtimeEntries.map(([, runtime]) => runtime.module),
  ]) {
    ok(guideMd.includes(required), `agent consumer guide missing ${required}`);
  }
}

function assertDocumentationLogoContract() {
  const htmlFiles = [
    path.join(ROOT, "index.html"),
    ...listHtmlFiles(path.join(ROOT, "docs")),
  ];

  for (const absolutePath of htmlFiles) {
    const rel = path.relative(ROOT, absolutePath);
    const html = fs.readFileSync(absolutePath, "utf8");
    const headerMatches = [...html.matchAll(/<a href="[^"]+" class="ds-site-header__brand"[^>]*>[\s\S]*?<\/a>/g)];
    const modeToggleMatches = [...html.matchAll(/<button class="ds-button ds-button--ghost ds-button--sm" id="mode-toggle"[^>]*>[\s\S]*?<\/button>/g)];

    ok(headerMatches.length === 1, `${rel} must include one site brand link`);
    ok(modeToggleMatches.length === 1, `${rel} must include one site mode toggle`);

    for (const match of headerMatches) {
      const header = match[0];
      const img = header.match(/<img class="ds-site-header__logo" src="([^"]+)" alt="TIS" width="36" height="36">/);

      ok(header.includes('aria-label="TIS Design System"'), `${rel} brand link must expose an accessible label`);
      ok(Boolean(img), `${rel} must use the TIS symbol with alt and stable dimensions`);
      ok(!header.includes("logo-tis.svg"), `${rel} must not use the full TIS wordmark asset`);
      ok(header.includes("ds-site-header__brand-separator"), `${rel} must render the TIS | Design System separator`);
      ok(
        header.includes('class="ds-site-header__title ds-site-header__title--brand">TIS</span>'),
        `${rel} must render the TIS brand word`
      );
      ok(
        header.includes('class="ds-site-header__title ds-site-header__title--product">Design System</span>'),
        `${rel} must render the header product name as Design System`
      );
      ok(!header.includes('style="'), `${rel} brand link must not depend on inline styles`);
      ok(!header.includes("Design System TIS"), `${rel} header must not use the old Design System TIS title`);

      if (!img) continue;
      const logoPath = path.resolve(path.dirname(absolutePath), img[1]);
      ok(path.basename(logoPath) === "logo-tis-mark.svg", `${rel} must point to logo-tis-mark.svg`);
      ok(fs.existsSync(logoPath), `${rel} logo src must resolve to an existing file: ${img[1]}`);
    }

    for (const match of modeToggleMatches) {
      const modeToggle = match[0];

      ok(modeToggle.includes('class="ds-button__icon ds-site-header__mode-icon"'), `${rel} mode toggle icon must use Button icon anatomy`);
      ok(modeToggle.includes('fill="none"'), `${rel} mode toggle icon must use stroke icon rendering`);
      ok(modeToggle.includes('stroke="currentColor"'), `${rel} mode toggle icon must inherit currentColor stroke`);
      ok(modeToggle.includes('stroke-linejoin="round"'), `${rel} mode toggle icon must preserve rounded Lucide joins`);
      ok(modeToggle.includes('<span class="ds-button__label">Dark</span>'), `${rel} mode toggle label must use Button label anatomy`);
      ok(!modeToggle.includes('fill="currentColor"'), `${rel} mode toggle must not use filled icon rendering`);
    }
  }
}

function assertVisualBaselinePlatformContract() {
  const visualRunner = fs.readFileSync(path.join(ROOT, "scripts/test-visual.mjs"), "utf8");

  ok(
    visualRunner.includes("CANONICAL_BASELINE_DIR"),
    "test-visual must keep the Linux/CI baseline explicit",
  );
  ok(
    visualRunner.includes("PLATFORM_BASELINE_DIR"),
    "test-visual must support platform-specific visual baselines",
  );
  ok(
    visualRunner.includes("DS_VISUAL_BASELINE_DIR"),
    "test-visual must allow an explicit visual baseline override",
  );
  ok(
    visualRunner.includes("process.platform !== 'linux'"),
    "test-visual must keep Linux/CI on the canonical baseline",
  );
  ok(
    fileExists("tests/visual/baseline/index-light.png"),
    "canonical visual baseline must exist for CI",
  );
  ok(
    fileExists("tests/visual/baseline-darwin/index-light.png"),
    "macOS visual baseline must exist for local runs",
  );
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
assertDocumentationLogoContract();
assertVisualBaselinePlatformContract();
if (skipLocalFigma) {
  console.log("SKIP - checks Figma locais (.figma-snapshot.json não é versionado no CI)");
} else {
  assertComponentTokenAuditContract();
  runCommand("npm run audit:component-tokens", "npm", ["run", "audit:component-tokens"]);
}
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
