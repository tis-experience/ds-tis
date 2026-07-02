# Adapter: Codex

Use este adapter quando estiver trabalhando no Codex.

## Entrada canonica

- Leia `AGENTS.md`.
- Leia `docs/agents/protocol.md`.
- Leia a role em `docs/agents/roles/`.
- Leia o checklist correspondente.
- Use a run em `docs/agents/runs/<run>/` quando existir.

## Threads

Codex pode usar threads separadas para roles diferentes quando a ferramenta estiver disponivel.

Padrao recomendado:

- Orchestrator: thread principal.
- DS Architect: thread separada ou mesmo chat em modo planejamento.
- Figma Builder: thread separada com Figma MCP.
- Figma Auditor: thread separada, read-only.
- Token Sync/Repo/Release: thread separada ou sequencial, dependendo do risco.

## Prompt inicial recomendado

```txt
Atue como [Role] para o DS Core.
Use a run em [path].
Leia AGENTS.md, docs/agents/protocol.md, docs/agents/roles/[role].md e o checklist correspondente.
Declare Role, Checklist, Artefatos de entrada e Bloqueado antes de agir.
Nao assuma outra role.
```

## Ferramentas

- Use Figma MCP para Figma.
- Antes de `use_figma`, carregue a skill `figma-use`.
- Use Product Design quando o owner pedir critique, UX, hierarquia ou exploracao visual.
- Use shell/git local para repo.

## Modelo e effort sugeridos

- DS Architect: melhor modelo disponivel, `high`.
- Figma Builder: Codex com Figma MCP, `high`.
- Figma Auditor: melhor modelo disponivel, `high` ou `xhigh` para auditoria critica.
- Token Sync Agent: Codex, `high`.
- Repo Component Agent: Codex, `medium` ou `high`.
- Release Agent: Codex, `medium`.
