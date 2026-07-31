# Plano de implementação: registry shadcn + Base UI

## Objetivo

Distribuir os 26 componentes públicos do DS TIS como source code React pelo
registry shadcn, preservando o CSS, os tokens DTCG, a anatomia e os nomes
canônicos do core. Base UI fornece comportamento somente quando o componente
precisa de estado, foco, coleção, popup ou ARIA coordenada.

Este plano é aditivo. A v1 continua estável, `packages/react/src/index.js`
permanece fechado e nenhuma mudança em Figma ou token faz parte das ondas.

## Regras de arquitetura

1. O registry distribui código; não se torna fonte visual.
2. `ds-tis/css` permanece o primeiro import global do consumer.
3. Componentes visuais consomem as classes públicas `ds-*` existentes.
4. Adapters CSS só traduzem estados ou parts do provider para o contrato do DS.
5. Nenhum adapter pode introduzir cor, dimensão, radius ou z-index literal.
6. Cada item fixa a versão do provider e instala o core estável do DS.
7. O nome do item segue a expectativa shadcn quando houver equivalência clara;
   o plano registra o nome correspondente no DS.
8. Um componente só muda de `planejado` para `validado` após instalação real,
   typecheck, build, browser, teclado e Axe quando aplicável.

## Ondas

| Onda | Registry | Componente DS | Estratégia | Estado |
|---|---|---|---|---|
| 0 — piloto | `accordion` | Accordion | Base UI Accordion + adapter de teclado | validado |
| 0 — piloto | `button` | Button | Base UI Button + classes públicas | validado |
| 0 — piloto | `dialog` | Modal | Base UI Dialog + adapter tokenizado | validado |
| 1 — forms | `field` | Form Field | composição React/CSS-only | validado |
| 1 — forms | `input` | Input Text | Base UI Input + wrapper anatômico | validado |
| 1 — forms | `textarea` | Textarea | textarea nativo + wrapper anatômico | validado |
| 1 — forms | `checkbox` | Checkbox | Base UI Checkbox + adapter de state data attributes | validado |
| 1 — forms | `radio-group` | Radio | Base UI Radio Group/Radio + adapter de state data attributes | validado |
| 1 — forms | `switch` | Toggle | Base UI Switch + adapter de state data attributes | validado |
| 2 — apresentação | `alert` | Alert | composição React sem provider | planejado |
| 2 — apresentação | `avatar` | Avatar | Base UI Avatar | planejado |
| 2 — apresentação | `badge` | Badge | composição React sem provider | planejado |
| 2 — apresentação | `breadcrumb` | Breadcrumb | HTML nativo/composição | planejado |
| 2 — apresentação | `card` | Card | composição React sem provider | planejado |
| 2 — apresentação | `pagination` | Pagination | composição com Button/links | planejado |
| 2 — apresentação | `separator` | Divider | HTML nativo/composição | planejado |
| 2 — apresentação | `skeleton` | Skeleton | apresentação sem provider | planejado |
| 2 — apresentação | `spinner` | Spinner | apresentação sem provider | planejado |
| 2 — apresentação | `table` | Table | HTML nativo/composição | planejado |
| 3 — interação | `combobox` | Combobox | Base UI Combobox | planejado |
| 3 — interação | `dropdown-menu` | Menu | Base UI Menu | planejado |
| 3 — interação | `popover` | Popover | Base UI Popover | planejado |
| 3 — interação | `select` | Select | Base UI Select | planejado |
| 3 — interação | `tabs` | Tabs | Base UI Tabs | planejado |
| 3 — interação | `tooltip` | Tooltip | Base UI Tooltip | planejado |
| 4 — feedback | `toast` | Toast | Base UI Toast com ponte para a API pública existente | planejado |

## Gate de cada onda

1. **Contrato** — anatomy, sizes, states, disabled/readonly/error e parts batem
   com o CSS e a documentação pública do DS.
2. **Registry** — schema, dependencies, targets, docs e aliases passam na CLI.
3. **Source** — sem Tailwind obrigatório, sem raw visual values, sem mistura de
   Ark/Radix e sem export público em `@tis/react`.
4. **Consumer** — `shadcn add`, typecheck e build em Vite/React temporário.
5. **Browser** — desktop, 320/390px, light/dark, interação e foco.
6. **Acessibilidade** — Axe critical/serious zero e semântica manual do padrão.
7. **Bundle** — provider e integração dentro do orçamento registrado no teste.
8. **Repo** — `build:all`, `test:vnext`, `git diff --check` e CHANGELOG.

## Critérios específicos da onda 1

- `Field` associa label, helper e error sem esconder o nome acessível.
- Invalid exige `data-invalid` no Field e `aria-invalid` no controle.
- Input e Textarea preservam `sm`, `md`, `lg`, disabled e readonly.
- Checkbox preserva unchecked, checked, indeterminate e disabled.
- Radio Group usa um único nome/valor, setas e fieldset/legend quando agrupado.
- Switch preserva off/on, disabled e anúncio `role="switch"`.
- Form submit recebe os valores reais dos inputs ocultos do Base UI.

## Decisão após cada onda

Ao terminar uma onda, comparar custo de bundle, quantidade de CSS adapter e
complexidade de manutenção com o spike Ark/Zag. Se um adapter começar a
reimplementar comportamento ou visual, a onda deve parar e voltar para revisão
arquitetural antes de adicionar o componente seguinte.

## Resultado da onda 1 — 2026-07-31

- Registry com 10 itens validado pela CLI shadcn e por typecheck de todos os
  sources distribuídos.
- Instalação real dos seis itens em consumer Vite/React temporário, seguida de
  typecheck, build e auditoria com zero vulnerabilidades.
- Browser cobre teclado de Radio Group, alternância de Checkbox/Switch, submit
  nativo, estados, tamanhos, 320/390px e Axe critical/serious zero.
- Bundle da onda: 12,74 KiB gzip no provider e 21,27 KiB gzip na integração,
  abaixo dos limites de 15 e 25 KiB.
- A publicação permanece separada: a tag estável `v1.0.0` ainda não contém a
  correção de ordem do import de fontes presente nesta branch. Bump, commit,
  push e release exigem autorização específica do owner.

Próxima onda: apresentação — Alert, Avatar, Badge, Breadcrumb, Card, Pagination,
Divider/Separator, Skeleton, Spinner e Table.
