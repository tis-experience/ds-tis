# Benchmark upstream — Radio

## Ark UI

- Fonte: https://ark-ui.com/docs/components/radio-group
- Parts: Root, Label, Item, ItemControl, ItemText e ItemHiddenInput.
- Mantém valor, seleção exclusiva, foco, setas, Space e integração com formulário.
- Hidden input é obrigatório para submissão e reset nativos.

## Base UI

- Fonte: https://base-ui.com/react/components/radio
- Radio sempre pertence a RadioGroup; exige nome acessível e suporta formulário.
- A saída React existente continua independente e não será importada pelo adapter Ark.

## WAI-ARIA APG

- Fonte: https://www.w3.org/WAI/ARIA/apg/patterns/radio/
- Tab entra e sai do grupo; Space seleciona; setas movem foco e seleção com wrap.
- Grupo e opções precisam de nomes acessíveis, role e estado checked coerentes.
