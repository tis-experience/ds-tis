- Status: Aprovado

# Brief · Input Text Ark/Zag

- Nome: Input Text.
- Classe: form control nativo de uma linha.
- Problema: publicar uma saída Ark independente sem recriar visual, tokens ou comportamento que o navegador já fornece.
- Usar quando: uma aplicação React optar pela saída Ark do DS.
- Não usar quando: a aplicação consumir Web HTML/CSS/JS, a recipe React/Base UI ou Angular.
- Diferença para Form Field: Input é o controle; Form Field compõe label, ajuda, required e erro.
- Semântica: preservar `input`, label associado, atributos nativos, foco, validação e submit.
- Variants/states: sm, md, lg; filled, invalid, readonly e disabled; ícones opcionais.
- Tokens: consumir apenas as classes e os tokens públicos já existentes.
- Impacto no repo: adapter/export, stories, página PT-BR/EN, catálogo/API e testes.
- Fora de escopo: Figma, tokens, CSS estável, saída React/Base UI e saída Angular.
- Aprovação: owner autorizou execução contínua e PR isolado em 2026-09-04.
