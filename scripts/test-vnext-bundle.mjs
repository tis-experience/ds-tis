import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const providerModule = path.join(ROOT, 'packages/react/src/provider-spike.jsx');
const tokensCss = path.join(ROOT, 'css/tokens/generated/index.css');
const accordionCss = path.join(ROOT, 'css/components/accordion.css');
const buttonCss = path.join(ROOT, 'css/components/button.css');
const checkboxCss = path.join(ROOT, 'css/components/checkbox.css');
const comboboxCss = path.join(ROOT, 'css/components/combobox.css');
const formFieldCss = path.join(ROOT, 'css/components/form-field.css');
const inputCss = path.join(ROOT, 'css/components/input.css');
const textareaCss = path.join(ROOT, 'css/components/textarea.css');
const arkTextareaModule = path.join(ROOT, 'packages/react/src/ark/textarea.jsx');
const arkAlertModule = path.join(ROOT, 'packages/react/src/ark/alert.jsx');
const menuCss = path.join(ROOT, 'css/components/menu.css');
const modalCss = path.join(ROOT, 'css/components/modal.css');
const popoverCss = path.join(ROOT, 'css/components/popover.css');
const radioCss = path.join(ROOT, 'css/components/radio.css');
const selectCss = path.join(ROOT, 'css/components/select.css');
const tabsCss = path.join(ROOT, 'css/components/tabs.css');
const toastCss = path.join(ROOT, 'css/components/toast.css');
const toggleCss = path.join(ROOT, 'css/components/toggle.css');
const storybookCss = path.join(ROOT, 'packages/react/src/storybook.css');
const tooltipCss = path.join(ROOT, 'css/components/tooltip.css');
const arkModalModule = path.join(ROOT, 'packages/react/src/ark/modal.jsx');
const arkButtonModule = path.join(ROOT, 'packages/react/src/ark/button.jsx');
const arkCheckboxModule = path.join(ROOT, 'packages/react/src/ark/checkbox.jsx');
const arkComboboxModule = path.join(ROOT, 'packages/react/src/ark/combobox.jsx');
const arkInputModule = path.join(ROOT, 'packages/react/src/ark/input.jsx');
const arkMenuModule = path.join(ROOT, 'packages/react/src/ark/menu.jsx');
const arkPopoverModule = path.join(ROOT, 'packages/react/src/ark/popover.jsx');
const arkRadioModule = path.join(ROOT, 'packages/react/src/ark/radio.jsx');
const arkSelectModule = path.join(ROOT, 'packages/react/src/ark/select.jsx');
const arkTabsModule = path.join(ROOT, 'packages/react/src/ark/tabs.jsx');
const arkToastModule = path.join(ROOT, 'packages/react/src/ark/toast.jsx');
const arkToggleModule = path.join(ROOT, 'packages/react/src/ark/toggle.jsx');
const arkTooltipModule = path.join(ROOT, 'packages/react/src/ark/tooltip.jsx');
const registryComboboxModule = path.join(ROOT, 'registry/tis/combobox.tsx');
const registryButtonModule = path.join(ROOT, 'registry/tis/button.tsx');
const registryCheckboxModule = path.join(ROOT, 'registry/tis/checkbox.tsx');
const registryMenuModule = path.join(ROOT, 'registry/tis/menu.tsx');
const registryPopoverModule = path.join(ROOT, 'registry/tis/popover.tsx');
const registryRadioModule = path.join(ROOT, 'registry/tis/radio-group.tsx');
const registrySelectModule = path.join(ROOT, 'registry/tis/select.tsx');
const registryTabsModule = path.join(ROOT, 'registry/tis/tabs.tsx');
const registryToastModule = path.join(ROOT, 'registry/tis/toast.tsx');
const registryToggleModule = path.join(ROOT, 'registry/tis/switch.tsx');
const registryTooltipModule = path.join(ROOT, 'registry/tis/tooltip.tsx');

