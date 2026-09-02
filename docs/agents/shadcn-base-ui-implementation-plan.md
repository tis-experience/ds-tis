# Plano de implementação: saída React · shadcn/Base UI

> Este plano registra a evolução da saída React. Contagens e próximas etapas
> datadas são evidência histórica; o estado atual vive em
> `docs/api/consumer-context.json` e `docs/api/components.json`.

## Objetivo

Distribuir os 26 componentes públicos do DS TIS como source code React pelo
registry shadcn, preservando o CSS, os tokens DTCG, a anatomia e os nomes
canônicos do core. shadcn fornece estrutura de composição e distribuição;
Base UI fornece o comportamento quando o componente precisa de primitives.

As ADR-022/023 são canônicas: HTML/CSS/JS, Ark/Zag, React/shadcn/Base UI e Angular
nativo são quatro saídas coexistentes. Este plano cobre somente a terceira. Ele
não escolhe um provider vencedor, não substitui as outras saídas e não distribui
Ark/Zag ou Angular pelo registry shadcn.

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
9. `validado` descreve a qualidade desta saída; não promove nem elimina qualquer
   outra saída.
10. Para comportamento coordenado nesta saída, Base UI é o primitive preferido;
    exceções devem ser registradas por componente.
11. Todo novo intake usa `docs/process-upstream-component-intake.md` e um
    `upstream-intake.json` válido; o registry distribui somente a saída React.

## Contrato de coexistência

| Camada | Papel canônico | Estado atual |
|---|---|---|
| Tokens DTCG + `ds-tis/css` | Visual, temas e anatomia pública | estável |
| HTML/CSS/JS | Saída agnóstica | estável e separada deste plano |
| Ark/Zag | Saída headless por tecnologia | evolução e release próprios |
| shadcn registry | Estrutura e distribuição da saída React | beta funcional |
| Base UI | Primitives comportamentais da saída React | beta funcional |
| React nativo/composição | Padrões sem primitive necessária dentro da saída React | validado nos casos simples |

## Ondas

| Onda | Registry | Componente DS | Estratégia | Estado |
|---|---|---|---|---|
| 0 — piloto | `accordion` | Accordion | Base UI 1.6.0 | saída React validada |
| 0 — piloto | `button` | Button | Base UI 1.6.0 | saída React validada |
| 0 — piloto | `dialog` | Modal | Base UI 1.6.0 | saída React validada |
| 1 — forms | `field` | Form Field | composição React/CSS-only | validado |
| 1 — forms | `input` | Input Text | Base UI 1.6.0 + wrapper anatômico | saída React validada |
| 1 — forms | `textarea` | Textarea | textarea nativo + wrapper anatômico | validado |
| 1 — forms | `checkbox` | Checkbox | Base UI 1.6.0 + adapter de state | saída React validada |
| 1 — forms | `radio-group` | Radio | Base UI 1.6.0 + adapter de state | saída React validada |
| 1 — forms | `switch` | Toggle | Base UI 1.6.0 + adapter de state | saída React validada |
| 2 — apresentação | `alert` | Alert | composição React sem provider | validado |
| 2 — apresentação | `avatar` | Avatar | HTML/composição primeiro; provider somente se necessário | planejado |
| 2 — apresentação | `badge` | Badge | composição React sem provider | validado |
| 2 — apresentação | `breadcrumb` | Breadcrumb | HTML nativo/composição | planejado |
| 2 — apresentação | `card` | Card | composição React sem provider | validado |
| 2 — apresentação | `pagination` | Pagination | composição com Button/links | planejado |
| 2 — apresentação | `separator` | Divider | HTML nativo/composição | validado |
| 2 — apresentação | `skeleton` | Skeleton | apresentação sem provider | validado |
| 2 — apresentação | `spinner` | Spinner | apresentação sem provider | validado |
| 2 — apresentação | `table` | Table | HTML nativo/composição | planejado |
| 3 — interação | `combobox` | Combobox | shadcn/Base UI, com recipe e dependências registradas | planejado |
| 3 — interação | `dropdown-menu` | Menu | shadcn/Base UI | planejado |
| 3 — interação | `popover` | Popover | Base UI nesta saída; paridade separada com Web e Ark/Zag | intake formal em revisão |
| 3 — interação | `select` | Select | shadcn/Base UI | planejado |
| 3 — interação | `tabs` | Tabs | shadcn/Base UI ou composição React quando suficiente | planejado |
| 3 — interação | `tooltip` | Tooltip | shadcn/Base UI | planejado |
| 4 — feedback | `toast` | Toast | recipe React com dependência comportamental registrada | planejado |

