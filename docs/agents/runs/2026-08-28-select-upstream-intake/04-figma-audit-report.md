- Status: Approved unchanged

# Figma Audit Report

- Componente: Select
- Página: `145:2`
- Node principal: frame raiz `146:20`
- Spec usada: `02-figma-spec.md`
- Páginas modelo: Select e Menu no snapshot atual
- Auditor: Figma Auditor, read-only
- Data: 2026-08-28

## Passou

- topLevelCount: frame raiz detectado
- root: auto-layout vertical, padding 96 e gap 64 por Semantic tokens
- variants:
- component properties:
- slots:
- token binds: 38 Component variables `select/*`; `verify:tokens` sem drift
- text autoRename:
- instance name mismatches:
- hardcoded fills/strokes:
- icon bindings:
- focus ring:
- elevation:
- loose nodes: nenhum issue reportado para a página
- documentation text fixed height:
- documentation frames clipsContent:
- model parity: página `Select` com `issueCount=0`

## Falhou

| Severidade | Item | Evidencia | Node IDs | Correcao sugerida |
|---|---|---|---|---|
| — | Nenhuma falha acionável no escopo | `.figma-snapshot.json` | `145:2`, `146:20` | — |

## Contagens

- Variants esperadas/encontradas: preservadas; sem alteração proposta
- Slots esperados/encontrados:
- Binds esperados/encontrados: 38 variables `select/*` presentes
- Textos autoRename true/total:
- Textos documentais com altura fixa indevida:
- Frames documentais com clipsContent=true:
- Divergencias contra paginas modelo:
- Instance mismatches:
- Hardcoded fills/strokes:
- Loose nodes: 0 issues de página
- Variables novas sem WEB code syntax:
- Component variables sem uso:

## Bloqueado antes de

- Figma aprovado: sim, unchanged
- Repo sync: autorizado para adapters, docs e testes
- Commit/push: bloqueado
