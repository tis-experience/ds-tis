- Status: Approved

# Brief proposto

- Nome: Menu / Action Menu
- Classe: overlay de ações contextuais acionado por Menu Button
- Problema: o contrato Web e Figma está maduro, mas Ark/Zag e React/shadcn/Base UI ainda não têm saídas públicas equivalentes.
- Usar quando: um Button abre uma lista curta de comandos contextuais, escolhas radio ou opções checkbox.
- Não usar quando: a pessoa seleciona um valor de formulário, filtra opções, navega pela estrutura principal ou precisa de ações sempre visíveis.
- Diferenças para componentes próximos: Select escolhe valor; Combobox filtra e escolhe; Popover hospeda conteúdo livre; Menu executa comandos com modelo de foco composto.
- Acessibilidade/semântica: Menu Button APG; `aria-haspopup="menu"`, `aria-expanded`, `role="menu"`, items próprios, foco roving, setas, Home/End, typeahead, Escape e retorno ao trigger.
- Composição DS: Button TIS como trigger, Menu TIS como surface, itens com label, icon/check, shortcut, separator e estados.
- Variants/states candidatos: sizes sm/md/lg; default, highlighted/focused, checked, disabled e destructive; alinhamento start/end pertence ao positioner.
- Slots: Trigger, Content, Item, ItemLabel, ItemIcon/Indicator, Shortcut, Separator, Group e GroupLabel.
- Tokens: reutilizar `component.menu.*` e `component.action-menu.*`; zero token novo.
- Docs Figma: sem mudança; página `7973:2`, root `7983:87`, `issueCount=0` no snapshot de 2026-08-28.
- Impacto repo: adapters Ark e Base UI, stories, registry, rotas Astro, consumidor e gates de browser/bundle.
- Fora de escopo: submenu, context menu, menubar/navigation menu, seleção de formulário, busca, virtualização e qualquer escrita Figma/Web core.
- Bloqueado antes de: commit, push, PR, release e escrita Figma.
- Aprovação necessária: fornecida pelo owner ao autorizar execução contínua componente a componente, mantendo Figma/Web estáveis.
