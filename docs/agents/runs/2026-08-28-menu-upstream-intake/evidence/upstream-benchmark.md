# Benchmark upstream · Menu

Consultado em 2026-08-28.

## WAI-ARIA APG

- Menu Button usa Button com `aria-haspopup="menu"` e `aria-expanded`.
- Enter/Space abre e leva foco ao primeiro item; Arrow Down/Up pode abrir nas extremidades.
- Menu usa foco composto; Escape fecha e retorna ao contexto de abertura.
- Items disabled permanecem focusable, mas não ativam.
- Fonte: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
- Fonte: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/

## Ark UI 5.39.1 / Zag transitivo 1.41.2 fixado no repo

- Anatomy: Root, Trigger, Positioner, Content, Item, ItemGroup/Label e Separator.
- Suporta command, checkbox, radio, disabled, grouping, links e nested.
- Typeahead é padrão; positioning expõe `--reference-width` e available size.
- Custom `id` no item é desaconselhado porque interfere na máquina interna.
- Fonte: https://ark-ui.com/docs/components/menu

## Base UI 1.6.0 fixado no repo

- Anatomy: Root, Trigger, Portal, Positioner, Popup, Item/LinkItem, Separator, Group e opções checkbox/radio.
- Mantém keyboard navigation, loop focus e foco de retorno configurável.
- Expõe states `data-highlighted`, `data-disabled` e `data-checked` para o adapter visual.
- Fonte: https://base-ui.com/react/components/menu

## Corte do incremento

Entram command, checkbox, radio, disabled, destructive, separator e group. Submenu,
context menu, menubar, links de navegação e combinações com Combobox ficam fora.
