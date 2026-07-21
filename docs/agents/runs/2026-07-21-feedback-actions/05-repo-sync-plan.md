# Repo Sync Plan

- Run: `2026-07-21-feedback-actions`
- Data: 2026-07-21

## Tokens novos (Figma → JSON)

| Figma | JSON | Alias | CSS |
|-------|------|-------|-----|
| `alert/actions/padding-top/default` | `component.alert.actions.padding-top.default` | `semantic.space.sm` (8px) | `--ds-alert-actions-padding-top-default` |
| `toast/actions/padding-top/default` | `component.toast.actions.padding-top.default` | `semantic.space.sm` (8px) | `--ds-toast-actions-padding-top-default` |

## Consumidores

- Figma: `paddingTop` em todos os frames `Actions` (Alert + Toast)
- CSS: `.ds-alert__actions` / `.ds-toast__actions`

## Status

Executado — ver `06-repo-implementation-report.md`.
