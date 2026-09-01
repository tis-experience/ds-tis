# Repo Implementation Report

- Status: Passed
- Componente/padrão: Tabs
- Run: `2026-08-28-tabs-upstream-intake`
- Agent: Repo Component Agent
- Data: 2026-08-28

## Entrada

- Figma aprovado: unchanged with evidence; página `192:2`, root `194:94`
- Token sync: não aplicável; zero token novo e cadeia existente preservada
- Plano repo: `05-repo-sync-plan.md`

## Arquivos alterados

- CSS: Web estável preservado em `css/components/tabs.css`; Ark e React adicionam isolamento responsivo para labels sem quebra e overflow horizontal local
- Source: adapter `packages/react/src/ark/tabs.jsx` + `tabs.css`, export `./ark/tabs` e receita `registry/tis/tabs.tsx`
- Stories: `packages/react/src/stories/ark-tabs.stories.jsx` e `packages/react/src/stories/tabs.stories.jsx`
- Docs: rotas PT-BR/EN Web, Ark e React; renderer unificado; catálogo e mapa de implementações; landmarks editoriais aditivos em `docs/tabs.html`
- API/LLM: item `tabs` no registry shadcn, manifesto público e metadados vNext; catálogo Web permanece com 26 componentes
- Tests: foundation, registry, bundle, consumer React/Vite, browser, Pages e acessibilidade
- CHANGELOG: saída Tabs vNext registrada em `[Não publicado]`

## Decisões de implementação

- Ark UI/Zag e Base UI mantêm source, stories e dependências independentes; não há import cruzado.
- As duas saídas reproduzem a anatomia e o visual do Web/Figma pelos tokens Tabs existentes.
- O contrato público permanece horizontal e usa ativação automática, roving tabindex, ArrowLeft/Right, Home/End e sincronização por `aria-controls`/`aria-labelledby`.
- O Base UI 1.6.0 expõe o item disabled por `aria-disabled`/`data-disabled`, mas sua lista interna não o exclui de End. A receita TIS filtra tabs disabled no teclado para manter paridade com Web e Ark.
- O indicator animado dos providers não foi adotado porque o contrato TIS usa a borda inferior da tab ativa.
- Labels de 1–2 palavras permanecem em uma linha; quando o conjunto não couber, o scroll fica no tablist em vez de deformar a tab ou causar overflow da página.
- A saída Web HTML/CSS/JS e o Figma não foram reescritos.

## Validação

- build:tokens: nenhuma mudança de token; coberto pela verificação integral
- sync:docs: API e portal Astro gerados; 95 páginas no portal vNext
- verify:tokens: passou; 1595 tokens, 0 warnings, 0 errors e `VALUE_DRIFT=0`
- verify:registry: passou; 22 itens, typecheck estrito e contratos de source/CSS válidos
- bundle: Ark 11,21 KiB gzip; adapter Ark 11,54; preview Ark 22,03; Base UI 11,33; registry React 18,31; preview React 28,13 — todos abaixo do orçamento
- consumer: passou com 22 componentes instalados via `@tis`, Vite build, teclado e Axe
- browser: passou para Web, Ark e React em desktop, 320/390, light/dark, teclado e Axe
- Storybook estável: 93 stories; desktop/mobile, 27 Docs dark, Axe sem violações critical/serious e 7 runtimes funcionais
- Pages: 919 arquivos, 199 páginas HTML e links locais íntegros na última validação integral
- acessibilidade global: 108/108 combinações página/tema e Theme Playground 2/2, zero violações
- visual: comparação desktop e 320px registrada; Ark e React ficaram equivalentes, com labels de 46px de altura, `nowrap` e overflow da página igual a zero

## Evidência visual

- Desktop: `evidence/web-2026-08-28.png`, `evidence/ark-2026-08-28.png`, `evidence/react-2026-08-28.png`
- Mobile 320px: `evidence/web-mobile-320-2026-08-28.png`, `evidence/ark-mobile-320-2026-08-28.png`, `evidence/react-mobile-320-2026-08-28.png`

## Pendências

- Commit, push, PR e publicação não executados porque não foram autorizados.

## Bloqueado antes de

- Release: requer autorização explícita do owner; implementação local fica pronta para revisão após os gates integrais.
