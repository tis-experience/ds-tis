#!/usr/bin/env node
/**
 * Protege a distribuição machine-readable e o contrato responsivo consumido
 * por ferramentas, agents IA e projetos instalados.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  COMPONENTS,
  RESPONSIVE_CONTRACT,
  RESPONSIVE_PROFILES,
  RUNTIME_BY_SLUG,
  responsiveFor,
} from './lib/component-catalog.mjs';
import {
  REACT_REGISTRY_BY_SLUG,
  REACT_REGISTRY_COMPONENTS,
  SHADCN_REGISTRY,
  implementationsFor,
} from './lib/technology-implementations.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

console.log('\n═══ test-consumer-context ═══════════════════');

const pkg = readJson('package.json');
const context = readJson('docs/api/consumer-context.json');
const componentsApi = readJson('docs/api/components.json');

expect(context.schema === 'ds-tis/consumer-context', 'consumer-context must expose the canonical schema.');
expect(context.schemaVersion === 2, 'consumer-context schemaVersion must be 2.');
expect(context.version === pkg.version, 'consumer-context version must match package.json.');
expect(context.package === pkg.name, 'consumer-context package must match package.json.');
expect(componentsApi.schema === 'ds-tis/components', 'components API must expose the canonical schema.');
expect(componentsApi.schemaVersion === 2, 'components API schemaVersion must be 2.');
expect(
  JSON.stringify(context.responsive) === JSON.stringify(RESPONSIVE_CONTRACT),
  'consumer-context responsive contract must match the canonical catalog.',
);
expect(
  JSON.stringify(componentsApi.responsiveContract) === JSON.stringify(RESPONSIVE_CONTRACT),
  'components API responsiveContract must match the canonical catalog.',
);
expect(
  JSON.stringify(componentsApi.responsiveProfiles) === JSON.stringify(RESPONSIVE_PROFILES),
  'components API must publish every canonical responsive profile.',
);
expect(RESPONSIVE_CONTRACT.publicBreakpoints.length === 0, 'DS must not imply public automatic breakpoints.');

const publishedBySlug = new Map(componentsApi.components.map((component) => [component.slug, component]));
for (const component of COMPONENTS) {
  const expectedImplementations = implementationsFor(component, RUNTIME_BY_SLUG[component.slug] ?? null);
  expect(
    JSON.stringify(publishedBySlug.get(component.slug)?.responsive) === JSON.stringify(responsiveFor(component)),
    `${component.slug}: published responsive profile must match responsiveFor(catalog).`,
  );
  expect(
    JSON.stringify(publishedBySlug.get(component.slug)?.implementations) === JSON.stringify(expectedImplementations),
    `${component.slug}: published implementations must match the technology catalog.`,
  );
}

for (const [slug, runtime] of Object.entries(RUNTIME_BY_SLUG)) {
  expect(context.entrypoints.runtimes?.[slug] === runtime.module, `${slug}: consumer context runtime entrypoint drift.`);
}

const exportTargets = {
  './metadata': './docs/api/consumer-context.json',
  './metadata/components': './docs/api/components.json',
  './metadata/tokens': './docs/api/tokens.json',
  './metadata/foundations': './docs/api/foundations.json',
  './metadata/adrs': './docs/api/adrs.json',
  './metadata/release-evidence': './docs/api/release-figma-evidence.json',
  './agent-guide': './docs/agent-consumer-usage.md',
  './agent-guide/en': './docs/agent-consumer-usage.en.md',
  './llms': './docs/llms.txt',
  './llms-full': './docs/llms-full.txt',
};

for (const [key, target] of Object.entries(exportTargets)) {
  expect(pkg.exports?.[key] === target, `package export ${key} must target ${target}.`);
  expect(fs.existsSync(path.join(ROOT, target)), `package export ${key} target is missing (${target}).`);
  expect(pkg.files?.includes(target.replace(/^\.\//, '')), `package files must include ${target}.`);
}

expect(context.entrypoints.agents?.guideEn === 'ds-tis/agent-guide/en', 'consumer context must expose the English agent guide.');
expect(context.sourceOfTruth?.agentGuideEn === 'docs/agent-consumer-usage.en.md', 'consumer context must expose the English guide source.');
expect(
  context.entrypoints.metadata?.releaseEvidence === 'ds-tis/metadata/release-evidence',
  'consumer context must expose the release evidence package entrypoint.',
);
expect(context.technologies?.web?.status === 'stable', 'Web technology must remain stable.');
expect(
  context.technologies?.web?.componentCount === COMPONENTS.length,
  'Web technology must publish every catalog component.',
);
expect(context.technologies?.react?.status === 'beta', 'React source distribution must be beta.');
expect(context.technologies?.react?.package === null, '@tis/react must not be advertised as a package.');
expect(
  context.technologies?.react?.componentCount === REACT_REGISTRY_COMPONENTS.length,
  'React component count must match the canonical registry mapping.',
);
expect(
  context.technologies?.react?.registry?.baseUrl === SHADCN_REGISTRY.baseUrl,
  'React registry base URL must be canonical.',
);
expect(
  context.technologies?.react?.registry?.core?.ref === SHADCN_REGISTRY.coreRef,
  'React registry must expose the immutable ds-tis core ref.',
);
expect(
  context.technologies?.react?.registry?.core?.dependency === SHADCN_REGISTRY.coreDependency,
  'React registry must expose the immutable ds-tis core dependency.',
);
expect(
  context.technologies?.react?.registry?.componentsJson?.registries?.['@tis'] === `${SHADCN_REGISTRY.baseUrl}/{name}.json`,
  'React registry must expose the @tis namespace template.',
);

const reactPublished = componentsApi.components.filter(
  (component) => component.implementations?.react?.status === SHADCN_REGISTRY.status,
);
expect(
  reactPublished.length === REACT_REGISTRY_COMPONENTS.length,
  `React catalog must publish ${REACT_REGISTRY_COMPONENTS.length} beta components.`,
);
for (const component of reactPublished) {
  const expected = REACT_REGISTRY_BY_SLUG[component.slug];
  expect(Boolean(expected), `${component.slug}: unexpected React registry implementation.`);
  expect(component.implementations.react.item === expected?.item, `${component.slug}: React item drift.`);
  expect(
    component.implementations.react.registryUrl === `${SHADCN_REGISTRY.baseUrl}/${expected?.item}.json`,
    `${component.slug}: React registry URL drift.`,
  );
}

const reactUnavailable = componentsApi.components.filter(
  (component) => component.implementations?.react?.status === 'unavailable',
);
expect(
  reactUnavailable.length === COMPONENTS.length - REACT_REGISTRY_COMPONENTS.length,
  'React unavailable count must account for every component outside the registry beta.',
);
expect(
  context.sourceOfTruth?.releaseEvidence === 'docs/api/release-figma-evidence.json',
  'consumer context must expose the release evidence source.',
);

if (errors.length === 0) {
  console.log(`✅ PASS — metadata v2 + ${COMPONENTS.length} perfis Web + ${REACT_REGISTRY_COMPONENTS.length} React beta`);
  process.exit(0);
}

console.log(`❌ FAIL — ${errors.length} issue(s):\n`);
for (const error of errors) console.log(`  ${error}`);
process.exit(1);
