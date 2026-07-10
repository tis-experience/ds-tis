# Repo Implementation Report

**Role:** Repo Component Agent  
**Data:** 2026-07-06

## Scorecard

| Componente | CSS/Tokens | Docs | Testes | Global |
|---|---|---|---|---|
| Accordion | 4/5 | 4/5 | 3/5 | ~4/5 |
| Combobox | 3.5/5 | 4/5 | 2/5 | ~3.5/5 |
| Pagination | 5/5 | 3/5 | 2/5 | ~3.5/5 |

## P0 — antes do beta.6

1. `docs/pagination.html` — corrigir `pagination.page.*` → `pagination.item.*`
2. `tests/visual/baseline/` — ausente no workspace; CHANGELOG cita baselines

## P1

3. `docs/combobox.html` — API Figma, readonly, classes `__clear`/`__icon`
4. `css/components/combobox.css` — `max-block-size: 16rem` hardcoded; focus em `.ds-combobox__option`
5. Novos gates: `test-combobox-docs.mjs`, `test-pagination-docs.mjs`

## P2

6. `docs/accordion.html` — `ds-dodont`, diretrizes, classe disabled na tabela
7. `scripts/sync-docs.mjs` — milestones stale (Combobox/Pagination ainda "pendentes")
8. `CHANGELOG.md` — dedup Accordion; revisar claim de baselines

## Navegação

Accordion, Combobox e Pagination presentes em `js/main.js` e `index.html`. CSS em `css/components/index.css`.

## Comandos de verificação

```bash
npm run build:all
node scripts/test-accordion-docs.mjs
npm run test:a11y -- --filter accordion
npm run test:a11y -- --filter combobox
npm run test:a11y -- --filter pagination
npm run verify:tokens
```
