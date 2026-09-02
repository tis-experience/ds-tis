# Repo Implementation Report

- Status: Passed
- Componente/padrão: Tooltip
- Run: `2026-08-28-tooltip-upstream-intake`
- Agent: Repo Component Agent
- Data: 2026-08-28

## Entrada

- Figma aprovado: unchanged with evidence; página `191:2`, root `194:39`
- Token sync: não aplicável; zero token novo e `verify:tokens` sem drift
- Plano repo: `05-repo-sync-plan.md`

## Arquivos alterados

- CSS: `packages/react/src/ark/tooltip.css`; CSS da receita em `registry.json`
- Source: `packages/react/src/ark/tooltip.jsx`, export `./ark/tooltip` e `registry/tis/tooltip.tsx`
- Stories: `packages/react/src/stories/ark-tooltip.stories.jsx` e `packages/react/src/stories/tooltip.stories.jsx`
- Docs: rotas PT-BR/EN Web, Ark e React; renderer unificado; catálogo e mapa de implementações; metadados editoriais aditivos em `docs/tooltip.html`
- API/LLM: item `tooltip` no registry shadcn, manifesto público e metadados vNext; catálogo Web permanece com 26 componentes
- Tests: foundation, registry, bundle, consumer React/Vite, browser, Pages e acessibilidade global
- CHANGELOG: saída Tooltip vNext registrada em `[Não publicado]`

## Decisões de implementação

- Ark UI/Zag e Base UI mantêm source, CSS, stories e dependências independentes; não há import cruzado.
- As duas saídas reproduzem o contrato visual Web/Figma por tokens Tooltip existentes.
- `role="tooltip"`, `id` e `aria-describedby` são explícitos na receita Base UI porque o primitive não os expôs no DOM final durante a verificação.
- Delays padrão de abertura/fechamento permanecem em 100 ms; conteúdo é hoverable; Escape fecha sem mover o foco.
- A seta Ark recebe `--arrow-size` e `--arrow-background` por tokens para evitar dimensões nulas no Positioner.
- A documentação React usa o mesmo renderer unificado das outras implementações completas.

## Validação

- build:tokens: coberto pela suíte; nenhuma mudança de token
- sync:docs: build Astro passou com 89 páginas
- verify:tokens: passou; 1595 tokens, 0 warnings, 0 errors e `VALUE_DRIFT=0`
- verify:registry: passou; 21 itens e manifest íntegro
- bundle: Ark 19,88 KiB gzip; adapter Ark 20,42; preview Ark 31,97; Base UI 30,63; registry React 37,49; preview React 48,40 — todos abaixo do orçamento
- consumer: passou com 22 componentes React instalados via `@tis`, Vite build, interação e Axe
- browser: passou para Web, Ark e React em desktop, 320/390, light/dark, teclado e Axe
- Storybook estável: 93 stories; 26/26 componentes; desktop/mobile e Axe sem violações critical/serious
- Pages: 919 arquivos, 199 páginas HTML e links locais íntegros na última validação integral
- acessibilidade global: 108/108 combinações página/tema e Theme Playground 2/2, zero violações
- visual: Ark e React ficaram equivalentes; todas as saídas mantêm 36px de altura no tooltip, focus ring no trigger, seta, `aria-describedby`, Escape e zero overflow em desktop/390px

## Evidência visual

- Desktop: `evidence/web-focus-2026-08-28.png`, `evidence/ark-focus-2026-08-28.png`, `evidence/react-focus-2026-08-28.png`
- Mobile 390px: `evidence/web-focus-mobile-390-2026-08-28.png`, `evidence/ark-focus-mobile-390-2026-08-28.png`, `evidence/react-focus-mobile-390-2026-08-28.png`

## Pendências

- Commit, push, PR e publicação não executados porque não foram autorizados.

## Bloqueado antes de

- Release: requer autorização explícita do owner; implementação local está pronta para revisão.
