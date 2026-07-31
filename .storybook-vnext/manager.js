import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'TIS Design System · vNext',
    brandUrl: '../next/',
    colorPrimary: '#0050DA',
    colorSecondary: '#0065ED',
    appBorderRadius: 8,
  }),
});
