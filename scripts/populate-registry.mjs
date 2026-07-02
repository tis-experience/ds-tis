#!/usr/bin/env node
/**
 * populate-registry.mjs — popula campos sentido/contexto/decisao em
 * tokens/registry.json com drafts gerados a partir de path + tipo + uso.
 *
 * Foundation: drafts auto-gerados são canônicos (são valores numéricos com
 * naming neutro, não há decisão semântica subjetiva pra preencher).
 *
 * Semantic: drafts inferidos do nome do token + alias resolvido. Ainda
 * requerem revisão do owner pra capturar a intenção real.
 *
 * Uso:
 *   node scripts/populate-registry.mjs              # Foundation only (default)
 *   node scripts/populate-registry.mjs --semantic   # também preenche Semantic
 *   node scripts/populate-registry.mjs --force      # sobrescreve campos não-TODO
 *
 * Depois roda automaticamente `npm run build:registry` pra atualizar o md.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const REG_PATH = path.join(ROOT, 'tokens/registry.json');

const args = process.argv.slice(2);
const includeSemantic = args.includes('--semantic');
const force = args.includes('--force');

const reg = JSON.parse(fs.readFileSync(REG_PATH, 'utf8'));

// ─── Foundation populators ───────────────────────────────────────────────────

function populateFoundation(key, e) {
  const path = key.replace(/^foundation\./, '');
  const parts = path.split('.');

  // color.{family}.{step}
  if (parts[0] === 'color') {
    const [, family, step] = parts;
    if (family === 'overlay') {
      const [, , subfamily, alpha] = parts;
      return {
        sentido: `Sobreposição translúcida em ${subfamily} a ${alpha}% de opacidade.`,
        contexto: `Use em fundos de modal, scrim de drawer, hover/active de superfícies translúcidas, e overlays de loading. Não consuma direto em componente — passe por Semantic ou utility class.`,
        decisao: `Alpha tonal escolhido pra preservar legibilidade do conteúdo abaixo (5–10% = subtle hint; 20–40% = clear scrim; 60–80% = focus modal).`,
        escopo: ['fill', 'background'],
      };
    }
    if (family === 'disabled') {
      const [, , family2, mode] = parts;
      return {
        sentido: `Cor de fill disabled pra ações ${family2} em ${mode} mode. Translúcida sobre superfície base.`,
        contexto: `Aplicado via Semantic ${family2}.background.disabled. Não use direto em componente.`,
        decisao: `Alpha de 40–50% sobre tom base preserva forma do botão sem competir visualmente — sinaliza não-interativo sem sumir.`,
        escopo: ['fill'],
      };
    }
    return {
      sentido: `Tom ${step} da paleta ${family}. ${stepDescription(step)}`,
      contexto: `Foundation: nunca consumir direto em componente (ADR-013). Use via Semantic alias apropriado (\`primary.*\`, \`feedback.${family === 'green' ? 'success' : family === 'red' ? 'error' : family === 'amber' ? 'warning' : 'info'}.*\`, \`content.*\`, \`background.*\`).`,
      decisao: `Step da escala 50–950 padronizada. Calibrado pra contraste WCAG: 50–200 = backgrounds claros; 300–500 = states de UI; 600–800 = foregrounds e fills sólidos; 900–950 = dark surfaces.`,
      escopo: ['fill', 'stroke', 'text'],
    };
  }

  // dimension.{N}
  if (parts[0] === 'dimension') {
    const [, n] = parts;
    return {
      sentido: `Dimensão fixa de ${n}px (${parseInt(n) / 16}rem).`,
      contexto: `Use via Semantic \`space.*\` (gap/padding) ou \`size.*\` (width/height). Componentes não consomem direto.`,
      decisao: `Step da escala 2/4/6/8/10/12/14/16/20/24/28/32/36/40/44/48 — múltiplos de 2 e 4 cobrem todas as densidades de UI.`,
      escopo: ['gap', 'padding', 'size'],
    };
  }

  // radius.{key}
  if (parts[0] === 'radius') {
    const [, key2] = parts;
    if (key2 === '999') {
      return {
        sentido: `Raio máximo (999px) pra pill/circle.`,
        contexto: `Aplicado via Semantic \`radius.full\` em avatars, badges pill, toggles redondos.`,
        decisao: `999 (vs 9999) acompanha valor Figma. Funciona como ∞ em qualquer elemento até ~2000px.`,
        escopo: ['border-radius'],
      };
    }
    return {
      sentido: `Raio de borda de ${key2}px.`,
      contexto: `Use via Semantic \`radius.{sm|md|lg|xl|full}\` em componentes.`,
      decisao: `Step da escala 2/4/8/12/16/24/999. Cobre chips (2–4), inputs/buttons (4–8), cards (8–12), modals (16–24), pills (999).`,
      escopo: ['border-radius'],
    };
  }

  // typography.font.size.{N}
  if (parts[0] === 'typography' && parts[1] === 'font' && parts[2] === 'size') {
    const [, , , n] = parts;
    return {
      sentido: `Font-size ${n}px (${(parseInt(n) / 16).toFixed(4).replace(/\.?0+$/, '')}rem).`,
      contexto: `Use via Semantic \`body.font-size.{xs|sm|md|lg|xl|...}\` ou via Text Style apropriado. ${parseInt(n) < 12 ? '⚠️ Abaixo de 12px viola WCAG 1.4.4 — usar só pra meta-info.' : ''}`,
      decisao: `Step da escala tipográfica major-second-ish (12/14/16/18/20/24/30/36/48/60/72). 14 e 16 são os tamanhos primários de body em UI.`,
      escopo: ['font-size'],
    };
  }

  // typography.font.line-height.{N}
  if (parts[0] === 'typography' && parts[1] === 'font' && parts[2] === 'line-height') {
    const [, , , n] = parts;
    return {
      sentido: `Line-height de ${n}px absoluto (PX).`,
      contexto: `Pareado com font-size na razão ~1.4–1.6. Use via Semantic \`body.line-height.*\`.`,
      decisao: `ADR-012: Figma armazena line-height em PX (Plugin API limit); JSON expõe paralelo em rem (\`foundation.typography.line.height.*\`). Esse path é a versão Figma-compatível.`,
      escopo: ['line-height'],
    };
  }

  // typography.line.height.{N|key}  (rem version)
  if (parts[0] === 'typography' && parts[1] === 'line' && parts[2] === 'height') {
    const [, , , val] = parts;
    return {
      sentido: `Line-height ${val} (representação rem/ratio pro CSS).`,
      contexto: `Versão CSS-friendly do line-height (ADR-012). Pareada com font-size.`,
      decisao: `JSON-only: rem absoluto (1.5rem = 24px) pra cumprir WCAG 1.4.4 (Resize Text). Figma armazena em PX no path paralelo \`font.line-height.*\`.`,
      escopo: ['line-height'],
    };
  }

  // typography.font.weight.{key}
  if (parts[0] === 'typography' && parts[1] === 'font' && parts[2] === 'weight') {
    const [, , , key2] = parts;
    const map = { regular: '400', medium: '500', semibold: '600', bold: '700' };
    return {
      sentido: `Font-weight ${key2} (numeric ${map[key2] || '?'} em CSS).`,
      contexto: `Use via Semantic \`body.font-weight.{regular|medium|semibold|bold}\`. Figma usa nome (Regular/Medium/Semi Bold/Bold), CSS usa número.`,
      decisao: `Inter suporta esses 4 pesos com bom rendering. Bold em labels pra controles, semibold em headings, medium em emphasis inline, regular em body.`,
      escopo: ['font-weight'],
    };
  }

  // typography.font.family.*
  if (parts[0] === 'typography' && parts[1] === 'font' && parts[2] === 'family') {
    const [, , , key2] = parts;
    return {
      sentido: `Font family ${key2}.`,
      contexto: `Use via Semantic \`body.font-family.{sans|mono|display}\`. Figma armazena só o nome primário; CSS expõe stack de fallback.`,
      decisao: `${key2 === 'mono' ? 'DM Mono — escolha que parea com Inter, fallback pra JetBrains Mono / Fira Code / Consolas.' : 'Inter — sans-serif neutro com excelente legibilidade em UI.'}`,
      escopo: ['font-family'],
    };
  }

  // typography.font.letter-spacing.* / typography.letter.spacing.*
  if (parts.includes('letter-spacing') || parts.includes('letter')) {
    const key2 = parts[parts.length - 1];
    return {
      sentido: `Letter-spacing ${key2}.`,
      contexto: `Aplicado via Text Style. Tight em display sizes, normal em body, wide/wider em overline/uppercase.`,
      decisao: `Escala tight (-0.02em) → normal (0) → wide (0.02em) → wider (0.05em) cobre todas as densidades.`,
      escopo: ['letter-spacing'],
    };
  }

  // opacity.{key}
  if (parts[0] === 'opacity') {
    const [, key2] = parts;
    return {
      sentido: `Opacidade ${key2}${/^\d+$/.test(key2) ? '%' : ''}.`,
      contexto: `Use via Semantic \`opacity.disabled\` ou aplique direto em CSS para overlays.`,
      decisao: `Escala discreta 5/10/25/50/75/100 cobre subtle hints (5–10), translucent overlays (25), disabled (50), focus (75), full (100).`,
      escopo: ['opacity'],
    };
  }

  // border.width.{N}
  if (parts[0] === 'border' && parts[1] === 'width') {
    const [, , n] = parts;
    return {
      sentido: `Espessura de borda ${n}px.`,
      contexto: `Use via Semantic \`border.width.{default|strong|focus}\`.`,
      decisao: `1px = subtle/default; 2px = strong/focus rings; 4px = decorative dividers.`,
      escopo: ['border-width'],
    };
  }

  // shadow.{key} (objects)
  if (parts[0] === 'shadow') {
    const [, key2] = parts;
    if (key2 === 'none') {
      return {
        sentido: `Sem sombra (level 0 de elevação).`,
        contexto: `Use via Semantic \`surface.flat\` ou em estados disabled.`,
        decisao: `Token explícito pra reset — facilita override em variants.`,
        escopo: ['box-shadow'],
      };
    }
    return {
      sentido: `Sombra de elevação ${key2}.`,
      contexto: `Use via Semantic \`surface.{raised|overlay|elevated}\` ou em modais/dropdowns. Não aplique direto em texto.`,
      decisao: `Escala xs (cards), sm (popovers), md (dropdowns), lg (drawers), xl (modals), 2xl (max elevation).`,
      escopo: ['box-shadow'],
    };
  }

  // motion.duration.{key} / motion.ease.{key}
  if (parts[0] === 'duration' || (parts[0] === 'motion' && parts[1] === 'duration')) {
    const key2 = parts[parts.length - 1];
    const presets = { fast: '150ms (microinteractions)', normal: '250ms (state changes)', slow: '400ms (modals)' };
    return {
      sentido: `Duração de transição ${key2}.`,
      contexto: `Use via Semantic \`motion.duration.*\` em transition/animation CSS.`,
      decisao: presets[key2] || `Step calibrado pra perceptibilidade — ver Material Motion.`,
      escopo: ['transition-duration', 'animation-duration'],
    };
  }

  if (parts[0] === 'ease' || (parts[0] === 'motion' && parts[1] === 'ease')) {
    const key2 = parts[parts.length - 1];
    return {
      sentido: `Curva cubic-bezier ${key2}.`,
      contexto: `Pareada com duration via Semantic \`motion.ease.*\`.`,
      decisao: `${key2 === 'in' ? 'Acelera no início — para elementos saindo' : key2 === 'out' ? 'Desacelera no fim — para elementos entrando' : 'Acelera e desacelera — para elementos persistentes'}.`,
      escopo: ['transition-timing-function', 'animation-timing-function'],
    };
  }

  // z.{N}
  if (parts[0] === 'z') {
    const [, n] = parts;
    const map = { '0': 'base/in-flow', '10': 'dropdown/popover', '20': 'sticky header/overlay', '30': 'drawer', '40': 'modal', '50': 'toast/snackbar' };
    return {
      sentido: `Z-index camada ${n} (${map[n] || 'custom'}).`,
      contexto: `Use via Semantic \`z.{base|dropdown|...}\`. Componentes top-level (modal, toast, drawer) consomem direto.`,
      decisao: `Escala 0–50 em steps de 10 reserva slots intermediários (5, 15) pra ajustes finos sem refator. Topbar do site usa calc(var(--ds-z-50) + 10) = 60.`,
      escopo: ['z-index'],
    };
  }

  return null; // unknown pattern
}

// ─── Semantic populators ─────────────────────────────────────────────────────

function populateSemantic(key, e) {
  const path = key.replace(/^semantic\./, '');
  const parts = path.split('.');

  // background.{key}
  if (parts[0] === 'background') {
    const [, key2] = parts;
    const desc = {
      default: 'Background base do app — superfície neutra mais comum.',
      subtle: 'Background levemente diferenciado — chips, código inline, áreas secundárias.',
      inverse: 'Background invertido — usado em tooltips, snackbars, dark badges em light mode.',
      overlay: 'Scrim de modal/drawer — escurece o fundo pra focar o overlay.',
      disabled: 'Background pra estados disabled — neutral subtle.',
    };
    return {
      sentido: desc[key2] || `Background ${key2}.`,
      contexto: `Use em containers, frames, cards. Não consuma Foundation \`color.*\` direto.`,
      decisao: e.references ? `Aliasado a ${e.references} (light) — Semantic encapsula a decisão de qual tom da paleta usar.` : 'Semantic-level — consumido por componentes finais.',
      escopo: ['background-color'],
    };
  }

  // surface.{key}
  if (parts[0] === 'surface') {
    const [, key2] = parts;
    return {
      sentido: `Surface ${key2} — superfície ${key2 === 'raised' ? 'elevada (cards)' : key2 === 'overlay' ? 'sobre overlay (popover)' : key2 === 'elevated' ? 'altamente elevada (modal)' : 'base'}.`,
      contexto: `Use em painéis, cards, modais. Pareado com shadow.`,
      decisao: e.references ? `Alias resolvido em ${e.references}.` : 'Semantic-level.',
      escopo: ['background-color'],
    };
  }

  // content.{key}
  if (parts[0] === 'content') {
    const [, key2] = parts;
    const desc = {
      default: 'Texto primário — body, headings, labels principais.',
      secondary: 'Texto secundário — descrições, helper text, meta-info.',
      tertiary: 'Texto terciário — caption, footnote, timestamps.',
      disabled: 'Texto disabled — controles e items inativos.',
      inverse: 'Texto invertido — sobre background.inverse (tooltips, badges escuros em light).',
    };
    return {
      sentido: desc[key2] || `Content ${key2}.`,
      contexto: `Aplicado em \`color\` de texto. Pareado com background apropriado pra atender contraste WCAG AA (4.5:1 normal, 3:1 large).`,
      decisao: e.references ? `Aliasado a ${e.references}.` : 'Semantic-level.',
      escopo: ['color', 'fill'],
    };
  }

  // border.{key}
  if (parts[0] === 'border') {
    const [, key2] = parts;
    if (key2 === 'width') {
      const [, , w] = parts;
      return {
        sentido: `Border-width ${w}.`,
        contexto: `Use em bordas de inputs, cards, dividers, focus rings.`,
        decisao: e.references ? `Alias direto a Foundation ${e.references}.` : 'Semantic-level.',
        escopo: ['border-width'],
      };
    }
    const desc = {
      default: 'Borda neutra default — cards, dividers.',
      strong: 'Borda neutra forte — emphasis em separadores.',
      subtle: 'Borda neutra sutil — chips, code blocks.',
      brand: 'Borda brand — emphasis branded.',
      focus: 'Focus ring color (WCAG 2.4.7).',
      'focus-error': 'Focus ring em estado error (apenas em focus, não default).',
      error: 'Borda de erro — input invalid.',
      inverse: 'Borda invertida — sobre dark surfaces em light mode.',
    };
    return {
      sentido: desc[key2] || `Border ${key2}.`,
      contexto: `Use em \`border-color\` ou \`outline-color\`. Pareado com border-width apropriado.`,
      decisao: e.references ? `Aliasado a ${e.references}.` : 'Semantic-level.',
      escopo: ['border-color', 'outline-color'],
    };
  }

  // primary/toned/outline/ghost/link.{prop}.{state}
  const actionStyles = ['primary', 'toned', 'outline', 'ghost', 'link'];
  if (actionStyles.includes(parts[0])) {
    const [style, prop, state] = parts;
    const styleDesc = {
      primary: 'ação primária (brand solid)',
      toned: 'ação brand translúcida',
      outline: 'ação com borda neutra',
      ghost: 'ação apenas texto (neutral)',
      link: 'link inline (branded text)',
    };
    const propParts = prop.split('-');
    const isCompound = propParts.length > 1;
    const propName = propParts[0];
    const stateName = state || (isCompound ? propParts[1] : 'default');
    return {
      sentido: `${propName === 'background' ? 'Fill' : propName === 'content' ? 'Cor de texto/ícone' : propName === 'border' ? 'Borda' : propName} de ${styleDesc[style]} em estado ${stateName}.`,
      contexto: `Aplicado em \`.ds-button--${style}\` ou em consumidores Figma equivalentes.`,
      decisao: e.references ? `Aliasado a ${e.references} — escolha de tom feita no Figma (ADR-014: action × style × prop × state).` : 'Semantic-level.',
      escopo: propName === 'background' ? ['background-color'] : propName === 'border' ? ['border-color'] : ['color', 'fill'],
    };
  }

  // feedback.{kind}.{prop}.{state}
  if (parts[0] === 'feedback') {
    const [, kind, prop, state] = parts;
    const kindDesc = { success: 'sucesso (verde)', warning: 'aviso (âmbar)', error: 'erro (vermelho)', info: 'informação (azul)' };
    const propParts = prop ? prop.split('-') : [];
    const propName = propParts[0] || prop;
    const stateName = state || propParts[1] || 'default';
    return {
      sentido: `${propName === 'background' ? 'Fill' : propName === 'content' ? 'Cor' : 'Borda'} de feedback ${kindDesc[kind] || kind} em estado ${stateName}.`,
      contexto: `Use em alerts, badges, mensagens de validação, ícones de status. Pareado com Foundation ${kind === 'success' ? 'green' : kind === 'warning' ? 'amber' : kind === 'error' ? 'red' : 'sky'}.* via alias.`,
      decisao: e.references ? `Aliasado a ${e.references}.` : 'Semantic-level.',
      escopo: propName === 'background' ? ['background-color'] : propName === 'border' ? ['border-color'] : ['color', 'fill'],
    };
  }

  // typography.body.* / typography.heading.* / etc
  if (parts[0] === 'typography') {
    const [, scope, prop, ...rest] = parts;
    const last = rest[rest.length - 1] || prop;
    return {
      sentido: `${prop} ${last} pra ${scope === 'body' ? 'texto UI geral' : scope === 'heading' ? 'headings' : scope === 'display' ? 'display headings' : scope}.`,
      contexto: `Aplicado via Text Style ou utility class \`.ds-text-${scope}-${last}\`.`,
      decisao: e.references ? `Aliasado a Foundation ${e.references}.` : 'Semantic alias pra Foundation.',
      escopo: [prop === 'font-size' ? 'font-size' : prop === 'line-height' ? 'line-height' : prop === 'font-weight' ? 'font-weight' : prop === 'letter-spacing' ? 'letter-spacing' : 'font-family'],
    };
  }

  // space.{key}
  if (parts[0] === 'space') {
    const key2 = parts.slice(1).join('.');
    return {
      sentido: `Spacing token ${key2}.`,
      contexto: `Use em \`gap\`, \`padding\`, \`margin\` em componentes.`,
      decisao: e.references ? `Aliasado a Foundation ${e.references}.` : 'Semantic-level.',
      escopo: ['gap', 'padding', 'margin'],
    };
  }

  // size.{key}
  if (parts[0] === 'size') {
    const key2 = parts.slice(1).join('.');
    return {
      sentido: `Size token ${key2}.`,
      contexto: `Use em \`width\`, \`height\` ou pra ícones, controles, layouts.`,
      decisao: e.references ? `Aliasado a Foundation ${e.references}.` : 'Semantic-level.',
      escopo: ['width', 'height'],
    };
  }

  // overlay.{key}
  if (parts[0] === 'overlay') {
    const [, key2] = parts;
    return {
      sentido: `Overlay ${key2} — translúcido sobre conteúdo.`,
      contexto: `Use em scrims de modal, dropdowns, drawers.`,
      decisao: e.references ? `Aliasado a Foundation ${e.references}.` : 'Semantic-level.',
      escopo: ['background-color'],
    };
  }

  // radius.{key}
  if (parts[0] === 'radius') {
    const [, key2] = parts;
    return {
      sentido: `Radius semantic ${key2}.`,
      contexto: `Use em \`border-radius\` em componentes.`,
      decisao: e.references ? `Aliasado a Foundation ${e.references}.` : 'Semantic-level.',
      escopo: ['border-radius'],
    };
  }

  // shadow.{key} (semantic wrappers)
  if (parts[0] === 'shadow') {
    const [, key2] = parts;
    return {
      sentido: `Sombra semantic ${key2}.`,
      contexto: `Use em componentes ${key2 === 'card' ? 'card-like (cards, popovers)' : key2 === 'modal' ? 'sobre overlays (modais, drawers)' : key2}.`,
      decisao: e.references ? `Aliasado a Foundation ${e.references}.` : `Semantic-level — encapsula a decisão de qual nível de elevação usar.`,
      escopo: ['box-shadow'],
    };
  }

  // motion/opacity wrappers
  if (parts[0] === 'motion' || parts[0] === 'opacity') {
    return {
      sentido: `Semantic wrapper pra ${parts[0]}.`,
      contexto: `Use em \`transition\`/\`animation\` (motion) ou \`opacity\` (states disabled).`,
      decisao: e.references ? `Aliasado a Foundation ${e.references}.` : 'Semantic-level.',
      escopo: parts[0] === 'motion' ? ['transition', 'animation'] : ['opacity'],
    };
  }

  return null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function stepDescription(step) {
  const n = parseInt(step);
  if (n <= 100) return 'Tom muito claro — backgrounds, hover states sutis em light mode.';
  if (n <= 200) return 'Tom claro — backgrounds secundários, borders subtle.';
  if (n <= 300) return 'Tom médio-claro — borders default, foregrounds em dark mode.';
  if (n <= 500) return 'Tom médio — fills médios, focus rings.';
  if (n <= 600) return 'Tom forte — fills primários, brand fills.';
  if (n <= 700) return 'Tom escuro — text on light, hover de fills brand.';
  if (n <= 800) return 'Tom muito escuro — emphasis text, active states.';
  return 'Tom extremo — surfaces escuras, body text em light mode.';
}

// ─── Run ────────────────────────────────────────────────────────────────────

let updated = 0;
let skipped = 0;

for (const [key, entry] of Object.entries(reg.entries)) {
  const isFoundation = key.startsWith('foundation.');
  const isSemantic = key.startsWith('semantic.');

  if (isSemantic && !includeSemantic) {
    skipped++;
    continue;
  }

  const draft = isFoundation ? populateFoundation(key, entry) : isSemantic ? populateSemantic(key, entry) : null;
  if (!draft) {
    skipped++;
    continue;
  }

  const fields = ['sentido', 'contexto', 'decisao', 'escopo'];
  let changed = false;
  for (const f of fields) {
    if (draft[f] === undefined) continue;
    const cur = entry[f];
    const isEmpty = cur === 'TODO' || cur == null || (Array.isArray(cur) && cur.length === 0);
    if (force || isEmpty) {
      entry[f] = draft[f];
      changed = true;
    }
  }
  if (changed) updated++;
}

fs.writeFileSync(REG_PATH, JSON.stringify(reg, null, 2) + '\n');

console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
console.log(`Total entries: ${Object.keys(reg.entries).length}`);
