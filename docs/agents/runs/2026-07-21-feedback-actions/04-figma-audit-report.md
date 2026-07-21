# Figma Audit Report

- Status: Aprovado pelo owner (gate avançado com autorização explícita para código; polish Toast deferido)
- Componente: Feedback Actions (Alert + Toast)
- Página: `❖ Alert`, `❖ Toast`
- Node principal: Alert set `147:67`, Toast set `10279:2508`
- Spec usada: `02-figma-spec.md` + amend padding-top / action colors
- Páginas modelo: Button Ghost/Sm; Alert/Toast hosts
- Auditor: gate owner (2026-07-21) — Builder não auto-aprovou visual final
- Data: 2026-07-21

## Passou

- Actions = INSTANCE Button Ghost/Sm (0 FRAME+TEXT) — dump Builder pós-write
- `isExposedInstance` Action 1/2; Show Action 1/2 wired
- Label fill: Subtle → `*/action/color/subtle`; Solid → `*/action/color/{type}/solid`
- `alert|toast/actions/padding-top/default` (8px / space.sm) bindado em 16 frames Actions
- Docs section-propriedades Alert/Toast atualizadas (nested Button)
- Repo: CSS + tokens espelhados; `verify:tokens` 0 erros

## Falhou / deferido (owner)

| Severidade | Item | Evidencia | Node IDs | Correcao sugerida |
|---|---|---|---|---|
| baixa | Polish Toast (owner) | “tem algumas melhorias para toast… depois ajusto” | Toast set / page | Fora desta run; owner ajusta depois |
| info | Hover tonal do Button nested | Só Label re-bound; hover bg ainda Ghost | Actions instances | Opcional escape B / overrides de state |
| info | Snapshot plugin oficial | Patch local `.figma-snapshot.json` para as 2 vars novas | — | Regenerar export plugin quando conveniente |

## Contagens

- Variants Alert/Toast: 8 + 8 (Type × Style)
- Actions instances: 32 (16 hosts × Action 1/2)
- FRAME fake actions restantes: 0

## Status tripartite

- Contrato: passou (opção A + padding-top + cores)
- Documentação: passou o suficiente para handoff; Toast docs/demo podem ganhar polish depois
- Visual: passou Solids amostrados; Toast polish deferido pelo owner

## Decisão

- **Aprovado para seguir** Token Sync / Repo / Release sem bump
- Toast refinements: backlog do owner, não bloqueiam o restante desta run
