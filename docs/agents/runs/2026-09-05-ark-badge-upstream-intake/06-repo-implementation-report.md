# Implementação — Badge Ark

- Status: Independent review passed — Orchestrator autorizou commit local; integração posterior ainda pendente.
- Role: Repo Component Agent
- Checklist: `docs/agents/checklists/repo-implementation-checklist.md`
- Data: 2026-09-05
- Branch/base: `codex/ark-badge` / `0338ec8`

## Resultado

A implementação iniciada foi preservada: adapter Ark Factory em span com seis tons e dois estilos, stories Playground/Tones/InContext, documentação PT/EN, catálogo das quatro saídas e budgets/testes. Não foi necessário alterar o adapter após as validações.

A cópia de acessibilidade já presente em ComponentDocumentationPage descreve Badge informativo, controles Input/Textarea nativos e Alert contextual. CSS, tokens, JS Web, Angular e registry React permanecem sem diff.

## Comandos com encerramento confirmado

| Comando | Exit | Evidência |
| --- | --- | --- |
| `npm run agent:preflight` | 0 | 13 dirty iniciais, snapshot ausente |
| `npm run build:api` | 0 | 26 componentes, 1595 tokens, 23 ADRs |
| `npm run build:docs:vnext:pages` | 0 | Portal PT/EN copiado preservando Storybooks |
| `npm run build:storybook:vnext:pages` | 0 | Stories Badge geradas; aviso conhecido de chunks grandes do shell Storybook |
| `npm run test:vnext` | 0 | Fundação, intake, bundle e registry |
| `npm run test:vnext:browser` | 0 | Portal, Storybook, Docs/Controls, 320/390, dark e Axe |
| `npm run verify:tokens` | 0 | 1595 tokens; 0 erros/avisos; Figma SKIP |
| `node /private/tmp/ds-tis-badge-qa.mjs` | 0 | 6 cenários, 5 screenshots, 0 console errors |
| `npm run agents:validate-intake -- docs/agents/runs/2026-09-05-ark-badge-upstream-intake/upstream-intake.json` | 0 | Manifesto v3 com quatro saídas |
| `npm run agents:validate-run -- docs/agents/runs/2026-09-05-ark-badge-upstream-intake` | 0 | Estrutura da run e state válidos |
| `git diff --check` | 0 | Sem whitespace errors |
| `npm run build:tokens && npm run sync:docs && npm run build:api && npm run build:llms && npm run verify:tokens && git diff --check` | 0 | Gate pré-commit repetido; tokens/CSS sem diff; inventário/LLM atualizados para 17 Ark |

Badge incremental: **0,99 KiB gzip**, **2,00 KiB minificado**, orçamento **3 KiB gzip**, React/ReactDOM externos.

## QA renderizado

Browser plugin not available; Playwright existente no projeto utilizado conforme skills frontend-testing-debugging/playwright. Ambiente: `http://127.0.0.1:4179/ds-tis/next/pt-br/ark/components/badge/`, Chromium, stories em 1280×800 e 320×720, portal 390×844.

| Verificação | Resultado |
| --- | --- |
| Identidade / conteúdo | H1 Badge, URL Ark e conteúdo real presentes |
| Framework overlay / console | Nenhum erro no QA pontual; suíte global passou |
| Contrato visual | 12 pares tone/variant; span, texto não vazio, sem role ou tab stop implícitos |
| Light/dark | Matriz completa nos dois temas, Axe zero em quatro capturas |
| Responsividade | Overflow horizontal zero em 320/390 |
| Seletor | Ark → HTML/CSS/JS → Ark; quatro saídas habilitadas |
| Consumer | Ref SPAN, className/title/data-* preservados |
| Atualização/lifecycle | Enter no button do consumidor muda Pendente → Aprovada; Tab ignora Badge; unmount limpa ref para null |

Capturas inspecionadas individualmente: labels legíveis, grupos quebram linha no mobile, sem sobreposição/clipping. Arquivos em `/private/tmp/ds-tis-badge-qa/`: `badge-tones-desktop-light.png`, `badge-tones-desktop-dark.png`, `badge-tones-mobile-light.png`, `badge-tones-mobile-dark.png`, `badge-portal-mobile.png`; dados completos em `results.json`.

## Limitações e achados globais

- A primeira execução browser/preview falhou com EPERM do sandbox; repetição autorizada fora do sandbox passou. O script temporário de QA foi corrigido para usar browser.newContext exigido por Axe e rótulos reais no seletor; sem defeito de produto associado.
- Figma não foi lido; snapshot ausente. Não há prova nova de bindings nem drift Figma↔JSON.
- `docs/api/tokens-sync.json` preserva SKIP verdadeiro. O gerador atual ainda apresenta “Em dia” no HTML quando Figma é SKIP; achado global comunicado ao Orchestrator, correção a cargo da frente separada `token_report_truth`. Nenhum restauro de evidência antiga foi feito.
- Não houve teste de leitor de ecrã, Safari/Firefox ou SSR/hydration dedicado nesta run. A validação consumer foi de mount/update/unmount no Chromium.
- Biblioteca privada de workspace; commit local autorizado após revisão independente. Nenhum npm público, push, PR, merge, bump ou publicação nesta rodada.
- Integração da Alert mais recente será conduzida pelo Orchestrator após review, com reexecução dos gates afetados.

## Arquivos

13 arquivos iniciais de Badge preservados: CHANGELOG, ComponentDocumentationPage, component-documentation, API components/consumer-context, package React, catálogo de tecnologias, browser/bundle tests, dois MDX, adapter e story. Acrescentados run/manifesto/evidência Markdown. verify:tokens regenerou os dois relatórios tokens-sync com estado atual.

Revisão independente read-only por `/root/ark_pending_review`: sem finding funcional ou blocker; source, API, docs, results.json e cinco capturas inspecionados. Ver `evidence/independent-review.md`.

Bloqueado antes de: integração do Alert atualizado pelo Orchestrator e autorização de push/PR/publicação.