## Gate de cada onda

1. **Contrato** — anatomy, sizes, states, disabled/readonly/error e parts batem
   com o CSS e a documentação pública do DS.
2. **Registry** — schema, dependencies, targets, docs e aliases passam na CLI.
3. **Source** — sem Tailwind obrigatório, sem raw visual values, sem dois
   providers no mesmo item e sem export público em `@tis/react`.
4. **Consumer** — `shadcn add`, typecheck e build em Vite/React temporário.
5. **Browser** — desktop, 320/390px, light/dark, interação e foco.
6. **Acessibilidade** — Axe critical/serious zero e semântica manual do padrão.
7. **Bundle** — provider e integração dentro do orçamento registrado no teste.
8. **Repo** — `build:all`, `test:vnext`, `git diff --check` e CHANGELOG.
9. **Paridade** — resultado é comparado com HTML/CSS/JS e Ark/Zag pelo mesmo
   método, sem selecionar uma saída para eliminar as demais.

## Critérios específicos da onda 1

- `Field` associa label, helper e error sem esconder o nome acessível.
- Invalid exige `data-invalid` no Field e `aria-invalid` no controle.
- Input e Textarea preservam `sm`, `md`, `lg`, disabled e readonly.
- Checkbox preserva unchecked, checked, indeterminate e disabled.
- Radio Group usa um único nome/valor, setas e fieldset/legend quando agrupado.
- Switch preserva off/on, disabled e anúncio `role="switch"`.
- Form submit recebe os valores reais dos inputs ocultos do Base UI.

## Decisão após cada onda

Ao terminar uma onda, registrar custo de bundle, quantidade de CSS adapter e
complexidade de manutenção desta saída, comparando os cenários comuns com Web e
Ark/Zag. A comparação mede paridade e diferenças legítimas; não promove um
provider vencedor. Se um adapter começar a reimplementar comportamento ou visual,
a onda deve parar e voltar para revisão arquitetural.

## Gate de paridade 1 — Accordion

Accordion é o primeiro comparativo porque já possui as duas provas técnicas no
repo: Ark React em `packages/react/src/provider-spike.jsx` e Base UI no item
`@tis/accordion`.

1. Congelar a API pública TIS e a anatomia `ds-accordion`; provider não aparece
   nos nomes públicos.
2. Executar as duas variantes com os mesmos casos: single/multiple,
   collapsible, disabled, estado controlado e não controlado.
3. Validar o mesmo contrato de teclado: Enter/Space, Arrow Up/Down, Home e End.
4. Comparar foco, atributos, SSR/hydration, Axe e integração com forms quando
   aplicável.
5. Medir source distribuído, CSS adapter, dependências e gzip pelo mesmo script.
6. Instalar a saída React numa fixture React/Vite limpa pelo registry shadcn e a
   saída Ark/Zag pela distribuição própria definida para seu adapter.
7. Registrar o resultado antes de migrar `dialog`, forms ou qualquer componente
   novo. Nenhuma saída é removida durante a paridade.

O gate está **pronto para execução**, mas cada saída só muda de status depois que
sua evidência e a matriz de paridade estiverem fechadas e aprovadas.

## Intake formal — Popover

