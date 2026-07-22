import { DocsContainer } from '@storybook/addon-docs/blocks';
import React, { useEffect, useState } from 'react';
import { GLOBALS_UPDATED } from 'storybook/internal/core-events';

import '../css/design-system.css';
import '../stories/storybook.css';

import { destroyAccordions, initAccordions } from '../js/accordion.js';
import { destroyComboboxes, initComboboxes } from '../js/combobox.js';
import { destroyActionMenus, initActionMenus } from '../js/menu.js';
import { destroyModals, initModals } from '../js/modal.js';
import { destroyTabs, initTabs } from '../js/tabs.js';
import { destroyTooltips, initTooltips } from '../js/tooltip.js';
import { modeFromUrl, themeForMode } from './theme.js';

const runtimes = [
  [destroyAccordions, initAccordions],
  [destroyComboboxes, initComboboxes],
  [destroyActionMenus, initActionMenus],
  [destroyModals, initModals],
  [destroyTabs, initTabs],
  [destroyTooltips, initTooltips],
];

function refreshRuntimes() {
  const root = document.getElementById('storybook-root') || document;
  root.querySelectorAll?.('input[data-indeterminate]').forEach((input) => {
    input.indeterminate = input.dataset.indeterminate === 'true';
  });
  runtimes.forEach(([destroy]) => destroy(root));

  requestAnimationFrame(() => {
    runtimes.forEach(([, init]) => init(root));
  });
}

function ThemedDocsContainer({ children, context }) {
  const [mode, setMode] = useState(() => modeFromUrl());

  useEffect(() => {
    const syncMode = ({ globals, userGlobals }) => {
      setMode(globals?.mode || userGlobals?.mode || 'light');
    };

    context.channel.on(GLOBALS_UPDATED, syncMode);
    return () => context.channel.off(GLOBALS_UPDATED, syncMode);
  }, [context.channel]);

  return React.createElement(
    DocsContainer,
    { context, theme: themeForMode(mode) },
    children,
  );
}

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  globalTypes: {
    mode: {
      description: 'Modo de cor do Design System TIS',
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
    backgrounds: { value: 'light' },
  },
  decorators: [
    (Story, context) => {
      const mode = context.globals.mode || 'light';
      const viewMode = context.viewMode === 'docs' ? 'docs' : 'story';
      document.documentElement.setAttribute('data-mode', mode);
      refreshRuntimes();
      return `<div class="sb-story-shell sb-story-shell--${viewMode}">${Story()}</div>`;
    },
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      container: ThemedDocsContainer,
    },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        light: { name: 'Light', value: '#ffffff' },
        dark: { name: 'Dark', value: '#070c17' },
      },
    },
    a11y: {
      test: 'error',
    },
    options: {
      storySort: {
        order: ['Introdução', 'Components', ['Form', '*'], 'Compositions'],
      },
    },
  },
};

export default preview;
