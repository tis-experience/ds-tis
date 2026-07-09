# Changelog

Todas as mudanças notáveis deste design system são registradas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

A partir de `1.0.0-beta.1`, o sistema entrou em **fase beta** — releases incrementam `1.0.0-beta.N` até decisão do owner pra dropping do tag → `1.0.0` oficial. Tags 0.x permanecem como histórico pré-beta. Regras em `docs/process-versioning.html`.

## [Não publicado]

### Adicionado
- **Guia para agents consumidores.** Nova página pública `docs/agent-consumer-usage.html` define como agents devem implementar telas em projetos consumidores usando `ds-tis/css`, `ds-tis/combobox`, `ds-tis/theme`, templates, anatomia pública, acessibilidade e checklist de evidência. `AGENTS.md` agora aponta para esse guia quando o pedido for consumo do DS fora deste repo, e `verify:agent-docs` protege a referência.

### Corrigido
- **Sidebar da documentação não corta itens ao expandir seções.** Containers de navegação e subnavegação expandidos deixam de usar `max-height` fixo e passam a abraçar o conteúdo real, evitando que opções desapareçam quando `Form` ou outras seções estiverem abertas.
- **SVGs do header renderizam sem achatamento visual.** `logo-tis-mark.svg` passa a ter viewport quadrado compatível com o slot 36×36 da topbar, e o toggle Light/Dark usa ícones Lucide stroke com anatomia `ds-button__icon` em vez de paths preenchidos inline.
- **Logo da documentação carrega corretamente em todas as rotas.** Topbar passa a usar o símbolo TIS vetorial `docs/assets/logo-tis-mark.svg` no padrão `símbolo TIS | Design System`; paths de asset em páginas geradas, ADRs e templates foram corrigidos para resolver a imagem a partir do HTML real.
- **Code blocks em páginas Markdown geradas ficam acessíveis ao teclado.** `sync:docs` adiciona `tabindex="0"` em `<pre>` gerado por Markdown, evitando violações `scrollable-region-focusable` quando blocos de código ficam roláveis no CI/Linux.

### Alterado
- **Marca do header da documentação.** Topbar passa a renderizar `símbolo TIS + TIS | Design System`, com “TIS” em destaque e “Design System” em escala menor, mantendo o símbolo vetorial e o separador acessível.
- **Visual regression com baseline por plataforma.** `test:visual` mantém a baseline canônica Linux/GitHub Actions em `tests/visual/baseline/`, passa a usar `tests/visual/baseline-darwin/` em macOS para evitar falso negativo local por rasterização/fonte, e `test:audit-scenarios` protege esse contrato.
- **Cenarios de auditoria executaveis.** Novo `npm run test:audit-scenarios` valida consumo real do pacote (`exports`, `files`, self-imports e `npm pack --dry-run`), docs de instalacao sem CDN ficticio, contrato Button/Figma para Component tokens, run de agents verificavel e build de icones em caminho com espaco.
- **Empacotamento para consumo real.** `package.json` passa a publicar CSS, templates, helper de Combobox e theme engine, com `exports` para `ds-tis/css`, `ds-tis/combobox` e `ds-tis/theme`; `js/package.json` declara ESM apenas no escopo dos módulos públicos. README remove CDN fictício e documenta instalação, import CSS, Combobox e theme engine.
- **Auditoria de Component tokens reconhece componentes CSS-only.** `audit:component-tokens` deixa de tratar `form-field/*` como erro de binding Figma, respeitando ADR-017, e o Button passa a explicitar `letter-spacing` via `--ds-button-label-letter-spacing-default`.
- **Paleta brand recalibrada para contraste com folga (seed `#0056E0`).** Escala OKLCH escurecida de forma perceptível em relação ao ajuste anterior (`#036EF2` / `#026DF1`): `brand/600` = `#0065ED` (fill primário, ~5,1:1 vs branco e ~4,9:1 vs `neutral-50` em botões), `brand/700` = `#0050DA`. **`semantic.content.brand` (light)** passa a usar `brand/700` em vez de `brand/600`, garantindo AA texto em fundos neutros e tinted (`neutral-100`, `brand-50`, `brand-100`); fills sólidos e links mantêm a separação 600/700/800. Figma (`color/brand/*`, overlays, disabled, `content/brand` Light→700 / Dark→400), JSON/CSS, Theme Playground e `foundations-colors.html` sincronizados; `test-theme-engine` valida folga de contraste.
- **Branding da documentação.** Topbar passa a exibir a marca TIS no lugar do ícone "DS" em todas as páginas HTML; home atualizada com o mesmo nome.
- **Capa Figma corrigida.** A página estava com modo Semantic **Dark**, fazendo `content/inverse` e `brand/content/default` renderizarem texto escuro sobre fundo brand — contraste quebrado no título, badge de versão e stats. Cover e página passam a **Semantic Light**; labels dos stats rebindados para `brand/content/default`. Versão atualizada para `v1.0.0-beta.6`; contagem de componentes `19`.

## [1.0.0-beta.6] — 2026-07-06

### Adicionado
- **`npm run figma:snapshot:refresh`.** Encadeia install do export `figma-snapshot.json` → `sync:tokens-from-figma` (dry-run) → `verify:tokens`. Quando o owner atualiza o snapshot do plugin, o agente deve rodar este comando imediatamente (regra em `AGENTS.md` §4.4). `agent:preflight` sinaliza export pendente na raiz.
- **Accordion público no repo.** Adicionados `css/components/accordion.css`, `docs/accordion.html`, navegação, API e documentação do componente consumível com slots de conteúdo, ícones Lucide, estados open/closed/disabled, ARIA e consumo dos tokens `component.accordion.*`.
- **Componente Accordion.** Adicionado o contrato anatômico do Accordion aprovado no Figma para `item`, `trigger`, `content`, `chevron`, `leading-icon` e `focus-ring`, com tokens `component.accordion.*`, CSS gerado, API, registry e documentação de tokens a partir da run `2026-06-29-accordion`. O componente mantém hover por stroke de brand, slot de conteúdo, ícones Lucide tokenizados e `Focus Ring` dedicado com radius `16`.
- **Aprendizado retroalimentado nos gates de agents.** Checklists de Figma Builder, Figma Auditor e Token Sync passam a exigir registro de falhas corrigidas como novos gates/testes/critérios de auditoria, incluindo bloqueio por snapshot antigo e separação explícita entre drift global e escopo do componente.
- **Componente Pagination.** Figma aprovado (run `2026-06-25-pagination`): tokens `pagination/*` (29 paths), token semântico `background.transparent`, `css/components/pagination.css`, `docs/pagination.html`, prev/next via Button Ghost Icon Only, page items com `aria-current="page"`, sizes sm/md/lg, baselines visuais e run documentada em `docs/agents/runs/2026-06-25-pagination/`.
- **Componente Combobox.** Sincroniza 16 tokens `component.combobox.*` do Figma, `css/components/combobox.css`, `docs/combobox.html`, listbox/option com tokens locais + geometria `menu/item/*`, field compartilhado (ADR-020), ARIA de combobox/listbox/option, baselines visuais e links em Select/Menu.
- **Estado da run verificável por máquina + porteiro de gates.** Cada run agora tem `state.json` com status por gate, pré-requisitos, aprovações do owner e exit codes de validadores. `agents:next-step` passa a recusar avançar enquanto o gate anterior não estiver `approved`, e o novo `agents:gate` registra status, aprovações, snapshot Figma e checks. Transforma a orquestração de conselheira em porteiro, impedindo pular etapas.
- **Matriz de contrato como artefato executável.** Novo `templates/figma-contract-matrix.md` + `agents:validate-matrix` computam `unmappedRows`, exigem `modelEvidence` por linha e sinalizam exceções sem aprovação (`--strict-exceptions`). O Figma Builder fica bloqueado enquanto a matriz não passar — atacando a causa raiz dos erros do Combobox (tokens inventados, anatomia copiada parcialmente, exceções sem owner).
- **Espinha anti-alucinação (`docs/agents/grounding.md`).** Documento único referenciado por todas as roles consolidando: nunca afirmar fato Figma sem ler+persistir em `evidence/`, binding validado por propriedade (não por total agregado), inspeção de ícone no vetor interno, foco no Focus Ring (não na borda estrutural), documentação derivada da API real, protocolo de recuperação pós-rejeição e status tripartite (contrato/documentação/visual) computado, não declarado.
- **Matriz de contrato obrigatória para Figma Builder.** O fluxo de agents agora bloqueia escrita no Figma sem uma matriz implementável de `node/path + propriedade + token/property pública + evidência de modelo + validação`, proíbe bindings por heurística de nome e exige validação linha a linha antes de entregar para auditoria.
- **Workflow designer-facing para agents de DS.** `docs/agents/product-designer-workflow.md` define uma entrada otimizada para Product Designers, onde o Orchestrator esconde scripts, terminal e handoffs técnicos e conduz o fluxo por necessidade → planejamento → Figma → auditoria → aprovação → repo → testes → web.
- **Protocolo portátil de orquestração multi-agent.** `docs/agents/protocol.md`, `docs/agents/orchestration.md`, adapters por IA e scripts `agents:create-run`, `agents:validate-run` e `agents:next-step` permitem criar runs versionadas em `docs/agents/runs/`, passar artefatos entre roles sem copy/paste e replicar o fluxo em Codex, Claude, Gemini, Cursor ou outra IA.
- **Menu e padrão Action Menu documentados no repo.** Adicionados CSS e página de docs para Menu como base de comandos e Action Menu como composição recomendada com Button, roles ARIA e exemplos com ícones Lucide.
- **Gate permanente de paridade para documentação Figma.** O processo de agents agora obriga consultar páginas maduras como modelo antes de criar/editar documentação visual, manter textos com altura automática/height hug, evitar `clipsContent=true` em frames documentais e auditar contagens objetivas de textos fixos, clips, nós soltos e divergências contra o modelo.
- **Atalhos oficiais para agents especializados.** `docs/agents/quick-commands.md` documenta comandos curtos como "Audite Menu como Figma Auditor" e "Execute a spec aprovada como Figma Builder", resolvendo cada frase para role, checklist, template e bloqueios sem exigir prompts longos em todo uso.
- **Estrutura de agents especializados para DS Core.** Adicionada `docs/agents/` com roles, checklists e templates para separar DS Architect, Figma Builder, Figma Auditor, Token Sync Agent, Repo Component Agent e Release Agent; `docs/process-ai-component-workflow.md` e `AGENTS.md` passam a exigir declaração de role/checklist e reforçam que quem constrói não aprova o próprio trabalho.
- **Processo de agentes para novos componentes e padrões.** `AGENTS.md` agora exige isolamento do estado atual, benchmark, classificação, brief/spec aprovados, padrão de página Figma validado e draft Figma antes de qualquer escrita em Figma ou repo; `docs/process-ai-component-workflow.md` documenta checkpoints, bloqueios, padrão de frame raiz/seções e aprovação por gate para evitar execução prematura por agentes IA.
- **Escala semântica de space expandida.** `semantic.space` passa a incluir `3xl` a `6xl` (`32/40/48/64px`) e `semantic.space.section` sobe para `48/64/80/96/120px` com novo `section.2xl`, mantendo aliases Figma ↔ JSON para gaps, paddings e separação macro.

### Corrigido
- **Theme Playground: modo reverte para dark após alternar light/dark e mudar cor.** A inicialização do playground passa a rodar em `DOMContentLoaded` (depois de `initThemeSwitcher` em `main.js`), `syncModeUI` alinha toggles do header/playground e `localStorage` após cada `applyTheme`, e o listener do header deixa de ler `data-mode` stale antes do toggle global.
- **Theme Playground: controles do painel alinhados ao padrão de formulário do DS.** Campos passam a usar `ds-field`, `ds-input`/`ds-input__field` e `ds-select`/`ds-select__field` em vez de estilos ad hoc; apenas o color picker nativo mantém CSS local mínimo.
- **Theme Playground: corner radius não atualizava após a primeira troca de preset.** `applyTheme` agora remove vars inline obsoletas (ex.: `--ds-button-radius-default` e `--ds-radius-md` do preset `soft`) antes de aplicar o próximo preset.
- **Theme Playground: combobox de fontes alinhado ao componente Combobox do DS.** Campos de tipografia passam de `input` + `datalist` (chevron nativo do browser) para `ds-combobox` com chevron Lucide, listbox popup e suporte a digitação livre.
- **Combobox: anatomia de popup + módulo JS compartilhado.** Wrapper `.ds-combobox-anchor` posiciona o listbox abaixo do field; `[hidden]` e `.ds-combobox--open` controlam visibilidade e chevron; `js/combobox.js` implementa abrir/fechar exclusivo, blur, filtro e teclado (usado no Theme Playground).
- **Form controls: radius estável no focus.** Combobox deixou de trocar `border-radius` para `radius-lg` em `:focus-within`; Input, Select e Textarea fixam `border-radius: var(--ds-field-radius)` no focus para não “arredondar” visualmente em relação ao estado default.
- **Theme Playground: exportação vazia e UI de export.** `renderContrast` quebrava em overlays `rgba` e interrompia `renderExports`; contraste agora compõe overlay sobre superfície. Seção Export usa layout próprio (radius fixo, sem conflito com tabs de docs) e explica CSS / JSON / Link.
- **Theme Playground: preview de Card sem variante.** Card passa a usar `ds-card--default` com anatomia completa (`__container`, `__header`, `__footer`); a borda só existe nas variantes do componente, não no `.ds-card` base.
- **Overlays toned desacoplados da paleta neutra (base para theme playground).** `foundation.color.overlay.blue-600.{12,20,28}` e `overlay.blue-400.{15,25,32}` renomeados para `overlay.brand-600.*` e `overlay.brand-400.*`, e `semantic.toned.background.*` (light/dark) passam a referenciá-los. Isso faz os botões/badges `toned` derivarem da paleta brand customizável em vez de um azul hardcoded — pré-requisito para personalização global de marca em tempo real. Corrige também o dark, que referenciava por engano os overlays do light (mesmo alpha); agora usa `brand-400.{15,25,32}` e os overlays antes órfãos passam a ter uso. Valores rgba inalterados (brand default = blue), sem regressão visual. **Figma:** variables `color/overlay/blue-*` renomeadas para `color/overlay/brand-*`; aliases `toned/background/*` no modo Dark atualizados para `brand-400`. Ver nota de atualização na ADR-007.
- **Estabilização Accordion, Combobox e Pagination (run `2026-07-06-stabilize-recent-components`).** Auditoria paralela Figma↔repo com snapshot fresco; gates `test-combobox-docs` e `test-pagination-docs`; documentação alinhada à API Figma e tokens canônicos.
- **Documentação Pagination.** Corrige paths `component.pagination.page.*` → `item.*`, expande mapeamento de tokens (29 paths) e adiciona seção API no Figma (`Size`, `Page Number`).
- **Documentação Combobox.** Adiciona API no Figma, exemplo Read-only, classes `__icon`/`__clear`/`--readonly`; `focus-visible` em `.ds-combobox__option`; `max-block-size` do listbox via `calc(var(--ds-dimension-128) * 2)`.
- **Documentação Accordion.** Adiciona seção Boas práticas (`ds-dodont`) e classe `ds-accordion__item--disabled` na tabela pública.
- **Docs de overlay brand e milestones.** `foundations-colors.html` e `control-sizing.html` atualizam referências para `--ds-overlay-brand-*`; inventário passa a listar Table, Toast e Popover como próximos componentes.
- **Accordion sincroniza API e comportamento.** A documentação passa a refletir a propriedade pública `Title` do Figma, documenta `Content Slot`, `Show Leading Icon`, `Leading Icon`, `State` e `Open`, e o site adiciona helper interativo para sincronizar `aria-expanded`, `hidden` e `data-state` em expand/collapse. Novo gate `test-accordion-docs` impede regressão para `Label` como propriedade pública e valida o contrato de comportamento.
- **Documentação de Combobox, Menu e Pagination.** Páginas completas no padrão Select/Breadcrumb (Quando usar, Anatomia, Padrão com `ds-preview`, tamanhos/estados, Boas práticas `ds-dodont`, Diretrizes de conteúdo, Mapeamento tokens, Classes CSS, Teclado, Accessibility e Relacionados); navegação Components em `js/main.js` e grid de `index.html` reordenados alfabeticamente (Icons primeiro, Menu e Alert incluídos).
- **CI de PR com check obrigatório.** O workflow `Verify tokens` passa a rodar em todo PR/push para `main`, evitando bloqueio por check requerido ausente quando a mudança não toca arquivos de tokens.
- **Snapshot exporter audita uso real de Component tokens.** Exporter `0.2.0` passa a contar variables usadas sob ancestrais `COMPONENT`/`COMPONENT_SET`; `verify:figma-structure` bloqueia snapshots sem `structureAudit.variableUsage` atualizado antes de aceitar a auditoria.
- **Drift Figma/JSON eliminado para tokens recentes.** Sincronizados `dimension/0`, `dimension/1`, `space.none`, `space.hairline`, padding de overlay do Modal, backgrounds de Menu Item, Divider inset, Field compartilhado, Tooltip e aliases de Card/Menu, preservando a cadeia `Foundation -> Semantic -> Component -> CSS`.
- **Registry completo para novos contratos.** Metadados de registry foram preenchidos para Accordion, Pagination, Combobox, Divider, Field, Menu e novos tokens Foundation/Semantic, removendo TODOs e mantendo `verify:registry` sem pendências.
- **Card espelha container, media slot e estados interativos do Figma.** Adicionados contratos `card/container/*`, `card/footer/gap/*` e `card-interactive/*`; CSS passa a usar container interno com padding `20px`, gap `12px`, media full-bleed opcional e estados hover/focus/selected derivados do outlined.
- **Modal aplica padding/gap no container real.** `.ds-modal` volta a consumir `--ds-modal-container-padding-*` e `--ds-modal-container-gap-*` na superfície principal, deixando header/body/footer como slots internos sem padding duplicado e alinhando o espaçamento ao component set do Figma.
- **Modal close alinha posição ao Figma.** `.ds-modal__close` passa a ficar a `8px` do topo/direita da superfície em todos os tamanhos, compensando o padding do header como no component set vivo.
- **Tabs aplicam radius no focus ring.** `.ds-tab:focus-visible` passa a consumir `--ds-tabs-focus-ring-radius-default`, alinhando o repo ao token já definido no Figma.
- **Cards Faça/Não faça ajustam altura pelo próprio conteúdo.** O grid compartilhado dos docs deixa de esticar o card menor até a altura da coluna vizinha e reduz o espaço entre label e descrição.
- **Visual regression passa a rodar no CI.** `test.yml` agora executa `scripts/test-visual.mjs` após a auditoria a11y e publica `tests/visual/actual` + `tests/visual/diff` como artifact quando houver falha; a baseline visual foi atualizada para o estado atual validado em produção.
- **Baseline de acessibilidade zerada.** Ajustados contrastes em feedback `subtle` no dark mode, links do site de documentação e foco de blocos de código roláveis; `test:a11y` agora passa com `critical=0`, `serious=0`, `moderate=0`, `minor=0` e `.a11y-baseline.json` fica sem violações aceitas.
- **Auditoria estrutural do Figma passa a escolher o snapshot mais recente.** `verify:figma-structure` agora aceita `figma-snapshot.json` sem ponto e, quando não recebe `--snapshot`, escolhe o arquivo mais novo entre os snapshots locais conhecidos, evitando validar acidentalmente um `.figma-snapshot.structure.json` antigo.
- **Pendências de maturidade e milestones removem itens stale.** `process-versioning` passa a marcar Form Field CSS-only, gates locais de snapshot, registry sem warnings, visual regression local e a11y tests como entregues; `component-inventory` milestones atualizados para próximos componentes reais (Table, Toast, Popover).

