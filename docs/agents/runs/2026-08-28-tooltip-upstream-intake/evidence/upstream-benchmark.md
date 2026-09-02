# Benchmark upstream — Tooltip

## Referências

- WAI-ARIA APG Tooltip: https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
- Ark UI Tooltip: https://ark-ui.com/docs/components/tooltip
- Base UI Tooltip: https://base-ui.com/react/components/tooltip

## Contrato comum

- O trigger recebe hover ou focus; o Tooltip não recebe foco.
- Escape fecha sem mover foco.
- O conteúdo usa `role="tooltip"` e descreve o trigger.
- O pointer pode transitar do trigger para a superfície sem fechamento prematuro.
- Positioner, collision handling e Portal são responsabilidade do provider.

## Diferenças aceitas

- Ark/Zag expõe `Root`, `Trigger`, `Positioner`, `Arrow`, `ArrowTip` e `Content`; delays ficam no Root.
- Base UI expõe `Provider`, `Root`, `Trigger`, `Portal`, `Positioner`, `Popup` e `Arrow`; delays compartilhados ficam no Provider.
- A anatomia interna não precisa ser idêntica. As três saídas devem preservar aparência, semântica, interação e conteúdo.
