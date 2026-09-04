import React from 'react';
import registry from '../registry.json';

import '../css/tokens/generated/index.css';
import '../css/components/accordion.css';
import '../css/components/alert.css';
import '../css/components/avatar.css';
import '../css/components/badge.css';
import '../css/components/breadcrumb.css';
import '../css/components/button.css';
import '../css/components/card.css';
import '../css/components/checkbox.css';
import '../css/components/combobox.css';
import '../css/components/divider.css';
import '../css/components/form-field.css';
import '../css/components/input.css';
import '../css/components/menu.css';
import '../css/components/modal.css';
import '../css/components/popover.css';
import '../css/components/radio.css';
import '../css/components/select.css';
import '../css/components/skeleton.css';
import '../css/components/spinner.css';
import '../css/components/table.css';
import '../css/components/tabs.css';
import '../css/components/textarea.css';
import '../css/components/toast.css';
import '../css/components/tooltip.css';
import '../css/components/toggle.css';
import '../packages/react/src/storybook.css';

const registryStyleId = 'ds-tis-shadcn-registry-adapters';

function compileRegistryRules(rules) {
  return Object.entries(rules)
    .map(([selector, declarations]) => {
      const body = Object.entries(declarations)
        .map(([property, value]) => `${property}:${value};`)
        .join('');
      return `${selector}{${body}}`;
    })
    .join('\n');
}

function installRegistryAdapters() {
  if (document.getElementById(registryStyleId)) return;

  const rules = [];
  for (const item of registry.items) {
    for (const [key, value] of Object.entries(item.css || {})) {
      if (key.startsWith('@import ')) continue;
      if (key.startsWith('@layer ')) {
        rules.push(`${key}{${compileRegistryRules(value)}}`);
      } else {
        rules.push(compileRegistryRules({ [key]: value }));
      }
    }
  }

  const style = document.createElement('style');
  style.id = registryStyleId;
  style.textContent = rules.join('\n');
  document.head.append(style);
}

function normalizeFocusPrototypeForZag() {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'focus');
  if (!descriptor?.get) return;

  // Storybook instrumenta focus como accessor. Zag lê HTMLElement.prototype.focus
  // para rastrear focus-visible, então precisa encontrar uma função chamável.
  const probe = document.createElement('button');
  const focus = descriptor.get.call(probe);
  if (typeof focus !== 'function') return;
  Object.defineProperty(HTMLElement.prototype, 'focus', {
    configurable: true,
    value: focus,
    writable: true,
  });
}

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  globalTypes: {
    mode: {
      description: 'Modo de cor',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    mode: 'light',
  },
  decorators: [
    (Story, context) => {
      installRegistryAdapters();
      normalizeFocusPrototypeForZag();
      const mode = context.globals.mode || 'light';
      document.documentElement.setAttribute('data-mode', mode);
      return React.createElement(
        'div',
        {
          className: `ds-story-shell ds-story-shell--${context.viewMode || 'story'}`,
          'data-mode': mode,
        },
        React.createElement(Story),
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    options: {
      storySort: {
        order: [
          'Overview',
          ['React registry'],
          'Components',
          [
            'Actions',
            ['Button'],
            'Content and structure',
            ['Card', 'Divider', 'Table'],
            'Input and selection',
            ['Checkbox', 'Combobox', 'Form Field', 'Input Text', 'Radio', 'Select', 'Textarea', 'Toggle'],
            'Feedback and status',
            ['Alert', 'Badge', 'Skeleton', 'Spinner', 'Toast'],
            'Navigation',
            ['Menu', 'Tabs'],
            'Overlay and disclosure',
            ['Accordion', 'Modal', 'Popover', 'Tooltip'],
          ],
          'Outputs',
          ['Ark + Zag'],
        ],
      },
    },
  },
};

export default preview;
