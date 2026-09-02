# Comparação e classificação

| Saída | Base de comportamento | Decisão |
|---|---|---|
| HTML/CSS | `<select>` nativo | preservar integralmente |
| Ark/Zag | Ark UI Select + Zag transitivo | adapter isolado com HiddenSelect |
| React | shadcn source + Base UI Select | recipe isolada no registry |

## Paridade obrigatória

- valor único e placeholder;
- opções disabled;
- trigger, popup e selected item;
- Arrow Up/Down, Home/End, Enter/Space, Escape e typeahead;
- label, helper/error, hidden form value e retorno de foco;
- sizes, estados, dark mode, 320/390px, Axe e orçamento gzip.

Não entram multiple, filtro, async, creatable ou virtualização. As três saídas
compartilham o contrato TIS, mas não compartilham source nem imports.

## Resultado

- Web nativo permaneceu intacto.
- Ark e React passaram em seleção, opção disabled, typeahead, Escape, retorno de foco, formulário e Axe.
- Ark e React têm popup e trigger visualmente equivalentes; o indicador obrigatório foi alinhado ao exemplo Web.
- Em 390px, os triggers medem 350×40px e o overflow horizontal é zero nas três saídas.
- As capturas desktop e mobile ficam nos arquivos `web-open-*`, `ark-open-*` e `react-open-*` desta pasta.
