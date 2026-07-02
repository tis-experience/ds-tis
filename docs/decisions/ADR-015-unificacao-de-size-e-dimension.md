# ADR-015 — Unificação da escala size, eliminação de tokens component-specific e renomeação spacing→dimension

- **Status:** Aceito
- **Data:** 2026-04-26
- **Substitui:** sub-decisões de ADR-006 (que introduziu `size.control.*` e `space.control.padding-{x,y}.*`)
- **Relaciona:** ADR-013, ADR-019

> **Atualização (2026-05-11):** ADR-019 reintroduz Component tokens como contrato anatômico. Esta ADR continua vigente para a escala Semantic (`size.{xs..5xl}`) e para a regra de evitar component-specific disfarçado em Semantic. O que muda é que aliases 1:1 voltam a ser aceitos na camada Component quando documentam anatomia pública de componente.

## Contexto

A migração 3-layer → 2-layer (ADR-013) eliminou a Component collection mas a Semantic absorveu tokens component-specific (`size.avatar.*`, `size.modal.*`, `size.spinner.*`, `size.skeleton.*`, `size.textarea.*`, `size.toggle.track-width.*`, `size.control.*`). Eram 25 tokens em `semantic.size.*`. Auditoria revelou:

- **Duplicação por valor:** mesmo número (32, 40, 44) consumido por componentes diferentes via tokens distintos. Ex: `size.control.sm`, `size.avatar.sm`, `size.spinner.lg` — todos `dimension/32`.
- **Component-specific disfarçado de Semantic:** Component layer foi "deletada" mas a abstração que ela representava (1 token por componente × tamanho) sobreviveu sob outro namespace. Mesmo overhead de manutenção.
- **`space.control.padding-{x,y}.{sm,md,lg}`:** 6 tokens cobrindo apenas valores que já estavam em `space.{sm, md, lg, xl}`. Único valor de fato deviante: 10px (padding-y de control md).
- **Naming Foundation:** `foundation.spacing.N` foi adotado como escala numérica geral, mas `spacing` semanticamente sugere "gap/padding". Valores como 320, 640, 1280 (modal widths) não se encaixam.

## Decisão

### 1. Escala única `size.{xs..5xl}` para dimensões estruturais

Substitui todos os tokens `size.{avatar,control,modal,spinner,skeleton,textarea,toggle}.*` por uma escala genérica t-shirt:

| Token | px | Uso típico |
|---|---|---|
| `size.xs`  | 16  | Inline icon, indicator pequeno |
| `size.sm`  | 20  | Icon padrão em controle, checkbox/radio sm |
| `size.md`  | 24  | Icon grande, checkbox/radio md, avatar icon |
| `size.lg`  | 32  | Control height sm, avatar md, spinner padrão |
| `size.xl`  | 40  | Control height md (Button/Input/Select default), avatar lg |
| `size.2xl` | 48  | Control height lg, touch target a11y, avatar xl |
| `size.3xl` | 64  | Avatar 2xl, textarea sm |
| `size.4xl` | 96  | Textarea md, skeleton card |
| `size.5xl` | 128 | Textarea lg, skeleton hero |

### 2. Escala `size.layout.{xs..2xl}` para containers

Para dimensões de layout (modal, sidebar, page max-width):

| Token | px |
|---|---|
| `size.layout.xs`  | 320  |
| `size.layout.sm`  | 480  |
| `size.layout.md`  | 640  |
| `size.layout.lg`  | 800  |
| `size.layout.xl`  | 1024 |
| `size.layout.2xl` | 1280 |

### 3. Regra para `control.*`: somente desvios da escala genérica

`size.control.*` e `space.control.*` deixam de ser namespace de "tudo que é controle" e passam a ser **só** para valores que escapam da escala compartilhada. Exemplos:

