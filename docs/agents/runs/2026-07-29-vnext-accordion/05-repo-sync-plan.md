- Status: Aprovado — sem sincronização de tokens

# Plano repo

- Figma aprovado: Sim, pelo owner em 2026-07-30.
- Relatorio Figma: `04-figma-audit-report.md`
- Escopo: consumir no portal Astro os contratos e artefatos já existentes no
  repositório, preparando o caminho para documentar Accordion por tecnologia.
- Fora de escopo: alterar o component set original, criar tokens, ressincronizar
  valores Figma-canônicos ou publicar uma API React antes do gate de repo.

## Tokens

- Tokens Figma-canônicos: nenhuma alteração.
- Tokens CSS-only: nenhuma alteração.
- Component tokens: nenhuma alteração.
- Registry: nenhuma alteração.
- Snapshot: não precisa ser regenerado; o draft vNext reutiliza instâncias
  publicadas e não altera a biblioteca original.

## Arquivos previstos

- Tokens: nenhum.
- CSS: apenas integração do CSS público existente no portal Astro, sem alterar
  contratos visuais do componente.
- Docs: adaptador Astro para consumir `docs/api/components.json` e as seções
  bilíngues das páginas HTML existentes, eliminando conteúdo compartilhado
  duplicado nos MDX por tecnologia.
- API/LLM: sem mudança de contrato nesta etapa; a necessidade de ampliar a API
  será decidida somente se a auditoria comprovar lacuna real.
- CHANGELOG: atualizar em `[Não publicado]` se a mudança se tornar observável
  para consumidores.

## Validacoes

- build:tokens: não aplicável, sem alteração de tokens.
- sync:docs: executar se algum gerado compartilhado for afetado.
- verify:tokens: obrigatório antes de encerrar o gate de repo.
- verify:figma-structure: não aplicável, sem edição da biblioteca original ou
  regeneração do snapshot.
- audit:component-tokens: não aplicável, sem criação/remoção de Component tokens.
- tests: `npm run test:vnext`, build do portal, validação Browser/IAB em desktop
  e mobile e auditoria independente.

## Bloqueado antes de

- Escrita repo: liberada pelo owner para o gate imediatamente apresentado.
- Commit: bloqueado até validações e revisão final; exige autorização específica.
- Push/PR: bloqueado até autorização específica do owner.
