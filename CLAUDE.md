@AGENTS.md

# CLAUDE.md — Claude Code adapter

Este arquivo existe apenas para compatibilidade com Claude Code. A fonte canônica do projeto é `AGENTS.md`; integrações compartilhadas ficam em `docs/agent-integrations.md`.

Para fluxos multi-agent, use o protocolo portável em `docs/agents/protocol.md` e o adapter específico em `docs/agents/adapters/claude.md`.

## Antes da primeira escrita na sessão

```bash
npm run agent:preflight
```

Mostra branch, dirty/clean, idade do snapshot Figma, último resultado de `verify:tokens`, e estado do CHANGELOG.

## MCPs disponíveis no ambiente Claude

### Figma — MCP TIS e Desktop Dev Mode

- **TIS** (`mcp__TIS__*`): TIS Workspace (Pro). Use para:
  - Leitura: `get_metadata`, `get_design_context`, `get_variable_defs`, `get_screenshot`.
  - Escrita: `use_figma` (Plugin API). `fileKey` do DS: `IE68amP9Hya5ieFw1rX8S8`.
  - Antes de chamar `use_figma`, carregar a skill `figma:figma-use`.
- **Desktop Dev Mode** (`mcp__Figma__*`): requer Figma desktop com Dev Mode MCP Server habilitado (Preferências → Enable Dev Mode MCP Server). Bom para ler o node atualmente selecionado.

### GitHub (`mcp__github__*`)

Ver regras e limitações comuns em `docs/agent-integrations.md`.

## Skills relevantes neste repo

- `figma:figma-use` — carregar antes de qualquer chamada `use_figma`.
- `claude-md-management:revise-claude-md` — atualizar este arquivo com aprendizados de uma sessão.
- `claude-md-management:claude-md-improver` — auditar qualidade.

## Resolução de conflitos entre instruções

Precedência (maior → menor):
1. **AGENTS.md neste repo** — autoridade local.
2. **ADRs em `docs/decisions/`** — autoridade arquitetural local.
3. Este `CLAUDE.md` — adapter operacional do Claude Code.
4. Memórias persistentes do agente (`~/.claude/.../memory/`) — preferências cross-projeto. Quando conflitar com o repo, **o repo ganha**.
5. Defaults do agente.

Se uma memória sua diz "X" e este repo diz "não X", siga o repo. Se a memória for repo-específica, ela está no lugar errado — devia estar no repo. Mover.

## Quando precisar atualizar este arquivo

Mudou algo Claude-Code-específico? (nome de MCP, skill do Claude, limitação do runtime Claude.) Edite aqui. Mudou algo compartilhado entre agentes? Vai em `AGENTS.md` ou `docs/agent-integrations.md`.
