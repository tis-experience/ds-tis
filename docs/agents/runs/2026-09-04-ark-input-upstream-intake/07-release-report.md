- Status: Integrado; rotas públicas verificadas

# Release Report

- Escopo: saída Ark/Zag do Input Text.
- Branch: `codex/ark-input`.
- Commit de implementação: `8897f55`; PR #68 integrada como `b34beff`.
- GitHub Pages publicado. Em 2026-09-05, as rotas PT-BR/EN de Input Ark
  responderam HTTP 200 e referenciaram `ark-input--playground`; o índice público
  de Storybook também continha a story. Esse check não é uma nova auditoria
  visual ou uma release npm.

## Gates locais

- Build Astro/Storybooks: passou.
- Browser/Axe global: passou.
- Bundle: passou.
- Tokens: 1.595, zero erros; Figma não verificado neste worktree sem snapshot.
- Consumidores: registry com 22 componentes e tarball com 70 checks passaram.
- Artefato Pages: 1.282 arquivos, 250 páginas HTML, links íntegros.
- Acessibilidade Web: 108 runs, zero violações.

## Proteções

- Sem mudança em Figma, tokens ou CSS Web.
- Sem imports entre Ark, React/Base UI e Angular.
- Matriz fixa de quatro saídas preservada.
