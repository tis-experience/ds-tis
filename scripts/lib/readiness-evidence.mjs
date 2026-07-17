import fs from 'node:fs';
import path from 'node:path';

import {
  EVIDENCE_SCHEMA,
  EVIDENCE_VERSION,
  RUNTIME_CAPABILITIES,
  requiredEvidenceFor,
  validateRequirementRegistry,
} from './app-ready-requirements.mjs';

function emptyComponentEvidence() {
  return Object.fromEntries(Object.keys(RUNTIME_CAPABILITIES).map((capability) => [capability, []]));
}
export function createEvidenceRecorder(suite) {
  const components = {};

  return {
    suite,
    pass(slug, capability, caseId) {
      const definition = RUNTIME_CAPABILITIES[capability];
      if (!definition) throw new Error(`Capability desconhecida: ${capability}`);
      if (definition.suite !== suite) {
        throw new Error(`${suite} não pode emitir ${capability}; suite dona: ${definition.suite}.`);
      }
      if (!components[slug]) components[slug] = emptyComponentEvidence();
      if (!components[slug][capability].includes(caseId)) {
        components[slug][capability].push(caseId);
      }
    },
    toJSON(passed = true) {
      return {
        schema: EVIDENCE_SCHEMA,
        version: EVIDENCE_VERSION,
        suite,
        passed: Boolean(passed),
        components,
      };
    },
  };
}

export function writeEvidenceReport(recorder, { passed, reportDir = process.env.DS_READINESS_REPORT_DIR } = {}) {
  if (!reportDir) return null;
  fs.mkdirSync(reportDir, { recursive: true });
  const target = path.join(reportDir, `${recorder.suite}.json`);
  fs.writeFileSync(target, `${JSON.stringify(recorder.toJSON(passed), null, 2)}\n`);
  return target;
}

export function readEvidenceReports(reportDir) {
  const errors = [];
  const reports = [];
  if (!reportDir || !fs.existsSync(reportDir)) {
    return { reports, errors: ['Diretório de evidências App-ready ausente.'] };
  }

  for (const file of fs.readdirSync(reportDir).filter((entry) => entry.endsWith('.json')).sort()) {
    const target = path.join(reportDir, file);
    let report;
    try {
      report = JSON.parse(fs.readFileSync(target, 'utf8'));
    } catch (error) {
      errors.push(`${file}: JSON inválido (${error.message}).`);
      continue;
    }
    if (report.schema !== EVIDENCE_SCHEMA || report.version !== EVIDENCE_VERSION) {
      errors.push(`${file}: schema/version de evidência inválido.`);
      continue;
    }
    if (report.passed !== true) {
      errors.push(`${file}: suite não concluiu com sucesso.`);
      continue;
    }
    if (!report.suite || !report.components || typeof report.components !== 'object') {
      errors.push(`${file}: relatório incompleto.`);
      continue;
    }

    for (const [slug, capabilities] of Object.entries(report.components)) {
      for (const [capability, cases] of Object.entries(capabilities || {})) {
        const definition = RUNTIME_CAPABILITIES[capability];
        if (!definition) {
          errors.push(`${file}: ${slug} emitiu capability desconhecida ${capability}.`);
        } else if (definition.suite !== report.suite && Array.isArray(cases) && cases.length > 0) {
          errors.push(`${file}: ${report.suite} emitiu ${capability}, pertencente a ${definition.suite}.`);
        } else if (!Array.isArray(cases)) {
          errors.push(`${file}: ${slug}.${capability} deve ser uma lista de case IDs.`);
        }
      }
    }
    reports.push(report);
  }

  return { reports, errors };
}

export function mergeEvidence(reports) {
  const merged = {};
  for (const report of reports) {
    for (const [slug, capabilities] of Object.entries(report.components || {})) {
      if (!merged[slug]) merged[slug] = emptyComponentEvidence();
      for (const [capability, cases] of Object.entries(capabilities || {})) {
        if (!Array.isArray(cases)) continue;
        for (const caseId of cases) {
          if (!merged[slug][capability].includes(caseId)) merged[slug][capability].push(caseId);
        }
      }
    }
  }
  return merged;
}

export function validateAppReadyEvidence({ components, runtimeBySlug, reports }) {
  const errors = validateRequirementRegistry(runtimeBySlug);
  const evidence = mergeEvidence(reports);

  for (const component of components) {
    if (component.behaviorModel !== 'ds-runtime' || component.readiness !== 'app-ready') continue;
    if (!runtimeBySlug[component.slug]) {
      errors.push(`${component.slug}: App-ready ds-runtime sem módulo público.`);
      continue;
    }
    const requirements = requiredEvidenceFor(component.slug);
    if (!requirements) continue;
    for (const [capability, requiredCases] of Object.entries(requirements)) {
      const executed = new Set(evidence[component.slug]?.[capability] || []);
      const missing = requiredCases.filter((caseId) => !executed.has(caseId));
      if (missing.length > 0) {
        errors.push(`${component.slug}: ${capability} sem evidência executada: ${missing.join(', ')}.`);
      }
    }
  }

  return errors;
}
