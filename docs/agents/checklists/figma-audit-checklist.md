# Checklist: Figma Audit

Use este checklist em modo read-only. Nao corrigir durante a auditoria.

## Pagina

- [ ] Paginas modelo usadas na comparacao foram declaradas.
- [ ] Screenshots do alvo e das paginas modelo foram revisados.
- [ ] `topLevelCount` esperado.
- [ ] Frame raiz correto.
- [ ] Root com auto-layout e background bindado.
- [ ] Secoes internas na ordem aprovada.
- [ ] Zero nos soltos fora do padrao aprovado.
- [ ] `clipsContent=false` onde focus/overlay pode escapar.
- [ ] Frames documentais com `clipsContent=true`: 0, salvo excecao aprovada.
- [ ] Root/secoes/tabelas/exemplos seguem as propriedades reais das paginas modelo.
- [ ] Escala, densidade, hierarquia, espaçamentos, component matrix, exemplos e tabelas parecem da mesma família visual das páginas modelo ou têm exceção aprovada.

## Component set

- [ ] Nome do component set correto.
- [ ] Variants esperadas presentes.
- [ ] Ordem de variants correta.
- [ ] `componentPropertyDefinitions` esperado.
- [ ] Propriedades dependentes aparecem junto de booleanos relacionados.
- [ ] Booleans/instance swaps/text properties realmente referenciados nos sublayers.

## Anatomia

- [ ] Layers principais existem e estao na ordem aprovada.
- [ ] Slots nativos existem onde especificado.
- [ ] Slots sem fill/stroke hardcoded quando sao apenas container de conteudo.
- [ ] Nested instances usam componentes DS reais.
- [ ] Instancias nao tem nomes manuais indevidos.
- [ ] Textos de documentacao com `autoRename=true`.
- [ ] Textos de documentacao com altura fixa indevida: 0.
- [ ] Textos de documentacao usam altura automatica/height hug conforme paginas modelo.
- [ ] Tabelas de propriedades, tokens e acessibilidade não citam property, slot, token ou state inexistente.
- [ ] Documentação visual tem bindings equivalentes aos das páginas modelo quando houver fills/strokes/backgrounds/dividers/tabelas bindáveis.

## Tokens e bindings

- [ ] Fills bindados.
- [ ] Strokes bindados.
- [ ] Stroke widths bindados.
- [ ] Corner radius bindado nos campos reais do Figma.
- [ ] Paddings e gaps bindados.
- [ ] Icon size, color e stroke width bindados.
- [ ] Focus ring com color/width/radius compativeis.
- [ ] Elevated/overlay com surface + effect style.
- [ ] Sem `ALL_SCOPES`.
- [ ] Sem variable nova sem WEB code syntax.
- [ ] Sem Component -> Foundation, Component -> Component ou valor cru em Component variable.
- [ ] Sem token Component sem uso real, salvo justificativa explicita.
- [ ] Auditoria de uso de Component token baseada em COMPONENT/COMPONENT_SET reais, nao em nome fixo de secao.

## Conteudo e semantica

- [ ] Texto da documentacao orienta designer, nao duplica spec tecnica do repo.
- [ ] Exemplo usa componentes DS existentes.
- [ ] Menu, Select, Combobox e Dialog nao sao misturados semanticamente.
- [ ] Padroes interativos seguem APG ou decisao aprovada.

## Evidencia obrigatoria

- [ ] Contagem de variants.
- [ ] Contagem de slots.
- [ ] Contagem de token binds esperados vs encontrados.
- [ ] Contagem de linhas documentais que citam property/slot/token/state inexistente.
- [ ] Contagem de binds ausentes na documentação visual.
- [ ] Contagem de textos com `autoRename=true`.
- [ ] Contagem de textos documentais com altura fixa indevida.
- [ ] Contagem de frames documentais com `clipsContent=true`.
- [ ] Contagem de divergencias contra paginas modelo.
- [ ] Contagem de divergências visuais relevantes contra screenshots/modelos.
- [ ] Contagem de instance name mismatches.
- [ ] Contagem de hardcoded fills/strokes relevantes.
- [ ] Contagem de loose nodes.
- [ ] Lista de falhas com node IDs.
- [ ] Falhas globais fora do componente atual listadas separadamente com impacto e gate afetado.

## Resultado

- [ ] Contrato: `passou` ou `falhou`.
- [ ] Documentação: `passou` ou `falhou`.
- [ ] Visual: `passou` ou `falhou`.
- [ ] Gate/processo: `passou`, `falhou` ou `bloqueado por snapshot desatualizado`.
- [ ] Aprovação final só passa quando os três itens acima passam.
