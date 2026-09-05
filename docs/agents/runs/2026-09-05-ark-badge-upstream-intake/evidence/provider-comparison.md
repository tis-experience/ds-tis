# Comparação de saídas — Badge

| Saída | Implementação | Estado nesta run | Diferença legítima |
| --- | --- | --- | --- |
| HTML/CSS/JS | span + classes públicas | Estável; preservada | Sem runtime |
| Ark/Zag | Ark Factory span + forwardRef | Beta de workspace; em validação | Factory headless, sem máquina de estado |
| React · shadcn/Base UI | recipe span no registry | Beta; preservada | Distribuição de source; Badge não precisa de primitive Base UI |
| Angular | componente standalone com content projection | Beta; preservada | Host Angular nativo e inputs tipados |

Todas compartilham seis tons, solid/subtle e CSS/tokens TIS. Não há provider vencedor nem import entre implementações. Estado controlado, forms, foco e dismiss próprios não se aplicam a um label informativo; children podem ser atualizados pelo consumidor.

Classificações: adapter Ark = `adapter-only`; instalação, catálogo e acessibilidade contextual = `docs-only`; chips removíveis, roles automáticos, cor upstream e novos tokens = `reject` nesta run. Figma e Web ficam inalterados.

A paridade técnica/renderizada desta rodada deve ser revisada por outro agente. Não representa nova auditoria Figma nem revalidação exaustiva das outras três bibliotecas.
