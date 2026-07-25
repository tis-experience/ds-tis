import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { addons } from 'storybook/manager-api';

import { modeFromUrl, themeForMode } from './theme.js';

addons.setConfig({ theme: themeForMode(modeFromUrl()) });

addons.register('tis/color-mode', (api) => {
  const applyTheme = (mode) => {
    api.setOptions({ theme: themeForMode(mode) });
  };

  applyTheme(modeFromUrl());
  api.getChannel().on(GLOBALS_UPDATED, ({ globals, userGlobals }) => {
    applyTheme(globals?.mode || userGlobals?.mode || 'light');
  });
});
