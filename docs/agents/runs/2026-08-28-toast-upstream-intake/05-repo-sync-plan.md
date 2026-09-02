- Status: Approved

# Plano repo

- Figma: unchanged with evidence
- Escopo: adapters Ark e React, stories, registry, docs por tecnologia, consumer e testes
- Fora de escopo: tokens, CSS/JS Web, Figma, commit, push e release

## Decisão

- Expor `showToast`/`dismissToast` em cada saída para manter o contrato conceitual do Web.
- Ark usa `createToaster`/`Toaster`; React usa `createToastManager`/Provider/Viewport.
- Source, dependências e manager permanecem independentes; apenas tokens, classes públicas e semântica são compartilhados.
- Tipos, estilos, prioridade, close, action, duração e limite devem produzir a mesma experiência TIS.

## Validação

- `verify:tokens`, intake, registry/typecheck, bundle, consumer real, browser, Storybook, Pages e Axe.
- Release permanece pendente de autorização explícita.
