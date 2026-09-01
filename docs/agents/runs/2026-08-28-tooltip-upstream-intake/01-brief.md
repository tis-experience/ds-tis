- Status: Approved

# Brief proposto

- Nome: Tooltip
- Classe: overlay informativo não interativo acionado por hover ou focus
- Problema: o contrato Web e Figma está maduro, mas Ark/Zag e React/shadcn/Base UI ainda não têm saídas públicas equivalentes.
- Usar quando: um trigger precisa de um label visual breve e complementar, sobretudo um Button icon-only.
- Não usar quando: a informação é essencial, longa, acionável ou precisa permanecer visível; nesses casos usar texto, feedback contextual, Popover ou Modal conforme a tarefa.
- Diferenças para componentes próximos: Tooltip não recebe foco nem contém ações; Popover recebe conteúdo livre e interação; Modal interrompe o fluxo e exige decisão.
- Acessibilidade/semântica: `role="tooltip"`, trigger com nome acessível e `aria-describedby`, abertura por hover/focus, fechamento por Escape e pointer leave, foco preservado no trigger e conteúdo hoverable segundo WCAG 1.4.13.
- Composição DS: trigger semântico existente, Positioner/Portal fornecido pelo provider, superfície e arrow estilizados somente com tokens Tooltip.
- Variants/states candidatos: posições top/right/bottom/left; closed/open; hover/focus; light/dark. Delay visual padrão 100 ms no Web e configurável nos providers.
- Slots: Root, Trigger, Positioner, Content/Popup e Arrow.
- Tokens: reutilizar os 11 tokens em `tokens/component/tooltip.json` e `semantic.z.tooltip`; zero token novo.
- Docs Figma: sem mudança; página `191:2`, root `194:39`, `issueCount=0` no snapshot de 2026-08-28.
- Impacto repo: adapters Ark e Base UI, stories, registry, rotas Astro, consumidor e gates de browser/bundle.
- Fora de escopo: conteúdo interativo, follow-cursor, múltiplos triggers compartilhados, escrita Figma, alteração do runtime/CSS Web, commit, push e release.
- Bloqueado antes de: qualquer mudança Figma/Web core e qualquer publicação.
- Aprovação necessária: fornecida pelo owner ao autorizar execução contínua componente a componente, mantendo Figma/Web estáveis.
