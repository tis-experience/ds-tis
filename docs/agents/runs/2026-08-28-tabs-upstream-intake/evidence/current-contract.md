# Estado atual — Tabs

- Web estável: `css/components/tabs.css`, `js/tabs.js` e `docs/tabs.html`.
- Anatomia pública: `.ds-tabs`, `.ds-tab`, `.ds-tab--active` e `.ds-tab-panel`.
- Runtime: `initTabs`, `destroyTabs`, `selectTab` e evento `ds-tabs-change`.
- Comportamento: ativação automática, roving tabindex, setas esquerda/direita, Home/End, disabled ignorado e painel sincronizado.
- Figma: página `192:2`, root `194:94`, layout vertical, padding 96, gap 64 e `issueCount=0`.
- Tokens: 16 contratos Component no JSON; 15 variables Figma Tabs com WEB code syntax; nenhum token novo necessário.
- Estado de saída: Web stable; Ark planned; React unavailable antes desta run.

## Restrições

- Figma e Web permanecem sem alteração.
- A primeira paridade cobre somente orientação horizontal, já que é o contrato atual do DS.
- Cada provider deve manter source, CSS, stories e dependências independentes.
