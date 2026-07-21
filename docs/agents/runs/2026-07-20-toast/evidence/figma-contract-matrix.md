# Matriz de contrato Figma — Toast

- Componente/padrão: Toast
- Data: 2026-07-20
- Role atual: DS Architect / contrato para Figma Builder
- Arquivo Figma: DS Core `IE68amP9Hya5ieFw1rX8S8`
- Página alvo: `      ❖  Toast` (criar)
- Component sets alvo: `Toast` (criar)
- Status: aprovado com brief (defaults: Subtle only, bottom-right, sem auto-hide com action)

## Modelos vivos consultados

| Modelo | Node | Uso no contrato |
|---|---|---|
| `Alert` | page `147:2`, set `147:67`, Subtle Success `147:11` | Anatomia Icon/Content/Title/Description/Close; tokens feedback subtle; Type variants |
| `Modal` | page `154:2`, root `155:370` | Frame raiz único + seções header/divider/section-* |
| `Tooltip` | page `191:2`, root `194:39` | Overlay doc page width 1440; component set em section |
| `Button` | page Button, ghost/sm | Nested instance para Action |

## Matriz

| part | targetNode | figmaProperty | componentProperty | componentToken | semanticAlias | modelEvidence | validation | exception |
|---|---|---|---|---|---|---|---|---|
| Root surface | `Toast/Type=*` | fills | Type | `toast/bg/{type}/subtle` | `feedback/{type}/background/subtle` | Alert `147:11` fills | bind Component; alias Semantic | none |
| Root border color | `Toast/Type=*` | strokes | Type | `toast/border-color/{type}/subtle` | `feedback/{type}/border/subtle` | Alert subtle strokes | bind Component | none |
| Root border width | `Toast/Type=*` | strokeWeight | n/a | `toast/border-width/default` | `border/width/default` (via alert alias pattern) | Alert border-width | bind FLOAT | none |
| Root radius | `Toast/Type=*` | cornerRadius | n/a | `toast/radius/default` | `radius/lg` | Alert radius | bind all corners | none |
| Root padding | `Toast/Type=*` | padding | n/a | `toast/padding/default` | `space/md` | Alert padding | bind 4 sides | none |
| Root gap | `Toast/Type=*` | itemSpacing | n/a | `toast/gap/default` | `space/sm` | Alert gap | bind GAP | none |
| Icon instance | `*/Icon` | mainComponent, size, color, stroke | Icon | `toast/icon/size|color|stroke-width/*` | icon/feedback semantic | Alert Icon Lucide | Lucide + Component binds | none |
| Title | `*/Content/Title` | characters, fills, typography | Title | `toast/title/*` | content/feedback | Alert Title | TEXT property linked | none |
| Description | `*/Content/Description` | characters, fills, visible, typography | Show Description, Description | `toast/description/*` | content subtle | Alert Description | boolean+TEXT | none |
| Action | `*/Action` | visible, nested Button | Show Action, Action Label | Button tokens (nested) | n/a | Button ghost/sm | instance Button; label TEXT | none |
| Close | `*/Close` | visible, size, color | Show Close, Close Icon | `toast/close/*` | icon/content | Alert Close | boolean+swap | none |
| Page root | page canvas `Toast` | structure | n/a | n/a | n/a | Alert/Modal/Tooltip roots | topLevelCount=1; sections ordered | none |
| Stack docs | `section-stack` | gap | n/a | `toast/stack/gap/default` | `space/sm` | overlay stack concept | docs only | none |

## Property API esperada

- Variants: `Type` = Success | Warning | Error | Info
- TEXT: Title, Description, Action Label
- BOOLEAN: Show Description, Show Action, Show Close
- INSTANCE_SWAP: Icon, Close Icon
- Ordem painel: Type → Show Description → Description → Title → Show Action → Action Label → Show Close → Close Icon → Icon

## Tokens novos

Component `toast/*` listados na matriz; Semantic `z/toast` se ausente (alias foundation z/50).

## Exceções aprovadas

- Style Filled omitido no MVP (Subtle only) — owner 2026-07-20
- Region/stack é documentação + runtime DOM, não component set

## Bloqueado antes de

- escrita no Figma enquanto matriz inválida;
- sync Figma → repo sem auditoria;
- commit/push.
