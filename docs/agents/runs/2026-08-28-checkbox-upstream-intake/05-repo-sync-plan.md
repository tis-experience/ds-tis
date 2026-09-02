- Status: Approved

# Plano repo

- Figma: unchanged with evidence
- Escopo: adapter Ark, story, export, mapa, docs por tecnologia e testes
- Fora de escopo: tokens, CSS/JS Web, Figma, commit, push e release

## Decisão

- Ark usa `Checkbox.Root`, `Control`, `Indicator`, `Label` e `HiddenInput`.
- O adapter traduz os estados Zag `data-state`, `data-hover`, `data-focus-visible`, `data-disabled` e `data-invalid` para o visual tokenizado já usado pelo Checkbox TIS.
- Web, Ark e React mantêm source e dependências independentes; apenas tokens, linguagem visual e contrato conceitual são compartilhados.
- O input nativo oculto do Ark preserva name, value, required e envio de formulário.

## Validação

- `verify:tokens`, intake, registry/typecheck, bundle, browser, Storybook, Pages e Axe.
- Release permanece pendente de autorização explícita.
