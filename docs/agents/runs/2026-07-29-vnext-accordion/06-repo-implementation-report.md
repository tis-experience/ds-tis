# Repo Implementation Report

- Status: Implementado e validado localmente
- Componente: Accordion
- Run: `2026-07-29-vnext-accordion`
- Agent: Repo Component Agent
- Data da última validação: 2026-08-28

## Entrada

- Figma e spec: aprovados na run original; sem escrita nesta rodada.
- Token sync: não aplicável; os 28 tokens `component.accordion.*` existentes
  permanecem como contrato visual.
- Arquitetura: três saídas independentes, com design, tokens e requisitos de
  acessibilidade compartilhados.

## Implementação atual

- Web: `css/components/accordion.css` + `js/accordion.js`, preservados.
- Ark/Zag: `packages/react/src/ark/accordion.jsx`, entrypoint de workspace e
  story pública isolada.
- React: `registry/tis/accordion.tsx`, distribuído como source pelo registry
  shadcn e baseado somente em Base UI.
- Docs: rotas PT-BR/EN para Web, Ark/Zag e React com seletor de saída e preview
  funcional correspondente.

## Contrato validado

- Single/multiple, controlled/uncontrolled e item disabled permanecem
  idiomáticos em cada adapter.
- Trigger nativo, `aria-expanded`, `aria-controls`, Enter/Space, setas,
  Home/End e exclusão de item disabled da navegação foram cobertos.
- As três saídas preservam classes, ícones, borda, conteúdo e estados do DS TIS.
- Nenhuma implementação importa outro provider nem modifica o core Web.

## Validação

- `npm run test:vnext`: passou com os bundles dentro dos budgets.
- `npm run test:vnext:browser`: passou para Web, Ark e React, incluindo teclado,
  estado disabled, troca de saída, 320/390px, dark mode e Axe.
- `npm run test:shadcn-consumer`: passou com 22 componentes instalados.
- Revisão visual: as três saídas medem 860px em viewport de 900px e 350px em
  viewport de 390px, com zero overflow horizontal.

## Evidência visual

- Desktop: `evidence/web-open-2026-08-28.png`,
  `evidence/ark-open-2026-08-28.png`, `evidence/react-open-2026-08-28.png`.
- Mobile 390px: `evidence/web-open-mobile-390-2026-08-28.png`,
  `evidence/ark-open-mobile-390-2026-08-28.png`,
  `evidence/react-open-mobile-390-2026-08-28.png`.

## Bloqueado antes de

- Commit, push, PR e release: exigem autorização específica.
