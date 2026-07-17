- Status: Aprovado para implementação repo-only

# Plano repo

- Figma aprovado: N/A; nenhuma alteração visual ou estrutural.
- Relatório Figma: `03-figma-build-report.md` e `04-figma-audit-report.md`, ambos N/A.
- Escopo: contrato de evidência executada, agregador App-ready, downgrade temporário
  dos seis runtimes, CI e documentação pública coerente.
- Fora de escopo: corrigir runtimes, CSS, tokens, Figma, baselines, pacote de APIs,
  versão, commit, push, PR ou release.

## Tokens

- Tokens Figma-canônicos: sem alteração.
- Tokens CSS-only: sem alteração.
- Component tokens: sem alteração.
- Registry e snapshot: somente gates de integridade; nenhuma regeneração Figma.

## Arquivos previstos

- Tests/scripts: requisitos, coleta efêmera, agregador, readiness, lifecycle,
  consumer smoke, API runtime e audit scenarios.
- Catálogo: seis `ds-runtime` temporariamente `experimental`, com blockers objetivos.
- Docs authored: README, guia consumidor, ADR-020 e CHANGELOG.
- API/LLM/inventário/ADR HTML: regenerados pelos scripts canônicos.
- CI/package scripts: `test:app-ready` e `test:audit-scenarios` como gates explícitos,
  sem inserir consumer smoke em `npm test`/`build:all`; `prepublishOnly` executa
  o gate completo porque `npm pack` não dispara esse lifecycle.

## Validações

- `npm run test:app-ready`
- `npm run test:audit-scenarios`
- `npm run build:all`
- `npm run verify:agent-docs`
- `npm run verify:tokens`
- `npm run agents:validate-run -- docs/agents/runs/2026-07-17-readiness-app-ready`
- Revisão independente do diff e dos testes negativos do gate.

## Bloqueado antes de

- Escrita repo: autorizada apenas para este plano.
- Commit: bloqueado até apresentação do diff e nova autorização.
- Push/PR: bloqueados até Release Agent e autorização explícita.
