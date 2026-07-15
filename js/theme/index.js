/* ============================================================
   index.js — API pública do theme engine

   Uso no browser (playground) ou Node (scripts/testes):

     import { applyTheme, toCssSnippet } from './js/theme/index.js';
     applyTheme({ brand: { seed: '#EA580C' }, radius: 'round', mode: 'light' });
   ============================================================ */

export * from './color.js';
export * from './contrast.js';
export * from './palette.js';
export * from './overlay.js';
export * from './radius.js';
export * from './typography.js';
export * from './config-schema.js';
export * from './semantic-mapper.js';
export * from './apply.js';
export * from './export.js';
export * from './url-state.js';
export * from './brand-contrast-audit.js';
