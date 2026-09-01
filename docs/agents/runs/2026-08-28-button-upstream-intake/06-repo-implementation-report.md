# Repo Implementation Report

- Status: Passed
- Componente/padrão: Button
- Run: `2026-08-28-button-upstream-intake`
- Agent: Repo Component Agent
- Data: 2026-08-28

## Entrada

- Figma aprovado: unchanged with evidence; página `66:2`, root `160:62`
- Token sync: não aplicável; os 99 tokens Component existentes foram preservados
- Plano repo: `05-repo-sync-plan.md`

## Arquivos alterados

- Web: `css/components/button.css`, tokens, markup e runtime permaneceram íntegros
- Source Ark: adapter `packages/react/src/ark/button.jsx`, export `./ark/button` e stories próprias
- Source React: recipe existente `registry/tis/button.tsx` preservada e integrada à documentação unificada
- Docs: rota Ark PT-BR/EN promovida de planejada para beta e seletor com três saídas utilizáveis
- API: manifesto público regenerado com as três saídas coexistentes
- Tests: foundation, intake, registry, bundle, consumidor React/Vite, browser, Pages e acessibilidade
- CHANGELOG: saída Button vNext registrada em `[Não publicado]`

## Decisões de implementação

- Ark UI não publica primitive Button dedicado; o adapter usa `ark.button` da Ark Factory.
- Não há máquina Zag: semântica, Enter, Space, disabled e formulário são responsabilidades do elemento nativo.
- Loading, icon-only, full-width, tamanhos e variantes são composição do DS TIS, sem import da recipe Base UI.
- A saída HTML/CSS e o Figma não foram reescritos.

## Validação

- docs/Storybook: portal com 113 páginas e Storybook vNext compilados
- verify:tokens: passou; 1595 tokens, 0 warnings, 0 errors e `VALUE_DRIFT=0`
- registry: passou; 23 itens e contratos de source/CSS válidos
- bundle Ark: factory 0,87 KiB gzip; adapter 1,34; preview 12,60 — todos abaixo do orçamento
- bundle Base UI: preview 22,29 KiB gzip — abaixo do orçamento de 25 KiB
- consumer: passou com 22 componentes instalados via `@tis`, Vite build, interação e Axe
- browser: passou para Web, Ark e React em desktop, 320/390, light/dark, Enter, Space, click, disabled, loading, formulário, foco, overflow e Axe
- visual: preview Ark corrigido para tamanho natural; Web, Ark e React preservam o mesmo contrato visual; rota Ark íntegra em 320 px
- Pages: 919 arquivos, 199 páginas HTML e links locais íntegros
- acessibilidade global: 108/108 combinações página/tema e Theme Playground 2/2, zero violações

## Pendências

- Commit, push, PR e publicação não executados porque não foram autorizados.

## Bloqueado antes de

- Release: requer autorização explícita do owner; implementação local pronta para revisão após os gates integrais.
