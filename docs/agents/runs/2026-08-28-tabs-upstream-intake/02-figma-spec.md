- Status: Approved unchanged

# Spec Figma proposta

- Componente/padrão: Tabs existente; intake de providers sem redesign
- Página Figma: `192:2` (`Tabs`), root `194:94`
- Referências DS Core consultadas: `docs/tabs.html`, `css/components/tabs.css`, `js/tabs.js`, `tokens/component/tabs.json`, snapshot Figma de 2026-08-28
- Referências externas consultadas: WAI-ARIA APG Tabs, Ark UI Tabs 5.37.2/Zag 1.41.2 e Base UI Tabs 1.6.0

## Anatomia

- Root: preservar frame documental e component set atuais
- Subcamadas: preservar List, Tab/Label, active indicator e painéis de exemplo atuais
- Nested instances: preservar componentes e conteúdo dos exemplos existentes
- Slots: nenhum slot novo no Figma; a composição por parts pertence às saídas de código

## Auto-layout

- Root: frame `194:94`, layout vertical, padding 96 e gap 64 bindados a Semantic
- Seções/containers: preservar todas as seções existentes
- Regras de resize: sem alteração
- `clipsContent`: sem alteração

## Properties

- Variants: preservar active/default/hover/focus/disabled existentes
- Text properties: preservar labels editáveis existentes
- Boolean properties: nenhuma nova
- Instance swaps: nenhum novo
- Slot properties: nenhuma nova
- Ordem no painel: sem alteração

## States

- Default: label neutra sem indicador ativo
- Hover: label usa color hover
- Focused: focus ring Component sem alterar a borda estrutural
- Pressed: não exposto como variant pública
- Disabled: label disabled, sem seleção ou navegação por teclado
- Open/Closed: não aplicável; usar selected/unselected
- Error/Invalid: não aplicável

## Tokens/bindings

- Foundation: nenhum consumo direto
- Semantic: somente via Component, exceto contratos compartilhados já documentados no CSS Web
- Component: 16 tokens no JSON; 15 variables Figma com WEB syntax, panel padding permanece no contrato Git atual
- Variables novas: zero
- Effect styles: zero
- Text styles: preservar label/sm atual

## Exemplos no canvas

- Exemplo 1: três tabs com primeira ativa e painéis instantâneos
- Exemplo 2: tab disabled ignorada pelo roving tabindex
- Matriz de variants: preservar a matriz atual

## Documentacao visual

- Seções: preservar página atual
- Tabelas: preservar contrato, estados, teclado e tokens atuais
- Notas para designers: rótulos curtos, painéis irmãos e quantidade limitada de tabs
- Diferenças para componentes próximos: Accordion para seções empilhadas; navegação para rotas; Segmented Control para configuração

## Validacao planejada

- Estrutura: snapshot com page issueCount 0
- Bindings: 15 Component variables Tabs com WEB code syntax; zero variable nova
- Slots: não aplicável à preservação Figma
- Textos: nenhuma alteração
- Instâncias: nenhuma alteração
- Screenshot: comparação visual nas saídas Web, Ark e React
- Validadores repo: `verify:tokens`, `test:vnext`, browser, consumidor, bundle e Axe

## Bloqueado antes de

- Figma write: bloqueada; resultado aprovado é `unchanged-with-evidence`
- Repo sync: somente adapters/docs/testes; sem token ou Web core
- Commit/push: bloqueados
