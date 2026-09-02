# Contrato atual · Menu

- Snapshot: `.figma-snapshot.json`, gerado em 2026-08-28T08:35:08.535Z
- Figma: página `7973:2`, root `7983:87`, `issueCount=0`
- Variables: 39 paths `menu/*` e `action-menu/*`
- Web: App-ready em `docs/api/components.json`
- CSS: `css/components/menu.css`
- Runtime: `js/menu.js`, exportado por `ds-tis/menu`
- Tokens: `tokens/component/menu.json` e `tokens/component/action-menu.json`

## Anatomia pública

- `ds-action-menu`: composição posicionada com trigger e content.
- `ds-menu`: surface com size `sm`, `md` ou `lg` e opção full width.
- `ds-menu__item`: command, radio ou checkbox.
- Item pode conter icon/check, label, description/meta e shortcut.
- `ds-menu__separator`, group e label organizam itens.

## Comportamento Web verificado pelo contrato existente

- Open/close, click externo e retorno de foco.
- Setas, Home, End, typeahead e Escape.
- Item `aria-disabled` permanece focusable e não ativa.
- Radio e checkbox atualizam `aria-checked`.
- Eventos `ds-menu-open` e `ds-menu-close`.
- Lifecycle idempotente com init/destroy e re-init.

## Decisão do intake

O Web, o Figma e os tokens permanecem inalterados. Os adapters devem traduzir os
states de cada provider para as classes e tokens existentes sem imports cruzados.
