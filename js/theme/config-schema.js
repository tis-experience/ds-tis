/* ============================================================
   config-schema.js — normalização e defaults do ThemeConfig

   ThemeConfig é a abstração de alto nível manipulada pela UI
   (equivalente ao preset do shadcn create / accentColor do Radix).
   ============================================================ */

/** Config padrão = paleta default do DS (blue), radius default, Inter/DM Mono. */
export const DEFAULT_CONFIG = {
  brand: { seed: '#2563EB', chromaBoost: 1 },
  radius: 'default',
  typography: { sans: 'Inter', mono: 'DM Mono' },
  mode: 'light',
};

const HEX_RE = /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;

/**
 * Normaliza um config parcial contra os defaults e valida campos.
 * Lança Error em entrada inválida (seed não-hex, mode inválido).
 */
export function normalizeConfig(input = {}) {
  const cfg = {
    brand: { ...DEFAULT_CONFIG.brand, ...(input.brand || {}) },
    radius: input.radius === 'pill' ? 'soft' : (input.radius ?? DEFAULT_CONFIG.radius),
    typography: { ...DEFAULT_CONFIG.typography, ...(input.typography || {}) },
    mode: input.mode ?? DEFAULT_CONFIG.mode,
  };

  if (!HEX_RE.test(String(cfg.brand.seed))) {
    throw new Error(`brand.seed inválido: ${cfg.brand.seed}`);
  }
  if (!cfg.brand.seed.startsWith('#')) cfg.brand.seed = '#' + cfg.brand.seed;
  cfg.brand.seed = cfg.brand.seed.toUpperCase();

  if (cfg.mode !== 'light' && cfg.mode !== 'dark') {
    throw new Error(`mode inválido: ${cfg.mode}`);
  }
  return cfg;
}