A run `docs/agents/runs/2026-08-03-popover-upstream-intake/` aplica o processo
controlado ao primeiro componente da onda 3. O contrato Web App-ready e o Figma
vivo permanecem preservados. HTML/CSS/JS, Ark/Zag e React/shadcn/Base UI foram
registrados como saídas coexistentes; o benchmark arquitetural e a auditoria
Figma estão prontos para aprovação do owner, mas nenhum source novo foi
implementado.

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

## Resultado da onda 2A — 2026-07-31

- Registry expandido para 16 itens: a base compartilhada e 15 componentes React
  beta, com Alert, Badge, Card, Divider/Separator, Skeleton e Spinner.
- Instalação real de todos os 15 componentes em consumer Vite/React temporário,
  seguida de typecheck, build, interação em 390px e Axe sem violações.
- Storybook cobre feedback, composição completa de Card, Card interativo,
  loading acessível, tamanhos de Spinner e Separator horizontal/vertical em
  desktop/mobile e light/dark.
- Bundle integrado da onda de apresentação: 9,46 KiB gzip, abaixo do limite de
  15 KiB, sem novo provider comportamental.
- API, manifesto, documentação bilíngue e guia de consumo para agents IA passam
  a declarar disponibilidade, item, provider e comando dos 15 componentes.
- Commit, push, pull request e publicação continuam dependendo de autorização
  específica do owner.

## Resultado da consolidação documental — 2026-07-31

- Um catálogo semântico em `/next/{locale}/react/components/` torna-se a entrada
  única para os 15 componentes React beta. Ações, Conteúdo e estrutura,
  Entrada e seleção, Feedback e status e Overlay e disclosure organizam o que o
  produto resolve; a ordem alfabética é preservada dentro de cada grupo.
- Button deixa de manter uma página React paralela: os 15 componentes usam o
  mesmo template gerado e bilíngue de Design, Uso, Implementação e
  Acessibilidade.
- Cada página conecta preview funcional do Storybook sincronizado com light/dark,
  anatomia, variantes/estados, exemplo copiável, item do registry e comandos
  para npm, pnpm, yarn e bun. Provider e source permanecem disponíveis em um
  bloco recolhido de arquitetura técnica.
- O Storybook deixa de expor grupos técnicos de piloto, forms e apresentação e
  organiza a superfície pública nas mesmas cinco categorias semânticas do
  catálogo React; comparações de provider não entram no build público.
- A tabela editorial paralela do registry é removida; Web CSS, React e agents IA
  ficam em guias de integração distintos, enquanto catálogo, páginas, API e
  registry derivam do mesmo inventário canônico.
- Gates estáticos e de browser validam PT-BR/EN, taxonomia, contrato idêntico nas
  15 páginas, links, redirects legados, 320/390px, light/dark e Axe.

## Resultado da recuperação do Storybook — 2026-08-01

- O build público contém uma Overview, quinze grupos de componentes, dezesseis
  páginas Docs e cinquenta stories; cada grupo possui Docs, Playground com
  Controls e ao menos dois exemplos isolados.
- A navegação passa a usar Ações, Conteúdo e estrutura, Entrada e seleção,
  Feedback e status e Overlay e disclosure. Stories combinadas e a comparação
  interna Ark/Zag deixam de ser indexadas na superfície pública.
- As tabelas de API dos quinze componentes declaram tipo, valor padrão e
  descrição de cada controle. O modo Docs usa um canvas compacto e a Overview
  oculta painéis sem conteúdo.
- Links do portal apontam para os Playgrounds estáveis. O gate de browser abre
  Overview, Docs e Controls, percorre os quinze Playgrounds em 390px, valida
  320px nos fluxos críticos, light/dark, comportamento Base UI, overflow e Axe.
- A inspeção visual final cobriu Overview, Docs de Button, estados do Toggle em
  mobile e variantes de Button em dark mode.

Naquele checkpoint, a etapa seguinte era executar a matriz de paridade de
HTML/CSS/JS, Ark/Zag e React no Accordion. Essa etapa foi concluída antes da
ADR-023 adicionar Angular nativo como quarta saída. O estado atual não deve ser
deduzido deste registro histórico.
