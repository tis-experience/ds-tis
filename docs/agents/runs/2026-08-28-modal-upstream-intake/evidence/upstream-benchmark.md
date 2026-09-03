# Benchmark upstream — Modal

## Ark UI + Zag

- `@ark-ui/react/dialog` 5.37.2, com Zag 1.41.2 transitivo.
- Fornece state machine, parts, portal, focus trap, dismiss e retorno de foco.

## React/shadcn + Base UI

- `@base-ui/react/dialog` 1.6.0, distribuído como source pelo registry shadcn.
- Fornece primitive React, portal, backdrop, viewport e gestão de foco.

## Angular nativo

- Angular CDK Overlay/Portal fornece a camada, backdrop, posicionamento central,
  bloqueio de scroll e lifecycle do conteúdo portado.
- Angular CDK A11y fornece o focus trap; a API pública do DS mantém title,
  description, content projection, sizes e eventos tipados.

## Contrato acessível de referência

- WAI-ARIA APG Dialog (Modal): `role=dialog`, `aria-modal`, nome acessível,
  contenção de foco, Escape e retorno de foco.
- Carbon Modal e Primer Dialog foram usados como comparação de composição,
  hierarquia de ações e comportamento responsivo.

As tecnologias não definem visual, tokens, nomes ou implementação de outra saída.
