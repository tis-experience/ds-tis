- Status: Approved

# Plano repo

- Figma aprovado: preservado sem escrita
- Relatório Figma: `04-figma-audit-report.md`
- Escopo: três saídas independentes de Select e documentação selecionável
- Fora de escopo: mudança Web visual/estrutural, tokens, Figma, multiple, busca, async e virtualização

## Tokens

- Tokens Figma-canônicos: sem alteração
- Tokens CSS-only: sem alteração
- Component tokens: reutilizar `tokens/component/select.json`
- Registry: adicionar item React `select` sem mudar o core Web
- Snapshot: atual e sem `VALUE_DRIFT`; não regenerar sem escrita Figma

## Arquivos previstos

- Tokens: nenhum
- CSS: apenas estilos complementares dos adapters, consumindo tokens existentes
- Docs: rotas PT-BR/EN Web, Ark e React; conteúdo canônico de `docs/select.html`
- API/LLM: gerar catálogo e metadados de disponibilidade
- CHANGELOG: registrar em `[Não publicado]`

## Validacoes

- build:tokens: confirmar derivação inalterada
- sync:docs: regenerar inventários
- verify:tokens: obrigatório
- verify:figma-structure: não aplicável sem snapshot novo
- audit:component-tokens: não aplicável sem token novo
- tests: Storybook, browser desktop/mobile, teclado/typeahead, Axe, consumidor e bundle

## Bloqueado antes de

- Escrita repo: autorizada para o escopo descrito
- Commit: bloqueado
- Push/PR: bloqueado
