# ADR-014: Reestruturação Semantic em `action` × `style` × `prop` × `state` — eliminação de brand/accent e themes

**Data:** 2026-04-22
**Status:** Aceita — implementada em 0.7.0 e estabilizada em 1.0.0-beta.1

> **Atualização (2026-04-26):** Naming `bg-*` → `background.*` aplicado em todos os tokens Semantic. Theme switcher (Default/Ocean/Forest) removido em 0.8.0 — tokens suportam single brand customizável conforme decidido aqui. ADR-015 (unificação de size) é evolução natural desta estrutura action × style × prop, estendida para dimensões.

## Contexto

Os ADRs anteriores (ADR-011 renaming, ADR-013 camadas de consumo) mantiveram a camada Semantic dominada por `brand.*` (fills diretos da marca) + `accent.*` (complemento em purple). Com essa estrutura:

- Consumidores (CSS, Figma bindings) resolviam variantes de Button misturando `brand.default`, `brand.toned.default`, `brand.content.contrast`, `border.brand`, etc. — sem padrão claro.
- Accent era usado apenas em Badge Secondary.
- Três paletas de brand (Default/Ocean/Forest) viviam em uma collection `Brand` no Figma com modes. Adicionavam complexidade e nunca foram requisito real do produto.
- Na Fase 5 do ADR-013, um agente criou 151 tokens Component como wrappers 1:1 pra compensar a falta de semântica de ação. Resultado: 288 Component tokens sem decisão clara, impossível de manter.

A pergunta arquitetural ficou: **como representar variantes de ação (Button brand, outline, ghost, danger, secondary neutral, etc.) em Semantic de forma que seja 1) enxuta, 2) previsível, 3) sem duplicação em Component?**

## Decisão

Reestruturar a camada Semantic em torno de um eixo **role × style × prop × state** específico para ações interativas, consolidar identidade da marca em uma paleta única na Foundation, e eliminar accent.

### 1. Foundation — `color/brand/{50..950}` como paleta única

Paleta `foundation.color.brand.*` criada com valores hex (Default = Blue atual). Designer pode reassignar os hex pra customizar a marca do projeto (futuro: color picker runtime).

Remoções:
- Collection **Brand** no Figma (modes Default/Ocean/Forest) — deletada
- `tokens/foundation/brand.json` — deletado
- CSS themes `theme-ocean.css` e `theme-forest.css` — deletados

### 2. Semantic — categorias de ação como peers no root (pós-revisão 2026-04-23)

Após revisão de estrutura com alinhamento ao PDF "Naming Tokens in Design Systems" (Nathan Curtis) e exemplos de Carbon/Polaris/Fluent, a estrutura anterior de 5 níveis `action.{role}.{style}.{prop}.{state}` foi considerada burocrática e redundante. Estrutura revisada:

**Regra de naming**:
- **Color tokens**: hierarquia pastas + compound hífen no último nível. `{categoria}/{prop-state}`.
- **Dimensional/structural**: hierarquia ponto (escalas taxonômicas).
- `default` explícito em vars de cor (`bg-default`, `content-default`).
- `bg` (não `background`) em compound; `background` reservado pra categoria root.

**Categorias de ação como peers no root Semantic** (sem prefix `action.`):

```
semantic.primary/{bg-default, bg-hover, bg-active, bg-disabled, content-default, content-disabled}   # solid brand
semantic.toned/{bg-default, bg-hover, bg-active, content-default, content-disabled}                   # brand translúcido
semantic.outline/{bg-hover, bg-active, border-default, border-hover, border-disabled, content-default, content-disabled}  # neutral
semantic.ghost/{bg-hover, bg-active, content-default, content-disabled}                               # neutral text-only
semantic.link/{content-default, content-hover, content-disabled}                                       # inline link branded
```

**Total**: 25 tokens (vs 66 atuais, -62%).

**Eliminações**:
- `secondary` e `danger` **não são mais roles em action**:
  - Button "danger" consome `feedback.error.*` diretamente
  - Button "secondary" (solid cinza) foi eliminado como estilo — visualmente vira `outline` (borda neutra) ou `ghost` (só texto)
- `state/*` categoria eliminada:
  - `state.hover` → `overlay.subtle`
  - `state.pressed` → `overlay.default`
  - `state.focus` → `focus.ring.color`
  - `state.disabled-background` → `background.disabled`
- `content.link.*` movido pra categoria `link.*` peer

**Feedback renomeado** pra compound consistente: `feedback.success.default` → `feedback.success.bg-default`, `feedback.success.content.contrast` → `feedback.success.content-contrast`.

**`border.control/*` renomeado**: `border.control.default` → `border.control-default`.

### 2.1 — Versão antiga (histórico, revoada em 2026-04-23)

A primeira versão do ADR-014 propunha:
```
semantic.action.{role: primary|secondary|danger}.{style: default|toned|outline|ghost}.{prop}.{state}
```
Mas gerou 66 tokens com nomes de 50+ caracteres (`--ds-action-primary-default-background-default`), "default" duplicado em vários paths, e roles repetidos (3 roles × 4 styles × props × states) sem justificativa prática.

**Troca**: simplicidade e alinhamento com mercado (Carbon/Polaris compound kebab-case) vs matriz combinatória completa.

(Outras hierarquias — success, info, warning — vêm on-demand quando houver variante de componente que exija.)

**Styles**:
- `default` — preenchimento sólido, alta ênfase
- `toned` — fundo sutil com overlay translúcido, ênfase média
- `outline` — borda + texto colorido, fundo transparente
- `ghost` — apenas texto, sem fundo nem borda

