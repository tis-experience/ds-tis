# ADR-006: Tokens semânticos de controle para dimensões e tipografia compartilhadas entre controles interativos

**Data:** 2026-04-15
**Status:** Parcialmente substituída — `size.control.*` e `space.control.padding-{x,y}.*` substituídos por escala `size.{xs..5xl}` + `space.{xs..2xl}` + `space.control.padding.10` em **ADR-015** (2026-04-26). O contrato público de anatomia dos componentes foi movido para tokens Component em **ADR-019** (2026-05-10). `typography.control.*` permanece vigente.

> **Nota:** Esta ADR introduziu `semantic.size.control.*` e `semantic.space.control.padding-{x,y}.*` como tokens compartilhados entre controles. Em 2026-04-26, ADR-015 unificou a escala de dimensão num namespace genérico `size.{xs..5xl}` (e `size.layout.{xs..2xl}` para containers), eliminando a maioria dos tokens `*.control.*`. Em 2026-05-10, ADR-019 definiu que Button, Input, Select, Checkbox, Radio e Toggle expõem contratos anatômicos por `component.<component>.<part>.<property>.*`.

## Implementação

A maior parte foi executada durante ADR-011:

- `semantic.size.control.*`, `semantic.size.control.icon.*`, `semantic.size.control.min-target`, `semantic.space.control.padding-x.*`, `semantic.space.control.padding-y.*`, `semantic.typography.control.font-size.*`, `semantic.typography.control.line-height.*` existem em `tokens/semantic/light.json` e `dark.json`.
- `tokens/component/button.json`, `input.json`, `select.json`, `textarea.json` referenciam os semantic control tokens. O rename `button.padding.*` → `button.padding-x.*` está aplicado.
- CSS gerado em `css/tokens/generated/theme-*.css` e `component.css` propaga a cadeia corretamente.
- Documentação do pattern em `docs/control-sizing.html`.

Fechamento formal em 0.5.3:

- `semantic.size.control.{sm,md,lg}`, `semantic.size.control.icon.{sm,md,lg}`, `semantic.size.control.min-target`, `semantic.typography.control.line-height.{sm,md,lg}` trocaram valores absolutos (`2rem` etc.) por referências a `{foundation.spacing.*}`. Mantém a cadeia token viva: se a escala de spacing mudar, estes derivam automaticamente.
- `tokens/component/input.json` e `select.json` ganharam `padding-y` explícito apontando para `semantic.space.control.padding-y.*`.
- `docs/control-sizing.html` ajustado: os nomes documentados `--ds-typography-control-font-size-*` e `--ds-typography-control-line-height-*` foram alinhados para `--ds-control-font-size-*` e `--ds-control-line-height-*` — os nomes que o transform `name/strip-layer` de `build-tokens.mjs` realmente emite (ele remove o segmento `typography`).

## Pré-requisitos

- ADR-005 implementada (foundation/brand.json existe, convenção `-default` consolidada).
- Verificação Figma ↔ JSON em CI (ADR-003, 0.5.1).

## Estimativa de esforço

4 horas. 1h para adicionar os tokens semânticos control em `light.json` e `dark.json`, 1h30 para atualizar `tokens/component/button.json`, `input.json`, `select.json`, `textarea.json` para referenciar os novos tokens semânticos, 1h para normalizar dimensões dos componentes no Figma, 30min para build, verificação e validação visual.

## Passos concretos para sair do estado Proposta

1. Adicionar `semantic.typography.control.*`, `semantic.size.control.*`, `semantic.space.control.*` em `tokens/semantic/light.json` e `dark.json` (mesmos valores em ambos os modos).
2. Adicionar `foundation.dimension.min-target` (2.75rem/44px) em `tokens/foundation/` se o token não existir.
3. Atualizar `tokens/component/button.json` para referenciar os tokens semânticos novos (renomeando `padding` para `padding-x`).
4. Atualizar `tokens/component/input.json`, `select.json`, `textarea.json` de forma análoga.
5. Executar `npm run build:tokens` e ajustar CSS dos componentes para consumir as novas variáveis geradas (`--ds-size-control-*`, `--ds-space-control-*`, `--ds-typography-control-*`).
6. Normalizar Figma: Button, Input Text Field, Select Field com mesma altura 32/40/48; ajustar line-height e paddingY para os valores do control token. Textarea ajusta paddingY mas mantém altura independente.
7. Rodar `npm run verify:tokens` para confirmar coerência.
8. Documentar como breaking change no CHANGELOG. Bump minor.

