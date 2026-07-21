# Repo Implementation Report — Toast

- Status: feito (Experimental)
- Role: Repo Component Agent
- Data: 2026-07-20

## Entregue

| Área | Arquivos |
|------|----------|
| Tokens | `tokens/component/toast.json`, `semantic.z.toast` (light/dark), registry (+31 toast) |
| CSS | `css/components/toast.css` + import em `index.css` |
| JS | `js/toast.js` — `initToasts` / `destroyToasts` / `showToast` / `dismissToast` |
| Package | exports `ds-tis/toast` |
| Catálogo | Toast Experimental, `ds-runtime` required |
| Docs | `docs/toast.html`; Alert/Modal linkam Toast |
| Testes | lifecycle (toast cases), interactive contract, consumer bare-import, a11y toast.html |
| CHANGELOG | `[Não publicado]` — candidato minor `1.1.0` |

## Figma

- Página `10279:2544`, set `10279:2508`
- Vars `toast/*` no snapshot (freshed)

## Gates executados

- `verify:tokens` — 0 erros
- `test:runtime-lifecycle` — PASS
- `test:consumer-smoke` — PASS
- `test:app-ready --skip-visual` — PASS (Toast permanece Experimental; promoção App-ready do Toast fica para evidência dedicada + visual CI)

## Pendências

1. Promover Toast a App-ready quando lifecycle/consumer cobrirem 100% dos cases comuns + visual baseline.
2. Wire `Action Label` no Figma ao Button nested (limitação conhecida).
3. Bump/publish — fora de escopo.
