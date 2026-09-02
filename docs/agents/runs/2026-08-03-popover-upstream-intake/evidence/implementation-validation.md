# Validação de implementação · Popover

Última execução: 2026-08-27

## Saídas

- HTML/CSS/JS: preservada em `css/components/popover.css` e `js/popover.js`.
- Ark/Zag: adapter React isolado em `packages/react/src/ark/popover.jsx`; importa Ark UI e usa Zag transitivamente, sem Base UI.
- React · shadcn/Base UI: item isolado em `registry/tis/popover.tsx`; importa Base UI, sem Ark/Zag.

## Documentação

- Rotas PT-BR e EN para HTML/CSS/JS, Ark/Zag e React · shadcn/Base UI.
- As três rotas expõem o mesmo seletor e mantêm `HTML/CSS/JS` como default.
- Storybook mantém o registry React em `Components/*` e a saída Ark/Zag em `Outputs/Ark + Zag/Popover`.

## Evidência executada

- `test:shadcn-registry`: 17 itens válidos; typecheck e contratos passaram.
- `test:shadcn-consumer`: 16 componentes instalados pelo CLI em consumer Vite; build, interação, Escape, retorno de foco e Axe passaram.
- `test:vnext:bundle`: Ark/Zag 27,35 KiB gzip; preview Ark 40,34 KiB;
  preview Base UI 55,42 KiB, dentro dos budgets registrados.
- `test:vnext:browser`: rotas públicas, lazy loading dos previews, quatro
  placements, duas implementações interativas, foco, Escape, 320/390, dark mode
  e Axe passaram.
- `build:all`: 681 arquivos, 147 páginas HTML e links locais íntegros; 93 stories
  em desktop/mobile e 27 Docs dark.
- `test:a11y`: 108 execuções light/dark e 2 do theme playground, zero violações.
- `verify:tokens`: 0 erros e 0 drift de valor; warning por snapshot Figma com
  784 horas. A rodada não alterou Figma ou tokens e não está liberada para release.

## Gate humano restante

Quem construiu não aprova o próprio trabalho. Paridade final, seletor documental e gate `repo` aguardam revisão do owner. Commit, push e release permanecem bloqueados.
