- Status: Approved unchanged

# Resultado Figma — Table

Não há escrita ou redesign no Figma nesta run. A saída React reutiliza o contrato agnóstico já publicado para Table.

- Componente/padrão: Table
- Página Figma: Table, inalterada
- Referências DS Core consultadas: `docs/table.html`, `css/components/table.css`, `tokens/component/table.json`
- Referências externas consultadas: shadcn Table/Base e semântica HTML table

## Anatomia

- Root: contrato existente, inalterado
- Subcamadas: container, caption, header, body, footer, row, head e cell
- Nested instances: Button e Badge opcionais em conteúdo
- Slots: conteúdo das células e headers

## Auto-layout

- Root: inalterado
- Seções/containers: inalterados
- Regras de resize: overflow horizontal local preservado
- `clipsContent`: inalterado

## Properties

- Variants: sm, md, fixed, nowrap
- Text properties: conteúdo de caption, head e cell
- Boolean properties: selected quando previsto pelo contrato existente
- Instance swaps: inalterados
- Slot properties: inalteradas
- Ordem no painel: inalterada

## States

- Default: preservado
- Hover: preservado
- Focused: região e controle de ordenação preservados
- Pressed: responsabilidade do button de ordenação
- Disabled: não aplicável ao table root
- Open/Closed: não aplicável
- Error/Invalid: não aplicável

## Tokens/bindings

- Foundation: inalterado
- Semantic: inalterado
- Component: `tokens/component/table.json`
- Variables novas: nenhuma
- Effect styles: nenhum
- Text styles: inalterados

## Exemplos no canvas

- Exemplo 1: tabela básica
- Exemplo 2: tabela ordenável e responsiva
- Matriz de variants: Storybook React, fora do Figma

## Documentacao visual

- Seções: inalteradas
- Tabelas: inalteradas
- Notas para designers: nenhuma nova
- Diferenças para componentes próximos: registradas no brief

## Validacao planejada

- Estrutura: sem escrita Figma
- Bindings: sem escrita Figma
- Slots: sem escrita Figma
- Textos: sem escrita Figma
- Instâncias: sem escrita Figma
- Screenshot: validar saída React contra o Web
- Validadores repo: registry, vNext, browser, Axe e consumidor real

## Bloqueado antes de

- Figma write: requer nova autorização
- Repo sync: autorizado somente para a saída React
- Commit/push: autorizado pelo owner em 2026-09-04