## [1.0.0-beta.5] — 2026-06-12

### Corrigido
- **Documentação renderiza ícones como Lucide outline.** Button, Input, Select, Alert, Avatar, Modal, Tooltip e Form Field deixam de depender de preenchimento/ligaduras antigas e passam a usar SVG/stroke compatível com a biblioteca de ícones atual.
- **Tabs sem radius no indicador ativo.** O repo remove o arredondamento visual residual do indicador para seguir o contrato atual do Figma.
- **Sincronização de tokens sem avisos falsos.** `verify:tokens` passa a reconhecer variáveis CSS com `_` e elimina os avisos indevidos de stroke width `1_5`, `1_75`, `2_25` e `2_5`.
- **Input Text, Select e Textarea documentam o novo contrato de propriedades do Figma.** `Disabled` passa a ser valor de `State` (`Default`, `Hover`, `Focus`, `Disabled`), enquanto `Filled`, `Error` e `Read-only` ficam como propriedades separadas com regras explícitas de combinação.
- **Input Text e Select com área clicável expandida para todo o container.** O campo nativo agora cobre o padding interno do wrapper, incluindo top/bottom, áreas laterais, espaço vazio e regiões de ícone/adornment decorativo, mantendo ícones e chevron com `pointer-events: none`.
- **Documentação de estados dos controles de formulário padronizada.** Input, Select, Textarea, Checkbox, Radio e Toggle agora documentam os estados visuais com o mesmo modelo de tabela (`State`, `CSS trigger`, `Visual change`, `Token`); Checkbox, Radio e Toggle também tiveram o mapeamento de tokens atualizado para a camada `component.*` em vez dos atalhos semânticos antigos.
- **Form Field e anatomia de Input alinhados ao Figma.** `.ds-field--error` agora propaga borda/focus/hover de erro para Input e Select compostos; a linha de erro usa ícone outline via CSS mask com gap/stroke do contrato atual, e a anatomia do Input representa o estado de erro com ordem Error Message → Helper Text.
- **Input Text, Select e Textarea espelhados com error-hover e readonly focus.** Adicionados `feedback/error/border/hover`, `component.{input,select,textarea}.bg.error-hover`, `border-color.error-hover` e `focus-ring.color.readonly`; CSS passa a aplicar hover específico em erro, mantém error acima de filled e usa focus ring neutro em readonly.
- **Hover de Checkbox, Radio e Toggle espelhado do Figma.** Adicionados estados `hover` aos Component tokens de box/control/track/thumb/mark/dot e semânticos `surface.hover`, `content.hover` e `primary.content-hover`; CSS aplica hover apenas no controle real, sem overlay/target hover inventado, e mantém `focus-visible` separado.
- **Checkbox, Radio e Toggle completos aplicados aos Component tokens.** Espelhadas no repo as 120 variables vivas de `checkbox/...`, `radio/...` e `toggle/...` no Figma: cores de label/description/helper, fills/borders por estado, mark/dot/thumb, track, focus ring, content gap e target gap/radius. CSS passa a consumir `--ds-checkbox-*`, `--ds-radio-*` e `--ds-toggle-*` para esses contratos; registry, API, docs, LLMs e snapshot Figma↔JSON foram atualizados.
- **Frames externos de ícone espelhados do Figma.** Adicionados `input/icon-frame/padding-x/default`, `select/icon-frame/padding-x/default`, `select/chevron-frame/padding-x/default` e `form-field/error/icon-frame/padding-x/default` aos Component tokens; CSS passa a representar o wrapper externo com padding horizontal sem confundir esse respiro com o tamanho do SVG Lucide.
- **AGENTS.md reforça regras de edição de componentes no Figma.** Adicionado checklist obrigatório para preservar propriedades públicas do component set: textos editáveis via painel, ordem size menor→maior, pares booleano→campo dependente, instâncias Lucide/tokenizadas para ícones, validação de `componentPropertyReferences` e regra específica para Select não duplicar chevron/right icon.
- **Fields single-line com respiro interno e adornments proporcionais.** Input Text e Select voltam a usar `text-frame/padding-x=4px` além do padding do Field, mantendo origem visual de texto em `12/12/16px`; ícones e chevrons usam `size`, `stroke-width` e frame padding tokenizados, alinhando Figma e CSS.
- **Textarea completo aplicado aos Component tokens.** `component.textarea` agora cobre bg, bordas, radius, focus ring, conteúdo, placeholder, label, required, helper, spacing e tipografia; `Textarea` passa a consumir `--ds-textarea-*` no CSS em vez de `Semantic` direto, preservando `field.min-height` como contrato anatômico multilinha e mantendo o contador como CSS-only por não existir no component set vivo do Figma.
- **Form Field renderiza o ícone da mensagem de erro.** Adicionados `component.form-field.error.gap.default`, `component.form-field.error.icon.{color,size,stroke-width}.default` e `component.form-field.error.icon-frame.padding-x.default` ao contrato CSS-only; `.ds-field__error` renderiza a linha de erro com ícone automático + texto, alinhada ao Figma vivo de Input Text, Select e Textarea.
- **Select completo aplicado aos Component tokens.** Criadas 89 novas variables `select/...` na collection Component do Figma e normalizadas as 3 alturas existentes, totalizando 92 tokens para bg, bordas, radius, focus ring, conteúdo, placeholder, chevron, ícone leading, label, required, helper, stack, label-row, sizing, padding e tipografia. Os 18 variants vivos do Select foram bindados nesses tokens; JSON/CSS/docs/API passam a consumir `component.select.*` / `--ds-select-*`, alinhando padding `8/8/12`, padding-y `8/10/12`, gap interno `4/4/8`, text frame `4px` e chevron/ícone `16/20/24` ao Figma vivo.
- **Input Text md gap sincronizado com Figma.** `component.input.gap.md` passa de `semantic.space.sm` para `semantic.space.xs`, alinhando o Field Medium ao gap vivo de `4px` nos variants do Input Text.
- **Input Text completo aplicado aos Component tokens.** `component.input` agora cobre bg, bordas, radius, focus ring, conteúdo, placeholder, ícone, label, required, helper, stack, label-row, sizing, padding e tipografia; os variants vivos no Figma foram bindados nesses atributos e o CSS passa a consumir `--ds-input-*` no wrapper e no uso composto com `.ds-field`.
- **Input Text sizing/spacing aplicado aos Component tokens.** Criadas variables `input/{padding-x,padding-y,gap}`, `input/icon/{size,stroke-width}`, `input/icon-frame/padding-x` e `input/text-frame/padding-x` no Figma, com Code Syntax WEB e binds nos variants do Input Text. JSON/CSS/docs passam a consumir `component.input.*` junto dos contratos compartilhados de Field/Form Field.
- **Button padding e gap sincronizados com Figma.** `component.button.padding-x.{sm,md,lg}` passa a seguir `8/12/16px` e `component.button.gap.{sm,md,lg}` passa a seguir `2/4/8px`, alinhando JSON, CSS gerado, documentação e API às variables vivas do Button no Figma.
- **Button sm com frame de ícone por tamanho.** Na época, o Button passou a ter frame de ícone por tamanho; esse contrato foi depois superado por `component.button.icon.size.{sm,md,lg}` e `component.button.icon.stroke-width.{sm,md,lg}`. CSS também corrige Button somente-ícone para não herdar `min-width` textual e renderizar quadrado.
- **Checkbox estrutural/focus aplicado aos Component tokens anatômicos.** Na época, o Checkbox adicionou tokens próprios para target, box e focus ring; esse contrato foi depois simplificado para manter no componente apenas o radius do focus ring e consumir `component.focus-ring.*` para cor/largura. CSS passa a consumir `--ds-checkbox-*` nesses contratos.
- **Button Focus Ring por estilo no Component token.** Na época, Success e Danger tinham cor de focus ring própria no componente; esse contrato foi depois consolidado em `component.focus-ring.color.*`, mantendo no Button apenas o radius anatômico.
- **Button Figma/CSS aplicado aos Component tokens anatômicos completos.** Criado `component.button` para a superfície principal height/min-width/padding/gap/radius/border, background por estilo/estado, border color de Outline, cor de conteúdo, tipografia do label, frame/size de ícone, icon-only e focus ring. Os 216 variants vivos do Button no Figma agora usam Component tokens nos atributos públicos; CSS passa a consumir `--ds-button-*`, corrige `Brand/Large/Focused` com padding vertical incorreto e remove opacidade disabled global em favor de cores de estado.
- **Form Field aplicado aos Component tokens CSS-only.** Criado `component.form-field` para gaps, cores e tipografia de label, required, helper e error; o CSS passa a consumir `--ds-form-field-*` sem criar componente visual no Figma, respeitando ADR-017. Helper e error também foram alinhados ao Figma vivo para `body/xs` com `line-height/xs`.
- **Divider Figma/CSS aplicado aos tokens Component anatômicos.** Criado `component.divider.line` para cor, espessura e raio da linha; os variants `Orientation=Horizontal` e `Orientation=Vertical` vivos do Figma agora usam tokens Component nesses contratos. CSS passa a consumir `--ds-divider-*`; comprimento segue contextual (`100%`/container) e não vira token.
- **Breadcrumb Figma/CSS aplicado aos tokens Component anatômicos.** Criado `component.breadcrumb` para gap da lista, gap/raio do item, tipografia do rótulo e tipografia do separador; `Breadcrumb` e `Breadcrumb Item` vivos do Figma agora usam tokens Component nesses contratos. CSS passa a consumir `--ds-breadcrumb-*`; separador é alinhado ao Figma com `content.subtle` e tipografia `body/xs regular`.
- **Tabs Figma/CSS aplicado aos tokens Component anatômicos.** Criado `component.tabs` para borda da lista, spacing do item, altura do indicador, radius do focus ring, tipografia do rótulo e espaçamento do painel; `Tab Item` e `Tab Bar` ativos no Figma agora usam tokens Component nesses contratos. CSS mantém o indicador ativo sem border-radius; cores e focus ring permanecem Semantic/Focus Ring.
- **Modal Figma/CSS aplicado aos Component tokens anatômicos.** Criado `component.modal` para overlay, superfície principal, header, body, title, footer e close; as 3 variantes vivas do Figma (`Small`, `Medium`, `Large`) agora usam Component tokens nesses contratos. CSS passa a consumir `--ds-modal-*`, remove `z-index` hardcoded via `semantic.z.modal` e aplica `component.modal.shadow.default` em vez de depender da utility `.ds-elevation-4`.
- **Card Figma/CSS aplicado aos Component tokens anatômicos.** Criado `component.card` para radius/border-width da superfície principal, padding/gap do header, padding do body e tipografia de title/subtitle/body; as 3 variantes vivas do Figma agora usam Component tokens nesses contratos. CSS passa a consumir `--ds-card-*`; cores e shadow permanecem Semantic.
- **Alert Figma/CSS aplicado aos Component tokens anatômicos.** Criado `component.alert` para a superfície principal padding/gap/radius/border-width, icon/close size e stroke-width, content gap e tipografia de title/description; os variants vivos do Figma agora usam Component tokens nesses contratos. CSS passa a consumir `--ds-alert-*`; documentação remove mappings antigos/stale de spacing e typography Foundation.
- **Badge Figma/CSS aplicado aos Component tokens anatômicos.** Criado `component.badge` para padding/gap/radius/border-width da superfície principal e tipografia do label; os 12 variants vivos do Figma (`6` cores × `2` estilos) agora usam Component tokens nesses contratos. CSS passa a consumir `--ds-badge-*`; documentação corrige inventário de cores para 6 e remove mappings antigos/stale.
- **Tooltip Figma/CSS aplicado aos Component tokens anatômicos.** Criado `component.tooltip` para padding/radius do content, tipografia do label e dimensões da seta (`base/depth`); os 4 variants `Position` do Figma agora usam Component tokens nesses contratos. CSS passa a consumir `--ds-tooltip-*`; cores e z-index permanecem Semantic.
- **Skeleton Figma/CSS aplicado aos Component tokens anatômicos.** Criado `component.skeleton.{text,circle,rectangle}` para height/size/radius dos 3 variants vivos do Figma; Text e Rectangle usam alturas anatômicas específicas (`12/120`) e Circle usa `semantic.size.xl` (`40`). CSS passa a consumir `--ds-skeleton-*`; documentação corrige background para `semantic.background.subtle` e remove mappings antigos de radius Foundation.
- **Spinner Figma/CSS aplicado aos Component tokens anatômicos.** Criado `component.spinner.size.{sm,md,lg}`, `component.spinner.radius.default` e `component.spinner.ring.stroke-width.default`; os 6 variants do Spinner no Figma agora usam Component tokens na superfície principal, Track e Indicator. CSS passa a consumir `--ds-spinner-*`; documentação corrige tamanhos `16/24/32` e motion para `duration.slower` + `ease.linear`.
- **Avatar Figma/CSS aplicado aos Component tokens anatômicos.** Criado `component.avatar.size.*`, `component.avatar.radius.default`, `component.avatar.initials.{font-size,line-height,font-weight}.*` e `component.avatar.icon.size.*`; os 6 variants do Avatar no Figma agora usam Component tokens para a superfície principal e tipografia anatômica. CSS passa a consumir `--ds-avatar-*`, corrige icon sizes para `20/24/32` e documentação corrige `lg` de `56px` para `64px`.
- **Textarea Figma/CSS aplicado aos Component tokens de field min-height.** Criado `component.textarea.field.min-height.{sm,md,lg}` e bindado nos 18 `Field` variants do Textarea no Figma (`80/96/120`). CSS passa a consumir `--ds-textarea-field-min-height-*`; documentação corrigida removendo valores antigos `120/160` que não batiam com Figma vivo. `foundation.dimension.120` foi adicionado como primitivo para suportar o tamanho Large.
- **Toggle Figma aplicado aos Component tokens anatômicos bindáveis.** Os 18 variants do component set `Toggle` agora usam `component.toggle.target.height.{sm,md,lg}` no `minHeight` da superfície principal, preservando `component.toggle.track.width.{sm,md,lg}` e `component.toggle.track.height.{sm,md,lg}` em `Track` width/height. Validação Figma viva: sm `32 / 28×16`, md `40 / 44×24`, lg `48 / 56×32`, sem problemas de binding. `component.toggle.thumb.inset.default` permanece como geometria `x/y` do Thumb, porque posição `x/y` não é campo bindável por Figma Variables.
- **Radio Figma aplicado aos Component tokens anatômicos.** Os 18 variants do component set `Radio` agora usam `component.radio.target.height.{sm,md,lg}` no `minHeight` da superfície principal, preservando `component.radio.control.size.{sm,md,lg}` em `Control` width/height. Validação Figma viva: sm `32/16`, md `40/20`, lg `48/24`, sem problemas de binding.
- **Checkbox Figma aplicado aos Component tokens anatômicos.** Os 27 variants do component set `Checkbox` agora usam `component.checkbox.target.height.{sm,md,lg}` no `minHeight` da superfície principal, preservando `component.checkbox.box.size.{sm,md,lg}` em `Control` width/height. Validação Figma viva: sm `32/16`, md `40/20`, lg `48/24`, sem problemas de binding.
- **API CSS e docs alinhadas aos nomes canônicos de Component.** Classes públicas do Button renomeadas de `.ds-btn*` para `.ds-button*` sem alias legado, porque o DS ainda está em beta e só a documentação consome os componentes. A documentação de Button/Control Sizing também deixou de anunciar tokens antigos inexistentes de height/padding/font/icon e passa a publicar o contrato real `component.button.height.*` / `--ds-button-height-*`.
- **Tokens semânticos inválidos do Toggle removidos.** A tentativa anterior criou `semantic.control.toggle.*` diretamente no JSON sem variável correspondente no Figma, gerando `DRIFT_FROM_SOURCE` em `verify:tokens`. Esses aliases foram removidos de `tokens/semantic/{light,dark}.json` e do registry; `toggle.css` agora consome os Component tokens do piloto em vez de inventar `semantic.control.toggle.*`.
- **Documentação normalizada conforme auditoria estrutural.** Labels de tabela foram padronizados (`Variável CSS`, `Descrição`, `Critério WCAG`, `Função`, `Referência`), README atualizado para 19 ADRs, páginas simples de componentes ganharam anatomia curta, `Form Field` declara o contrato CSS-only na própria página, e referências stale a `semantic.content.secondary/tertiary` foram migradas para `semantic.content.default/subtle`.
- **Escala de Elevation/Shadow oficializada em 4 níveis + reset.** Removidos `foundation.shadow.xs` e `foundation.shadow.2xl` por não terem uso nem Effect Style correspondente. `foundation.shadow.{sm,md,lg,xl}` preserva exatamente os parâmetros dos Effect Styles Figma `elevation/1..4`, e `foundation.shadow.none` permanece como reset técnico de `.ds-elevation-0`. A página de Elevation agora documenta o papel de cada nível e o mapping Figma ↔ CSS. Resolve #19 / P3-2 da auditoria Figma↔Repo.
- **Documentação de Elevation mantém nomes oficiais numéricos.** A tabela de `foundations-elevation.html` agora mostra apenas os níveis `0` a `4` como nomes oficiais, sem rótulos descritivos não existentes no Figma/JSON.
- **Documentação de Elevation separa conceito de utility CSS.** A tabela principal agora segue o padrão de Foundation (`Nível`, Figma, sombra, surface recomendada e papel), enquanto `.ds-elevation-*` fica documentado como utility auxiliar que aplica apenas `box-shadow`.
- **Foundation `disabled/*` alinhado à hierarquia Figma.** Tokens `color.disabled.{brand,success,error}-{light,dark}` migrados para paths aninhados (`disabled.brand.light`, `disabled.success.dark`, etc.), adicionados `disabled.brand.toned.{light,dark}` e criado `semantic.toned.background.disabled` para espelhar `toned/background/disabled` no Figma. CSS gerado preserva os nomes consumíveis (`--ds-color-disabled-brand-light`) e adiciona `--ds-toned-background-disabled`. Resolve #18 / P3-1 da auditoria Figma↔Repo.
- **Tabs alinhado ao dump Figma de `Tab Item` + `Tab Bar`.** CSS agora espelha o gap de 10px antes do indicador ativo (`--ds-space-control-padding-10`), usa divider `--ds-overlay-default` como o `Tab Bar`, e aplica radius `md` no focus ring. Docs de Tabs atualizadas para remover tokens antigos (`content.secondary`, `focus.ring.*`, `overlay.subtle`) e documentar o mapeamento atual. Resolve #21 da auditoria Figma↔Repo.
- **Required asterisk de Input Text, Select e Textarea usa token semântico de conteúdo de erro.** Figma rebindado em 48 nós `Required` (`12` Input Text, `18` Select, `18` Textarea) de `feedback/error/background/default` para `feedback/error/content/default`. CSS compartilhado `.ds-field__required`, `.ds-field__error` e `.ds-field--error .ds-field__label` agora consome `--ds-feedback-error-content-default`, evitando token de background como cor de texto. Resolve #20 / P3-3 da auditoria Figma↔Repo.
- Referências órfãs de motion em docs (`--ds-duration-normal`) substituídas por `--ds-duration-moderate`, alinhando `foundations-motion.html` e `docs/layout.css` à escala atual (`instant/fast/moderate/slow/slower`) e liberando `npm test`.
- Referências órfãs de tokens de cor (`content-secondary`, `content-tertiary`) no `index.html` que causavam falha no pipeline de CI.
- **Alert Subtle icon tematizado por feedback** (Success/Warning/Error/Info). Antes: ícone inheritava `color: content-default` do wrapper — saía cinza, sem distinção visual. Agora segue Figma: ícone usa `feedback/X/content/default` em CSS + Figma rebindado de `feedback/X/background/default` (token de bg usado como text — uso semanticamente errado, mesmo padrão de P1-2). 4 variants Figma rebindadas via `use_figma`. Resolve P2-6.

