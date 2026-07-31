import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const providerModule = path.join(ROOT, 'packages/react/src/provider-spike.jsx');
const tokensCss = path.join(ROOT, 'css/tokens/generated/index.css');
const accordionCss = path.join(ROOT, 'css/components/accordion.css');
const buttonCss = path.join(ROOT, 'css/components/button.css');
const modalCss = path.join(ROOT, 'css/components/modal.css');
const storybookCss = path.join(ROOT, 'packages/react/src/storybook.css');

const entries = {
  'ark-accordion': {
    group: 'Ark/Zag incremental',
    budget: 12 * 1024,
    source: `
      import { Accordion } from '@ark-ui/react/accordion';
      export { Accordion };
    `,
  },
  'ark-dialog': {
    group: 'Ark/Zag incremental',
    budget: 20 * 1024,
    source: `
      import { Dialog } from '@ark-ui/react/dialog';
      import { Portal } from '@ark-ui/react/portal';
      export { Dialog, Portal };
    `,
  },
  'ark-combined': {
    group: 'Ark/Zag incremental',
    budget: 25 * 1024,
    source: `
      import { Accordion } from '@ark-ui/react/accordion';
      import { Dialog } from '@ark-ui/react/dialog';
      import { Portal } from '@ark-ui/react/portal';
      export { Accordion, Dialog, Portal };
    `,
  },
  'preview-accordion': {
    group: 'Preview integrado',
    budget: 24 * 1024,
    source: `
      import { AccordionPreview } from ${JSON.stringify(providerModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(accordionCss)};
      import ${JSON.stringify(storybookCss)};
      export { AccordionPreview };
    `,
  },
  'preview-dialog': {
    group: 'Preview integrado',
    budget: 32 * 1024,
    source: `
      import { ModalPreview } from ${JSON.stringify(providerModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(buttonCss)};
      import ${JSON.stringify(modalCss)};
      import ${JSON.stringify(storybookCss)};
      export { ModalPreview };
    `,
  },
  'preview-combined': {
    group: 'Preview integrado',
    budget: 38 * 1024,
    source: `
      import { ArkProviderSpike } from ${JSON.stringify(providerModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(accordionCss)};
      import ${JSON.stringify(buttonCss)};
      import ${JSON.stringify(modalCss)};
      import ${JSON.stringify(storybookCss)};
      export { ArkProviderSpike };
    `,
  },
};

const external = (id) =>
  id === 'react' ||
  id.startsWith('react/') ||
  id === 'react-dom' ||
  id.startsWith('react-dom/');

const formatKiB = (bytes) => `${(bytes / 1024).toFixed(2)} KiB`;
const errors = [];
const results = [];

for (const [name, entry] of Object.entries(entries)) {
  const output = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [
      {
        name: `vnext-bundle-entry-${name}`,
        resolveId(id) {
          return id === 'virtual:vnext-bundle-entry'
            ? '\0virtual:vnext-bundle-entry'
            : null;
        },
        load(id) {
          return id === '\0virtual:vnext-bundle-entry' ? entry.source : null;
        },
      },
    ],
    build: {
      minify: true,
      target: 'es2022',
      write: false,
      rollupOptions: {
        input: 'virtual:vnext-bundle-entry',
        preserveEntrySignatures: 'strict',
        external,
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
  const assets = bundles.flatMap((bundle) =>
    bundle.output.filter((item) => item.type === 'asset'),
  );
  const outputs = [
    ...chunks.map((chunk) => Buffer.from(chunk.code)),
    ...assets.map((asset) =>
      Buffer.isBuffer(asset.source)
        ? asset.source
        : Buffer.from(
            typeof asset.source === 'string'
              ? asset.source
              : asset.source.buffer,
          ),
    ),
  ];
  const rawBytes = outputs.reduce((total, output) => total + output.byteLength, 0);
  const gzipBytes = outputs.reduce(
    (total, output) => total + gzipSync(output, { level: 9 }).byteLength,
    0,
  );

  results.push({
    name,
    group: entry.group,
    rawBytes,
    gzipBytes,
    budget: entry.budget,
  });
  if (gzipBytes > entry.budget) {
    errors.push(
      `${name}: ${formatKiB(gzipBytes)} gzip excede o orçamento de ${formatKiB(entry.budget)}`,
    );
  }
}

for (const group of new Set(results.map((result) => result.group))) {
  console.log(`\n${group} (React e ReactDOM externos):`);
  for (const result of results.filter((candidate) => candidate.group === group)) {
    console.log(
      `  ${result.name.padEnd(19)} ${formatKiB(result.gzipBytes)} gzip ` +
        `(${formatKiB(result.rawBytes)} minificado) · limite ${formatKiB(result.budget)}`,
    );
  }
}

if (errors.length) {
  console.error('\n❌ Orçamento de bundle vNext excedido:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('\n✅ Providers e previews integrados dentro dos orçamentos vNext.');