- **Sobrevive:** `space.control.padding.10` (10px — único valor que não cabe em `space.{2xs..2xl}`).
- **Eliminados:** `size.control.{sm,md,lg}` (32/40/48 — valores cabem em `size.{lg,xl,2xl}`), `size.control.icon.{sm,md,lg}` (16/20/24 — cabem em `size.{xs,sm,md}`), `space.control.padding-{x,y}.{sm,md,lg}` (8/10/12/16/20 — exceto o 10).

### 4. Foundation: `foundation.spacing` → `foundation.dimension`

A escala numérica primitiva passa a se chamar `dimension` no JSON e CSS gerado:

```
foundation.spacing.N  →  foundation.dimension.N
--ds-spacing-N        →  --ds-dimension-N
```

Espelha o naming já adotado no Figma. Adiciona valores que faltavam em Foundation: 128, 320, 480, 640, 800, 1024, 1280.

### 5. Ajustes de valor (visual changes aceitos)

A unificação obrigou alguns valores antigos a se aproximarem dos degraus da escala:

| Antes | Token antigo | Depois | Token novo | Δ |
|---|---|---|---|---|
| 28 | size.avatar.icon.lg | 24 | size.md | −4 |
| 28 | size.toggle.track-width.sm | 24 | size.md | −4 |
| 36 | size.toggle.track-width.md | 40 | size.xl | +4 |
| 44 | size.toggle.track-width.lg | 48 | size.2xl | +4 |
| 44 | size.control.min-target | 48 | size.2xl | +4 (passa Material 48px touch target) |
| 56 | size.avatar.lg | 64 | size.3xl | +8 |
| 68 | size.textarea.min-height.sm | 64 | size.3xl | −4 |
| 80 | size.textarea.min-height.md | 96 | size.4xl | +16 |
| 112 | size.textarea.min-height.lg | 128 | size.5xl | +16 |
| 120 | size.skeleton.rect-height | 128 | size.5xl | +8 |
| 400 | size.modal.max-width.sm | 480 | size.layout.sm | +80 |
| 520 | size.modal.max-width.md | 640 | size.layout.md | +120 |

## Consequências

### Positivas

- **25 tokens `size.*` → 15 tokens** (40% redução).
- Adicionar componente novo: consulta a escala existente, escolhe o degrau. Não cria token component-specific.
- Picker no Figma fica enxuto e previsível.
- Naming `dimension` honra que a escala é primitiva numérica, não específica de spacing.
- a11y: touch target sobe de 44 → 48px (Material guideline).

### Negativas

- **Mudanças visuais perceptíveis** em alguns componentes (Avatar lg 56→64, Modal sm/md, Toggle track-width). Aceitas pelo designer durante cleanup.
- ADR-006 fica parcialmente revogado (a parte de "control tokens"). `typography.control.*` permanece (não tocado neste ADR).
- Tokens `--ds-size-*-*` legados deletados — qualquer consumidor externo do CSS gerado (improvável, repo é o único consumer hoje) precisa atualizar.

### Migração realizada nesta entrega

- **Figma:** 2.062 bindings rebound de zombies legados pra escala nova. Zero zombies remanescentes (auditoria pós-rebind: 251 vars únicas referenciadas, 100% live).
- **JSON:** `tokens/foundation/spacing.json` → `dimension.json`. `semantic.size` reescrito. `semantic.space.control` reduzido a `padding.10`. Aliases bulk-renomeados.
- **CSS:** ~50 refs em `css/components/*.css`, `css/base/*.css` e `docs/*.html` substituídas. Pipeline (`build:tokens`, `sync:docs`) regenerado.
- **Tests:** `test-token-integrity`, `test-css-references`, `test-generators` — todos passam.
- **Scripts ajustados:** `build-api.mjs`, `figma-dtcg.mjs`, `sync-docs.mjs`, `tokens-verify.mjs`.

## Reversibilidade

Mudança grande mas mecânica: rebind reverso é possível por valor. Branch isolada e testada antes de qualquer publicação. JSON é fonte de verdade derivado de Figma — recriar tokens antigos é trivial se necessário.
