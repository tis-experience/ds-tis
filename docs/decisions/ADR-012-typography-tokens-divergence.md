# ADR-012: Tokens de line-height e letter-spacing divergem por design entre Figma e JSON

**Data:** 2026-04-21
**Status:** Aceita

## Contexto

Em 21/04/2026, durante os PRs #17-#22 (0.5.10 → 0.5.15), implementamos o sync Figma → JSON via MCP e consolidamos a hierarquia de verdade ("Figma é autoridade de valor; JSON é consolidação canônica"). Ao rodar o sync, 37 tokens de typography aparecem como divergentes:

- **23 NEW_IN_FIGMA**: `typography/font/line-height/*` (`tight`, `snug`, `normal`, `relaxed`, e `16`, `18`, `20`, `22`, `24`, `26`, `28`, `34`, `40`, `44`, `50`, `60`, `70`, `80`, `90`), `typography/font/letter-spacing/*` (`tight`, `normal`, `wide`, `wider`).
- **14 MISSING_IN_FIGMA**: `foundation.typography.line.height.*` (`none`, `tight`, `snug`, `normal`, `relaxed`, `loose`, `control.sm/md/lg`), `foundation.typography.letter.spacing.*` (`tighter`, `tight`, `normal`, `wide`, `wider`).

Não é "um lado está desatualizado". Figma e JSON **representam o mesmo conceito em unidades incompatíveis** porque Figma e CSS têm capacidades diferentes:

| Aspecto | Figma Variables | CSS / JSON |
|---|---|---|
| Unidade pra `line-height` | **PX obrigatório** (Plugin API só aceita `{unit: "PIXELS"\|"PERCENT", value: number}`) | **Ratio unitless** preferido (herdável, escalável), ou `rem`/`em` |
| Unidade pra `letter-spacing` | **PX obrigatório** | **`em` preferido** (proporcional ao font-size) |
| Tipagem DTCG | não há `$type: dimension` com unidade flexível | `$value: "1.25"` (ratio) ou `"0.5rem"` |
| Consumo | 24 dos 28 text styles consomem via `boundVariables` | 20 consumos de `--ds-line-height-*` em 8 componentes CSS |

**Consequência**: converter um lado pro outro causa perda real.

- Converter JSON pra PX: quebra acessibilidade (WCAG 1.4.4 "Resize Text"). Elementos em `px` não escalam com o zoom de texto do browser. Elementos em `rem`/`em`/unitless escalam.
- Converter Figma pra ratio: não funciona. A Plugin API não aceita unidade unitless em `lineHeight` de text style. O Figma registra internamente como PERCENT (`150 → 150%`) ou PIXELS, mas o binding precisa de Variable do tipo `FLOAT` com valor numérico que o Figma interpreta como px ou %.

## Decisão

Tokens de `line-height` e `letter-spacing` têm **representação divergente por design** entre Figma e JSON. Ambos os lados são canônicos no seu contexto de consumo.

### Regra

1. **Figma** mantém `typography/font/line-height/*` e `typography/font/letter-spacing/*` como autoridade para os **text styles do Figma**. Valores em PX (números puros; Figma interpreta como px quando aplicado a text node).
2. **JSON** mantém `foundation.typography.line.height.*` e `foundation.typography.letter.spacing.*` como autoridade para o **CSS gerado**. Valores em ratio unitless (line-height) e `em` (letter-spacing).
3. O sync Figma → JSON **não sincroniza** esses tokens — cada lado evolui independentemente dentro da sua representação.
4. Mudanças visuais de typography que afetam os dois lados (ex: deixar um heading mais "aberto") exigem **atualização manual em ambos** — Figma via text style, JSON via `foundation/typography.json`.

### Mecanismo técnico

No `scripts/lib/figma-dtcg.mjs`, introduzimos duas listas de regex para tokens Foundation que só existem em um lado:

```js
const FIGMA_ONLY_PATHS = [
  /^foundation\.typography\.font\.line-height\./,
  /^foundation\.typography\.font\.letter-spacing\./,
];
const JSON_ONLY_PATHS = [
  /^foundation\.typography\.line\.height\./,
  /^foundation\.typography\.letter\.spacing\./,
];
```

Na função `compareStates`:

- Tokens com path casando `FIGMA_ONLY_PATHS` que seriam `NEW_IN_FIGMA` → vão pra categoria `BY_DESIGN` (informativa).
- Tokens com path casando `JSON_ONLY_PATHS` que seriam `MISSING_IN_FIGMA` → idem.
- Categoria `BY_DESIGN` é listada no relatório mas **não conta como drift**. Exit code 0 quando é o único resto.

### Extensão em ADR-013 — aliases divergentes

