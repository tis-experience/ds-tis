# Matriz documental — Popover (clonar padrões vivos)

> Obrigatória antes da escrita. Fonte: dump 2026-07-21 Tooltip `194:39`, Modal `155:370`, Alert `155:134`.

## Modelos

| Modelo | Root | Pad/Gap bound | BG | Divider fill |
|---|---|---|---|---|
| Tooltip | `194:39` | pad `17:26` space/section/xl; gap `17:24` space/section/md | `12:2` background/default | `2486:3` overlay/default |
| Modal | `155:370` | idem | idem | idem |
| Alert | `155:134` | idem | idem | idem |

## Text styles + variables (obrigatório em toda doc Popover)

| Papel | textStyleId | fill | fontSize | fontStyle | fontFamily | letterSpacing | lineHeight | Evidência |
|---|---|---|---|---|---|---|---|---|
| Page title | `S:ed318dc98074d72a3fd91635a2383e1996be7bca` | `14:2` content/strong | `3546:2` | `3273:6` Bold | `3273:2` | `3273:8` | `3546:8` | Tooltip `194:41`, Modal `155:372` |
| Description | `S:9a82f054b702bf8d450a0c3c5092b0ab689e638c` | `14:2` | `3273:11` | `3273:3` Regular | `3273:2` | `3273:7` | `3273:18` | Tooltip `194:42` |
| Section title | `S:9d32fb965c3a161a6cf03ae0f4f8dfd67e6252a5` | `14:2` | `3273:13` | `3273:5` Semi Bold | `3273:2` | `3273:7` | `3273:19` | Tooltip `194:3` |
| Table header | `S:856deee7cf6cd874e5e18e31f8da69b5a5b92e93` | `14:2` | `3273:9` | `3273:6` Bold | `3273:2` | `3273:7` | `3273:16` | Tooltip `194:6` |
| Table cell / variant-desc | `S:9a82f054b702bf8d450a0c3c5092b0ab689e638c` | `14:2` | `3273:11` | `3273:3` | `3273:2` | `3273:7` | `3273:18` | Tooltip rows |

## Layout tokens de página

| Parte | figmaProperty | variableId | nome |
|---|---|---|---|
| root | padding* | `17:26` | space/section/xl |
| root | itemSpacing | `17:24` | space/section/md |
| root | fills | `12:2` | background/default |
| header | itemSpacing | `3440:5` | space/md |
| section-variantes | itemSpacing | `3440:7` | space/xl |
| col-header | paddingBottom | `3440:4` | space/sm |
| table row | paddingTop/Bottom | `3440:5` | space/md |
| divider | fills | `2486:3` | overlay/default |

## Estrutura de seções alvo (ordem Tooltip/Modal)

1. `header` (title + description)
2. `divider`
3. `section-propriedades` (tabela Propriedade/Tipo/Padrão/Descrição)
4. `section-variantes` (section-title + variant-desc + component set)
5. `section-acessibilidade` (tabela Critério/Nível/Implementação)
6. `section-diferencas` (tabela opcional, mesmo estilo de propriedades) — extra vs Tooltip; usar padrão de tabela Modal

`clipsContent`: root/section-variantes = false; header e seções de tabela = true (como modelos).

## Mapa Popover → modelo

| part Popover | targetNode | modelo | binding/style |
|---|---|---|---|
| root pad/gap/bg | `Popover` root | Tooltip `194:39` | `17:26`, `17:24`, `12:2` |
| title | `header/title` | `194:41` | textStyle page title + binds |
| description | `header/description` | `194:42` | textStyle description + binds |
| page divider | `divider` | `194:43` | fill `2486:3` |
| props section title | `section-propriedades/section-title` | `194:3` | section title style |
| props col-header | `…/col-header/*` | `194:5` | table header style |
| props rows | Size, Placement, Title, Show*, Close Icon, Show Arrow | `194:11` pattern | cell style |
| variantes title/desc | `section-variantes/*` | `194:45`/`194:46` | section + description styles |
| a11y table | non-modal focus, Escape, name/role | `194:22` pattern | header + cell styles |
| component set | nested in variantes | set `10332:504` | Component tokens only |

## Proibido

- Inter/fontSize/fill hex sem `textStyleId` + boundVariables tipográficos/cor
- root pad 64 / gap 48 sem variables
- divider fill cru
- seção só com prosa solta no lugar de tabela
