import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { COMPONENTS, RUNTIME_BY_SLUG } from './lib/component-catalog.mjs';
import { STORYBOOK_CONTRACTS } from './lib/storybook-contracts.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORIES_DIR = path.join(ROOT, 'stories');
const preview = fs.readFileSync(path.join(ROOT, '.storybook', 'preview.js'), 'utf8');
const manager = fs.readFileSync(path.join(ROOT, '.storybook', 'manager.js'), 'utf8');
const storyStyles = fs.readFileSync(path.join(STORIES_DIR, 'storybook.css'), 'utf8');
const failures = [];

for (const component of COMPONENTS) {
  const storyPath = path.join(STORIES_DIR, `${component.slug}.stories.js`);
  if (!fs.existsSync(storyPath)) {
    failures.push(`story ausente para ${component.name}: stories/${component.slug}.stories.js`);
    continue;
  }

  const source = fs.readFileSync(storyPath, 'utf8');
  if (!source.includes(`componentDescription('${component.slug}'`)) {
    failures.push(`story de ${component.name} não aponta para a documentação canônica`);
  }

  const contract = STORYBOOK_CONTRACTS[component.slug];
  if (!contract) {
    failures.push(`contrato editorial ausente para ${component.name}`);
    continue;
  }

  for (const property of contract.properties) {
    const propertyPattern = new RegExp(`${property}\\s*:\\s*\\{[\\s\\S]{0,240}?control\\s*:`);
    if (!propertyPattern.test(source)) {
      failures.push(`propriedade ${property} não está documentada por Controls em ${component.name}`);
    }
  }

  for (const story of contract.stories) {
    if (!source.includes(`export const ${story}`)) {
      failures.push(`story ${story} ausente em ${component.name}`);
    }
  }
}

for (const runtime of Object.values(RUNTIME_BY_SLUG)) {
  if (!preview.includes(runtime.init) || !preview.includes(runtime.destroy)) {
    failures.push(`preview não gerencia lifecycle ${runtime.init}/${runtime.destroy}`);
  }
}

if (!preview.includes('ThemedDocsContainer') || !preview.includes("context.viewMode === 'docs'")) {
  failures.push('preview não separa o tema e a altura entre Docs e story isolada');
}

if (!manager.includes('GLOBALS_UPDATED') || !manager.includes('themeForMode')) {
  failures.push('manager não acompanha o modo light/dark selecionado na toolbar');
}

if (!storyStyles.includes('.sb-story-shell--story') || !storyStyles.includes('.sb-story-shell--docs')) {
  failures.push('CSS das amostras não separa a altura de Docs e story isolada');
}

if (failures.length) {
  console.error('❌ Catálogo Storybook inválido:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

const storyCount = Object.values(STORYBOOK_CONTRACTS).reduce((total, contract) => total + contract.stories.length, 0);
const propertyCount = Object.values(STORYBOOK_CONTRACTS).reduce((total, contract) => total + contract.properties.length, 0);
console.log(`✅ Storybook cobre ${COMPONENTS.length}/${COMPONENTS.length} componentes, ${storyCount} stories contratuais, ${propertyCount} propriedades e ${Object.keys(RUNTIME_BY_SLUG).length} runtimes.`);
