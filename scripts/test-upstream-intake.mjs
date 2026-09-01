#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const VALIDATOR = path.join(ROOT, "scripts/agents/validate-upstream-intake.mjs");
const VALID_MANIFEST = path.join(
  ROOT,
  "docs/agents/runs/2026-08-03-popover-upstream-intake/upstream-intake.json"
);

function run(args = []) {
  return spawnSync(process.execPath, [VALIDATOR, ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

const valid = run();
if (valid.status !== 0) {
  console.error(valid.stdout);
  console.error(valid.stderr);
  throw new Error("canonical upstream intake manifest must pass validation");
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ds-tis-upstream-intake-"));
try {
  const canonical = JSON.parse(fs.readFileSync(VALID_MANIFEST, "utf8"));
  const expectInvalid = (name, mutate, expectedDiagnostic) => {
    const manifest = structuredClone(canonical);
    mutate(manifest);
    const invalidPath = path.join(tempDir, `${name}.json`);
    fs.writeFileSync(invalidPath, `${JSON.stringify(manifest, null, 2)}\n`);
    const invalid = run([invalidPath]);
    const diagnostic = `${invalid.stdout}\n${invalid.stderr}`;
    if (invalid.status === 0 || !diagnostic.includes(expectedDiagnostic)) {
      console.error(diagnostic);
      throw new Error(`validator must reject ${name}`);
    }
  };

  expectInvalid(
    "mixed-provider",
    (manifest) => {
      manifest.outputs
        .find((output) => output.id === "react-shadcn-base-ui")
        .sourceModules.push("@ark-ui/react/popover");
    },
    "mixes Base UI and Ark/Zag modules"
  );

  expectInvalid(
    "missing-base-context",
    (manifest) => {
      delete manifest.outputs.find(
        (output) => output.id === "react-shadcn-base-ui"
      ).resolutionContext;
    },
    "missing object resolutionContext"
  );

  expectInvalid(
    "missing-output",
    (manifest) => {
      manifest.outputs = manifest.outputs.filter((output) => output.id !== "ark-zag");
    },
    "outputs must contain exactly the three canonical outputs"
  );

  expectInvalid(
    "winner-selection",
    (manifest) => {
      manifest.parity.selectsWinner = true;
      manifest.parity.selectedCandidate = "react-shadcn-base-ui";
    },
    "parity.selectsWinner must be false"
  );

  expectInvalid(
    "missing-documentation-track",
    (manifest) => {
      manifest.documentation.trackIds.pop();
    },
    "documentation.trackIds must contain the three canonical outputs in stable order"
  );

  expectInvalid(
    "missing-evidence",
    (manifest) => {
      manifest.evidence[0].path = "evidence/does-not-exist.md";
    },
    "path does not exist"
  );
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log(
  "test:upstream-intake ok: three coexisting outputs accepted; provider mixing, winner selection, incomplete docs and missing evidence rejected"
);