Tokens Semantic/Component que **existem nos dois lados** mas apontam para Foundation em subárvores divergentes (Figma → `foundation.typography.font.line-height.*` px, JSON → `foundation.typography.line.height.*` ratio) são também classificados como `BY_DESIGN`, não `VALUE_DRIFT`. Motivo: a divergência vem da mesma razão arquitetural (Figma px vs CSS ratio) propagada através do alias. Exemplo: `semantic.typography.body.line-height.md` resolve em 24px no Figma e ratio 1.5 no CSS — ambos canônicos.

Detecção via função `isDivergentAliasByDesign` em `figma-dtcg.mjs`: quando Figma alias casa `^{foundation.typography.font.line-height.` e JSON alias casa `^{foundation.typography.line.height.` (ou letter-spacing equivalente), é BY_DESIGN divergent-alias.

### Extensão 2 — tokens Component JSON-only por limitação Figma

Categorias que Figma Variables **não consegue representar**: sombras como composite (objeto com offset/blur/color), cubic-bezier easings, durações de motion (Figma só tem prototype motion, não variables), e z-index (Figma não tem primitivo de stack order). Tokens Component que aliasam para essas categorias Foundation vivem só no JSON — o CSS consome, mas não há equivalente Figma.

Lista de targets JSON-only (em `JSON_ONLY_COMPONENT_ALIAS_TARGETS` de `figma-dtcg.mjs`):

- `{foundation.shadow.*}` — shadow objects
- `{foundation.z.*}` — z-index layers
- `{foundation.duration.*}` — motion duration
- `{foundation.ease.*}` — cubic-bezier easings

Quando `compareStates` encontra um token `component.*` presente no JSON mas ausente no Figma **e** seu valor casa um desses targets, classifica como `BY_DESIGN` (side: `json-only-component`) em vez de `MISSING_IN_FIGMA`. Eliminam-se os 26 erros "falsos" que surgiriam do Phase 5 refactor (ADR-013).

Se no futuro o Figma expandir Variables pra suportar qualquer dessas categorias, basta remover a regex da lista e essas variáveis podem migrar pro Figma como aliases reais.

### Diferença semântica vs `CSS_ONLY`

Este ADR introduz `BY_DESIGN`; não se confunde com a categoria `CSS_ONLY` existente:

- `CSS_ONLY` (introduzido em 0.5.11 pós-PR #18): tokens que **existem dos dois lados** mas têm **valores representados diferentemente** (ex: `foundation.typography.font.family.sans` = `"Inter"` no Figma vs stack completa `'Inter', system-ui, ...` no JSON). Sync ignora a diferença de valor.
- `BY_DESIGN` (este ADR): tokens que **existem só de um lado** por escolha arquitetural. Sync ignora a ausência do outro lado.

## Consequências

- Dry-run do sync sai mais limpo: `0 VALUE_DRIFT, 0 NEW_IN_FIGMA, 0 MISSING_IN_FIGMA, 0 ALIAS_BROKEN, 9 CSS_ONLY, 37 BY_DESIGN`. Divergências reais ficam visíveis sem o ruído de 37 falsos positivos.
- Quem for ajustar typography precisa saber que os dois lados são independentes. Documentado em `docs/process-figma-sync.md` e reforçado por `$description` nos tokens afetados (follow-up).
- Se no futuro DTCG/CSS ganharem suporte nativo a composite typography tokens (issue #27), dá pra revisitar essa decisão e unificar.

## Alternativas consideradas

**(a) Unificar em PX.** Remove rem/ratio do JSON, adota PX nos dois lados. Descartada por quebrar WCAG 1.4.4 e a convenção CSS moderna (unitless line-height é recomendado pela especificação CSS desde Level 2).

**(b) Unificar em ratio/em.** Remove os PX do Figma. Descartada porque a Plugin API do Figma não aceita line-height unitless; e porque designer precisa trabalhar em px absoluto durante composição visual.

**(c) Criar "composite typography tokens"** (DTCG `$type: typography`). Agruparia fontFamily + fontWeight + fontSize + lineHeight + letterSpacing num único token nomeado (ex: `display/2xl`). Resolve parcialmente mas exige migração grande. Movido pra issue #27 como evolução futura; não bloqueia este ADR.

**(d) Duplicar tudo de um lado no outro (manter ambos, sincronizar manualmente).** Descartada — dobra o custo de manutenção e convida drift silencioso. Melhor aceitar a divergência explicitamente.

## Referências

- [ADR-001](./ADR-001-migracao-tokens.md) — arquitetura Foundation → Semantic → Component.
- [ADR-003](./ADR-003-fontes-verdade.md) revisada — Figma = autoridade de valor.
- [ADR-006](./ADR-006-semantic-control-tokens.md) — tokens semânticos de controle (inclui `typography.control.*`).
- `docs/process-figma-sync.md` — fluxo operacional do sync.
- Issue #23 (origem desta decisão).
- Issue #27 — composite typography tokens (evolução futura).
- [CSS Values and Units Level 4 §3.5](https://www.w3.org/TR/css-values-4/) — unidades relativas (rem, em).
- [WCAG 2.2 — 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) — requisito de acessibilidade que justifica ratio/rem.
