# Release

- Branch: `codex/ark-alert`; PR #70 sobre Textarea #69.
- Implementação: `57d641d`; revisão anterior `0338ec8` com build, Node 22/24
  e verify verdes no GitHub.
- Em 2026-09-05, combinada com Textarea `f1959d7`, que inclui `main` em
  `a90c542` e os 26 componentes React. Nenhuma alteração no adapter Alert
  durante essa atualização; derivados regenerados para refletir as duas saídas.
- Revisão independente: source, API, stories, testes, logs CI e screenshots
  sem bloqueadores funcionais. Não foi feita leitura viva de Figma.

## Gates da base combinada — 2026-09-05

- Build de tokens e geração docs/API/LLMs: exit 0.
- `verify:tokens`: 1.595 tokens, zero erros/avisos, Figma SKIP por snapshot
  ausente. O relatório preserva esse limite.
- Build Astro/Storybook vNext e `test:vnext`: exit 0.
- `test:vnext:browser`: exit 0; quatro rotas Alert, ação, fechamento por Enter,
  retorno de foco, reabertura, quatro tons em dois estilos, light/dark,
  320/390 px, Axe e regressão geral do portal/Storybook.
- Artefato Pages: 1.323 arquivos, 262 HTMLs, links locais íntegros, exit 0.
- Sem diff em `css/`, `js/` ou `tokens/` contra Textarea consolidada.
- Pendentes: CI da nova revisão, integração de Textarea, troca da base desta
  PR para `main`, merge e validação pública. Sem bump ou publicação npm.
