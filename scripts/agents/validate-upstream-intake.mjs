#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const RUNS_ROOT = path.join(ROOT, "docs/agents/runs");
const PROCESS = path.join(ROOT, "docs/process-upstream-component-intake.md");
const SCHEMA = path.join(ROOT, "docs/agents/templates/upstream-intake.schema.json");
const REQUIRED_GATES = [
  "current-state",
  "upstream-benchmark",
  "current-contract",
  "improvement-classification",
  "brief-owner-approval",
  "figma-outcome",
  "output-implementation",
  "parity-validation",
  "documentation-selector",
  "release",
];
const BLOCKED_ACTIONS = [
  "figma-write",
  "web-core-write",
  "adapter-write",
  "commit-push-release",
];
const GATE_STATUSES = new Set([
  "pending",
  "in_progress",
  "blocked",
  "done",
  "approved",
  "not_applicable",
]);
const COMPLETE_GATE_STATUSES = new Set(["done", "approved", "not_applicable"]);
const OUTPUT_STATUSES = new Set([
  "stable",
  "benchmark-only",
  "planned",
  "unavailable",
  "beta",
  "implemented",
  "validated",
]);
const REQUIRED_OUTPUTS = new Map([
  ["web-html-css-js", "native-web"],
  ["ark-zag", "ark-zag"],
  ["react-shadcn-base-ui", "base-ui"],
]);
const REQUIRED_DOCUMENTATION_ORDER = [
  "web-html-css-js",
  "ark-zag",
  "react-shadcn-base-ui",
];
const FIGMA_OUTCOME_STATUSES = new Set([
  "pending-current-audit",
  "unchanged-with-evidence-proposed",
  "improvement-proposal",
  "approved-unchanged",
  "approved-improvement",
]);
const LOCAL_FIGMA_SNAPSHOT_PATH = /^\.figma-snapshot(?:\.[^/]+)?\.json$/;

const errors = [];

