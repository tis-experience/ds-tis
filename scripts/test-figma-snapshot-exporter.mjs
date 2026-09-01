#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPORTER_PATH = path.join(ROOT, "figma-plugin", "snapshot-exporter", "code.js");
const VERIFIER_PATH = path.join(ROOT, "scripts", "verify-figma-structure.mjs");
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "ds-tis-figma-exporter-"));

try {
  const snapshot = await runExporter();

  assert.equal(snapshot.generator.version, "0.2.1");
  assert.equal(snapshot.structureAudit.variableAuditComplete, true);
  assert.equal(snapshot.structureAudit.issueCount, 0);
  assert.equal(snapshot.structureAudit.aliasSummary.componentAliasSemantic, 1);
  assert.equal(snapshot.structureAudit.aliasSummary.componentAliasOther, 0);

  const falsePositiveSnapshot = structuredClone(snapshot);
  falsePositiveSnapshot.generator.version = "0.4.0";
  falsePositiveSnapshot.structureAudit.issueCount = 1;
  falsePositiveSnapshot.structureAudit.grouped = { "component-alias-not-semantic": 1 };
  falsePositiveSnapshot.structureAudit.issues = [{
    scope: "variable",
    code: "component-alias-not-semantic",
    target: "button/bg/default",
    details: {
      target: "background/default",
      targetCollection: "Semantic",
    },
  }];
  falsePositiveSnapshot.structureAudit.truncated = true;
  falsePositiveSnapshot.structureAudit.pageSummary = [];

  const falsePositivePath = writeFixture("false-positive.json", falsePositiveSnapshot);
  const falsePositiveResult = runVerifier(falsePositivePath);
  assert.equal(
    falsePositiveResult.status,
    0,
    `O gate deveria recalcular a falsa ocorrência de variable.\n${falsePositiveResult.stdout}\n${falsePositiveResult.stderr}`
  );
  assert.match(falsePositiveResult.stdout, /1 issue\(s\) do exporter recalculadas pelo repo/);

  const nodeIssueSnapshot = structuredClone(snapshot);
  nodeIssueSnapshot.structureAudit.issueCount = 1;
  nodeIssueSnapshot.structureAudit.grouped = { "legacy-glyph-node": 1 };
  nodeIssueSnapshot.structureAudit.issues = [{
    scope: "node",
    code: "legacy-glyph-node",
    target: "Button / glyph",
    details: { pageName: "❖ Button", nodeId: "1:2" },
  }];
  nodeIssueSnapshot.structureAudit.truncated = false;
  nodeIssueSnapshot.structureAudit.pageSummary = [{
    pageId: "1:1",
    pageName: "❖ Button",
    issueCount: 1,
  }];

  const nodeIssuePath = writeFixture("node-issue.json", nodeIssueSnapshot);
  const nodeIssueResult = runVerifier(nodeIssuePath);
  assert.equal(nodeIssueResult.status, 1, "O gate precisa continuar bloqueando issues de nodes.");
  assert.match(nodeIssueResult.stdout, /legacy-glyph-node/);

  console.log("✅ Snapshot exporter e verificador estrutural protegidos contra falso positivo de aliases.");
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

async function runExporter() {
  const messages = [];
  const collections = [
    collection("foundation", "Foundation", "foundation-mode"),
    collection("semantic", "Semantic", "semantic-mode"),
    collection("component", "Component", "component-mode"),
  ];
  const variables = [
    variable("foundation-color", "color/blue/600", "foundation", "foundation-mode", { r: 0, g: 0.25, b: 1, a: 1 }),
    variable("semantic-background", "background/default", "semantic", "semantic-mode", alias("foundation-color")),
    variable("component-button", "button/bg/default", "component", "component-mode", alias("semantic-background")),
  ];
  const figma = {
    fileKey: "IE68amP9Hya5ieFw1rX8S8",
    root: { name: "DS TIS", children: [] },
    currentPage: null,
    variables: {
      getLocalVariableCollectionsAsync: async () => collections,
      getLocalVariablesAsync: async () => variables,
    },
    ui: {
      onmessage: null,
      postMessage: (message) => messages.push(message),
    },
    showUI: () => {},
    closePlugin: () => {},
  };

  const source = fs.readFileSync(EXPORTER_PATH, "utf8");
  vm.runInNewContext(source, { figma, __html__: "" }, { filename: EXPORTER_PATH });

  for (let attempt = 0; attempt < 20 && !messages.some((message) => message.type === "snapshot-ready"); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }

  const error = messages.find((message) => message.type === "snapshot-error");
  if (error) throw new Error(error.message);
  const ready = messages.find((message) => message.type === "snapshot-ready");
  assert.ok(ready, "O exporter não publicou snapshot-ready.");
  return ready.snapshot;
}

function collection(id, name, modeId) {
  return {
    id,
    key: `${id}-key`,
    name,
    modes: [{ modeId, name: "Default" }],
    defaultModeId: modeId,
    hiddenFromPublishing: false,
    remote: false,
  };
}

function variable(id, name, variableCollectionId, modeId, value) {
  return {
    id,
    key: `${id}-key`,
    name,
    resolvedType: typeof value === "number" ? "FLOAT" : "COLOR",
    variableCollectionId,
    valuesByMode: { [modeId]: value },
    description: "",
    scopes: ["ALL_FILLS"],
    codeSyntax: { WEB: `--ds-${name.replaceAll("/", "-")}` },
    hiddenFromPublishing: false,
    remote: false,
  };
}

function alias(id) {
  return { type: "VARIABLE_ALIAS", id };
}

function writeFixture(name, value) {
  const file = path.join(temporaryDirectory, name);
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return file;
}

function runVerifier(snapshotPath) {
  return spawnSync(process.execPath, [VERIFIER_PATH, "--snapshot", snapshotPath], {
    cwd: ROOT,
    encoding: "utf8",
  });
}
