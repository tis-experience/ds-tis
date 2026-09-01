# Evidência Figma viva — Popover

- Lido em: 2026-08-03
- Arquivo: `IE68amP9Hya5ieFw1rX8S8`
- Página: `10333:817` — `❖ Popover`
- Modo: somente leitura via Figma Plugin API
- Screenshot: `figma-popover-root-2026-08-03.png`

## Estrutura da página

A página possui um único filho raiz:

- `10333:818` — frame `Popover`, 1800 × 2382, `clipsContent=false`.

Filhos diretos, na ordem viva:

1. `10333:819` — `header`;
2. `10333:822` — `divider`;
3. `10333:823` — `section-propriedades`;
4. `10338:2283` — `section-exemplos`;
5. `10333:843` — `section-variantes`;
6. `10333:859` — `section-acessibilidade`;
7. `10333:2853` — `section-diferencas`.

O component set `10332:504` está aninhado em `section-variantes`; a página não
possui nós soltos fora do root. Esta leitura confirma estrutura atual, mas a
comparação visual com 2-3 páginas maduras ainda está pendente.

## API pública do component set

O set `10332:504` expõe 13 properties:

| Property | Tipo | Default/opções |
|---|---|---|
| `Show Header#10332:0` | BOOLEAN | `true` |
| `Title#10332:9` | TEXT | `Título do Popover` |
| `Show Arrow#10332:36` | BOOLEAN | `true` |
| `Show Content Slot#10366:9` | BOOLEAN | `false` |
| `↳ Content Slot#10366:18` | SLOT | vazio |
| `Show Content Text#10366:27` | BOOLEAN | `true` |
| `Content Text#10366:36` | TEXT | `Conteúdo composto com componentes DS.` |
| `Show Close#10557:0` | BOOLEAN | `true` |
| `Show Secondary Action#10597:0` | BOOLEAN | `true` |
| `Secondary Action#10597:5` | INSTANCE_SWAP | `68:194` |
| `Show Primary Action#10597:10` | BOOLEAN | `true` |
| `Primary Action#10597:15` | INSTANCE_SWAP | `68:122` |
| `Placement` | VARIANT | `Bottom`; opções `Bottom`, `Top`, `Left`, `Right` |

## Variants e referências

Os quatro variants medem 280 × 148:

- `10332:424` — `Placement=Bottom`;
- `10332:444` — `Placement=Top`;
- `10332:464` — `Placement=Left`;
- `10332:484` — `Placement=Right`.

Em todos os quatro, a leitura por node confirmou:

- `Header.visible` → `Show Header#10332:0`;
- `Title.characters` → `Title#10332:9`;
- `Close.visible` → `Show Close#10557:0`;
- `Body Text.visible` → `Show Content Text#10366:27`;
- `Body Text.characters` → `Content Text#10366:36`;
- `↳ Content Slot.visible` → `Show Content Slot#10366:9`;
- `↳ Content Slot.slotContentId` → `↳ Content Slot#10366:18`;
- `Secondary Action.visible/mainComponent` → properties correspondentes;
- `Primary Action.visible/mainComponent` → properties correspondentes;
- `Arrow.visible` → `Show Arrow#10332:36`.

IDs do Content Slot por placement: `10336:2202`, `10336:2207`, `10336:2212` e
`10336:2217`. O slot está oculto por default nos quatro variants, coerente com
`Show Content Slot=false`.

## Bindings observados

A leitura de fields bindados confirmou:

- `Title` e `Body Text`: `fills`, `letterSpacing`, `fontSize`, `fontStyle`,
  `fontFamily` e `lineHeight` em todos os variants;
- `Close`: padding, width e height;
- `Panel`: gap, padding, radius, border, fills e strokes;
- `Arrow`: width nos placements verticais e height nos laterais;
- ícone de close: width e height;
- actions: anatomia/tokens herdados das instâncias Button.

`get_variable_defs(10332:504)` resolveu tokens `popover/*` para title, close,
body, panel, arrow e actions, além dos Text Styles `body/sm-bold` e `body/sm` e
do Effect Style `elevation/2`. Esta evidência prova que os bindings existem; uma
eventual edição ainda exigirá a matriz completa `node + propriedade + VariableID`
prevista pelo workflow.

## Estado do gate

- Contrato vivo do alvo: lido e persistido.
- Screenshot do alvo: persistido.
- Comparação com páginas modelo: pendente.
- Benchmark upstream completo: pendente.
- Decisão Figma (`sem mudança` ou `proposta`): pendente.
- Escrita Figma: bloqueada.
