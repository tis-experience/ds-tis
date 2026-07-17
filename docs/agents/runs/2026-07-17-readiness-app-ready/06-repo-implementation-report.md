# Repo Implementation Report

- Status: Aprovado pelo owner em 2026-07-17
- Componente/padrão: Gate de promoção App-ready para `ds-runtime`
- Run: `2026-07-17-readiness-app-ready`
- Agent: Codex — Repo Component Agent
- Data: 2026-07-17

## Entrada

- Figma aprovado: N/A repo-only; nenhuma escrita ou auditoria Figma.
- Token sync: N/A; nenhuma mudança em tokens, CSS gerado ou snapshot.
- Plano repo: `05-repo-sync-plan.md`, aprovado após o gate do brief.

## Arquivos alterados

- CSS: sem alteração.
- Docs: README, guia consumidor, ADR-020, processo/checklist de release e run.
- API/LLM: componentes, inventário, HTMLs e `llms-full.txt` regenerados.
- Tests: requisitos por slug, ledger efêmero, agregador, readiness, lifecycle,
  consumer smoke, a11y estrito por componente, visual estrito, API e auditoria.
- CHANGELOG: gate executável e downgrade temporário dos seis runtimes; removidas
  afirmações contraditórias de promoção na mesma seção Não publicado.

## Decisões de implementação

- `component-catalog.mjs` continua sendo a fonte da classificação pública;
  Accordion, Combobox, Modal, Menu, Tabs e Tooltip retornam a Experimental.
- O registro declara 15 capabilities e case IDs obrigatórios por slug. Runners
  só creditam sua própria suite e somente depois da assertion passar.
- `test:app-ready` cria ledger novo, cruza evidência executada, roda scan a11y
  estrito das 23 páginas de componentes e visual estrito.
- `prepublishOnly` roda `test:app-ready`; `npm pack` não dispara esse lifecycle,
  portanto consumer smoke não recursa. `prepack`/`prepare` permanecem livres.
- CI usa auditoria reproduzível sem o snapshot Figma gitignored; a auditoria
  local preserva os checks de Component tokens e estrutura Figma.
- Baseline ausente falha em modo normal e só pode ser criada com `--update`.
- `--skip-visual` segue disponível para diagnóstico local conhecido, mas é
  rejeitado em CI e no modo `--release`; checklist de release exige execução estrita.

## Validação

- build:tokens: passou como parte de `build:all`.
- sync:docs: passou; derivados públicos regenerados.
- verify:tokens: passou, 0 erros e 0 avisos.
- verify:registry: passou, 1227 entries completas.
- tests: ver `evidence/baseline-and-gate-results.md`. Gates funcionais, pacote,
  auditoria e a11y de componentes passam; visual Darwin permanece bloqueante.

## Pendências

- Corrigir e provar os seis runtimes em PRs separados antes de qualquer
  re-promoção.
- Revisar as 18 baselines Darwin em PR próprio; não houve `--update` nesta run.
- Corrigir contraste global de `theme-playground` dark fora deste escopo.
- Sincronizar versão do lockfile somente no PR de release autorizado.
- Executar CI Linux após autorização para push/PR.

## Bloqueado antes de

- Release: gate Repo requer aprovação explícita do owner. Commit, push, PR,
  baseline update, correção de runtime e release continuam bloqueados.
