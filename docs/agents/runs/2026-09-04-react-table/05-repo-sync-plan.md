- Status: Approved

# Plano repo

- Figma aprovado: unchanged
- Relatorio Figma: `04-figma-audit-report.md`
- Escopo: adicionar Table à saída React/source-first do registry shadcn.
- Fora de escopo: tokens, CSS Web, Figma, Ark/Zag e Angular.

## Tokens

- Tokens Figma-canônicos: sem alteração
- Tokens CSS-only: sem alteração
- Component tokens: reutilizar `tokens/component/table.json`
- Registry: novo item `table`
- Snapshot: não regenerar; nenhuma alteração Figma

## Arquivos previstos

- Tokens: nenhum
- CSS: nenhum no core Web; registry usa as classes existentes
- Docs: catálogo React bilíngue e Storybook
- API/LLM: derivados pelo pipeline canônico
- CHANGELOG: entrada em `[Não publicado]`

## Validacoes

- build:tokens: obrigatório
- sync:docs: obrigatório
- verify:tokens: obrigatório
- verify:figma-structure:
- audit:component-tokens:
- tests: registry, consumer real, vNext, browser e Axe

## Bloqueado antes de

- Escrita repo: autorizada para esta saída React
- Commit: autorizado
- Push/PR: autorizado
