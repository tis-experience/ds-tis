# Orquestracao de agents

Este documento descreve como um chat principal ou uma IA orquestradora deve coordenar agents especializados sem copiar e colar grandes blocos entre chats.

## Papel do Orchestrator

O Orchestrator:

1. cria a run;
2. escolhe a proxima role;
3. envia para a role apenas o path da run e artefatos de entrada;
4. para em gates que exigem aprovacao do owner;
5. nunca transforma aprovacao de um gate em autorizacao para todos os proximos;
6. separa falhas globais de falhas do componente atual e reporta ambas antes de prosseguir.

O Orchestrator nao deve substituir DS Architect, Figma Builder, Figma Auditor, Token Sync Agent, Repo Component Agent ou Release Agent.

Para Product Designers, o Orchestrator tambem deve esconder os comandos tecnicos. O designer nao precisa rodar `npm`, criar pastas ou copiar prompts entre chats; o Orchestrator executa isso e apresenta apenas gates claros de aprovacao.

Quando uma role encontrar problema que o processo deveria ter evitado, o Orchestrator deve abrir um gate de retroalimentacao antes do proximo handoff. Esse gate exige:

- causa raiz classificada como componente, auditoria automatizada, checklist/role ou drift global;
- correcao no artefato afetado;
- atualizacao de script, teste, checklist ou processo quando a causa for sistemica;
- evidencia antes/depois ou status `bloqueado` quando faltar snapshot atualizado.

Problemas globais encontrados durante uma run nao podem ficar escondidos no fechamento do componente. Eles devem virar uma fila paralela com impacto, comandos executados e decisao necessaria do owner.

## Fluxo

```txt
Owner
  -> Orchestrator cria run
  -> DS Architect gera brief/spec
  -> Owner aprova
  -> Figma Builder executa
  -> Figma Auditor audita
  -> Owner aprova visualmente
  -> Token Sync Agent sincroniza
  -> Repo Component Agent implementa
  -> Release Agent publica
```

## Criar run

```bash
npm run agents:create-run -- --slug combobox --title "Combobox"
```

O script cria a pasta e os artefatos vazios/padrao. Depois disso, qualquer IA deve trabalhar apontando para o path da run.

## Descobrir proximo passo

```bash
npm run agents:next-step -- docs/agents/runs/YYYY-MM-DD-combobox
```

O comando retorna a role sugerida, checklist e artefatos esperados conforme o primeiro arquivo pendente.

## Validar run

```bash
npm run agents:validate-run -- docs/agents/runs/YYYY-MM-DD-combobox
```

O comando verifica estrutura, links basicos e se `run.md` existe.

## Prompt curto para Orchestrator

```txt
Inicie uma agent run para [componente/padrao].
Crie a run com os scripts do repo.
Depois me diga o path criado e o primeiro prompt curto para o DS Architect.
```

## Prompt designer-facing para Orchestrator

```txt
Inicie uma run de DS Core para [componente ou ajuste].
Conduza o fluxo para Product Designer: planeje, pare para minha aprovacao, execute no Figma, audite, pare para aprovacao visual e so depois leve ao repo.
Nao me peca para rodar comandos; rode o que for necessario e me traga os gates.
```

## Prompt de handoff

```txt
Atue como [Role] para o DS Core.
Use a run em [path].
Leia AGENTS.md, docs/agents/protocol.md, docs/agents/roles/[role].md e o checklist correspondente.
Use os artefatos de entrada listados em run.md.
Produza o artefato de saida esperado na run.
Pare no gate indicado. Nao assuma outra role.
```

## Quando usar chats separados

Use chats separados quando:

- a role muda de planejamento para execucao;
- a auditoria precisa ser independente;
- a tarefa tem risco alto de misturar Figma e repo;
- ha publicacao ou PR.

Use o mesmo chat apenas para correcoes pequenas dentro da mesma role.

## Compatibilidade entre IAs

Cada IA usa o adapter em `docs/agents/adapters/`, mas todas devem obedecer aos mesmos artefatos da run. Se o runtime nao consegue criar threads/subagents, o owner pode rodar as roles sequencialmente no mesmo chat usando os comandos curtos.
