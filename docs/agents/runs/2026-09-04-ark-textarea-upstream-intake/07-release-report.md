# Release

- Branch: `codex/ark-textarea`.
- PR: #69; commit de implementação `e2b50d3`.
- Base atualizada para main após o merge do Input #68 (`b34beff`). O merge de histórico `405b578` preserva exatamente a árvore já validada de Textarea.
- CI da revisão `fff9ec6` concluído com sucesso: build, Node 22/24 e verify.
- Em 2026-09-05, a branch foi combinada com `main` em `a90c542`, preservando
  Avatar, Breadcrumb, Pagination e Table React. Os conflitos foram restritos
  ao changelog e documentos derivados, regenerados das fontes combinadas.
- Revisão independente dos adapters Textarea e Alert: nenhum bloqueador
  funcional identificado em source, API, stories, testes e screenshots
  persistidos. Não substitui inspeção de Figma vivo.

## Verificação da base combinada — 2026-09-05

- `build:tokens`, `sync:docs`, `build:api`, `build:llms`: exit 0.
- `verify:tokens`: 1.595 tokens, zero erros/avisos; comparação Figma ignorada
  por snapshot ausente. O relatório JSON mantém esse resultado real.
- `build:shadcn-registry`, build do portal e Storybook vNext: exit 0.
- `test:vnext` e `test:vnext:browser`: exit 0; temas, navegação, responsividade
  320/390 e Axe verificados na base combinada.
- Consumer Web: tarball instalado, 70 verificações, exit 0.
- Consumer React: 26 componentes instalados, Vite build, interação e Axe, exit 0.
- Artefato Pages: 1.318 arquivos, 260 HTMLs, links locais íntegros, exit 0.
- Nenhuma alteração em `css/`, `js/` ou `tokens/` contra a base integrada.
- Merge da PR e verificação pública desta revisão ainda pendentes; a atualização
  exige novamente CI verde. Nenhum bump ou publicação npm realizado.
