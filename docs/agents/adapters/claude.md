# Adapter: Claude

Use este adapter quando estiver trabalhando com Claude Code ou Claude com ferramentas equivalentes.

## Entrada canonica

`CLAUDE.md` e apenas adapter operacional. A fonte compartilhada continua:

1. `AGENTS.md`
2. `docs/agents/protocol.md`
3. role em `docs/agents/roles/`
4. checklist em `docs/agents/checklists/`
5. run em `docs/agents/runs/<run>/`

## Subagents

Quando houver suporte a subagents, crie um subagent por role. Cada subagent deve receber somente:

- path da run;
- role;
- checklist;
- artefatos de entrada;
- bloqueios.

Nao passe historico inteiro quando o artefato da run for suficiente.

## Figma

- Use MCP Figma configurado no ambiente Claude.
- Antes de `use_figma`, carregue a skill Figma exigida pelo runtime.
- Figma Auditor deve operar read-only.

## Prompt inicial recomendado

```txt
Atue como [Role] para o DS Core.
Use a run em [path].
Leia AGENTS.md, CLAUDE.md, docs/agents/protocol.md, docs/agents/roles/[role].md e o checklist correspondente.
Produza somente o artefato esperado da sua role.
```
