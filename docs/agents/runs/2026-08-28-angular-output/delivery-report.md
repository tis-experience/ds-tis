# Relatório da saída Angular

- Data da validação: 2026-09-02
- Branch: `codex/angular-modal`
- Base: `980afb6` (`origin/main`)
- Status: **Toggle implementado e validado localmente; commit, push e PR pendem de autorização**

## 1. Escopo

A saída Angular agora oferece sete entrypoints independentes: Button,
Accordion, Checkbox, Radio, Toggle, Modal e Popover. Esta extensão acrescenta
somente o Toggle Angular e os artefatos necessários de consumer, Storybook,
documentação e testes. Web, Ark/Zag, React, tokens e Figma foram preservados.
O adaptador do portal foi corrigido para carregar os assets públicos de
Checkbox, Radio, Toggle, Tooltip, Tabs e Toast; sem isso, os exemplos estáticos
apareciam sem o CSS do componente em todas as rotas de implementação.

O owner confirmou que o Figma não teve alterações e dispensou novo snapshot
para esta implementação. A evidência Figma anterior permanece histórica e não é
apresentada como evidência fresca de release.

## 2. Arquitetura e paridade

| Componente | API Angular | Primitive | Contrato validado |
| --- | --- | --- | --- |
| Button | `TisButton` standalone | HTML nativo | submit, loading, disabled, ícones, sizes e temas |
| Accordion | diretivas `TisAccordion*` standalone | Angular Aria | single/multiple, disabled, roving focus, teclado e temas |
| Checkbox | `TisCheckbox` standalone e `ControlValueAccessor` | checkbox nativo + Angular Forms | checked, indeterminate, disabled, required, invalid, formulário, teclado e temas |
| Radio | `TisRadioGroup`, `TisRadioOption` e `ControlValueAccessor` | fieldset, legend e radios nativos + Angular Forms | seleção exclusiva, setas, disabled, required, invalid, formulário e temas |
| Toggle | `TisToggle` standalone e `ControlValueAccessor` | checkbox nativo com role switch + Angular Forms | on/off, Space, disabled, formulário, sizes e temas |
| Modal | `TisModal` e diretivas de body/footer/foco inicial | CDK Overlay, Portal e A11y | diálogo modal, title/description, focus trap, Escape, backdrop, scroll lock, retorno de foco, sizes e temas |
| Popover | `TisPopover` standalone | CDK Overlay, Portal e A11y | trigger, panel, close, placements, arrow, outside click e retorno de foco |

Não há imports cruzados com React, Base UI, shadcn, Ark UI ou Zag. O consumidor
continua responsável por importar `ds-tis/css` e o CSS estrutural do CDK Overlay.

## 3. Artefatos do Toggle

- Entry point: `packages/angular/toggle/`.
- Storybook: `packages/angular/stories/toggle.stories.ts`.
- Harness: `TisToggleHarness` em `@tis/angular/testing`.
- Consumer real: `tests/consumer/angular-app/src/app.component.ts`.
- Catálogo e docs: metadados canônicos, índice Angular bilíngue e página do Toggle.
- Evidência: bundle JSON e screenshots de 320, 390 e 1280px nesta run.

## 4. Evidência executada

| Gate | Resultado |
| --- | --- |
| `npm run test:angular` | passou: package build, tarball real, consumer, 7 testes unitários, Storybook, bundles e browser |
| Consumer de produção | 288,66 KiB JS + 232,16 KiB CSS brutos |
| Button incremental | 1,32 KiB gzip; orçamento 4 KiB |
| Accordion incremental | 1,47 KiB gzip; orçamento 8 KiB |
| Checkbox incremental | 1,94 KiB gzip; orçamento 5 KiB |
| Modal incremental | 2,84 KiB gzip; orçamento 12 KiB |
| Popover incremental | 3,61 KiB gzip; orçamento 12 KiB |
| Radio incremental | 2,22 KiB gzip; orçamento 6 KiB |
| Toggle incremental | 1,57 KiB gzip; orçamento 5 KiB |
| Browser Angular | semântica, teclado, focus trap, retorno de foco, 320/390/1280, light/dark, paridade visual, Storybook e Axe válidos |
| Browser do portal vNext | quatro implementações, runtimes próprios, interação, dark mode, anatomia, tabelas, 320/390, Storybook e Axe válidos |

## 5. Evidência visual

- `evidence/angular-consumer-1280.png`
- `evidence/angular-consumer-390.png`
- `evidence/angular-consumer-320.png`

As capturas foram regeneradas pelo gate de navegador e reinspecionadas. Toggle
mantém 28x16, 44x24 e 56x32px nos três tamanhos; o controle e o texto multilinha
permanecem alinhados ao topo, sem corte em 320, 390 ou 1280px. As evidências
anteriores continuam válidas para Checkbox, Radio e Modal.

## 6. Limites

1. `@tis/angular` continua privado, em `0.0.0-beta.0`, e não foi publicado.
2. O snapshot Figma é histórico. Uma release futura ainda exige snapshot fresco
   e `verify:release-evidence`, embora esta implementação não altere Figma/tokens.
3. Nenhum commit, push, PR, tag ou release foi realizado.

## 7. Próximo passo

Concluir os gates gerais do repositório e revisar o diff. Em seguida, iniciar o
Select Angular com `ControlValueAccessor` e semântica nativa; Combobox vem depois,
pois exige fechar também teclado composto e estratégia de overlay. Commit, push
e PR continuam dependendo de autorização explícita.
