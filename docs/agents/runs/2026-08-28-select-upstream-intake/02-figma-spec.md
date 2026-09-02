- Status: Approved unchanged

# Spec Figma preservada

- Componente/padrão: Select single-select.
- Página Figma: `Select` (`145:2`), frame raiz `Select` (`146:20`).
- Referências DS Core consultadas: Select, Form Field, Menu e Combobox refletidos no snapshot e no repositório.
- Referências externas consultadas: WAI-ARIA APG select-only combobox, Ark UI Select, Base UI Select e Carbon Dropdown/Select.

## Anatomia

- Root: componente Select existente; não alterar.
- Subcamadas: container, leading icon opcional, texto de placeholder/value, chevron e Focus Ring.
- Nested instances: Lucide para icon/chevron e Form Field na composição documental.
- Slots: conteúdo textual e leading icon já expostos pelo contrato existente.

## Auto-layout

- Root: preservar auto-layout e três alturas atuais.
- Seções/containers: preservar o frame documental único já auditado.
- Regras de resize: trigger ocupa a largura oferecida pelo consumidor; popup acompanha a largura de referência nos adapters.
- `clipsContent`: sem alteração.

## Properties

- Variants: preservar sizes e estados atuais.
- Text properties: placeholder/value/label existentes.
- Boolean properties: leading icon, error, readonly e demais propriedades existentes.
- Instance swaps: leading icon e chevron existentes.
- Slot properties: nenhuma nova.
- Ordem no painel: preservar API pública.

## States

- Default: preservado.
- Hover: preservado.
- Focused: Focus Ring existente.
- Pressed: comportamento runtime; não criar variant visual nova.
- Disabled: preservado.
- Open/Closed: aberto é comportamento do provider e não requer mudança no component set fechado.
- Error/Invalid: preservado via Select + Form Field.

## Tokens/bindings

- Foundation: nenhum consumo novo.
- Semantic: somente via Component tokens existentes.
- Component: 38 variables `select/*` presentes no snapshot.
- Variables novas: nenhuma.
- Effect styles: reutilizar elevation existente no popup dos adapters.
- Text styles: preservar os styles atuais.

## Exemplos no canvas

- Exemplo 1: trigger default/placeholder.
- Exemplo 2: trigger filled/error com Form Field.
- Matriz de variants: já existente; não reorganizar.

## Documentacao visual

- Seções: preservar página atual.
- Tabelas: preservar documentação atual.
- Notas para designers: Web continua nativo; popup estilizado pertence apenas aos adapters.
- Diferenças para componentes próximos: Select não filtra; Combobox filtra; Menu executa comandos.

## Validacao planejada

- Estrutura: snapshot mostra página Select com `issueCount=0`.
- Bindings: 38 Component variables `select/*`; `verify:tokens` limpo.
- Slots: nenhum novo.
- Textos: nenhuma alteração.
- Instâncias: nenhuma alteração.
- Screenshot: referência visual é a implementação canônica já refletida em `docs/select.html` e Storybook Web.
- Validadores repo: `verify:tokens`, Storybook, consumidor, browser, Axe e bundle.

## Bloqueado antes de

- Figma write: bloqueado e desnecessário.
- Repo sync: autorizado somente para adapters/docs/testes.
- Commit/push: bloqueado.
