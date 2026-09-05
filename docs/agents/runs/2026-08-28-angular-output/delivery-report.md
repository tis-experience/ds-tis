# Relatório da saída Angular

## Revisão independente e integração — 2026-09-05

- Owner autorizou seguir com revisão, commit e PR do lote de sete componentes:
  Form Field, Breadcrumb, Avatar, Pagination, Skeleton, Spinner e Table.
- Role de integração: Release Agent; checklist `docs/agents/checklists/release-checklist.md`.
- Dois revisores independentes verificaram source/API/testes e documentação.
  A revisão encontrou e levou à correção de ordenação invertida/seleção por
  índice na Table, cancelamento de cliques modificados na Pagination, dependência
  de labels PT no harness, corte móvel de Skeleton e mapas de tokens omitidos.
- Revisor de documentação verificou as correções Table; QA dos ajustes
  documentais cobriu 24 combinações PT/EN × 320/1280 × light/dark, totalizando
  96 iframes sem corte vertical/horizontal ou erro JavaScript.
- Após as correções: build/tarball Angular e 46 testes unitários passaram.
  Consumer de produção: 430,92 KiB JS + 224,12 KiB CSS. `verify:tokens` sem erros
  ou drift; aviso de snapshot antigo preservado, conforme dispensa do owner
  para trabalho que não altera Figma/tokens.
- Commit do lote: `765782a`. Integração de `origin/main` em `a90c542` preserva
  26 saídas Web, 26 React, 26 Angular e 14 Ark; sem imports cruzados.
- A revisão da integração corrigiu páginas React que ainda bloqueavam Angular
  disponível e a renderização dos exemplos adicionais de Input Angular/Ark.
  Testes agora cobrem ida e volta React/Angular em nove componentes, PT-BR/EN,
  e presença dos cinco exemplos de Input no HTML publicado.
- Storybook Angular, bundle independente e browser Angular passaram após as
  correções; consumidor React com 26 componentes também passou.
- QA independente detectou que o Markdown do portal aplicava `display: block`
  à tabela anatômica: o cabeçalho/corpo não preenchia a largura do container.
  A região documental foi isolada com `not-content`, preservando o CSS público.
  Regressão compara largura de table/thead/tbody em 320/1280 e PT-BR/EN.
- Build integrado passou: 93 stories HTML/CSS; artefato Pages com 1365 arquivos
  e 272 páginas; 108 auditorias Axe com zero violações, além do theme playground.
- Após isolar a anatomia, revisor independente validou Table em oito combinações
  PT-BR/EN × 320/1280 × light/dark: larguras iguais, sete marcadores visíveis,
  ordenação/seleção corretas, quatro exemplos sem corte e oito auditorias Axe zero.
- Input foi validado em 16 combinações com 56 iframes sem corte, edição/submit
  funcionais e títulos sem duplicação. Segurança dos artefatos e diff passaram.
- PR: https://github.com/tis-experience/ds-tis/pull/75, integração `060c913`.
  O CI identificou oito referências visuais anteriores às novas anatomias de
  Avatar/Skeleton/Spinner/Table. Revisor independente comparou integralmente
  as capturas Linux do run `33981229235` com as baselines: as diferenças de
  altura são as inserções intencionais (+210/+154/+152/+463 px); restante
  preservado após compensar o deslocamento, sem novos cortes/sobreposições.
  Somente essas oito referências Linux e suas equivalentes macOS são atualizadas;
  os limites do teste e as demais referências permanecem inalterados.
- Estado: candidata a integração por PR; CI e revisão do PR são os gates para
  merge. Esta etapa não publica versão npm nem modifica Figma. A comparação de tokens usa o snapshot
  existente de 201h e não representa uma nova validação do Figma vivo.

## Incremento Table — 2026-09-04

