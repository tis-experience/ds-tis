# Repo Implementation Report

- Status: Passed
- Componente/padrão: Toast
- Run: `2026-08-28-toast-upstream-intake`
- Agent: Repo Component Agent
- Data: 2026-08-28

## Entrada

- Figma aprovado: unchanged with evidence; página `10279:2544`, root `10279:2545`
- Token sync: não aplicável; zero token novo e cadeia existente preservada
- Plano repo: `05-repo-sync-plan.md`

## Arquivos alterados

- Web: `css/components/toast.css`, `js/toast.js` e a API pública permaneceram íntegros; `docs/toast.html` recebeu somente landmarks editoriais aditivos
- Source Ark: adapter `packages/react/src/ark/toast.jsx`, CSS de posicionamento, export `./ark/toast` e story própria
- Source React: receita `registry/tis/toast.tsx`, item `@tis/toast` e story própria
- Docs: rotas PT-BR/EN Web, Ark e React; renderer unificado; catálogo e seletor de implementação
- API/LLM: manifesto público atualizado com as três saídas coexistentes
- Tests: foundation, intake, registry, bundle, consumer React/Vite, browser, Pages, runtime Web e acessibilidade
- CHANGELOG: saída Toast vNext registrada em `[Não publicado]`

## Decisões de implementação

- Ark UI/Zag e Base UI mantêm managers, source, stories e dependências independentes; não há import cruzado.
- As duas saídas reproduzem tipos `success`, `warning`, `error` e `info`, estilos `subtle` e `solid`, action, close, limite de cinco mensagens e visual Web/Figma pelos tokens Toast existentes.
- A action executa o callback uma vez e não dispensa a mensagem; close e API de dismiss encerram o Toast explicitamente.
- O adapter Base UI sobrescreve o `aria-hidden` interno do Root de alta prioridade e do Close. Na versão 1.6.0, o primitive ocultava elementos ainda focáveis, causando `aria-hidden-focus`; a correção preserva prioridade e interação sem alterar o visual.
- O z-index Ark permanece no grupo gerenciado pelo Zag; o posicionamento de máquina não é substituído por style inline.
- A saída Web HTML/CSS/JS e o Figma não foram reescritos.

## Validação

- build:tokens: nenhuma mudança de token; coberto pela verificação integral
- docs/Storybook: portal com 101 páginas e Storybook vNext compilados para o artefato servido
- verify:tokens: passou; 1595 tokens, 0 warnings, 0 errors e `VALUE_DRIFT=0`
- verify:registry: passou; 23 itens e contratos de source/CSS válidos
- bundle Ark: primitive 12,70 KiB gzip; adapter 13,89; preview 25,77 — todos abaixo do orçamento
- bundle Base UI: primitive 24,17 KiB gzip; registry 22,42; preview 33,68 — todos abaixo do orçamento
- consumer: passou com 22 componentes instalados via `@tis`, Vite build, interação e Axe
- browser: passou para Web, Ark e React em desktop, 320/390, light/dark, ação única, close, limite, overflow e Axe
- visual: Ark e React equivalentes ao Toast TIS; largura máxima de 480 px em desktop e redução íntegra em 320 px
- Web runtime: passou 18 checks; HTML/CSS/JS estável preservado
- Pages: 883 arquivos, 187 páginas HTML e links locais íntegros
- acessibilidade global: 108/108 combinações página/tema e Theme Playground 2/2, zero violações

## Pendências

- Commit, push, PR e publicação não executados porque não foram autorizados.

## Bloqueado antes de

- Release: requer autorização explícita do owner; implementação local pronta para revisão após os gates integrais.
