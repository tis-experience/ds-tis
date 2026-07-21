# Spec Figma proposta

- Componente/padrao: Table (tabela HTML de apresentação + composição)
- Pagina Figma: `Table` (nova — hoje inexistente no DS; só ícones Lucide `table*`)
- Referencias DS Core consultadas: Pagination (composition + página modelo), Card (superfície / “não use para dados tabulares”), Divider (linha vs grade), Menu (ações em célula nos exemplos)
- Referencias externas consultadas: WAI-ARIA APG Table + Sortable Table; Carbon Data Table (anatomia/density/selection como camadas); Polaris Data Table / Index Table (dados vs gestão; lógica na app)

## Anatomia

- Root: component set `Table` (matriz de densidade + estados de header/row) **e/ou** set auxiliar `Table Header Cell` / `Table Cell` se o padrão vivo de Pagination (item atomizado) for mais limpo — decisão de implementação do Builder, desde que a API pública documentada bata com esta spec.
- Subcamadas sugeridas (de cima para baixo no painel composto):
  1. `Scroll` / `Frame` (wrapper de overflow — nos exemplos; `clipsContent=false` em frames documentais)
  2. `Table`
     - `Caption` (TEXT, boolean Show Caption)
     - `Header Row` → N × `Header Cell`
     - `Body` → N × `Row` → N × `Cell`
  3. Exemplos de composição (fora do set mínimo): coluna select (Checkbox), coluna actions (Button / Menu), Pagination abaixo
- Nested instances: Checkbox, Badge, Button, Menu, Lucide sort icons, Avatar (exemplos)
- Slots: conteúdo de `Cell` = slot de composição (não TEXT único obrigatório em todas as variants)

## Auto-layout

- Root/Table: vertical; width fill nos exemplos de página; height hug
- Header/Body rows: horizontal; cells com padding bindado por density
- Header cell sortable: horizontal, space-between ou gap entre label e ícone
- Numeric cell: align end
- Actions cell: hug, align end/center
- Padding cell: Component token → Semantic `space.*` por `sm`/`md`
- `clipsContent`: **false** em root/seções documentais e exemplos com focus ring / Menu aberto; overflow scroll só no wrapper de demonstração horizontal quando necessário

## Properties

- Variants:
  - `Size` = Small | Medium (menor→maior; default Medium)
  - `Appearance` = Default | Bordered (se barato no Figma; senão modifier só no CSS/docs)
  - Header: `Sort` = None | Ascending | Descending (só em variants Sortable)
  - Row: `State` = Default | Hover | Selected (Disabled opcional)
- Text properties: `Caption`, `Header Label`, `Cell Text` (em variants de texto puro)
- Boolean properties: `Show Caption`, `Show Sort Icon` (se Sortable), `Show Selection Column` (exemplos / variants de composição)
- Instance swaps: `Sort Icon`, `Leading Icon` (se houver), Checkbox/Menu via nested instances nos exemplos
- Slot properties: Cell content composto nos exemplos (Badge, Avatar+texto, etc.)
- Ordem no painel: Show Caption → Caption → Size → Appearance → Show Selection Column → Sort → State (quando aplicável)

## States

- Default: header + linhas com divider inferior `border.subtle` / `border.default`
- Hover (row): background Semantic hover/subtle
- Focused: focus ring nos controles internos (Checkbox, Button sort, Menu trigger) — tokens `focus-ring/*`; não inventar ring na `td` inteira no MVP
- Pressed: N/A na row; sort button e controles seguem Button/Checkbox
- Disabled: row ou controles com opacity/content disabled Semantic
- Open/Closed: N/A (Menu aninhado usa estados do Menu)
- Error/Invalid: N/A no MVP (validação de form não é Table)
- Sort: `aria-sort` espelhado visualmente (ícone + weight/color no header ativo)
- Selected: background de row selected + Checkbox checked

## Tokens/bindings

- Foundation: nenhum binding direto em nós finais
- Semantic: `surface` / `background` / `border` / `content` / `space` / `radius` / `typography` / `opacity` (disabled)
- Component (propostos):
  - `table/container/bg`, `table/header/bg`, `table/row/bg`, `table/row/bg/hover`, `table/row/bg/selected`
  - `table/border/color`, `table/divider/color`, `table/divider/width`
  - `table/cell/padding-x/{sm,md}`, `table/cell/padding-y/{sm,md}`, `table/cell/gap`
  - `table/header/font-*`, `table/body/font-*`, `table/header/color`, `table/body/color`
  - `table/sort/icon-size`, `table/sort/icon-color`, `table/select/column-width`
  - `table/radius` (container, se bordered)
- Variables novas: apenas sob collection `Component` / grupo `table/…`, aliases 1:1 para Semantic
- Effect styles: nenhum elevation obrigatório (Table no fluxo, não overlay)
- Text styles: `label/sm|md` / `body/sm|md` existentes — bindar via Component tipography aliases

## Exemplos no canvas

- Exemplo 1: Table básica (caption + 4 colunas texto/número) — densidades sm e md
- Exemplo 2: Sortable (uma coluna com Ascending) + zebra opcional
- Exemplo 3: Composição seleção (Checkbox) + Badge de status + Menu de ações + Pagination abaixo
- Exemplo 4: Empty state (mensagem + Button)
- Matriz de variants: Size × Sort × Row State (mínimo legível; não explodir todas as combinações de colunas)

## Documentacao visual

- Secoes (ordem alinhada a Pagination/Card):
  1. `header` — nome + subtítulo
  2. `divider`
  3. `section-quando-usar` / não usar
  4. `section-anatomia`
  5. `section-variantes` (component set aninhado)
  6. `section-composicao` (Checkbox, Badge, Menu, Pagination)
  7. `section-acessibilidade`
  8. `section-tokens` / properties (tabelas derivadas da API real)
- Tabelas: properties, tokens Component, diferença Table vs Card vs Pagination vs DataGrid futuro
- Notas para designers: não usar Table para layout; não abrir Menu como “variante de Table”; densidade menor→maior; conteúdo wrap > truncate agressivo em headers longos
- Diferencas para componentes proximos: espelhar brief

## Validacao planejada

- Estrutura: 1 frame raiz `Table`; 0 nós soltos no canvas; seções na ordem; component set dentro da seção de variantes
- Bindings: 100% fills/strokes/spacing/radius tipografia de anatomia via Component→Semantic; ícones Lucide com size/color/stroke Component
- Slots: exemplos de célula composta com instâncias DS reais
- Textos: properties TEXT ligadas; caption/header editáveis
- Instancias: sem glyph / Icon Placeholder
- Screenshot: comparar contra Pagination + Card + Divider (densidade, padding de seção, tipografia de docs)
- Validadores repo (pós-aprovação Figma): `verify:figma-structure`, `audit:component-tokens`, depois sync → `verify:tokens`

## Bloqueado antes de

- Figma write: sim — até owner aprovar brief + esta spec
- Repo sync: sim — até Figma audit aprovado
- Commit/push: sim — até pedido explícito do owner