- Branch: `codex/angular-form-field`, base `6b66bf2`.
- Role: Repo Component Agent; checklist `docs/agents/checklists/repo-implementation-checklist.md`.
- Escopo: vigésima sexta e última saída Angular do catálogo atual,
  `@tis/angular/table`. Sem alteração de Figma, tokens ou CSS público.
- API: diretivas standalone sobre `table`, `caption`, `thead`, `tbody`, `tr`,
  `th`, `td` e `button` nativos; região nomeada e focável; tamanhos sm/md;
  layout fixed/nowrap; alinhamento; truncamento; seleção e `aria-sort`.
- Entrega local: entrypoint independente, quatro stories, consumer instalado via
  tarball, harness, três testes unitários, catálogo/rotas PT-BR e EN, anatomia
  com sete marcadores e exemplos de tamanhos, estados e overflow horizontal.
- Gates executados: build Angular; consumer de produção; 43 testes unitários
  totais; Storybook Angular; browser Angular completo; bundle independente;
  geração de docs/API/LLM; build do portal e QA dedicada no catálogo.
- Table: 1,60 KiB gzip, orçamento 4 KiB. Consumer: 430,77 KiB JS e
  224,12 KiB CSS brutos. Sem imports cruzados com outras saídas.
- QA no servidor local `127.0.0.1:4177`: catálogo → Table Angular em PT-BR e
  EN; quatro iframes; 1280/320 px × light/dark; ordenação por mouse/teclado,
  `aria-sort`, linha selected, rows sm/md de 40/48 px, largura integral,
  overflow restrito à região, foco visível, sete marcadores dentro da anatomia,
  ausência de corte vertical e zero violações Axe nas tags WCAG utilizadas.
- Correções provenientes da inspeção visual: separação dos marcadores 1/3/4 na
  anatomia móvel; remoção de controle focável do diagrama `aria-hidden`;
  redução dos previews simples de 30 para 18 rem; nomes únicos nas regiões da
  matriz de tamanhos; asserções de Badge limitadas aos exemplos próprios.
- Evidência visual inspecionada fora do repo:
  `/private/tmp/table-anatomy-320-dark.png`,
  `/private/tmp/table-playground-1280-light.png` e
  `/private/tmp/table-overflow-320-dark.png`.
- Estado: implementado e validado localmente; não commitado, não publicado.
  Próximo passo: gate integrado final e revisão independente antes de integrar
  por PR. Não se declara autoaprovação.

## Incremento Spinner — 2026-09-04

- Role: Repo Component Agent, mesmo checklist de implementação. Alterações já
  presentes na branch `codex/angular-form-field` foram preservadas.
- Vigésima quinta saída Angular: `@tis/angular/spinner`. O host participa da
  composição e renderiza um `span` nativo com as classes públicas, tamanhos
  sm/md/lg, estilo on-color, status nomeado e modo decorativo.
- O modo decorativo evita anúncios duplicados em Button/regiões que já comunicam
  a espera. A animação respeita `prefers-reduced-motion`; não houve alteração de
  tokens, CSS público ou Figma.
- Evidência: tarball instalado num consumer independente, build de produção,
  40 testes unitários, entrypoint de 0,84 KiB gzip, quatro stories e regressão
  Angular completa de semântica, paridade CSS, 320/390/1280 px, light/dark e Axe.
- Portal PT-BR/EN validado em 1280/320 px com quatro exemplos, três marcadores e
  Axe zero. A inspeção detectou e corrigiu contraste insuficiente no label do
  exemplo on-color antes da entrega.
- Estado: local, validado para análise; sem commit, push, PR ou publicação.

## Incremento Skeleton — 2026-09-04

- Role: Repo Component Agent, mesmo checklist de implementação. Alterações já
  presentes na branch `codex/angular-form-field` foram preservadas.
- Vigésima quarta saída Angular: `@tis/angular/skeleton`, formada pelo shape
  standalone decorativo e pela diretiva `tisSkeletonGroup`, que concentra
  `role="status"`, nome acessível e `aria-busy` numa única região.
