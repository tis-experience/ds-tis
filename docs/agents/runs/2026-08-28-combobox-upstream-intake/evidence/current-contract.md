# Contrato TIS atual

- Readiness Web: `app-ready`.
- Runtime: `ds-tis/combobox`, com init/destroy, filtro, seleção, teclado e evento
  `ds-combobox-change`.
- Anatomia: `.ds-combobox-anchor`, `.ds-combobox`, input, clear, chevron,
  listbox e option, composta com Form Field.
- States: default, filled, open, error, disabled e readonly.
- Defeito confirmado: o clear público é renderizado e documentado, mas não
  possuía listener no runtime.
- Figma/tokens: preservados, sem drift de valor no kickoff.
