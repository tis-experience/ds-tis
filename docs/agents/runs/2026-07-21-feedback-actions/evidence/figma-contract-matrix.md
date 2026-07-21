# Matriz de contrato Figma — Feedback Actions (Alert/Toast)

> Valide antes do handoff:
> `npm run agents:validate-matrix -- docs/agents/runs/2026-07-21-feedback-actions/evidence/figma-contract-matrix.md --strict-exceptions`
> Regra dura: `unmappedRows=0`.

- Componente/padrão: Feedback Actions (correção nested Button em Alert + Toast)
- Data: 2026-07-21
- Role atual: Figma Builder (contrato aprovado via brief/spec owner)
- Arquivo Figma: DS Core `IE68amP9Hya5ieFw1rX8S8`
- Páginas alvo: `Alert`, `Toast`
- Component sets alvo: Alert `147:67`, Toast `10279:2508`
- Status: aprovado com brief/spec (owner 2026-07-21); opção A default; escape B só com critérios do brief

## Modelos vivos consultados

| Modelo | Node | Uso no contrato |
|---|---|---|
| `Button` | page Button, set Ghost/Sm | Nested instance canônico para Action 1/2; states Default/Hover/Pressed/Focus/Disabled |
| `Alert` | set `147:67` | Host: Content column, Show Action 1/2, Style Subtle\|Solid, Type |
| `Toast` | set `10279:2508` | Host espelhado; mesma fileira Actions |

## Regras de cobertura

- Toda parte Actions (row + Action 1 + Action 2) precisa de linha.
- Action = INSTANCE Button Ghost/Sm (opção A); FRAME+TEXT é regressão.
- Sem variant “Has Actions”; só booleans + nested props.
- Component → Semantic only; overrides de cor da action usam `alert\|toast/action/color/*` se aplicados.
- Escape B (`.Feedback Action`) só com critério do brief + nota owner — não há linha B ativa nesta matriz.

## Matriz

| part | targetNode | figmaProperty | componentProperty | componentToken | semanticAlias | modelEvidence | validation | exception |
|---|---|---|---|---|---|---|---|---|
| Actions row | `*/Actions` (Alert+Toast, todos Type×Style) | visible, layoutMode, itemSpacing, primaryAxisSizingMode, counterAxisSizingMode | Show Action 1 | `alert/actions/gap` ou `toast/actions/gap` | space semantic via Component | Alert Content column; Toast Content | visible=false some a fileira sem gap residual; gap bindado Component; auto-layout horizontal hug | none |
| Action 1 | `*/Actions/Action 1` | mainComponent (Button Ghost/Sm), visible, nested Label | Show Action 1; nested Button Label (exposto) | `button/*` (+ override fill texto `*/action/color/*` se contraste exigir sem detach) | button ghost + action color semantic | Button set Ghost/Sm | node.type=INSTANCE; mainComponent é Button Ghost Sm; sem FRAME+TEXT; Label editável no painel do host; states do Button intactos | none |
| Action 2 | `*/Actions/Action 2` | mainComponent (Button Ghost/Sm), visible, nested Label | Show Action 2; nested Button Label (exposto) | `button/*` (+ override `*/action/color/*` se necessário) | button ghost + action color semantic | Button set Ghost/Sm | idem Action 1; visible só com Show Action 2 | none |
| Remove fake buttons | `*/Actions/**` legacy FRAME+TEXT | delete / replace | n/a | n/a | n/a | anti-padrão admitido pré-run | zero TEXT/FRAME action com padding/radius/font literais após build | none |
| Panel order | Alert set + Toast set | componentPropertyDefinitions order | Show Action 1 → Label1 → Show Action 2 → Label2 | n/a | n/a | AGENTS.md boolean→campo | pares boolean+label contíguos após Description | none |

## Property API esperada

- Variants host (inalterados): `Type`, `Style`
- BOOLEAN: `Show Action 1`, `Show Action 2` (e demais existentes: Show Description, Show Close, …)
- TEXT: preferir nested Label do Button; remover TEXT órfão Action Label se nested props cobrirem
- Nested instances expostas: Action 1, Action 2 (Label; opcional State)
- Sem instance swap livre de Style do Button

## Tokens novos ou a normalizar

- Nenhum token novo nesta run A. Reusar `alert|toast/actions/gap` e `alert|toast/action/color/*` já no repo/Figma.
- Se escape B: tokens do átomo documentados em amend (fora desta matriz até owner).

## Exceções aprovadas

- Nenhuma nesta matriz (opção A). Escape B, se disparar, vira amend + aprovação owner antes de novas linhas.

## Validação objetiva pós-build

| Check | Esperado |
|---|---|
| INSTANCE count em Actions | ≥2 por variant com Show Action 1+2 on (Action 1 e 2) |
| FRAME+TEXT fake | 0 |
| Nested Label no painel | editável sem abrir camada |
| Screenshot Solid+action | contraste label ≥ 4.5:1 ou escalate B |
| Docs section-action | menciona nested Button Ghost/Sm |

## Status tripartite (Builder)

| Dimensão | Status | Nota |
|---|---|---|
| Contrato | pending | após dump pós-escrita |
| Documentação | pending | section-action / properties |
| Visual | pending | screenshots Solid + Subtle |
