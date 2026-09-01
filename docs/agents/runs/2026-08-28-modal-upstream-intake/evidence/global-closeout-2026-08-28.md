# Fechamento local da onda vNext

Data: 2026-08-28

## Componentes fechados localmente

Accordion, Button, Checkbox, Combobox, Menu, Modal, Popover, Radio, Select,
Tabs, Toast, Toggle e Tooltip estão em `Ready for release approval`.

## Gates finais

- `npm test`: passou integralmente.
- `npm run test:vnext`: passou; providers, adapters, previews e registry ficaram
  dentro dos budgets.
- `npm run test:shadcn-consumer`: passou com 22 componentes instalados.
- `npm run test:vnext:browser`: passou em portal, Storybook, Docs, Controls,
  320/390px, Base UI, dark mode e Axe.
- Storybook Web: 93 stories em desktop/mobile, 27 Docs dark e sete runtimes.
- Runtime Web: 223 checks de init/destroy/re-init.
- Pages: 1.064 arquivos, 199 páginas HTML e links locais íntegros.
- Tokens: 1.595; zero erros, zero avisos e `VALUE_DRIFT=0`.
- Acessibilidade: 108 páginas/modos mais duas runs do Theme Playground, com zero
  violações critical, serious, moderate ou minor.
- Preview local: rotas `/ds-tis/` e `/ds-tis/next/.../modal/` responderam 200.
- `git diff --check`: passou.

## Limite desta rodada

Commit, push, PR, publicação e release não foram executados.
