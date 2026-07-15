/* ============================================================
   brand-contrast-audit.js — pares WCAG alinhados ao contrato semântico
   ============================================================ */

import { normalizeConfig } from './config-schema.js';
import { mapThemeToVars } from './semantic-mapper.js';
import { generateBrandScale } from './palette.js';
import { auditPairs, WCAG_AA_TEXT, WCAG_AA_UI } from './contrast.js';

/** Superfícies neutras (foundation.color.neutral) para composição de overlays. */
const SURFACE = {
  light: '#F8FAFC', // neutral-50 — background.default light
  dark: '#070C17', // neutral-950 — background.default dark
};

/** Rótulos bilíngues indexados por chave estável. */
export const CONTRAST_LABELS = {
  brandFill: { pt: 'Fill brand / foreground', en: 'Brand fill / foreground' },
  toned: { pt: 'Toned / conteúdo', en: 'Toned fill / content' },
  contentBrand: { pt: 'Content brand / superfície', en: 'Brand content / surface' },
  contentBrandTinted: { pt: 'Content brand / fundo tinted', en: 'Brand content / tinted bg' },
  link: { pt: 'Link / superfície', en: 'Link / surface' },
  focus: { pt: 'Focus ring / superfície', en: 'Focus ring / surface' },
};

/**
 * Monta pares de contraste para um modo, espelhando tokens semânticos brand/toned/link.
 * @param {object} config - ThemeConfig normalizado ou parcial.
 * @param {'light'|'dark'} mode
 * @returns {Array<{ key: string, name: string, fg: string, bg: string, under?: string, threshold: number }>}
 */
export function buildBrandContrastPairs(config, mode) {
  const cfg = normalizeConfig({ ...config, mode });
  const { vars, contrast } = mapThemeToVars(cfg, mode);
  const scale = generateBrandScale(cfg.brand.seed, { chromaBoost: cfg.brand.chromaBoost ?? 1 });
  const surface = SURFACE[mode];
  const tintedBg = mode === 'light'
    ? scale[50]
    : vars['--ds-toned-background-default'];
  const tintedUnder = mode === 'light' ? undefined : surface;

  return [
    {
      key: 'brandFill',
      name: CONTRAST_LABELS.brandFill.en,
      fg: contrast.foreground,
      bg: contrast.brandFill,
      threshold: WCAG_AA_UI,
    },
    {
      key: 'toned',
      name: CONTRAST_LABELS.toned.en,
      fg: vars['--ds-toned-content-default'],
      bg: vars['--ds-toned-background-default'],
      under: surface,
      threshold: WCAG_AA_UI,
    },
    {
      key: 'contentBrand',
      name: CONTRAST_LABELS.contentBrand.en,
      fg: vars['--ds-content-brand'],
      bg: surface,
      threshold: WCAG_AA_TEXT,
    },
    {
      key: 'contentBrandTinted',
      name: CONTRAST_LABELS.contentBrandTinted.en,
      fg: vars['--ds-content-brand'],
      bg: tintedBg,
      ...(tintedUnder ? { under: tintedUnder } : {}),
      threshold: WCAG_AA_TEXT,
    },
    {
      key: 'link',
      name: CONTRAST_LABELS.link.en,
      fg: vars['--ds-link-content-default'],
      bg: surface,
      threshold: WCAG_AA_TEXT,
    },
    {
      key: 'focus',
      name: CONTRAST_LABELS.focus.en,
      fg: vars['--ds-border-focus'],
      bg: surface,
      threshold: WCAG_AA_UI,
    },
  ];
}

/**
 * Audita light e dark; retorna linhas flat com mode + resultado auditPairs.
 * @param {object} config
 * @returns {{ rows: Array, allPass: boolean, failCount: number }}
 */
export function auditBrandTheme(config) {
  const rows = [];
  for (const mode of ['light', 'dark']) {
    const pairs = buildBrandContrastPairs(config, mode);
    for (const p of pairs) {
      const audited = auditPairs([{
        name: p.name,
        fg: p.fg,
        bg: p.bg,
        threshold: p.threshold,
        ...(p.under ? { under: p.under } : {}),
      }])[0];
      rows.push({
        mode,
        key: p.key,
        labelKey: p.key,
        ...audited,
        under: p.under,
      });
    }
  }
  const failCount = rows.filter((r) => !r.passes).length;
  return { rows, allPass: failCount === 0, failCount };
}

/** Vars brand-related que o mapper deve emitir (paridade com theme-light/dark.css). */
export const CANONICAL_BRAND_CSS_VARS = [
  '--ds-color-brand-600',
  '--ds-overlay-brand-600-12',
  '--ds-brand-background-default',
  '--ds-brand-content-default',
  '--ds-toned-background-default',
  '--ds-toned-content-default',
  '--ds-content-brand',
  '--ds-link-content-default',
  '--ds-border-focus',
  '--ds-border-brand',
  '--ds-focus-ring-color',
];
