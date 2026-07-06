/* ============================================================
   radius.js — presets de corner radius

   Presets escalares (sharp → soft) multiplicam a escala Foundation.
   Preset `soft` (2×): botões em pill; campos e containers internos
   limitados a 1.5× (round); superfícies xl+ seguem 2×.
   ============================================================ */

/** Steps Foundation escaláveis (px). */
export const RADIUS_STEPS = [2, 4, 8, 12, 16, 24];

/** Valor pill do DS (foundation.radius.999). */
export const RADIUS_PILL_VALUE = '999px';

/** Teto de radius para campos e containers no preset soft (1.5×). */
export const SOFT_INNER_CAP_PRESET = 'round';

/** Presets escalares (multiplicador sobre a escala default). */
export const RADIUS_PRESETS = {
  sharp: 0,
  tight: 0.5,
  default: 1,
  round: 1.5,
  soft: 2,
};

/**
 * Resolve preset escalar (string ou number).
 */
export function resolveRadiusFactor(preset) {
  if (typeof preset === 'number') return Math.max(0, preset);
  return RADIUS_PRESETS[preset] ?? RADIUS_PRESETS.default;
}

/**
 * Escala Foundation (rem) com multiplicador.
 *
 * @returns {Record<number,string>} step(px) → valor CSS.
 */
export function generateRadiusScale(preset) {
  const factor = resolveRadiusFactor(preset);
  const out = {};
  for (const step of RADIUS_STEPS) {
    const px = step * factor;
    out[step] = `${+(px / 16).toFixed(4)}rem`;
  }
  return out;
}

/**
 * Tema completo de radius: Foundation + semantic + overrides Component.
 *
 * @returns {{
 *   foundation: Record<number,string>,
 *   semantic: Record<string,string>|null,
 *   component: Record<string,string>
 * }}
 */
export function generateRadiusTheme(preset) {
  const foundation = generateRadiusScale(preset);
  const component = {};
  let semantic = null;

  if (preset === 'soft') {
    const inner = generateRadiusScale(SOFT_INNER_CAP_PRESET);
    component['--ds-button-radius-default'] = RADIUS_PILL_VALUE;
    semantic = {
      sm: inner[4],
      md: inner[8],
      lg: inner[12],
      xl: inner[16],
    };
  }

  return { foundation, semantic, component };
}
