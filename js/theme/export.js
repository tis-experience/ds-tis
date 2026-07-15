/* ============================================================
   export.js — gera artefatos exportáveis do tema

   Três formatos (como shadcn / Radix):
     - CSS snippet  → bloco [data-theme] pronto pra colar
     - JSON config  → ThemeConfig serializado
     - DTCG patch   → subset pra alimentar tokens/foundation/colors.json
   ============================================================ */

import { normalizeConfig } from './config-schema.js';
import { mapThemeToVars } from './semantic-mapper.js';
import { generateBrandScale, STEPS } from './palette.js';
import { generateTonedOverlays } from './overlay.js';

/**
 * Snippet CSS com as vars sob um seletor data-theme. Separa as props
 * mode-invariant (scale, radius, fonts) das que variam por modo
 * (overlays/foreground), emitindo blocos light e dark.
 */
export function toCssSnippet(config, themeName = 'custom') {
  const cfg = normalizeConfig(config);
  const light = mapThemeToVars({ ...cfg, mode: 'light' }, 'light').vars;
  const dark = mapThemeToVars({ ...cfg, mode: 'dark' }, 'dark').vars;

  // Vars iguais nos dois modos vão pro bloco base; o resto pro override dark.
  const base = {};
  const darkOnly = {};
  for (const [k, v] of Object.entries(light)) {
    if (dark[k] === v) base[k] = v;
    else base[k] = v;
  }
  for (const [k, v] of Object.entries(dark)) {
    if (light[k] !== v) darkOnly[k] = v;
  }

  const fmt = (obj) =>
    Object.entries(obj)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n');

  let out = `[data-theme="${themeName}"] {\n${fmt(base)}\n}`;
  if (Object.keys(darkOnly).length) {
    out += `\n\n[data-theme="${themeName}"][data-mode="dark"] {\n${fmt(darkOnly)}\n}`;
  }
  return out;
}

/** JSON pretty do ThemeConfig normalizado. */
export function toJsonConfig(config) {
  return JSON.stringify(normalizeConfig(config), null, 2);
}

/**
 * Patch DTCG para foundation.color.brand.* (retrocompatível).
 * Preferir toDtcgThemePatch() para write-back completo.
 */
export function toDtcgBrandPatch(config) {
  const patch = toDtcgThemePatch(config);
  return { foundation: { color: { brand: patch.foundation.color.brand } } };
}

/**
 * Patch DTCG completo: foundation brand + overlays toned + alias semantic.content.brand.
 * Não escreve arquivos — devolve objeto para revisão/write-back manual.
 */
export function toDtcgThemePatch(config) {
  const cfg = normalizeConfig(config);
  const scale = generateBrandScale(cfg.brand.seed, {
    chromaBoost: cfg.brand.chromaBoost ?? 1,
  });
  const lightOverlays = generateTonedOverlays(scale[600], 'light');
  const darkOverlays = generateTonedOverlays(scale[400], 'dark');

  const brand = {};
  for (const step of STEPS) {
    brand[step] = { $type: 'color', $value: scale[step] };
  }

  return {
    foundation: {
      color: {
        brand,
        overlay: {
          'brand-600': {
            12: { $type: 'color', $value: lightOverlays.default },
            20: { $type: 'color', $value: lightOverlays.hover },
            28: { $type: 'color', $value: lightOverlays.active },
          },
          'brand-400': {
            15: { $type: 'color', $value: darkOverlays.default },
            25: { $type: 'color', $value: darkOverlays.hover },
            32: { $type: 'color', $value: darkOverlays.active },
          },
        },
      },
    },
    semantic: {
      light: {
        content: {
          brand: {
            $type: 'color',
            $value: '{foundation.color.brand.700}',
            $description: 'Conteúdo brand sobre superfície neutra (light).',
          },
        },
      },
      dark: {
        content: {
          brand: {
            $type: 'color',
            $value: '{foundation.color.brand.400}',
            $description: 'Conteúdo brand sobre superfície neutra (dark).',
          },
        },
      },
    },
  };
}
