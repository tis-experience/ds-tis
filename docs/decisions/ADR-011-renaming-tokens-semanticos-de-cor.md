# ADR-011: Reestruturação do naming de tokens semânticos de cor

**Data:** 2026-04-17
**Status:** Aceita — Implementada em 0.5.0

## Implementação

- Estrutura nova de tokens semânticos aplicada em `tokens/semantic/light.json` e `dark.json` em `f9f7609` (`fix(tokens): migrate theme overrides and foundation to ADR-011 naming; remove white/black (ADR-010)`).
- `css/base/reset.css` migrado para os novos nomes em `297accf` (`fix(base): migrate reset.css tokens to ADR-011 naming`).
- CSS regenerado via `build-tokens.mjs`.
- `text/on-brand`, `color/primary/muted`, `color/secondary/muted`, `background/muted`, `state/disabled/foreground` eliminados conforme tabela abaixo.

## Contexto

A camada semântica de cor cresceu organicamente desde o ADR-001 e ADR-005, acumulando inconsistências que comprometem a clareza, a semântica e a previsibilidade do sistema:

1. **Tokens `text/*` usados para conteúdo não-textual.** Ícones, shapes decorativos e thumbs (Toggle) consomem `text/secondary`, `text/tertiary` e similares. O nome não corresponde à função real.

2. **`color/primary/*` é genérico demais.** O prefixo `color` não transmite intenção — todos os tokens de cor são "cor". O que esses tokens representam é a identidade da marca.

3. **Duplicação funcional entre `text/on-brand` e `color/primary/foreground`.** Ambos resolvem para o mesmo valor e cumprem a mesma função.

4. **Inconsistência entre `subtle` e `muted`.** Em `background/*`, subtle = neutral-50 e muted = neutral-100. Em `color/primary/*`, subtle = blue-100 e muted = blue-50. A relação é invertida entre categorias.

5. **`state/disabled/foreground` duplica `text/disabled`.** Mesmos valores, dois tokens, nomes de categorias diferentes.

## Decisão

Reestruturar a camada semântica de cor seguindo dez princípios de naming. A reestruturação afeta 82 tokens semânticos, elimina 5, e reorganiza a hierarquia.

### Princípios de naming

1. Hierarquia expressa com `/` em todos os níveis reais. Sem achatamento com `-`.
2. Roles agrupam suas facetas de identidade em sub-categorias: fills no nível raiz do role, `toned/` para variantes translúcidas (só brand), `content/` para tokens de conteúdo do role.
3. Categorias estruturais agrupam variações de função. `background/`, `surface/`, `border/`, `content/` no nível raiz.
4. `content` como sub-categoria dentro de roles tem duas variantes: `default` (cor do role como conteúdo sobre fundos neutros ou sutis) e `contrast` (conteúdo de alto contraste sobre o fill sólido do role).
5. `content/*` no nível raiz é exclusivo para conteúdo sobre superfícies neutras (background, surface).
6. Sem prefixo `on-*`. A distinção entre conteúdo sobre fill sólido versus fundo sutil é feita pela escolha entre `{role}/content/contrast` e `{role}/content/default`.
7. Sem `muted` nos tokens semânticos. Apenas `subtle` (escala 100 das paletas). Os usos atuais de muted migram.
8. `background` não abrevia para `bg`. Consistente com os outros nomes de categoria não abreviados.
9. `control` permanece como categoria semântica consumida exclusivamente por tokens de componente (ADR-006).
10. Convenção `-default` no CSS (ADR-005) mantida. Todo token terminado em `.default` gera sufixo `-default` no CSS gerado.

### Mapeamento de renomeação

| Token atual | Token proposto | Tipo de mudança |
|---|---|---|
| `text/default` | `content/default` | Rename |
| `text/secondary` | `content/secondary` | Rename |
| `text/tertiary` | `content/tertiary` | Rename |
| `text/disabled` | `content/disabled` | Rename + unificação |
| `text/inverse` | `content/inverse` | Rename |
| `text/link/default` | `content/link/default` | Rename |
| `text/link/hover` | `content/link/hover` | Rename |
| `text/on-brand` | **eliminado** | Duplicata de `color/primary/foreground` → `brand/content/contrast` |
| `color/primary/default` | `brand/default` | Rename |
| `color/primary/hover` | `brand/hover` | Rename |
| `color/primary/active` | `brand/active` | Rename |
| `color/primary/subtle` | `brand/subtle` | Rename |
| `color/primary/disabled` | `brand/disabled` | Rename |
| `color/primary/muted` | **eliminado** | 1 uso (Button Ghost hover) → `state/hover` |
| `color/primary/toned/default` | `brand/toned/default` | Rename |
| `color/primary/toned/hover` | `brand/toned/hover` | Rename |
| `color/primary/toned/active` | `brand/toned/active` | Rename |
| `color/primary/text` | `brand/content/default` | Rename + reestruturação |
| `color/primary/foreground` | `brand/content/contrast` | Rename + reestruturação |
| `color/primary/disabled-fg` | `brand/content/contrast-disabled` | Rename + reestruturação |
| `color/secondary/default` | `accent/default` | Rename |
| `color/secondary/hover` | `accent/hover` | Rename |
| `color/secondary/active` | `accent/active` | Rename |
| `color/secondary/subtle` | `accent/subtle` | Rename |
| `color/secondary/muted` | **eliminado** | Sem uso em componentes |
| `color/secondary/text` | `accent/content/default` | Rename + reestruturação |
| `color/secondary/foreground` | `accent/content/contrast` | Rename + reestruturação |
| `feedback/*/text` | `feedback/*/content/default` | Rename + reestruturação (4 roles) |
| `feedback/*/foreground` | `feedback/*/content/contrast` | Rename + reestruturação (4 roles) |
| `feedback/*/disabled-fg` | `feedback/*/content/contrast-disabled` | Rename (success, error) |
| `background/muted` | **eliminado** | Button Outline hover → `state/hover`; Skeleton fill → `component.skeleton.fill` |
| `state/disabled/foreground` | **eliminado** | Unificado em `content/disabled` |

