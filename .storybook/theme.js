import { create } from 'storybook/theming';

const brand = {
  brandTitle: 'Design System TIS',
  brandUrl: 'https://tis-experience.github.io/ds-tis/',
};

export const lightTheme = create({ base: 'light', ...brand });
export const darkTheme = create({ base: 'dark', ...brand });

export function modeFromUrl(search = globalThis.location?.search || '') {
  const globals = new URLSearchParams(search).get('globals') || '';
  const mode = globals
    .split(';')
    .find((entry) => entry.startsWith('mode:'))
    ?.slice('mode:'.length);

  return mode === 'dark' ? 'dark' : 'light';
}

export function themeForMode(mode) {
  return mode === 'dark' ? darkTheme : lightTheme;
}
