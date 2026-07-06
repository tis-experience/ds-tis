/* ============================================================
   url-state.js — encode/decode do ThemeConfig na query string

   Permite compartilhar presets por link (como ?preset=... do shadcn).
   Usa base64url de um JSON compacto. Funciona em browser e Node
   (usa btoa/atob quando existem, Buffer como fallback).
   ============================================================ */

import { normalizeConfig } from './config-schema.js';

function b64encode(str) {
  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(str)));
  return Buffer.from(str, 'utf-8').toString('base64');
}
function b64decode(str) {
  if (typeof atob === 'function') return decodeURIComponent(escape(atob(str)));
  return Buffer.from(str, 'base64').toString('utf-8');
}
function toUrlSafe(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromUrlSafe(s) {
  let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return b64;
}

/** ThemeConfig → token base64url compacto. */
export function encodeConfig(config) {
  const cfg = normalizeConfig(config);
  const compact = {
    b: cfg.brand.seed,
    cb: cfg.brand.chromaBoost ?? 1,
    r: cfg.radius,
    fs: cfg.typography.sans,
    fm: cfg.typography.mono,
    m: cfg.mode,
  };
  return toUrlSafe(b64encode(JSON.stringify(compact)));
}

/** token base64url → ThemeConfig normalizado. Lança em token inválido. */
export function decodeConfig(token) {
  const json = b64decode(fromUrlSafe(token));
  const c = JSON.parse(json);
  return normalizeConfig({
    brand: { seed: c.b, chromaBoost: c.cb },
    radius: c.r,
    typography: { sans: c.fs, mono: c.fm },
    mode: c.m,
  });
}
