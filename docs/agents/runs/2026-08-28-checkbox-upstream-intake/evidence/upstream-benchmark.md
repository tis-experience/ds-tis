# Benchmark upstream

- Ark UI Checkbox: parts Root, Control, Indicator, Label e HiddenInput; Zag mantém checked/mixed, foco, hover, invalid e formulário.
- Base UI Checkbox: Root e Indicator, hidden input, checked/indeterminate, disabled, required, readOnly e integração de formulário.
- WAI-ARIA APG Checkbox: Space alterna o estado; `aria-checked` aceita true, false e mixed; label e descrição precisam de associação explícita.
- Conclusão: Ark pode fornecer comportamento sem mudar a anatomia visual TIS; o adapter deve preservar hidden input e traduzir data attributes para tokens existentes.
