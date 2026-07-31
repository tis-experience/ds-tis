import React from 'react';
import registry from '../registry.json';

import '../css/tokens/generated/index.css';
import '../css/components/accordion.css';
import '../css/components/button.css';
import '../css/components/checkbox.css';
import '../css/components/form-field.css';
import '../css/components/input.css';
import '../css/components/modal.css';
import '../css/components/radio.css';
import '../css/components/textarea.css';
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
      const mode = context.globals.mode || 'light';
      document.documentElement.setAttribute('data-mode', mode);
      return React.createElement(
        'div',
        { className: 'vnext-story-shell', 'data-mode': mode },
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
        order: ['vNext'],
      },
    },
  },
};

export default preview;
