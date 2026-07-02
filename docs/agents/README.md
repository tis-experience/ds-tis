# Agents para trabalho no DS Core

Esta pasta define roles, checklists e templates para agentes IA trabalhando no DS Core. Ela complementa `AGENTS.md` e `docs/process-ai-component-workflow.md`; nao substitui ADRs, Figma vivo, tokens ou validadores.

Para orquestracao portatil entre diferentes IAs, leia tambem:

- `docs/agents/grounding.md` — **obrigatorio para toda role** (regras anti-alucinacao)
- `docs/agents/protocol.md`
- `docs/agents/orchestration.md`
- `docs/agents/adapters/`

Para uso por Product Designers, comece por `docs/agents/product-designer-workflow.md`. Esse fluxo esconde terminal, scripts e handoffs tecnicos atras de um Orchestrator.

## Objetivo

Separar responsabilidades para reduzir retrabalho:

1. **DS Architect** define classificacao, brief e spec.
2. **Figma Builder** executa apenas a spec aprovada no Figma.
3. **Figma Auditor** audita estruturalmente sem editar.
4. **Token Sync Agent** leva Figma aprovado para JSON/CSS gerado.
5. **Repo Component Agent** implementa CSS/docs usando tokens e componentes DS.
6. **Release Agent** valida, prepara commit/PR/push/publicacao.

Regra principal: **quem constroi nao aprova o proprio trabalho**. O Builder entrega draft; o Auditor decide se ha divergencia objetiva antes de repo.

## Como usar

Para uso diario, prefira os atalhos em `docs/agents/quick-commands.md`, por exemplo:

```txt
Audite Menu como Figma Auditor.
```

Os prompts completos abaixo servem para abrir uma thread/agente mais controlado ou para corrigir rota quando o agente ignorar o processo.

Para trabalhos maiores, o Orchestrator deve criar uma run para evitar copy/paste entre chats:

```bash
npm run agents:create-run -- --slug combobox --title "Combobox"
npm run agents:next-step -- docs/agents/runs/YYYY-MM-DD-combobox
```

Antes de qualquer acao, o agente deve declarar:

```md
Role:
Checklist:
Artefato de entrada:
Bloqueado antes de:
```

Exemplo:

```md
Role: Figma Builder
Checklist: docs/agents/checklists/figma-build-checklist.md
Artefato de entrada: spec Figma aprovada no chat
Bloqueado antes de: repo sync, commit e push
```

## Prompts recomendados

### DS Architect

```txt
Atue como DS Architect para o DS Core.
Leia AGENTS.md, docs/process-ai-component-workflow.md e docs/agents/roles/ds-architect.md.
Use docs/agents/templates/component-brief.md e docs/agents/templates/figma-spec.md.
Entregue apenas brief + spec. Nao escreva no Figma nem no repo.
```

### Figma Builder

```txt
Atue como Figma Builder para o DS Core.
Leia AGENTS.md, docs/process-ai-component-workflow.md, docs/agents/roles/figma-builder.md e docs/agents/checklists/figma-build-checklist.md.
Execute somente a spec aprovada. Use componentes existentes do DS e tokens Component quando houver contrato anatomico.
No final, entregue node IDs criados/alterados e status "pronto para auditoria" ou "bloqueado".
Nao sincronize repo.
```

### Figma Auditor

```txt
Atue como Figma Auditor para o DS Core.
Leia AGENTS.md, docs/agents/roles/figma-auditor.md e docs/agents/checklists/figma-audit-checklist.md.
Nao edite nada. Retorne relatorio objetivo usando docs/agents/templates/figma-audit-report.md.
Inclua contagens: variants, binds, textos, instancias, slots, focus ring, elevation, loose nodes e hardcodes.
```

### Token Sync Agent

```txt
Atue como Token Sync Agent para o DS Core.
Leia AGENTS.md, docs/process-figma-sync.md, docs/agents/roles/token-sync-agent.md e docs/agents/checklists/token-sync-checklist.md.
So avance se o Figma estiver aprovado. Apresente plano antes de escrever no repo.
```

### Repo Component Agent

```txt
Atue como Repo Component Agent para o DS Core.
Leia AGENTS.md, docs/agents/roles/repo-component-agent.md e docs/agents/checklists/repo-implementation-checklist.md.
Implemente CSS/docs usando tokens e componentes DS existentes. Nao use classes internas isoladas em exemplos.
```

### Release Agent

```txt
Atue como Release Agent para o DS Core.
Leia AGENTS.md, docs/agents/roles/release-agent.md e docs/agents/checklists/release-checklist.md.
Valide diff, testes, changelog, commit/PR/push/publicacao conforme autorizacao explicita.
```

## Product Design, skills e MCPs

Ferramentas externas ajudam, mas nao substituem o processo do repo.

- Use `@product-design` para critique, hierarchy, UX rationale, visual alternatives e avaliacao de qualidade quando o trabalho envolve experiencia, composicao ou padrao visual.
- Use Figma MCP para ler/escrever o arquivo, sempre seguindo a skill `figma-use` antes de `use_figma`.
- Use WAI-ARIA APG e documentacao primaria para padroes interativos como menu button, combobox, dialog e tabs.
- Use os validadores do repo para confirmar drift e regressao objetiva.

O repo fornece o contrato e os prompts. O ambiente ainda precisa disponibilizar as ferramentas certas: Figma MCP para Figma, shell/git para repo, GitHub para PR/CI e plugins/skills quando forem citados.

## O que isto nao resolve sozinho

Estas instrucoes nao criam agentes persistentes automaticamente. Elas criam contratos reutilizaveis. Em Codex/Claude/Gemini/Cursor, voce ainda inicia cada agente com um prompt de role ou cria threads/subagentes separados apontando para estes arquivos.

Tambem nao substituem exemplos e base de conhecimento. Para padroes sensiveis, o DS Architect deve anexar exemplos vivos do DS Core, referencias maduras e decisoes relevantes antes do Builder executar.
