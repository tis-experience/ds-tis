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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_PATH = path.join(ROOT, 'docs', 'api', 'components.json');
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function sameKeys(left, right) {
  return JSON.stringify(Object.keys(left).sort()) === JSON.stringify(Object.keys(right).sort());
}

console.log('\n═══ test-component-readiness ═══════════════');

const api = JSON.parse(fs.readFileSync(API_PATH, 'utf8'));
const apiBySlug = new Map(api.components.map((component) => [component.slug, component]));
const slugs = COMPONENTS.map((component) => component.slug);

expect(new Set(slugs).size === slugs.length, 'Catálogo não pode conter slugs duplicados.');
expect(api.components.length === COMPONENTS.length, 'API e catálogo devem ter a mesma quantidade de componentes.');
expect(sameKeys(api.readinessLevels || {}, READINESS_LEVELS), 'API deve publicar todos os níveis de readiness.');
expect(sameKeys(api.behaviorModels || {}, BEHAVIOR_MODELS), 'API deve publicar todos os modelos de responsabilidade.');

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
    `${counts.experimental || 0} Experimentais`,
  );
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}`);
process.exit(1);