- **Doc ↔ JSON drift check em `verify:tokens`** (`scripts/lib/doc-token-drift.mjs`). Detecta automaticamente quando doc descreve tokens/valores que JSON não tem — exatamente o sintoma que escondeu a drift de motion por meses. Categorias: `DOC_ONLY_TOKEN` (error — doc cita token inexistente), `VALUE_MISMATCH` (warning — doc e JSON com valores diferentes), `JSON_ONLY_TOKEN` (info). Roda automaticamente em `npm run verify:tokens`. Limpou 3 drifts pré-existentes durante implementação:
  - `foundation.border.width.0` removido de `foundations-borders.html` (token zero eliminado em 0.7.0).
  - `foundation.opacity.0` removido de `foundations-opacity.html` (idem).
  - `foundation.radius.9999` em `foundations-radius.html` corrigido pra `999` (typo histórico).

- **Motion completo: JSON alinhado com doc `foundations-motion.html`** (eliminada drift histórica). Antes: doc descrevia 5 durations × 5 easings; JSON tinha 3 durations × 1 ease com nomes/valores divergentes. Agora alinhado:
  - **Durations** (foundation + semantic): `instant` (0ms), `fast` (150ms), `moderate` (250ms — substitui `normal=200`, renomeado + recalibrado), `slow` (400ms — recalibrado de 300), `slower` (600ms).
  - **Easings** (foundation já tinha; semantic estava só com `default`): `default`, `in`, `out`, `in-out`, `linear` (5 curves).
  - **Removidos**: `foundation.duration.normal` e `semantic.motion.duration.normal` (zero consumers em CSS — eram tokens órfãos).
  - **Impacto em consumers**: zero — todos os 30 usos em CSS de componente eram `motion-duration-fast` (mesmo valor 150ms) e 1 de `motion-duration-slower` (Spinner). `normal` e `slow` (antigo 300) tinham 0 usos.
  - Registry atualizado com 8 entries novas + 3 ajustes; per ADR-016 (motion CSS-only) edição direta no JSON é legítima.

- **Spinner: nova rotação tokenizada (`motion-duration-slower` + `motion-ease-linear`)**, em vez do `0.6s linear` literal. Tokens criados pra cobrir o caso de loops contínuos que `motion-duration.{fast,normal,slow}` (150-300ms, transições de estado) não atende. Doc `foundations-motion.html` já documentava `slower=600ms` e `ease.linear` mas JSON estava sem — agora alinhado:
  - `foundation.duration.slower = 600ms`
  - `foundation.ease.linear = [0,0,1,1]`
  - `semantic.motion.duration.slower → {foundation.duration.slower}`
  - `semantic.motion.ease.linear → {foundation.ease.linear}`
  - Registry com 4 entries novas; per ADR-016 (motion CSS-only) edição direta no JSON é legítima.

- **Spinner: revertido animation duration/timing para `0.6s linear`.** Em rodada anterior eu (Claude) tinha trocado por `motion-duration-slow` (300ms) + `motion-ease-default`, semantizando indevidamente. Resultado: rotação 2x mais rápida e oscilante (ease quebra rotação constante). Tokens `motion.duration.*` são pra transições de estado (150-300ms), não pra loops contínuos. Spinner precisa de literal `0.6s linear` por design — comentário adicionado no CSS explicando.
- **Field paddings horizontais descem um nível em Input/Select/Textarea.** User feedback: paddings laterais aparentavam maiores que deveriam. Aplicado em Figma + CSS:
  - sm: `space.md` (12) → `space.sm` (8)
  - md: `space.lg` (16) → `space.md` (12)
  - lg: `space.xl` (20) → `space.lg` (16)
  - Figma: 108 paddings rebindados (Input Text, Select, Textarea × 3 sizes × variants).
  - CSS: input.css, select.css, textarea.css atualizados.
  - Verticais ficam como estão.

### Adicionado

- **Card e Modal ganham slots nativos no Figma.** Card mantém as variantes por `Style` e passa a expor `Content Slot` e `Footer Slot` como properties `SLOT`, coexistindo com `Content`, `Title` e `Description`; Modal mantém as variantes por `Size` e passa a expor `Content Slot` nativo junto de `Title`, `Description` e `Content`. Repo documenta os novos contratos com `ds-card__description`, `ds-card__footer`, `ds-modal__heading` e `ds-modal__description`.
- **ADR-019 — Component tokens como contrato anatômico.** Reintroduz a camada Component no modelo Foundation/Core → Semantic/System → Component → implementação, alinhando o Core ao padrão de mercado para component tokens. Component deixa de ser wrapper mecânico e passa a documentar anatomia pública (`target`, `box`, `track`, `thumb`, etc.); aliases 1:1 para Semantic são permitidos quando representam contrato estável do componente. Pipeline preparado para `tokens/component/*.json` e `css/tokens/generated/component.css`, com docs/API/llms atualizados.
- **Piloto Component materializado em Figma + JSON para Checkbox, Radio e Toggle.** Criada a collection Figma `Component` com modo `Default` e 22 variables agrupadas por componente (`checkbox/...`, `radio/...`, `toggle/...`): target heights 32/40/48, box/control 16/20/24, track Toggle 28×16 / 44×24 / 56×32 e thumb inset 2px. Checkbox/Radio `Control` e Toggle `Track` foram rebindados às novas variables; `tokens/component/{checkbox,radio,toggle}.json`, registry, CSS consumidor e snapshot Figma foram atualizados.
- **Alturas Component para controles single-line.** Button, Input Text e Select ganharam `component.<componente>.superfície principal.height.{sm,md,lg}` aliasados a `semantic.size.{lg,xl,2xl}`. Figma foi rebindado no Button e no `Field` visual de Input/Select; CSS consumidor passou a usar `--ds-button-height-*`, `--ds-input-height-*` e `--ds-select-height-*`.

- **Guia editorial de documentação** (`docs/documentation-guidelines.md`). Define templates para páginas Foundation, Component, Process e System, exceções permitidas, labels oficiais de tabela e regra authored vs generated.
- **Auditoria estrutural da documentação** (`audit/docs-structure-audit.md`). Classifica páginas por tipo (Foundation, Component, Process, System), identifica inconsistências editoriais e define uma sequência recomendada de PRs para normalização.

- **ADR-018 — Renomear `content.{default,secondary,tertiary}` para `content.{strong,default,subtle}`.** Único conjunto de tokens do DS com naming ordinal foi alinhado ao vocabulário descritivo das demais categorias (`border.{strong,default,subtle}`, `surface.*`, `background.*`). Strict rename — valores 100% preservados, só nomes mudaram. Migração: keys em `tokens/semantic/{light,dark}.json`, entries em `tokens/registry.json`, `--ds-content-*` em CSS de componente/base e em HTMLs/MDs de docs (sed-replace via 3 passos com placeholder pra evitar clash), Variables `content/{default,secondary,tertiary}` na collection Semantic do Figma via `use_figma` (bindings auto-seguem por ID). `npm run build:tokens` + `build:api` + `sync:docs` regeneram derivados. Decisão tomada durante #4 P1-1 da auditoria Figma↔Repo, quando `content/secondary` apareceu como text token do Badge Neutral Subtle.

- **ADR-017 — Componentes CSS-only (sem equivalência no Figma).** Análogo de ADR-016 para componentes. Codifica que **Form Field** (`css/components/form-field.css`) existe só no CSS porque HTML não tem elemento "form control" composto — precisamos compor `<label>` + control + helper + error com IDs e ARIA. Cada componente Figma de form (Input Text, Select, Textarea, Checkbox, Radio, Toggle) já carrega Label + Required + Helper + Description inline em cada variant; authorar Form Field no Figma criaria duplicação. Auditorias Figma↔Repo devem ignorar componentes marcados `cssOnly: true` ao reportar "faltando no Figma". Propagado para: `scripts/sync-docs.mjs` (`knownComponents` ganha flag `cssOnly`; tabela de inventário mostra "— (CSS-only, ADR-017)" em vez de status Figma; nota explicativa adicionada), `docs/component-inventory.md` (regerada), `css/components/form-field.css` (comentário no topo), `AGENTS.md` (seção dedicada após source of truth de tokens), `audit/audit-report.md` (P0-3 reclassificado).
- **Plugin local `figma-plugin/snapshot-exporter` para exportar `.figma-snapshot.json` direto do Figma.** MVP seguro antes de webhook/PR automático: lê Variables locais via Plugin API, preserva collections, modes, aliases e metadados mínimos, permite baixar/copiar o snapshot no formato já consumido por `scripts/sync-tokens-from-figma.mjs`. `docs/process-figma-sync.md` passa a tratar o plugin como caminho preferencial e MCP como fallback.

### Corrigido

- **Avatar Initials font-size escala 14/16/20 com weight matching (sm/md/lg).** Antes: Md tinha mesma font-size do Sm (14) — bug Figma. Lg tinha drift CSS (font-lg=18 vs Figma font-xl=20) e weight diferente (CSS bold vs Figma semibold). Aplicado:
  - Figma: Avatar Initials Medium fontSize → `typography/body/font-size/md` (16) via `use_figma`.
  - CSS: `.ds-avatar` default md `font-sm → font-md`; `.ds-avatar--lg font-lg → font-xl + font-weight semibold`.
  - Resolve P2-3 da auditoria.

- **Description + Helper Text adicionados em Checkbox/Radio/Toggle (CSS).** Figma já tinha esses como slots opt-in (boolean `Show Description`/`Show Helper Text`); CSS implementava só Label. Agora os 3 componentes ganham wrapper item (`.ds-checkbox-item`, `.ds-radio-item`, `.ds-toggle-item`) com flex column + classes filhas `__description` (sm + regular + content/strong) e `__helper` (xs + regular + content/default). Indent calculado pra alinhar com label, passando o control + gap. Resolve P2-2 da auditoria.

