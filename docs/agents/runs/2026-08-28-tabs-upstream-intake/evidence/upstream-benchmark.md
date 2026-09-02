# Benchmark upstream — Tabs

## WAI-ARIA APG

- Exige `tablist`, `tab` e `tabpanel`, relações `aria-controls`/`aria-labelledby` e um único tab no tab sequence.
- Em lista horizontal, esquerda/direita movem foco; Home/End são recomendados.
- Ativação automática é recomendada quando o painel aparece sem latência, caso do contrato TIS.
- Painel sem conteúdo focável deve receber `tabindex="0"`.

Fonte: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

## Ark UI 5.37.2 / Zag 1.41.2

- Parts: Root, List, Trigger, Content e Indicator.
- `activationMode="automatic"`, `orientation="horizontal"` e `loopFocus=true` correspondem ao Web.
- Disabled, controlled/uncontrolled, relações ARIA e navegação são geridos pela máquina Zag.

Fonte: https://ark-ui.com/docs/components/tabs

## Base UI 1.6.0

- Parts: Root, List, Tab, Indicator e Panel.
- Tabs nativas `<button>`, disabled e estado ativo por `data-active`.
- O comportamento e a semântica podem ser reutilizados sem adotar o visual de exemplo da biblioteca.

Fonte: https://base-ui.com/react/components/tabs

## Decisão

Usar somente os primitives comportamentais. O indicador animado dos providers não entra nesta primeira versão; o estilo TIS existente usa a borda inferior do tab ativo e será preservado nas três saídas.
