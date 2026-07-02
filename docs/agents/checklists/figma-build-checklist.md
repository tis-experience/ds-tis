# Checklist: Figma Build

Use este checklist antes e durante qualquer escrita no Figma.

## Antes de escrever

- [ ] Role declarada: `Figma Builder`.
- [ ] Brief aprovado.
- [ ] Spec Figma aprovada.
- [ ] Escopo da escrita declarado.
- [ ] Dump inicial feito quando editar componente existente.
- [ ] Padrao de pagina vivo consultado quando criar/reorganizar documentacao.
- [ ] Quando houver documentacao visual, 2-3 paginas maduras usadas como modelo foram registradas.
- [ ] Screenshots dos modelos vivos foram capturados.
- [ ] Screenshot do alvo atual foi capturado quando existir pagina/componente anterior.
- [ ] Propriedades reais do modelo foram lidas: root, secoes, textos, tabelas, dividers, exemplos e wrappers.
- [ ] Componentes DS existentes identificados para nested instances.
- [ ] Tokens previstos listados por camada e escopo.
- [ ] Matriz de contrato Figma criada a partir dos modelos vivos.
- [ ] Cada linha da matriz tem `part`, `targetNode`, `figmaProperty`, `componentToken` ou justificativa, `semanticAlias` quando aplicavel, `modelEvidence` e `validation`.
- [ ] Cada linha de documentação planejada foi mapeada para API real: property, slot, token, state ou exemplo.
- [ ] `unmappedRows=0`.
- [ ] Tokens novos, aliases novos e excecoes foram aprovados explicitamente.
- [ ] Scripts planejados aplicam apenas pares explicitos `node/path + figmaProperty + variableId/componentProperty`.

## Durante a escrita

- [ ] Reutilizar componentes DS; nao desenhar substitutos manuais.
- [ ] Preservar slots nativos quando a spec pedir slot.
- [ ] Usar auto-layout em estruturas relacionadas.
- [ ] `clipsContent=false` quando focus ring, overlay ou menu puder ultrapassar o frame.
- [ ] Frames documentais com `clipsContent=false`, salvo excecao justificada e aprovada.
- [ ] Textos documentais com altura automatica/height hug; nao usar altura fixa criada por script.
- [ ] Root, secoes, tabelas e exemplos seguem as propriedades reais das paginas modelo.
- [ ] Variants em ordem previsivel e menor -> maior quando houver size.
- [ ] Component properties expostas apenas para API publica necessaria.
- [ ] Textos configuraveis com `TEXT` property quando forem parte de componente.
- [ ] Textos de documentacao sem nome manual: `autoRename=true`.
- [ ] Instancias nao renomeadas manualmente sem justificativa.
- [ ] Icones vivos como instancias Lucide, nao glyph/Icon Placeholder.
- [ ] Nenhuma mudanca executada fora da matriz aprovada.
- [ ] Nenhuma decisao de token, slot, layer, property publica ou rename foi tomada por busca aproximada de nome.
- [ ] Nenhuma tabela ou texto documental foi atualizado por improviso; toda alteração documental vem da matriz.
- [ ] Propriedade, slot, token ou state removido/renomeado também foi removido/renomeado na documentação da página.
- [ ] Qualquer falha sistêmica encontrada foi separada da correção do componente e registrada como gate paralelo.

## Tokens e bindings

- [ ] Cada fill relevante tem linha explicita na matriz e binding validado.
- [ ] Cada stroke color relevante tem linha explicita na matriz e binding validado.
- [ ] Cada stroke width relevante tem linha explicita na matriz e binding validado.
- [ ] Cada corner radius relevante tem linha explicita na matriz e binding validado.
- [ ] Cada padding/gap relevante tem linha explicita na matriz e binding validado.
- [ ] Cada tamanho de icone/frame de icone tem linha explicita na matriz e binding validado.
- [ ] Cada stroke width de icone Lucide tem linha explicita na matriz e binding validado.
- [ ] Focus ring usa camada/estrutura aprovada e tokens de focus ring.
- [ ] Overlay/elevated inclui surface e shadow/effect style quando aplicavel.
- [ ] Component tokens apontam para Semantic, nao Foundation ou Component.
- [ ] Variables novas com escopos especificos, WEB code syntax e alias documentado.
- [ ] Nenhum Component token usado em componente final tem valor cru sem justificativa aprovada.
- [ ] Nenhum binding foi aceito apenas por contagem agregada.

## Validacao pos-escrita

- [ ] Matriz executada linha a linha.
- [ ] Linhas nao executadas listadas com motivo.
- [ ] Divergencias contra modelos vivos listadas com motivo.
- [ ] Screenshot final capturado.
- [ ] Screenshot final comparado contra screenshots dos modelos vivos.
- [ ] Divergências visuais relevantes corrigidas ou registradas como exceção aprovada.
- [ ] Component properties publicas sem referencia real: `0`, excluindo eixos de variant.
- [ ] Component tokens sem uso real nos variants finais: `0` ou justificativa aprovada.
- [ ] Focus container stroke regressions: `0`.
- [ ] Focus ring layers sem cor/largura/radius esperados: `0` ou justificativa aprovada.
- [ ] Instance name mismatches sem exposed swap/justificativa: `0`.
- [ ] Hardcoded fills/strokes nos component sets finais: `0`.
- [ ] Linhas documentais que citam property/slot/token/state inexistente: `0`.
- [ ] Bindings ausentes em documentação visual quando as páginas modelo usam binding equivalente: `0`.
- [ ] Textos documentais com altura fixa: `0`.
- [ ] Nos soltos fora do root da pagina: `0`.
- [ ] Falhas de gate/exporter/checklist encontradas durante a validação foram corrigidas no processo ou deixaram o status como `bloqueado`.

## Gate de handoff

- [ ] Contrato: `passou`.
- [ ] Documentação: `passou`.
- [ ] Visual: `passou`.
- [ ] Se qualquer item acima falhou, status final é `bloqueado`, não `pronto para auditoria`.
- [ ] Se o owner rejeitou visualmente o draft, nenhuma nova escrita foi feita antes de auditoria read-only e plano de recuperação com node IDs.
- [ ] Snapshot usado pelos gates reflete a última escrita no Figma; caso contrário, status é `bloqueado por snapshot desatualizado`.

## Saida

- [ ] Node IDs criados/alterados.
- [ ] Resumo do que mudou.
- [ ] Matriz executada anexada ou resumida com contagens.
- [ ] Pendencias conhecidas.
- [ ] Evidência visual anexada ou linkada: screenshots alvo/modelos.
- [ ] Status separado de contrato, documentação e visual.
- [ ] Status: `pronto para auditoria` ou `bloqueado`.
