# Comparação de providers — Tooltip

| Dimensão | Web | Ark/Zag | React/shadcn/Base UI |
|---|---|---|---|
| Trigger | filho direto | `Tooltip.Trigger` | `Tooltip.Trigger` |
| Surface | `.ds-tooltip__content` | `Tooltip.Content` | `Tooltip.Popup` |
| Posição | classes top/right/bottom/left | Zag positioning | Base Positioner |
| Portal | não | provider positioner | `Tooltip.Portal` |
| Arrow | `::before` | Arrow + ArrowTip | Arrow |
| Delay | 100/100 ms | configurável no Root | configurável no Provider |
| Hoverable | wrapper aberto | `interactive` | popup hoverable por padrão |
| Escape | runtime Web | Zag | Base UI |
| Foco | permanece no trigger | Zag | Base UI |

Nenhum provider vence ou substitui outra saída. O teste exige equivalência de contrato, não DOM idêntico.

## Resultado

- As três saídas abrem por foco, associam o conteúdo com `aria-describedby`, fecham com Escape e mantêm foco no trigger.
- Ark e React ficaram visualmente equivalentes; o exemplo Web preserva seu trigger icon-only e a mesma superfície TIS.
- O tooltip mede 36px de altura nas três saídas e não gera overflow em desktop ou 390px.
- As capturas por foco ficam nos arquivos `web-focus-*`, `ark-focus-*` e `react-focus-*` desta pasta.
