/**
 * figma-node-audit.mjs — helpers para ler/escrever bindings em propriedades de
 * nó do Figma que a Plugin API expõe via 4 campos individuais (um por lado),
 * não via um único campo agregado.
 *
 * Contexto: o Figma Plugin API tem uma armadilha silenciosa — chamadas como
 *   node.setBoundVariable('strokeWeight', variable)
 *   node.boundVariables.strokeWeight
 * retornam "ok" (não lançam erro) mas **não aplicam/não refletem** o binding.
 * O binding real vive em strokeTopWeight/strokeRightWeight/strokeBottomWeight/
 * strokeLeftWeight (4 campos independentes).
 *
 * Idem para cornerRadius → topLeft/topRight/bottomLeft/bottomRightRadius.
 *
 * Implementar audits de cobertura (ex: quantos Focus Rings têm strokeWeight
 * raw vs bound?) via o campo top-level **subestima a cobertura real**. Esta
 * lib encapsula a lógica correta.
 *
 * Uso típico (dentro de use_figma):
 *   import { isStrokeWeightBound, bindStrokeWeight } from './figma-node-audit.mjs';
 *   // (ou copiar os helpers inline — use_figma não tem bundler)
 *
 * Esta lib é JS puro e pode rodar tanto como módulo ES standalone quanto
 * copiada/colada num bloco use_figma. Funções aceitam um "node proxy" que
 * expõe as props do SceneNode da Plugin API.
 *
 * Histórico: PR #31 (0.5.17) descobriu o problema bindando 78 Focus Rings.
 * `setBoundVariable('strokeWeight',var)` aparentou bindar os 40 primeiros
 * (retornou sem erro) mas `node.boundVariables?.strokeWeight` veio null em
 * todos. A correção foi aplicar nos 4 campos individuais.
 */

// ─── strokeWeight helpers ────────────────────────────────────────────────────

export const STROKE_WEIGHT_FIELDS = [
  "strokeTopWeight",
  "strokeRightWeight",
  "strokeBottomWeight",
  "strokeLeftWeight",
];

/**
 * Retorna true se QUALQUER um dos 4 campos strokeTop/Right/Bottom/LeftWeight
 * tem binding a uma variable. O valor top-level `strokeWeight` é ignorado
 * porque nunca recebe binding (Figma armazena nos 4 campos individuais).
 */
export function isStrokeWeightBound(node) {
  const bv = node?.boundVariables ?? {};
  return STROKE_WEIGHT_FIELDS.some((f) => !!bv[f]);
}

/**
 * Retorna o id da variable bindada em strokeWeight, ou null se não há binding.
 * Se os 4 campos estão bindados a **variables diferentes** (inconsistência),
 * retorna o primeiro encontrado mas inclui um campo `inconsistent: true`.
 */
export function getStrokeWeightBinding(node) {
  const bv = node?.boundVariables ?? {};
  const ids = STROKE_WEIGHT_FIELDS.map((f) => bv[f]?.id ?? null);
  const nonNull = ids.filter(Boolean);
  if (nonNull.length === 0) return { id: null, inconsistent: false, partial: false };
  const first = nonNull[0];
  const allSame = nonNull.every((id) => id === first);
  const partial = nonNull.length < STROKE_WEIGHT_FIELDS.length;
  return { id: first, inconsistent: !allSame, partial };
}

/**
 * Aplica binding da variable em todos os 4 campos. Passa `null` como
 * variable para remover o binding.
 *
 * Retorna objeto com:
 *   { ok: true } se todos os 4 campos batem com o target,
 *   { ok: false, boundIds } caso contrário.
 */
export function bindStrokeWeight(node, variable) {
  for (const f of STROKE_WEIGHT_FIELDS) {
    node.setBoundVariable(f, variable);
  }
  const bv = node.boundVariables ?? {};
  const targetId = variable?.id ?? null;
  const boundIds = STROKE_WEIGHT_FIELDS.map((f) => bv[f]?.id ?? null);
  const ok = boundIds.every((id) => id === targetId);
  return { ok, boundIds };
}

