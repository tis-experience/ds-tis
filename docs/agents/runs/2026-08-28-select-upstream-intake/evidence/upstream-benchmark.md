# Benchmark upstream

## WAI-ARIA APG

O padrão select-only combobox mantém um único valor, popup listbox, typeahead,
setas, Home/End, Enter/Space e Escape. O APG alerta que exemplos ARIA não são
substitutos automáticos da semântica nativa; por isso Web continua com
`<select>`.

- https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
- https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/

## Ark UI Select

Anatomia oficial: Root, Label, Control, Trigger, ValueText, Indicator,
Positioner, Content, Item, ItemText, ItemIndicator e HiddenSelect. A saída Ark
usará esse contrato e manterá Zag transitivo.

- https://ark-ui.com/docs/components/select

## Base UI Select

Fornece Root, Trigger, Value, Portal, Positioner, Popup, Item e suporte ao valor
de formulário. A saída React usará apenas `@base-ui/react/select` por source.

- https://base-ui.com/react/components/select

## Carbon Dropdown/Select

Carbon separa o Select nativo para formulários/mobile do Dropdown estilizado e
recomenda Radio para apenas duas opções. Isso confirma a coexistência entre o
Web nativo e os adapters customizados.

- https://carbondesignsystem.com/components/dropdown/usage/
