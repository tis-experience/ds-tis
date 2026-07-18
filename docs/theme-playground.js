/* Theme Playground — aplica o theme engine em tempo real */

import {
  DEFAULT_CONFIG,
  normalizeConfig,
  applyTheme,
  resetTheme,
  generateBrandScale,
  toCssSnippet,
  toJsonConfig,
  toDtcgThemePatch,
  encodeConfig,
  decodeConfig,
  auditBrandTheme,
  CONTRAST_LABELS,
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
  contrastBanner: $('#contrast-banner'),
  swatches: $('#palette-swatches'),
};

let currentConfig = { ...DEFAULT_CONFIG };
let fontLinkEl = null;
let urlSyncTimer = null;
let modeObserver = null;

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
  syncModeToggleUI(cfg.mode);
  document.querySelectorAll('.ds-combobox-anchor').forEach((anchor) => {
    const input = anchor.querySelector('.ds-combobox__input');
    if (!input) return;
    if (input.id === 'font-sans') input.value = cfg.typography.sans;
    if (input.id === 'font-mono') input.value = cfg.typography.mono;
    syncComboboxState(anchor, input.value.trim());
  });
}

/** Sincroniza toggles do painel e header — sem gravar localStorage. */
function syncModeToggleUI(mode) {
  const isDark = mode === 'dark';
  els.modeToggle.setAttribute('aria-pressed', String(isDark));
  const headerMode = document.getElementById('mode-toggle');
  if (headerMode) headerMode.setAttribute('aria-pressed', String(isDark));
}

function persistModePreference(mode) {
  if (mode === 'dark') localStorage.setItem('ds-mode', 'dark');
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
  els.swatches.removeAttribute('aria-hidden');
  els.swatches.setAttribute('role', 'list');
  els.swatches.setAttribute('aria-label', 'Brand palette swatches');
  for (const step of STEPS) {
    const sw = document.createElement('div');
    sw.className = 'ds-playground__swatch';
    sw.style.backgroundColor = scale[step];
    sw.setAttribute('role', 'listitem');
    sw.setAttribute('aria-label', `brand ${step} ${scale[step]}`);
    sw.title = `brand.${step} — ${scale[step]}`;
    els.swatches.appendChild(sw);
  }
}

function contrastLabel(key, mode) {
  const labels = CONTRAST_LABELS[key];
  const lang = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'pt';
  const modeLabel = mode === 'dark'
    ? (lang === 'en' ? 'Dark' : 'Dark')
    : (lang === 'en' ? 'Light' : 'Light');
  return `${modeLabel} · ${labels[lang]}`;
}

function renderContrast(cfg) {
  const { rows, allPass, failCount } = auditBrandTheme(cfg);

  if (els.contrastBanner) {
    els.contrastBanner.hidden = allPass;
    els.contrastBanner.classList.toggle('ds-playground__contrast-banner--fail', !allPass);
    const pt = els.contrastBanner.querySelector('[data-lang="pt"]');
    const en = els.contrastBanner.querySelector('[data-lang="en"]');
    if (pt) pt.textContent = `${failCount} par(es) abaixo do mínimo WCAG AA. Revise a cor da marca antes de publicar.`;
    if (en) en.textContent = `${failCount} pair(s) below WCAG AA minimum. Review brand color before shipping.`;
  }

  els.contrastList.innerHTML = '';
  for (const row of rows) {
    const passes = row.passes;
    const item = document.createElement('div');
    item.className = 'ds-playground__contrast-row';
    item.innerHTML = `
      <span>${contrastLabel(row.key, row.mode)}</span>
      <span>
        <code>${row.ratio.toFixed(2)}:1</code>
        <span class="ds-playground__badge ${passes ? 'ds-playground__badge--pass' : 'ds-playground__badge--fail'}">
          ${passes ? 'PASS' : 'FAIL'}
        </span>
      </span>`;
    els.contrastList.appendChild(item);
  }

  for (const btn of [els.copyCss, els.copyJson, els.copyDtcg]) {
    if (btn) btn.disabled = !allPass;
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
  if (dtcgEl) dtcgEl.value = JSON.stringify(toDtcgThemePatch(cfg), null, 2);
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
  syncModeToggleUI(currentConfig.mode);
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
  document.documentElement.removeAttribute('data-mode');
  applyCurrent();
}

async function copyText(text, btn) {
  if (btn?.disabled) return;
  await navigator.clipboard.writeText(text);
  const orig = btn.textContent;
  const lang = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'pt';
  btn.textContent = lang === 'en' ? 'Copied!' : 'Copiado!';
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
    const nextDark = this.getAttribute('aria-pressed') !== 'true';
    this.setAttribute('aria-pressed', String(nextDark));
    currentConfig = { ...currentConfig, mode: nextDark ? 'dark' : 'light' };
    persistModePreference(currentConfig.mode);
    applyCurrent();
  });

  document.addEventListener('ds:mode-change', (event) => {
    const mode = event.detail?.mode === 'dark' ? 'dark' : 'light';
    currentConfig = { ...currentConfig, mode };
    syncModeToggleUI(mode);
    applyCurrent();
  });

  els.resetBtn.addEventListener('click', resetAll);
  els.copyCss.addEventListener('click', () => copyText(document.getElementById('export-css')?.value ?? '', els.copyCss));
  els.copyJson.addEventListener('click', () => copyText(document.getElementById('export-json')?.value ?? '', els.copyJson));
  if (els.copyDtcg) {
    els.copyDtcg.addEventListener('click', () => copyText(document.getElementById('export-dtcg')?.value ?? '', els.copyDtcg));
  }
  els.copyUrl.addEventListener('click', () => copyText(document.getElementById('export-url')?.value ?? '', els.copyUrl));
}

/**
 * Mantém os overrides inline do theme engine alinhados ao contrato global
 * `data-mode`, inclusive quando outro runtime ou teste altera o atributo sem
 * emitir `ds:mode-change`.
 */
function observeGlobalMode() {
  if (typeof MutationObserver === 'undefined') return;

  modeObserver?.disconnect();
  modeObserver = new MutationObserver(() => {
    const mode = document.documentElement.getAttribute('data-mode') === 'dark' ? 'dark' : 'light';
    if (currentConfig.mode === mode) return;

    currentConfig = { ...currentConfig, mode };
    syncModeToggleUI(mode);
    applyCurrent();
  });
  modeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-mode'],
  });
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
  observeGlobalMode();
  initComboboxes(document.querySelector('.ds-playground__panel'), { onChange: () => applyCurrent() });
  applyCurrent();
}

document.addEventListener('DOMContentLoaded', initPlayground);
