# ADR-018 — Renomear `content.{default,secondary,tertiary}` para `content.{strong,default,subtle}`

- **Status:** Aceito
- **Data:** 2026-05-06
- **Relaciona:** ADR-011 (renaming de tokens semânticos de cor original)

## Contexto

`semantic.content.*` era o **único conjunto de tokens do DS com naming ordinal** (`secondary`, `tertiary` = 2º, 3º). Todas as outras categorias semânticas usam intent descritivo:

- `border.{default, subtle, strong, ...}`
- `surface.{default, raised, elevated, overlay}`
- `background.{default, subtle, disabled, inverse}`

`content.secondary` e `content.tertiary` quebravam essa convenção, comunicando posição em vez de peso visual. Em revisão de design tokens, a inconsistência ficou aparente: por que `border.subtle` mas `content.secondary`? Ambos são "menos prominente" — devem usar o mesmo vocabulário.

Desafio adicional: o que `content.default` representava — conteúdo de ênfase máxima (títulos, body forte) — não está no eixo "ordinal" nem no eixo "subtle/strong". `default` é uma **âncora** ("o caso padrão"), não um nível na escala. O sistema usa `default` consistentemente como âncora em todas as categorias (`border.default`, `surface.default`, etc.) — então `default` precisa significar "body text, o caso padrão", não "texto de ênfase máxima".

## Decisão

Renomear:

| Antes | Depois | Valor (não muda) | Uso típico |
|---|---|---|---|
| `content.default` | **`content.strong`** | `neutral.900` (light) / `neutral.50` (dark) | Títulos, badge labels solid, modal/card title, active tab — texto que precisa "pop" |
| `content.secondary` | **`content.default`** | `neutral.600` (light) / `neutral.400` (dark) | Body text, descriptions, form labels — o caso padrão (use este na maioria dos casos) |
| `content.tertiary` | **`content.subtle`** | `neutral.500` (light) / `neutral.400` (dark) | Placeholders, ícones decorativos, helper text |

`content.disabled` e `content.inverse` ficam como estavam (não estão no eixo de ênfase).

### Estratégia de migração

**Strict rename — valores 100% preservados.** Cada uso de `--ds-content-default` no CSS foi migrado para `--ds-content-strong` (mantendo o tom mais escuro). Cada uso de `--ds-content-secondary` foi migrado para `--ds-content-default` (mantendo neutral-600). Cada `--ds-content-tertiary` virou `--ds-content-subtle` (mantendo neutral-500).

Visual outcome **idêntico ao pré-migration** — só os nomes mudaram.

Nenhuma re-avaliação caso-a-caso de "este consumer devia ser strong ou default?" foi feita nesta ADR. Isso é decisão de design separada por componente, sem urgência arquitetural.

### Ordem de execução

1. Rename keys em `tokens/semantic/{light,dark}.json`
2. Rename keys em `tokens/registry.json`
3. `npm run build:tokens` — regenera CSS (variables CSS renomeadas automaticamente)
4. `sed`-replace de `--ds-content-{default,secondary,tertiary}` → `--ds-content-{strong,default,subtle}` em `css/components/*.css`, `css/base/*.css`, `docs/**/*.html`, `docs/**/*.md` (total: ~70 arquivos, ~150+ ocorrências)
5. Rename Variables `content/{default,secondary,tertiary}` → `content/{strong,default,subtle}` na collection Semantic do Figma via `use_figma` (passou por nome temporário pra evitar clash). Bindings de componentes auto-seguem por ID.
6. `npm run build:api` — regenera `docs/api/components.json` e `tokens.json` com nomes novos
7. `npm run sync:docs` — regenera inventários

### Não-decisão: mistura morfológica `default + strong/subtle`

Foi questionado se `default` está na mesma "linha morfológica" de `strong` e `subtle`. **Não está**: `strong` e `subtle` são adjetivos de intensidade (gradiente de ênfase), enquanto `default` é substantivo de status/papel ("o caso padrão"). Decidimos **manter a mistura** porque:

- `default` cumpre a função de **âncora** em todas as categorias do DS (`border.default`, `surface.default`, `background.default`). Mudar `default` em uma categoria sem mudar nas outras quebraria a consistência funcional.
- Atlassian, Polaris, Carbon, Material — todos os DSs grandes usam `default` como âncora junto com adjetivos de gradiente nas mesmas categorias. É padrão de indústria reconhecido.
- A consistência **funcional** (default = âncora em todo lugar) já existe e é o que importa pra dev/designer escolher token rapidamente. Buscar consistência morfológica pura custaria meses (renomear `default` em todas as categorias) e ganharia pouco.

## Consequências

- **Vocabulário consistente** entre `border` e `content` (e demais categorias gradiente). Designer/dev consulta um padrão único.
- **Zero impacto visual** — valores não mudaram, só nomes.
- **Documentação tem que ser atualizada** caso mencione `content.secondary` ou `content.tertiary` por nome — feito via sed nas docs HTMLs e MDs.
- **ADRs antigas** ainda referenciam `content.secondary`/`content.tertiary` em texto narrativo. Não atualizadas (são histórico — descrevem decisão tomada na época). Apenas tabelas de "estado atual" foram corrigidas.

## Alternativas consideradas

### (a) Manter `default / secondary / tertiary`

Descartada. É o único conjunto ordinal do DS — quebra padrão estabelecido em `border`, `surface`, `background`.

### (b) `default / muted / subtle`

Descartada por feedback do owner ("não usamos mais muted"). Não é vocabulário ativo do DS.

### (c) `default / subtle / subtlest` (padrão Atlassian, superlativo)

Descartada. Mantém `default` como mais forte e adiciona dois subtle — mas perde a expressividade de "strong" pra textos de ênfase, e "subtlest" é palavra rara.

### (d) `default / caption / placeholder` (purpose-based, padrão Carbon)

Descartada. Naming purpose-based não escala — `placeholder` não cobre todos os usos de `tertiary` (icon de chevron Select, etc.). Naming gradiente (`subtle`) é mais geral.

### (e) `default / subtle / subdued` (padrão Polaris)

Descartada. `subdued` é palavra menos usada no projeto e não traz vantagem sobre `subtle` (mesma intensidade conceitual).

### (f) `strong / regular / subtle` (consistência morfológica total — Caminho 2)

Descartada por escopo. Exigiria renomear `default` em **todas** as categorias do DS (`border.default → border.regular`, etc.) — meses de migração. Aceitamos a mistura morfológica `default + strong/subtle` como padrão de indústria.

## Referências

- [ADR-011](./ADR-011-renaming-tokens-semanticos-de-cor.md) — primeira reestruturação do naming semântico de cor.
- `tokens/semantic/light.json` + `dark.json` — fonte canônica.
- Auditoria Figma↔Repo (`audit/audit-report.md`) — descobriu o problema durante #4 (Badge Neutral Subtle).
