/* Theme Playground — aplica o theme engine em tempo real */

import {
  DEFAULT_CONFIG,
  normalizeConfig,
  applyTheme,
  resetTheme,
  generateBrandScale,
  mapThemeToVars,
  toCssSnippet,
  toJsonConfig,
  toDtcgBrandPatch,
  encodeConfig,
  decodeConfig,
  contrastRatio,
  WCAG_AA_UI,
  WCAG_AA_TEXT,
  STEPS,
} from '../js/theme/index.js';
import { initComboboxes, syncComboboxState } from '../js/combobox.js';

const $ = (sel) => document.querySelector(sel);

const els = {
  brandColor: $('#brand-color'),
  brandHex: $('#brand-hex'),
  radius: $('#radius-preset'),
  radiusHint: $('#radius-hint'),
  fontSans: $('#font-sans'),
  fontMono: $('#font-mono'),
  modeToggle: $('#playground-mode'),
  resetBtn: $('#reset-theme'),
  copyCss: $('#copy-css'),
  copyJson: $('#copy-json'),
  copyDtcg: $('#copy-dtcg'),
  copyUrl: $('#copy-url'),
  contrastList: $('#contrast-list'),
  swatches: $('#palette-swatches'),
};

let currentConfig = { ...DEFAULT_CONFIG };
let fontLinkEl = null;
let urlSyncTimer = null;

function debouncedSyncUrl(cfg) {
  clearTimeout(urlSyncTimer);
  urlSyncTimer = setTimeout(() => {
    history.replaceState(null, '', `?c=${encodeConfig(cfg)}`);
  }, 200);
}

function readConfigFromForm() {
  return normalizeConfig({
    brand: { seed: els.brandHex.value },
    radius: els.radius.value,
    typography: {
      sans: els.fontSans.value.trim() || 'Inter',
      mono: els.fontMono.value.trim() || 'DM Mono',
    },
    mode: els.modeToggle.getAttribute('aria-pressed') === 'true' ? 'dark' : 'light',
  });
}

function syncFormFromConfig(cfg) {
  els.brandColor.value = cfg.brand.seed;
  els.brandHex.value = cfg.brand.seed;
  els.radius.value = String(cfg.radius);
  els.fontSans.value = cfg.typography.sans;
  els.fontMono.value = cfg.typography.mono;
  els.modeToggle.setAttribute('aria-pressed', String(cfg.mode === 'dark'));
  document.querySelectorAll('.ds-combobox-anchor').forEach((anchor) => {
    const input = anchor.querySelector('.ds-combobox__input');
    if (!input) return;
    if (input.id === 'font-sans') input.value = cfg.typography.sans;
    if (input.id === 'font-mono') input.value = cfg.typography.mono;
    syncComboboxState(anchor, input.value.trim());
  });
}

/** Mantém toggles do playground/header e localStorage alinhados ao mode aplicado. */
function syncModeUI(mode) {
  const isDark = mode === 'dark';
  els.modeToggle.setAttribute('aria-pressed', String(isDark));
  const headerMode = document.getElementById('mode-toggle');
  if (headerMode) headerMode.setAttribute('aria-pressed', String(isDark));
  if (isDark) localStorage.setItem('ds-mode', 'dark');
  else localStorage.removeItem('ds-mode');
}

