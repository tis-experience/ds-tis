# Comparação de providers — Tabs

| Dimensão | Web | Ark/Zag | React/shadcn/Base UI |
|---|---|---|---|
| Root/List | `.ds-tabs` + runtime | `Tabs.Root` + `Tabs.List` | `Tabs.Root` + `Tabs.List` |
| Tab | button `.ds-tab` | `Tabs.Trigger` | `Tabs.Tab` |
| Panel | `.ds-tab-panel` | `Tabs.Content` | `Tabs.Panel` |
| Ativação | automática | `activationMode="automatic"` | automática pelo primitive |
| Teclado | setas, Home/End | Zag | Base UI |
| Disabled | native/ARIA | prop `disabled` | prop `disabled` |
| Visual | CSS/tokens TIS | adapter CSS TIS | source recipe CSS TIS |
| Distribuição | npm | workspace adapter beta | source via registry shadcn |

## Paridade obrigatória

- Mesma anatomia conceitual e classes públicas TIS equivalentes.
- Mesmas cores, tipografia, padding, indicador, focus ring e painel.
- Um tab selecionado, roving tabindex, disabled ignorado e painel corretamente relacionado.
- Sem import cruzado entre Ark e Base UI.

## Diferenças aceitas

- Ark expõe `data-scope`/`data-part`; Base UI expõe `data-active` e demais data attributes próprios.
- APIs controlled/uncontrolled seguem cada provider.
- A saída Web continua emitindo `ds-tabs-change`; React/Ark usam callbacks idiomáticos.

## Resultado

- Web permaneceu íntegro e sem alteração de CSS ou runtime.
- Ark e React passaram no mesmo contrato de teclado, foco, disabled, painéis e Axe.
- A revisão em 320px encontrou quebra de linha em `Visão geral`; os adapters agora preservam labels em uma linha e confinam eventual overflow ao tablist.
- Após a correção, Ark e React medem 46px de altura por tab em 320px e não geram overflow horizontal de página.
- Capturas desktop e mobile ficam em `web-*`, `ark-*` e `react-*` nesta pasta.
