# Aprendizado de processo — Popover/Toast (2026-07-21)

## Falhas

1. Página/set com TEXT Inter + fontSize/fill crus (modelo usa Text Style + binds).
2. Content Slot improvisado: seed Button, Actions paralelo, default true.
3. “Pronto” declarado com layout parecido, sem prova tipográfica/slot.

## Prevenção (repo)

- `docs/agents/grounding.md` §7.1 tipografia, §7.2 Content Slot; §8 blockers novos.
- `docs/agents/checklists/figma-build-checklist.md` e `figma-audit-checklist.md`.
- `docs/agents/roles/figma-builder.md` — proibições explícitas.
- `docs/process-ai-component-workflow.md` — gate paridade visual ampliado.

## Regra operacional

Clonar modelo → aplicar `textStyleId`/binds na mesma passagem → slot como Modal → exemplo só na página → só então screenshot e status tripartite.