function loadGoogleFont(family) {
  if (!family || family === 'Inter') return;
  const id = 'ds-playground-font';
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;500;600;700&display=swap`;
  if (!fontLinkEl) {
    fontLinkEl = document.createElement('link');
    fontLinkEl.id = id;
    fontLinkEl.rel = 'stylesheet';
    document.head.appendChild(fontLinkEl);
  }
  fontLinkEl.href = href;
}

function renderSwatches(scale) {
  els.swatches.innerHTML = '';
  for (const step of STEPS) {
    const sw = document.createElement('div');
    sw.className = 'ds-playground__swatch';
    sw.style.backgroundColor = scale[step];
    sw.title = `brand.${step} — ${scale[step]}`;
    els.swatches.appendChild(sw);
  }
}

function renderContrast(cfg) {
  const mode = cfg.mode;
  const { vars, contrast } = mapThemeToVars(cfg, mode);
  const scale = generateBrandScale(cfg.brand.seed);
  const tonedBg = mode === 'dark'
    ? vars['--ds-overlay-brand-400-15']
    : vars['--ds-overlay-brand-600-12'];
  const tonedFg = mode === 'dark' ? scale[400] : scale[700];
  const linkFg = mode === 'dark' ? scale[400] : scale[700];
  const surface = mode === 'dark' ? '#0F172A' : '#FFFFFF';

  const pairs = [
    { name: 'Brand fill / foreground', fg: contrast.foreground, bg: contrast.brandFill, threshold: WCAG_AA_UI },
    { name: 'Toned fill / content', fg: tonedFg, bg: tonedBg, under: surface, threshold: WCAG_AA_UI },
    { name: 'Link / surface', fg: linkFg, bg: surface, threshold: WCAG_AA_TEXT },
  ];

  els.contrastList.innerHTML = '';
  for (const p of pairs) {
    const ratio = contrastRatio(p.fg, p.bg, p.under ? { under: p.under } : undefined);
    const passes = ratio >= p.threshold;
    const row = document.createElement('div');
    row.className = 'ds-playground__contrast-row';
    row.innerHTML = `
      <span>${p.name}</span>
      <span>
        <code>${ratio.toFixed(2)}:1</code>
        <span class="ds-playground__badge ${passes ? 'ds-playground__badge--pass' : 'ds-playground__badge--fail'}">
          ${passes ? 'PASS' : 'FAIL'}
        </span>
      </span>`;
    els.contrastList.appendChild(row);
  }
}

function renderExports(cfg) {
  const cssEl = document.getElementById('export-css');
  const jsonEl = document.getElementById('export-json');
  const dtcgEl = document.getElementById('export-dtcg');
  const urlEl = document.getElementById('export-url');
  if (!cssEl || !jsonEl || !urlEl) return;

  cssEl.value = toCssSnippet(cfg, 'custom');
  jsonEl.value = toJsonConfig(cfg);
  if (dtcgEl) dtcgEl.value = JSON.stringify(toDtcgBrandPatch(cfg), null, 2);
  const token = encodeConfig(cfg);
  urlEl.value = `${location.origin}${location.pathname}?c=${token}`;
}

function updateRadiusHint() {
  if (!els.radiusHint) return;
  const isSoft = els.radius.value === 'soft';
  els.radiusHint.hidden = !isSoft;
}

function applyCurrent({ syncUrl = true } = {}) {
  try {
    currentConfig = readConfigFromForm();
  } catch {
    syncFormFromConfig(currentConfig);
    return null;
  }

  updateRadiusHint();
  loadGoogleFont(currentConfig.typography.sans);
  const { contrast } = applyTheme(currentConfig);
  syncModeUI(currentConfig.mode);
  const scale = generateBrandScale(currentConfig.brand.seed);
  renderSwatches(scale);
  renderContrast(currentConfig);
  renderExports(currentConfig);
  if (syncUrl) {
    history.replaceState(null, '', `?c=${encodeConfig(currentConfig)}`);
  } else {
    debouncedSyncUrl(currentConfig);
  }
  return contrast;
}

function resetAll() {
  resetTheme(currentConfig);
  currentConfig = normalizeConfig({ ...DEFAULT_CONFIG });
  syncFormFromConfig(currentConfig);
  localStorage.removeItem('ds-mode');
  applyCurrent();
}

async function copyText(text, btn) {
  await navigator.clipboard.writeText(text);
  const orig = btn.textContent;
  btn.textContent = 'Copiado!';
  setTimeout(() => { btn.textContent = orig; }, 2000);
}

function initExportTabs() {
  const root = document.querySelector('.ds-playground__export-box');
  if (!root) return;

  const tabs = root.querySelectorAll('[data-export-tab]');
  const panels = root.querySelectorAll('[data-export-panel]');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.getAttribute('data-export-tab');
      tabs.forEach((t) => {
        t.classList.toggle('ds-playground__export-tab--active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      panels.forEach((p) => {
        const active = p.getAttribute('data-export-panel') === id;
        p.classList.toggle('ds-playground__export-panel--active', active);
        p.hidden = !active;
      });
    });
  });
}

function initFromUrl() {
  const params = new URLSearchParams(location.search);
  const token = params.get('c') || params.get('preset');
  if (token) {
    try {
      currentConfig = decodeConfig(token);
      syncFormFromConfig(currentConfig);
    } catch (_) { /* ignora token inválido */ }
  }
}

function bindEvents() {
  els.brandColor.addEventListener('input', () => {
    els.brandHex.value = els.brandColor.value.toUpperCase();
    applyCurrent({ syncUrl: false });
  });
  els.brandHex.addEventListener('change', () => {
    let v = els.brandHex.value.trim();
    if (!v.startsWith('#')) v = '#' + v;
    els.brandHex.value = v.toUpperCase();
    els.brandColor.value = v;
    applyCurrent();
  });
  els.radius.addEventListener('change', applyCurrent);

  els.modeToggle.addEventListener('click', function () {
    const isDark = this.getAttribute('aria-pressed') === 'true';
    this.setAttribute('aria-pressed', String(!isDark));
    applyCurrent();
  });

  // main.js atualiza data-mode primeiro (registra listener antes deste init)
  const headerMode = document.getElementById('mode-toggle');
  if (headerMode) {
    headerMode.addEventListener('click', () => {
      const mode = document.documentElement.getAttribute('data-mode') === 'dark' ? 'dark' : 'light';
      els.modeToggle.setAttribute('aria-pressed', String(mode === 'dark'));
      applyCurrent();
    });
  }

  els.resetBtn.addEventListener('click', resetAll);
  els.copyCss.addEventListener('click', () => copyText(document.getElementById('export-css')?.value ?? '', els.copyCss));
  els.copyJson.addEventListener('click', () => copyText(document.getElementById('export-json')?.value ?? '', els.copyJson));
  if (els.copyDtcg) {
    els.copyDtcg.addEventListener('click', () => copyText(document.getElementById('export-dtcg')?.value ?? '', els.copyDtcg));
  }
  els.copyUrl.addEventListener('click', () => copyText(document.getElementById('export-url')?.value ?? '', els.copyUrl));
}

function initPlayground() {
  initFromUrl();

  const params = new URLSearchParams(location.search);
  if (!params.get('c') && !params.get('preset')) {
    const domMode = document.documentElement.getAttribute('data-mode') === 'dark' ? 'dark' : 'light';
    currentConfig = { ...currentConfig, mode: domMode };
  }

  syncFormFromConfig(currentConfig);
  initExportTabs();
  bindEvents();
  initComboboxes(document.querySelector('.ds-playground__panel'), { onChange: () => applyCurrent() });
  applyCurrent();
}

document.addEventListener('DOMContentLoaded', initPlayground);
