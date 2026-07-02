# Workflow para Product Designers

Este fluxo e a forma recomendada para designers pedirem novos componentes, ajustes de componentes ou evolucao de padroes no DS Core sem operar scripts, threads ou detalhes tecnicos de orquestracao.

O designer nao precisa rodar comandos no terminal. Quem roda scripts, cria run, aciona agents e organiza artefatos e o Orchestrator.

## Como iniciar

Use linguagem natural:

```txt
Preciso criar o componente Combobox no DS Core.
Comece pelo planejamento e depois seguimos para Figma.
```

Ou:

```txt
Preciso ajustar o Menu no Figma.
Planeje o ajuste, execute no Figma e depois audite antes de repo.
```

O Orchestrator deve responder com:

- run criada ou identificada;
- etapa atual;
- o que sera feito agora;
- o que esta bloqueado antes de aprovacao.

## Fluxo simplificado

```txt
1. Necessidade
2. Planejamento
3. Execucao no Figma
4. Auditoria Figma
5. Aprovacao do designer
6. Codificacao no repo
7. Testes e ajustes
8. Publicacao/web
```

## Responsabilidades por etapa

### 1. Necessidade

Designer descreve o problema:

- componente novo;
- ajuste de componente;
- melhoria visual;
- problema de uso;
- divergencia Figma x repo.

Exemplo:

```txt
Precisamos de um Combobox para busca e selecao, sem confundir com Select ou Menu.
```

### 2. Planejamento

O Orchestrator aciona DS Architect.

DS Architect deve:

- entender o problema;
- consultar DS Core no Figma;
- comparar componentes existentes;
- consultar referencias relevantes;
- propor anatomia, variants, states, slots e tokens;
- separar o que e Figma, repo e fora de escopo.

Designer aprova ou corrige o plano.

### 3. Execucao no Figma

O Orchestrator aciona Figma Builder.

Figma Builder deve:

- criar/editar na pagina correta do Figma;
- reutilizar componentes DS existentes;
- aplicar tokens e bindings;
- usar slots quando fizer sentido;
- manter padrao de pagina/documentacao;
- nao levar nada ao repo.

### 4. Auditoria Figma

O Orchestrator aciona Figma Auditor.

Figma Auditor deve auditar sem editar:

- variants;
- component properties;
- slots;
- tokens e bindings;
- instancias;
- text autoRename;
- focus ring;
- elevation;
- hardcodes;
- nos soltos na pagina.

Se falhar, volta para Figma Builder corrigir pontualmente.

### 5. Aprovacao do designer

Designer avalia o Figma.

Sem aprovacao visual, nao entra repo.

### 6. Codificacao no repo

O Orchestrator aciona Token Sync Agent e Repo Component Agent.

Eles devem:

- sincronizar tokens Figma -> JSON;
- criar component tokens quando necessario;
- implementar CSS/docs;
- usar exemplos com componentes reais do DS;
- manter Figma como fonte para categorias canonicas.

### 7. Testes e ajustes

Agentes rodam validadores e testes:

- `verify:tokens`;
- `verify:figma-structure`;
- `audit:component-tokens`;
- testes relevantes;
- a11y quando aplicavel.

### 8. Publicacao/web

O Release Agent so entra com autorizacao explicita:

```txt
Pode publicar esta run.
```

## O que o designer precisa aprovar

O designer aprova apenas gates importantes:

1. Brief/spec antes de Figma.
2. Figma visual/estrutural antes de repo.
3. Repo validado antes de publicar.

## O que o designer nao precisa fazer

Designer nao precisa:

- rodar `npm`;
- criar pastas manualmente;
- copiar prompt entre chats;
- saber qual checklist carregar;
- sincronizar tokens;
- validar JSON/CSS;
- montar prompt tecnico longo.

## Prompt unico recomendado

```txt
Inicie uma run de DS Core para [componente ou ajuste].
Conduza o fluxo para Product Designer: planeje, pare para minha aprovacao, execute no Figma, audite, pare para aprovacao visual e so depois leve ao repo.
Nao me peça para rodar comandos; rode o que for necessario e me traga os gates.
```

## Regra de experiencia

O designer conversa com o Orchestrator. O Orchestrator conversa com os agents.

```txt
Designer -> Orchestrator -> Agents -> Artefatos -> Orchestrator -> Designer
```

O protocolo tecnico em `docs/agents/protocol.md` continua existindo, mas deve ficar nos bastidores.
