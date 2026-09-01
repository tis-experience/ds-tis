# Relatório de preparação da saída Angular

Data da validação: 2026-08-31
Branch: `codex/angular`
Base: `fc02a92` (`origin/main`)
Status: **pronta para análise local; o worktree misto não está pronto para commit ou release**

## 1. Diagnóstico

A fundação vNext necessária está presente na base da branch. A implementação
Angular foi construída de forma aditiva, sem alterações em tokens canônicos ou
no Figma. O pacote permanece privado e identificado como beta de workspace.

O worktree não está limpo: `git status --short` agrupa 211 entradas e
`git status --short -uall` expande 558 arquivos. O inventário contém:

- 50 arquivos diretamente ligados ao pacote, Storybook, consumer, ADR, rotas e
  evidências Angular;
- mais de 300 arquivos de uma expansão paralela de React, Ark/Zag, registry e
  intakes upstream;
- 21 arquivos da documentação ou runtime estável com alterações de componentes;
- 259 arquivos dentro de runs de agentes, incluindo trabalhos anteriores.

Essas contagens se sobrepõem e servem para classificação, não para soma. Nenhum
arquivo das áreas paralelas foi revertido, apagado ou incluído implicitamente no
escopo Angular durante esta auditoria.

## 2. Matriz de arquitetura e paridade

| Componente | Contrato Web preservado | API Angular | Primitive | Diferença inevitável | Evidência |
| --- | --- | --- | --- | --- | --- |
| Button | `<button>` e classes `ds-button*` | `TisButton` standalone, inputs tipados e content projection para ícones | HTML nativo | Host Angular usa `display: contents`; o elemento interativo continua sendo o `button` nativo | submit, loading, disabled, ícones, tamanhos, temas, Axe e bundle |
| Accordion | anatomia `ds-accordion*`, single/multiple, disabled e teclado | diretivas `TisAccordion*` standalone | `@angular/aria/accordion` | estado e roving focus são fornecidos pelo Angular Aria; pointer mantém foco visual apenas para teclado | unitário, teclado, foco, estados, temas, 320/390 e Axe |
| Popover | trigger, panel, close, actions, placements e classes `ds-popover*` | `TisPopover` standalone, `model()` para open, outputs e content projection | CDK Overlay, Portal e A11y | o panel é portado para o overlay container; a anatomia visual interna permanece igual | Escape, click externo, retorno de foco, quatro placements, arrow/no-arrow, temas, 320/390 e Axe |

Não há imports cruzados com React, Base UI, shadcn, Ark UI ou Zag. O consumidor
continua responsável por importar `ds-tis/css` e o CSS estrutural do CDK Overlay.

## 3. Artefatos Angular

### Configuração e distribuição

- `.storybook-angular/main.mjs`
- `.storybook-angular/preview-head.html`
- `.storybook-angular/preview.css`
- `.storybook-angular/preview.ts`
- `.storybook-angular/tsconfig.json`
- `angular.json`
- `tsconfig.angular.json`
- `package.json`
- `package-lock.json`

### Biblioteca

- `packages/angular/README.md`
- `packages/angular/package.json`
- `packages/angular/ng-package.json`
- `packages/angular/tsconfig.lib.json`
- `packages/angular/tsconfig.lib.prod.json`
- `packages/angular/src/public-api.ts`
- `packages/angular/button/**`
- `packages/angular/accordion/**`
- `packages/angular/popover/**`
- `packages/angular/testing/**`
- `packages/angular/stories/**`

### Consumer e testes

- `tests/consumer/angular-app/**`
- `scripts/test-angular-consumer.mjs`
- `scripts/test-angular-bundle.mjs`
- `scripts/test-angular-browser.mjs`

### Arquitetura, portal e evidência

- `docs/decisions/ADR-023-quatro-saidas-com-angular-nativo.md`
- `docs/decisions/adr-023-quatro-saidas-com-angular-nativo.html`
- `apps/docs/src/content/docs/pt-br/angular/index.mdx`
- `apps/docs/src/content/docs/en/angular/index.mdx`
- `apps/docs/src/pages/[locale]/angular/components/[slug].astro`
- `docs/agents/runs/2026-08-28-angular-output/evidence/angular-bundle.json`
- `docs/agents/runs/2026-08-28-angular-output/evidence/angular-consumer-1280.png`
- `docs/agents/runs/2026-08-28-angular-output/evidence/angular-consumer-390.png`
- `docs/agents/runs/2026-08-28-angular-output/evidence/angular-consumer-320.png`

Os componentes e utilitários compartilhados do portal precisam ser revisados
num diff separado, porque atualmente também carregam a expansão React/Ark que
está fora do pedido Angular original.

## 4. Evidência executada

| Gate | Resultado |
| --- | --- |
| `npm run test:angular` | passou: biblioteca, tarball instalado, consumer, 3 unitários, Storybook, bundle e browser |
| Consumer de produção | 224,49 KiB JS + 232,08 KiB CSS brutos |
| Button incremental | 1,32 KiB gzip; orçamento 4 KiB |
| Accordion incremental | 1,47 KiB gzip; orçamento 8 KiB |
| Popover incremental | 3,61 KiB gzip; orçamento 12 KiB |
| `npm run verify:tokens` | 0 erros, 1 aviso de snapshot antigo |
| `npm run verify:figma-structure` | 0 issues estruturais |
| `npm run test:vnext` | passou |
| `npm run test:vnext:browser` | passou em desktop, 390 e 320; dark mode e Axe válidos |
| `npm test` | passou: 93 stories, 223 checks de lifecycle, 108 auditorias WCAG sem violações e Pages íntegro |
| `git diff --check` | passou |

## 5. Limitações e bloqueios

1. O snapshot Figma tem mais de 24 horas. Não há drift detectado, mas uma
   release exige snapshot fresco e nova evidência de release.
2. O worktree mistura a entrega Angular com uma expansão React/Ark não solicitada
   pelo brief Angular. Um commit único não é revisável com segurança.
3. `@tis/angular` está em `0.0.0-beta.0`, privado e não publicado.
4. Os chunks grandes reportados pelo Storybook pertencem ao ambiente documental;
   os entrypoints consumíveis permanecem abaixo dos orçamentos definidos.
5. Nenhum commit, push, PR, tag ou publicação foi realizado.

## 6. Próxima decisão

Antes de publicar, criar uma seleção explícita de arquivos para o PR Angular e
revisar separadamente os componentes compartilhados do portal. Depois disso:

1. atualizar o snapshot Figma sem editar o arquivo de design;
2. gerar evidência fresca de release;
3. repetir os gates sobre o diff isolado;
4. solicitar autorização para commit, push e PR.

## 7. Próximos componentes recomendados

1. Modal, reutilizando CDK Overlay, Portal e A11y já validados no Popover;
2. Checkbox, Radio e Toggle, acrescentando integração explícita com Angular Forms;
3. Select e Combobox, somente após fechar o contrato de `ControlValueAccessor`,
   teclado composto e estratégia de overlay.
