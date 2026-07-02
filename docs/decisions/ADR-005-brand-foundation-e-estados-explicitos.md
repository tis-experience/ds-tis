# ADR-005: Brand como camada foundation, estados explícitos no semantic, e limpeza tipográfica

**Data:** 2026-04-14
**Status:** Aceita — Implementada em 0.5.0 (fechamento formal em 0.5.2). Superseded por [ADR-014](ADR-014-action-tokens-role-style.md): collection Brand (modes Default/Ocean/Forest) deletada em 0.8.0, Brand virou paleta única customizável dentro da Foundation.
**Atualiza:** ADR-001 (seção sobre camada Brand)

## Implementação

Os três pontos do ADR foram executados via ADR-011 e commits anteriores:

1. **Brand como foundation:** `tokens/foundation/brand.json` existe com `foundation.brand.primary` → `{foundation.color.blue.600}` e `foundation.brand.secondary` → `{foundation.color.purple.600}`. `tokens/semantic/light.json` e `dark.json` referenciam `{foundation.brand.primary}` e `{foundation.brand.secondary}` nos tokens `.default` (light.json linha 88, dark.json linha 86).
2. **Sufixo `-default` explícito:** nenhum CSS de componente em `css/components/*.css` usa os nomes antigos (`--ds-color-primary`, `--ds-color-secondary`, `--ds-feedback-success` sem sufixo, etc.). Todos consomem `--ds-*-default`.
3. **`font.size.base` removido:** `tokens/foundation/typography.json` não contém mais a chave. Zero ocorrências de `--ds-font-size-base` em qualquer CSS do repo.

Fechamento formal em 0.5.2: correção do `canonicalToCssVar` em `scripts/tokens-verify.mjs` (alinhamento com o transform `name/strip-layer` de `build-tokens.mjs`), zerando 65 falsos positivos que mascaravam a verificação.

## Pré-requisitos

- Verificação Figma ↔ JSON em CI estável (ADR-003, introduzida em 0.5.1). Sem isso, a migração de brand para foundation pode gerar divergências silenciosas entre Figma e código.

## Estimativa de esforço

6 horas. Distribuídas em: 2h edição de JSONs (criar `tokens/foundation/brand.json`, ajustar referências em light/dark), 1h build e ajuste do Style Dictionary, 2h rename das CSS custom properties nos 18 componentes via script (`--ds-color-primary` → `--ds-color-primary-default` etc.), 1h atualização da coleção Brand no Figma e validação visual.

## Passos concretos para sair do estado Proposta

1. Criar `tokens/foundation/brand.json` com `foundation.brand.primary` e `foundation.brand.secondary` resolvendo para os valores de cada tema.
2. Ajustar `tokens/semantic/light.json` e `dark.json`: `semantic.brand.default` e `semantic.accent.default` passam a referenciar `{foundation.brand.primary}` e `{foundation.brand.secondary}`.
3. Remover `foundation.typography.font.size.base` de `tokens/foundation/typography.json`; substituir 7 referências CSS por `--ds-font-size-16`.
4. Executar `npm run build:tokens` e conferir que o CSS gerado inclui todas as novas variáveis `-default`.
5. Rodar find-and-replace em `css/components/**/*.css` para renomear as variáveis listadas na decisão.
6. Atualizar a coleção Brand no Figma (via `use_figma`) para refletir a nova estrutura.
7. Rodar `npm run verify:tokens` para garantir que Figma e JSON batem.
8. Documentar no CHANGELOG como breaking change. Bump minor (0.x.y → 0.x+1.0).

## Contexto

A revisão dos tokens JSON gerados na migração DTCG (ADR-001) revelou três problemas estruturais:

1. O ADR-001 descartou a camada Brand ("perde propósito sem multi-marca"). Na prática, brand cumpre um papel diferente de multi-marca: é a ponte entre paleta e intenção. Os tokens primary e secondary alimentam 42+ referências em 13 componentes (button, checkbox, radio, toggle, tabs, input, select, textarea, avatar, badge, spinner, focus ring). Sem um nó explícito, essa relação fica implícita na camada semantic.

