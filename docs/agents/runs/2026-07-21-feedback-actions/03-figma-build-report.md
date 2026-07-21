# Figma Build Report

- Status: Pronto para auditoria
- Componente/padrão: Feedback Actions (Alert + Toast)
- Run: `docs/agents/runs/2026-07-21-feedback-actions`
- Builder: Figma Builder (Cursor)
- Data: 2026-07-21

> Antes de preencher, leia `docs/agents/grounding.md`. Status é **computado** a
> partir de evidência e validadores, não declarado. Contagem agregada não fecha
> nenhum gate.

## Entrada

- Brief: `01-brief.md` (owner aprovou 2026-07-21 — opção A + escape B)
- Spec: `02-figma-spec.md`
- Matriz de contrato: `evidence/figma-contract-matrix.md`
- `agents:validate-matrix --strict-exceptions`: exit 0 (`unmappedRows=0`)
- Snapshot Figma usado: pré-build dump via `use_figma` (Actions eram FRAME+TEXT); pós-write verificação no mesmo arquivo
- Aprovação do owner: gate `brief` approved

## Alterações no Figma

- Node IDs criados (Alert Actions × 8 variants × 2): `10311:89` … `10311:224` (16 instances)
- Node IDs criados (Toast Actions × 8 variants × 2): `10311:279` … `10311:414` (16 instances)
- Docs Alert rows: `10311:2605`–`10311:2618`
- Docs Toast rows: `10311:2623`–`10311:2630`
- Node IDs alterados: Actions frames em todos os variants Alert `147:67` e Toast `10279:2508`; section-propriedades Alert `155:62` e Toast `10279:2646`
- Página: `❖ Alert`, `❖ Toast`
- Component sets: Alert `147:67`, Toast `10279:2508`
- Variants: 8 + 8 (Type × Style) — Actions substituídas em todos
- Slots: nenhum
- Tokens/variables criados: nenhum (opção A; reusa Button)
- Removidos TEXT órfãos: `Action 1 Label`, `Action 2 Label` (Alert e Toast)
- Linhas da matriz:
  - **Executadas:** Actions row visible+AL; Action 1/2 INSTANCE Button Ghost/Sm + `isExposedInstance`; remoção FRAME+TEXT; painel Show Action 1/2
  - **Não executadas:** nenhuma da matriz A
  - **Divergentes:** Label no painel via **nested expose** (não TEXT parent wired a sublayer) — API Plugin bloqueia `componentPropertyReferences` em instance sublayer; alinhado à decisão 4 do brief (nested prop)

## Validação pós-escrita (por propriedade, não agregada)

- Estrutura lida de volta: Alert `instance=16 frame=0`; Toast `instance=16 frame=0`
- `mainComponent` Action 1/2: `Size=Small, Style=Ghost, State=Default, Loading=false, Icon Only=false`
- `isExposedInstance=true` em Action 1 e Action 2
- `Actions.visible` ↔ Show Action 1; `Action 2.visible` ↔ Show Action 2
- Ícones do Button: `Show Left/Right Icon=false` via `setProperties`
- Component properties órfãs Action Label: removidas
- Focus ring: herdado do Button (não inventado na fileira)
- Documentação: tabelas de propriedades Alert/Toast atualizadas para nested Button Ghost/Sm
- `verify:figma-structure`: não rodado nesta role (exige snapshot regenerado — Token Sync / Auditor)
- Screenshot final vs modelos: previews temporários Solid Success/Error Alert + Toast Success Solid (actions on); ghost label escuro legível no fundo Solid; **escape B não disparado**
- Previews temporários removidos após captura

## Pendências conhecidas

- ~~Cores `alert|toast/action/color/*` não aplicadas~~ **Resolvido 2026-07-21:** override de fill do Label nested em todos os variants (Subtle → `*/action/color/subtle`; Solid → `*/action/color/{type}/solid` = content-contrast). Sem detach; escape B não necessário.
- Nested expose mostra props do Button (Label, ícones, etc.) — designers devem manter Ghost/Sm; não há lock de Style no painel (risco de swap manual para Brand — nota Do/Don’t ainda pode reforçar).
- Hover/Pressed do Button nested ainda usam tokens Ghost do Button (bg hover); só a cor do Label foi re-bound por Style/Type. Se o owner quiser hover tonal completo, avaliar escape B ou overrides de state.
- Repo continua **congelado** até Figma Auditor + owner.

## Status tripartite (cada um lastreado em evidência)

- Contrato: `passou` — 32 INSTANCE Button; 0 FRAME action; booleans wired; labels via nested expose
- Documentação: `passou` — section-propriedades Alert/Toast atualizadas; sem Action Label TEXT fantasma na API
- Visual: `passou` — screenshots Solid com 2 actions; contraste aparente OK; escape B não necessário

## Status final

- Pronto para Figma Auditor: **sim**
- Bloqueado antes de: repo sync, commit, push, publicação
- Quem construiu **não** aprova: próximo gate = Figma Auditor (role separada)
