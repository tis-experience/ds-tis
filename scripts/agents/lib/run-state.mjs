import fs from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(import.meta.dirname, "../../..");
export const RUNS_ROOT = path.join(ROOT, "docs/agents/runs");
export const STATE_FILE = "state.json";
export const STATE_VERSION = 1;

/**
 * Canonical gate definitions for an agent run.
 *
 * Each gate maps a role to its artifacts and declares which upstream gates must
 * be `approved` before it can start. This is the single source of truth shared
 * by create-run, next-step and gate scripts so the pipeline order cannot drift.
 */
export const GATES = [
  {
    id: "brief",
    role: "DS Architect",
    roleFile: "docs/agents/roles/ds-architect.md",
    checklist: "docs/process-ai-component-workflow.md",
    artifacts: ["01-brief.md", "02-figma-spec.md"],
    requires: [],
    needsOwnerApproval: true,
    output: "01-brief.md and 02-figma-spec.md",
    blocked: "Figma write, repo sync, commit/push",
    prompt: "Planeje esta run como DS Architect.",
  },
  {
    id: "figma-build",
    role: "Figma Builder",
    roleFile: "docs/agents/roles/figma-builder.md",
    checklist: "docs/agents/checklists/figma-build-checklist.md",
    artifacts: ["03-figma-build-report.md"],
    requires: ["brief"],
    needsOwnerApproval: false,
    output: "03-figma-build-report.md",
    blocked: "Figma approval as final, repo sync, commit/push",
    prompt: "Execute a matriz de contrato aprovada como Figma Builder.",
  },
  {
    id: "figma-audit",
    role: "Figma Auditor",
    roleFile: "docs/agents/roles/figma-auditor.md",
    checklist: "docs/agents/checklists/figma-audit-checklist.md",
    artifacts: ["04-figma-audit-report.md"],
    requires: ["figma-build"],
    needsOwnerApproval: true,
    output: "04-figma-audit-report.md",
    blocked: "Any Figma or repo write",
    prompt: "Audite esta run como Figma Auditor.",
  },
  {
    id: "token-sync",
    role: "Token Sync Agent",
    roleFile: "docs/agents/roles/token-sync-agent.md",
    checklist: "docs/agents/checklists/token-sync-checklist.md",
    artifacts: ["05-repo-sync-plan.md"],
    requires: ["figma-audit"],
    needsOwnerApproval: false,
    output: "05-repo-sync-plan.md",
    blocked: "Repo write without approved plan, commit/push",
    prompt: "Leve o Figma aprovado para o repo como Token Sync Agent.",
  },
  {
    id: "repo",
    role: "Repo Component Agent",
    roleFile: "docs/agents/roles/repo-component-agent.md",
    checklist: "docs/agents/checklists/repo-implementation-checklist.md",
    artifacts: ["06-repo-implementation-report.md"],
    requires: ["token-sync"],
    needsOwnerApproval: true,
    output: "06-repo-implementation-report.md",
    blocked: "Release, commit/push",
    prompt: "Implemente no repo como Repo Component Agent.",
  },
  {
    id: "release",
    role: "Release Agent",
    roleFile: "docs/agents/roles/release-agent.md",
    checklist: "docs/agents/checklists/release-checklist.md",
    artifacts: ["07-release-report.md"],
    requires: ["repo"],
    needsOwnerApproval: true,
    output: "07-release-report.md",
    blocked: "Production unless explicitly authorized",
    prompt: "Publique como Release Agent somente com autorizacao explicita.",
  },
];

export const GATE_STATUSES = ["pending", "in_progress", "done", "blocked", "approved"];

export function gateById(id) {
  return GATES.find((gate) => gate.id === id) || null;
}

export function resolveRunDir(input) {
  if (!input) {
    throw new Error("Missing run directory");
  }
  const abs = path.resolve(ROOT, input);
  if (abs !== RUNS_ROOT && !abs.startsWith(RUNS_ROOT + path.sep)) {
    throw new Error("Run directory must be inside docs/agents/runs");
  }
  return abs;
}

export function statePath(runDir) {
  return path.join(runDir, STATE_FILE);
}

export function createInitialState({ runId, title, date }) {
  return {
    schema: "ds-core/agent-run-state",
    version: STATE_VERSION,
    runId,
    title,
    createdAt: date,
    updatedAt: date,
    figmaSnapshot: { id: null, generatedAt: null, path: null },
    currentGate: GATES[0].id,
    gates: GATES.map((gate) => ({
      id: gate.id,
      role: gate.role,
      artifacts: gate.artifacts.slice(),
      requires: gate.requires.slice(),
      needsOwnerApproval: gate.needsOwnerApproval,
      status: "pending",
      ownerApproval: null,
      updatedAt: null,
    })),
    checks: {},
  };
}

export function readState(runDir) {
  const file = statePath(runDir);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`Invalid ${STATE_FILE}: ${error.message}`);
  }
}

export function writeState(runDir, state) {
  state.updatedAt = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(statePath(runDir), `${JSON.stringify(state, null, 2)}\n`);
}

export function stateGate(state, id) {
  return state.gates.find((gate) => gate.id === id) || null;
}

export function isGateApproved(state, id) {
  const gate = stateGate(state, id);
  if (!gate) return false;
  if (gate.status !== "approved") return false;
  if (gate.needsOwnerApproval && !gate.ownerApproval) return false;
  return true;
}

/**
 * Validate the structural integrity of a run state object. Returns an array of
 * human-readable error strings (empty when valid).
 */
export function validateState(state) {
  const errors = [];
  if (!state || typeof state !== "object") {
    return ["state.json is not an object"];
  }
  if (state.schema !== "ds-core/agent-run-state") {
    errors.push("state.json missing schema marker ds-core/agent-run-state");
  }
  if (!Array.isArray(state.gates)) {
    errors.push("state.json missing gates array");
    return errors;
  }
  const expectedIds = GATES.map((gate) => gate.id);
  const actualIds = state.gates.map((gate) => gate.id);
  for (const id of expectedIds) {
    if (!actualIds.includes(id)) errors.push(`state.json missing gate: ${id}`);
  }
  for (const gate of state.gates) {
    if (!GATE_STATUSES.includes(gate.status)) {
      errors.push(`gate ${gate.id} has invalid status: ${gate.status}`);
    }
    if (gate.status === "approved" && gate.needsOwnerApproval && !gate.ownerApproval) {
      errors.push(`gate ${gate.id} is approved but has no ownerApproval record`);
    }
  }
  // A gate cannot be done/approved while a required upstream gate is not approved.
  for (const gate of state.gates) {
    const advanced = gate.status === "done" || gate.status === "approved";
    if (!advanced) continue;
    for (const requiredId of gate.requires || []) {
      if (!isGateApproved(state, requiredId)) {
        errors.push(`gate ${gate.id} advanced before required gate ${requiredId} was approved`);
      }
    }
  }
  return errors;
}