## Contexto

O design system tem 18 componentes, dos quais Button, Input Text, Select e Textarea compartilham o conceito de "controle interativo com variantes de tamanho" (sm/md/lg). Uma auditoria do arquivo Figma revelou inconsistências dimensionais entre estes componentes:

- **Button** usa paddingY 8/10/12 e alturas 32/40/48.
- **Input Text/Select** (frame Field) usam paddingY 6/8/10 e alturas 34/40/48.
- **Padding-x** é consistente: 12/16/20 nos três.
- **cornerRadius** é consistente: 8px nos três.

A causa raiz é tipografia: o label do Button usa lineHeight 20/20/22px, enquanto o texto de Input/Select usa lineHeight 22/22/24px. O Input usa line-heights de texto corrido (ratio 1.5) quando deveria usar um line-height de controle single-line mais apertado, alinhado ao tamanho do ícone.

Além disso, o `button.json` atual mistura estratégias de referenciamento de tokens:
- `button.padding.{sm/md/lg}` referencia `space.inset.*` e `space.component.*` semânticos de forma inconsistente.
- `button.height.*`, `button.font-size.*`, `button.icon-size.*` usam valores absolutos (`"2rem"`, `"0.75rem"`), violando a regra 3 (apenas foundation tem valores absolutos).
- Não existe um vocabulário compartilhado entre componentes que deveriam estar dimensionalmente alinhados.

## Decisão

### 1. Criar tokens semânticos de tipografia de controle

Uma nova subcategoria `semantic.typography.control.{sm/md/lg}` define font-size e line-height para texto single-line dentro de controles interativos. O line-height bate com o icon-size em cada tier, garantindo alinhamento vertical texto-ícone.

| Tamanho | fontSize | lineHeight | iconSize |
|---------|----------|------------|----------|
| sm | 0.875rem (14px) | 1rem (16px) | 1rem (16px) |
| md | 0.875rem (14px) | 1.25rem (20px) | 1.25rem (20px) |
| lg | 1rem (16px) | 1.5rem (24px) | 1.5rem (24px) |

Tokens em `light.json` e `dark.json` (mode-invariant, mesmos valores nos dois):

```
semantic.typography.control.font-size.sm  → {foundation.typography.font.size.sm}   (0.875rem)
semantic.typography.control.font-size.md  → {foundation.typography.font.size.sm}   (0.875rem)
semantic.typography.control.font-size.lg  → {foundation.typography.font.size.md}   (1rem)
semantic.typography.control.line-height.sm → {foundation.typography.font.size.md}  (1rem / 16px)
semantic.typography.control.line-height.md → {foundation.typography.font.size.lg}  (1.125rem → arredonda para 1.25rem / 20px)*
semantic.typography.control.line-height.lg → {foundation.typography.font.size.2xl} (1.5rem / 24px)
```

*Nota: 20px (1.25rem) não existe na escala de font-size. Se não houver token foundation equivalente, criar `foundation.typography.line-height.control.md` com valor `1.25rem`. Alternativamente, usar `foundation.spacing.5` (1.25rem / 20px), já que o valor é idêntico. Preferência: criar um token dedicado para evitar confusão semântica entre spacing e line-height.

### 2. Criar tokens semânticos dimensionais de controle

```
semantic.size.control.sm         → 2rem     (32px)  — referencia {foundation.spacing.8}
semantic.size.control.md         → 2.5rem   (40px)  — referencia {foundation.spacing.10}
semantic.size.control.lg         → 3rem     (48px)  — referencia {foundation.spacing.12}
semantic.size.control.icon.sm    → 1rem     (16px)  — referencia {foundation.spacing.4}
semantic.size.control.icon.md    → 1.25rem  (20px)  — referencia {foundation.spacing.5}
semantic.size.control.icon.lg    → 1.5rem   (24px)  — referencia {foundation.spacing.6}
semantic.size.control.min-target → 2.75rem  (44px)  — referencia {foundation.spacing.11}*

semantic.space.control.padding-x.sm → {foundation.spacing.3}    (12px)
semantic.space.control.padding-x.md → {foundation.spacing.4}    (16px)
semantic.space.control.padding-x.lg → {foundation.spacing.5}    (20px)
semantic.space.control.padding-y.sm → {foundation.spacing.2}    (8px)
semantic.space.control.padding-y.md → {foundation.spacing.2-5}  (10px)
semantic.space.control.padding-y.lg → {foundation.spacing.3}    (12px)
```

