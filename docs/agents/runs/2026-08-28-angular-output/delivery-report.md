# Relatório da saída Angular

- Data da validação: 2026-09-03
- Branch: `codex/angular-input-textarea`
- Base: `97b1da8` (`origin/main`)
- Status: **Input Text e Textarea implementados e validados neste incremento**

## 1. Escopo

A saída Angular agora oferece dez entrypoints independentes: Accordion, Button,
Checkbox, Input Text, Modal, Popover, Radio, Select, Textarea e Toggle. Este
incremento acrescenta Input Text e Textarea Angular e os artefatos necessários
de consumer, Storybook, documentação e testes. Web, Ark/Zag, React, tokens e
Figma foram preservados.

O owner confirmou que o Figma não teve alterações e dispensou novo snapshot
para esta implementação. A evidência Figma anterior permanece histórica e não é
apresentada como evidência fresca de release.

## 2. Arquitetura e paridade

| Componente | API Angular | Primitive | Contrato validado |
| --- | --- | --- | --- |
| Button | `TisButton` standalone | HTML nativo | submit, loading, disabled, ícones, sizes e temas |
| Accordion | diretivas `TisAccordion*` standalone | Angular Aria | single/multiple, disabled, roving focus, teclado e temas |
| Checkbox | `TisCheckbox` standalone e `ControlValueAccessor` | checkbox nativo + Angular Forms | checked, indeterminate, disabled, required, invalid, formulário, teclado e temas |
| Input Text | `TisInput` e diretivas de ícone standalone + `ControlValueAccessor` | input nativo + Angular Forms | tipos, label, required, helper, erro, ícones, disabled, readonly, sizes e temas |
| Radio | `TisRadioGroup`, `TisRadioOption` e `ControlValueAccessor` | fieldset, legend e radios nativos + Angular Forms | seleção exclusiva, setas, disabled, required, invalid, formulário e temas |
| Toggle | `TisToggle` standalone e `ControlValueAccessor` | checkbox nativo com role switch + Angular Forms | on/off, Space, disabled, formulário, sizes e temas |
| Modal | `TisModal` e diretivas de body/footer/foco inicial | CDK Overlay, Portal e A11y | diálogo modal, title/description, focus trap, Escape, backdrop, scroll lock, retorno de foco, sizes e temas |
| Popover | `TisPopover` standalone | CDK Overlay, Portal e A11y | trigger, panel, close, placements, arrow, outside click e retorno de foco |
| Select | `TisSelect` standalone e `ControlValueAccessor` | select nativo + Angular Forms | label, opções, placeholder, required, helper, erro, disabled, sizes e temas |
| Textarea | `TisTextarea` standalone e `ControlValueAccessor` | textarea nativo + Angular Forms | label, required, helper, erro, contador, disabled, readonly, sizes e temas |

Não há imports cruzados com React, Base UI, shadcn, Ark UI ou Zag. O consumidor
continua responsável por importar `ds-tis/css` e o CSS estrutural do CDK Overlay.

## 3. Artefatos de Input Text e Textarea

- Entry points: `packages/angular/input/` e `packages/angular/textarea/`.
- Storybook: `packages/angular/stories/input.stories.ts` e
  `packages/angular/stories/textarea.stories.ts`.
- Harnesses: `TisInputHarness` e `TisTextareaHarness` em
  `@tis/angular/testing`.
- Consumer real: `tests/consumer/angular-app/src/app.component.ts`.
- Catálogo e docs: metadados canônicos, índice Angular bilíngue e páginas de
  Input Text e Textarea.
- Evidência: testes unitários, consumer instalado, bundles e browser em 320,
  390 e 1280px.

## 4. Evidência executada

| Gate | Resultado |
| --- | --- |
| `npm run test:angular` | passou: package build, tarball real, consumer, 10 testes unitários, Storybook, bundles, browser e Axe |
| Testes unitários | passaram: 10 testes com harnesses e Angular Forms |
| Consumer de produção | 306,33 KiB JS + 232,16 KiB CSS brutos |
| Button incremental | 1,32 KiB gzip; orçamento 4 KiB |
| Accordion incremental | 1,47 KiB gzip; orçamento 8 KiB |
| Checkbox incremental | 1,94 KiB gzip; orçamento 5 KiB |
| Input Text incremental | 2,51 KiB gzip; orçamento 7 KiB |
| Modal incremental | 2,84 KiB gzip; orçamento 12 KiB |
| Popover incremental | 3,61 KiB gzip; orçamento 12 KiB |
| Radio incremental | 2,22 KiB gzip; orçamento 6 KiB |
| Select incremental | 2,32 KiB gzip; orçamento 7 KiB |
| Textarea incremental | 2,34 KiB gzip; orçamento 7 KiB |
| Toggle incremental | 1,57 KiB gzip; orçamento 5 KiB |
| Browser Angular | semântica, Angular Forms, foco, 320/390/1280, light/dark, paridade visual, Storybook e Axe válidos |
| Browser do portal vNext | quatro implementações, runtimes próprios, interação, dark mode, anatomia, tabelas, 320/390, Storybook e Axe válidos |
| Suíte geral | `npm test` passou: 93 stories, 222 páginas HTML, 108 auditorias de páginas light/dark e zero violações Axe |

## 5. Evidência visual

- `evidence/angular-consumer-1280.png`
- `evidence/angular-consumer-390.png`
- `evidence/angular-consumer-320.png`

As capturas foram regeneradas pelo gate integral de navegador e reinspecionadas.
No portal, o Input mediu 640×40px em desktop e preservou o valor digitado; a
Textarea mediu 252×96px em viewport de 320px, atualizou o contador para `26/500`
e não gerou erro de console. As stories bloqueiam controles com menos de 80px ou
180px ou mais de altura, compressão horizontal, overflow e divergência light/dark.

## 6. Limites

1. `@tis/angular` continua privado, em `0.0.0-beta.0`, e não foi publicado.
2. O snapshot Figma é histórico. Uma release futura ainda exige snapshot fresco
   e `verify:release-evidence`, embora esta implementação não altere Figma/tokens.
3. Nenhum tag, bump ou release npm foi realizado.

## 7. Próximo passo

Revisar o diff e publicar o incremento por PR. Depois, iniciar o Combobox
Angular, que exige teclado composto, filtro, active descendant e estratégia de
overlay.
