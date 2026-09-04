# Relatório da saída Angular

- Data da validação: 2026-09-04
- Branch: `codex/angular-divider`
- Base: `9c1b96c` (`origin/main`)
- Status: **Divider implementado e validado neste incremento**

## 1. Escopo

A saída Angular agora oferece dezenove entrypoints independentes: Accordion,
Alert, Badge, Button, Card, Checkbox, Combobox, Divider, Input Text, Menu, Modal,
Popover, Radio, Select, Tabs, Textarea, Toast, Toggle e Tooltip. Este incremento
acrescenta o Divider Angular e os artefatos necessários de consumer, Storybook,
documentação e testes. Orientações, semântica decorativa, composição,
responsividade e exemplos foram alinhados entre Web, React e Angular. O CSS
público recebeu apenas a proteção de espessura do Divider vertical; tokens e
Figma foram preservados.

O owner confirmou que o Figma não teve alterações e dispensou novo snapshot
para esta implementação. A evidência Figma anterior permanece histórica e não é
apresentada como evidência fresca de release.

## 2. Arquitetura e paridade

| Componente | API Angular | Primitive | Contrato validado |
| --- | --- | --- | --- |
| Accordion | diretivas `TisAccordion*` standalone | Angular Aria | single/multiple, disabled, roving focus, teclado e temas |
| Alert | `TisAlert` e diretivas de icon/content/title/description/actions/close | live region HTML + composição Angular | quatro tons, solid/subtle, dismiss, prioridade semântica, responsividade e temas |
| Badge | `TisBadge` standalone | elemento host apresentacional | seis tons, solid/subtle, content projection, responsividade e temas |
| Button | `TisButton` standalone | HTML nativo | submit, loading, disabled, ícones, sizes e temas |
| Card | `TisCard` e diretivas de media/container/header/title/description/content/footer | elemento semântico nativo + composição Angular | article estático, button interativo, variantes, seleção, composição, responsividade e temas |
| Checkbox | `TisCheckbox` standalone e `ControlValueAccessor` | checkbox nativo + Angular Forms | checked, indeterminate, disabled, required, invalid, formulário, teclado e temas |
| Combobox | `TisCombobox`, `TisComboboxIcon` e `ControlValueAccessor` | Angular Aria Combobox/Listbox + Angular Forms | filtro local, seleção, active descendant, opções disabled, clear, Escape, formulário, sizes e temas |
| Divider | `TisDivider` standalone | `hr` nativo | horizontal/vertical, semântica implícita, modo decorativo, composição em toolbar, responsividade e temas |
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

## 3. Artefatos de Divider

- Entry point: `packages/angular/divider/`.
- Storybook: `packages/angular/stories/divider.stories.ts`.
- Harness: `TisDividerHarness` em `@tis/angular/testing`.
- Consumer real: `tests/consumer/angular-app/src/app.component.ts`.
- Catálogo e docs: metadados canônicos, índice Angular bilíngue e página de
  Divider Web/React/Angular em PT-BR e inglês.
- Evidência: testes unitários, consumer instalado, bundles e browser em 320,
  390 e 1280px.

## 4. Evidência executada

| Gate | Resultado |
| --- | --- |
| `npm run test:angular` | passou: package build, tarball real, consumer, 20 testes unitários, Storybook, bundles, browser e Axe |
| Testes unitários | passaram: 20 testes com harnesses, Angular Forms e contrato semântico/composicional do Divider |
| Consumer de produção | 407,69 KiB JS + 223,35 KiB CSS brutos |
| Accordion incremental | 1,47 KiB gzip; orçamento 8 KiB |
| Alert incremental | 1,12 KiB gzip; orçamento 5 KiB |
| Badge incremental | 0,76 KiB gzip; orçamento 4 KiB |
| Button incremental | 1,32 KiB gzip; orçamento 4 KiB |
| Card incremental | 0,95 KiB gzip; orçamento 5 KiB |
| Checkbox incremental | 1,94 KiB gzip; orçamento 5 KiB |
| Combobox incremental | 3,70 KiB gzip; orçamento 12 KiB |
| Divider incremental | 0,66 KiB gzip; orçamento 3 KiB |
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
| Suíte geral | `npm run build:all` passou: 92 stories contratuais/93 stories auditadas no browser, 248 páginas HTML no artefato Pages, 108 auditorias de páginas light/dark e zero violações Axe |

## 5. Evidência visual

- `evidence/angular-consumer-1280.png`
- `evidence/angular-consumer-390.png`
- `evidence/angular-consumer-320.png`

As capturas foram regeneradas pelo gate integral de navegador. O Divider
preservou espessura, orientação e contraste em 320, 390 e 1280px, sem colapso ou
overflow nas toolbars. A documentação carrega o CSS público também na anatomia
e nos exemplos fora do iframe; o canvas ocupa toda a largura disponível e os
três marcadores permanecem dentro da anatomia. Web, React e Angular abrem o
próprio Storybook e executam exemplos distintos com light/dark sincronizado.

## 6. Limites

1. `@tis/angular` continua privado, em `0.0.0-beta.0`, e não foi publicado.
2. O snapshot Figma é histórico. Uma release futura ainda exige snapshot fresco
   e `verify:release-evidence`, embora esta implementação não altere Figma/tokens.
3. Nenhum tag, bump ou release npm foi realizado.

## 7. Próximo passo

Concluir os gates, publicar o incremento por PR e verificar o catálogo público.
Depois, iniciar o próximo componente ainda sem saída Angular, preservando o
mesmo padrão de paridade visual, responsividade, Storybook e Axe.
