#!/usr/bin/env node
/*
 * build-token-registry.mjs
 *
 * Token Registry (ADR-013): mantém um catálogo único de todos os tokens
 * do sistema com metadados estruturados — sentido, escopo, contexto,
 * locais de uso, decisão.
 *
 * Modos:
 *   --init          Cria tokens/registry.json a partir dos JSONs em
 *                   tokens/ se ainda não existir, com campos
 *                   sentido/contexto/decisao preenchidos com "TODO".
 *                   Se registry existir, apenas adiciona entradas novas
 *                   (nunca sobrescreve metadados existentes).
 *
 *   (default)       Lê registry, recalcula `usos` varrendo CSS, JSONs e
 *                   .figma-snapshot.json (se existir). Grava registry
 *                   atualizado. Gera docs/token-registry.md.
 *
 *   --check         Não escreve nada. Verifica completude: falha com
 *                   exit 1 se algum token em tokens/ não tem entry, ou
 *                   se algum campo obrigatório está com "TODO".
 *
 * Ver ADR-013 (docs/decisions/ADR-013-camadas-de-consumo-de-tokens.md).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TOKENS_DIR = path.join(ROOT, 'tokens');
const CSS_DIR = path.join(ROOT, 'css');
const REGISTRY_PATH = path.join(TOKENS_DIR, 'registry.json');
const MD_OUTPUT = path.join(ROOT, 'docs', 'token-registry.md');
const FIGMA_SNAPSHOT = path.join(ROOT, '.figma-snapshot.json');

const args = new Set(process.argv.slice(2));
const MODE = args.has('--init') ? 'init'
           : args.has('--check') ? 'check'
           : 'build';

// ─── Helpers ────────────────────────────────────────────────────────────────

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return null; }
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}

function walkDir(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkDir(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

/**
 * Flatten DTCG JSON em pares { path, $type, $value, $description }.
 * Só considera leaf tokens (tem $value).
 */
function flattenTokens(obj, prefix = '') {
  const result = [];
  if (!obj || typeof obj !== 'object') return result;
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const newPath = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object') {
      if ('$value' in val) {
        result.push({
          path: newPath,
          type: val.$type || null,
          value: val.$value,
          description: val.$description || null,
        });
      }
      result.push(...flattenTokens(val, newPath));
    }
  }
  return result;
}

/**
 * Camada do token: inferida a partir do prefixo do path.
 */
function inferLayer(tokenPath) {
  if (tokenPath.startsWith('foundation.')) return 'foundation';
  if (tokenPath.startsWith('semantic.')) return 'semantic';
  if (tokenPath.startsWith('component.')) return 'component';
  return 'unknown';
}

/**
 * Detecta se $value é alias DTCG (referência {x.y.z}).
 * Retorna o path da referência, ou null.
 */
function detectAlias(value) {
  if (typeof value !== 'string') return null;
  const m = value.match(/^\{([^}]+)\}$/);
  return m ? m[1] : null;
}

/**
 * Converte path de token ("foundation.color.blue.500") em nome da CSS var
 * gerada pelo Style Dictionary. A transform usa `name/kebab` após
 * `name/strip-layer` (remove o primeiro segmento). Ex:
 *   foundation.color.blue.500 → --ds-color-blue-500
 *   semantic.space.inset.md   → --ds-space-inset-md
 *   component.button.height.md → --ds-button-height-md
 *
 * Nota: alguns transforms adicionais podem aplicar (ex: segment
 * "typography" é strippado em alguns casos). Esta é uma aproximação
 * suficiente pra grep.
 */
function pathToCssVar(tokenPath) {
  const parts = tokenPath.split('.');
  // strip-layer remove o primeiro segmento (foundation/semantic/component)
  const rest = parts.slice(1);
  return '--ds-' + rest.join('-');
}

// ─── Leitura de tokens ───────────────────────────────────────────────────────