- **P2-5 (Spinner --on-color) reclassificado como falso positivo.** Re-dump completo mostra Figma TEM `Style=On Color` (sm/md/lg) com tokens batendo 1:1 com CSS (`overlay/medium` + `border/inverse`). Auditoria original amostrou só `Style=Default, Size=Small` — conclusão errada. Sistema correto.

- **P2-4 (Modal Footer button heights) reclassificado como wontfix.** Modal CSS não força size de Button (decisão consciente, padrão Material/Polaris). Consumer controla via `.ds-button--sm/--lg`. Figma prescreve sm/md/lg como recomendação visual pra mockups, não como CSS constraint.

- **P2-1 (letter-spacing morto sistêmico) reclassificado como wontfix.** Investigação revelou que `css/base/reset.css:82` aplica `letter-spacing: var(--ds-body-letter-spacing-normal)` globalmente; todo texto herda via cascade. Figma bindings explícitos são redundantes mas não causam drift visual. Limpar ~600+ bindings sem ganho visual não justifica o trabalho. Modal Large title é exceção (tight, fix em P1-4).

- **Breadcrumb Item Link agora usa `link.content-default`** (era `primary.background.default`, token de background usado como text). Adicionado `:hover` → `link.content-hover` e `:active` → `link.content-active` no CSS. Figma rebindado via `use_figma` no Label do State=Link. Resolve P1-8 da auditoria.

- **Select chevron + leading icon escalam por size (sm=20, md/lg=24)** alinhando ao padrão do Button icon. Antes: chevron sempre 16px no CSS; Figma chevron icon hardcoded 16/20/24 (um step menor que Button). Agora ambos seguem 20/24/24:
  - Figma: 18 chevron icon TEXT nodes rebindados via `use_figma` — sm → `size/sm`, md/lg → `size/md`.
  - CSS `.ds-select__arrow`: default md = 24px, sm = 20px, lg = sem override (usa default).
  - CSS `.ds-select__icon` (leading icon): mesma escala.
  - Resolve P1-7 da auditoria.

- **Input + Select Field text em size Small alinhados ao Figma**: font-size `body/sm` (14px) → `body/xs` (12px) + line-height `body/sm` → `body/2xs`. Textarea já estava alinhado (Figma sm = 14px). Resolve P1-6 da auditoria.

- **Modal body agora escala typography por size** (espelha Figma): sm → `font-size sm + line-height sm`, md → `font-size md + line-height md`, lg → `font-size lg + line-height xl`. Antes `.ds-modal__body` era estático em sm/md mistura. Resolve P1-5 da auditoria.

- **Modal Large title agora aplica `letter-spacing/tight`** (espelha binding do Figma). Para títulos grandes (3xl), tight letter-spacing otimiza legibilidade visual. Resolve P1-4 da auditoria.

- **Button: icon escala por size (sm=20, md/lg=24) + Icon Only com padding simétrico.** Antes: icon hardcoded em todas as variants (boundVar=null), Icon Only com `padding: 0` e paddings assimétricos no Figma (pl/pr ≠ pt/pb). Agora:
  - **Glyph fontSize bindado** em 270 nodes via `use_figma`: sm Buttons → `size/sm` (20), md/lg Buttons → `size/md` (24).
  - **Icon Only paddings simétricos** em 108 variants Figma: sm → `space/control/padding/6` (6px), md → `space/sm` (8px), lg → `space/md` (12px). Cálculo: (button - icon) / 2 centraliza icon.
  - **Token novo: `semantic.space.control.padding.6`** (alias `foundation.dimension.6`) — único valor entre `xs` (4) e `sm` (8) na escala. Segue padrão de `space.control.padding.10` (ADR-006/015).
  - **CSS atualizado**: `.ds-button__icon` default 20→24, sm 16→20, lg sem mudança. Material Symbols idem. `.ds-button--icon-only` ganha paddings por size em vez de `padding: 0`.
  - Decidido como P1-3 da auditoria.

- **Badge Subtle (Success/Warning/Error/Info): Figma rebindado de `feedback/X/background/default` para `feedback/X/content/default` na cor do Label.** Figma usava token de **background** como cor de texto — uso semanticamente errado da Variable. CSS já consumia `feedback-X-content-default` (correto, com calibração WCAG pra texto). Rebind via `use_figma` em 4 variants (Success Subtle, Warning Subtle, Error Subtle, Info Subtle). Resolve P1-2 e mantém paralelismo com Solid: Solid usa `content/contrast` (texto sobre fundo escuro), Subtle usa `content/default` (texto sobre fundo claro).

- **Badge Neutral Subtle alinhado ao Figma** — CSS estava usando `background-disabled` (semanticamente errado pra um Neutral) e sem stroke. Agora usa `surface-default` + `content-default` + `border-default` (1px), espelhando exatamente o que Figma binda. Stroke é o que distingue Subtle de Solid no Neutral (ambos compartilham `surface-default`). Decidido como item P1-1 da auditoria.

- **Badge Neutral Solid alinhado ao Figma** — CSS estava usando `border-strong` + `content-inverse` (fundo escuro + texto claro), enquanto Figma binda `surface/default` + `content/default` (fundo claro + texto escuro). Inversão visual entre design e produto. CSS atualizado pra espelhar Figma. Decidido como item P0-1 da auditoria.

### Removido

- **Badge Secondary (Solid + Subtle) eliminado** — não temos mais cores secundárias no DS, então a variante perdeu propósito. Remoção aplicada em `css/components/badge.css` (regras `.ds-badge--secondary.ds-badge--solid` e `.ds-badge--secondary.ds-badge--subtle`), `docs/badge.html` (preview, code snippet e tabela de classes), `.a11y-baseline.json` (fingerprints de contraste light/dark), e Figma (variants `Color=Secondary, Style=Solid` e `Color=Secondary, Style=Subtle` removidas — Badge component agora tem 12 variants em vez de 14). Decidido como item P0-2 da auditoria Figma↔Repo.

### Adicionado

