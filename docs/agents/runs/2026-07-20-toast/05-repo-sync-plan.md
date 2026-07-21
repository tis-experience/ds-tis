# Repo Sync Plan — Toast

- Status: pronto para execução (Token Sync → Repo)
- Data: 2026-07-20

## Origem Figma

- Página `10279:2544`, set `10279:2508`, vars `toast/*` → Semantic
- Defaults: Subtle only, bottom-right, sem auto-hide com action

## Escopo repo

1. `semantic.z.toast` → `{foundation.z.50}` (light/dark) + registry
2. `tokens/component/toast.json` espelhando vars Figma (subtle)
3. `css/components/toast.css` + index
4. `js/toast.js` + export `ds-tis/toast`
5. Catálogo: Experimental → App-ready após evidência; `ds-runtime` required
6. `docs/toast.html`; Alert/Modal: remover “Toast — futuro”
7. Testes lifecycle/consumer/interactive/app-ready requirements
8. CHANGELOG `[Não publicado]`; sem bump

## Não fazer

- Popover; bump 1.1.0; commit/push sem pedido
