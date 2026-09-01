# Evidência Figma — comparação com páginas modelo

- Lido em: 2026-08-03
- Modo: somente leitura
- Alvo: Popover `10333:818`

## Modelos vivos

| Página | Root | Dimensão | Seções diretas |
|---|---|---:|---|
| Modal | `155:370` | 2200 × 1791 | header, divider, tamanhos, variants, properties, accessibility |
| Tooltip | `194:39` | 1440 × 1053 | header, divider, properties, variants, accessibility |
| Menu | `7983:87` | 2200 × 2599 | header, divider, usage, components, properties, accessibility |
| Popover | `10333:818` | 1800 × 2382 | header, divider, properties, examples, variants, accessibility, differences |

Screenshots persistidos:

- `figma-model-modal-2026-08-03.png`;
- `figma-model-tooltip-2026-08-03.png`;
- `figma-model-menu-2026-08-03.png`;
- `figma-popover-root-2026-08-03.png`.

## Comparação

- As quatro páginas possuem exatamente um frame root e `clipsContent=false`.
- Header + divider + seções internas é o padrão comum.
- Largura e ordem das seções não são universais: variam com densidade, matriz e
  semântica do componente. Normalizar Popover para 1440 ou 2200 seria arbitrário.
- Popover usa a mesma hierarquia tipográfica, tabela leve, fundo, spacing e
  previews dos modelos.
- A seção `Diferenças` é específica e útil porque explicita Popover versus
  Tooltip, Menu e Modal; não é fragmentação estrutural.
- A página Popover não possui component sets, exemplos ou labels soltos no canvas.

## Resultado

Não foi encontrada lacuna visual/documental que justifique editar o Figma neste
gate. O resultado proposto é `sem mudança, com evidência`.

Isso não congela o componente para sempre. Se as saídas técnicas revelarem
uma capacidade que precise virar API visual pública, o intake reabre brief/spec
com uma proposta específica e aprovação do owner.
