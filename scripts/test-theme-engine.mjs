#!/usr/bin/env node
/**
 * test-theme-engine — valida o motor de theming (js/theme/*).
 *
 * Cobre:
 *   1. Conversões de cor round-trip (hex↔oklch) dentro de tolerância.
 *   2. Seed default (#2563EB) reproduz a paleta brand do DS.
 *   3. Contraste WCAG: ratio conhecido e seleção de foreground.
 *   4. Overlays toned com alphas corretos.
 *   5. Radius presets (sharp/default/round).
 *   6. URL encode/decode round-trip.
 *   7. semantic-mapper emite as vars esperadas + contraste AA.
 *
 * Saída no padrão dos outros testes do repo. Exit 1 se houver falha.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  hexToOklch, oklchToHex, hexToRgb,
} from '../js/theme/color.js';
import { contrastRatio, pickAccessibleForeground } from '../js/theme/contrast.js';
import { generateBrandScale, STEPS } from '../js/theme/palette.js';
import { generateTonedOverlays } from '../js/theme/overlay.js';
import { generateRadiusScale, generateRadiusTheme } from '../js/theme/radius.js';
import { encodeConfig, decodeConfig } from '../js/theme/url-state.js';
import { mapThemeToVars } from '../js/theme/semantic-mapper.js';
import { toCssSnippet, toDtcgBrandPatch, toDtcgThemePatch } from '../js/theme/export.js';
import { applyTheme } from '../js/theme/apply.js';
import { DEFAULT_CONFIG } from '../js/theme/config-schema.js';
import { auditBrandTheme, CANONICAL_BRAND_CSS_VARS } from '../js/theme/brand-contrast-audit.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
let checks = 0;

/** Âncora OKLCH da paleta TIS (gera escala 50–950; 600 ajustado para folga WCAG). */
const TIS_BRAND_ANCHOR = '#0056E0';
const TIS_BRAND_600 = '#0065ED';
const TIS_BRAND_700 = '#0050DA';

function ok(cond, msg) {
  checks++;
  if (!cond) errors.push(msg);
}
function near(a, b, tol, msg) {
  checks++;
  if (Math.abs(a - b) > tol) errors.push(`${msg} (esperado ~${b}, obtido ${a})`);
}

// ── 1. Color round-trip ────────────────────────────────────────────
for (const hex of ['#2563EB', '#EA580C', '#16A34A', '#000000', '#FFFFFF']) {
  const back = oklchToHex(hexToOklch(hex));
  const a = hexToRgb(hex);
  const b = hexToRgb(back);
  const dist = Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
  ok(dist <= 3, `round-trip hex→oklch→hex divergiu para ${hex} → ${back} (Δ=${dist})`);
}

// ── 2. Âncora TIS reproduz a paleta brand do DS (600 pode divergir p/ WCAG) ──
const colorsJson = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tokens/foundation/colors.json'), 'utf-8')
);
const dsBrand = colorsJson.foundation.color.brand;
const scale = generateBrandScale(TIS_BRAND_ANCHOR);
for (const step of STEPS) {
  const expected = hexToRgb(dsBrand[step].$value);
  const got = hexToRgb(scale[step]);
  const dist = Math.abs(expected.r - got.r) + Math.abs(expected.g - got.g) + Math.abs(expected.b - got.b);
  // Tolerância generosa: reprodução perceptual, não bit-exact.
  ok(dist <= 24, `brand.${step}: gerado ${scale[step]} distante de ${dsBrand[step].$value} (Δ=${dist})`);
}

// ── 3. Contraste WCAG ───────────────────────────────────────────────
near(contrastRatio('#000000', '#FFFFFF'), 21, 0.01, 'contraste black/white deve ser 21');
{
  const onWhite = contrastRatio(TIS_BRAND_600, 'rgba(0, 101, 237, 0.12)', { under: '#FFFFFF' });
  ok(onWhite > 1 && onWhite < 21, `contraste rgba sobre branco deve ser finito, veio ${onWhite}`);
}
{
  // brand-600 TIS deve preferir foreground claro e passar 4.5:1 com folga (texto normal)
  const fg = pickAccessibleForeground(TIS_BRAND_600, { light: '#F8FAFC', dark: '#0F172A', threshold: 4.5 });
  ok(fg.fg === '#F8FAFC', `foreground de ${TIS_BRAND_600} deveria ser claro, veio ${fg.fg}`);
  ok(fg.passes, `foreground de ${TIS_BRAND_600} deveria passar 4.5:1 (ratio ${fg.ratio})`);
  ok(fg.ratio >= 4.85, `foreground de ${TIS_BRAND_600} deveria ter folga >=4.85:1 (ratio ${fg.ratio})`);
}
{
  // content.brand (700) em fundos claros — neutral-100 e brand-100
  const bgs = { neutral100: '#F1F5F9', brand50: '#EEF6FF', brand100: '#DAEAFE' };
  for (const [name, bg] of Object.entries(bgs)) {
    const ratio = contrastRatio(TIS_BRAND_700, bg);
    ok(ratio >= 4.5, `brand/700 sobre ${name} deveria passar 4.5:1 (ratio ${ratio.toFixed(2)})`);
  }
}
{
  // amarelo claro deve preferir foreground escuro
  const fg = pickAccessibleForeground('#FDE047', { light: '#F8FAFC', dark: '#0F172A', threshold: 3 });
  ok(fg.fg === '#0F172A', `foreground de #FDE047 deveria ser escuro, veio ${fg.fg}`);
}

