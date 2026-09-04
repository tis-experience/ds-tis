# Benchmark upstream · Ark UI Factory

- Pacote fixado: `@ark-ui/react@5.37.2`.
- Zag transitivo: `@zag-js/core@1.41.2`.
- Primitive escolhido: `ark.input`, exportado por `@ark-ui/react/factory`.
- Motivo: Input de uma linha já possui comportamento completo no HTML; uma máquina Zag adicional não acrescentaria estado ou teclado necessários.
- Adaptação TIS: o wrapper aplica somente anatomia, tamanhos e estados públicos existentes no DS.
- Rejeitado: importar Base UI, alterar o CSS estável, copiar theme upstream ou criar uma API paralela de formulário.

A implementação usa o Factory real do Ark e mantém o controle nativo como unidade de foco, edição, validação e serialização.
