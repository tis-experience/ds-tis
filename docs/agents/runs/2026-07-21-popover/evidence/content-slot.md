# Popover — Content Slot

- Data: 2026-07-21 (revisão)
- Set: `10332:504`
- Property: `↳ Content Slot#10336:0`
- Booleans: `Show Content Slot#10336:9` (**default false**, como Modal), `Show Content Text#10336:18` (default true)
- API: `ComponentNode.createSlot()` (não `figma.createSlot`)
- Anatomia correta: `Panel` → `Body` → `Body Text` + `↳ Content Slot` (vazio no set)
- Removido: frame `Actions` hardcoded + Button seedado no slot (causava caixa branca / ícones Lucide image)
- Exemplo de composição: seção `section-exemplos` na página (instância com slot ligado)
- Paridade: Modal (`Show Content Slot` default false, slot vazio no master)