**Props × States**: cada combinação razoável é criada; combinações não aplicáveis (ex: `outline.background.default` sempre transparente) são omitidas.

Total Semantic action: ~70 tokens que cobrem todas as variantes de Button/ação explicitamente.

### 3. Semantic — categoria `radius` expandida

```
semantic.radius.{sm, md, lg, xl, full, component}
```

Aliases diretos de `foundation.radius.*`. `component` é alias de `md` (valor default de radius em componentes).

### 4. Eliminação de `brand/accent` em Semantic

- `semantic.brand.*` (11 tokens) — removidos
- `semantic.accent.*` (6 tokens) — removidos

Consumidores remapeados:
- `semantic.content.link.*` → aponta direto a `foundation.color.brand.{600,700}` (exceção a ADR-013: Semantic consumindo Foundation é permitido; link é ação neutra-primary)
- `semantic.border.focus`, `border.brand`, `state.focus` → mesma lógica
- Bindings de Figma components → rebindados a `semantic.action.primary.*`

### 5. Component — reduzida drasticamente (185 → ~60 vars)

Component collection mantém **apenas** dimensões específicas por componente (modal.max-width, button.height, spinner.size, etc.). Wrappers 1:1 pra Semantic/Foundation eliminados.

Componentes que NÃO têm tokens próprios (alert, badge, breadcrumb, card, divider, tabs, tooltip) — seus JSONs foram deletados. CSS deles consome Semantic direto.

## Fluxo de consumo

```
CSS de componente
    ↓
semantic.action.{role}.{style}.{prop}.{state}
    ↓
foundation.color.{brand|neutral|red}.{step}
```

Exemplo concreto — Button brand (primary, sólido) CSS:

```css
.ds-button--brand {
  background-color: var(--ds-action-primary-default-background-default);
  color: var(--ds-action-primary-default-content-default);
}
.ds-button--brand:hover  { background-color: var(--ds-action-primary-default-background-hover); }
.ds-button--brand:active { background-color: var(--ds-action-primary-default-background-active); }
```

Button toned:
```css
.ds-button--toned {
  background-color: var(--ds-action-primary-toned-background-default);
  color: var(--ds-action-primary-toned-content-default);
}
```

Button danger:
```css
.ds-button--danger {
  background-color: var(--ds-action-danger-default-background-default);
  color: var(--ds-action-danger-default-content-default);
}
```

Semântica explícita, cadeia curta, sem wrappers intermediários.

## Consequências

### Positivas

- **Estrutura enxuta**: Semantic action cobre TODAS variantes em ~70 tokens previsíveis
- **Sem 3 themes**: sistema foca em 1 brand, customização runtime via color picker (projeto futuro)
- **Component enxuto**: 60 vars justificadas (vs 185 inflado por wrappers)
- **Consistência**: mesma estrutura role × style × prop × state aplicável pra qualquer componente novo de ação
- **Zero Foundation leak**: nenhum bind de componente Figma ou CSS consome foundation direto
- **Rastreabilidade**: uso de `action-danger-outline-content-hover` é autoexplicativo em grep

### Negativas

- **Breaking change grande**: toda a cadeia `brand.*` + `accent.*` no Semantic foi removida. CSS de componentes inteiramente reescrito.
- **Themes removidos**: Ocean e Forest não voltam. Se alguém dependia, precisa reimplementar via override de `foundation.color.brand.*` no CSS consumidor.
- **on-demand risk**: `action.success`, `action.warning`, `action.info` não foram criados. Se Button ganhar variante Success, precisa criar os tokens primeiro. Fricção proposital pra evitar inflação.

### Bump de versão

**0.5.x → 0.6.0** (breaking change em toda a estrutura Semantic).

## Alternativas consideradas

### (a) Manter `brand.*` e adicionar só `action.*` em paralelo

Rejeitada. Duplicação de conceitos — dois tokens pra mesma cor. Não resolve o bloat.

### (b) Não criar camada `action` e deixar variantes de Button resolverem no CSS

Rejeitada. Viola ADR-013 (CSS consome Foundation direto ou mistura camadas). Perde intenção semântica.

### (c) Manter accent como 2ª paleta configurável

Rejeitada. Accent era usado só em Badge Secondary. Com elimnação de acent, Badge Secondary vira variante neutral (coerente com action.secondary).

### (d) Tokens por componente (Material Design 3 style — `button.filled.container.color`)

Rejeitada. É exatamente o que a Fase 5 ADR-013 fez e gerou bloat. Inviável em sistema de 18 componentes.

## Referências

- ADR-011: Renaming de Semantic colors (antecessor — `text/*` → `content/*`, `color/primary/*` → `brand/*`)
- ADR-013: Camadas de consumo — Foundation nunca direto em consumidor final
- Material Design 3: Color roles (precedent pra role-based tokens, mas não adotado por complexidade)
- Fluent 2: Surface/content/fill composition (precedent pra separação prop × state)
- Primer (GitHub): primer/primitives — inspiração pra estrutura enxuta
- Figma Tokens Studio: Role/Style composition pattern

## Migração

- Componentes Figma: rebindados automaticamente via `use_figma` (353 bindings de fills/strokes + 5 consumer vars semantic)
- JSONs de componente: reescritos com o subset de ~60 tokens
- CSS componentes: 18 arquivos reescritos pra consumir nova Semantic
- Snapshot Figma regenerado
- `verify:tokens` passa

## Reversibilidade

- Arquivo Figma duplicado manualmente antes da refatoração (checkpoint)
- `.figma-snapshot-pre-refactor.json` preservado
- Trabalho vive em branch `refactor/tokens-ground-up`; reverter = `git revert` do PR ou reset-hard
