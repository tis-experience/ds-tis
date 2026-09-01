- Status: Not requested

# Release Report

- Escopo: Tooltip nas três saídas locais
- Branch: `codex/angular`
- Commit/PR: não executado
- Publicacao: não executada

## Comandos rodados

- `npm run verify:tokens`
- `npm run test:vnext:bundle`
- `npm run test:shadcn-registry`
- `npm run test:shadcn-consumer`
- `npm run test:vnext:browser`
- `npm test` até o gate de Pages; expectativa do manifesto corrigida e gates restantes repetidos isoladamente
- `node scripts/test-pages-artifact.mjs`
- `npm run test:a11y`
- `npm run test:a11y:theme-playground`

## Resultado

- build: passou para Astro, Storybook estável, Storybook vNext, registry e consumer
- verify:tokens: passou, zero drift/erro/warning
- verify:registry: passou, 21 itens
- verify:figma-structure: estado atual preservado; nenhuma escrita Figma
- tests: passaram nos gates direcionados e integrais descritos em `06-repo-implementation-report.md`
- CI: não executada
- prod: não publicada

## Diff

- Arquivos alterados: registrados em `06-repo-implementation-report.md`; worktree já continha mudanças de componentes anteriores
- Mudancas fora do escopo: nenhuma mudança intencional em tokens, CSS/JS Web ou Figma

## Pendencias

- Gate de release permanece pendente até autorização explícita para commit/PR/publicação.
