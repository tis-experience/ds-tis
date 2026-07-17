#!/usr/bin/env node

/**
 * Teste negativo do gate App-ready.
 *
 * Mantém o enforcement exercitado mesmo enquanto todos os ds-runtime estão
 * temporariamente Experimentais: uma promoção sintética sem evidência precisa
 * falhar; a mesma promoção com todos os casos executados precisa passar.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  EVIDENCE_SCHEMA,
  EVIDENCE_VERSION,
  RUNTIME_CAPABILITIES,
  requiredEvidenceFor,
  validateRequirementRegistry,
} from './lib/app-ready-requirements.mjs';
import { COMPONENTS, RUNTIME_BY_SLUG } from './lib/component-catalog.mjs';
import { readEvidenceReports, validateAppReadyEvidence } from './lib/readiness-evidence.mjs';

const errors = [];
let checks = 0;

function ok(condition, message) {
  checks += 1;
  if (!condition) errors.push(message);
}

function allRuntimeExperimental() {
  return COMPONENTS.map((component) => (
    component.behaviorModel === 'ds-runtime'
      ? { ...component, readiness: 'experimental' }
      : component
  ));
}

function promoted(slug) {
  return allRuntimeExperimental().map((component) => (
    component.slug === slug ? { ...component, readiness: 'app-ready' } : component
  ));
}

function completeReports(slug) {
  const bySuite = {};
  const requirements = requiredEvidenceFor(slug);
  for (const [capability, cases] of Object.entries(requirements)) {
    const suite = RUNTIME_CAPABILITIES[capability].suite;
    if (!bySuite[suite]) bySuite[suite] = {};
    bySuite[suite][capability] = [...cases];
  }
  return Object.entries(bySuite).map(([suite, capabilities]) => ({
    schema: EVIDENCE_SCHEMA,
    version: EVIDENCE_VERSION,
    suite,
    passed: true,
    components: { [slug]: capabilities },
  }));
}

console.log('\n═══ test-readiness-evidence ═════════════════');

const registryErrors = validateRequirementRegistry(RUNTIME_BY_SLUG);
ok(registryErrors.length === 0, `registro de requisitos inválido: ${registryErrors.join(' | ')}`);

const experimentalErrors = validateAppReadyEvidence({
  components: allRuntimeExperimental(),
  runtimeBySlug: RUNTIME_BY_SLUG,
  reports: [],
});
ok(
  experimentalErrors.length === 0,
  `runtime Experimental não deve exigir evidência de promoção: ${experimentalErrors.join(' | ')}`,
);

const missingErrors = validateAppReadyEvidence({
  components: promoted('modal'),
  runtimeBySlug: RUNTIME_BY_SLUG,
  reports: [],
});
ok(missingErrors.length > 0, 'promoção App-ready sem evidência deveria falhar.');
ok(
  missingErrors.some((error) => error.includes('modal: root-init sem evidência executada')),
  'falha deve identificar slug, capability e casos ausentes.',
);

const fullReports = completeReports('modal');
const fullErrors = validateAppReadyEvidence({
  components: promoted('modal'),
  runtimeBySlug: RUNTIME_BY_SLUG,
  reports: fullReports,
});
ok(fullErrors.length === 0, `evidência completa deveria permitir promoção: ${fullErrors.join(' | ')}`);

const incompleteReports = structuredClone(fullReports);
const lifecycle = incompleteReports.find((report) => report.suite === 'runtime-lifecycle');
lifecycle.components.modal['root-init'] = lifecycle.components.modal['root-init'].filter(
  (caseId) => caseId !== 'init-component-root',
);
const incompleteErrors = validateAppReadyEvidence({
  components: promoted('modal'),
  runtimeBySlug: RUNTIME_BY_SLUG,
  reports: incompleteReports,
});
ok(
  incompleteErrors.some((error) => error.includes('init-component-root')),
  'um único case obrigatório ausente deve bloquear a promoção.',
);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-tis-readiness-evidence-'));
try {
  fs.writeFileSync(
    path.join(tmpDir, 'wrong-suite.json'),
    `${JSON.stringify({
      schema: EVIDENCE_SCHEMA,
      version: EVIDENCE_VERSION,
      suite: 'consumer-smoke',
      passed: true,
      components: { modal: { keyboard: ['escape-closes'] } },
    }, null, 2)}\n`,
  );
  const parsed = readEvidenceReports(tmpDir);
  ok(
    parsed.errors.some((error) => error.includes('consumer-smoke emitiu keyboard')),
    'suite errada não pode creditar capability de outra suite.',
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log(`Checks: ${checks}`);
if (errors.length === 0) {
  console.log('✅ PASS — promoção sem evidência é bloqueada');
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}`);
process.exit(1);
