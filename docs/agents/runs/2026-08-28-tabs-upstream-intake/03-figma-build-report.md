# Figma Build Report

- Status: Não aplicável — unchanged with evidence
- Componente/padrão: Tabs
- Run: `2026-08-28-tabs-upstream-intake`
- Builder: nenhum; escrita Figma bloqueada
- Data: 2026-08-28

> Antes de preencher, leia `docs/agents/grounding.md`. Status é **computado** a
> partir de evidência e validadores, não declarado. Contagem agregada não fecha
> nenhum gate.

## Entrada

- Brief: `01-brief.md`, aprovado
- Spec: `02-figma-spec.md`, aprovado unchanged
- Matriz de contrato (path): não aplicável; nenhum node será escrito
- `agents:validate-matrix --strict-exceptions` (exit): não aplicável
- Snapshot Figma usado (id/data): `.figma-snapshot.json`, `2026-08-28T08:35:08.535Z`
- Aprovação do owner: preservar Figma atual e seguir com adapters

## Alterações no Figma

- Node IDs criados: zero
- Node IDs alterados: zero
- Página: `192:2`, root `194:94`
- Component sets:
- Variants:
- Slots:
- Tokens/variables criados: zero
- Linhas da matriz executadas / não executadas / divergentes:

## Validação pós-escrita (por propriedade, não agregada)

- Estrutura lida de volta (path da evidência): `evidence/current-contract.md`
- Bindings por propriedade (fills, strokes, strokeWeight, cornerRadius, padding, gap, height, text style, componentPropertyReferences):
- Component properties referenciadas por sublayer real (sem fake):
- Foco no Focus Ring (não na borda estrutural):
- Ícones Lucide com size/color/stroke-width em Component token (binding no vetor interno):
- Documentação derivada da API (zero linhas citando property/slot/token/state inexistente):
- `verify:figma-structure` (exit, registrado em state.json):
- Screenshot final vs modelos vivos (path da evidência):

## Pendências conhecidas

- Nenhuma pendência Figma; adapters ainda serão implementados.

## Status tripartite (cada um lastreado em evidência)

- Contrato: `passou` — contrato existente preservado.
- Documentação: `passou` — página atual preservada, issueCount 0.
- Visual: `passou` — nenhuma alteração visual no Figma.

> Se qualquer um acima for `bloqueado`, o status final é `bloqueado`, não
> "pronto para auditoria".

## Status final

- Pronto para Figma Auditor (somente com os 3 acima `passou`): não aplicável; auditoria read-only em `04-figma-audit-report.md`.
- Bloqueado antes de: commit, push e publicação.