### Migração de casos especiais

#### `background/muted` → eliminado

- **Button Outline hover** e hover de Checkbox/Radio/Toggle label: migram para `state/hover` (overlay black/5% em light, white/5% em dark). Semanticamente correto — é um overlay interativo.
- **Skeleton fill**: novo token de componente `component.skeleton.fill` → `{semantic.state.disabled.background}`. Resolve corretamente em ambos os modos: neutral-100 light / neutral-800 dark.
- **Badge neutral subtle background**: usa `state/disabled/background` (mesmo valor — neutral-100 light / neutral-800 dark).

#### `state/disabled/foreground` + `text/disabled` → `content/disabled`

Ambos apontavam para o mesmo valor (neutral-400 light / neutral-600 dark). Consolidados em um único token no nível de conteúdo.

### Impacto em artefatos

| Artefato | Ação necessária |
|---|---|
| `tokens/semantic/light.json` e `dark.json` | Reescritos com nova estrutura |
| `tokens/component/button.json` | Referências atualizadas (`brand.toned.*`, `brand.content.default`, `content.disabled`) |
| `tokens/component/skeleton.json` | Novo token `skeleton.fill` adicionado |
| Style Dictionary | Rebuild. Transformação path → name é automática |
| CSS gerado | ~60 custom properties com novos nomes |
| `css/components/*.css` | 18 arquivos atualizados (zero vars antigas) |

## Consequências

### Positivas

- **Clareza semântica:** tokens descrevem função (conteúdo, fill, borda, overlay) em vez de implementação (texto, cor).
- **Hierarquia previsível:** roles seguem o mesmo padrão estrutural. Adicionar um novo role (ex: tertiary) segue o template existente.
- **Eliminação de ambiguidade:** `brand/content/contrast` deixa claro que é "conteúdo de alto contraste sobre fill brand"; `brand/content/default` é "conteúdo na cor brand sobre fundo neutro".
- **Agrupamento visual no Figma:** a coleção Semantic fica organizada em pastas reais por role.
- **Redução de tokens:** 5 eliminações líquidas. Menos tokens para manter e decidir.
- **Unificação de tokens duplicados:** `text/disabled` e `state/disabled/foreground` (mesmo valor, dois locais) → um único `content/disabled`.

### Negativas

- **Breaking change em toda a stack:** JSON, CSS gerado, Figma Variables, component tokens, CSS de componentes. Exige execução coordenada.
- **Custo de atualização mental:** referências a `color/primary/default`, `text/secondary` etc. em documentação externa ficam obsoletas.
- **Risco de regressão visual:** tokens renomeados mas não rebindados corretamente no Figma podem gerar valores inesperados. Exige auditoria pós-migração.

### Bump de versão

**0.4.0 → 0.5.0** (breaking change no naming de tokens semânticos de cor).

> Nota histórica: durante o desenvolvimento o pacote ficou temporariamente com versão `1.5.0` em `package.json` sem nunca ter sido publicado no npm. Em 0.5.1 a versão foi realinhada para a faixa 0.x (plano de consolidação da documentação).

## Alternativas consideradas

### Manter a estrutura atual e ajustar apenas os usos incorretos

Rejeitada. O problema é sistêmico no naming, não apenas em usos pontuais.

### Adotar o modelo Material 3 com prefixo `on-*`

Rejeitada. O `on-*` não cobre o caso de cor do role usada como conteúdo sobre fundo neutro. Ver ADR completo em Knowledge Base.

### Separar `content/*` de `icon/*` em categorias distintas

Rejeitada. Dobraria a quantidade de tokens de conteúdo (~15 → ~30) para resolver um problema perceptual que aparece caso a caso, não sistematicamente.

## Referências

- ADR-001: Migração para DTCG + Style Dictionary
- ADR-005: Brand como foundation, convenção `-default`, focus ring outline
- ADR-006: Semantic control tokens
- ADR-007: Toned color system
- Material Design 3 — Color roles
- Primer UI color system
- Fluent 2 token naming
