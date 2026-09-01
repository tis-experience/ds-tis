# Benchmark upstream — Toggle

## Ark UI

- Fonte: https://ark-ui.com/docs/components/switch
- Parts: Root, Control, Thumb, Label e HiddenInput.
- Mantém checked, foco, Space/Enter e integração de formulário.
- Root é label e HiddenInput preserva semântica e submissão.

## Base UI

- Fonte: https://base-ui.com/react/components/switch
- Switch representa on/off, exige nome acessível e integra formulário.
- A saída React existente continua independente e não será importada pelo adapter Ark.

## WAI-ARIA APG

- Fonte: https://www.w3.org/WAI/ARIA/apg/patterns/switch/
- Space alterna o estado; role switch comunica aria-checked.
- O label precisa permanecer igual quando o estado muda.
