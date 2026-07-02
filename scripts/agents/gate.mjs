#!/usr/bin/env node

import path from "node:path";

import {
  GATE_STATUSES,
  ROOT,
  isGateApproved,
  readState,
  resolveRunDir,
  stateGate,
  validateState,
  writeState,
} from "./lib/run-state.mjs";

function usage() {
  console.log(`Usage:
  npm run agents:gate -- <runDir>                          mostra estado dos gates
  npm run agents:gate -- <runDir> --set <gateId> --status <status>
  npm run agents:gate -- <runDir> --approve <gateId> [--note "..."]
  npm run agents:gate -- <runDir> --record-check <name> --exit <code> [--note "..."]
  npm run agents:gate -- <runDir> --snapshot <id> [--generated-at <iso>] [--snapshot-path <path>]

Status válidos: ${GATE_STATUSES.join(", ")}`);
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
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (args.help || args._.length === 0) {
  usage();
  process.exit(args.help ? 0 : 1);
}

const runDir = resolveRunDir(args._[0]);
const relRunDir = path.relative(ROOT, runDir);
const state = readState(runDir);

if (!state) {
  console.error(`state.json ausente em ${relRunDir}. Recrie a run com agents:create-run.`);
  process.exit(1);
}

const now = new Date().toISOString();

function requireGate(id) {
  const gate = stateGate(state, id);
  if (!gate) {
    console.error(`Gate desconhecido: ${id}`);
    process.exit(1);
  }
  return gate;
}

function recomputeCurrentGate() {
  const next = state.gates.find((gate) => gate.status !== "approved");
  state.currentGate = next ? next.id : null;
}

let mutated = false;

if (args.snapshot && typeof args.snapshot === "string") {
  state.figmaSnapshot = {
    id: args.snapshot,
    generatedAt: typeof args["generated-at"] === "string" ? args["generated-at"] : now,
    path: typeof args["snapshot-path"] === "string" ? args["snapshot-path"] : state.figmaSnapshot?.path ?? null,
  };
  mutated = true;
  console.log(`Snapshot registrado: ${args.snapshot}`);
}

if (args["record-check"]) {
  const name = args["record-check"];
  if (typeof name !== "string") {
    console.error("--record-check exige um nome.");
    process.exit(1);
  }
  const exitCode = args.exit !== undefined ? Number(args.exit) : null;
  if (exitCode === null || Number.isNaN(exitCode)) {
    console.error("--record-check exige --exit <code> numérico.");
    process.exit(1);
  }
  state.checks[name] = {
    exit: exitCode,
    passed: exitCode === 0,
    note: typeof args.note === "string" ? args.note : null,
    recordedAt: now,
  };
  mutated = true;
  console.log(`Check "${name}" registrado: exit ${exitCode} (${exitCode === 0 ? "passou" : "falhou"}).`);
}

if (args.set) {
  const gate = requireGate(args.set);
  const status = args.status;
  if (!GATE_STATUSES.includes(status)) {
    console.error(`Status inválido: ${status}. Use um de: ${GATE_STATUSES.join(", ")}`);
    process.exit(1);
  }
  gate.status = status;
  gate.updatedAt = now;
  mutated = true;
  console.log(`Gate "${gate.id}" -> status "${status}".`);
}

if (args.approve) {
  const gate = requireGate(args.approve);
  for (const requiredId of gate.requires || []) {
    if (!isGateApproved(state, requiredId)) {
      console.error(
        `Não é possível aprovar "${gate.id}": pré-requisito "${requiredId}" ainda não está aprovado.`
      );
      process.exit(1);
    }
  }
  gate.status = "approved";
  gate.updatedAt = now;
  gate.ownerApproval = {
    at: now,
    note: typeof args.note === "string" ? args.note : null,
  };
  mutated = true;
  console.log(`Gate "${gate.id}" aprovado.`);
}

if (mutated) {
  recomputeCurrentGate();
  const errors = validateState(state);
  if (errors.length) {
    console.error("");
    console.error("Estado resultante é inválido; nada foi gravado:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  writeState(runDir, state);
}

// Sempre imprime o resumo ao final.
console.log("");
console.log(`Run: ${relRunDir}`);
console.log(`Current gate: ${state.currentGate ?? "(completa)"}`);
console.log("");
console.log("Gates:");
for (const gate of state.gates) {
  const approval = gate.ownerApproval ? " (owner OK)" : "";
  console.log(`  ${gate.id.padEnd(12)} ${gate.status}${approval}`);
}
const checkNames = Object.keys(state.checks);
if (checkNames.length) {
  console.log("");
  console.log("Checks:");
  for (const name of checkNames) {
    const check = state.checks[name];
    console.log(`  ${name.padEnd(24)} exit ${check.exit} (${check.passed ? "passou" : "falhou"})`);
  }
}
