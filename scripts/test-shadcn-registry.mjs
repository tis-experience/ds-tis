import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

import { loadRegistry, loadRegistryItem } from 'shadcn/registry';
import { registrySchema } from 'shadcn/schema';
import { SHADCN_REGISTRY } from './lib/technology-implementations.mjs';
import { build } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = path.join(ROOT, 'registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const errors = [];

const designSystemCss = fs.readFileSync(
  path.join(ROOT, 'css/design-system.css'),
  'utf8',
);
const firstCssStatement = designSystemCss
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .trimStart();
if (!firstCssStatement.startsWith('@import url(')) {
  errors.push('css/design-system.css deve carregar fontes antes de imports que emitem regras');
}
if (fs.readFileSync(path.join(ROOT, 'css/base/reset.css'), 'utf8').includes('@import')) {
  errors.push('css/base/reset.css não pode manter @import aninhado após tokens');
}

const parsed = registrySchema.safeParse(registry);
if (!parsed.success) {
  for (const issue of parsed.error.issues) {
    errors.push(`registry.json ${issue.path.join('.')}: ${issue.message}`);
  }
}

await loadRegistry({ cwd: ROOT, registryFile: 'registry.json' });

const expectedItems = [
  'tis-base',
  'accordion',
  'button',
  'checkbox',
  'dialog',
  'field',
  'input',
  'radio-group',
  'switch',
  'textarea',
];
const itemNames = registry.items.map((item) => item.name);
for (const name of expectedItems) {
  if (!itemNames.includes(name)) errors.push(`item obrigatório ausente: ${name}`);
}
if (new Set(itemNames).size !== itemNames.length) {
  errors.push('registry.json contém nomes de item duplicados');
}

const requiredDependency = '@base-ui/react@1.6.0';
const requiredDsDependency = SHADCN_REGISTRY.coreDependency;
const baseUiItems = new Set([
  'tis-base',
  'accordion',
  'button',
  'checkbox',
  'dialog',
  'input',
  'radio-group',
  'switch',
]);
for (const item of registry.items) {
  if (baseUiItems.has(item.name) && !item.dependencies?.includes(requiredDependency)) {
    errors.push(`${item.name}: Base UI deve ficar fixado em 1.6.0`);
  }
  if (!baseUiItems.has(item.name) && item.dependencies?.includes(requiredDependency)) {
    errors.push(`${item.name}: não deve instalar Base UI sem comportamento delegado`);
  }
  if (!item.dependencies?.includes(requiredDsDependency)) {
    errors.push(`${item.name}: deve instalar o contrato estável ds-tis v1.0.0`);
  }
  if (!item.css?.['@import "ds-tis/css"']) {
    errors.push(`${item.name}: deve importar o CSS público ds-tis/css`);
  }
  if (!item.docs?.includes('primeiro import')) {
    errors.push(`${item.name}: deve documentar ds-tis/css como primeiro import global`);
  }
  if (item.meta?.status !== 'beta') {
    errors.push(`${item.name}: status beta deve permanecer explícito`);
  }
}

const sourceContracts = {
  button: ['@base-ui/react/button', 'ds-button', 'data-slot="button"'],
  accordion: [
    '@base-ui/react/accordion',
    'ds-accordion__trigger',
    'data-slot="accordion-content"',
    'case "ArrowDown"',
    'case "Home"',
  ],
  dialog: [
    '@base-ui/react/dialog',
    'ds-modal__title',
    'data-slot="dialog-content"',
    'DialogPrimitive.Viewport',
  ],
  field: ['ds-field', 'data-slot="field-error"', 'data-invalid'],
  input: [
    '@base-ui/react/input',
    'ds-input__field',
    'input-leading-icon',
    'input-trailing-icon',
  ],
  textarea: ['ds-textarea', 'ds-textarea__field', 'data-slot="textarea"'],
  checkbox: [
    '@base-ui/react/checkbox',
    'ds-checkbox',
    'data-slot="checkbox"',
  ],
  'radio-group': [
    '@base-ui/react/radio-group',
    '@base-ui/react/radio',
    'ds-radio-group',
    'render={render ?? <fieldset />}',
  ],
  switch: ['@base-ui/react/switch', 'ds-toggle', 'data-slot="switch"'],
};

for (const [name, contracts] of Object.entries(sourceContracts)) {
  const item = await loadRegistryItem(name, { cwd: ROOT });
  const sourceFile = item.files.find((file) => file.path.endsWith(`${name}.tsx`));
  if (!sourceFile?.content) {
    errors.push(`${name}: source TSX não resolvido pelo registry`);
    continue;
  }

  for (const contract of contracts) {
    if (!sourceFile.content.includes(contract)) {
      errors.push(`${name}: contrato ausente no source: ${contract}`);
    }
  }

  if (/@ark-ui|radix-ui|tailwindcss/.test(sourceFile.content)) {
    errors.push(`${name}: source não pode misturar Ark, Radix ou Tailwind`);
  }
  if (/(#[\da-f]{3,8}\b|rgba?\(|\b\d+(?:\.\d+)?(?:px|rem)\b)/i.test(sourceFile.content)) {
    errors.push(`${name}: source contém valor visual hardcoded`);
  }
}

const registrySources = [
  ...new Set(
    registry.items.flatMap((item) =>
      (item.files || [])
        .map((file) => path.join(ROOT, file.path))
        .filter((file) => /\.tsx?$/.test(file)),
    ),
  ),
];
const tscExecutable = path.join(
  ROOT,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsc.cmd' : 'tsc',
);
const typecheck = spawnSync(
  tscExecutable,
  [
    '--noEmit',
    '--jsx',
    'react-jsx',
    '--moduleResolution',
    'bundler',
    '--module',
    'esnext',
    '--target',
    'es2022',
    '--strict',
    '--skipLibCheck',
    ...registrySources,
  ],
  { cwd: ROOT, encoding: 'utf8' },
);
if (typecheck.status !== 0) {
  errors.push(`typecheck do source registry falhou:\n${typecheck.stdout}${typecheck.stderr}`);
}

const dialogItem = registry.items.find((item) => item.name === 'dialog');
for (const token of [
  'var(--ds-modal-overlay-bg-default)',
  'var(--ds-modal-overlay-padding-default)',
  'var(--ds-modal-overlay-z-index-default)',
  'var(--ds-space-sm)',
]) {
  if (!JSON.stringify(dialogItem?.css).includes(token)) {
    errors.push(`dialog: adapter CSS deve consumir ${token}`);
  }
}

const adapterContracts = {
  checkbox: [
    '.ds-checkbox[data-checked]',
    '.ds-checkbox[data-indeterminate]',
    '.ds-checkbox[data-disabled]',
    'var(--ds-checkbox-box-fill-checked-default)',
  ],
  'radio-group': [
    '.ds-radio[data-checked]',
    '.ds-radio[data-disabled]',
    'var(--ds-radio-control-fill-selected-default)',
  ],
  switch: [
    '.ds-toggle[data-checked]',
    '.ds-toggle[data-disabled]',
    'var(--ds-toggle-track-fill-on-default)',
    'var(--ds-space-none)',
  ],
};
for (const [name, contracts] of Object.entries(adapterContracts)) {
  const item = registry.items.find((entry) => entry.name === name);
  const css = JSON.stringify(item?.css);
  if (item?.css?.['@layer components']) {
    errors.push(`${name}: state adapter precisa ficar após o CSS público, fora de cascade layer`);
  }
  for (const contract of contracts) {
    if (!css.includes(contract)) {
      errors.push(`${name}: adapter CSS deve preservar ${contract}`);
    }
  }
}

const entries = {
  'base-provider-accordion': {
    group: 'Base UI incremental',
    sourceCode: `export { Accordion } from '@base-ui/react/accordion';`,
    budget: 12 * 1024,
  },
  'base-provider-dialog': {
    group: 'Base UI incremental',
    sourceCode: `export { Dialog } from '@base-ui/react/dialog';`,
    budget: 21 * 1024,
  },
  'base-provider-combined': {
    group: 'Base UI incremental',
    sourceCode: `
      export { Accordion } from '@base-ui/react/accordion';
      export { Dialog } from '@base-ui/react/dialog';
    `,
    budget: 25 * 1024,
  },
  'registry-accordion': {
    group: 'Registry integrado',
    sourceFiles: [path.join(ROOT, 'registry/tis/accordion.tsx')],
    budget: 24 * 1024,
  },
  'registry-dialog': {
    group: 'Registry integrado',
    sourceFiles: [path.join(ROOT, 'registry/tis/dialog.tsx')],
    budget: 32 * 1024,
  },
  'registry-combined': {
    group: 'Registry integrado',
    sourceFiles: [
      path.join(ROOT, 'registry/tis/accordion.tsx'),
      path.join(ROOT, 'registry/tis/dialog.tsx'),
    ],
    budget: 38 * 1024,
  },
  'base-provider-forms': {
    group: 'Base UI incremental',
    sourceCode: `
      export { Input } from '@base-ui/react/input';
      export { Checkbox } from '@base-ui/react/checkbox';
      export { Radio } from '@base-ui/react/radio';
      export { RadioGroup } from '@base-ui/react/radio-group';
      export { Switch } from '@base-ui/react/switch';
    `,
    budget: 15 * 1024,
  },
  'registry-forms': {
    group: 'Registry integrado',
    sourceFiles: [
      path.join(ROOT, 'registry/tis/field.tsx'),
      path.join(ROOT, 'registry/tis/input.tsx'),
      path.join(ROOT, 'registry/tis/textarea.tsx'),
      path.join(ROOT, 'registry/tis/checkbox.tsx'),
      path.join(ROOT, 'registry/tis/radio-group.tsx'),
      path.join(ROOT, 'registry/tis/switch.tsx'),
    ],
    budget: 25 * 1024,
  },
};

const formatKiB = (bytes) => `${(bytes / 1024).toFixed(2)} KiB`;

for (const [name, entry] of Object.entries(entries)) {
  const virtualId = `virtual:${name}`;
  const resolvedVirtualId = `\0${virtualId}`;
  const source =
    entry.sourceCode ||
    entry.sourceFiles
      .map((file, index) => `export * as component${index} from ${JSON.stringify(file)};`)
      .join('\n');

  const output = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [
      {
        name: `tis-shadcn-entry-${name}`,
        resolveId(id) {
          return id === virtualId ? resolvedVirtualId : null;
        },
        load(id) {
          return id === resolvedVirtualId ? source : null;
        },
      },
    ],
    build: {
      minify: true,
      target: 'es2022',
      write: false,
      rollupOptions: {
        input: virtualId,
        preserveEntrySignatures: 'strict',
        external: (id) =>
          id === 'react' ||
          id.startsWith('react/') ||
          id === 'react-dom' ||
          id.startsWith('react-dom/'),
        output: {
          format: 'es',
          entryFileNames: `${name}.js`,
          chunkFileNames: `${name}-[hash].js`,
        },
      },
    },
  });

  const bundles = Array.isArray(output) ? output : [output];
  const chunks = bundles.flatMap((bundle) =>
    bundle.output.filter((item) => item.type === 'chunk'),
  );
  const gzipBytes = chunks.reduce(
    (total, chunk) => total + gzipSync(chunk.code, { level: 9 }).byteLength,
    0,
  );

  console.log(
    `  ${entry.group.padEnd(20)} ${name.padEnd(24)} ${formatKiB(gzipBytes)} gzip · limite ${formatKiB(entry.budget)}`,
  );
  if (gzipBytes > entry.budget) {
    errors.push(`${name}: bundle ${formatKiB(gzipBytes)} excede ${formatKiB(entry.budget)}`);
  }
}

if (errors.length) {
  console.error('\n❌ Registry shadcn/Base UI inválido:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('\n✅ Registry TIS shadcn/Base UI válido, tokenizado e dentro dos orçamentos.');
