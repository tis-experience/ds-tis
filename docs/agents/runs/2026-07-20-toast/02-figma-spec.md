- Status: Aguardando aprovação do owner

# Spec Figma proposta

- Componente/padrao: Toast (feedback transitório viewport + stack)
- Pagina Figma: criar página `Toast` no arquivo DS Core `IE68amP9Hya5ieFw1rX8S8` (ainda não existe)
- Referencias DS Core consultadas:
  - Component set **Alert** (key `14ab3f4569db8df1afc46fda2159827e9d0383ab`): Type × Style, Title/Description, Show Close, Icon/Close Icon swaps, tokens `alert/*`
  - Modal / Tooltip (padrão overlay + runtime docs; z-index foundations)
  - Button ghost/sm (ação e close)
  - Lucide: `circle-check`, `triangle-alert`, `circle-alert`, `info`, `x`
- Referencias externas consultadas:
  - WAI-ARIA APG Alert pattern (não mover foco; cuidado com auto-dismiss)
  - WCAG 4.1.3 Status Messages + 2.2.1 Timing
  - Padrões Polaris/Radix Toast (stack viewport, action opcional, dismiss) — conceitos, não pixel copy

## Padrão de página (obrigatório)

Antes de escrever, Figma Builder deve dumpar 2–3 páginas maduras (Alert, Modal, Tooltip) e espelhar:

- Um único frame raiz nomeado `Toast`
- Filhos diretos: `header` → `divider` → `section-*` (ordem previsível)
- Component set, exemplos, tabelas e labels **dentro** das seções
- Zero nós gerados soltos no canvas da página
- Textos com height hug / auto-height; `clipsContent=false` em frames documentais salvo exceção
- Largura/margens alinhadas aos modelos vivos

Seções propostas (ordem):

1. `header` — título + subtítulo
2. `divider`
3. `section-overview` — quando usar / não usar + vs Alert/Modal/Tooltip
4. `section-anatomy` — diagram + lista de partes
5. `section-component` — component set Toast
6. `section-types` — matriz Success/Warning/Error/Info
7. `section-action` — com/sem action button
8. `section-stack` — exemplo de fila (3–5 instâncias, não component set)
9. `section-properties` — tabela da API pública
10. `section-tokens` — linhas Component → Semantic
11. `section-do-dont` — Do/Don’t

## Anatomia

- Root: `Toast` (frame horizontal, auto-layout)
- Subcamadas (esquerda → direita):
  1. `Icon` — frame + instância Lucide
  2. `Content` — coluna vertical
     - `Title` (TEXT)
     - `Description` (TEXT; visibilidade por boolean)
  3. `Action` — instância Button ghost/sm (visibilidade por boolean)
  4. `Close` — botão icon-only + Lucide `x`
- Nested instances: Lucide icons; Button para Action
- Slots: nenhum slot livre no MVP (textos via properties)
- Fora do component set (só docs): `Toast Region` / stack — frame de documentação mostrando empilhamento; runtime monta a region no DOM

## Auto-layout

- Root: horizontal; gap = `toast/gap/default`; padding = `toast/padding/default`; align center/top conforme altura do content; width hug com max-width documentada (~360–420px, token `toast/max-width/default` se necessário)
- Content: vertical; gap = `toast/content/gap/default`; fill horizontal
- Action + Close: hug
- Region (docs): vertical stack, gap `toast/stack/gap/default`, alinhada canto inferior-direito em mock de viewport
- `clipsContent`: false em frames documentais

## Properties

- Variants:
  - `Type`: Success | Warning | Error | Info (default Success)
  - `Style`: Subtle only no MVP (default Subtle). **Não** expor Filled nesta run (reduz matriz; reutiliza visual Alert subtle). Owner pode pedir Filled depois.
- Text properties:
  - `Title` (obrigatório; default PT-BR)
  - `Description` (default PT-BR)
  - `Action Label` (default “Desfazer”)
- Boolean properties:
  - `Show Description` → Description
  - `Show Action` → Action (+ Action Label imediatamente abaixo)
  - `Show Close` → Close (default true)
- Instance swaps:
  - `Icon` (defaults por Type: circle-check / triangle-alert / circle-alert / info)
  - `Close Icon` (default lucide/x)
- Slot properties: nenhuma
- Ordem no painel:
  1. Type
  2. Style (se mantido; só Subtle)
  3. Show Description → Description
  4. Title
  5. Show Action → Action Label
  6. Show Close → Close Icon
  7. Icon

## States

