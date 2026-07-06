/* ============================================================
   apply.js — aplica o tema em runtime no DOM (browser only)

   Escreve as CSS vars geradas no elemento raiz via inline style,
   com precedência sobre os arquivos gerados. Reversível via reset.
   ============================================================ */

import { normalizeConfig } from './config-schema.js';
import { mapThemeToVars } from './semantic-mapper.js';

/** Vars inline setadas na última `applyTheme` por elemento raiz. */
const appliedByRoot = new WeakMap();

function getAppliedSet(el) {
  if (!appliedByRoot.has(el)) appliedByRoot.set(el, new Set());
  return appliedByRoot.get(el);
}

/** Lista de props que este engine controla — usada para reset limpo. */
export function controlledVarNames(config) {
  const cfg = normalizeConfig(config);
  return Object.keys(mapThemeToVars(cfg, cfg.mode).vars);
}

/**
 * Aplica o config no `root` (default: <html>). Também sincroniza o
 * atributo data-mode. Retorna o relatório de contraste.
 *
 * @param {object} config - ThemeConfig (parcial ou completo).
 * @param {object} [opts]
 * @param {HTMLElement} [opts.root] - alvo (default: documentElement).
 * @returns {{ contrast: object, vars: Record<string,string> }}
 */
export function applyTheme(config, { root } = {}) {
  const el = root || (typeof document !== 'undefined' ? document.documentElement : null);
  if (!el) throw new Error('applyTheme requer um DOM (browser) ou opts.root');

  const cfg = normalizeConfig(config);
  const { vars, contrast } = mapThemeToVars(cfg, cfg.mode);

  const prev = getAppliedSet(el);
  const next = new Set(Object.keys(vars));

  for (const name of prev) {
    if (!next.has(name)) el.style.removeProperty(name);
  }

  for (const [name, value] of Object.entries(vars)) {
    el.style.setProperty(name, value);
  }

  appliedByRoot.set(el, next);

  if (cfg.mode === 'dark') el.setAttribute('data-mode', 'dark');
  else el.removeAttribute('data-mode');

  return { contrast, vars };
}

/** Remove todas as props controladas, voltando aos tokens gerados. */
export function resetTheme(config, { root } = {}) {
  const el = root || (typeof document !== 'undefined' ? document.documentElement : null);
  if (!el) return;

  const prev = appliedByRoot.get(el);
  if (prev) {
    for (const name of prev) el.style.removeProperty(name);
    appliedByRoot.delete(el);
    return;
  }

  for (const name of controlledVarNames(config)) {
    el.style.removeProperty(name);
  }
}