- **`AGENTS.md` na raiz — fonte canônica multi-IA.** Adota o padrão emergente [agents.md](https://agents.md/) (OpenAI Codex, Cursor, Aider, Sourcegraph Amp, Factory, Jules) para que qualquer agente IA — não só Claude Code — saiba como operar no repo. Cobre forbidden actions (top, scannable), source of truth por categoria de token (Figma-canônica vs CSS-only ADR-016), workflows comuns (adicionar token, refatorar componente, sync Figma→JSON, criar ADR), verification protocol antes de commit, convenções de commit/branch/PR, glossário, e ordem de consulta para dúvidas.
- **`GEMINI.md` na raiz** — pointer fino para `AGENTS.md` + adições específicas do Gemini CLI (limitações sem MCP Figma/GitHub direto, co-author de commit).
- **`CLAUDE.md` refatorado** para pointer fino + Claude-specifics (MCPs Figma/GitHub, gotchas Plugin API, skills relevantes, precedência de instruções repo vs memória). Conteúdo transversal migrado para `AGENTS.md`.
- **`scripts/agent-preflight.mjs` + `npm run agent:preflight`** — sanity check rodável como primeira ação de uma sessão. Reporta branch, dirty/clean, ahead/behind, idade do `.figma-snapshot.json`, último resultado de `verify:tokens` (lido de `docs/api/tokens-sync.json`), estado do `[Não publicado]` no CHANGELOG, e versão atual. Não bloqueia — informa o que precisa de atenção antes de qualquer escrita. Documentado na seção 0 de AGENTS.md como obrigatório.
- **README e CONTRIBUTING apontam para AGENTS.md** — entry no índice de docs do README + nota de abertura no CONTRIBUTING para colaboradores que estão usando IA.
- **Gotchas de Figma authoring migrados para CLAUDE.md** (Plugin API): `COMPONENT_SET` precisa de `clipsContent=false` + size que abrace focus rings/drop shadows; não ativar `clipsContent=true` em frames de componente sem necessidade. Antes vivia só em memória user-level do Claude — agora documentado no repo.
- **ADR-016 — Tokens sem equivalência no Figma (CSS-only).** Codifica que `motion.*` (duration + ease), `z.*` (z-index) e `shadow.*` vivem só em JSON porque Figma não as representa como Variables (Smart Animate é runtime, layer order não é z-index, shadow é Effect Style não-bindável). JSON é fonte de verdade para essas categorias; edição direta é permitida e esperada. Para todas as outras (`color`, `dimension`, `radius`, `opacity`, `border-width`, `typography` etc.), vale a regra padrão de ADR-003 (Figma é fonte). Critério de carve-out: nenhuma representação Figma OU representação não-bindável (Effect Style). `sync:tokens-from-figma` ignora essas categorias ao reportar `MISSING_IN_FIGMA`. Propagado para `CLAUDE.md` (regra operacional 1), `docs/system-principles.md` (hierarquia de verdade), `docs/token-architecture.html` (nova seção), `CONTRIBUTING.md` (pipeline de tokens) e `docs/process-figma-sync.md` (categoria BY_DESIGN).
- **Token semantic novo: `z.tooltip` → `{foundation.z.40}`.** Light + dark (mode-invariant). CSS gerado: `--ds-z-tooltip`. Consumido por `tooltip.css` em substituição ao `z-index: 40` literal anterior. Edição direta no JSON é legítima sob ADR-016.

### Mudado

- **Documentação consolidada para arquitetura 2-layer (Foundation → Semantic).** Remoção de referências stale à camada Component, deletada em 0.7.0 mas ainda mencionada em vários lugares:
  - `README.md` — versão atualizada de 0.5.14 → 1.0.0-beta.4 (alinha com `package.json`); descrição "três temas" → "paleta brand única customizável"; "18 componentes" → "19"; "11 ADRs" → "15".
  - `docs/decisions/ADR-013-camadas-de-consumo-de-tokens.md` (+ HTML regerado) — reescrita refletindo 2-layer; remove cadeia de Component, atualiza exemplos e exceções para o estado vigente.
  - `docs/system-principles.md` — seção "três camadas" → "duas camadas"; tabela de fontes de verdade limpa; texto sobre when-to-create token simplificado.
  - `docs/token-schema.md` — remove linha Component da tabela de camadas; renumera "Regras invioláveis" para incluir "text styles autoritários para tipografia".
  - `docs/process-figma-sync.md` — "4 collections" → "2 collections" (Foundation, Semantic).
  - `docs/component-inventory.md` — coluna "Tokens JSON" removida; Component count removido; nota de binding ajustada.
  - `docs/token-architecture.html` — corrige nomes de tokens stale (`--ds-dimension-20`/`--ds-font-size-14` → `--ds-space-xl`/`--ds-body-font-size-sm`; `primary.bg-hover` → `primary.background.hover`; `size.avatar.md` → `size.lg`).
  - `docs/llms.txt` + `docs/llms-full.txt` + `scripts/build-llms.mjs` — descrição "três temas" → "paleta brand única"; "três camadas" → "2-layer".
  - `scripts/sync-docs.mjs` — para de gerar seção Component em `token-schema.md`.
- **Card `--elevated` agora usa `surface-raised` em vez de border subtle**, espelhando o componente Figma (raised surface + semantic card shadow, sem stroke).
- **Modal**: remove border default; tamanho `--lg` agora usa `layout-lg` (era duplicata de `md`); título escala por size (xl/2xl/3xl) com line-heights pareados.
- **Spinner**: consome `border-width-strong`, `border-brand`, `motion-duration-slow` + `motion-ease-default`, `opacity-disabled`. Variante nova `--on-color` para uso sobre fundos de marca (overlay-medium + border-inverse). Remove valores `border-width: 1.5px/3px` hardcoded.
- **Tooltip**: consome `--ds-z-tooltip` (novo, ver Adicionado), `--ds-primary-content-default` para foreground, e `--ds-space-xs/sm` no lugar dos `4px/6px` literais nas setas.

- **`docs/foundations-colors.html` agora exibe contraste WCAG por swatch no formato Figma.** Cada swatch das 10 paletas Foundation + Brand alias mostra `vs White X.X:1` e `vs Black X.X:1` com badge `AAA / AA / AA Large / Fail` — paridade com a página Foundation — Colors do Figma. Layout do swatch redesenhado pra card com info section (token name, hex, divider, duas linhas de contraste). Razões WCAG calculadas deterministicamente a partir do Foundation JSON (formula 2.1) e validadas contra os valores reportados no Figma (zero divergência). Hex hardcodados (`style="background-color:#XXX"`) substituídos por `var(--ds-color-...)` em todos os swatches — referência direta à Foundation, sem drift entre página e tokens.
- **Cobertura de overlay/disabled na página Foundation Colors.** Adicionadas seções "Overlays" (Black/White × {5,10,20,40,60,80}%), "Toned overlays (Brand)" (blue-600 × {12,20,28}, blue-400 × {15,25,32}) e "Disabled fills" ({brand,success,error} × {light,dark}) — antes a página só mostrava 5 stops de Black overlay e omitia White, toned e disabled, criando gap entre `tokens/foundation/colors.json` e o que a doc exibe. Renderizadas sobre xadrez pra indicar transparência. Seção "Brand (alias customizável)" também adicionada.
- `.ds-swatch__info`, `.ds-swatch__divider`, `.ds-swatch__contrast-row`, `.ds-swatch__contrast-label`, `.ds-swatch__contrast-ratio`, `.ds-swatch__color--checker`, `.ds-swatch__overlay` em `docs/layout.css` pra suportar o novo layout de card.

### Mudado

- **Swatches em `foundations-colors.html` agora exibem o nome completo da CSS variable como label** (ex: `--ds-color-brand-50` em vez de só `50`). Mirror direto do que o consumer escreve em CSS/JSON. Disabled e Overlay seguem o mesmo padrão (`--ds-color-disabled-brand-light`, `--ds-overlay-black-5`, etc.). Layout do `__name` ajustado pra mono font + word-break pra acomodar nomes longos.
- **`docs/foundations-colors.html` reordenado e renomeado pra espelhar a collection Foundation no Figma.** Ordem antes (Neutral, Blue, Purple, Red, Amber, Green, Sky, Cyan, Emerald, Indigo + Brand alias no fim) → ordem agora (Brand, Neutral, Green, Amber, Red, Blue, Purple, Sky, Cyan, Emerald, Indigo) matching `Foundation.variableIds[]`. Section labels limpos: removidos refs obsoletos a "(escala Slate)", "(paleta Primary)", "(paleta Secondary)", "(tema Ocean)", "(tema Forest)", "(secundária do tema Ocean)" — themes Default/Ocean/Forest foram deletados em ADR-014, palettes Primary/Secondary não existem mais. Section labels mantém só descrição semântica útil onde aplica (Green = Sucesso, Amber = Alerta, Red = Erro, Sky = Informação). Disabled fills + Overlays movidos pra final (matching ordem no Figma collection).
- **Página `Foundation — Colors` no Figma reordenada pra match collection order.** Sections antes em ordem `Neutral, Green, Amber, Red, Blue, Purple, Sky, Cyan, Emerald, Indigo`. Já estava quase certa, mas descrição de Neutral atualizada de "Escala de cinzas" pra "Escala neutra" (consistência terminológica).

### Histórico Tailwind removido

Projeto não usa Tailwind. Citações que poderiam gerar confusão foram limpas:
- `tokens/registry.json` (121 ocorrências) + `scripts/populate-registry.mjs` (1 template) — "escala Tailwind-compatível" → "escala 50–950 padronizada". `docs/token-registry.md` regenerado via `npm run build:registry`.
- `docs/decisions/ADR-001` e `ADR-005` — header **Status** atualizado anotando supersession por ADR-014 (themes Default/Ocean/Forest deletados em 0.8.0). Conteúdo histórico preservado por convenção ADR.
- `docs/foundations.html` — swatches demo de Foundation Colors trocadas: `--ds-color-blue-500` + `--ds-color-purple-500` → `--ds-color-brand-500` + `--ds-color-neutral-500`.
- `docs/token-architecture.html` — exemplos `foundation.color.blue.500` / `--ds-color-blue-500` / `color/blue/500` → `brand.500` em todas as colunas.
- `docs/design-principles.html` — anti-pattern reescrito: "When the brand switches to cyan, every reference to blue needs manual replacement" → "Foundation tokens skip the Semantic layer — every brand, hierarchy or state change needs manual replacement".

Paletas Foundation `blue/purple/cyan/emerald/indigo` (55 vars) **não removidas** — restos pré-0.8.0 com 0 consumer em CSS de componente, mas ainda existem na collection Foundation/JSON. Decisão de deletar fica pra sessão futura (afeta Figma + JSON + regenera CSS).

### Drift detectado (requer ação no Figma)

- **Página de documentação `Foundation — Colors` no Figma está stale para `green/*`, `amber/*` e `neutral/950`.** Os retângulos coloridos e labels hex daquela página exibem Tailwind defaults antigos (ex: green/500 mostra `#22C55E`, amber/500 mostra `#F59E0B`, neutral/950 mostra `#050C1A`), enquanto as Variables Figma reais (e o JSON) já estão recalibrados pra WCAG 4.5:1 (`#009F42`, `#BB7500`, `#070C17`). Validado contra `.figma-snapshot.json`: Variables ↔ JSON estão 100% alinhadas (`verify:tokens` passa com 0 drift). A correção é repopular os swatches da página de doc do Figma a partir das Variables atuais — os retângulos foram pintados com hex literal antes da recalibração e nunca refrescados. Não afeta consumidores; é só a doc visual do Figma. Pendente: sessão de Figma authoring pra regenerar as 33 swatches stale (11 green + 11 amber + 1 neutral/950 — total 33 retângulos).

### Adicionado

- **Form Field restaurado como component #19**. Reverte simplificação anterior que tirou Form Field da lista — Form Field é padrão first-class em todo DS sério (Material, Polaris, Carbon, Chakra), é onde a a11y de form se materializa (label↔control association, aria-describedby, aria-invalid). Entregas:
  - `css/components/form-field.css` (extraído de `input.css`) — wrapper standalone `.ds-field` + sub-classes `.ds-field__label-row`, `.ds-field__label`, `.ds-field__required`, `.ds-field__helper`, `.ds-field__error` e modificadores `.ds-field--error`, `.ds-field--no-label`, `.ds-field--no-helper`. CSS já existia, agora tem arquivo dedicado e import explícito em `components/index.css`.
  - `docs/form-field.html` — doc completa com when-to-use, anatomy (5 partes numeradas), uso básico, required state, error state com `aria-invalid` + `role="alert"`, composição com Select/Textarea, checklist de a11y WCAG 2.2 (1.3.1, 3.3.2 etc), reference table de classes.
  - Sidebar (`js/main.js`), `index.html` grid, `index.html` count 18→19, `scripts/sync-docs.mjs` knownComponents, e refs em `process-versioning.md`/`system-principles.md`/`build-llms.mjs`/`CONTRIBUTING.md`.
  - A11y baseline atualizado (5 fingerprints novos, todos inerências de template — logo + tabs já aceitos em outras páginas).
  - Visual regression baseline criado pra form-field.html (light + dark).
  - **Figma**: page placeholder criada em `🧩  Components → ❖  Form Field`. Component dedicado (variants, properties, slots) marcado como TODO de authoring session.

### Corrigido

- **Sidebar 404 em "Form Field"** — entry em `js/main.js` tinha sido órfã quando Form Field foi removido. Corrigido restaurando-o como component first-class (acima).

## [1.0.0-beta.4] — 2026-04-28

Production-grade hardening: reconciliação completa Figma↔JSON com CI gate, a11y testing automatizado (axe-core + Playwright) com baseline lock, visual regression testing (pixelmatch), token registry 100% documentado (sentido/contexto/decisão pra cada token), refactor Foundation→Semantic em 12 components, redesign de token-architecture.

### Adicionado

- **Visual regression testing via Playwright + pixelmatch** (`scripts/test-visual.mjs`). Captura full-page de 31 páginas × 2 modos = 62 screenshots e compara contra baseline versionado em `tests/visual/baseline/` (~27MB). Threshold 0.5% pixel diff tolera anti-aliasing, bloqueia mudanças visuais reais. Diff visualizável em `tests/visual/diff/` (gitignored). Comando: `npm run test:visual` (local-only — fonts via Google Fonts CDN renderizam levemente diferente Linux vs Mac, então não rodando em CI ainda).
- **Token registry 100% preenchido** — `scripts/populate-registry.mjs` gerou drafts determinísticos pra `sentido`/`contexto`/`decisao`/`escopo` em todos os 426 tokens. Foundation 100% mecânico (color step descriptions, escalas dimension/radius/typography, conventions de shadow/motion/z). Semantic 100% via heurísticas de nome (action × style × prop × state, feedback × kind × prop). Drafts revisíveis — owner pode reescrever entries específicas; `build:registry` preserva campos editados manualmente.
- **A11y testing automatizado via axe-core + Playwright** (`scripts/test-a11y.mjs`). Roda contra todas as 42 páginas docs em light + dark (84 runs) com tags WCAG 2A, 2AA, 2.1A, 2.1AA, 2.2AA. Bloqueia CI em violações NOVAS (não-baseline) com impact `critical` ou `serious`. Baseline atual em `.a11y-baseline.json` (422 fingerprints) — meta é reduzir incrementalmente. Comando: `npm run test:a11y` (também rodando em `npm test`).
  - Fixes preventivos no setup: skeleton previews ganharam `role="status"`; markdown task list checkboxes em process-*.html marcados `aria-hidden="true"` via post-process em `sync-docs.mjs`; loading buttons em `docs/button.html` com `aria-label` + `aria-busy`; demos com `<input>`, `<select>`, `<textarea>` sem label receberam `aria-label`; "Don't" examples em checkbox demos receberam atributo `inert` pra axe pular; swatch contrast badges em `js/main.js` marcados `aria-hidden="true"` (são demonstrações educativas de mau contraste); `<pre>` com código longo recebeu `tabindex="0"` (scrollable-region-focusable); `<dl>` malformado em token-architecture virou `<div>`.
- **CI check Figma↔JSON via `.figma-snapshot.json`** — `verify:tokens` agora compara JSON do repo contra snapshot das 387 Variables Figma e falha em divergência. Snapshot gerado por `use_figma` em batches (~50KB cada), gitignored. Ver `docs/process-figma-sync.md`.
- **Redesign da seção "Camadas e cadeia de alias"** em `docs/token-architecture.html`. Duas seções viraram uma. Foundation primeiro (01), Semantic depois (02), em dois cards lado-a-lado usando o vocabulário visual do site (`--ds-radius-12`, `--ds-border-default`, `--ds-surface-default`, `<code>` inline padrão). Sem componente novo, sem display all-caps, sem chips, sem swatches/ícones. A cadeia de alias virou um parágrafo prosaico abaixo dos cards (já implícita no card 02 via aliases `{color.blue.600}`). Card usa `--ds-surface-default` (não `--ds-surface-raised`) pra contrastar com o `<code>` inline em dark mode (que usa `--ds-background-subtle` ≡ `--ds-surface-raised` ≡ neutral-800).

### Mudado

- **Reconciliação Figma↔JSON completa.** 23 tokens com VALUE_DRIFT corrigidos pra refletir Figma como autoridade de valor (ADR-003):
  - `foundation.color.disabled.{brand,success,error}-dark` ganharam alpha (estavam sem em hex). `foundation.radius.999` corrigido (`9999px` → `999`).
  - Semantic: `outline.{border-default,border-hover,content-default}`, `link.{content-default,content-hover}`, `border.{focus,focus-error,error}`, `outline.background.hover`, `ghost.background.hover`, `feedback.{success,warning,error,info}.background.subtle` (dark) — todos os aliases atualizados pra refletir escolhas de cor do Figma.
- **4 tokens semantic novos** adicionados pra alinhar com Figma: `link.content-disabled`, `border.inverse`, `feedback.{success,error}.content-disabled` (light + dark).
- **Refatoração de Foundation→Semantic em CSS de componentes** (12 arquivos). Componentes não consomem mais Foundation direto via `--ds-focus-ring-*` ou `--ds-control-*`:
  - Focus ring → `--ds-border-focus` + `--ds-border-width-focus` (mesmo valor pra offset). Bate com Figma `border/focus` e `border/width/focus`.
  - Control typography → `--ds-body-font-size-{sm,md}` + `--ds-body-line-height-{2xs,sm,md}` espelhando Text Styles `control/label-md`, `label/md`, `label/lg` que Figma aplica nos componentes.
- **`background/overlay` em ambos modos no Figma** unificados em `overlay/black/60`. Antes: light=`black/40`, dark=`white/40` (contraditório). Agora ambos consistentes em 60% black, alinhado com mercado (Material/Bootstrap/Tailwind usam ~50-60% black em modal scrim).
- **Variable nova `link/content/active` no Figma** (Semantic, scope TEXT_FILL): light alias `brand.800`, dark alias `brand.200`. Espelha `semantic.link.content-active` adicionado em beta.3 — JSON e Figma agora convergem.

### Removido

- **Tokens Semantic redundantes ou sem consumer real**:
  - `semantic.focus.ring.{width,offset,color}` — substituídos por `border.focus` e `border.width.focus` que Figma já tem.
  - `semantic.typography.control.{font-size,line-height}.{sm,md,lg}` — Figma não tem Variables `control/typography/*`; usa Text Styles `control/*` que bindam Semantic `body/*`. CSS migrado pra `body.*` direto.
  - `semantic.feedback.{success,error}.content-contrast-disabled` — sem consumer no CSS.
  - `semantic.border.width.subtle` — sem consumer no CSS.

### Corrigido

- **`scripts/lib/figma-dtcg.mjs`**: normalizer Figma↔JSON colapsa hífen→ponto em paths (`primary.content-default` ↔ `primary.content.default`). Antes inflava 119 falsos positivos.
- **`scripts/tokens-verify.mjs`**: `normalize()` reconhece equivalência entre número puro (Figma Float) e string `Npx`/`Nrem` (CSS gerado). Antes flagava `999 ≠ "999px"` como drift.
- **Code blocks sempre escuros no docs site** (`docs/layout.css`):
  - **`.ds-code-block` regredido sem estilo** desde `d5c4fd2`: regra CSS não foi migrada pra `layout.css`. Recolocada com `--ds-color-neutral-900` + `--ds-color-neutral-50` (sempre escuro, padrão universal de terminal/editor).
  - **`<pre>` global em `reset.css`** usa `--ds-background-inverse`, que flipa pra branco em dark mode — deixava `.ds-preview__code pre` brancos em dark. Override em `main.ds-main pre` força escuro nos dois modos. Foundation direto é aceito aqui por ser estrutura do site de docs (não componente do DS).
- **Topbar do site sempre acima de todo conteúdo de página** (`docs/layout.css`, `docs/foundations-zindex.html`):
  - Topbar (e sidebar mobile + overlay) sobem para `calc(var(--ds-z-50) + 10)` (= 60), acima de toda a escala `--ds-z-*` (que termina em 50/toast). Antes, com header em `--ds-z-50`, conteúdo de página com z-50 empatava e podia paintar por cima via DOM order.
  - **Demo de z-index** ganhou `isolation: isolate` no `.ds-zindex-stack` — o container era `position: relative` sem `z-index`, então não criava stacking context, e o card `.ds-zindex-layer--50` escapava pra raiz e atravessava a topbar quando o demo era rolado pra baixo da topbar. Com `isolation`, a escala 0–50 fica local ao demo (que era a intenção).

## [1.0.0-beta.3] — 2026-04-27

Link como text style (não Button variant) com estados WCAG/W3C completos. Topbar fixes do site de docs. Modal Cancel rebind no Figma alinhando com decisão de manter Cancel como Ghost Button.

### Adicionado

- **`.ds-link` CSS class** (`css/components/link.css`) — text style pra hyperlinks inline em prosa, bold + underline, herdando dimensões de `body/*`. 4 sizes (`xs`/`sm`/`md`/`lg`) com line-heights pareados. Estados WCAG/W3C: `:hover`, `:active`, `:focus-visible`. `:visited` intencionalmente omitido (decisão do owner — Material 3/Apple HIG omitem em conteúdo curado).
- **Token `semantic.link.content-active`** (`brand.800` light / `brand.200` dark) — pressed state distinto de hover. Estados existentes `content-default` e `content-hover` mantidos.
- **4 Text Styles `link/{xs,sm,md,lg}` em Figma** com bindings completos (fontSize, lineHeight, fontFamily, fontStyle Bold, letterSpacing) + `textDecoration: UNDERLINE` direto no Text Style (Figma Plugin API suporta). Cor aplicada em consumidor via `link/content/default` (Text Styles não armazenam fills).
- **Showcase rows pra Link** em `docs/foundations-typography.html` — 4 sizes documentados com tokens.

### Mudado

- **Modal Cancel button no Figma** rebindado em todas as 3 variants (Sm/Md/Lg): label color e icon fills de `link/content/default` → `ghost/content/default`. Cancel volta a ser visualmente Ghost neutral (alinha com `.ds-button--ghost` já em uso no CSS).
- **Capa Figma**: badge versão `v1.0.0-beta.1` → `v1.0.0-beta.3` (pulou beta.2). Estilos de Texto count `25 → 29` (+4 link styles).
- **Changelog Figma**: nova entrada `v1.0.0-beta.3 — Abril 2026` com 7 bullets.

### Corrigido

- **Topbar do site de docs** (`docs/layout.css`): três bugs visuais corrigidos:
  - **Hamburger mobile**: `.ds-menu-toggle` usava `--ds-content-default` (escuro em light mode) sobre fundo brand. Agora consome `--_hfg`, ficando branco em ambos os modos. Hover ganhou estado.
  - **Z-index**: topbar subia até `--ds-z-40`, ficando no mesmo nível de modais (`z-40`) e abaixo de toasts (`z-50`). Conteúdo da página passava por cima da topbar. Subido para `--ds-z-50`. `.ds-sidebar-overlay` também foi pra `--ds-z-50` para cobrir a topbar quando o drawer mobile abrir (ordem DOM mantém header → overlay → sidebar).
  - **Dark mode com transparência**: header dark usava `--ds-toned-background-default`, que resolve para `--ds-overlay-blue-600-12` (12% alpha), deixando o conteúdo passar por trás. Trocado por `--ds-color-brand-900` (sólido, mantém identidade da marca e separa visualmente da sidebar — que usa `--ds-surface-raised`).

### Removido

- **`.ds-button--link` variant** revertido de `css/components/button.css`. Adicionado erroneamente em beta.2 — Link não é Button variant (overlap com Ghost), é text style. Substituído por `.ds-link` em arquivo dedicado.

### Sobre versão

Beta.3 corrige decisão arquitetural de beta.2 (Link como Button variant) e adiciona pattern correto (Link como text style com estados WCAG/W3C completos). Topbar fixes do owner consolidados nesta release.

## [1.0.0-beta.2] — 2026-04-27

Sincronização Figma↔código: alinhamento de utilities/textStyles per size + nova variant `.ds-button--link` espelhando padrão de DS modernos (Material Text Button, Atlassian Link Button, Polaris Plain). Atualização da documentação no Figma (Capa + Changelog) refletindo o estado atual.

### Adicionado

- **`.ds-button--link` variant** em `css/components/button.css`: button text-only com cor `link/content/default`, sem background/border, underline em hover. Cobre o padrão Modal Cancel e ações de baixa ênfase. Espelha Material 3 (Text Button), Atlassian (Link Button), Polaris (Plain), Spectrum (style=text).

### Mudado

- **Badge label** alinhado com Figma: `font-size sm (14)` → `xs (12)` + `line-height sm (20)` → `xs (18)`. Match exato com textStyle `label/xs` que Figma agora usa.
- **Radio label** ganhou variants per size: Sm usa `control/label-md` (14/16), Md usa `label/md` (14/20), Lg usa `label/lg` (16/24). Antes CSS aplicava 14/20 em todos os tamanhos. Implementado via `:has()` selector.
- **Figma Capa atualizada**: badge de versão `v0.5.17` → `v1.0.0-beta.1`. Counts atualizados (Coleções 4→2 após eliminação Component layer, Estilos de Texto 24→25, Tokens 285+→386).
- **Figma Changelog**: nova entrada `v1.0.0-beta.1 — Abril 2026` espelhando CHANGELOG.md do repo. A partir daqui versionamento Figma e código alinhados.

### Documentação

- **Política de versionamento beta** estabilizada: schema `1.0.0-beta.N` substitui 0.x até decisão do owner pra dropping → `1.0.0` oficial. Detalhes em `docs/process-versioning.md`.
- **Style=Link variant em Figma** identificado como pendente (~60 variants × Style/Size/State/booleans). Deferido pra sessão dedicada com escopo Figma. CSS já tem `.ds-button--link` pronto pra consumir quando variant existir.

### Sobre versão

Beta.2 fecha pendências do beta.1 (descrições/counts Figma desatualizados, drift Badge/Radio per size). Próxima beta deve focar em snapshot Figma (CI Figma↔JSON), Style=Link variants no Figma, e brand-principles.md.

## [1.0.0-beta.1] — 2026-04-26

Primeiro release em fase beta. Consolida todo trabalho pós-0.8.0: alinhamento de 14 componentes restantes com Figma, refactor de inline styles dos docs, descriptions designer-focused nos 18 component sets Figma, eliminação de 111 leaks Foundation em `css/base/`, fix de problemas visuais persistentes (Toggle pixel offset, dodont border, callouts, header washed, version badge, code contraste, theme switcher legado, tooltip docs grid). Marca a transição do versionamento 0.x para a fase beta de 1.0.

### Adicionado

- **Política de versionamento beta** (`docs/process-versioning.md`): schema `1.0.0-beta.N` substitui o 0.x até dropping decidido pelo owner. Cadência pack-based + fallback 2 semanas. Critérios de maturidade pra 1.0 documentados como guia (não gate).
- **Regra Operacional 5** em `CLAUDE.md`: "Figma é fonte de verdade absoluta. Quando o usuário pedir algo que diverge do Figma, alertar antes de aplicar." Inspeção do Figma vira pré-requisito de qualquer mudança que toque valor visual ou estrutura de token.
- **Centralização de utility classes de docs** em `docs/layout.css`: callouts, dodont, anatomy, related, tables. Antes duplicados inline em 19+ arquivos `docs/*.html`. Future fix em uma edição.
- **Documentation links nos 18 component sets Figma**: cada um aponta pro site de docs correspondente.
- **17 descriptions designer-focused** reescritas (template Quando usar / Variantes / Constraints) nos componentes Figma.
- **`semantic.typography.body.font-family.mono`** + **`semantic.typography.body.letter-spacing.wider`** sincronizados pra JSON (já existiam em Figma — JSON estava out-of-sync).

### Mudado

- **14 componentes alinhados 1:1 com Figma vs CSS**: Badge, Breadcrumb, Checkbox, Input, Textarea, Alert, Avatar, Card, Divider, Radio, Skeleton, Spinner, Tabs, Tooltip. Drift visual aceito como alinhamento Figma (line-heights heading, font-weight medium→bold em label/*, icon container size-md fixo, etc.).
- **Toggle pixel-perfect**: dimensions Sm 32×18, Md 40×22, Lg 48×26 com thumbs 12/16/20 e gap 3px (era 2px). Eliminada o offset de 1px à direita que persistia.
- **`css/base/typography.css` reescrito**: 24 utility classes `.ds-text-*` agora consomem 100% Semantic, alinhadas 1:1 com Text Styles do Figma. 21 classes restantes (3 deletadas alinhando com Figma).
- **`css/base/reset.css`**: 14 substituições Foundation→Semantic. body/code/pre/table consomem `--ds-body-*`. `pre` usa `--ds-background-inverse` / `--ds-content-inverse` em vez de neutral-900/100 direto.
- **`docs/layout.css`** ganha section "DOCS UTILITY CLASSES" centralizando estilos antes duplicados inline.
- **CI `deploy.yml`**: removida etapa "Commit regenerated artifacts" que tentava push como bot e falhava na branch protection. Agora só valida drift e falha com mensagem clara se artefatos commitados não baterem com `build:all`.
- **`docs/foundations-typography.html`**: 3 showcase rows removidas (Label SM, Caption MD, Caption SM) alinhando com deleção dos Text Styles correspondentes em Figma.
- **`tokens/registry.json`**: 83 entries stale removidas (referências a tokens deletados nas migrações 2-layer e size unification).
- **Toggle/Avatar descriptions Figma** atualizadas refletindo specs 0.8.0 (Toggle 32/40/48, Avatar lg 64).
- **ADRs históricos atualizados** com notas de evolução: ADR-006 (parcialmente substituída por ADR-015), ADR-013 (estabilizada como 2-layer em 1.0.0-beta.1), ADR-014 (estabilizada).

### Corrigido

- **Toggle Sm sem pill shape e thumb deslocado** — track + thumb dimensions alinhadas exatamente com Figma.
- **"Não faça" / "Faça" callouts** sem border completo e com bg desconectado do label tint. `.ds-dodont__item` ganha border + `:has()` pra desc herdar tint do label.
- **"Foundation" header washed em token-architecture.html** — `.ds-arch__header--fdn` trocado de `--ds-overlay-subtle` (5% black, quase invisível) pra `--ds-feedback-info-background-subtle` + border tinted.
- **Badge de versão sem fundo** em index.html — ref antiga `--ds-toned-bg-default` corrigida pra `--ds-toned-background-default`.
- **Tooltip docs com tooltips overlapping** no canvas — layout grid 2x2 com gaps generosos. Position Right da coluna esquerda não colide mais com Position Left da coluna direita.
- **Tokens-sync page**: "Em dia" deixa de imitar Button (solid bg+contrast color) e vira badge feedback-success-bg-subtle. Banner info ganha código inline com contraste legível (surface bg + border).
- **Theme switcher (Default/Ocean/Forest)** removido do header — só Default existe nos tokens. lang-switcher (PT/EN) preservado.
- **574 textos de components Figma sem textStyleId** corrigidos: aplicação por matching (family, style, fontSize, lineHeight) + detecção de contexto (Field/Text Frame → control/* style). Resultado: 100% Inter coverage em components, 367 Material Icons preservados como design intent.
- **Foundation header em chain__badge--fdn** mesmo fix que arch__header — bg tinted em vez de overlay-subtle.
- **`generatedAt` em artefatos derivados** removido — torna build determinístico, eliminando drift CI.
- **Duplicata `body.line-height.lg`/`xl`** corrigida (xl agora 32px espelhando Figma; antes era 28 igual lg).

### Removido

- **111 leaks Foundation em `css/base/`** — todos migrados pra Semantic. `verify:tokens` reporta `CSS leak: OK` em components AND base.
- **3 utility classes** sem Text Style counterpart no Figma: `.ds-text-label-sm`, `.ds-text-caption-md`, `.ds-text-caption-sm`.
- **Form Field** da lista de components — `.ds-field*` permanece como utility interna do Input. `index.html` lista 18 components consistentes (era 19 com Form Field órfão). `docs/form-field.html` removido. Refs em "Related" sections de 6 docs HTML removidas.
- **Inline styles duplicados** em 19+ docs HTML — extraídos pra `docs/layout.css`. ~89KB economizados.
- **Theme switcher dropdown** do header (3 opções legadas).
- **`.ds-md-generated-banner` Foundation leak** — ganha border tinted e código inline com surface bg.

### Sobre versão

Esta é a **transição do 0.x para fase beta**. Tags `v0.5.0` até `v0.8.0` permanecem válidas como histórico pré-beta. A partir daqui, releases são `1.0.0-beta.N` até decisão do owner pra dropping do tag → `1.0.0` oficial.

A entrada **[0.8.0] — 2026-04-26** abaixo é o último release pré-beta e ficou consolidando o trabalho pós-2-layer migration. Nada antes dela mudou.

## [0.8.0] — 2026-04-26

Release que consolida o trabalho pós-merge do 2-layer (PR #41) até a unificação da escala de dimensão. Sequência de ajustes que ocorreu na prática em sub-etapas é apresentada aqui agrupada por tipo. Detalhamento técnico nos ADRs **013** (2-layer), **014** (action × style × prop × state), **015** (size unification).

### Adicionado

- **ADR-015** — unificação da escala de dimensão. Nova `semantic.size.{xs..5xl}` (16/20/24/32/40/48/64/96/128px) cobre tudo dentro de componente; `semantic.size.layout.{xs..2xl}` (320/480/640/800/1024/1280px) cobre containers. Substitui ~25 tokens component-specific.
- `foundation.dimension.*` — escala numérica primitiva (renomeação de `foundation.spacing.*`, +7 entries: 128, 320, 480, 640, 800, 1024, 1280).
- `semantic.typography.body.{font-size,line-height}.{4xl..9xl}` — escala completa para text styles display/heading. Foundation ganhou `line.height.{32, 48, 64, 72}`.
- Sistema de testes automatizado (`scripts/test-token-integrity.mjs`, `test-css-references.mjs`, `test-generators.mjs`, `test-self.mjs`) validando coerência JSON↔CSS↔HTML, incluindo meta-test que provoca regressões e valida que detectores pegam.
- CI workflow `.github/workflows/test.yml` rodando os testes em cada push.
- Política de versionamento explícita em `docs/process-versioning.md`: triggers (mudança considerável / feature completa / cadência ≤2 semanas), regras do que NÃO bumpa, formato consolidado de CHANGELOG.

### Mudado

- **Naming Foundation:** `foundation.spacing.N` → `foundation.dimension.N`. CSS gerado: `--ds-spacing-N` → `--ds-dimension-N`. Espelha Figma (que já adotou `dimension/N`).
- **`size.control.*` → namespace de exceção**, não namespace genérico. `control.*` agora só existe para valores que **fogem** da escala genérica (ex: `space.control.padding.10` = 10px único deviation).
- 2.062 bindings em componentes Figma rebound de zombies legados (`size/control/*`, `space/control/padding/{x,y}-*`, `size/lg0`, `border/width/focus` duplicado) → escala unificada.
- ~50 refs em `css/components/*.css`, `css/base/*.css`, `docs/*.html`, `docs/layout.css`, `index.html`, scripts internos atualizadas para os novos vars.
- Touch target a11y: 44px → 48px (`size.control.min-target` → `size.2xl`). Passa Material 48px guideline além de WCAG 2.5.5 AAA (44px).
- Avatar lg: 56px → 64px (`size.3xl`). Modal sm/md: 400/520 → 480/640 (`size.layout.sm/md`). Toggle track-width: 28/36/44 → 24/40/48. Textarea min-heights: 68/80/112 → 64/96/128. Ajustes para alinhar componentes à escala única.
- ADR-006 marcada como **parcialmente substituída** por ADR-015 (parte de `size.control.*` e `space.control.padding-{x,y}.*`). `typography.control.*` permanece vigente.
- 740 textos de componentes Figma ganharam Text Style aplicado (estado pré-existente: 1.665 textos sem style). Match exato por (fontFamily, fontStyle, fontSize, lineHeight). Material Icons preservados (não recebem text style por design).

### Corrigido

- Duplicata `body.line-height.lg` e `xl` (ambos aliasavam `line.height.28`). Corrigido: `xl` → `line.height.32` espelhando Figma. JSON estava fora de sincronia.
- `body.font-size` e `line-height`: JSON tinha 8 entries (`2xs..3xl`), Figma tem 14 (`2xs..9xl`). Adicionados os 6 faltantes em ambos.
- Site de docs: refs CSS quebradas pós-migração 2-layer (44 arquivos `docs/*.html` com `--ds-spacing-*` e legados `--ds-size-control-*` etc.) atualizadas para os nomes vigentes.
- `card --elevated`: passa a consumir `var(--ds-shadow-card)` (Semantic) em vez de Foundation direto.
- Modal: removido `border-bottom` no header e `border-top` no footer (não existiam no Figma).
- Tooltip: arrows criados nas 4 variants (Position=top/bottom/left/right) — antes não existiam.
- `tokens/registry.json`: 107 entries adicionadas via `build:registry:init`. Eliminado o erro de completude no `verify:tokens`.

### Removido

- `semantic.size.{avatar, control, modal, skeleton, spinner, textarea, toggle}.*` — 25 tokens component-specific. Vestígio da Component layer eliminada em ADR-013.
- `semantic.space.control.padding-{x,y}.{sm,md,lg}` — 6 tokens. Substituídos por `space.{sm, md, lg, xl}` direto (8/12/16/20px) + `space.control.padding.10` (10px, único deviation).
- `tokens/foundation/spacing.json` — renomeado para `dimension.json`.

### Notas de migração

- 0.7.0 → 0.8.0 é breaking. Consumidores externos do CSS gerado precisam atualizar references aos vars renomeados (na prática este repo é o único consumer hoje).
- Reversibilidade: rebind reverso é possível por valor. Branch atual contém todo o trabalho testado e funcional.
- `verify:tokens` continua reportando 111 warnings em `css/base/*.css` (Foundation leak). Débito pré-existente, fora do escopo desta release. PR futuro.

### Sobre versão

A versão **0.7.0** foi tagueada via PR #41 (2026-04-24) cobrindo a migração 2-layer mas sem entrada formal de CHANGELOG. Toda a substância dessa entrega + cleanup posterior + size unification está consolidada nesta entrada **0.8.0**. A política de versionamento foi formalizada em `docs/process-versioning.md` para evitar fragmentação futura.

## [0.5.17]

### Adicionado
- `semantic.space.gap.2xs` → `{foundation.spacing.0-5}` (2px). Gera `--ds-space-gap-2xs` no CSS. Cobre gaps muito compactos entre elementos (Label Row: label + asterisco required). Issue #24.1.
- Variable correspondente em Figma (`space/gap/2xs` em Semantic collection, alias pra `spacing/0-5` nos modos Light/Dark).

### Corrigido (Figma — form controls bindings)
Fecha **issue #24.1**. Auditoria do Figma encontrou **75 nodes com `itemSpacing` raw** nos componentes Input Text, Select e Textarea. Aplicados 74 bindings (1 descartado — `Frame 1` de preview, fora de componente):

- **63 Label Row @ 2px** → bind pra `semantic.space.gap.2xs` (token novo).
- **5 Error Message @ 4px** (Input Text) → bind pra `semantic.space.gap.xs`.
- **6 Error Message @ 6px** (Textarea + Select) → **padronizado para 4px** + bind pra `semantic.space.gap.xs`. Alinha com o padrão do Input Text (inconsistência histórica — mesma função visual, valores diferentes entre componentes da mesma família).

Audit pós-fix: **0 `itemSpacing` raw** nos 3 componentes. Sync Figma↔JSON: **0 drift** (`VALUE_DRIFT=0, NEW_IN_FIGMA=0, MISSING_IN_FIGMA=0, ALIAS_BROKEN=0`).

### Reversibilidade
- `.figma-revert-24.1.json` (gitignored): dump do estado original de todos os 74 nodes com valores raw antes do fix.
- `.figma-revert-24.1.mjs` (gitignored): script documentando como reverter (desfazer bindings + restaurar valores raw + opcionalmente remover `gap.2xs`).
- Permite rollback completo se necessário.

### Mudança visual
Error Message de Textarea e Select fica **2px mais compacto** (6px → 4px). Alinhamento com Input Text — bug visual histórico corrigido.

## [0.5.16]

### Adicionado
- **ADR-012** — *Tokens de line-height e letter-spacing divergem por design entre Figma e JSON.* Formaliza que esses dois grupos de tokens são representados em unidades incompatíveis (PX no Figma vs ratio/rem/em no JSON) por limitação da Plugin API do Figma e requisito WCAG 1.4.4 do CSS. Os dois lados são canônicos em seus contextos de consumo; **não sincronizam entre si**.
- **Categoria `BY_DESIGN`** no sync Figma → JSON. Listas `FIGMA_ONLY_PATHS` e `JSON_ONLY_PATHS` em `scripts/lib/figma-dtcg.mjs` reconhecem tokens que existem só de um lado por escolha documentada. Ficam em `BY_DESIGN` (informativo) em vez de falso-positivarem como `NEW_IN_FIGMA` ou `MISSING_IN_FIGMA`.

### Corrigido (efeito do ADR-012 no sync)
Antes: sync reportava **23 NEW_IN_FIGMA + 14 MISSING_IN_FIGMA** (37 falsos drifts) em line-height/letter-spacing, mascarando drifts reais.

Depois: **0 NEW_IN_FIGMA + 0 MISSING_IN_FIGMA + 37 BY_DESIGN** (informativo). Dry-run sai com exit 0. Qualquer drift novo em typography (ex: valor real diferente em `semantic.brand.hover`) continua detectado.

### Atualizado
- `docs/process-figma-sync.md`: tabela de categorias passou de 4 pra 6 (inclui `CSS_ONLY` e `BY_DESIGN`, ambas marcadas como "não aplica em `--write`").
- `scripts/sync-tokens-from-figma.mjs`: relatório inclui contagem e seção `BY_DESIGN` com indicação de lado (`figma-only` ou `json-only`).

### Contexto operacional
Issue #23 (origem) fica **fechada** com este PR. Questão de unificação futura via composite typography tokens fica em issue #27 (ADR-013 a abrir quando for priorizada).

## [0.5.15]

### Consolidado
Auditoria do `CLAUDE.md` contra o estado real do repo + Figma + contexto externo (que vivia em workspace Claude Project). Objetivo: tornar o repo fonte única de verdade, sem ambiguidades.

### Corrigido — hierarquia de verdade
Três documentos tinham posições contraditórias sobre "quem é fonte de verdade":
- `system-principles.md` §2 e §7.2 diziam "Git/JSON é fonte de verdade pra tokens" (versão pré-0.5.8)
- `ADR-003` revisada (0.5.8) diz "Figma é autoridade de valor"
- `CLAUDE.md` (desde 0.5.10) já refletia a ADR-003 revisada

Consolidado em **todas as 3 fontes** com a mesma regra:
- **ADRs** = autoridade arquitetural (camadas, naming, regras de referência)
- **Figma Variables** = autoridade de valor (hex, alpha, shade, variante visual)
- **`tokens/**/*.json`** = consolidação canônica em Git (DTCG); **nada roda sem JSON atualizado**
- **CSS gerado** = derivado do JSON
- **Docs** = descritivo, nunca fonte

Regra operacional destacada: **arquitetura > valor**. Figma pode decidir "brand.hover é blue-800 em vez de blue-700". Figma **não pode** criar `semantic.color.primary.foreground` se ADR-011 definiu `brand.content.contrast` — mudança arquitetural exige ADR antes da implementação.

### Adicionado ao CLAUDE.md
- Seção **Hierarquia de verdade** explícita (antes só estava na tabela "Fontes de verdade").
- Seção **Protocolo de trabalho com agente** (5 regras): aprovação estrita por ação, plano antes de agir, validar antes de afirmar, incremental/não-bulk, tom técnico direto.
- Seção **Figma Plugin API — armadilhas operacionais**: `paint.boundVariables.color.id` (não node-level), clear-before-setBoundVariable em `fontSize`, `setBoundVariable` pode empilhar, truncamento ~20KB em dumps, `hiddenFromPublishing` falha pós-create.
- Subseção **Limitações conhecidas do GitHub MCP**: `create_or_update_file` exige SHA fresco; `push_files` grande estoura timeout; MCP não escreve em `.github/workflows/`; `web_fetch` em github.com/raw.githubusercontent.com bloqueado.
- Linha em "Fontes de verdade" pra `docs/process-figma-sync.md`.
- Bump "~462 Variables" → "~489 Variables" (atualiza contagem pós PR #18/0.5.11).

### Corrigido em `system-principles.md`
- §2 reescrita com a nova hierarquia (5 linhas de regras operacionais).
- §6 tabela de ADRs: adicionado **ADR-011** (estava faltando).
- §6 linha de ADR-003: título atualizado pra refletir a revisão (0.5.8).
- §7 princípios: 7 → 6 princípios (consolidado §2 antigo "Git fonte de verdade" + §3 antigo "JSON convergência" em um único princípio #2 coerente com ADR-003 revisada).

### Corrigido em `README.md`
- Badge `0.5.1` → `0.5.15` (defasagem de 14 versões).
- URL CDN de exemplo atualizada.

### Rejeitado (diagnóstico obsoleto ou falso positivo)
Sete pontos do contexto externo foram auditados contra o repo e **não precisam de ação**:
- CLAUDE.md "usa nome Theme" → usa Semantic (obsoleto).
- Brand = "13 vars com 3 modos" → 2 vars, ADR-005 efetivada (obsoleto).
- "Foundation 192, Theme 94" → 231 Foundation, 132×2 Semantic (obsoleto).
- "CLAUDE.md não menciona DTCG/Style Dictionary" → menciona sim (obsoleto).
- "Naming semântico antigo" → ADR-011 aplicada, naming atual (obsoleto).
- Button "60 variantes" → 252 variantes (atualizar `component-inventory.md` se relevante).
- "`background/subtle` no Figma diverge do JSON" → alinhados (0 VALUE_DRIFT no sync atual — divergência foi resolvida no PR #18/0.5.11).
- "Componentes de controle não consomem `--ds-size-control-*`" → falso positivo (consomem via camada component em `component.css`; arquiteturalmente correto pela ADR-001).

### Issues criadas no GitHub (não pertencem a documentação)
- **B1** — Decidir tratamento dos 37 tokens line-height/letter-spacing com sistemas divergentes (PX vs ratio/rem).
- **B3** — Auditoria do Figma: bindings e variantes (quebrar por componente).
- **B5** — AI-readable metadata em tokens (`usage`/`doNot`/`pairedTokens`/`a11y`/`components`).
- **B6** — Adoption metrics e analytics de componentes.
- **B7** — Composite typography tokens + patterns docs.

Itens já listados em `docs/backlog.md` (Storybook, Astro/Zeroheight/Supernova) não duplicados.

## [0.5.14]

### Corrigido
Audit da camada Component (19 docs HTML de componentes + meta-docs) revelou **49 paths token inválidos + 14 CSS vars fantasmas** — todos decorrentes de naming pré-ADR-011 (renames que a camada de dados incorporou mas a doc não). Corrigido em massa:

- **`semantic.color.primary.*` → `semantic.brand.*`** (ADR-011): 15+ ocorrências em avatar, badge, button, checkbox, radio, spinner, tabs, textarea, toggle, etc. Incluindo sub-renames:
  - `.primary.foreground` → `.brand.content.contrast`
  - `.primary.text` → `.brand.content.default`
- **`semantic.text.*` → `semantic.content.*`** (ADR-011): em breadcrumb, button, form-field, input, select, tabs, textarea, token-architecture. Inclui `.text.link.*` → `.content.link.*`.
- **`semantic.state.disabled.foreground` → `semantic.content.disabled`** (ADR-011): button, select.
- **`semantic.feedback.*.foreground|text` → `semantic.feedback.*.content.default`**: alert, textarea, form-field.
- **`semantic.border.hover` → `semantic.border.control.hover`** (ADR-009): select, textarea.
- **`semantic.radius.*` → `foundation.radius.*`** (radius é Foundation, não Semantic): card, checkbox, modal, radio, skeleton, tooltip.
- **`foundation.z-index.*` → `foundation.z.*`**: modal, tooltip.
- **`foundation.motion.duration.*` → `foundation.duration.*`**: spinner.
- **`semantic.background.muted` → `semantic.state.disabled.background`**: skeleton.
- **`--ds-typography-control-font-size-*` → `--ds-control-font-size-*`**: button, input, select, textarea. O Style Dictionary faz strip-layer removendo `typography`; a doc mantinha o nome pre-strip.
- **`--ds-border-hover` → `--ds-border-control-hover`**: select, textarea.

Também em `docs/token-architecture.html`: exemplo de component token atualizado de `--ds-button-bg-brand-default` (inexistente) para `--ds-button-bg-toned-default` (real, criado no PR #18).

E em `docs/brand-principles.md`: `foundation.color.brand.primary/secondary/accent` → `foundation.brand.primary/secondary` (`.accent` nunca existiu — só primary e secondary em Foundation; marcado como "não definido" até virar ADR).

**Total: 66 renames em 19 arquivos.** Audit residual: 2 "fantasmas" remanescentes são bad examples didáticos intencionais (`--ds-red-600` em `design-principles.html` dizendo "não use" + `--ds-color-primary` em `token-architecture.html` dizendo "não colapse"). Ficam.

### Observações do audit (não aplicadas nesta PR)

**Semantic: 18 tokens órfãos** (declarados mas nenhum componente consome): 3 border-widths extras, 5 `space-inset-*`, 6 `space-component-*`, 4 `space-section-*`. Decisão pendente (remover / manter / caso a caso).

**Component: 19 tokens órfãos** declarados no JSON mas não consumidos pelo CSS do próprio componente:
- `button` (6): `background/foreground-toned-*` (criados no PR #18, CSS ainda usa semantic direto — refatoração pendente)
- `checkbox` (6): `check-width/height-sm/md/lg` (CSS provavelmente desenha via SVG/stroke, não consome)
- `input`, `select` (3 cada): `padding-y-sm/md/lg` (CSS usa height pra controlar Y, não padding-y)
- `modal` (1): `padding`

### Notas
- Audit confirmou: **11 componentes têm tokens JSON**, **7 não têm e consomem semantic direto** (alert, badge, breadcrumb, card, divider, tabs, tooltip — arquiteturalmente OK pela ADR-001: camada component é opcional).
- **Paridade light/dark: perfeita** (132 = 132, 0 divergência de tipo).
- Próximo passo: decisão sobre os 37 órfãos totais (18 semantic + 19 component) + audit da camada Foundation.

## [0.5.13]

### Corrigido
Audit completo dos 9 arquivos `foundations-*.html` restantes (após PR #19 auto-gerar `theme-colors`). Descobertos 3 arquivos com drift real:

- **`foundations-motion.html`**: `--ds-duration-fast` mostrava `100ms` mas CSS real é `150ms` (divergência em 2 lugares — label demo + tabela). Tabela de easings usava keywords CSS imprecisas (`ease`, `ease-in`, `ease-out`, `ease-in-out`) — o CSS real usa `cubic-bezier(0.4, 0, 0.2, 1)` etc, que **não são equivalentes** às keywords. Corrigido: duration, tabela com valores cubic-bezier reais, labels demo com descrição semântica (`padrão`, `acelerando`, `desacelerando`, `suave`) em vez de keyword enganosa.
- **`foundations-opacity.html`**: `<code>--ds-color-overlay-black-5</code>` era **token fantasma** — o nome CSS correto é `--ds-overlay-black-5` (sem `color-`). Corrigido.
- **`foundations-borders.html`**: duas tabelas de cores de borda (`Border Colors`, `Feedback Border Colors`) estavam com 7 valores desatualizados pós PR #18 **e** duplicavam informação já presente em `foundations-theme-colors.html` (que é auto-gerada). Removidas; substituídas por parágrafo linkando pra Theme Colors. Mantida só a tabela de `Border Widths`, que está correta.

### Confirmado em dia
`foundations-typography.html`, `foundations-spacing.html`, `foundations-radius.html`, `foundations-elevation.html`, `foundations-zindex.html`, `foundations-colors.html` — 0 drift. Os "falsos positivos" do audit automático eram tabelas conceituais (elevation mapeia "nível → combinação de tokens"; zindex mostra "uso por token"; opacity é `<div>` custom não `<table>`) que o parser genérico confundiu com tabelas de valor.

### Notas
- Princípio de não-duplicação aplicado: quando um token semântico tem seu valor canônico em `foundations-theme-colors.html`, outras páginas de foundation **não** repetem — linkam. Evita drift futuro.
- Próximo passo: revisão equivalente nas camadas **Semantic** e **Component** (páginas de docs e Figma).

## [0.5.12]

### Corrigido
- **`docs/foundations-theme-colors.html` agora é auto-gerado** a partir dos JSONs `tokens/semantic/{light,dark}.json` e `tokens/foundation/{colors,brand}.json`. O arquivo era mantido à mão e acumulou drift severo: **37 das 53 linhas (70%)** estavam com valor errado, principalmente porque o PR #18 (0.5.11) mudou valores de semantic mas a doc não acompanhou. Problemas eliminados:
  - 5 tokens **duplicados** (ex: `accent-subtle` aparecia com `purple-100/purple-800` e também com `purple-50/purple-950` — a segunda linha era fantasma).
  - 22 tokens **desatualizados** pós PR #18 (`brand.hover/active`, `feedback.*.hover/active/border`, `background.subtle`, `state.disabled.background`, etc).
  - 10 tokens com **apelidos imprecisos** (doc usava `white` em vez de `neutral-50`, `primary` em vez de `brand-default`, `blue-600` em vez de `brand-primary`).
  - 3 linhas **inventadas** sem correspondência no CSS real.

### Adicionado
- Em `scripts/sync-docs.mjs`: função que lê `tokens/semantic/{light,dark}.json`, resolve aliases recursivamente respeitando a arquitetura (para em `foundation.brand.*` e em outros semantic — bate com o que o Style Dictionary emite no CSS), e gera 12 seções (Background, Surface, Brand Primary, Brand Secondary, Text/Foreground, Border, Feedback Success/Warning/Error/Info, State, Overlay) com **85 tokens**.
- Marcadores `<!-- AUTO-GENERATED:THEME-COLORS:START|END -->` no HTML — só a região entre eles é regenerada; header, nav, sidebar, footer continuam editáveis à mão.
- Audit de tokens faltando: se um token `$type: color` existe em `semantic/light.json` mas não está listado em nenhuma seção, o script avisa no console.

### Notas
- Daqui pra frente, toda mudança de token no JSON regenera a doc automaticamente (via `npm run sync:docs`, já no `build:all`). Drift arquitetural nessa página é estruturalmente impossível.
- **Follow-up**: auditar `foundations-spacing.html`, `foundations-radius.html`, `foundations-typography.html`, `foundations-elevation.html`, `foundations-motion.html`, `foundations-zindex.html`, `foundations-borders.html`, `foundations-opacity.html` pra confirmar se estão em dia ou se têm drift similar. (Opção C do plano — próximo PR.)

## [0.5.11]

### Alterado (Figma — alinhamento arquitetônico + primeiro sync real)

Primeira execução end-to-end do fluxo Figma → JSON. O Figma estava arquiteturalmente defasado em relação ao JSON (que evoluiu ao longo das ADRs 001/005/006/007/011): tinha valores literais onde o JSON tinha aliases de 2–3 níveis. Decisão do time em 21/04/2026: ajustar o Figma pra espelhar a arquitetura do JSON antes de começar a usar o sync bidirecionalmente.

**Ajustes no Figma (~162 operações):**
- **Foundation — criadas 8 variáveis**: `color/disabled/brand-light`, `brand-dark`, `success-light`, `success-dark`, `error-light`, `error-dark` (ADR-007), `spacing/9` (36px), `spacing/11` (44px).
- **Foundation — renomeadas 44 variáveis** de `font/*` → `typography/font/*` pra alinhar com a estrutura do JSON (`foundation.typography.font.*`).
- **Semantic — 31 rebindings**: link/focus/border agora apontam pra `semantic.brand.*` via alias (antes apontavam direto pra foundation); `focus/ring/*`, `size/control/*`, `typography/control/*`, `*.disabled`, `*.contrast-disabled` viraram aliases de foundation (antes eram literais).
- **Component — 28 rebindings**: `button/input/select/textarea` — height, font-size, icon-size, min-target-size viram aliases de `semantic.size.control.*` e `semantic.typography.control.*`.
- **Component — reestruturado padding**: substituído `{comp}/padding/{sm,md,lg}` (unificado) por `{comp}/padding-x/*` + `{comp}/padding-y/*` em 4 componentes (24 criadas, 12 deletadas).
- **Component — 7 criadas**: `button/bg/toned/{default,hover,active,disabled}`, `button/foreground/toned/{default,disabled}`, `skeleton/fill`.
- Total Figma: **489 variáveis** (era 462) em 4 collections.

**Sync Figma → JSON aplicado (38 VALUE_DRIFT, categoria A):**
- Decisões visuais mais recentes do Figma sincronizadas para `tokens/semantic/light.json` e `dark.json`. Maior parte são ajustes finos de shade — `brand.hover` blue.700 → blue.800, `feedback.success.border` green.600 → green.500, `background.subtle` neutral.100 → neutral.200, etc. CSS regenerado, docs regeneradas, zero mudanças em Foundation ou Component.

### Adicionado
- Categoria **CSS_ONLY** no `scripts/lib/figma-dtcg.mjs`: tokens com representação CSS-específica (font family stacks, weights numéricos, unidades rem) ficam marcados como informativos e **não são aplicados via `--write`**. Evita regressão onde o Figma trocaria `'Inter', system-ui, -apple-system,...` por `"Inter"` sozinho, weights `400/500/600/700` por `"Regular"/"Medium"/...`, e `0.875rem` por `14`. Cobre ~9 tokens em `foundation.typography.font.family/weight/size`.
- `FOUNDATION_PREFIX_TO_FILE`: mapping atualizado de `font` → `typography.json` para `typography` (Figma agora usa prefixo `typography/font/*`).

### Pendente (relatado mas não aplicado)
- **37 tokens de line-height/letter-spacing** aparecem como NEW_IN_FIGMA (23) ou MISSING_IN_FIGMA (14) porque Figma e JSON usam **sistemas diferentes**: Figma tem valores em PX (`line-height/90`, `line-height/44`, `letter-spacing/-0.5`); JSON tem ratios (`line.height.tight = 1.25`) e unidades rem (`line.height.control.sm = 1rem`). Não é "mais recente" em um lado — são conceitos divergentes. Decisão adiada: será tratada em PR separada com ADR.

### Notas
- Propriedade `hiddenFromPublishing = true` não pôde ser setada via `use_figma` (erro `Node not found` após create) — as 6 novas `color/disabled/*` e 2 novas `spacing/9|11` ficaram visíveis aos pickers. Ajuste manual no Figma depois.

## [0.5.10]

### Adicionado
- `scripts/sync-tokens-from-figma.mjs` + `scripts/lib/figma-dtcg.mjs`: sync Figma → JSON baseado em snapshot gerado via MCP. Desvia da limitação da REST API (exclusiva Enterprise) usando o MCP remoto `use_figma` — agente Claude Code dumpa as ~462 Variables em `.figma-snapshot.json` (gitignored), e o script Node compara com `tokens/**/*.json` em 4 categorias: VALUE_DRIFT (auto-corrigível com `--write`), NEW_IN_FIGMA, MISSING_IN_FIGMA, ALIAS_BROKEN.
- `docs/process-figma-sync.md`: passo-a-passo do fluxo, incluindo troubleshooting e limitações.
- npm scripts: `sync:tokens-from-figma` (dry-run) e `sync:tokens-from-figma:write`.
- `.figma-snapshot.json` e variações no `.gitignore` (snapshot é derivado, não vai pro repo).

### Alterado
- CLAUDE.md: regras de ouro de tokens atualizadas com o fluxo MCP concreto (em vez de "mecanismo em reavaliação"). Ferramentas lista os dois scripts novos.
- `docs/backlog.md`: item "Implementar o sync Figma → JSON" (que tinha 4 opções em aberto) substituído por "Automatizar o sync Figma → JSON em CI" — reconhece que a opção (b) MCP está implementada pro fluxo manual e mantém as outras 3 (plugin custom, Tokens Studio, Enterprise) como caminhos pra automação futura.

### Notas
- Direção canônica da ADR-003 continua: Figma é autoridade, JSON é consolidação derivada. O sync consolida essa direção na prática — mas é manual (exige sessão Claude Code), não roda em GitHub Actions.
- `verify:tokens` não foi alterado nesse PR; continua checando coerência JSON ↔ CSS.

## [0.5.9]

### Revertido
- Revertido o PR #15 (0.6.0, `feat(tokens): sync Figma → JSON via script + workflow + verify refinado`). Motivo: o endpoint `GET /v1/files/:key/variables/local` da Figma REST API requer o scope `file_variables:read`, que **é exclusivo do plano Enterprise**. Nosso plano atual é Pro/Expert — o PAT não consegue emitir esse scope. Script inútil no plano atual.
- Removidos: `scripts/sync-tokens-from-figma.mjs`, `scripts/lib/figma-dtcg.mjs`, `.github/workflows/sync-tokens-from-figma.yml`, e os npm scripts correspondentes.
- `scripts/tokens-verify.mjs` voltou à implementação pré-0.6.0 (sem a classificação NEEDS_SYNC/DRIFT_FROM_SOURCE/VALUE_DRIFT — que dependia do módulo `lib/figma-dtcg.mjs` também revertido).

### Alterado
- CLAUDE.md: ajustado para refletir que o mecanismo de propagação Figma → JSON está em reavaliação. Regra de ouro "não editar `tokens/*.json` à mão" continua valendo.
- `docs/backlog.md`: item "Implementar o sync Figma → JSON" adicionado em alta prioridade, listando as quatro opções em aberto (plugin custom, adaptar pra MCP, Tokens Studio, upgrade Enterprise).

### Mantido
- ADR-003 revisada (Figma como autoridade canônica) continua válida — a decisão conceitual não depende do mecanismo técnico. Só o "como" ficou em aberto.

## [0.5.8]

### Alterado
- ADR-003 reescrita. A versão anterior declarava Git como fonte de verdade para tokens; a revisão reposiciona **Figma Variables como a autoridade canônica** dos valores de token. Git (`tokens/**/*.json`) passa a ser "consolidação derivada em DTCG" em vez de source. Fluxo canônico: Figma → sync manual → JSON → CSS → site. Decisão tomada em 21/04/2026 alinhando a prática à intenção do time (designer decide; dev consolida).
- CLAUDE.md: seção "Como a pipeline funciona" atualizada com o novo fluxo. Regras de ouro adicionadas: não editar `tokens/*.json` à mão, sempre passar pelo Figma. Lista de scripts em "Ferramentas" lista `sync:tokens-from-figma` (a ser implementado no próximo PR).
- Backlog reestruturado: item "Sincronização automatizada Figma ↔ site" substituído por "Reduzir documentação textual do Figma" (decisão concreta do time). Adicionados itens "Futuro do site de documentação" (Astro/Zeroheight/Supernova), "Resolução de conflitos inteligente" e "Sincronização automática de tokens" (evoluções futuras).

## [0.5.7]

### Adicionado
- 6 tokens foundation novos em `tokens/foundation/colors.json`, subcategoria `color.disabled`: `brand-light`, `brand-dark`, `success-light`, `success-dark`, `error-light`, `error-dark`. Valores primitive (hex/rgba) que representam o fill disabled de cada role; viviam antes como literais na camada semantic.

### Corrigido
- `semantic.brand.disabled`, `semantic.feedback.success.disabled`, `semantic.feedback.error.disabled`, `semantic.brand.content.contrast-disabled`, `semantic.feedback.success.content.contrast-disabled`, `semantic.feedback.error.content.contrast-disabled` em `light.json` e `dark.json` — 12 tokens que tinham valores rgba/hex literais agora referenciam tokens foundation (`color.disabled.*` ou `color.overlay.white.80/60` existentes). Viola menos a regra "semantic nunca hardcoded" (ADR-001). Zero mudança visual.
- Item correspondente removido do backlog.

## [0.5.6]

### Alterado
- ADR-007: sincronização Figma completa. Confirmação de que o naming aninhado `brand/toned/{default,hover,active}` já vigora no arquivo Figma (migração feita durante ADR-011). Variáveis `color/primary/toned-*` antigas (flat + `-disabled`/`-disabled-fg`) não existem mais.
- Button variant Toned+Disabled: 6 variantes (3 tamanhos × Icon Only true/false) tinham foreground apontando para `brand/content/contrast-disabled` (errado para contexto toned com fundo neutral) ou para variável órfã. Re-vinculadas para `content/disabled` (neutral-400 opaco), conforme ADR-007. 21 rebindings no total.
- Item correspondente removido do backlog.

### Alterado
- ADR-006 e ADR-007 traduzidos inteiramente para PT-BR. Antes, partes do corpo (Context, Decision, Consequences, Alternatives considered) estavam em inglês enquanto o cabeçalho havia sido traduzido. Agora os 11 ADRs são consistentes em idioma.
- Pequenos ajustes no ADR-006 durante a tradução: tokens `semantic.typography.control.line-height.*` documentados referenciando `{foundation.spacing.4/5/6}` (alinhado ao que o código já faz desde 0.5.3). Tokens de CSS listados em "Consequências" alinhados aos nomes reais emitidos pelo build (`--ds-control-font-size-*`, `--ds-control-line-height-*`).
- Pequenos ajustes no ADR-007 durante a tradução: tokens `semantic.brand.toned.*` documentados no naming consolidado do ADR-011 (antes referenciados como `semantic.color.primary.toned.*`). Foreground toned aponta para `semantic.brand.content.default`.

## [0.5.4]

### Alterado
- ADR-007 marcada como Aceita — Implementada em 0.5.0. Camada de código (foundation overlays, semantic toned, component tokens, CSS do button) já havia sido executada via ADR-011; fechamento formal em 0.5.4.

### Pendente
- Sincronização Figma: renomeação de `color/primary/toned`, `-hover`, `-active` para hierarquia aninhada (`toned/default`, `toned/hover`, `toned/active`), remoção de `toned-disabled` e `toned-disabled-fg`, rebinding do Button Toned disabled para `state/disabled/*`. Será executado como tarefa Figma separada.

## [0.5.3]

### Alterado
- ADR-006 marcada como Aceita — Implementada em 0.5.0. Implementação já havia acontecido via ADR-011; fechamento formal em 0.5.3.
- `semantic.size.control.*` e `semantic.typography.control.line-height.*` em `tokens/semantic/light.json` e `dark.json` passam a referenciar tokens `foundation.spacing.*` em vez de valores absolutos. Integridade da cadeia de tokens preservada (foundation → semantic).

### Adicionado
- `component.input.padding-y.{sm,md,lg}` e `component.select.padding-y.{sm,md,lg}` em `tokens/component/input.json` e `select.json`, referenciando `semantic.space.control.padding-y.*`. Gera `--ds-input-padding-y-*` e `--ds-select-padding-y-*` no CSS gerado.

### Corrigido
- `docs/control-sizing.html` — nomes das CSS vars na tabela agora batem com o que o build realmente emite: `--ds-control-font-size-*` e `--ds-control-line-height-*` (em vez de `--ds-typography-control-*`). O transform `name/strip-layer` remove o segmento `typography` do nome gerado.

## [0.5.2]

### Alterado
- ADR-005 marcada como Aceita — Implementada em 0.5.0. Implementação já havia acontecido via ADR-011; fechamento formal em 0.5.2.

### Corrigido
- `scripts/tokens-verify.mjs`: função `canônicalToCssVar` agora espelha exatamente o transform `name/strip-layer` de `build-tokens.mjs`. Remove os 65 falsos positivos (`foundation.typography.font.*` e `foundation.color.overlay.*`) que mascaravam a saúde real da cadeia Figma → JSON → CSS. `npm run verify:tokens` agora reporta 0 warnings, 0 erros.


Consolidação da documentação como fonte única de verdade. Plano em seis fases executadas na branch `consolidation/docs-ground-truth`.

### Alterado
- `package.json` realinhado para `0.5.1` (estava em `1.5.1` sem publicação no npm, divergindo do que o site exibia).
- `README.md` reescrito curto (39 linhas, era 74), aponta pro site como fonte completa.
- `CLAUDE.md` reescrito enxuto (123 linhas, era 498). Mantém só instruções de agente, acessos MCP, convenções, regras operacionais, checklist. Conteúdo duplicado do site foi removido.
- `tokens/component/README.md` substituído por nota correta (era placeholder mentindo "componentes ainda não foram migrados").
- `docs/foundations.html` ganhou breadcrumb e link pra `token-architecture.html` na intro; grade de cards mantida.
- `.github/workflows/deploy.yml` passa a rodar `npm run build:all` (tokens + docs + api + llms + verify) em cada push pra main.
- `scripts/sync-docs.mjs` ampliado para converter MDs em HTML usando `marked`, injetar badge de versão em `index.html` e gerar `docs/decisions/index.html` + 11 HTMLs de ADR.
- ADRs atualizados para refletir o código real: ADR-004/008/009/010/011 marcados como "Aceita — Implementada em 0.5.0" com referência aos commits. ADR-003 ganhou seção "Verificação automatizada". ADR-005/006/007 ganharam Pré-requisitos/Estimativa/Passos concretos.

### Adicionado
- Tag `v0.5.0-pre-consolidation` marcando o estado antes da consolidação.
- `CHANGELOG.md` na raiz como fonte canônica. `docs/changelog.html` passa a ser gerado a partir deste arquivo.
- `CONTRIBUTING.md` na raiz (setup, fluxo PR, convenções, versionamento).
- `docs/brand-principles.md` com template para preenchimento.
- `docs/backlog.md` listando itens fora deste plano (ADR-005/006/007, Storybook, MCP próprio, publicação npm, etc).
- `docs/process-contributing.md`, `docs/process-versioning.md`, `docs/process-releasing.md` cobrindo fluxos.
- `scripts/tokens-verify.mjs`: verifica coerência JSON ↔ CSS (e JSON ↔ Figma quando FIGMA_PAT definido). Três saídas: terminal, `docs/api/tokens-sync.json`, `docs/tokens-sync.html`.
- `.github/workflows/verify-tokens.yml`: roda verify em PR e push, comenta divergências no PR.
- `scripts/build-api.mjs`: gera `docs/api/components.json`, `tokens.json`, `adrs.json`, `foundations.json`.
- `scripts/build-llms.mjs`: gera `docs/llms.txt` (índice) e `docs/llms-full.txt` (conteúdo consolidado, 133 KB) seguindo llmstxt.org.
- Scripts `verify:tokens`, `build:api`, `build:llms`, `build:all` em `package.json`.
- `scripts/archive/` com `extract-tokens.js` e `add-i18n-shell.mjs` preservados e explicados em README.
- Badge de versão em `index.html` (lida do `package.json` pelo build).
- Links `<link rel="alternate">` em `index.html` apontando pros llms.txt.

### Removido
- `style-dictionary.config.js` (legado CommonJS v4, não usado — script ativo é `build-tokens.mjs`).

## [0.5.0] — 2026-04-15

### Adicionado
- Página Token Architecture — diagrama de 3 camadas, walkthrough de cadeia de alias, convenção de nomenclatura, mapeamento entre formatos.
- Página Changelog.
- Páginas Foundation: Motion (7 tokens), Opacity (7 tokens), Z-index (6 tokens).
- Template expandido de componente com 10 novas seções: quando usar, anatomia, boas práticas (faça/não faça), diretrizes de conteúdo, mapeamento de tokens, interação por teclado, tabela WCAG, propriedades Figma, componentes relacionados.
- Todas as 19 páginas de componentes reescritas com o template expandido (+5.000 linhas).
- Blocos faça/não faça com previews ao vivo em todos os componentes.

### Alterado
- Sidebar atualizada em todas as 34 páginas — links novos para Motion, Opacity, Z-index, Token Architecture, Changelog.
- Overview de Foundations: 3 novos cards (Motion, Opacity, Z-index), agora 10 no total.

### Corrigido
- Implementação de focus ring em `accessibility.html` migrada de `box-shadow` para `outline` + `outline-offset` (ADR-005).
- Seção incorreta de focus ring removida de `elevation.html`.
- Contagem de componentes na home corrigida para 19.

## [0.4.0] — 2026-04-14

### Adicionado
- Arquivos JSON de tokens de componente: `button.json`, `input.json`, `textarea.json`, `select.json`, `checkbox.json`, `radio.json`, `toggle.json`, `badge.json`, `alert.json`, `card.json`, `modal.json` (118 tokens no total).
- Variáveis Figma reconciliadas em 4 coleções (Foundation, Brand, Semantic, Component).
- Script de build Style Dictionary (`build-tokens.mjs`) gerando CSS em `css/tokens/generated/`.
- Componente Form Field (`ds-field`) com label, texto auxiliar, indicador de obrigatório, mensagem de erro, contador de caracteres.

### Alterado
- Arquitetura de tokens formalizada: Foundation → Semantic → Component (ADR-001, ADR-005).
- Regra do sufixo `-default` aplicada: todos os tokens `.default` geram `-default` no CSS.
- Focus ring migrado de `box-shadow` para `outline` + `outline-offset` (ADR-005).
- Subcamada Brand formalizada: 2 tokens (primary, secondary), sem estados, trocável por tema.

## [0.3.0] — 2026-03

### Adicionado
- 18 componentes implementados em CSS: Button, Input, Textarea, Select, Checkbox, Radio, Toggle, Badge, Alert, Card, Modal, Tooltip, Tabs, Breadcrumb, Avatar, Divider, Spinner, Skeleton.
- Site de documentação com previews ao vivo, blocos de código, seletor de tema, toggle de modo escuro.
- Páginas Foundation: Colors, Theme Colors, Typography, Spacing, Radius, Elevation, Borders.
- Guias: Theming, Accessibility.
- Três temas: Default (Blue/Purple), Ocean (Cyan/Indigo), Forest (Emerald/Amber).
- Modo light/dark com remapeamento de tokens semânticos.

## [0.2.0] — 2026-02

### Adicionado
- 94 tokens semânticos (camada Theme) com valores Light/Dark.
- Variáveis Figma: 3 coleções (Foundation, Brand, Theme) com suporte a modos.
- 24 text styles: display, heading, body, label, caption, overline, code (Inter + DM Mono).

## [0.1.0] — 2026-01

### Adicionado
- Tokens foundation: 10 paletas de cores (escala 50–950), spacing (20 steps), radius (8 tokens), shadows, opacity, motion, stroke, z-index.
- CSS custom properties (`--ds-*`) para todos os tokens foundation.
- Reset base com carregamento de Inter + DM Mono.
- Estrutura do repositório: `css/`, `docs/`, `js/`.
