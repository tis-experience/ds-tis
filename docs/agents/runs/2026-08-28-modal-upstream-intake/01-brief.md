- Status: Approved

# Brief — Modal

- Nome: Modal.
- Classe: overlay modal com contenção de foco.
- Problema: interromper o fluxo para uma decisão curta ou edição simples sem
  perder contexto, com anatomia e comportamento consistentes por tecnologia.
- Usar quando: a tarefa exige atenção imediata e conclusão antes de retornar.
- Não usar quando: a confirmação é destrutiva/irreversível; nesse caso, usar um
  futuro Alert Dialog com contrato específico.
- Acessibilidade: `role=dialog`, `aria-modal`, title/description associados,
  focus trap, Escape, retorno de foco e bloqueio de scroll.
- Variants: `sm`, `md`, `lg`; controlled/uncontrolled nos adapters.
- Composição: header, heading, title, description, body, footer, close e Buttons.
- Tokens: reutilizar `component.modal.*`; nenhum token novo.
- Impacto repo: preservar Web, Ark/Zag e React; acrescentar Modal Angular nativo
  como quarto entrypoint independente, com consumer, Storybook, docs e testes.
- Fora de escopo: Figma, tokens, Web core, Alert Dialog e release.
- Aprovação: extensão Angular e execução local contínua autorizadas pelo owner em
  2026-09-02; commit, push, PR e release continuam bloqueados.