- API visual: tipos text, circle e rectangle, largura opcional e composição sem
  anúncios duplicados. A animação respeita `prefers-reduced-motion` pelo CSS
  público existente; não houve mudança em tokens ou Figma.
- Evidência: tarball instalado num consumer independente, build de produção,
  38 testes unitários, entrypoint de 0,92 KiB gzip, quatro stories e regressão
  Angular completa de semântica, visual, 320/390/1280 px, light/dark e Axe.
- Portal PT-BR/EN validado em 1280/320 px, light/dark, com três marcadores de
  anatomia e quatro exemplos funcionais. A inspeção detectou e corrigiu dois
  problemas antes da entrega: `role="status"` inválido em `article` e corte
  vertical do Card em 320 px. O preview agora contém toda a composição.
- Estado: local, validado para análise; sem commit, push, PR ou publicação.

## Incremento Pagination — 2026-09-04

- Role: Repo Component Agent, mesmo checklist de implementação. Alterações de
  Form Field, Breadcrumb e Avatar preservadas na branch
  `codex/angular-form-field`, base `6b66bf2`.
- Vigésima terceira saída Angular: `@tis/angular/pagination`. Componente
  standalone controlado por `currentPage`/`totalPages`, com `pageChange`, nav,
  links numerados, Buttons anterior/próxima, ellipsis e tamanhos sm/md/lg.
- O consumidor continua responsável por URL e dados. Página atual usa
  `aria-current="page"`, fica fora da tabulação e os limites desabilitam apenas
  o controle correspondente. Exemplos atualizam página e texto reais.
- Evidência: tarball instalado num consumer independente, build de produção,
  34 testes unitários, entrypoint de 1,84 KiB gzip, três stories, comparação
  visual com o CSS estável, teclado, foco, dark e 320 px. Portal PT-BR/EN
  validado em 1280/320 px e light/dark, com seis marcadores dentro da anatomia,
  três exemplos funcionais, Axe zero e nenhuma resposta HTTP/console com erro.
- Correção visual durante QA: o marcador 3 da anatomia saía do quadro em
  320 px; passou a usar conector superior e a amostra anatômica foi compactada.
- Estado: local, validado para análise; sem commit, push, PR ou publicação.

## Incremento Breadcrumb — 2026-09-04

- Role: Repo Component Agent, mesmo checklist de implementação. Alterações de
  Form Field preservadas na branch `codex/angular-form-field`, base `6b66bf2`.
- Vigésima primeira saída Angular: `@tis/angular/breadcrumb`. Quatro diretivas
  standalone sobre nav, a e span; preserva classes/tokens públicos, href nativo,
  label acessível, página atual não focável e separadores decorativos. Sem
  dependência de router e sem mudanças no CSS consumidor ou Figma.
- Artefatos: entrypoint próprio, três stories, harness, consumer via tarball,
  dois testes unitários adicionais, regressões de teclado e stories dark/320px,
  rotas PT-BR/EN, catálogo, assets e README. A documentação compartilhada deixa
  de afirmar que o HTML usa ol (o contrato real usa nav com links).
- Seletor documental: Breadcrumb/Form Field Web apontam para o HTML existente;
  React indisponível fica desabilitado, evitando navegação a uma rota ausente.
- Gates: build Angular, instalação real/build do consumer, 25 testes unitários,
  build Storybook, bundle (Breadcrumb 0,68 KiB gzip / orçamento 3 KiB), browser
  Angular completo e Axe, build do portal, teste de fundação vNext, verify:tokens
  (1595 tokens, 0 erros, aviso de snapshot antigo), diff sem erros de whitespace.
