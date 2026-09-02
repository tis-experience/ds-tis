- Status: Passed read-only

# Figma Audit Report

- Componente: Menu / Action Menu
- Página: `7973:2`
- Node principal: `7983:87`
- Spec usada: `02-figma-spec.md` unchanged
- Páginas modelo: não aplicável; nenhuma página ou component set foi alterado
- Auditor: Figma Auditor (read-only)
- Data: 2026-08-28

## Passou

- topLevelCount: estrutura detectada pelo snapshot
- root: frame vertical `Menu`
- variants: sem mudança
- component properties: sem mudança
- slots: sem mudança
- token binds: 39 variables `menu/*` e `action-menu/*` disponíveis
- text autoRename:
- instance name mismatches:
- hardcoded fills/strokes:
- icon bindings:
- focus ring:
- elevation:
- loose nodes: nenhum issue registrado na página
- documentation text fixed height:
- documentation frames clipsContent:
- model parity: contrato visual existente preservado

## Falhou

| Severidade | Item | Evidencia | Node IDs | Correcao sugerida |
|---|---|---|---|---|
| — | Nenhuma falha no escopo unchanged | `issueCount=0` | `7973:2`, `7983:87` | — |

## Contagens

- Variants esperadas/encontradas: sem mudança
- Slots esperados/encontrados:
- Binds esperados/encontrados: 39 variables de Menu/Action Menu no snapshot
- Textos autoRename true/total:
- Textos documentais com altura fixa indevida:
- Frames documentais com clipsContent=true:
- Divergencias contra paginas modelo:
- Instance mismatches:
- Hardcoded fills/strokes:
- Loose nodes: 0 issues registrados
- Variables novas sem WEB code syntax:
- Component variables sem uso:

## Bloqueado antes de

- Figma aprovado: sim, unchanged
- Repo sync: autorizado somente para adapters/docs/tests
- Commit/push: bloqueado
