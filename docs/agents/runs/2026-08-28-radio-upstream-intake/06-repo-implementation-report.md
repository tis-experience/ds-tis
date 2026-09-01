# Repo Implementation Report

- Status: Passed
- Componente/padrão: Radio
- Run: `2026-08-28-radio-upstream-intake`
- Agent: Repo Component Agent
- Data: 2026-08-28

## Entrada

- Figma aprovado: unchanged with evidence; página `136:2`, root `137:2`
- Token sync: não aplicável; os 38 tokens Component existentes foram preservados
- Plano repo: `05-repo-sync-plan.md`

## Arquivos alterados

- Web: `css/components/radio.css`, tokens e API pública permaneceram íntegros; `docs/radio.html` recebeu somente landmarks editoriais aditivos
- Source Ark: adapter `packages/react/src/ark/radio.jsx`, CSS isolado, export `./ark/radio` e story própria
- Source React: recipe existente `registry/tis/radio-group.tsx` preservada e integrada à documentação unificada
- Docs: rotas PT-BR/EN Web, Ark e React; catálogo e seletor de implementação
- API: manifesto público regenerado com as três saídas coexistentes
- Tests: foundation, intake, registry, bundle, consumidor React/Vite, browser, Pages e acessibilidade
- CHANGELOG: saída Radio vNext registrada em `[Não publicado]`

## Decisões de implementação

- Ark UI/Zag e Base UI mantêm source, dependências, instalação e stories independentes; não há import cruzado.
- O adapter Ark preserva ItemHiddenInput e mapeia estados Zag para o contrato visual tokenizado do Radio TIS.
- Seleção exclusiva, setas, Space, disabled, invalid, foco e submissão de formulário são exercitados em browser real.
- A saída HTML/CSS e o Figma não foram reescritos.

## Validação

- docs/Storybook: portal com 109 páginas e Storybook vNext compilados
- verify:tokens: passou; 1595 tokens, 0 warnings, 0 errors e `VALUE_DRIFT=0`
- registry: passou; 23 itens e contratos de source/CSS válidos
- bundle Ark: primitive 9,61 KiB gzip; adapter 10,33; preview 21,21 — todos abaixo do orçamento
- bundle Base UI: preview 28,15 KiB gzip — abaixo do orçamento de 30 KiB
- consumer: passou com 22 componentes instalados via `@tis`, Vite build, interação e Axe
- browser: passou para Web, Ark e React em desktop, 320/390, light/dark, setas, geometria, foco, formulário, overflow e Axe
- visual: Web, Ark e React equivalentes no exemplo comparável; rota Ark íntegra em 320 px
- Pages: 907 arquivos, 195 páginas HTML e links locais íntegros
- acessibilidade global: 108/108 combinações página/tema e Theme Playground 2/2, zero violações

## Pendências

- Commit, push, PR e publicação não executados porque não foram autorizados.

## Bloqueado antes de

- Release: requer autorização explícita do owner; implementação local pronta para revisão após os gates integrais.
