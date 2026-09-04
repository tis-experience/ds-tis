# Relatório da saída Angular

- Data da validação: 2026-09-04
- Branch: `codex/angular-toast`
- Base: `b6fb9a7` (`origin/main`)
- Status: **Toast implementado e validado neste incremento**

## 1. Escopo

A saída Angular agora oferece quinze entrypoints independentes: Accordion,
Button, Checkbox, Combobox, Input Text, Menu, Modal, Popover, Radio, Select,
Tabs, Textarea, Toast, Toggle e Tooltip. Este incremento acrescenta o Toast Angular e os
artefatos necessários de consumer, Storybook, documentação e testes. Web,
Ark/Zag, React, tokens e Figma foram preservados.

O owner confirmou que o Figma não teve alterações e dispensou novo snapshot
para esta implementação. A evidência Figma anterior permanece histórica e não é
apresentada como evidência fresca de release.

## 2. Arquitetura e paridade

| Componente | API Angular | Primitive | Contrato validado |
| --- | --- | --- | --- |
| Accordion | diretivas `TisAccordion*` standalone | Angular Aria | single/multiple, disabled, roving focus, teclado e temas |
| Button | `TisButton` standalone | HTML nativo | submit, loading, disabled, ícones, sizes e temas |
| Checkbox | `TisCheckbox` standalone e `ControlValueAccessor` | checkbox nativo + Angular Forms | checked, indeterminate, disabled, required, invalid, formulário, teclado e temas |
| Combobox | `TisCombobox`, `TisComboboxIcon` e `ControlValueAccessor` | Angular Aria Combobox/Listbox + Angular Forms | filtro local, seleção, active descendant, opções disabled, clear, Escape, formulário, sizes e temas |
| Input Text | `TisInput` e diretivas de ícone standalone + `ControlValueAccessor` | input nativo + Angular Forms | tipos, label, required, helper, erro, ícones, disabled, readonly, sizes e temas |
| Menu | diretivas `TisActionMenu`, `TisMenu*` standalone | Angular Aria Menu | abertura, roving focus, typeahead, disabled, comandos, checkbox/radio items, retorno de foco, responsividade e temas |
| Modal | `TisModal` e diretivas de body/footer/foco inicial | CDK Overlay, Portal e A11y | diálogo modal, title/description, focus trap, Escape, backdrop, scroll lock, retorno de foco, sizes e temas |
| Popover | `TisPopover` standalone | CDK Overlay, Portal e A11y | trigger, panel, close, placements, arrow, outside click e retorno de foco |
| Radio | `TisRadioGroup`, `TisRadioOption` e `ControlValueAccessor` | fieldset, legend e radios nativos + Angular Forms | seleção exclusiva, setas, disabled, required, invalid, formulário e temas |
| Select | `TisSelect` standalone e `ControlValueAccessor` | select nativo + Angular Forms | label, opções, placeholder, required, helper, erro, disabled, sizes e temas |
| Tabs | diretivas `TisTabs*` standalone | Angular Aria | seleção controlável, roving tabindex, setas, Home/End, disabled e relações ARIA |
| Textarea | `TisTextarea` standalone e `ControlValueAccessor` | textarea nativo + Angular Forms | label, required, helper, erro, contador, disabled, readonly, sizes e temas |
| Toast | `TisToastService` e `TisToastRegion` standalone | serviço Angular + regiões live HTML | polite/assertive, fila máxima, timeout pausável, actions persistentes, close, Escape e temas |
| Toggle | `TisToggle` standalone e `ControlValueAccessor` | checkbox nativo com role switch + Angular Forms | on/off, Space, disabled, formulário, sizes e temas |
| Tooltip | `TisTooltip` e `TisTooltipTrigger` standalone | CDK Overlay e Portal | hover/focus, delays, conteúdo hoverable, Escape, placements, flip, seta e temas |

