# Matriz de contrato Figma — {{TITLE}}

> O contrato vem **antes** do desenho. O Figma Builder não interpreta a spec
> durante a escrita: ele executa esta matriz linha a linha. Cada linha precisa
> derivar de um modelo vivo maduro (Input Text, Select, Menu, Button, etc.) ou
> ser uma exceção declarada e aprovada. Inspiração aproximada não é contrato.
>
> Valide antes do handoff:
> `npm run agents:validate-matrix -- <caminho-desta-matriz.md> --strict-exceptions`
> Regra dura: `unmappedRows=0`. Build bloqueado enquanto houver linha incompleta.

- Componente/padrão: {{TITLE}}
- Data: {{DATE}}
- Role atual: DS Architect / contrato para Figma Builder
- Arquivo Figma: DS Core `IE68amP9Hya5ieFw1rX8S8`
- Página alvo: `(node id)`
- Component sets alvo: `(node ids)`
- Status: rascunho; bloqueado antes de qualquer escrita no Figma

## Modelos vivos consultados

| Modelo | Node | Uso no contrato |
|---|---|---|
| `Input Text` | page `(id)`, set `(id)` | Anatomia de form control: root vertical, Label Row, Field, helper/error, tokens `field/*` + `form-field/*`. |
| `Select` | page `(id)`, set `(id)` | Form control com chevron, value/placeholder separados, focus ring e field sizing. |
| `Menu` | page `(id)`, component `(id)` | Superfície popup/elevated: bg, border, width, radius, padding, gap, elevation. |

## Regras de cobertura

- Toda parte da anatomia do alvo precisa de pelo menos uma linha nesta matriz.
- Erro/helper/label seguem o padrão de form field; focus segue Focus Ring dedicado.
- Popup/listbox segue Menu; opção segue Menu Item com semântica de listbox.
- `componentToken` deve apontar para Semantic; nunca Foundation, nunca valor cru.
- Bindings são validados por propriedade (fills, strokes, strokeWeight, cornerRadius,
  padding, gap, height, text style, `componentPropertyReferences`), nunca por total.

## Matriz

| part | targetNode | figmaProperty | componentProperty | componentToken | semanticAlias | modelEvidence | validation | exception |
|---|---|---|---|---|---|---|---|---|
| EXEMPLO — Field surface | `*/Field` (todos os states) | fills, strokes, strokeWeight, radius | n/a | `field/bg/*`, `field/border-color/*`, `field/border-width`, `field/radius` | shared `field/*` | `Select Field #145:47`, `Input Field #100:59` | sem fill/stroke/radius cru; cada state mapeia para `field/*`; binding lido por propriedade | none |

> Substitua a linha EXEMPLO por uma linha por parte real do componente. Cada
> célula obrigatória (`part`, `targetNode`, `figmaProperty`, `validation`) precisa
> de conteúdo real. `modelEvidence` é obrigatório, exceto quando `exception` for
> preenchida com uma exceção declarada.

## Property API esperada

- `(lista de component properties públicas, derivadas da API real pós-escrita)`
- `(eixos de variant: Size, State, ...)`

## Tokens novos ou a normalizar

- `(lista de tokens Component necessários; justifique por que não reusar um existente)`

## Exceções aprovadas

> Toda linha com `exception` preenchida só é válida quando o owner aprovar aqui.
> Liste uma decisão por exceção, com data. Sem esta seção, `--strict-exceptions`
> bloqueia o handoff.

- (vazio até o owner aprovar exceções)

## Bloqueado antes de

- qualquer escrita no Figma enquanto `unmappedRows > 0`;
- sync Figma → repo;
- commit/push/publicação.
