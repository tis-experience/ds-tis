# Benchmark upstream

## Ark UI + Zag

- Pacote fixado: `@ark-ui/react@5.37.2`.
- Zag: `@zag-js/combobox@1.41.2`, transitivo via Ark.
- Parts: Root, Control, Input, Trigger, ClearTrigger, Positioner, Content, List,
  Item, ItemText e Empty.
- Decisão: usar comportamento e parts; mapear o visual para classes/tokens TIS.

## Base UI

- Pacote fixado: `@base-ui/react@1.6.0`.
- Parts: Root, InputGroup, Input, Trigger, Clear, Portal, Positioner, Popup,
  List, Item e Empty.
- Decisão: provider comportamental da receita React distribuída pelo registry.

## WAI-ARIA APG

- Manter foco DOM no input e foco assistivo por `aria-activedescendant`.
- Arrow Up/Down navegam opções, Enter aceita e Escape fecha.

Recursos avançados existentes nos providers não entram sem extensão aprovada do
contrato TIS.
