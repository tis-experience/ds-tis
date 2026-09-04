- Status: Approved

# Brief — React Table

- Nome: Table
- Classe: content-structure / data table semântica
- Problema: expor o Table existente do DS TIS na saída React distribuída por shadcn, sem misturar implementações.
- Usar quando: os dados têm colunas estáveis e precisam ser comparados entre linhas.
- Não usar quando: o conteúdo é uma lista simples, layout visual ou planilha editável com navegação de grid.
- Diferenças para componentes próximos: Table preserva semântica tabular; Data Table será uma composição de Table com ordenação, filtros, paginação e estado de dados.
- Acessibilidade/semântica: HTML table nativo, caption, scope, aria-sort no th ordenável e button dentro do th; região focável e nomeada quando houver overflow horizontal.
- Composição DS: Badge e Button podem ser usados dentro das células sem criar dependência interna obrigatória.
- Variants/states: size sm/md, fixed, nowrap e selected por row.
- Slots: Table, Header, Body, Footer, Row, Head, Cell, Caption, CellContent, SortButton.
- Tokens: contrato existente em `tokens/component/table.json`; nenhuma alteração.
- Docs Figma: inalteradas.
- Impacto repo: registry React, Storybook, catálogo bilíngue, consumidor real e validações.
- Fora de escopo: Figma, tokens, CSS Web, Ark/Zag e Angular.
- Aprovação: owner autorizou execução contínua, commit, push, PR, merge e validação pública em 2026-09-04.
