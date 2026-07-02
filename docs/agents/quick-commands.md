# Comandos rápidos para agents

Use estes comandos curtos no chat. O agente deve resolver a role, ler os arquivos correspondentes e declarar `Role`, `Checklist`, `Artefato de entrada` e `Bloqueado antes de` antes de agir.

Se o agente ignorar o fluxo, use o prompt completo em `docs/agents/README.md`.

Para trabalhos com varias etapas, prefira criar uma run:

```txt
Inicie uma agent run para Combobox.
```

Para Product Designers, prefira:

```txt
Inicie uma run de DS Core para Combobox.
Conduza o fluxo para Product Designer: planeje, pare para minha aprovacao, execute no Figma, audite, pare para aprovacao visual e so depois leve ao repo.
Nao me peca para rodar comandos; rode o que for necessario e me traga os gates.
```

O Orchestrator deve rodar nos bastidores:

```bash
npm run agents:create-run -- --slug combobox --title "Combobox"
```

## Planejamento

```txt
Planeje [componente/padrão] como DS Architect.
```

Resolve para:

- Role: `docs/agents/roles/ds-architect.md`
- Templates: `docs/agents/templates/component-brief.md` e `docs/agents/templates/figma-spec.md`
- Bloqueado antes de: Figma write, repo sync, commit/push

## Execução Figma

```txt
Execute a spec aprovada de [componente/padrão] como Figma Builder.
```

Resolve para:

- Role: `docs/agents/roles/figma-builder.md`
- Checklist: `docs/agents/checklists/figma-build-checklist.md`
- Entrada: brief/spec aprovados
- Bloqueado antes de: auditoria final, repo sync, commit/push

## Auditoria Figma

```txt
Audite [componente/padrão] como Figma Auditor.
```

Resolve para:

- Role: `docs/agents/roles/figma-auditor.md`
- Checklist: `docs/agents/checklists/figma-audit-checklist.md`
- Template: `docs/agents/templates/figma-audit-report.md`
- Bloqueado antes de: qualquer escrita no Figma ou repo

## Correção Figma pontual

```txt
Corrija as falhas da auditoria de [componente/padrão] como Figma Builder.
```

Resolve para:

- Role: `docs/agents/roles/figma-builder.md`
- Checklist: `docs/agents/checklists/figma-build-checklist.md`
- Entrada: relatório de auditoria com falhas objetivas
- Bloqueado antes de: repo sync, commit/push

## Sync Figma para repo

```txt
Leve o Figma aprovado de [componente/padrão] para o repo como Token Sync Agent.
```

Resolve para:

- Role: `docs/agents/roles/token-sync-agent.md`
- Checklist: `docs/agents/checklists/token-sync-checklist.md`
- Template: `docs/agents/templates/repo-sync-plan.md`
- Bloqueado antes de: escrita repo sem plano aprovado, commit/push

## Implementação repo

```txt
Implemente [componente/padrão] no repo como Repo Component Agent.
```

Resolve para:

- Role: `docs/agents/roles/repo-component-agent.md`
- Checklist: `docs/agents/checklists/repo-implementation-checklist.md`
- Entrada: Figma/tokens aprovados ou ADR CSS-only aplicável
- Bloqueado antes de: commit/push/publicação

## Release

```txt
Publique [escopo] como Release Agent.
```

Resolve para:

- Role: `docs/agents/roles/release-agent.md`
- Checklist: `docs/agents/checklists/release-checklist.md`
- Template: `docs/agents/templates/release-report.md`
- Entrada: autorização explícita para commit/PR/push/publicação

## Auditoria final curta

```txt
Faça auditoria final curta de [escopo] como Figma Auditor/Token Sync Agent, sem reabrir backlog antigo.
```

Resolve para:

- Role principal: `Figma Auditor` quando o escopo for Figma
- Role principal: `Token Sync Agent` quando o escopo for Figma -> repo
- Bloqueado antes de: mudanças amplas, redesign, commit/push

## Regra de escalonamento

Quando o comando curto mencionar:

- `planeje`, usar DS Architect.
- `execute`, `crie`, `corrija no Figma`, usar Figma Builder.
- `audite`, `revise sem editar`, usar Figma Auditor.
- `leve para o repo`, `sync`, usar Token Sync Agent.
- `implemente no repo`, `CSS/docs`, usar Repo Component Agent.
- `publique`, `prod`, `PR`, `push`, usar Release Agent.

Se o pedido combinar mais de uma role, o agente deve parar no primeiro gate que ainda nao foi aprovado.
