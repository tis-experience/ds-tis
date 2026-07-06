/* ============================================================
   contrast.js — razão de contraste WCAG 2.2 e seleção acessível

   WCAG 2.2 AA (AGENTS.md §8):
     - texto normal: >= 4.5:1
     - texto large / componentes UI: >= 3:1
   ============================================================ */

import { hexToRgb, relativeLuminance, compositeOnHex } from './color.js';

export const WCAG_AA_TEXT = 4.5;
export const WCAG_AA_LARGE = 3;
export const WCAG_AA_UI = 3;

/**
 * Razão de contraste WCAG entre duas cores. Aceita hex; bg rgba exige
 * `under` (hex do fundo sobre o qual o overlay semi-transparente está).
 */
export function contrastRatio(fg, bg, { under } = {}) {
  let fgHex = fg;
  let bgHex = bg;
  if (String(fg).startsWith('rgba') || String(fg).startsWith('rgb(')) {
    if (!under) throw new Error('contrastRatio: under é obrigatório quando fg é rgba');
    fgHex = compositeOnHex(fg, under);
  }
  if (String(bg).startsWith('rgba') || String(bg).startsWith('rgb(')) {
    if (!under) throw new Error('contrastRatio: under é obrigatório quando bg é rgba');
    bgHex = compositeOnHex(bg, under);
  }
  const la = relativeLuminance(hexToRgb(fgHex));
  const lb = relativeLuminance(hexToRgb(bgHex));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** true se o par atinge o threshold (default: texto normal 4.5:1). */
export function meetsContrast(hexA, hexB, threshold = WCAG_AA_TEXT) {
  return contrastRatio(hexA, hexB) >= threshold;
}

/**
 * Escolhe o foreground de maior contraste entre candidatos (default:
 * quase-branco vs quase-preto neutros do DS). Retorna o hex vencedor
 * e se ele passa no threshold.
 */
export function pickAccessibleForeground(
  bgHex,
  { light = '#F8FAFC', dark = '#0F172A', threshold = WCAG_AA_TEXT } = {}
) {
  const rLight = contrastRatio(bgHex, light);
  const rDark = contrastRatio(bgHex, dark);
  const useDark = rDark >= rLight;
  const fg = useDark ? dark : light;
  const ratio = useDark ? rDark : rLight;
  return { fg, ratio, passes: ratio >= threshold };
}

/**
 * Avalia uma lista de pares foreground/background e retorna um relatório.
 * Cada par: { name, fg, bg, threshold? }.
 */
export function auditPairs(pairs) {
  return pairs.map((p) => {
    const threshold = p.threshold ?? WCAG_AA_TEXT;
    const ratio = contrastRatio(p.fg, p.bg);
    return {
      name: p.name,
      fg: p.fg,
      bg: p.bg,
      ratio: Math.round(ratio * 100) / 100,
      threshold,
      passes: ratio >= threshold,
    };
  });
}
