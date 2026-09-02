# Repo Implementation Report

- Status: Implementado e validado localmente
- Componente/padrão: Select single-value sem filtro
- Run: `2026-08-28-select-upstream-intake`
- Agent: Repo Component Agent
- Data: 2026-08-28

## Entrada

- Figma aprovado: preservado sem escrita; página Select com `issueCount=0`
- Token sync: não necessário; nenhum token criado ou alterado
- Plano repo: três saídas independentes, com contrato visual e conceitual comum

## Arquivos alterados

- CSS: estilos isolados do adapter Ark; CSS Web e tokens gerados preservados
- Docs: rotas PT-BR/EN para Web, Ark/Zag e React, com seletor de saída
- API/LLM: catálogo e metadados gerados reconhecem as três implementações
- Tests: formulário, teclado, typeahead, disabled, Storybook, portal, consumidor, Axe e bundle
- CHANGELOG: entrada em `[Não publicado]`

## Decisões de implementação

- Web continua usando o elemento `<select>` nativo, sem runtime adicional.
- Ark UI/Zag e Base UI não têm imports nem seletores internos compartilhados.
- A lista Ark usa os itens diretamente no `listbox`, preservando a estrutura ARIA esperada.
- Multiple, filtro, remoto, grouping e virtualização permanecem fora do contrato.
- Cada adapter é carregado somente quando a saída/componente é consumida.

## Validação

- build:tokens: sem mudança de tokens; verificação JSON/CSS passou
- sync:docs: conteúdo manual e gerado alinhado
- verify:tokens: 0 erros, 0 avisos, `VALUE_DRIFT=0`
- verify:registry: 19 itens válidos; Select incluído
- tests: Web 223 checks; Storybook, consumidor, Axe e browser vNext passaram
- browser: três saídas validadas em desktop, 320/390 px, light/dark e teclado
- bundle: Ark adapter 31,55 KiB gzip; Base registry 48,44 KiB gzip, ambos abaixo dos gates
- consumer React/Vite: 22 componentes instalados via `@tis`, build, interação e Axe
- suite integral: 919 arquivos Pages, 199 páginas HTML e 108 execuções Axe sem violações na última validação integral
- visual: triggers medem 480×40px em desktop e 350×40px em 390px nas três saídas; Ark e React têm popup equivalente, opção disabled e zero overflow; indicador obrigatório alinhado ao Web

## Evidência visual

- Desktop: `evidence/web-open-2026-08-28.png`, `evidence/ark-open-2026-08-28.png`, `evidence/react-open-2026-08-28.png`
- Mobile 390px: `evidence/web-open-mobile-390-2026-08-28.png`, `evidence/ark-open-mobile-390-2026-08-28.png`, `evidence/react-open-mobile-390-2026-08-28.png`

## Pendências

- Commit, push, PR, publicação e qualquer escrita Figma não foram executados.

## Bloqueado antes de

- Release: requer autorização específica e evidência fresca no momento da publicação
