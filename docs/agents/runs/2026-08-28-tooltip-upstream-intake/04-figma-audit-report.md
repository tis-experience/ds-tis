- Status: Passed unchanged

# Figma Audit Report

- Componente: Tooltip
- Página: `191:2`
- Node principal: `194:39`
- Spec usada: `02-figma-spec.md`
- Paginas modelo:
- Auditor: auditoria read-only do snapshot exportado
- Data: 2026-08-28

## Passou

- topLevelCount: preservado
- root: detectado como FRAME vertical
- variants:
- component properties:
- slots:
- token binds: 11 Component variables presentes, aliases Semantic e WEB code syntax
- text autoRename:
- instance name mismatches:
- hardcoded fills/strokes:
- icon bindings:
- focus ring:
- elevation:
- loose nodes: zero issues na página
- documentation text fixed height:
- documentation frames clipsContent:
- model parity: página Tooltip detectada e sem issue estrutural

## Falhou

| Severidade | Item | Evidencia | Node IDs | Correcao sugerida |
|---|---|---|---|---|
| — | Nenhuma falha do componente no snapshot atual | `pageSummary.issueCount=0` | `191:2`, `194:39` | — |

## Contagens

- Variants esperadas/encontradas:
- Slots esperados/encontrados:
- Binds esperados/encontrados:
- Textos autoRename true/total:
- Textos documentais com altura fixa indevida:
- Frames documentais com clipsContent=true:
- Divergencias contra paginas modelo:
- Instance mismatches:
- Hardcoded fills/strokes:
- Loose nodes:
- Variables novas sem WEB code syntax: zero
- Component variables sem uso: nenhuma variável nova; o intake não altera tokens

## Bloqueado antes de

- Figma aprovado: unchanged with evidence
- Repo sync: adapters/docs/testes autorizado
- Commit/push: bloqueados