const entries = {
  'adapter-ark-alert': {
    group: 'Ark/Zag incremental', budget: 5 * 1024,
    source: `import * as Alert from ${JSON.stringify(arkAlertModule)}; export { Alert };`,
  },
  'adapter-ark-textarea': {
    group: 'Ark/Zag incremental', budget: 5 * 1024,
    source: `import * as Textarea from ${JSON.stringify(arkTextareaModule)}; export { Textarea };`,
  },
  'preview-ark-textarea': {
    group: 'Preview integrado', budget: 22 * 1024,
    source: `import * as Textarea from ${JSON.stringify(arkTextareaModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(formFieldCss)};
      import ${JSON.stringify(textareaCss)};
      import ${JSON.stringify(storybookCss)}; export { Textarea };`,
  },
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
  'ark-button': {
    group: 'Ark/Zag incremental',
    budget: 4 * 1024,
    source: `
      import { ark } from '@ark-ui/react/factory';
      export const Button = ark.button;
    `,
  },
  'ark-checkbox': {
    group: 'Ark/Zag incremental',
    budget: 12 * 1024,
    source: `
      import { Checkbox } from '@ark-ui/react/checkbox';
      export { Checkbox };
    `,
  },
  'ark-input': {
    group: 'Ark/Zag incremental',
    budget: 4 * 1024,
    source: `
      import { ark } from '@ark-ui/react/factory';
      export const Input = ark.input;
    `,
  },
  'ark-radio': {
    group: 'Ark/Zag incremental',
    budget: 12 * 1024,
    source: `
      import { RadioGroup } from '@ark-ui/react/radio-group';
      export { RadioGroup };
    `,
  },
  'ark-toggle': {
    group: 'Ark/Zag incremental',
    budget: 12 * 1024,
    source: `
      import { Switch } from '@ark-ui/react/switch';
      export { Switch };
    `,
  },
  'ark-combobox': {
    group: 'Ark/Zag incremental',
    // Coleção, filtro, ARIA, foco e posicionamento pertencem ao chunk do componente.
    // O portal deve manter esse chunk fora das rotas que não usam Combobox.
    budget: 33 * 1024,
    source: `
      import { Combobox } from '@ark-ui/react/combobox';
      export { Combobox };
    `,
  },
  'ark-select': {
    group: 'Ark/Zag incremental',
    budget: 32 * 1024,
    source: `
      import { Select } from '@ark-ui/react/select';
      export { Select };
    `,
  },
  'ark-menu': {
    group: 'Ark/Zag incremental',
    budget: 32 * 1024,
    source: `
      import { Menu } from '@ark-ui/react/menu';
      export { Menu };
    `,
  },
  'ark-tooltip': {
    group: 'Ark/Zag incremental',
    budget: 22 * 1024,
    source: `
      import { Tooltip } from '@ark-ui/react/tooltip';
      import { Portal } from '@ark-ui/react/portal';
      export { Tooltip, Portal };
    `,
  },
  'ark-tabs': {
    group: 'Ark/Zag incremental',
    budget: 13 * 1024,
    source: `
      import { Tabs } from '@ark-ui/react/tabs';
      export { Tabs };
    `,
  },
  'ark-toast': {
    group: 'Ark/Zag incremental',
    budget: 15 * 1024,
    source: `
      import { Toast, Toaster, createToaster } from '@ark-ui/react/toast';
      export { Toast, Toaster, createToaster };
    `,
  },
  'adapter-ark-modal': {
    group: 'Ark/Zag incremental',
    budget: 22 * 1024,
    source: `
      import * as ModalAdapter from ${JSON.stringify(arkModalModule)};
      export { ModalAdapter };
    `,
  },
  'adapter-ark-button': {
    group: 'Ark/Zag incremental',
    budget: 5 * 1024,
    source: `
      import * as ButtonAdapter from ${JSON.stringify(arkButtonModule)};
      export { ButtonAdapter };
    `,
  },
  'adapter-ark-checkbox': {
    group: 'Ark/Zag incremental',
    budget: 13 * 1024,
    source: `
      import * as CheckboxAdapter from ${JSON.stringify(arkCheckboxModule)};
      export { CheckboxAdapter };
    `,
  },
  'adapter-ark-input': {
    group: 'Ark/Zag incremental',
    budget: 5 * 1024,
    source: `
      import * as InputAdapter from ${JSON.stringify(arkInputModule)};
      export { InputAdapter };
    `,
  },
  'adapter-ark-radio': {
    group: 'Ark/Zag incremental',
    budget: 13 * 1024,
    source: `
      import * as RadioAdapter from ${JSON.stringify(arkRadioModule)};
      export { RadioAdapter };
    `,
  },
  'adapter-ark-toggle': {
    group: 'Ark/Zag incremental',
    budget: 13 * 1024,
    source: `
      import * as ToggleAdapter from ${JSON.stringify(arkToggleModule)};
      export { ToggleAdapter };
    `,
  },
  'adapter-ark-combobox': {
    group: 'Ark/Zag incremental',
    budget: 34 * 1024,
    source: `
      import * as ComboboxAdapter from ${JSON.stringify(arkComboboxModule)};
      export { ComboboxAdapter };
    `,
  },
  'adapter-ark-select': {
    group: 'Ark/Zag incremental',
    budget: 33 * 1024,
    source: `
      import * as SelectAdapter from ${JSON.stringify(arkSelectModule)};
      export { SelectAdapter };
    `,
  },
  'adapter-ark-menu': {
    group: 'Ark/Zag incremental',
    budget: 33 * 1024,
    source: `
      import * as MenuAdapter from ${JSON.stringify(arkMenuModule)};
      export { MenuAdapter };
    `,
  },
  'adapter-ark-tooltip': {
    group: 'Ark/Zag incremental',
    budget: 22 * 1024,
    source: `
      import * as TooltipAdapter from ${JSON.stringify(arkTooltipModule)};
      export { TooltipAdapter };
    `,
  },
  'adapter-ark-tabs': {
    group: 'Ark/Zag incremental',
    budget: 13 * 1024,
    source: `
      import * as TabsAdapter from ${JSON.stringify(arkTabsModule)};
      export { TabsAdapter };
    `,
  },
  'adapter-ark-toast': {
    group: 'Ark/Zag incremental',
    budget: 16 * 1024,
    source: `
      import * as ToastAdapter from ${JSON.stringify(arkToastModule)};
      export { ToastAdapter };
    `,
  },
  'ark-popover': {
    group: 'Ark/Zag incremental',
    budget: 32 * 1024,
    source: `
      import { Popover } from '@ark-ui/react/popover';
      import { Portal } from '@ark-ui/react/portal';
      export { Popover, Portal };
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
  'preview-ark-button': {
    group: 'Preview integrado',
    budget: 18 * 1024,
    source: `
      import * as ButtonAdapter from ${JSON.stringify(arkButtonModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(buttonCss)};
      import ${JSON.stringify(storybookCss)};
      export { ButtonAdapter };
    `,
  },
  'preview-ark-input': {
    group: 'Preview integrado',
    budget: 22 * 1024,
    source: `
      import * as InputAdapter from ${JSON.stringify(arkInputModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(formFieldCss)};
      import ${JSON.stringify(inputCss)};
      import ${JSON.stringify(storybookCss)};
      export { InputAdapter };
    `,
  },
  'preview-ark-popover': {
    group: 'Preview integrado',
    budget: 46 * 1024,
    source: `
      import * as PopoverAdapter from ${JSON.stringify(arkPopoverModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(buttonCss)};
      import ${JSON.stringify(popoverCss)};
      import ${JSON.stringify(storybookCss)};
      export { PopoverAdapter };
    `,
  },
  'preview-ark-combobox': {
    group: 'Preview integrado',
    budget: 47 * 1024,
    source: `
      import * as ComboboxAdapter from ${JSON.stringify(arkComboboxModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(formFieldCss)};
      import ${JSON.stringify(comboboxCss)};
      import ${JSON.stringify(storybookCss)};
      export { ComboboxAdapter };
    `,
  },
  'preview-ark-select': {
    group: 'Preview integrado',
    budget: 46 * 1024,
    source: `
      import * as SelectAdapter from ${JSON.stringify(arkSelectModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(formFieldCss)};
      import ${JSON.stringify(selectCss)};
      import ${JSON.stringify(menuCss)};
      import ${JSON.stringify(storybookCss)};
      export { SelectAdapter };
    `,
  },
  'preview-ark-menu': {
    group: 'Preview integrado',
    budget: 46 * 1024,
    source: `
      import * as MenuAdapter from ${JSON.stringify(arkMenuModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(buttonCss)};
      import ${JSON.stringify(menuCss)};
      import ${JSON.stringify(storybookCss)};
      export { MenuAdapter };
    `,
  },
  'preview-ark-tooltip': {
    group: 'Preview integrado',
    budget: 35 * 1024,
    source: `
      import * as TooltipAdapter from ${JSON.stringify(arkTooltipModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(buttonCss)};
      import ${JSON.stringify(tooltipCss)};
      import ${JSON.stringify(storybookCss)};
      export { TooltipAdapter };
    `,
  },
  'preview-ark-tabs': {
    group: 'Preview integrado',
    budget: 24 * 1024,
    source: `
      import * as TabsAdapter from ${JSON.stringify(arkTabsModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(tabsCss)};
      import ${JSON.stringify(storybookCss)};
      export { TabsAdapter };
    `,
  },
  'preview-ark-toast': {
    group: 'Preview integrado',
    budget: 29 * 1024,
    source: `
      import * as ToastAdapter from ${JSON.stringify(arkToastModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(buttonCss)};
      import ${JSON.stringify(toastCss)};
      import ${JSON.stringify(storybookCss)};
      export { ToastAdapter };
    `,
  },
  'preview-ark-checkbox': {
    group: 'Preview integrado',
    budget: 24 * 1024,
    source: `
      import * as CheckboxAdapter from ${JSON.stringify(arkCheckboxModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(checkboxCss)};
      import ${JSON.stringify(storybookCss)};
      export { CheckboxAdapter };
    `,
  },
  'preview-ark-radio': {
    group: 'Preview integrado',
    budget: 25 * 1024,
    source: `
      import * as RadioAdapter from ${JSON.stringify(arkRadioModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(radioCss)};
      import ${JSON.stringify(storybookCss)};
      export { RadioAdapter };
    `,
  },
  'preview-ark-toggle': {
    group: 'Preview integrado',
    budget: 25 * 1024,
    source: `
      import * as ToggleAdapter from ${JSON.stringify(arkToggleModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(toggleCss)};
      import ${JSON.stringify(storybookCss)};
      export { ToggleAdapter };
    `,
  },
  'preview-base-popover': {
    group: 'React shadcn/Base UI',
    budget: 64 * 1024,
    source: `
      import * as PopoverRegistry from ${JSON.stringify(registryPopoverModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(buttonCss)};
      import ${JSON.stringify(popoverCss)};
      export { PopoverRegistry };
    `,
  },
  'preview-base-button': {
    group: 'React shadcn/Base UI',
    budget: 25 * 1024,
    source: `
      import * as ButtonRegistry from ${JSON.stringify(registryButtonModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(buttonCss)};
      export { ButtonRegistry };
    `,
  },
  'preview-base-checkbox': {
    group: 'React shadcn/Base UI',
    budget: 28 * 1024,
    source: `
      import * as CheckboxRegistry from ${JSON.stringify(registryCheckboxModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(checkboxCss)};
      export { CheckboxRegistry };
    `,
  },
  'preview-base-radio': {
    group: 'React shadcn/Base UI',
    budget: 30 * 1024,
    source: `
      import * as RadioRegistry from ${JSON.stringify(registryRadioModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(radioCss)};
      export { RadioRegistry };
    `,
  },
  'preview-base-toggle': {
    group: 'React shadcn/Base UI',
    budget: 30 * 1024,
    source: `
      import * as ToggleRegistry from ${JSON.stringify(registryToggleModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(toggleCss)};
      export { ToggleRegistry };
    `,
  },
  'preview-base-combobox': {
    group: 'React shadcn/Base UI',
    budget: 66 * 1024,
    source: `
      import * as ComboboxRegistry from ${JSON.stringify(registryComboboxModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(formFieldCss)};
      import ${JSON.stringify(comboboxCss)};
      export { ComboboxRegistry };
    `,
  },
  'preview-base-select': {
    group: 'React shadcn/Base UI',
    budget: 63 * 1024,
    source: `
      import * as SelectRegistry from ${JSON.stringify(registrySelectModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(formFieldCss)};
      import ${JSON.stringify(selectCss)};
      import ${JSON.stringify(menuCss)};
      export { SelectRegistry };
    `,
  },
  'preview-base-menu': {
    group: 'React shadcn/Base UI',
    budget: 68 * 1024,
    source: `
      import * as MenuRegistry from ${JSON.stringify(registryMenuModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(buttonCss)};
      import ${JSON.stringify(menuCss)};
      export { MenuRegistry };
    `,
  },
  'preview-base-tooltip': {
    group: 'React shadcn/Base UI',
    budget: 52 * 1024,
    source: `
      import * as TooltipRegistry from ${JSON.stringify(registryTooltipModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(buttonCss)};
      import ${JSON.stringify(tooltipCss)};
      export { TooltipRegistry };
    `,
  },
  'preview-base-tabs': {
    group: 'React shadcn/Base UI',
    budget: 31 * 1024,
    source: `
      import * as TabsRegistry from ${JSON.stringify(registryTabsModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(tabsCss)};
      export { TabsRegistry };
    `,
  },
  'preview-base-toast': {
    group: 'React shadcn/Base UI',
    budget: 38 * 1024,
    source: `
      import * as ToastRegistry from ${JSON.stringify(registryToastModule)};
      import ${JSON.stringify(tokensCss)};
      import ${JSON.stringify(buttonCss)};
      import ${JSON.stringify(toastCss)};
      export { ToastRegistry };
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