- QA do portal: catálogo → Breadcrumb Angular em PT-BR/EN, três exemplos próprios,
  links Web válidos, 1280/320px × light/dark. Navegação do exemplo atualiza trilha
  e conteúdo; seis marcadores dentro da anatomia; CSS carregado, sem overflow da
  página, console/HTTP sem erros e zero violações nas tags WCAG do gate documental.
  Prints inspecionados: `/private/tmp/breadcrumb-*.png`. Plugin Browser ausente;
  testes executados com Playwright/Chromium existente no repo.
- Não testado: integração real com Angular Router, leitor de tela manual e
  outros motores de navegador. O componente não intercepta eventos; apenas a
  story interativa intercepta links para simular a mudança de nível localmente.
- Estado: validado localmente, não commitado/publicado. Próximo componente Angular:
  Avatar, seguido de Pagination, Skeleton, Spinner e Table. Revisão independente
  e integração dos incrementos continuam pendentes; não se declara autoaprovação.

## Incremento Form Field — 2026-09-04

- Branch: `codex/angular-form-field`, base `6b66bf2`.
- Role: Repo Component Agent; checklist `docs/agents/checklists/repo-implementation-checklist.md`.
- Escopo: vigésima saída Angular, `@tis/angular/form-field`, para o wrapper
  CSS-only existente (ADR-017). Sem alteração de Figma, tokens ou CSS consumidor.
- API: `TisFormField`, label obrigatório, controle projetado, `for`, required,
  invalid, showLabel, helperText, errorMessage e ariaDescribedby. O consumidor
  vincula os sinais públicos controlId/describedBy/ariaInvalid/ariaLabel ao
  elemento nativo e mantém valor, eventos e Angular Forms. TisInput/Select/Textarea
  já compostos não devem ser aninhados nesse wrapper.
- Entrega local: entrypoint, quatro stories Angular, consumidor instalado via
  tarball, testes unitários e browser, catálogo e rotas PT-BR/EN. O índice Angular
  passa a listar os vinte entrypoints reais, incluindo itens omitidos anteriormente.
- Gates executados: build Angular; instalação real e build de produção do consumer;
  23 testes unitários; Storybook Angular; bundle; browser Angular com Axe,
  foco no clique do label, submit vazio, remoção do erro, nome acessível oculto,
  descrições válidas e quatro stories dark/320px; `test:vnext`; build do portal;
  `verify:tokens` (0 erros, apenas aviso de snapshot antigo); `git diff --check`.
- Form Field: 1,31 KiB gzip, orçamento 4 KiB. Consumer: 411,27 KiB JS e
  223,41 KiB CSS brutos. Sem imports cruzados com as outras saídas.
- QA no servidor local `127.0.0.1:4177`: catálogo → Form Field Angular em PT-BR
  e EN; quatro iframes; 1280/320px × light/dark; input 40px, cinco marcadores
  dentro da anatomia, sem overflow de página e sem violações WCAG 2.2 AA detectadas.
  Prints inspecionados fora do repositório em `/private/tmp/field-*.png`.
- Causa detectada na inspeção visual: nova rota sem cadastro de CSS em
  `component-assets.ts` produzia anatomia sem estilos. Corrigidos os imports
  de Form Field/Input/Textarea/Select/Checkbox/Radio. Cadastro ausente agora
  lança erro de build, com regressão no teste de fundação. A anatomia reutiliza
  a contenção responsiva de Input/Textarea, sem alterar o contrato visual.
- Limites: Chromium automatizado, sem teste manual com leitor de tela. O Axe
  completo do portal também acusa heading-order e landmark-unique ao combinar
  iframes; a matriz documental usa as mesmas tags WCAG do gate existente, e
  cada story passa o Axe completo separadamente. Não é alegada conformidade
  absoluta de acessibilidade nem evidência Figma fresca.
- Estado: implementado e validado localmente; não commitado, não publicado.
  Próximo passo: revisão independente e integração deste incremento, coordenada
  com Input Ark e Table React; depois continuar os seis componentes Angular
  pendentes (Avatar, Breadcrumb, Pagination, Skeleton, Spinner e Table).

## Histórico do incremento anterior

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
