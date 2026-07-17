#!/usr/bin/env node
/**
 * Valida o contrato de readiness e responsabilidade publicado para consumidores.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BEHAVIOR_MODELS,
  COMPONENTS,
  READINESS_LEVELS,
  RUNTIME_BY_SLUG,
  responsibilityFor,
} from './lib/component-catalog.mjs';
import {
  EVIDENCE_SUITES,
  validateRequirementRegistry,
} from './lib/app-ready-requirements.mjs';
import {
  readEvidenceReports,
  validateAppReadyEvidence,
} from './lib/readiness-evidence.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_PATH = path.join(ROOT, 'docs', 'api', 'components.json');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');
const errors = [];
const args = process.argv.slice(2);
const requireEvidence = args.includes('--require-evidence');
const evidenceDirIndex = args.indexOf('--evidence-dir');
const evidenceDir = evidenceDirIndex >= 0 ? args[evidenceDirIndex + 1] : process.env.DS_READINESS_REPORT_DIR;

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function sameKeys(left, right) {
  return JSON.stringify(Object.keys(left).sort()) === JSON.stringify(Object.keys(right).sort());
}

console.log('\n═══ test-component-readiness ═══════════════');

const api = JSON.parse(fs.readFileSync(API_PATH, 'utf8'));
const changelogEntries = fs.readFileSync(CHANGELOG_PATH, 'utf8')
  .split('\n')
  .filter((line) => line.trimStart().startsWith('-'));
const apiBySlug = new Map(api.components.map((component) => [component.slug, component]));
const slugs = COMPONENTS.map((component) => component.slug);

expect(new Set(slugs).size === slugs.length, 'Catálogo não pode conter slugs duplicados.');
expect(api.components.length === COMPONENTS.length, 'API e catálogo devem ter a mesma quantidade de componentes.');
expect(sameKeys(api.readinessLevels || {}, READINESS_LEVELS), 'API deve publicar todos os níveis de readiness.');
expect(sameKeys(api.behaviorModels || {}, BEHAVIOR_MODELS), 'API deve publicar todos os modelos de responsabilidade.');
for (const error of validateRequirementRegistry(RUNTIME_BY_SLUG)) expect(false, error);

for (const component of COMPONENTS) {
  const published = apiBySlug.get(component.slug);
  expect(Boolean(published), `${component.slug}: componente ausente em docs/api/components.json.`);
  if (!published) continue;

  // Comparação profunda com o catálogo — chave existir não basta; drift de
  // classificação publicada é exatamente o que este teste deve pegar.
  expect(
    published.readiness === component.readiness,
    `${component.slug}: readiness publicado (${published.readiness}) diverge do catálogo (${component.readiness}).`,
  );
  expect(
    published.readinessNotes === component.readinessNotes,
    `${component.slug}: readinessNotes publicado diverge do catálogo.`,
  );

  const expectedRuntime = RUNTIME_BY_SLUG[component.slug] ?? null;
  const expectedResponsibility = responsibilityFor(component, expectedRuntime);
  expect(
    JSON.stringify(published.responsibility) === JSON.stringify(expectedResponsibility),
    `${component.slug}: responsibility publicado diverge de responsibilityFor(catálogo).`,
  );

  expect(
    fs.existsSync(path.join(ROOT, published.cssFile)),
    `${component.slug}: CSS público ausente (${published.cssFile}).`,
  );
  // Valida pela fonte do catálogo — published.url pode ser absoluta quando
  // DS_DOCS_BASE_URL está definida no build.
  expect(
    fs.existsSync(path.join(ROOT, 'docs', component.html)),
    `${component.slug}: documentação pública ausente (docs/${component.html}).`,
  );
  expect(
    JSON.stringify(published.runtime) === JSON.stringify(expectedRuntime),
    `${component.slug}: runtime publicado diverge do catálogo.`,
  );

  if (published.runtime) {
    expect(
      published.responsibility.model === 'ds-runtime',
      `${component.slug}: módulo público exige responsibility.model ds-runtime.`,
    );
    expect(
      published.runtime.level === 'required',
      `${component.slug}: runtime necessário ao contrato acessível deve ser required.`,
    );

    const doc = fs.readFileSync(path.join(ROOT, 'docs', component.html), 'utf8');
    for (const publicTerm of [
      expectedRuntime.module,
      expectedRuntime.init,
      expectedRuntime.destroy,
      ...expectedRuntime.events,
    ]) {
      expect(
        doc.includes(publicTerm),
        `${component.slug}: docs/${component.html} não documenta o contrato público ${publicTerm}.`,
      );
    }
  }

  if (published.responsibility.model === 'ds-runtime' && !published.runtime) {
    expect(
      published.readiness === 'experimental',
      `${component.slug}: comportamento do DS sem módulo público deve permanecer Experimental.`,
    );
  }

  if (published.readiness === 'app-ready' && published.responsibility.model === 'ds-runtime') {
    expect(
      published.runtime?.level === 'required',
      `${component.slug}: App-ready com comportamento do DS exige runtime público required.`,
    );
    const hasPromotionEntry = changelogEntries.some((line) => (
      line.toLowerCase().includes(component.name.toLowerCase())
      && line.toLowerCase().includes('app-ready')
    ));
    expect(
      hasPromotionEntry,
      `${component.slug}: promoção App-ready precisa de entrada explícita por componente no CHANGELOG.`,
    );
  }

  if (published.readiness === 'composition') {
    expect(
      published.responsibility.model === 'consumer',
      `${component.slug}: Composição deve declarar orquestração do consumidor.`,
    );
  }

  if (published.cssOnly) {
    expect(
      published.readiness === 'composition',
      `${component.slug}: componente CSS-only deve explicitar readiness de Composição.`,
    );
  }
}

let evidenceReportCount = 0;
if (requireEvidence) {
  const evidenceResult = readEvidenceReports(evidenceDir);
  evidenceReportCount = evidenceResult.reports.length;
  for (const error of evidenceResult.errors) expect(false, error);

  const suites = new Set(evidenceResult.reports.map((report) => report.suite));
  for (const suite of Object.values(EVIDENCE_SUITES)) {
    expect(suites.has(suite), `Relatório executado ausente para a suite ${suite}.`);
  }

  for (const error of validateAppReadyEvidence({
    components: COMPONENTS,
    runtimeBySlug: RUNTIME_BY_SLUG,
    reports: evidenceResult.reports,
  })) {
    expect(false, error);
  }
}

for (const slug of Object.keys(RUNTIME_BY_SLUG)) {
  expect(apiBySlug.has(slug), `${slug}: runtime órfão sem componente no catálogo.`);
}

// Runtime required não pode ser documentado como opcional.
for (const component of COMPONENTS) {
  const runtime = RUNTIME_BY_SLUG[component.slug];
  if (runtime?.level !== 'required') continue;
  const docPath = path.join(ROOT, 'docs', component.html);
  if (!fs.existsSync(docPath)) continue;
  const doc = fs.readFileSync(docPath, 'utf8').toLowerCase();
  expect(
    !doc.includes('opt-in'),
    `${component.slug}: docs/${component.html} descreve runtime required como opt-in.`,
  );
}

if (errors.length === 0) {
  const counts = api.components.reduce((acc, component) => {
    acc[component.readiness] = (acc[component.readiness] || 0) + 1;
    return acc;
  }, {});
  console.log(
    `✅ PASS — ${api.components.length} componentes: ` +
    `${counts['app-ready'] || 0} App-ready, ${counts.composition || 0} Composição, ` +
    `${counts.experimental || 0} Experimentais` +
    (requireEvidence
      ? `; ${evidenceReportCount} relatório(s) de evidência executada`
      : '; contrato estrutural (use test:app-ready para evidência executada)'),
  );
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}`);
process.exit(1);