// ── 4. Overlays toned ───────────────────────────────────────────────
{
  const light = generateTonedOverlays(TIS_BRAND_600, 'light');
  ok(light.default === 'rgba(0, 101, 237, 0.12)', `overlay light default errado: ${light.default}`);
  ok(light.hover === 'rgba(0, 101, 237, 0.2)', `overlay light hover errado: ${light.hover}`);
  const dark = generateTonedOverlays('#56A7F8', 'dark');
  ok(dark.default === 'rgba(86, 167, 248, 0.15)', `overlay dark default errado: ${dark.default}`);
}

// ── 5. Radius presets ───────────────────────────────────────────────
{
  const sharp = generateRadiusScale('sharp');
  ok(sharp[8] === '0rem', `radius sharp step 8 deveria ser 0rem, veio ${sharp[8]}`);
  const def = generateRadiusScale('default');
  ok(def[8] === '0.5rem', `radius default step 8 deveria ser 0.5rem, veio ${def[8]}`);
  const round = generateRadiusScale('round');
  ok(round[8] === '0.75rem', `radius round step 8 deveria ser 0.75rem, veio ${round[8]}`);
  const soft = generateRadiusTheme('soft');
  ok(soft.foundation[24] === '3rem', `soft foundation step 24 deveria ser 2× (3rem), veio ${soft.foundation[24]}`);
  ok(soft.semantic.md === '0.75rem', `soft campos (md) deveriam cap 1.5×, veio ${soft.semantic.md}`);
  ok(soft.semantic.lg === '1.125rem', `soft containers (lg) deveriam cap 1.5×, veio ${soft.semantic.lg}`);
  ok(
    soft.component['--ds-button-radius-default'] === '999px',
    `soft deve aplicar pill só em button, veio ${soft.component['--ds-button-radius-default']}`,
  );
}

// ── 6. URL round-trip ───────────────────────────────────────────────
{
  const cfg = { brand: { seed: '#EA580C' }, radius: 'round', typography: { sans: 'Roboto', mono: 'Menlo' }, mode: 'dark' };
  const decoded = decodeConfig(encodeConfig(cfg));
  ok(decoded.brand.seed === '#EA580C', `url seed divergiu: ${decoded.brand.seed}`);
  ok(decoded.radius === 'round', `url radius divergiu: ${decoded.radius}`);
  ok(decoded.mode === 'dark', `url mode divergiu: ${decoded.mode}`);
  ok(decoded.typography.sans === 'Roboto', `url font divergiu: ${decoded.typography.sans}`);
}

// ── 7. semantic-mapper ──────────────────────────────────────────────
{
  const cfg = { ...DEFAULT_CONFIG, mode: 'light' };
  const { vars, contrast } = mapThemeToVars(cfg, 'light');
  ok('--ds-color-brand-600' in vars, 'mapper deve emitir --ds-color-brand-600');
  ok('--ds-overlay-brand-600-12' in vars, 'mapper deve emitir overlay brand-600-12');
  ok('--ds-brand-content-default' in vars, 'mapper deve emitir brand-content-default');
  ok('--ds-brand-background-default' in vars, 'mapper deve emitir brand-background-default');
  ok('--ds-toned-background-default' in vars, 'mapper deve emitir toned-background-default');
  ok('--ds-link-content-default' in vars, 'mapper deve emitir link-content-default');
  ok('--ds-border-focus' in vars, 'mapper deve emitir border-focus');
  ok('--ds-content-brand' in vars, 'mapper deve emitir content-brand');
  ok('--ds-border-brand' in vars, 'mapper deve emitir border-brand');
  ok('--ds-focus-ring-color' in vars, 'mapper deve emitir focus-ring-color');
  ok(vars['--ds-content-brand'] === scale['700'], `light content-brand deveria ser brand.700, veio ${vars['--ds-content-brand']}`);
  ok(vars['--ds-brand-background-default'] === scale['600'], `light brand bg deveria ser brand.600, veio ${vars['--ds-brand-background-default']}`);
  ok('--ds-font-family-sans' in vars, 'mapper deve emitir font-family-sans');
  ok(contrast.passes, `contraste brand fill/foreground deve passar (ratio ${contrast.ratio})`);

  const dark = mapThemeToVars({ ...cfg, mode: 'dark' }, 'dark');
  ok(dark.vars['--ds-brand-background-default'] === scale['400'], `dark brand bg deveria ser brand.400, veio ${dark.vars['--ds-brand-background-default']}`);
  ok(dark.vars['--ds-link-content-hover'] === scale['300'], `dark link hover deveria ser brand.300, veio ${dark.vars['--ds-link-content-hover']}`);
  ok(dark.vars['--ds-border-focus'] === scale['500'], `dark border-focus deveria ser brand.500, veio ${dark.vars['--ds-border-focus']}`);
  ok(dark.vars['--ds-content-brand'] === scale['400'], `dark content-brand deveria ser brand.400, veio ${dark.vars['--ds-content-brand']}`);

  for (const name of CANONICAL_BRAND_CSS_VARS) {
    ok(name in vars || name in dark.vars, `mapper deve cobrir var canônica ${name}`);
  }

  // Snippet CSS deve conter blocos light e dark com overrides semânticos
  const css = toCssSnippet(cfg, 'custom');
  ok(css.includes('[data-theme="custom"]'), 'snippet deve conter seletor data-theme');
  ok(css.includes('--ds-brand-background-default'), 'snippet deve conter brand-background-default');
  ok(css.includes('--ds-link-content-default'), 'snippet deve conter link-content-default');
  ok(css.includes('--ds-border-focus'), 'snippet deve conter border-focus');
  ok(css.includes('[data-theme="custom"][data-mode="dark"]'), 'snippet deve conter bloco dark mode');
}

