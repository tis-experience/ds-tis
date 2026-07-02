# Protocolo portatil de agents

Este protocolo define como qualquer IA deve conduzir trabalho multi-agent no DS Core. Ele e deliberadamente baseado em Markdown e scripts locais simples para nao depender de Codex, Claude, Gemini, Cursor ou outro runtime especifico.

## Principios

1. O repo e a fonte do processo.
2. Cada agente assume exatamente uma role por vez.
3. Cada role le um artefato de entrada e produz um artefato de saida.
4. Gates de aprovacao param o fluxo ate o owner aprovar.
5. Quem constroi nao aprova o proprio trabalho.
6. Ferramentas ajudam, mas nao substituem checklists e validadores.

## Entidades

### Run

Uma run e uma pasta versionavel ou local em `docs/agents/runs/<date>-<slug>/`.

Ela representa um trabalho fechado, como `combobox`, `action-menu`, `palette-feedback` ou `modal-hardening`.

### Role

Role e o contrato de comportamento do agente. Roles vivem em `docs/agents/roles/`.

Roles canonicas:

- DS Architect
- Figma Builder
- Figma Auditor
- Token Sync Agent
- Repo Component Agent
- Release Agent

### Checklist

Checklist transforma a role em verificacoes concretas. Checklists vivem em `docs/agents/checklists/`.

### Artefato

Artefato e um Markdown de entrada/saida entre agents. Artefatos devem ter path estavel e conteudo suficiente para a proxima role continuar sem copiar texto do chat.

## Estrutura de run

```txt
docs/agents/runs/YYYY-MM-DD-slug/
  run.md
  state.json
  01-brief.md
  02-figma-spec.md
  03-figma-build-report.md
  04-figma-audit-report.md
  05-repo-sync-plan.md
  06-repo-implementation-report.md
  07-release-report.md
  evidence/
```

Arquivos podem ficar como `Pendente` ate a role correspondente preencher.

## Estado da run

`run.md` e a versao legivel por humanos. A **fonte verificavel por maquina** e o
`state.json`, e e ele que o porteiro de gates consulta.

`state.json` declara, por gate: `status` (`pending`, `in_progress`, `done`,
`blocked`, `approved`), `requires` (gates que precisam estar `approved` antes),
`needsOwnerApproval` e `ownerApproval`. Tambem guarda `figmaSnapshot` (snapshot
datado compartilhado entre roles) e `checks` (exit codes dos validadores).

Regra do porteiro: um gate so pode iniciar quando todos os seus `requires` estao
`approved`. Nenhuma aprovacao de um gate vira autorizacao para os proximos.

### Evidence ledger

`evidence/` guarda toda prova factual da run: dumps de no, screenshots do alvo e
dos modelos vivos, e saidas de validador. Vale a regra de `grounding.md`: nao
afirme um fato do Figma que voce nao leu nesta sessao e nao persistiu aqui.

### Grounding obrigatorio

Toda role le `docs/agents/grounding.md` antes de agir. Ele consolida as regras
anti-alucinacao: contagem nao e prova, binding validado por propriedade, icone
inspecionado no vetor interno, foco no Focus Ring, documentacao derivada da API,
protocolo de recuperacao pos-rejeicao e status tripartite.

## Gates

| Gate | Dono | Entrada | Saida | Bloqueia |
|---|---|---|---|---|
| Brief/spec | DS Architect | demanda | `01-brief.md`, `02-figma-spec.md` | Figma write |
| Draft Figma | Figma Builder | spec aprovada | `03-figma-build-report.md` | repo sync |
| Auditoria Figma | Figma Auditor | spec + build report | `04-figma-audit-report.md` | repo sync |
| Sync tokens | Token Sync Agent | Figma aprovado | `05-repo-sync-plan.md` e diff token | CSS/docs |
| Repo | Repo Component Agent | tokens aprovados | `06-repo-implementation-report.md` | release |
| Release | Release Agent | repo validado | `07-release-report.md` | producao |

## Regras de handoff

Todo handoff deve incluir:

```md
Role:
Checklist:
Run:
Artefatos de entrada:
Artefato de saida esperado:
Bloqueado antes de:
```

Nunca dependa apenas do historico do chat. O proximo agente deve conseguir continuar lendo a run e os documentos canonicos.

## Ferramentas

Ferramentas sao adapters, nao fonte de verdade.

- Figma MCP: le/escreve Figma quando a role permitir.
- Product Design: apoia critique, UX, hierarquia e exploracao visual.
- GitHub/Git: PR, CI, release.
- Scripts do repo: validam tokens, docs e runs.

Se a ferramenta nao existir em um runtime, o agente deve declarar a limitacao e usar o fallback documentado no adapter correspondente.

## Comandos neutros

```bash
npm run agents:create-run -- --slug combobox --title "Combobox"
npm run agents:validate-run -- docs/agents/runs/YYYY-MM-DD-combobox
npm run agents:next-step -- docs/agents/runs/YYYY-MM-DD-combobox

# Porteiro de gates e estado verificavel
npm run agents:gate -- docs/agents/runs/YYYY-MM-DD-combobox
npm run agents:gate -- docs/agents/runs/YYYY-MM-DD-combobox --set figma-build --status in_progress
npm run agents:gate -- docs/agents/runs/YYYY-MM-DD-combobox --approve brief --note "owner OK"
npm run agents:gate -- docs/agents/runs/YYYY-MM-DD-combobox --record-check verify:figma-structure --exit 0

# Contrato Figma como artefato executavel (rode antes do handoff ao Builder)
npm run agents:validate-matrix -- docs/agents/runs/YYYY-MM-DD-combobox/contract-matrix.md --strict-exceptions
```

Esses comandos nao chamam nenhuma IA. Eles apenas criam, validam e orientam a run.

## Gate de Figma Build (resumo executavel)

1. DS Architect produz a matriz de contrato a partir de `templates/figma-contract-matrix.md`.
2. `agents:validate-matrix --strict-exceptions` precisa passar (`unmappedRows=0`,
   sem exceptions sem aprovacao) antes de o gate `brief` ser aprovado.
3. Figma Builder executa a matriz linha a linha; nada fora da matriz.
4. Apos a escrita, regenerar snapshot e rodar `verify:figma-structure`; o exit code
   vai para `state.json` via `agents:gate --record-check`.
5. Builder reporta status tripartite (contrato/documentacao/visual). Qualquer um
   `bloqueado` impede o handoff ao Auditor.
