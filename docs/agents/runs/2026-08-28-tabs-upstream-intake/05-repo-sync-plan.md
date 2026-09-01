- Status: Approved

# Plano repo

- Figma aprovado: unchanged with evidence
- Relatorio Figma: `04-figma-audit-report.md`
- Escopo: adapters Ark e React, stories, registry, documentação por tecnologia, consumidor e testes
- Fora de escopo: tokens, CSS/JS Web, Figma, commit, push e release

## Tokens

- Tokens Figma-canônicos: sem mudança
- Tokens CSS-only: sem mudança
- Component tokens: `tokens/component/tabs.json`, sem mudança
- Registry: adicionar receita `tabs`
- Snapshot: atual, sem regeneração porque Figma não muda

## Arquivos previstos

- Tokens: nenhum
- CSS: CSS exclusivo de cada adapter/receita; Web intacto
- Docs: páginas PT-BR/EN para Web, Ark e React; catálogos e mapas
- API/LLM: registry shadcn e metadados vNext; API estável conserva 26 componentes
- CHANGELOG: registrar saída Tabs vNext

## Validacoes

- build:tokens: não deve produzir diff
- sync:docs: não necessário para a saída estável; full suite confirmará integridade
- verify:tokens: obrigatório
- verify:figma-structure: obrigatório via full suite/snapshot atual
- audit:component-tokens: nenhum token novo
- tests: vNext structural, registry, bundle, consumer real, browser, Axe, Pages e full `npm test`

## Bloqueado antes de

- Escrita repo: autorizada para adapters/docs/testes
- Commit: bloqueado
- Push/PR: bloqueados