function loadAllTokens() {
  const allFiles = walkDir(TOKENS_DIR).filter(f => f.endsWith('.json') && !f.endsWith('registry.json'));
  const flat = [];
  const refsOut = new Map(); // tokenPath → list of tokenPaths que referenciam ele
  const byPath = new Map();

  for (const file of allFiles) {
    const json = readJson(file);
    if (!json) continue;
    const tokens = flattenTokens(json);
    for (const t of tokens) {
      flat.push({ ...t, file: path.relative(ROOT, file) });
      byPath.set(t.path, t);
    }
  }

  // build reverse alias map: who references whom?
  for (const t of flat) {
    const aliasTarget = detectAlias(t.value);
    if (aliasTarget) {
      if (!refsOut.has(aliasTarget)) refsOut.set(aliasTarget, []);
      refsOut.get(aliasTarget).push(t.path);
    }
  }

  return { flat, byPath, refsOut };
}

// ─── Calcular `usos` ─────────────────────────────────────────────────────────

function loadCssSources() {
  const files = walkDir(CSS_DIR).filter(f => f.endsWith('.css'));
  const sources = new Map();
  for (const f of files) {
    sources.set(path.relative(ROOT, f), fs.readFileSync(f, 'utf8'));
  }
  return sources;
}

function loadFigmaSnapshot() {
  if (!fs.existsSync(FIGMA_SNAPSHOT)) return null;
  return readJson(FIGMA_SNAPSHOT);
}

function computeUsos(tokenPath, ctx) {
  const { cssSources, tokenReverseRefs, figmaSnapshot } = ctx;
  const cssVar = pathToCssVar(tokenPath);
  const usos = {
    css: [],
    tokens: tokenReverseRefs.get(tokenPath) || [],
    figma: [],
  };

  // CSS: grep var(cssVar) em cada arquivo. Contabiliza arquivo com N ocorrências.
  for (const [rel, content] of cssSources) {
    // escape for regex
    const pattern = new RegExp(`var\\(\\s*${cssVar.replace(/-/g, '\\-')}\\b`, 'g');
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      usos.css.push({ file: rel, count: matches.length });
    }
  }

  // Figma: se snapshot tiver bindings linkados ao token, listar componentes
  // (TODO pós PR-C, quando o snapshot incluir bindings de componente)
  // Por enquanto só marca se o token aparece em alguma variable alias do snapshot
  if (figmaSnapshot && Array.isArray(figmaSnapshot.componentUsage)) {
    // futuro: cross-ref aqui quando o snapshot ganhar essa estrutura
  }

  return usos;
}

// ─── Registry I/O ────────────────────────────────────────────────────────────

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) return { '$version': 1, entries: {} };
  const data = readJson(REGISTRY_PATH);
  if (!data) return { '$version': 1, entries: {} };
  if (!data.entries) data.entries = {};
  return data;
}

function initEntry(token, existing) {
  // Se já existe entry, preserva metadados editados manualmente
  const base = existing || {};
  const alias = detectAlias(token.value);
  return {
    layer: inferLayer(token.path),
    type: token.type,
    references: alias,
    sentido: base.sentido || 'TODO',
    escopo: base.escopo || [],
    contexto: base.contexto || 'TODO',
    decisao: base.decisao || 'TODO',
    usos: base.usos || { css: [], tokens: [], figma: [] },
    // preserve outros campos customizados se houver
    ...Object.fromEntries(
      Object.entries(base).filter(([k]) =>
        !['layer', 'type', 'references', 'sentido', 'escopo', 'contexto', 'decisao', 'usos'].includes(k)
      )
    ),
  };
}

// ─── Geração do MD ───────────────────────────────────────────────────────────

