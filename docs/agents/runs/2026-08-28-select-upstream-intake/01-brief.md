- Status: Approved

# Brief aprovado

- Nome: Select — paridade entre as três saídas.
- Classe: form control de seleção única, sem entrada de texto.
- Problema: oferecer o Select TIS em HTML/CSS, Ark/Zag e React/shadcn/Base UI sem reconstruir foco, teclado, typeahead e valor de formulário nas saídas React.
- Usar quando: a pessoa precisa escolher exatamente uma opção de uma lista conhecida com cinco ou mais itens.
- Não usar quando: há poucas opções visíveis (Radio), múltipla seleção (Checkbox) ou busca/filtro textual (Combobox).
- Diferenças para componentes próximos: Select escolhe um valor; Menu executa ações; Combobox aceita texto para filtrar.
- Acessibilidade/semântica: Web preserva `<select>` nativo. Adapters seguem o padrão select-only combobox, com label, trigger, listbox, option, typeahead, setas, Home/End, Enter/Space e Escape.
- Composição DS: Form Field + trigger Select + popup/listbox + opções; popup usa somente tokens e linguagem visual existentes.
- Variants/states: `sm`, `md`, `lg`; default, filled, open, error, disabled e readonly documentado como limite do nativo.
- Slots: label, leading icon opcional, value/placeholder, chevron, options e mensagens Form Field.
- Tokens: reutilizar `tokens/component/select.json`, Field, Menu Item, Focus Ring, surface, elevation e z-index existentes. Nenhum token novo.
- Docs Figma: preservar a página `Select` e o componente existente sem escrita.
- Impacto repo: adapter Ark/Zag, recipe React/Base UI, stories, rotas Astro e testes de paridade/performance.
- Fora de escopo: multiple, busca, async, grouping complexo e virtualização; esses recursos pertencem ao Combobox ou exigem contrato próprio.
- Bloqueado antes de: commit, push, PR, release e qualquer escrita Figma.
- Aprovação necessária: satisfeita pela instrução do owner para executar, testar e validar componentes em sequência sem novas esperas.
