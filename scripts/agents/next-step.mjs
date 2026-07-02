#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import {
  GATES,
  ROOT,
  gateById,
  isGateApproved,
  readState,
  resolveRunDir,
  stateGate,
} from "./lib/run-state.mjs";

function usage() {
  console.log("Usage: npm run agents:next-step -- docs/agents/runs/YYYY-MM-DD-slug");
}

function isArtifactPending(file) {
  if (!fs.existsSync(file)) return true;
  const body = fs.readFileSync(file, "utf8");
  return /^- Status:\s*(Pending|Pendente)\s*$/im.test(body);
}

function printHandoff(gate, relRunDir) {
  console.log(`Run: ${relRunDir}`);
  console.log(`Role: ${gate.role}`);
  console.log(`Role file: ${gate.roleFile}`);
  console.log(`Checklist: ${gate.checklist}`);
  console.log(`Expected output: ${gate.output}`);
  console.log(`Blocked before: ${gate.blocked}`);
  console.log("");
  console.log("Suggested prompt:");
  console.log("```txt");
  console.log(`Atue como ${gate.role} para o DS Core.`);
  console.log(`Use esta run: ${relRunDir}`);
  console.log(
    `Leia AGENTS.md, docs/agents/protocol.md, docs/agents/grounding.md, ${gate.roleFile} e ${gate.checklist}.`
  );
  console.log(gate.prompt);
  console.log(`Produza: ${gate.output}.`);
  console.log(`Bloqueado antes de: ${gate.blocked}.`);
  console.log("Nao assuma outra role.");
  console.log("```");
}

const input = process.argv[2];
if (!input) {
  usage();
  process.exit(1);
}

const runDir = resolveRunDir(input);
const relRunDir = path.relative(ROOT, runDir);
const state = readState(runDir);

if (!state) {
  // Legacy fallback: state.json absent (run created before hardening).
  console.log(`Aviso: ${relRunDir}/state.json ausente. Usando modo legado por arquivo.`);
  console.log("Recrie a run com agents:create-run para habilitar o porteiro de gates.");
  console.log("");
  const next = GATES.find((gate) =>
    gate.artifacts.some((file) => isArtifactPending(path.join(runDir, file)))
  );
  if (!next) {
    console.log(`Run complete or no pending artifacts: ${relRunDir}`);
    process.exit(0);
  }
  printHandoff(next, relRunDir);
  process.exit(0);
}

// Porteiro: encontra o primeiro gate ainda não aprovado e verifica pré-requisitos.
const nextGateState = state.gates.find((gate) => gate.status !== "approved");

if (!nextGateState) {
  console.log(`Run completa: todos os gates aprovados em ${relRunDir}`);
  process.exit(0);
}

const gate = gateById(nextGateState.id);

// Bloqueio: algum pré-requisito não está aprovado.
const blockingRequirement = (gate.requires || []).find((id) => !isGateApproved(state, id));
if (blockingRequirement) {
  const req = stateGate(state, blockingRequirement);
  console.error(`BLOQUEADO: gate "${gate.id}" (${gate.role}) não pode iniciar.`);
  console.error(
    `Pré-requisito "${blockingRequirement}" está em status "${req?.status ?? "desconhecido"}", não "approved".`
  );
  console.error("");
  console.error(`Resolva o gate anterior antes de avançar:`);
  console.error(
    `  npm run agents:gate -- ${relRunDir} --approve ${blockingRequirement} --note "<motivo>"`
  );
  process.exit(1);
}

// Gate pronto, mas artefatos já preenchidos e aguardando aprovação do owner.
const artifactsPending = gate.artifacts.some((file) =>
  isArtifactPending(path.join(runDir, file))
);

if (!artifactsPending && nextGateState.status !== "approved") {
  if (gate.needsOwnerApproval && !nextGateState.ownerApproval) {
    console.log(`Run: ${relRunDir}`);
    console.log(`Gate "${gate.id}" (${gate.role}): artefatos prontos, aguardando aprovação do owner.`);
    console.log("");
    console.log("Apresente o resultado ao owner e, com o OK explícito, registre:");
    console.log(`  npm run agents:gate -- ${relRunDir} --approve ${gate.id} --note "<decisão do owner>"`);
    process.exit(0);
  }
  if (!gate.needsOwnerApproval) {
    console.log(`Run: ${relRunDir}`);
    console.log(`Gate "${gate.id}" (${gate.role}): artefatos prontos. Marque como aprovado para avançar:`);
    console.log(`  npm run agents:gate -- ${relRunDir} --approve ${gate.id}`);
    process.exit(0);
  }
}

printHandoff(gate, relRunDir);
