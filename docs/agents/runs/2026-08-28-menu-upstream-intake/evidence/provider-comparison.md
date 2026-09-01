# Comparação das saídas · Menu

| Dimensão | Web HTML/CSS/JS | Ark/Zag | React/shadcn/Base UI |
|---|---|---|---|
| Estado atual | stable | beta validado localmente | beta validado localmente |
| Trigger | Button + runtime DS | Ark Trigger | Base UI Trigger |
| Surface | `ds-menu` | Ark Content + `ds-menu` | Base Popup + `ds-menu` |
| Itens | command/radio/checkbox | parts Ark próprias | parts Base próprias |
| Teclado/foco | runtime `ds-tis/menu` | Zag transitivo | Base UI |
| Distribuição | npm `ds-tis` | subpath workspace | registry source `@tis/menu` |
| CSS/tokens | canônicos | classes TIS + CSS isolado | classes TIS + recipe isolada |

## Classificação dos achados

- `adapter-only`: mapear highlighted/disabled/checked dos dois providers.
- `adapter-only`: portal/positioner próprios com namespaces diferentes.
- `docs-only`: explicar que Menu executa comandos e não escolhe valor de formulário.
- `reject`: copiar CSS/theme de Ark ou Base UI.
- `reject`: importar um provider dentro da saída do outro.
- `reject`: ampliar agora para submenu, context menu ou menubar.

## Paridade exigida

- Open/close, outside press, Escape e retorno de foco.
- Arrow Up/Down, Home/End e typeahead.
- Command, radio, checkbox, disabled e destructive.
- ARIA sem violações críticas ou sérias.
- Popup sem overflow em 320/390 px.
- Bundle isolado e consumidor registry real.

## Resultado

- As três saídas passaram em abertura/fechamento, Escape, retorno de foco, Arrow Up/Down, Home/End, typeahead, disabled e Axe.
- Ark e React mantêm command, checkbox e radio; o exemplo Web estável permanece menor, sem alteração de API.
- As capturas `*-open-2026-08-28.png` e `*-open-mobile-390-2026-08-28.png` registram a comparação visual.
- O popup aberto ficou contido em 390px, com overflow horizontal igual a zero nas três saídas.
