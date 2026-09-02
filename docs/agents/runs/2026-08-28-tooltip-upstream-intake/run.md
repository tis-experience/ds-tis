# Agent Run Context

- Run ID: 2026-08-28-tooltip-upstream-intake
- Title: Tooltip
- Created at: 2026-08-28
- Status: Ready for release approval
- Current gate: Release
- Active role: Release Agent
- Repo: /Users/marcelldasilva/Projectos TIS/ds-tis
- Figma file: https://www.figma.com/design/IE68amP9Hya5ieFw1rX8S8/DS---TIS

> Estado verificável por máquina em `state.json`. Gates só avançam quando o gate
> anterior está `approved`. Evidências (dumps, screenshots, saídas de validador)
> ficam em `evidence/`. Não dependa da prosa abaixo para decidir o próximo passo;
> use `npm run agents:next-step` e `npm run agents:gate`.

## Objective

Entregar Tooltip equivalente nas três saídas sem alterar o contrato Web/Figma

## Owner decision log

- 2026-08-28: Run created.
- 2026-08-28: Owner authorization for continuous component-by-component execution applied to the brief and repo adapter scope.
- 2026-08-28: Figma outcome approved unchanged from current snapshot; no Figma or Web core write authorized.
- 2026-08-28: Focus, aria-describedby, Escape and visual comparison passed in desktop and 390px.

## Out of scope

- Commit, push, PR and production release until explicitly authorized.
- Repo sync before Figma is approved.
- Figma write before brief/spec approval.

## Threads

- Orchestrator:
- DS Architect:
- Figma Builder:
- Figma Auditor:
- Token Sync Agent:
- Repo Component Agent:
- Release Agent:

## Artifacts

| Order | Artifact | Owner role | Status |
|---|---|---|---|
| 01 | `01-brief.md` | DS Architect | Approved |
| 02 | `02-figma-spec.md` | DS Architect | Approved unchanged |
| 03 | `03-figma-build-report.md` | Figma Builder | Not applicable — unchanged |
| 04 | `04-figma-audit-report.md` | Figma Auditor | Passed unchanged |
| 05 | `05-repo-sync-plan.md` | Token Sync Agent | Approved |
| 06 | `06-repo-implementation-report.md` | Repo Component Agent | Passed |
| 07 | `07-release-report.md` | Release Agent | Pending |

## Next handoff

Implementação local validada. O próximo handoff é de Release Agent somente após autorização explícita do owner para commit, PR ou publicação.
