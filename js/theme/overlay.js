/* ============================================================
   overlay.js — gera os overlays toned brand-derived

   Espelha foundation.color.overlay.brand-600.* (light) e
   brand-400.* (dark). Os alphas são os mesmos do DS (ADR-007):
     light: 600 @ 12/20/28%
     dark:  400 @ 15/25/32%
   ============================================================ */

import { hexToRgba } from './color.js';

export const LIGHT_ALPHAS = { default: 0.12, hover: 0.2, active: 0.28 };
export const DARK_ALPHAS = { default: 0.15, hover: 0.25, active: 0.32 };

/**
 * Gera os 3 overlays toned de um modo a partir do hex base.
 *
 * @param {string} baseHex - brand.600 (light) ou brand.400 (dark).
 * @param {'light'|'dark'} mode
 * @returns {{default:string, hover:string, active:string}}
 */
export function generateTonedOverlays(baseHex, mode) {
  const alphas = mode === 'dark' ? DARK_ALPHAS : LIGHT_ALPHAS;
  return {
    default: hexToRgba(baseHex, alphas.default),
    hover: hexToRgba(baseHex, alphas.hover),
    active: hexToRgba(baseHex, alphas.active),
  };
}
