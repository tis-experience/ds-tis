# Repo Implementation Report

- Status: Implementado e validado localmente
- Componente/padrão: Menu button com comandos, escolhas e estados
- Run: `2026-08-28-menu-upstream-intake`
- Agent: Repo Component Agent
- Data: 2026-08-28

## Entrada

- Figma aprovado: preservado sem escrita; página Menu com `issueCount=0`
- Token sync: não necessário; nenhum token criado ou alterado
- Plano repo: três saídas independentes, com contrato visual e conceitual comum

## Arquivos alterados

- CSS: adapter Ark isolado; CSS Web, tokens gerados e Figma preservados
- Docs: rotas PT-BR/EN para Web, Ark/Zag e React, catálogo e seletor de saída
- API/LLM: catálogo e metadados gerados reconhecem Menu nas três saídas
- Tests: source registry, provider, bundle, consumer, portal, teclado, foco, Axe e Pages
- CHANGELOG: entrada em `[Não publicado]`

## Decisões de implementação

- O Action Menu Web continua usando `ds-tis/menu` e não importa nenhum provider React.
- Ark UI/Zag e Base UI têm source, namespace, dependências e state adapters próprios.
- O foco virtual do Zag é validado por `aria-activedescendant` e `data-highlighted`; Web e Base UI são validados por foco DOM.
- Indicadores não selecionados mantêm a coluna reservada, evitando deslocamento de labels entre estados.
- Submenu, Context Menu, Menubar e Navigation Menu permanecem fora deste contrato.
- Cada adapter é carregado somente quando a saída e o componente são consumidos.

## Validação

- build:tokens: passou sem alteração de valores
- sync:docs: conteúdo manual e gerado alinhado
- verify:tokens: 0 erros, 0 avisos, `VALUE_DRIFT=0`; snapshot Figma com 14h
- registry: 20 itens válidos, incluindo `tis-base` e Menu
- runtime estável: 223 checks; HTML/CSS/JavaScript permaneceu íntegro
- Storybook estável: 26/26 componentes, 93 stories auditadas em desktop/mobile e 27 Docs em dark
- consumer React/Vite: 22 componentes instalados via `@tis`, build, interação e Axe passaram
- portal vNext: Web, Ark e React passaram em teclado, foco, typeahead, Escape, dark mode, 320/390 px e Axe
- Pages: 919 arquivos, 199 páginas HTML e links locais íntegros na última validação integral
- acessibilidade: 108 páginas/modos mais 2 runs do Theme Playground, com 0 violações
- bundle Ark: provider 29,96 KiB, adapter 31,36 KiB e preview 43,50 KiB gzip
- bundle Base UI: provider 45,89 KiB, registry 52,74 KiB e preview 64,29 KiB gzip
- visual: Web, Ark e React comparados com o Menu aberto; Ark e React permaneceram equivalentes, a saída Web preservou o exemplo estável mais simples e as três saídas ficaram sem overflow em 390px

## Evidência visual

- Desktop: `evidence/web-open-2026-08-28.png`, `evidence/ark-open-2026-08-28.png`, `evidence/react-open-2026-08-28.png`
- Mobile 390px: `evidence/web-open-mobile-390-2026-08-28.png`, `evidence/ark-open-mobile-390-2026-08-28.png`, `evidence/react-open-mobile-390-2026-08-28.png`

## Pendências

- Commit, push, PR, publicação e qualquer escrita Figma não foram executados.

## Bloqueado antes de

- Release: requer autorização específica e evidência fresca no momento da publicação
