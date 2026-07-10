# Repo Sync Plan — Token Sync Agent

**Role:** Token Sync Agent  
**Data:** 2026-07-06  
**Snapshot:** `.figma-snapshot.json` (promovido de `figma-snapshot.json`)

## Componentes recentes — paridade tokens

| Componente | Tokens | Drift |
|---|---:|---|
| Accordion | 28 | 0 |
| Combobox | 16 | 0 |
| Pagination | 29 | 0 |
| Field (shared) | 34 | 0 |
| Menu (shared) | 38 Figma | 0 valor |

**Conclusão:** Accordion, Combobox e Pagination não precisam de sync de tokens Component.

## Bloqueador global (12 erros `verify:tokens`)

Rename Figma: `overlay/blue-*` → `overlay/brand-*` (valores RGBA idênticos).

| Tipo | Qtd |
|---|---:|
| VALUE_DRIFT | 6 (`semantic.toned.background.*`) |
| DRIFT_FROM_SOURCE | 6 (`foundation.color.overlay.blue-*` no JSON) |
| NEEDS_SYNC | 6 (`foundation.color.overlay.brand-*` no Figma) |

**`sync:tokens-from-figma:write` sozinho não resolve** — exige rename manual em foundation + registry antes do write.

## Sequência aprovada pelo owner

```bash
# 1. Manual: tokens/foundation/colors.json
#    overlay/blue-600/{12,20,28} → overlay/brand-600/{12,20,28}
#    overlay/blue-400/{15,25,32} → overlay/brand-400/{15,25,32}
# 2. Manual: tokens/registry.json (6 foundation + 3 semantic references)

npm run sync:tokens-from-figma:write
npm run verify:tokens   # meta: 0 erros
```

## Snapshot

- Canonical: `.figma-snapshot.json` (gitignored)
- `figma-snapshot.json` sem ponto removido após promoção
