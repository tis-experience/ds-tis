- Status: Approved

# Plano repo

- Figma aprovado: unchanged
- Relatório Figma: `04-figma-audit-report.md`
- Escopo: adapters Ark/Zag e React/Base UI, Storybook, portal, catálogos, consumidor e testes
- Fora de escopo: Web core, Figma, tokens, submenu, context menu, menubar e release

## Tokens

- Tokens Figma-canônicos: sem alteração
- Tokens CSS-only: sem alteração
- Component tokens: reutilizar `tokens/component/menu.json` e `action-menu.json`
- Registry: adicionar apenas o item shadcn `menu`
- Snapshot: `.figma-snapshot.json` de 2026-08-28T08:35:08.535Z

## Arquivos previstos

- Tokens: nenhum arquivo
- CSS: adapter Ark isolado; provider React em registry styles; core `menu.css` preservado
- Docs: MDX PT-BR/EN para Web, Ark e React; HTML Web apenas anotação documental se necessária
- API/LLM: regenerar após catálogo de tecnologia
- CHANGELOG: entrada em `[Não publicado]` após validação

## Validacoes

- build:tokens: dentro do pipeline integral
- sync:docs: regenerar catálogos
- verify:tokens: obrigatório
- verify:figma-structure: não aplicável sem snapshot novo/escrita Figma
- audit:component-tokens: não aplicável sem tokens novos
- tests: vNext, registry, consumer, Storybook, browser, Axe, bundle e `npm test`

## Bloqueado antes de

- Escrita repo: autorizada para o escopo acima
- Commit: bloqueado
- Push/PR: bloqueado
