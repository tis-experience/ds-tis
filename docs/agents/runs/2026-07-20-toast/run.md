# Agent Run Context

- Run ID: 2026-07-20-toast
- Title: Toast
- Created at: 2026-07-20
- Status: Completa (gates aprovados; sem bump/publish)
- Current gate: (nenhum)
- Active role: —
- Repo: /Users/marcelldasilva/Projectos TIS/ds-tis
- Branch: `feat/toast`
- Figma file: https://www.figma.com/design/IE68amP9Hya5ieFw1rX8S8/DS---TIS
- Figma Toast page: `10279:2544` · set: `10279:2508`

> Estado verificável por máquina em `state.json`. Gates só avançam quando o gate
> anterior está `approved`. Evidências (dumps, screenshots, saídas de validador)
> ficam em `evidence/`. Não dependa da prosa abaixo para decidir o próximo passo;
> use `npm run agents:next-step` e `npm run agents:gate`.

## Objective

Entregar Toast MVP completo: tipos de feedback, dismiss, auto-hide, botão de ação opcional, fila/stack, runtime `ds-tis/toast`, Figma-first, depois repo App-ready. SemVer minor na release (`1.1.0`); sem bump neste PR.

## Owner decision log

- 2026-07-20: Run created.
- 2026-07-20: Plano aprovado — Toast antes de Popover; MVP com ação + fila; SemVer minor na publicação.
- 2026-07-20: Brief + figma-spec escritos; **aguardando aprovação explícita** antes de Figma write.

## Out of scope

- Popover, Table, adaptadores React/Vue
- Bump de versão / publicação npm
- Commit, push, PR até autorização explícita
- Repo sync antes de Figma aprovado
- Figma write antes de aprovação brief/spec

## Threads

- Orchestrator: esta sessão
- DS Architect: brief + spec prontos (`01`, `02`)
- Figma Builder: bloqueado
- Figma Auditor: bloqueado
- Token Sync Agent: bloqueado
- Repo Component Agent: bloqueado
- Release Agent: bloqueado

## Artifacts

| Order | Artifact | Owner role | Status |
|---|---|---|---|
| 01 | `01-brief.md` | DS Architect | Aguardando aprovação |
| 02 | `02-figma-spec.md` | DS Architect | Aguardando aprovação |
| 03 | `03-figma-build-report.md` | Figma Builder | Pending |
| 04 | `04-figma-audit-report.md` | Figma Auditor | Pending |
| 05 | `05-repo-sync-plan.md` | Token Sync Agent | Pending |
| 06 | `06-repo-implementation-report.md` | Repo Component Agent | Pending |
| 07 | `07-release-report.md` | Release Agent | Pending |

## Next handoff

```txt
Owner: aprovar (ou pedir ajustes em) 01-brief.md e 02-figma-spec.md.
Responder às decisões abertas no brief (Subtle only? canto inferior-direito? sem auto-hide com action?).
Após “pode executar draft”: Figma Builder escreve component set + página Toast.
```