function fail(file, message) {
  errors.push(`${path.relative(ROOT, file)}: ${message}`);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireObject(file, parent, key) {
  if (!isObject(parent?.[key])) {
    fail(file, `missing object ${key}`);
    return {};
  }
  return parent[key];
}

function requireString(file, parent, key) {
  if (typeof parent?.[key] !== "string" || parent[key].trim() === "") {
    fail(file, `missing string ${key}`);
    return "";
  }
  return parent[key];
}

function moduleFamilies(modules) {
  const normalized = modules.map((item) => item.toLowerCase());
  return {
    base: normalized.some((item) => item.includes("@base-ui/") || item.includes("base ui")),
    ark: normalized.some(
      (item) => item.includes("@ark-ui/") || item.includes("@zag-js/") || item.includes("ark ui") || item.includes("zag")
    ),
  };
}

function isLocalFigmaSnapshotEvidence(item, evidencePath, scope) {
  return item.type === "figma-snapshot"
    && scope === "repo"
    && LOCAL_FIGMA_SNAPSHOT_PATH.test(evidencePath);
}

function validateManifest(file) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(file, `invalid JSON: ${error.message}`);
    return;
  }

  if (data.schema !== "ds-tis/upstream-intake") fail(file, "invalid schema marker");
  if (data.schemaVersion !== 2) fail(file, "schemaVersion must be 2");
  requireString(file, data, "id");

  const component = requireObject(file, data, "component");
  requireString(file, component, "name");
  requireString(file, component, "slug");
  requireString(file, component, "classification");

  const authorization = requireObject(file, data, "authorization");
  if (!Array.isArray(authorization.approvedScope) || authorization.approvedScope.length === 0) {
    fail(file, "authorization.approvedScope must be a non-empty array");
  }
  if (!Array.isArray(authorization.blockedActions)) {
    fail(file, "authorization.blockedActions must be an array");
  } else {
    for (const action of BLOCKED_ACTIONS) {
      if (!authorization.blockedActions.includes(action)) {
        fail(file, `authorization.blockedActions missing ${action}`);
      }
    }
  }
  requireString(file, authorization, "ownerDecision");

  const baseline = requireObject(file, data, "baseline");
  const figma = requireObject(file, baseline, "figma");
  const sharedContract = requireObject(file, baseline, "sharedContract");
  if (figma.providerAgnostic !== true) fail(file, "baseline.figma must be provider-agnostic");
  if (sharedContract.providerAgnostic !== true) {
    fail(file, "baseline.sharedContract must be provider-agnostic");
  }
  if (sharedContract.sharedByAllOutputs !== true) {
    fail(file, "baseline.sharedContract.sharedByAllOutputs must be true");
  }

  if (!Array.isArray(data.outputs) || data.outputs.length !== REQUIRED_OUTPUTS.size) {
    fail(file, "outputs must contain exactly the three canonical outputs");
  } else {
    const ids = new Set();
    for (const [index, output] of data.outputs.entries()) {
      const prefix = `outputs[${index}]`;
      const id = requireString(file, output, "id");
      if (ids.has(id)) fail(file, `${prefix}.id is duplicated: ${id}`);
      ids.add(id);
      requireString(file, output, "label");
      const expectedFamily = REQUIRED_OUTPUTS.get(id);
      if (!expectedFamily) {
        fail(file, `${prefix}.id is not a canonical output: ${id}`);
      } else if (output.technologyFamily !== expectedFamily) {
        fail(file, `${prefix}.technologyFamily must be ${expectedFamily}`);
      }
      const distribution = requireObject(file, output, "distribution");
      requireString(file, distribution, "channel");
      const resolutionContext = requireObject(file, output, "resolutionContext");
      if (id === "react-shadcn-base-ui" && resolutionContext.base !== "base") {
        fail(file, `${prefix}.resolutionContext.base must be base`);
      }
      if (id === "react-shadcn-base-ui" && distribution.channel !== "shadcn-registry") {
        fail(file, `${prefix}.distribution.channel must be shadcn-registry`);
      }
      if (id === "ark-zag") {
        requireString(file, resolutionContext, "arkVersion");
        requireString(file, resolutionContext, "zagVersion");
      }
      if (id === "web-html-css-js" && distribution.channel !== "npm") {
        fail(file, `${prefix}.distribution.channel must be npm`);
      }
      if (!OUTPUT_STATUSES.has(output.status)) {
        fail(file, `${prefix}.status is invalid: ${output.status}`);
      }
      if (!Array.isArray(output.sourceModules)) {
        fail(file, `${prefix}.sourceModules must be an array`);
      } else {
        const families = moduleFamilies(output.sourceModules.map(String));
        if (families.base && families.ark) {
          fail(file, `${prefix} mixes Base UI and Ark/Zag modules`);
        }
        if (id === "react-shadcn-base-ui" && families.ark) {
          fail(file, `${prefix} is React/shadcn/Base UI but imports Ark/Zag`);
        }
        if (id === "ark-zag" && families.base) {
          fail(file, `${prefix} is Ark/Zag but imports Base UI`);
        }
      }
      requireString(file, output, "writeStatus");
    }
    for (const id of REQUIRED_OUTPUTS.keys()) {
      if (!ids.has(id)) fail(file, `outputs missing canonical output ${id}`);
    }
  }

  const separation = requireObject(file, data, "separation");
  for (const field of [
    "outputsCoexist",
    "outputSourcesMustRemainSeparate",
    "oneOutputCannotReplaceAnother",
    "sharedContractDoesNotMeanSharedImplementation",
  ]) {
    if (separation[field] !== true) fail(file, `separation.${field} must be true`);
  }

  const parity = requireObject(file, data, "parity");
  if (!Array.isArray(parity.requiredDimensions) || parity.requiredDimensions.length < 5) {
    fail(file, "parity.requiredDimensions must contain at least five common dimensions");
  }
  if (!new Set(["pending", "approved"]).has(parity.status)) {
    fail(file, "parity.status must be pending or approved");
  }
  if (parity.selectsWinner !== false) {
    fail(file, "parity.selectsWinner must be false");
  }
  if (parity.allowsDocumentedDifferences !== true) {
    fail(file, "parity.allowsDocumentedDifferences must be true");
  }
  for (const forbiddenField of ["selectedCandidate", "selectedProvider", "selectedOutput"]) {
    if (forbiddenField in parity || forbiddenField in data) {
      fail(file, `${forbiddenField} is forbidden because outputs coexist`);
    }
  }
  if (parity.status === "approved" && !isObject(parity.ownerApproval)) {
    fail(file, "approved parity requires parity.ownerApproval");
  }

  const documentation = requireObject(file, data, "documentation");
  if (documentation.selectionMode !== "user-choice") {
    fail(file, "documentation.selectionMode must be user-choice");
  }
  if (documentation.defaultTrack !== "web-html-css-js") {
    fail(file, "documentation.defaultTrack must be web-html-css-js");
  }
  if (documentation.showsUnavailableState !== true) {
    fail(file, "documentation.showsUnavailableState must be true");
  }
  if (JSON.stringify(documentation.trackIds) !== JSON.stringify(REQUIRED_DOCUMENTATION_ORDER)) {
    fail(file, "documentation.trackIds must contain the three canonical outputs in stable order");
  }

  const figmaOutcome = requireObject(file, data, "figmaOutcome");
  if (!FIGMA_OUTCOME_STATUSES.has(figmaOutcome.status)) {
    fail(file, `figmaOutcome.status is invalid: ${figmaOutcome.status}`);
  }
  if (!Array.isArray(figmaOutcome.allowedOutcomes) || !figmaOutcome.allowedOutcomes.includes("unchanged-with-evidence") || !figmaOutcome.allowedOutcomes.includes("improvement-proposal")) {
    fail(file, "figmaOutcome must allow unchanged-with-evidence and improvement-proposal");
  }
  if (figmaOutcome.requiresOwnerApproval !== true) {
    fail(file, "figmaOutcome.requiresOwnerApproval must be true");
  }

  if (!Array.isArray(data.gates)) {
    fail(file, "gates must be an array");
  } else {
    const gateMap = new Map(data.gates.map((gate) => [gate.id, gate]));
    let earlierIncomplete = false;
    for (const id of REQUIRED_GATES) {
      const gate = gateMap.get(id);
      if (!gate) {
        fail(file, `missing gate ${id}`);
        earlierIncomplete = true;
        continue;
      }
      if (!GATE_STATUSES.has(gate.status)) {
        fail(file, `gate ${id} has invalid status: ${gate.status}`);
        earlierIncomplete = true;
        continue;
      }
      const complete = COMPLETE_GATE_STATUSES.has(gate.status);
      if (complete && earlierIncomplete) {
        fail(file, `gate ${id} advanced before an earlier intake gate completed`);
      }
      if (!complete) earlierIncomplete = true;
      if (gate.status === "approved" && !isObject(gate.ownerApproval)) {
        fail(file, `approved gate ${id} requires ownerApproval`);
      }
    }
  }

  if (!Array.isArray(data.evidence) || data.evidence.length === 0) {
    fail(file, "evidence must be a non-empty array");
  } else {
    for (const [index, item] of data.evidence.entries()) {
      requireString(file, item, "type");
      const evidencePath = requireString(file, item, "path");
      const scope = requireString(file, item, "scope");
      requireString(file, item, "status");
      requireString(file, item, "freshness");
      if (item.status === "current" && item.freshness === "stale") {
        fail(file, `evidence[${index}] cannot be current and stale`);
      }
      if (!new Set(["run", "repo", "url"]).has(scope)) {
        fail(file, `evidence[${index}].scope is invalid: ${scope}`);
      } else if (scope === "url") {
        if (!/^https:\/\//.test(evidencePath)) {
          fail(file, `evidence[${index}] URL evidence must use https`);
        }
      } else if (evidencePath) {
        const base = scope === "run" ? path.dirname(file) : ROOT;
        const resolved = path.resolve(base, evidencePath);
        // Snapshots Figma são evidência local e gitignored por contrato. O
        // manifest deve preservar a referência, mas clones limpos e CI não
        // podem exigir que o ficheiro privado esteja materializado.
        if (!fs.existsSync(resolved) && !isLocalFigmaSnapshotEvidence(item, evidencePath, scope)) {
          fail(file, `evidence[${index}] path does not exist: ${evidencePath}`);
        }
      }
    }
  }
}

for (const requiredFile of [PROCESS, SCHEMA]) {
  if (!fs.existsSync(requiredFile)) fail(requiredFile, "required governance file is missing");
}

const requestedManifests = process.argv.slice(2).map((input) => path.resolve(ROOT, input));
const manifests = requestedManifests.length > 0
  ? requestedManifests
  : fs.existsSync(RUNS_ROOT)
    ? fs
        .readdirSync(RUNS_ROOT, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(RUNS_ROOT, entry.name, "upstream-intake.json"))
        .filter((file) => fs.existsSync(file))
    : [];

if (manifests.length === 0) {
  errors.push("no docs/agents/runs/*/upstream-intake.json manifests found");
}

for (const manifest of manifests) {
  if (!fs.existsSync(manifest)) {
    fail(manifest, "manifest does not exist");
    continue;
  }
  validateManifest(manifest);
}

if (errors.length > 0) {
  console.error("agents:validate-intake failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`agents:validate-intake ok: ${manifests.length} manifest(s)`);
