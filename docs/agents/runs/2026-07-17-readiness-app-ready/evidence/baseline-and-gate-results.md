# Evidência — baseline e gate App-ready

- Data: 2026-07-17
- Branch: `fix/readiness-gate-evidencia`
- Escopo: PR 1 repo-only; sem Figma, tokens, CSS, baselines, commit, push ou PR.

## Baseline antes da implementação

- `npm run agent:preflight`: branch `main`, worktree limpa, `verify:tokens`
  sem erros e snapshot Figma recente.
- `test:readiness`: 23 componentes, 21 App-ready, 2 Composição, 0 Experimental.
- `test:audit-scenarios`: 1504 checks.
- Lifecycle e consumer smoke eram happy paths sem ledger completo por
  slug/capability.

## Provas negativas do gate

- Promoção sintética de Modal sem evidência: bloqueada.
- Promoção sintética com todos os cases: aceita.
- Remoção de um único case (`init-component-root`): bloqueada.
- Suite consumer tentando creditar `keyboard`: rejeitada.
- Baseline visual ausente em modo normal: exit 1; nenhuma baseline criada.
- `CI=true test:app-ready -- --skip-visual`: exit 2; bypass rejeitado.
- `test:app-ready -- --release --skip-visual`: exit 2; publicação não aceita o bypass.
- Catálogo alterado antes de regenerar a API: readiness detectou 12 drifts.

## Resultado atual

- Readiness público: 15 App-ready, 2 Composição e 6 Experimentais.
- `test:readiness:evidence`: 7 checks, passou.
- `test:runtime-lifecycle`: 56 checks, passou.
- `test:consumer-smoke`: 23 checks no tarball real, passou.
- Ledger: 2 relatórios efêmeros, schema e ownership de suites validados.
- A11y estrito das 23 páginas de componentes: 46 runs, zero violações.
- `build:all`: passou; `verify:tokens` com 0 erros e 0 avisos.
- `test:audit-scenarios`: 1548 checks, passou.
- `test:audit-scenarios:ci`: 1541 checks, passou sem snapshot local.
- `verify:registry`: 1227 entries completas.
- `verify:agent-docs`: passou.
- `agents:validate-run`: passou antes do fechamento do relatório.
- Revisões independentes finais de arquitetura/testes e de docs/release: PASS,
  sem P0/P1 remanescente.

## Blockers preservados

1. `test:app-ready` padrão chega ao visual estrito e falha em 18/78
   screenshots Darwin por mudança de altura em Accordion, Combobox, Input,
   Menu, Modal, Select, Tabs, Textarea e Tooltip. Nenhuma baseline foi alterada.
2. O scan global estrito via HTTP revelou 16 nós de contraste sério em
   `docs/theme-playground.html` dark. Essa página não integra as 23 páginas de
   componentes do gate de promoção; correção visual/CSS fica em PR separado.
3. Os seis runtimes continuam Experimentais até cada matriz completa passar.
4. `package.json` está em beta.6 e o lockfile ainda registra beta.5, drift
   preexistente reservado ao PR de release/beta.7.
5. CI Linux real depende de PR/push, ainda não autorizados pelo owner.
