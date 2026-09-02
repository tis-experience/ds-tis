# Repo Implementation Report

- Status: Implementado e validado localmente
- Componente/padrão: Combobox single-select com filtro local
- Run: `2026-08-28-combobox-upstream-intake`
- Agent: Repo Component Agent
- Data: 2026-08-28

## Entrada

- Figma aprovado: preservado sem escrita; snapshot sem `VALUE_DRIFT`
- Token sync: não necessário; nenhum token criado ou alterado
- Plano repo: três saídas independentes, com contrato visual e conceitual comum

## Arquivos alterados

- CSS: hardening Web e estilos isolados Ark; sem alterar tokens gerados
- Docs: rotas PT-BR/EN para Web, Ark/Zag e React, com seletor de saída
- API/LLM: catálogo e metadados gerados reconhecem as três implementações
- Tests: lifecycle, docs, Storybook, portal, consumidor, Axe e bundle
- CHANGELOG: entrada em `[Não publicado]`

## Decisões de implementação

- Web mantém HTML/CSS/JS e corrige apenas comportamento já contratado.
- Ark UI/Zag e Base UI não têm imports cruzados.
- Multiple, creatable, remoto, grouping e virtualização permanecem fora do contrato.
- Cada adapter é carregado somente quando a saída/componente é consumida.

## Validação

- build:tokens: sem mudança de tokens; verificação JSON/CSS passou
- sync:docs: conteúdo manual e gerado alinhado
- verify:tokens: 0 erros, 0 avisos, `VALUE_DRIFT=0`
- verify:registry: 18 itens válidos; Combobox incluído
- tests: browser vNext passou nas três saídas, incluindo filtro, seleção, clear, opção disabled, Escape, foco e Axe
- consumidor: 22 componentes instalados via `@tis`, build Vite, interação e Axe
- bundle: Ark adapter 32,03 KiB gzip; preview Ark 43,94 KiB; Base registry 50,17 KiB; preview Base 61,45 KiB, todos abaixo dos gates
- visual: exemplos fechados e abertos comparados em 900px; indicador obrigatório alinhado em Web, Ark e React; rota Ark revisada em 320px sem overflow

## Evidência visual

- `evidence/web-open-2026-08-28.png`
- `evidence/ark-open-2026-08-28.png`
- `evidence/react-open-2026-08-28.png`

## Pendências

- Commit, push, PR, publicação e qualquer escrita Figma não foram executados.

## Bloqueado antes de

- Release: requer autorização específica e evidência fresca no momento da publicação
