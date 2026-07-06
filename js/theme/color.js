/* ============================================================
   color.js — conversões de cor sem dependências (browser + Node)

   Suporta a cadeia sRGB(hex) ↔ linear sRGB ↔ OKLab ↔ OKLCH.
   OKLCH é usado como espaço de trabalho porque é perceptualmente
   uniforme: variar lightness/chroma gera escalas com passos
   visualmente regulares, ao contrário de HSL.

   Referências: Björn Ottosson, "A perceptual color space for image
   processing" (OKLab/OKLCH).
   ============================================================ */

/** Limita n ao intervalo [min, max]. */
export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/** "#2563EB" | "2563eb" | "#25f" → { r, g, b } em 0..255. */
export function hexToRgb(hex) {
  let h = String(hex).trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) {
    throw new Error(`hex inválido: ${hex}`);
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** { r, g, b } 0..255 → "#RRGGBB" uppercase. */
export function rgbToHex({ r, g, b }) {
  const to2 = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return ('#' + to2(r) + to2(g) + to2(b)).toUpperCase();
}

/** sRGB 8-bit channel → linear-light 0..1. */
function srgbToLinear(c) {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

/** linear-light 0..1 → sRGB 8-bit channel 0..255. */
function linearToSrgb(c) {
  const cs = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return clamp(Math.round(cs * 255), 0, 255);
}

/** { r, g, b } 0..255 → OKLab { L, a, b }. */
export function rgbToOklab({ r, g, b }) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

/** OKLab { L, a, b } → { r, g, b } 0..255 (com clamp de gamut). */
export function oklabToRgb({ L, a, b }) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return { r: linearToSrgb(lr), g: linearToSrgb(lg), b: linearToSrgb(lb) };
}

/** OKLab { L, a, b } → OKLCH { L, C, h } (h em graus 0..360). */
export function oklabToOklch({ L, a, b }) {
  const C = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * (180 / Math.PI);
  if (h < 0) h += 360;
  return { L, C, h };
}

/** OKLCH { L, C, h } → OKLab { L, a, b }. */
export function oklchToOklab({ L, C, h }) {
  const hr = (h * Math.PI) / 180;
  return { L, a: Math.cos(hr) * C, b: Math.sin(hr) * C };
}

/** "#RRGGBB" → OKLCH { L, C, h }. */
export function hexToOklch(hex) {
  return oklabToOklch(rgbToOklab(hexToRgb(hex)));
}

/** OKLCH { L, C, h } → "#RRGGBB" (gamut sRGB via clamp por canal). */
export function oklchToHex(oklch) {
  return rgbToHex(oklabToRgb(oklchToOklab(oklch)));
}

/**
 * Luminância relativa WCAG (0..1) a partir de { r, g, b } 0..255.
 * Usada por contrast.js. Mesma fórmula da WCAG 2.x.
 */
export function relativeLuminance({ r, g, b }) {
  const lin = (c) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Monta string rgba() a partir de hex + alpha 0..1. */
export function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  const a = clamp(alpha, 0, 1);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** "rgba(r,g,b,a)" → { r, g, b, a }. */
export function parseRgba(str) {
  const m = String(str).trim().match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/,
  );
  if (!m) throw new Error(`rgba inválido: ${str}`);
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
}

/** Cor semi-transparente composta sobre fundo sólido hex → hex resultante. */
export function compositeOnHex(overlay, underHex) {
  const { r, g, b, a } = typeof overlay === 'string' ? parseRgba(overlay) : overlay;
  const bg = hexToRgb(underHex);
  return rgbToHex({
    r: r * a + bg.r * (1 - a),
    g: g * a + bg.g * (1 - a),
    b: b * a + bg.b * (1 - a),
  });
}
