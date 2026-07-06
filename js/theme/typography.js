/* ============================================================
   typography.js — monta font stacks preservando fallbacks do DS

   O customizer troca a fonte principal (sans/mono/display) mas mantém
   a cadeia de fallback do sistema, para não perder robustez quando a
   webfont escolhida não carregar.
   ============================================================ */

const SANS_FALLBACK =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const MONO_FALLBACK =
  "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace";

/** Envolve o nome da família em aspas se tiver espaço. */
function quoteFamily(name) {
  const n = String(name).trim();
  if (!n) return '';
  return /\s/.test(n) && !/^['"]/.test(n) ? `'${n}'` : n;
}

/**
 * @param {object} cfg
 * @param {string} [cfg.sans] - família principal (ex "Inter").
 * @param {string} [cfg.mono] - família mono (ex "DM Mono").
 * @param {string} [cfg.display] - família de display (default: = sans).
 * @returns {{sans:string, mono:string, display:string}} stacks CSS.
 */
export function buildFontStacks({ sans = 'Inter', mono = 'DM Mono', display } = {}) {
  const sansStack = `${quoteFamily(sans)}, ${SANS_FALLBACK}`;
  const monoStack = `${quoteFamily(mono)}, ${MONO_FALLBACK}`;
  const displayStack = `${quoteFamily(display || sans)}, ${SANS_FALLBACK}`;
  return { sans: sansStack, mono: monoStack, display: displayStack };
}
