# Release Report

- Status: Pronto para commit/PR (sem bump/publish)
- Escopo: Feedback Actions (Alert+Toast Figma/repo) + Toast Experimental na branch `feat/toast`; polish Toast deferido pelo owner
- Branch: `feat/toast`
- Commit/PR: ainda não criado — aguarda pedido explícito do owner
- Publicacao: **não** nesta etapa (SemVer minor `1.1.0` continua candidato na publicação futura)

## Comandos rodados

- `npm run build:tokens` — OK
- `npm run verify:tokens` — 0 erros (VALUE_DRIFT=0, DRIFT_FROM_SOURCE=0)
- Docs locais servidas em `http://localhost:4173` (preview owner)

## Resultado

- build: tokens OK
- verify:tokens: OK (2 warnings registry migração)
- verify:registry: não reexecutado isolado; registry atualizado com padding-top
- verify:figma-structure: não exigido para este handoff (sem snapshot structure regenerado)
- tests: não rodados em massa nesta etapa Release
- CI: n/a até push/PR
- prod: n/a

## Diff (resumo)

- **Figma (vivo):** Actions nested Button Ghost/Sm; cores `action/color/*`; `actions/padding-top/default` (8px)
- **Tokens:** `alert|toast` Component (actions, colors, padding-top); Semantic `z.toast` se já na branch
- **CSS:** `alert.css`, `toast.css`, generated tokens
- **Docs/API:** alert/toast HTML, CHANGELOG `[Não publicado]`, inventários/API derivados
- **Runtime:** `js/toast.js`, catálogo Experimental
- **Runs:** `2026-07-20-toast`, `2026-07-21-feedback-actions`

## Pendencias

- Melhorias Toast (owner): ajuste posterior, não bloqueia
- Commit + PR quando owner pedir
- Regenerar snapshot Figma via plugin (vars padding-top já no arquivo Figma; patch local no `.figma-snapshot.json`)
- Bump `1.1.0` + `release:figma-evidence` só na publicação
- App-ready do Toast: fora desta release parcial

## Decisão pedida ao owner

1. Posso **commitar** e abrir **PR** em `feat/toast`?
2. Título sugerido: `feat(toast): feedback transitório + Actions Alert/Toast no Figma e CSS`