*Se `foundation.spacing.11` não existir (44px = 2.75rem), adicionar à escala de spacing, ou usar `foundation.spacing.10` (40px) + nota que 44px é derivado. Preferência: adicionar um token `foundation.dimension.min-target` com valor absoluto `2.75rem`.

Fórmula de altura: `height = padding-y * 2 + lineHeight`, validada em todos os tamanhos:
- sm: 8 + 16 + 8 = 32 ✓
- md: 10 + 20 + 10 = 40 ✓
- lg: 12 + 24 + 12 = 48 ✓

### 3. Atualizar tokens de componente para referenciar os tokens semânticos de controle

`component.button.*` e futuros `component.input.*`, `component.select.*` referenciavam os tokens semânticos de controle. Este formato foi substituído por ADR-019, que exige o segmento anatômico no nome do token Component:

```
component.button.height.sm → {semantic.size.lg}
component.button.height.md → {semantic.size.xl}
component.button.height.lg → {semantic.size.2xl}
component.input.height.sm  → {semantic.size.lg}
component.input.height.md  → {semantic.size.xl}
component.input.height.lg  → {semantic.size.2xl}
component.select.height.sm → {semantic.size.lg}
component.select.height.md → {semantic.size.xl}
component.select.height.lg → {semantic.size.2xl}
```

O plano antigo de criar tokens Component de padding, font-size e icon-size para Button não representa o estado canônico atual no Figma/JSON. Essas propriedades continuam consumindo Semantic diretamente até serem materializadas como contratos Component explícitos.

### 4. Normalizar as dimensões dos componentes no Figma

Todos os controles interativos (Button, Input Text Field, Select Field) devem usar a mesma altura em cada tier de tamanho: 32/40/48. Isso exige atualizar Input/Select:
- Ajustar line-height do texto de 22px para bater com o control token (sm=16, md=20, lg=24).
- Ajustar paddingY para bater com o control token (sm=8, md=10, lg=12).

Textarea compartilha os tokens de padding mas não a altura:
- Ajustar paddingY para bater com o control token (sm continua 8, md muda 12→10, lg muda 16→12).
- Ajustar binding de paddingX para usar `space.control.padding-x.*` (valores continuam 12/16/20).
- Altura continua independente (FIXED ou HUG content, multi-linha).
- Line-height continua nos ratios de body text (texto multi-linha usa line-height normal, não o control line-height otimizado para alinhamento single-line com ícone).

## Consequências

- **Tokens:** ~18 novos tokens semânticos (6 size, 6 space, 6 typography). 3 tokens do button renomeados (padding → padding-x). ~10 tokens do button atualizados de valores absolutos para referências semânticas. Foundation pode ganhar 1–2 tokens (line-height 1.25rem, dimension min-target).
- **CSS:** Novas variáveis `--ds-size-control-*`, `--ds-space-control-*`, `--ds-typography-control-*`. O contrato Component atual em CSS usa `--ds-button-height-*`, `--ds-input-height-*` e `--ds-select-height-*`.
- **Figma:** Novas variáveis na coleção Semantic: `size/control/*`, `space/control/*`, `typography/control/*`. Componentes Button, Input Text, Select, Textarea religados às novas variáveis. Frames Field de Input/Select ajustados para as alturas 32/40/48. paddingY do Textarea ajustado de 8/12/16 para 8/10/12; altura inalterada.
- **Docs:** Nova seção "Control sizing" documentando o sistema dimensional compartilhado. Páginas Button, Input, Select atualizadas. token-schema.md e component-inventory.md atualizados.
- **Breaking changes:** O rename antigo das variáveis de padding do Button foi substituído pelo contrato Component anatômico de ADR-019 para alturas de root.

## Alternativas consideradas

**A) Manter os tokens do button referenciando foundation diretamente (ADR proposta em outro chat).** Criaria `button.padding-y.{sm/md/lg}` → `foundation.spacing.*` sem camada semântica. Descartada porque a auditoria mostra que Input, Select e Textarea compartilham as mesmas dimensões — o padrão é sistêmico, não específico do componente.

**B) Criar tokens semânticos nomeados por componente (`semantic.space.component.button-height-md`).** Descartada porque "button" no nome de um token semântico é um sinal ruim — é um token de componente disfarçado. A abstração correta é "control", não "button".

**C) Aceitar a diferença de 2px entre Button e Input/Select.** Descartada porque a diferença vem de line-heights inconsistentes, não de design intencional. Quando posicionados lado a lado em um formulário (ex: search inline com button), o desalinhamento é visível e incorreto.