// ── 8. DTCG theme patch ─────────────────────────────────────────────
{
  const cfg = { brand: { seed: '#EA580C' }, radius: 'default', typography: { sans: 'Inter', mono: 'DM Mono' }, mode: 'light' };
  const patch = toDtcgBrandPatch(cfg);
  ok(patch.foundation?.color?.brand?.['600']?.$type === 'color', 'DTCG patch deve ter brand.600 como color');
  ok(patch.foundation?.color?.brand?.['600']?.$value?.startsWith('#'), 'DTCG patch brand.600 deve ser hex');
  ok(Object.keys(patch.foundation.color.brand).length === STEPS.length, 'DTCG patch deve cobrir todos os steps da escala');

  const full = toDtcgThemePatch(cfg);
  ok(full.foundation?.color?.overlay?.['brand-600']?.['12']?.$value?.startsWith('rgba'), 'DTCG theme patch deve incluir overlay brand-600-12');
  ok(full.semantic?.light?.content?.brand?.$value === '{foundation.color.brand.700}', 'DTCG theme patch deve aliasar content.brand light → 700');
  ok(full.semantic?.dark?.content?.brand?.$value === '{foundation.color.brand.400}', 'DTCG theme patch deve aliasar content.brand dark → 400');
}

// ── 9. Auditoria de contraste brand (light + dark) ───────────────────
{
  const audit = auditBrandTheme(DEFAULT_CONFIG);
  ok(audit.rows.length === 12, `auditBrandTheme deve retornar 12 linhas (6×2 modos), veio ${audit.rows.length}`);
  ok(audit.allPass, `paleta default TIS deveria passar auditoria brand (${audit.failCount} falha(s))`);
}

// ── 10. applyTheme remove overrides stale (ex.: soft → default) ───────
{
  const props = new Map();
  const root = {
    style: {
      setProperty(name, value) { props.set(name, value); },
      removeProperty(name) { props.delete(name); },
    },
    setAttribute() {},
    removeAttribute() {},
  };
  const base = {
    brand: { seed: DEFAULT_CONFIG.brand.seed },
    typography: { ...DEFAULT_CONFIG.typography },
    mode: 'light',
  };

  applyTheme({ ...base, radius: 'soft' }, { root });
  ok(props.has('--ds-button-radius-default'), 'soft deve setar --ds-button-radius-default');
  ok(props.has('--ds-radius-md'), 'soft deve setar --ds-radius-md');

  applyTheme({ ...base, radius: 'default' }, { root });
  ok(!props.has('--ds-button-radius-default'), 'default deve remover pill stale do soft');
  ok(!props.has('--ds-radius-md'), 'default deve remover semantic radius stale do soft');
  ok(props.get('--ds-radius-8') === '0.5rem', `default deve atualizar foundation step 8, veio ${props.get('--ds-radius-8')}`);

  applyTheme({ ...base, radius: 'sharp' }, { root });
  ok(props.get('--ds-radius-8') === '0rem', `sharp deve atualizar foundation step 8, veio ${props.get('--ds-radius-8')}`);
}

// ── Resultado ───────────────────────────────────────────────────────
console.log(`\n═══ test-theme-engine ════════════════════════`);
console.log(`Checks: ${checks}`);
if (errors.length) {
  console.log(`\n❌ FAIL — ${errors.length} erro(s):`);
  for (const e of errors) console.log(`   · ${e}`);
  process.exit(1);
}
console.log(`\n✅ PASS — motor de theming consistente`);
