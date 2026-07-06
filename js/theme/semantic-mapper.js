/* ============================================================
   semantic-mapper.js — ThemeConfig → CSS custom properties

   Espelha os aliases de tokens/semantic/light.json e dark.json:
     light: brand.bg = brand.600/700/800, links = 700/800, focus = 600
     dark:  brand.bg = brand.400/500/400, links = 400/300/200, focus = 400

   Produz três grupos de variáveis:
     1. Foundation brand scale  (--ds-color-brand-50..950)
     2. Overlays toned          (--ds-overlay-brand-600 e brand-400)
     3. Semantic com contraste  (--ds-brand-content-*, focus, etc.)
     4. Radius + tipografia
   ============================================================ */

import { generateBrandScale, scaleFromExplicit, STEPS } from './palette.js';
import { generateTonedOverlays } from './overlay.js';
import { pickAccessibleForeground, WCAG_AA_UI } from './contrast.js';
import { generateRadiusTheme } from './radius.js';
import { buildFontStacks } from './typography.js';

/** Neutros do DS usados como foreground candidatos (foundation.color.neutral). */
const NEUTRAL_LIGHT = '#F8FAFC'; // neutral-50
const NEUTRAL_DARK = '#0F172A'; // neutral-900

/**
 * Gera o mapa completo de CSS vars (sem `--` de seletor) para um modo.
 *
 * @param {object} config - ThemeConfig normalizado.
 * @param {'light'|'dark'} mode
 * @returns {{ vars: Record<string,string>, contrast: object }}
 */
export function mapThemeToVars(config, mode) {
  const scale = config.brand?.scale
    ? { ...generateBrandScale(config.brand.seed), ...scaleFromExplicit(config.brand.scale) }
    : generateBrandScale(config.brand.seed, { chromaBoost: config.brand?.chromaBoost ?? 1 });

  const vars = {};

  // 1. Foundation brand scale
  for (const step of STEPS) {
    vars[`--ds-color-brand-${step}`] = scale[step];
  }

  // 2. Overlays toned (light usa 600; dark usa 400)
  const light = generateTonedOverlays(scale[600], 'light');
  const dark = generateTonedOverlays(scale[400], 'dark');
  vars['--ds-overlay-brand-600-12'] = light.default;
  vars['--ds-overlay-brand-600-20'] = light.hover;
  vars['--ds-overlay-brand-600-28'] = light.active;
  vars['--ds-overlay-brand-400-15'] = dark.default;
  vars['--ds-overlay-brand-400-25'] = dark.hover;
  vars['--ds-overlay-brand-400-32'] = dark.active;

  // 3. Semantic: conteúdo sobre fill brand sólido com contraste garantido.
  // Light fill = brand.600; dark fill = brand.400. Escolhe neutral-50 ou
  // neutral-900 pelo melhor contraste (WCAG UI/large 3:1 no mínimo).
  const brandFill = mode === 'dark' ? scale[400] : scale[600];
  const fg = pickAccessibleForeground(brandFill, {
    light: NEUTRAL_LIGHT,
    dark: NEUTRAL_DARK,
    threshold: WCAG_AA_UI,
  });
  vars['--ds-brand-content-default'] = fg.fg;
  vars['--ds-brand-content-hover'] = fg.fg;

  // 4. Radius + tipografia (mode-invariant, mas emitimos em ambos)
  if (config.radius != null) {
    const { foundation, semantic, component } = generateRadiusTheme(config.radius);
    for (const [step, value] of Object.entries(foundation)) {
      vars[`--ds-radius-${step}`] = value;
    }
    if (semantic) {
      for (const [slot, value] of Object.entries(semantic)) {
        vars[`--ds-radius-${slot}`] = value;
      }
    }
    for (const [name, value] of Object.entries(component)) {
      vars[name] = value;
    }
  }
  if (config.typography) {
    const stacks = buildFontStacks(config.typography);
    vars['--ds-font-family-sans'] = stacks.sans;
    vars['--ds-font-family-mono'] = stacks.mono;
    vars['--ds-font-family-display'] = stacks.display;
  }

  return {
    vars,
    contrast: {
      brandFill,
      foreground: fg.fg,
      ratio: fg.ratio,
      passes: fg.passes,
    },
  };
}