2. O CSS atual mistura convenções de naming: alguns grupos têm sufixo -default (--ds-background-default, --ds-text-default) e outros não (--ds-color-primary, --ds-feedback-success). A causa é que tokens com estados interativos (hover, active) usavam o nome do grupo sem sufixo como "base state". Isso cria ambiguidade e exige transforms customizados no Style Dictionary.

3. font.size.base e font.size.md são duplicatas (ambos 1rem). base é consumido em 7 arquivos CSS, md em nenhum. A escala usa t-shirt sizes (xs, sm, md, lg, xl) em todas as outras categorias, mas tipografia tem esse caso especial.

## Decisão

### 1. Brand como subcamada da foundation

Criar tokens/foundation/brand.json com 2 tokens: foundation.brand.primary e foundation.brand.secondary.

Regras:
- Brand é foundation: valor bruto, sem estados. Nenhum .hover, .active, .subtle nesta camada.
- semantic.color.primary.default referencia {foundation.brand.primary}, não a paleta direta.
- Os demais estados semânticos (hover, active, subtle, muted, foreground, text) referenciam a paleta foundation diretamente (ex: {foundation.color.blue.700} para hover).
- Na troca de tema, brand.json e o semantic completo são substituídos. Brand define a cor base; o semantic define toda a família de estados.
- No Figma, Brand permanece como coleção separada com modos por tema (Default, Ocean, Forest). Semantic aponta pra Brand no token .default e pra Foundation paleta nos demais.
- No dark mode, brand resolve pra um shade diferente (ex: blue.400 em vez de blue.600). Isso é tratado via source file alternativo no Style Dictionary (brand-dark.json) ou via modos na coleção Figma.

### 2. Estado .default sempre explícito no CSS

Todo token que vive dentro de um grupo com siblings gera sufixo -default no CSS. Sem exceção. A regra do Style Dictionary é geração direta: path → CSS name, sem transforms de colapso.

Tokens que serão renomeados na migração CSS:
- --ds-color-primary → --ds-color-primary-default
- --ds-color-secondary → --ds-color-secondary-default
- --ds-feedback-success → --ds-feedback-success-default
- --ds-feedback-warning → --ds-feedback-warning-default
- --ds-feedback-error → --ds-feedback-error-default
- --ds-feedback-info → --ds-feedback-info-default
- --ds-text-link → --ds-text-link-default

Tokens que já usam -default (sem mudança): --ds-background-default, --ds-text-default, --ds-surface-default, --ds-border-default, --ds-overlay-default.

O rename CSS (~80 substituições em componentes) acontece quando o Style Dictionary assumir a geração.

### 3. Remover font.size.base, manter font.size.md

Remover foundation.typography.font.size.base do JSON. A escala tipográfica fica consistente com t-shirt sizes: 2xs, xs, sm, md, lg, xl, 2xl, ... 9xl. O rename das 7 referências CSS (--ds-font-size-base → --ds-font-size-16) acontece junto com o rename do item 2.

## Consequências

- Novo arquivo: tokens/foundation/brand.json (2 tokens)
- semantic.color.primary.default e secondary.default passam a referenciar {foundation.brand.*}
- font.size.base removido de typography.json
- ~80 find-and-replace em css/components/ e css/tokens/ quando Style Dictionary for configurado
- Contagem foundation: 217 tokens (124 colors + 2 brand + 32 typography + 20 spacing + 8 radius + 7 shadows + 7 opacity + 7 motion + 6 z-index + 4 stroke)
- Coleção Brand no Figma mantida com 2 variáveis e modos por tema

## Alternativas consideradas

Manter Brand no semantic (semantic.color.brand.primary.*): Descartada. Brand é valor bruto (mapeamento de paleta → role) e não tem estados — pertence ao foundation por definição.

Manter CSS sem sufixo -default nos brand tokens via transform: Descartada. Cria exceção que exige transform customizado no Style Dictionary e gera inconsistência no naming.

Manter font.size.base como alias de md: Descartada. Alias no JSON gera duas CSS vars pro mesmo valor, e consumidores não sabem qual usar.
