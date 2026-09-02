# Contrato atual — Tooltip

- Snapshot: `.figma-snapshot.json`, gerado em `2026-08-28T08:35:08.535Z`.
- Página Figma: `191:2`; root `194:39`; `issueCount=0`.
- Root documental: layout vertical, padding 96 e gap 64, todos bindados a Semantic.
- Contrato visual: fundo inverse, label body/sm, radius md, padding md/sm e arrow de base sm/profundidade xs.
- Tokens: 11 Component variables em `tokens/component/tooltip.json`; nenhum token novo necessário.
- Web: `css/components/tooltip.css` e `js/tooltip.js` permanecem estáveis.
- Runtime Web: hover/focus, delay 100 ms, Escape, `aria-describedby`, conteúdo hoverable e API de lifecycle.
- Docs: texto curto, complementar, sem links/buttons/forms; quatro posições.

Decisão: adaptar Ark/Zag e React/shadcn/Base UI a esse contrato sem alterar Figma, tokens ou a saída Web.
