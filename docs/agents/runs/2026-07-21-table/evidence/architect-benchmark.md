# Evidence — Table DS Architect (2026-07-21)

## Preflight / git

- Branch: `feat/table` (worktree `ds-tis-feat-table`) from `origin/main` @ `ecd72fe`
- Workspace principal `codex/storybook` dirty (Storybook, Popover run, etc.) — fora de escopo
- Snapshot Figma: ausente no worktree (ok até Token Sync)

## Inventário / docs

- `docs/component-inventory.md`: pendentes **Table, Toast, Popover**
- Card docs: “dados tabulares densos → use table row”
- Pagination: readiness composition / behavior consumer
- Figma search `Table`: nenhum component set do DS; apenas Lucide `table*`

## Benchmark (resumo)

| Fonte | Takeaway |
|-------|----------|
| APG Table / Sortable Table | HTML table + aria-sort; não grid |
| APG Grid | Fora do MVP |
| Carbon Data Table | Camadas (selection, expansion, toolbar) — MVP só core + composição |
| Polaris Data/Index Table | Lógica sort/filter/page na app |
| DS Pagination/Card/Divider/Menu | Modelos de página e composição |

## Classificação proposta

- readiness: composition
- behaviorModel: consumer
- runtime: none (MVP)
