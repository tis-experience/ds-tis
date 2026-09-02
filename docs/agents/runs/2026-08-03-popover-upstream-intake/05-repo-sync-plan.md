# Plano repo

- Figma: aprovado sem mudança
- Relatórios: `03-figma-build-report.md` e `04-figma-audit-report.md`
- Escopo: preservar HTML/CSS/JS; implementar Popover Ark/Zag e React/shadcn/Base UI separadamente; documentar a escolha entre as três saídas.
- Fora de escopo: escrita no Figma, tokens novos, substituição do Web core, fusão de providers, commit, push e release.

## Tokens

- Figma-canônicos: nenhuma mudança
- CSS-only: nenhuma mudança
- Component: reutilizar `tokens/component/popover.json` sem alteração
- Snapshot: não regenerar, pois não houve mudança Figma-canônica

## Arquivos previstos

- Ark/Zag: adapter e Storybook próprios
- React: source do registry e Storybook próprios, usando Base UI
- CSS: preservar `css/components/popover.css`; extensões de posicionamento devem consumir os tokens existentes
- Docs/API/LLM: rotas, metadados e disponibilidade por saída
- CHANGELOG: entrada em `[Não publicado]`

## Validações

- `build:all`, `verify:tokens`, contratos do registry e intake
- consumers reais, browser, Axe e bundle para cada implementação nova
- seletor documental nas três rotas do Popover

## Bloqueios

- Escrita no repo: autorizada em 2026-08-03 no escopo acima
- Commit, push e PR: bloqueados
