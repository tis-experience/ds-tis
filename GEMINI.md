# GEMINI.md — Gemini CLI adapter

Este arquivo existe apenas para compatibilidade com Gemini CLI. A fonte canônica do projeto é `AGENTS.md`; integrações compartilhadas ficam em `docs/agent-integrations.md`.

Para fluxos multi-agent, use o protocolo portável em `docs/agents/protocol.md` e o adapter específico em `docs/agents/adapters/gemini.md`.

**Comece sempre por [`AGENTS.md`](./AGENTS.md)** antes de qualquer escrita.

## Antes da primeira escrita na sessão

```bash
npm run agent:preflight
```

## MCPs e ferramentas

MCP é protocolo aberto — Gemini CLI suporta MCP servers nativamente. Se Figma MCP e GitHub MCP estiverem configurados, siga `docs/agent-integrations.md`.

**Antes de assumir que NÃO tem acesso:** rode `gemini mcp list` (ou comando equivalente) para confirmar. Se Figma e GitHub estão listados, as regras de leitura, escrita e validação são as mesmas de qualquer outro agente.

**Se NÃO tiver MCP configurado** (cenário menos comum):
- **Figma**: consulte snapshot estático em `.figma-snapshot.json` (verificar idade via preflight). Pra tarefas em categorias CSS-only (`motion.*`, `z.*`, `shadow.*` — ADR-016), JSON é fonte e não precisa de Figma.
- **GitHub**: usar `gh` CLI local (mesma autenticação SSH/token do dev).
- **Git local**: livre via Bash em qualquer cenário.

## Convenções de commit

Co-Author do agente:
```
Co-Authored-By: Gemini <noreply@google.com>
```

## Resolução de conflitos entre instruções

Precedência (maior → menor):
1. **AGENTS.md / GEMINI.md neste repo** — autoridade local.
2. **ADRs em `docs/decisions/`** — autoridade arquitetural local.
3. `docs/agent-integrations.md` — integrações compartilhadas entre agentes.
4. Este `GEMINI.md` — adapter operacional do Gemini CLI.
5. Configuração persistente do Gemini CLI (`~/.gemini/...` se existir) — preferências cross-projeto. Quando conflitar com o repo, **o repo ganha**.
6. Defaults do agente.

## Boas práticas (independente de MCP estar configurado ou não)

- **Não "intuir" valores Figma sem verificação**. Com MCP Figma: rodar `get_variable_defs`/`get_design_context`. Sem MCP: consultar `.figma-snapshot.json` (verificar idade via preflight).
- **Não inventar variables CSS** que o Figma equivalente não tem bindadas. Cadeia é Figma → JSON → CSS — mantém ordem.
- **Categorias CSS-only (motion/z/shadow) — JSON é fonte** (ADR-016). Edição direta legítima sem precisar Figma.
- **Mudanças em Effect Styles, Text Styles, Variables do Figma**: precisa MCP Figma com Plugin API (`use_figma`). Se não tiver, peça pra o usuário rodar via outro agente.

## Quando precisar atualizar este arquivo

Mudou algo Gemini-específico? (limitação nova, comando Gemini, ferramenta Gemini disponível.) Edite aqui. Mudou algo compartilhado entre agentes? Vai em `AGENTS.md` ou `docs/agent-integrations.md`.
