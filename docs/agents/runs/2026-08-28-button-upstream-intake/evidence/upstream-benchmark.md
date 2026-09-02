# Benchmark upstream — Button

## Ark UI

- Fontes: https://ark-ui.com/docs/guides/composition e pacote local `@ark-ui/react@5.37.2`.
- Ark UI não lista um primitive Button dedicado; disponibiliza `ark.button` pela Factory para elementos polimórficos e composição `asChild`.
- Como Button já possui semântica e teclado nativos, não há máquina Zag a adicionar.

## Base UI

- Fonte: https://base-ui.com/react/components/button
- Button preserva semântica, disabled, composição e opção de permanecer focável durante loading.
- A saída React existente continua independente e não será importada pelo adapter Ark.

## WAI-ARIA APG

- Fonte: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- Button precisa de nome acessível; Enter e Space ativam a ação.
- O foco normalmente permanece no Button quando a ação não muda o contexto.