/**
 * Remove bindings dos 4 campos e opcionalmente define um valor raw
 * (default: mantém o que estava).
 */
export function unbindStrokeWeight(node, rawValueIfAny) {
  for (const f of STROKE_WEIGHT_FIELDS) {
    node.setBoundVariable(f, null);
  }
  if (typeof rawValueIfAny === "number") {
    node.strokeWeight = rawValueIfAny;
  }
}

// ─── cornerRadius helpers (mesmo padrão) ─────────────────────────────────────

export const CORNER_RADIUS_FIELDS = [
  "topLeftRadius",
  "topRightRadius",
  "bottomLeftRadius",
  "bottomRightRadius",
];

/** Ver isStrokeWeightBound — mesma lógica aplicada em cornerRadius. */
export function isCornerRadiusBound(node) {
  const bv = node?.boundVariables ?? {};
  return CORNER_RADIUS_FIELDS.some((f) => !!bv[f]);
}

export function getCornerRadiusBinding(node) {
  const bv = node?.boundVariables ?? {};
  const ids = CORNER_RADIUS_FIELDS.map((f) => bv[f]?.id ?? null);
  const nonNull = ids.filter(Boolean);
  if (nonNull.length === 0) return { id: null, inconsistent: false, partial: false };
  const first = nonNull[0];
  const allSame = nonNull.every((id) => id === first);
  const partial = nonNull.length < CORNER_RADIUS_FIELDS.length;
  return { id: first, inconsistent: !allSame, partial };
}

export function bindCornerRadius(node, variable) {
  for (const f of CORNER_RADIUS_FIELDS) {
    node.setBoundVariable(f, variable);
  }
  const bv = node.boundVariables ?? {};
  const targetId = variable?.id ?? null;
  const boundIds = CORNER_RADIUS_FIELDS.map((f) => bv[f]?.id ?? null);
  const ok = boundIds.every((id) => id === targetId);
  return { ok, boundIds };
}

// ─── Auditoria genérica ──────────────────────────────────────────────────────

/**
 * Classifica um stroke em categorias pra audit panorâmico.
 *
 * Retorna:
 *   'NO_STROKE' se o nó não tem stroke aplicado
 *   'BOUND' se todos os 4 campos de strokeWeight estão bindados (mesma var)
 *   'PARTIAL' se só alguns campos estão bindados
 *   'INCONSISTENT' se campos bindados divergem entre si
 *   'RAW' se nenhum campo está bindado (valor numérico hardcoded)
 */
export function classifyStrokeWeight(node) {
  if (!node?.strokes || node.strokes.length === 0) return "NO_STROKE";
  const { id, inconsistent, partial } = getStrokeWeightBinding(node);
  if (!id) return "RAW";
  if (inconsistent) return "INCONSISTENT";
  if (partial) return "PARTIAL";
  return "BOUND";
}

/** Idem pra cornerRadius. */
export function classifyCornerRadius(node) {
  // cornerRadius=0 ainda é "raw" no sentido de não bindado; mas se for 0 ou
  // se topLeft/etc. variam (cornerRadius === 'mixed'), geralmente indica que
  // só alguns cantos têm radius — usamos o binding como principal sinal.
  const { id, inconsistent, partial } = getCornerRadiusBinding(node);
  if (!id) {
    // Sem binding e sem radius efetivo: ignora.
    const hasRadius = node?.cornerRadius === "mixed" ||
      (typeof node?.cornerRadius === "number" && node.cornerRadius > 0);
    return hasRadius ? "RAW" : "NO_RADIUS";
  }
  if (inconsistent) return "INCONSISTENT";
  if (partial) return "PARTIAL";
  return "BOUND";
}

// ─── Export default conveniente pra copiar/colar em use_figma ────────────────

export default {
  STROKE_WEIGHT_FIELDS,
  CORNER_RADIUS_FIELDS,
  isStrokeWeightBound,
  getStrokeWeightBinding,
  bindStrokeWeight,
  unbindStrokeWeight,
  isCornerRadiusBound,
  getCornerRadiusBinding,
  bindCornerRadius,
  classifyStrokeWeight,
  classifyCornerRadius,
};
