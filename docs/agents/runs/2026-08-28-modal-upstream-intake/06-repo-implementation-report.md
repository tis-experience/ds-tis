# Repo Implementation Report

- Status: Implementado e validado localmente
- Componente: Modal
- Run: `2026-08-28-modal-upstream-intake`
- Agent: Repo Component Agent
- Data: 2026-08-28

## Implementação

- Web: HTML/CSS/JS estáveis foram preservados.
- Ark/Zag: adapter mantém parts Dialog, portal, backdrop, `md` padrão, focus trap,
  Escape, outside click, controlled state e retorno de foco.
- React: `registry/tis/dialog.tsx` mantém Base UI isolado, largura border-box e
  close de 40px/ícone de 24px totalmente dentro da superfície.
- Docs: três rotas e cinco exemplos estáticos carregam o CSS público e Buttons.

## Correção encontrada pela revisão visual

- Antes: o popup React `md` media 680px por falta de `box-sizing` local; o texto
  “Fechar modal” ficava visível e fazia o SVG colapsar para 0px; o controle
  extrapolava o topo/direita da superfície.
- Depois: popup 640px, SVG 24×24, alvo 40×40, texto acessível somente por
  `aria-label` e controle totalmente contido no dialog.
- A regressão agora é coberta em registry, consumer e browser.

## Validação

- Web e Ark: 640×194px em desktop; React: 640×226px pelo conteúdo próprio.
- Em 390px: as três saídas medem 350px e têm zero overflow horizontal.
- Cada saída expõe close, Cancelar e Aplicar alterações uma única vez.
- Foco inicial, Tab/Shift+Tab, Escape, outside click, controlled state, retorno
  de foco, dark mode e Axe passaram no browser gate.
- Os cinco exemplos estáticos têm `display:flex`, background, padding e radius.

## Evidência visual

- Desktop: `evidence/web-open-2026-08-28.png`,
  `evidence/ark-open-2026-08-28.png`, `evidence/react-open-2026-08-28.png`.
- Mobile: `evidence/web-open-mobile-390-2026-08-28.png`,
  `evidence/ark-open-mobile-390-2026-08-28.png`,
  `evidence/react-open-mobile-390-2026-08-28.png`.
- Astro: `evidence/docs-static-examples-2026-08-28.png`.

## Bloqueado antes de

- Commit, push, PR e release: exigem autorização específica.