function generateMarkdown(registry, allTokens) {
  const byLayer = { foundation: [], semantic: [], component: [] };
  for (const [tokenPath, entry] of Object.entries(registry.entries)) {
    const layer = entry.layer || inferLayer(tokenPath);
    if (byLayer[layer]) byLayer[layer].push({ path: tokenPath, ...entry });
  }
  for (const l of Object.keys(byLayer)) {
    byLayer[l].sort((a, b) => a.path.localeCompare(b.path));
  }

  const now = new Date().toISOString().split('T')[0];
  let md = `# Token Registry\n\n`;
  md += `> Gerado automaticamente por \`scripts/build-token-registry.mjs\` em ${now}. Não editar à mão — edite \`tokens/registry.json\` e rode \`npm run build:registry\`.\n\n`;
  md += `Ver [ADR-013](decisions/ADR-013-camadas-de-consumo-de-tokens.md) para a regra arquitetural de camadas.\n\n`;

  const withTodo = Object.values(registry.entries).filter(e =>
    e.sentido === 'TODO' || e.contexto === 'TODO' || e.decisao === 'TODO'
  ).length;

  md += `## Status\n\n`;
  md += withTodo === 0
    ? `- Metadados obrigatórios preenchidos.\n\n`
    : `- Há entradas com \`TODO\` em campos obrigatórios; rode \`npm run verify:registry\` para ver a lista exata.\n\n`;

  for (const layer of ['foundation', 'semantic', 'component']) {
    md += `## ${layer.charAt(0).toUpperCase() + layer.slice(1)}\n\n`;

    if (byLayer[layer].length === 0) {
      md += `_Nenhuma entrada._\n\n`;
      continue;
    }

    // agrupar por categoria (segundo segmento do path)
    const byCategory = new Map();
    for (const e of byLayer[layer]) {
      const segs = e.path.split('.');
      const cat = segs[1] || '(root)';
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(e);
    }

    for (const [cat, entries] of [...byCategory.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      md += `### ${layer}.${cat}\n\n`;
      md += `| Token | Tipo | Alias | Sentido | Usos |\n`;
      md += `|---|---|---|---|---|\n`;
      for (const e of entries) {
        const usosTotal =
          (e.usos?.css?.length || 0) +
          (e.usos?.tokens?.length || 0) +
          (e.usos?.figma?.length || 0);
        const sentido = e.sentido === 'TODO' ? '⚠️ TODO' : e.sentido;
        const alias = e.references ? `→ \`${e.references}\`` : '—';
        md += `| \`${e.path}\` | ${e.type || '—'} | ${alias} | ${sentido} | ${usosTotal} |\n`;
      }
      md += `\n`;
    }
  }

  md += `---\n\n`;
  md += `## Detalhes por token\n\n`;
  md += `Seção expandida com contexto, decisão e locais de uso.\n\n`;

  for (const layer of ['foundation', 'semantic', 'component']) {
    for (const e of byLayer[layer]) {
      md += `### \`${e.path}\`\n\n`;
      md += `- **Camada**: ${e.layer}\n`;
      md += `- **Tipo**: \`${e.type || '—'}\`\n`;
      if (e.references) md += `- **Alias**: → \`${e.references}\`\n`;
      md += `- **Sentido**: ${e.sentido}\n`;
      md += `- **Escopo**: ${Array.isArray(e.escopo) && e.escopo.length > 0 ? e.escopo.join(', ') : '—'}\n`;
      md += `- **Contexto**: ${e.contexto}\n`;
      md += `- **Decisão**: ${e.decisao}\n`;
      md += `- **Usos**:\n`;
      if (e.usos?.css?.length) {
        md += `  - CSS:\n`;
        for (const u of e.usos.css) md += `    - \`${u.file}\` (${u.count}×)\n`;
      }
      if (e.usos?.tokens?.length) {
        md += `  - Tokens que referenciam: ${e.usos.tokens.map(t => `\`${t}\``).join(', ')}\n`;
      }
      if (!(e.usos?.css?.length) && !(e.usos?.tokens?.length) && !(e.usos?.figma?.length)) {
        md += `  - _(nenhum uso detectado — token órfão ou novo)_\n`;
      }
      md += `\n`;
    }
  }

  return md;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const { flat, byPath, refsOut } = loadAllTokens();
  const tokenReverseRefs = refsOut;
  const cssSources = loadCssSources();
  const figmaSnapshot = loadFigmaSnapshot();
  const ctx = { cssSources, tokenReverseRefs, figmaSnapshot };

  let registry = loadRegistry();

  if (MODE === 'init') {
    // adiciona entries que faltam, preservando existentes
    let added = 0;
    for (const t of flat) {
      if (!registry.entries[t.path]) {
        registry.entries[t.path] = initEntry(t, null);
        added++;
      }
    }
    writeJson(REGISTRY_PATH, registry);
    console.log(`[registry] --init: ${added} entries novas adicionadas. Total: ${Object.keys(registry.entries).length}.`);
    console.log(`[registry] Edite ${path.relative(ROOT, REGISTRY_PATH)} e preencha os campos TODO.`);
    return;
  }

  if (MODE === 'check') {
    const tokenPathsInJson = new Set(flat.map(t => t.path));
    const tokenPathsInRegistry = new Set(Object.keys(registry.entries));
    const missing = [...tokenPathsInJson].filter(p => !tokenPathsInRegistry.has(p));
    const stale = [...tokenPathsInRegistry].filter(p => !tokenPathsInJson.has(p));
    const withTodos = Object.entries(registry.entries).filter(([_, e]) =>
      e.sentido === 'TODO' || e.contexto === 'TODO' || e.decisao === 'TODO'
    );

    let hasError = false;
    if (missing.length) {
      hasError = true;
      console.error(`[registry] ❌ ${missing.length} tokens em tokens/ sem entry em registry.json:`);
      for (const p of missing.slice(0, 10)) console.error(`           - ${p}`);
      if (missing.length > 10) console.error(`           ... + ${missing.length - 10} outros`);
    }
    if (withTodos.length) {
      hasError = true;
      console.error(`[registry] ❌ ${withTodos.length} entries com campos TODO (sentido/contexto/decisao).`);
      for (const [p, _] of withTodos.slice(0, 10)) console.error(`           - ${p}`);
      if (withTodos.length > 10) console.error(`           ... + ${withTodos.length - 10} outros`);
    }
    if (stale.length) {
      console.warn(`[registry] ⚠️  ${stale.length} entries em registry.json sem token correspondente em tokens/:`);
      for (const p of stale.slice(0, 5)) console.warn(`           - ${p}`);
      if (stale.length > 5) console.warn(`           ... + ${stale.length - 5} outros`);
    }

    if (hasError) {
      console.error(`\n[registry] Check falhou. Rode \`npm run build:registry:init\` pra criar entries faltando e preencha os TODOs.`);
      process.exit(1);
    }
    console.log(`[registry] ✓ Check passou. ${Object.keys(registry.entries).length} entries, todas com metadados completos.`);
    return;
  }

  // MODE === 'build'
  // 1) garantir entries pra todo token atual (respeitando existentes)
  let newEntries = 0;
  for (const t of flat) {
    if (!registry.entries[t.path]) {
      registry.entries[t.path] = initEntry(t, null);
      newEntries++;
    } else {
      // atualizar campos derivados (layer/type/references) sempre
      registry.entries[t.path].layer = inferLayer(t.path);
      registry.entries[t.path].type = t.type;
      registry.entries[t.path].references = detectAlias(t.value);
    }
  }

  // 2) marcar stale (não deletar — warning em check)
  const tokenPathsInJson = new Set(flat.map(t => t.path));
  for (const p of Object.keys(registry.entries)) {
    if (!tokenPathsInJson.has(p)) {
      registry.entries[p]._stale = true;
    } else if (registry.entries[p]._stale) {
      delete registry.entries[p]._stale;
    }
  }

  // 3) recalcular usos
  for (const [tokenPath, entry] of Object.entries(registry.entries)) {
    if (entry._stale) continue;
    entry.usos = computeUsos(tokenPath, ctx);
  }

  // 4) persistir registry
  writeJson(REGISTRY_PATH, registry);

  // 5) gerar MD
  fs.writeFileSync(MD_OUTPUT, generateMarkdown(registry, flat));

  console.log(`[registry] Build completo.`);
  console.log(`           - Entries: ${Object.keys(registry.entries).length}`);
  console.log(`           - Novas adicionadas: ${newEntries}`);
  const withTodos = Object.values(registry.entries).filter(e =>
    e.sentido === 'TODO' || e.contexto === 'TODO' || e.decisao === 'TODO'
  ).length;
  const total = Object.keys(registry.entries).length;
  const pct = total === 0 ? 0 : Math.round(((total - withTodos) / total) * 100);
  console.log(`           - Completude: ${pct}% (${total - withTodos}/${total} sem TODO)`);
  console.log(`           - docs/token-registry.md atualizado.`);
}

main();
