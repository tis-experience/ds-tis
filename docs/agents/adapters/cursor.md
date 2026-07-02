# Adapter: Cursor

Use este adapter quando estiver trabalhando com Cursor ou outro IDE chat.

## Entrada canonica

Cursor deve tratar o repo como fonte do processo:

1. `AGENTS.md`
2. `docs/agents/protocol.md`
3. role em `docs/agents/roles/`
4. checklist em `docs/agents/checklists/`
5. run em `docs/agents/runs/<run>/`

## Uso recomendado

Use Cursor principalmente para roles de repo:

- Repo Component Agent
- Token Sync Agent, quando os scripts locais forem suficientes
- Release Agent, quando git/CI estiverem disponiveis

Para Figma Builder/Auditor, use Cursor apenas se o ambiente tiver Figma MCP funcional. Caso contrario, Cursor pode ajudar no planejamento, mas nao deve declarar Figma como validado.

## Prompt inicial recomendado

```txt
Atue como [Role] para o DS Core.
Use a run em [path].
Leia AGENTS.md, docs/agents/protocol.md, docs/agents/roles/[role].md e o checklist correspondente.
Limite-se a arquivos do repo, a menos que Figma/GitHub tools estejam disponiveis.
```