Não há imports cruzados com React, Base UI, shadcn, Ark UI ou Zag. O consumidor
continua responsável por importar `ds-tis/css` e o CSS estrutural do CDK Overlay.

## 3. Artefatos de Toast

- Entry point: `packages/angular/toast/`.
- Storybook: `packages/angular/stories/toast.stories.ts`.
- Harness: `TisToastHarness` em `@tis/angular/testing`.
- Consumer real: `tests/consumer/angular-app/src/app.component.ts`.
- Catálogo e docs: metadados canônicos, índice Angular bilíngue e página de
  Toast em PT-BR e inglês.
- Evidência: testes unitários, consumer instalado, bundles e browser em 320,
  390 e 1280px.

## 4. Evidência executada

| Gate | Resultado |
| --- | --- |
| `npm run test:angular` | passou: package build, tarball real, consumer, 16 testes unitários, Storybook, bundles, browser e Axe |
| Testes unitários | passaram: 16 testes com harnesses, Angular Forms, live regions e ciclo de vida do Toast |
| Consumer de produção | 398,84 KiB JS + 232,22 KiB CSS brutos |
| Accordion incremental | 1,47 KiB gzip; orçamento 8 KiB |
| Button incremental | 1,32 KiB gzip; orçamento 4 KiB |
| Checkbox incremental | 1,94 KiB gzip; orçamento 5 KiB |
| Combobox incremental | 3,70 KiB gzip; orçamento 12 KiB |
| Input Text incremental | 2,51 KiB gzip; orçamento 6 KiB |
| Menu incremental | 2,90 KiB gzip; orçamento 10 KiB |
| Modal incremental | 2,84 KiB gzip; orçamento 12 KiB |
| Popover incremental | 3,61 KiB gzip; orçamento 12 KiB |
| Radio incremental | 2,22 KiB gzip; orçamento 6 KiB |
| Select incremental | 2,32 KiB gzip; orçamento 6 KiB |
| Tabs incremental | 0,95 KiB gzip; orçamento 8 KiB |
| Textarea incremental | 2,34 KiB gzip; orçamento 6 KiB |
| Toast incremental | 3,25 KiB gzip; orçamento 8 KiB |
| Toggle incremental | 1,57 KiB gzip; orçamento 5 KiB |
| Tooltip incremental | 3,24 KiB gzip; orçamento 12 KiB |
| Browser Angular | semântica, Angular Forms, foco, 320/390/1280, light/dark, paridade visual, Storybook e Axe válidos |
| Browser do portal vNext | quatro implementações, runtimes próprios, interação, dark mode, anatomia, tabelas, 320/390, Storybook e Axe válidos |
| Suíte geral | `npm test` passou: 92 stories contratuais/93 stories auditadas no browser, 232 páginas HTML, 108 auditorias de páginas light/dark e zero violações Axe |

## 5. Evidência visual

- `evidence/angular-consumer-1280.png`
- `evidence/angular-consumer-390.png`
- `evidence/angular-consumer-320.png`

As capturas foram regeneradas pelo gate integral de navegador. O Toast preservou
regiões live, mensagens e actions dentro do viewport em 320, 390 e 1280px,
timeout pausável, limite de cinco mensagens, Escape contextual, tema dark e
ausência de overflow. As stories bloqueiam conteúdo recortado, contraste
insuficiente, semântica incorreta e divergência light/dark.

## 6. Limites

1. `@tis/angular` continua privado, em `0.0.0-beta.0`, e não foi publicado.
2. O snapshot Figma é histórico. Uma release futura ainda exige snapshot fresco
   e `verify:release-evidence`, embora esta implementação não altere Figma/tokens.
3. Nenhum tag, bump ou release npm foi realizado.

## 7. Próximo passo

Revisar o diff e publicar o incremento por PR. Depois, iniciar o Badge Angular
e preservar o mesmo padrão de paridade visual, responsividade, Storybook e Axe.
