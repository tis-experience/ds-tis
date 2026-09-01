- Status: Ready for owner review

# Brief proposto

- Nome: Popover — intake comparativo upstream.
- Classe: overlay contextual não modal.
- Problema: evoluir o Popover como três saídas coexistentes — HTML/CSS/JS,
  Ark/Zag e React/shadcn/Base UI — sem substituir o Popover atual, misturar
  sources ou permitir que decisões de uma tecnologia contaminem as demais.
- Usar quando: conteúdo contextual precisa abrir junto a um trigger e permitir
  interação curta sem interromper o fluxo com um modal.
- Nao usar quando: o conteúdo é apenas uma dica não interativa (Tooltip), uma
  lista de ações (Menu) ou exige bloqueio do contexto (Modal).
- Diferencas para componentes proximos: Tooltip é informativo; Menu possui
  semântica de ações e teclado próprio; Modal é uma camada modal. Popover aceita
  conteúdo contextual composto sem assumir esses papéis.
- Acessibilidade/semantica: auditar trigger, relação com o panel, foco inicial e
  retorno, Escape, dismiss externo, portal/positioning e conteúdo acessível pelo
  mesmo método nos três contratos.
- Composicao DS: preservar Button e demais componentes DS reais nos exemplos;
  manter title, body/content slot, close, arrow e actions conforme contrato TIS,
  salvo melhoria aprovada.
- Variants/states candidatos: não criar variants nesta etapa. A leitura viva
  confirmou `Bottom`, `Top`, `Left` e `Right`; align, offsets, nesting e multiple
  triggers permanecem capacidades de adapter, não variants Figma.
- Slots: preservar o contrato atual até a auditoria provar melhoria. Nenhum slot
  upstream é copiado diretamente.
- Tokens: preservar os tokens `component.popover.*`; token novo somente após
  spec Figma aprovada e prova de lacuna.
- Docs Figma: `sem mudança, com evidência` proposto após comparação viva com
  Modal, Tooltip e Menu.
- Impacto repo: nesta etapa, apenas processo, ADR, run, manifesto, metadados e
  evidência. Uma futura implementação deverá manter as três saídas separadas.
- Fora de escopo: escrita Figma, alteração do Popover Web, adapters React,
  registry item, commit, push, PR e release.
- Bloqueado antes de: qualquer implementação das duas saídas ainda ausentes.
- Aprovacao necessaria: owner aprova este brief e o resultado Figma sem mudança.
  Essa aprovação não autoriza implementar as saídas, alterar Figma ou publicar.

## Evidência de arquitetura

- shadcn/Base UI: source oficial fixado no commit
  `a7d77e0cf78d338f213bed172f68261bb6c053e8`; recipe visual descartado.
- Ark/Zag: `@ark-ui/react 5.37.2` + `@zag-js/popover 1.41.2` instalados; Zag
  permanece transitivo via Ark.
- O `view popover` sem contexto Base resolveu Radix e foi rejeitado como
  evidência, confirmando a necessidade do manifesto registrar a base.
- Figma vivo: root único, 13 properties e quatro variants com referências
  públicas verificadas; nenhuma mudança visual/anatômica proposta.
- Próximo gate, se aprovado: construir separadamente Ark/Zag e
  React/shadcn/Base UI, preservar HTML/CSS/JS e medir os mesmos cenários de
  paridade. Nenhuma saída será escolhida para eliminar as demais.
