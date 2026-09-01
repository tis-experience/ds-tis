- Status: Approved unchanged

# Spec Figma proposta

- Componente/padrão: Tooltip existente; intake de providers sem redesign
- Página Figma: `191:2` (`Tooltip`), root `194:39`
- Referências DS Core consultadas: `docs/tooltip.html`, `css/components/tooltip.css`, `js/tooltip.js`, `tokens/component/tooltip.json`, snapshot Figma de 2026-08-28
- Referências externas consultadas: WAI-ARIA APG Tooltip, Ark UI Tooltip 5.37.2 e Base UI Tooltip 1.6.0

## Anatomia

- Root: preservar frame documental existente e o componente atual
- Subcamadas: preservar trigger de exemplo, label surface e arrow atuais
- Nested instances: preservar Button/icon existente no exemplo Figma
- Slots: nenhum slot novo no Figma; a composição por parts pertence às saídas de código

## Auto-layout

- Root: frame `194:39`, layout vertical, padding 96 e gap 64 bindados a Semantic
- Seções/containers: preservar todas as seções existentes
- Regras de resize: sem alteração
- `clipsContent`: sem alteração

## Properties

- Variants: preservar posições e estados existentes
- Text properties: preservar label editável existente
- Boolean properties: nenhuma nova
- Instance swaps: nenhum novo
- Slot properties: nenhuma nova
- Ordem no painel: sem alteração

## States

- Default: preservar
- Hover: trigger abre Tooltip
- Focused: trigger abre Tooltip sem mover foco
- Pressed: não aplicável ao Tooltip
- Disabled: trigger desabilitado não é foco/hover confiável; wrapper focável deve ser decisão do consumidor
- Open/Closed: preservados
- Error/Invalid: não aplicável

## Tokens/bindings

- Foundation: nenhum consumo direto
- Semantic: somente via Component; `semantic.z.tooltip` continua CSS-only
- Component: 11 variables Tooltip existentes, todas com WEB code syntax e aliases Semantic
- Variables novas: zero
- Effect styles: zero
- Text styles: preservar body/sm atual

## Exemplos no canvas

- Exemplo 1: trigger icon-only com label breve
- Exemplo 2: quatro posições
- Matriz de variants: preservar matriz existente

## Documentacao visual

- Seções: preservar página atual
- Tabelas: preservar contrato e tokens atuais
- Notas para designers: texto curto, complementar e sem controles interativos
- Diferenças para componentes próximos: Popover para conteúdo interativo; texto persistente para informação essencial

## Validacao planejada

- Estrutura: snapshot com page issueCount 0
- Bindings: 11 Component variables Tooltip presentes e com WEB code syntax
- Slots: não aplicável à preservação Figma
- Textos: nenhuma alteração
- Instâncias: nenhuma alteração
- Screenshot: comparação visual será feita nas saídas Web, Ark e React
- Validadores repo: `verify:tokens`, `test:vnext`, browser, consumidor, bundle e Axe

## Bloqueado antes de

- Figma write: bloqueada; resultado aprovado é `unchanged-with-evidence`
- Repo sync: somente adapters/docs/testes; sem token ou Web core
- Commit/push: bloqueados
