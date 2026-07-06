# Figma Audit Report — Accordion, Combobox, Pagination

**Role:** Figma Auditor (read-only)  
**Data:** 2026-07-06  
**Snapshot:** `.figma-snapshot.json` (`generatedAt: 2026-07-06T09:32:41Z`, exporter `0.2.0`)  
**Gate:** `verify:figma-structure` → exit 0, `issues: 0`

## Resumo tripartite

| Componente | Contrato | Documentação | Visual | Status |
|---|---|---|---|---|
| Accordion | PASS | PASS (repo) / P2 (Figma doc) | BLOCKED | BLOCKED |
| Combobox | PASS | FAIL (repo) | BLOCKED | BLOCKED |
| Pagination | PASS | FAIL (repo) | BLOCKED | BLOCKED |

## Accordion

- Tokens: 28/28 Figma↔JSON
- Página: 1 frame raiz, 0 nós soltos
- Focus Ring dedicado, Lucide chevron
- P2 Figma: tabela de properties sem `Show Leading Icon` / `Leading Icon`
- P3 Figma: descrição do set ainda cita "Label" (API pública é `Title`)
- Repo: `test-accordion-docs.mjs` PASS

## Combobox

- Tokens: 16/16 Figma↔JSON; Field compartilhado OK
- P1 Repo: sem seção "API no Figma"
- P2 Repo: sem exemplo Read-only; classes `__clear` / `__icon` incompletas na tabela
- P3 Figma: descrição do set cita tokens inexistentes (`combobox/gap/*`)

## Pagination

- Tokens: 29/29 Figma↔JSON
- P1 Repo: doc usa `pagination.page.*` — canônico é `pagination.item.*`
- P1 Repo: sem seção API Figma (`Size`, `Page Number`)
- P2 Repo: mapeamento de tokens incompleto (typography, icon, estados)

## Fora de escopo (não bloqueia estes 3)

- `audit:component-tokens --strict-unused`: 15 issues em Button/Form Field typography (text styles vs bind)

## Próximas ações

1. Repo: corrigir `docs/pagination.html` (page → item)
2. Repo: API Figma em Combobox + Pagination
3. Figma: polish Accordion properties table
4. Owner: screenshots vs modelos (Input+Tabs, Select+Menu, Button+Breadcrumb)
