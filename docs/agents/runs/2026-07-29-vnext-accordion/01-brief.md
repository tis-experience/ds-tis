# Brief aprovado para draft

- Nome: Accordion vNext
- Classe: componente composto de disclosure; controle interativo com estado.
- Problema: preservar o visual e os tokens atuais, substituindo uma implementação frágil por um contrato acessível, testável e reproduzível em diferentes stacks. A v1 ainda apresenta contradição no tratamento de `disabled`, risco de clipping no focus ring e não cobre `single`/`multiple`, controlled/uncontrolled e SSR como contrato público.
- Usar quando: grupos de conteúdo relacionado precisam ser expandidos e recolhidos sem sair do contexto atual.
- Não usar quando: o conteúdo precisa permanecer sempre visível; a escolha muda imediatamente um valor de formulário; a interface representa navegação, tabs, tree view ou menus.
- Diferenças para componentes próximos: Tabs alterna painéis de uma mesma área; Disclosure representa uma única relação trigger/panel; Accordion coordena dois ou mais itens, teclado e política de expansão.
- Acessibilidade/semântica: trigger como `button` nativo dentro de heading configurável; `aria-expanded` e `aria-controls`; landmark opcional; setas, Home, End, Enter e Space; item `disabled` fora da sequência de navegação.
- Composição DS: chevron interno padrão; `leadingIcon` opcional; conteúdo livre no panel, inclusive componentes TIS.
- Variants/states candidatos: visual `Open=false|true` × `State=Default|Hover|Focus|Disabled`; comportamento `mode=single|multiple`; `collapsible=true` por compatibilidade com a v1.
- Slots: label do trigger, leading icon e panel livre. O slot do panel não impõe markup de conteúdo.
- Tokens: reutilizar os 28 tokens `component.accordion.*` atuais. Não criar Foundation, Semantic ou Component token neste piloto.
- Docs Figma: anatomia visual e de implementação, contrato, composições single/multiple, API neutra, acessibilidade e gates de promoção.
- Impacto repo: novo wrapper público em `@tis/react/accordion`, CSS vanilla usando `--ds-accordion-*`, stories próprias, testes de contrato, bundle final e consumer tarball. Outras stacks repetem o contrato quando forem priorizadas.
- Fora de escopo: substituir a v1 agora; alterar tokens ou o component set publicado; Flutter; compartilhar binário entre stacks; publicar pacote ou Code Connect.
- Bloqueado antes de: promover a API React ou sincronizar mudanças para a biblioteca principal sem auditoria independente do draft.
- Aprovação necessária: owner valida o contrato e o draft; Figma Auditor valida estrutura/documentação/visual; depois o Repo Component Agent implementa o wrapper.
- Evidência da decisão: owner escolheu Ark UI + Zag e autorizou o avanço do piloto na conversa de 2026-07-29.
- Status: draft Figma construído; aguardando auditoria independente e revisão do owner antes da implementação pública.
