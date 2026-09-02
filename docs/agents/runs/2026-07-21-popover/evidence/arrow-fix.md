# Popover Arrow — correção (2026-07-21)

## Rollback da gambiarra

Owner rejeitou anatomia com `Arrow Border` + `Arrow Fill` + `Arrow Seam`. Removido.

## Padrão atual (paridade Tooltip)

Igual Tooltip `191:11`: **um único VECTOR** `Arrow`, fill bindado, **sem stroke**, atrás do Panel.

| Campo | Valor |
|---|---|
| Tipo | `VECTOR` |
| Tamanho | 16×8 (`popover/arrow/base` → `space/lg`, `depth` → `space/sm`) |
| Fill | `popover/arrow/fill` → `surface/overlay` |
| Stroke | nenhum (como Tooltip) |
| Z-order | `Arrow` → `Panel` (base encaixada sob o panel) |
| Show Arrow | boolean no VECTOR |

### Variables

| Variable | Alias | ID |
|---|---|---|
| `popover/arrow/base/default` | `space/lg` (16) | `VariableID:10347:41` |
| `popover/arrow/depth/default` | `space/sm` (8) | `VariableID:10347:42` |
| `popover/arrow/fill/default` | `surface/overlay` | `VariableID:10319:20` |

Removidos após rollback: `popover/arrow/border-color`, `popover/arrow/border-width`, `popover/arrow/size`.

### Por que sem borda na seta

Tooltip também não tem stroke na seta. Contorno contínuo arrow+panel (um só path) exigiria união geométrica ou outro padrão aprovado — **não** seam/dual-triangle. Aguardando direção do owner se quiser borda integrada de verdade.
