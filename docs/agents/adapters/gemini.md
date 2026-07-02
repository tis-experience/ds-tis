# Adapter: Gemini

Use este adapter quando estiver trabalhando com Gemini CLI ou Gemini com ferramentas equivalentes.

## Entrada canonica

`GEMINI.md` e apenas adapter operacional. A fonte compartilhada continua:

1. `AGENTS.md`
2. `docs/agents/protocol.md`
3. role em `docs/agents/roles/`
4. checklist em `docs/agents/checklists/`
5. run em `docs/agents/runs/<run>/`

## MCPs

Antes de assumir falta de acesso, liste MCPs/ferramentas disponiveis no runtime. Se Figma MCP existir, siga `docs/agent-integrations.md`.

Sem Figma MCP:

- use `.figma-snapshot.json` somente para leitura limitada;
- nao escreva no Figma;
- declare bloqueio quando a role exigir escrita.

## Prompt inicial recomendado

```txt
Atue como [Role] para o DS Core.
Use a run em [path].
Leia AGENTS.md, GEMINI.md, docs/agents/protocol.md, docs/agents/roles/[role].md e o checklist correspondente.
Se nao houver MCP necessario, declare bloqueio em vez de improvisar.
```
