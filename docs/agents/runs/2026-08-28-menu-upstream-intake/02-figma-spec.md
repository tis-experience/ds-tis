- Status: Approved unchanged

# Spec Figma proposta

- Componente/padrão: Menu / Action Menu
- Página Figma: `7973:2` (`❖ Menu`), root `7983:87`
- Referências DS Core consultadas: `docs/menu.html`, `css/components/menu.css`, `js/menu.js`, `tokens/component/menu.json`, `tokens/component/action-menu.json`
- Referências externas consultadas: WAI-ARIA APG Menu Button/Menu, Ark UI Menu 5.39.1 e Base UI Menu 1.6.0

## Anatomia

- Root: preservado sem alteração
- Subcamadas: surface, item, label, description/meta, icon/check, shortcut, separator e trigger Action Menu já existentes
- Nested instances: Button trigger e ícones Lucide existentes permanecem canônicos
- Slots: nenhuma propriedade ou slot novo

## Auto-layout

- Root: frame vertical existente
- Seções/containers: preservados
- Regras de resize: preservadas
- `clipsContent`: preservado; nenhuma escrita

## Properties

- Variants: preservadas
- Text properties: preservadas
- Boolean properties: preservadas
- Instance swaps: preservadas
- Slot properties: preservadas
- Ordem no painel: preservada

## States

- Default: preservado
- Hover: preservado
- Focused: preservado
- Pressed: sem mudança
- Disabled: preservado e continua focusable no padrão ARIA
- Open/Closed: pertence à composição Action Menu e aos adapters
- Error/Invalid: não aplicável

## Tokens/bindings

- Foundation: sem acesso direto novo
- Semantic: sem alteração
- Component: reutilizar as 39 variables `menu/*` e `action-menu/*`
- Variables novas: nenhuma
- Effect styles: preservar elevation existente
- Text styles: preservar estilos existentes

## Exemplos no canvas

- Exemplo 1: comandos default, disabled e destructive já documentados
- Exemplo 2: itens radio/checkbox e Action Menu já documentados
- Matriz de variants: sem mudança

## Documentacao visual

- Seções: preservadas
- Tabelas: preservadas
- Notas para designers: Menu executa comandos; não substitui Select/Combobox
- Diferenças para componentes próximos: já refletidas no Figma e na documentação Web

## Validacao planejada

- Estrutura: snapshot registra root único e `issueCount=0`
- Bindings: reutilizar 39 variables existentes; nenhuma escrita
- Slots: nenhuma mudança
- Textos: nenhuma mudança
- Instâncias: nenhuma mudança
- Screenshot: não necessário para Figma, pois o resultado aprovado é unchanged; validação visual ocorrerá nos adapters
- Validadores repo: `verify:tokens`, `test:upstream-intake`, vNext, browser, consumidor, Axe e bundle

## Bloqueado antes de

- Figma write: bloqueado
- Repo sync: autorizado apenas para adapters, docs e testes
- Commit/push: bloqueado