- Default: visível
- Hover/Focus: relevantes em Close e Action (Button/close focus ring); o toast em si não tem “pressed”
- Open/Closed: runtime (entering/exiting); no Figma documentar como nota, não como variant
- Error/Invalid: N/A (Type=Error é o feedback, não estado de form)
- Paused (timer): nota de docs, não variant Figma

## Tokens/bindings

- Foundation: nenhum binding direto em nodes finais
- Semantic: `feedback/*/background|border|content` (subtle), `content.*`, `icon.color.*`, `space.*`, `radius.*`, `shadow.*`, `border.width.*`, tipografia label/body; `z.toast` (alias `{foundation.z.50}` — criar Semantic no sync/repo; foundations já documentam z-50 para toast)
- Component (novos, espelhando Alert onde 1:1 faz sentido):

| Token Component | Alias Semantic (proposta) |
|-----------------|---------------------------|
| `toast/padding/default` | `space.md` |
| `toast/gap/default` | `space.sm` |
| `toast/content/gap/default` | `space.2xs` ou `space.xs` |
| `toast/stack/gap/default` | `space.sm` |
| `toast/radius/default` | `radius.lg` |
| `toast/border-width/default` | `border.width.default` |
| `toast/max-width/default` | dimension semantic ou size adequado |
| `toast/shadow/default` | `shadow.md` (ou elevation usada em overlays) |
| `toast/bg/{type}/subtle` | `feedback.{type}.background.subtle` |
| `toast/border-color/{type}/subtle` | `feedback.{type}.border.subtle` |
| `toast/title/color/{type}/subtle` | `feedback.{type}.content.default` |
| `toast/description/color/{type}/subtle` | content secondary / feedback content |
| `toast/icon/size|glyph-size|stroke-width|color/{type}/subtle` | como Alert |
| `toast/close/*` | como Alert close |
| `toast/title|description/font-*` | tipografia semantic |

- Variables novas: todas `toast/*` acima + Semantic `z.toast` se ainda não existir na collection Semantic
- Effect styles: preferir binding de shadow Variable se existir; senão Effect Style elevation alinhado ao JSON (ADR-016)
- Text styles: `label/md` (title), `body/sm` (description) — confirmar nomes vivos no dump

## Exemplos no canvas

- Exemplo 1: Success subtle com title + description + close
- Exemplo 2: Error com Show Action = true (“Tentar de novo”)
- Exemplo 3: Stack de 3 toasts (success, warning, info) em mock de canto
- Matriz de variants: Type × (Show Action on/off) × (Show Description on/off) — Style só Subtle

## Documentacao visual

- Secoes: ver lista acima
- Tabelas: properties; tokens Component→Semantic; diferenciação Alert/Modal/Tooltip/Toast
- Notas para designers:
  - Toast não rouba foco
  - Com ação, preferir sem auto-hide (runtime)
  - Ícones sempre Lucide bindados (size/color/stroke)
  - Action = instância Button, não texto estilizado
- Diferencas para componentes proximos: tabela na section-overview

## Matriz de contrato (resumo executável)

| part | figmaProperty | componentProperty | componentToken | modelEvidence |
|------|---------------|-------------------|----------------|---------------|
| Root | fills, strokes, radius, padding, gap | Type | `toast/bg|border-color|radius|padding|gap/*` | Alert root |
| Icon | size, color, stroke | Icon swap | `toast/icon/*` | Alert Icon |
| Title | characters, text style, fill | Title | `toast/title/*` | Alert Title |
| Description | characters, text style, fill, visible | Show Description, Description | `toast/description/*` | Alert Description |
| Action | instance Button, visible | Show Action, Action Label | (Button tokens) | Button ghost/sm |
| Close | size, color, visible, characters n/a | Show Close, Close Icon | `toast/close/*` | Alert Close |
| Stack (docs) | gap | n/a | `toast/stack/gap/default` | overlay docs |

Builder deve expandir para matriz completa (`figma-contract-matrix`) com `unmappedRows=0` antes do handoff “pronto para auditoria”.

## Validacao planejada

- Estrutura: `topLevelCount=1`, seções na ordem, 0 loose nodes
- Bindings: Component → Semantic only; ícones size/color/stroke; sem ALL_SCOPES; WEB syntax
- Properties: todos texts com `componentPropertyReferences.characters`; booleans ligados a `visible`; swaps a `mainComponent`
- Screenshot: comparar Alert + Modal pages
- Validadores repo (após sync): `verify:figma-structure`, `audit:component-tokens`, `verify:tokens`

## Bloqueado antes de

- Figma write: até owner aprovar `01-brief.md` + este arquivo (e decisões abertas no brief)
- Repo sync: até Figma Auditor aprovar + owner no gate figma-audit
- Commit/push: gate Release / pedido explícito
