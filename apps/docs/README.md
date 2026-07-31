# Portal vNext

O portal Astro/Starlight coexiste com a documentação estática da v1. Para uma
preview fiel às rotas publicadas, gere Astro e Storybook na ordem correta:

```sh
npm run build:preview:vnext
npm run preview:vnext
```

Rotas locais:

- portal: `http://127.0.0.1:4177/ds-tis/next/pt-br/`;
- Storybook: `http://127.0.0.1:4177/ds-tis/next/storybook/`.

O comando `npm run dev --workspace @tis/docs` serve apenas o Astro. Use-o para
edição rápida de conteúdo sem depender do build do Storybook.

O portal usa o chrome nativo do Starlight e aplica somente a cor de marca TIS.
Componentes reais do DS aparecem apenas nos exemplos de componente. O Storybook
permanece uma superfície separada para interação, acessibilidade e desenvolvimento;
as páginas documentais apontam para ele por links quando a referência for pública.
