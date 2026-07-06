/* ============================================================
   palette.js — gera escala de marca 50..950 a partir de 1 seed

   Estratégia (OKLCH):
     1. Converte a seed para OKLCH.
     2. Lightness (L): usa os alvos medidos da rampa default do DS.
        L é o que define "quão claro/escuro" é um step — deve ser
        estável independente da marca.
     3. Hue (h): preserva o *shift* de hue de cada step relativo ao
        step âncora (500) da rampa default, somado ao hue da seed.
        Rampas reais "esfriam/esquentam" levemente nos extremos; isso
        reproduz esse comportamento para qualquer marca.
     4. Chroma (C): escala o chroma default de cada step pela razão
        entre o chroma da seed e o chroma default do step âncora,
        com clamp de gamut.

   DEFAULT_L / DEFAULT_C / DEFAULT_H foram medidos do blue default do DS
   (foundation.color.brand.*), então seed = #2563EB reproduz a paleta
   existente quase bit-a-bit.
   ============================================================ */

import { hexToOklch, oklchToHex, clamp } from './color.js';

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/** Step âncora: onde a marca é mais reconhecível e onde a seed "encaixa". */
export const SEED_ANCHOR_STEP = 500;

/** Lightness OKLCH alvo por step (medido do blue default do DS). */
const DEFAULT_L = {
  50: 0.9705, 100: 0.9319, 200: 0.8823, 300: 0.8091, 400: 0.7137,
  500: 0.6231, 600: 0.5461, 700: 0.4882, 800: 0.4244, 900: 0.3791, 950: 0.2823,
};

/** Chroma OKLCH de referência por step (blue default do DS). */
const DEFAULT_C = {
  50: 0.0142, 100: 0.0316, 200: 0.0571, 300: 0.0956, 400: 0.1434,
  500: 0.188, 600: 0.2152, 700: 0.2172, 800: 0.1809, 900: 0.1378, 950: 0.0874,
};

/** Hue OKLCH por step (blue default do DS). */
const DEFAULT_H = {
  50: 254.6, 100: 255.59, 200: 254.13, 300: 251.81, 400: 254.62,
  500: 259.81, 600: 262.88, 700: 264.38, 800: 265.64, 900: 265.52, 950: 267.94,
};

/**
 * Encontra o step cuja lightness default mais se aproxima de L.
 * Usado para ancorar a seed no ponto certo da rampa, garantindo que
 * uma seed que já é (ex) o brand-600 reproduza a paleta com scale 1.0.
 */
function nearestStepByLightness(L) {
  let best = STEPS[0];
  let bestDiff = Infinity;
  for (const step of STEPS) {
    const diff = Math.abs(DEFAULT_L[step] - L);
    if (diff < bestDiff) { bestDiff = diff; best = step; }
  }
  return best;
}

/**
 * Gera a escala completa a partir de uma seed hex.
 *
 * @param {string} seedHex - cor primária, ex "#2563EB".
 * @param {object} [opts]
 * @param {number} [opts.chromaBoost=1] - multiplicador global de chroma.
 * @returns {Record<number,string>} mapa step → hex.
 */
export function generateBrandScale(seedHex, { chromaBoost = 1 } = {}) {
  const seed = hexToOklch(seedHex);

  // Ancora a seed no step de lightness mais próximo, para que o chroma
  // e o hue relativos sejam medidos contra o step correto da rampa.
  const anchorStep = nearestStepByLightness(seed.L);
  const anchorC = DEFAULT_C[anchorStep];
  const anchorH = DEFAULT_H[anchorStep];

  const chromaScale = (seed.C / anchorC) * chromaBoost;
  const hueShift = seed.h - anchorH;

  const scale = {};
  for (const step of STEPS) {
    const L = DEFAULT_L[step];
    const C = clamp(DEFAULT_C[step] * chromaScale, 0, 0.37);
    let h = DEFAULT_H[step] + hueShift;
    h = ((h % 360) + 360) % 360;
    scale[step] = oklchToHex({ L, C, h });
  }
  return scale;
}

/**
 * Escala baseada em hex explícitos por step (power users que já têm
 * a rampa pronta). Retorna apenas os steps fornecidos, em uppercase.
 */
export function scaleFromExplicit(partial) {
  const out = {};
  for (const step of STEPS) {
    if (partial && partial[step]) out[step] = String(partial[step]).toUpperCase();
  }
  return out;
}
