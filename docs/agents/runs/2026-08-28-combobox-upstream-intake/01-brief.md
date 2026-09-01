- Status: Approved

# Brief aprovado

- Nome: Combobox — paridade entre as três saídas.
- Classe: form control editável com popup `listbox`.
- Problema: disponibilizar o Combobox TIS em HTML/CSS/JS, Ark/Zag e
  React/shadcn/Base UI sem reconstruir teclado, foco e seleção em cada saída.
- Usar quando: a pessoa precisa filtrar e selecionar uma opção em um conjunto extenso.
- Não usar quando: há poucas opções estáticas; preferir Select ou Radio.
- Diferenças: Select não aceita busca textual livre; Menu representa ações e não
  um valor de formulário.
- Acessibilidade: manter foco DOM no input, `role="combobox"`, popup `listbox`,
  `aria-expanded`, `aria-controls`, `aria-activedescendant`, Arrow Up/Down,
  Enter e Escape.
- Composição DS: usar Form Field para label, helper e erro; preservar input,
  leading icon, clear, chevron, listbox e options existentes.
- Variants/states: `sm`, `md`, `lg`; default, filled, open, error, disabled e readonly.
- API inicial: single-select, filtro local, controlled/uncontrolled, clear e
  opções desabilitadas.
- Fora desta rodada: multiple select, creatable, busca remota, grouping e
  virtualização. Esses recursos exigem contrato visual próprio.
- Tokens: reutilizar `tokens/component/combobox.json`, Field, Select, Menu Item e
  Focus Ring. Nenhum token novo.
- Figma: sem mudança. O contrato agnóstico já está refletido no snapshot e no repositório.
- Impacto repo: corrigir o clear Web, criar adapter Ark/Zag, recipe React/Base UI,
  stories, rotas documentais e testes de paridade.

## Aprovação

Em 2026-08-28 o owner autorizou executar, testar e validar visualmente cada
componente em sequência, começando por este brief, sem aguardar novas aprovações
entre as etapas. Figma, commit, push e release permanecem fora do escopo.
