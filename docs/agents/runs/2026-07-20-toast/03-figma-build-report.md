# Figma Build Report — Toast

- Status: pronto para auditoria (com pendências menores documentadas)
- Role: Figma Builder
- Data: 2026-07-20
- File: `IE68amP9Hya5ieFw1rX8S8`

## Criado

| Artefato | Node ID |
|----------|---------|
| Página `      ❖  Toast` | `10279:2544` |
| Frame raiz `Toast` | `10279:2545` |
| Component set `Toast` | `10279:2508` |
| Variants Type=Success/Warning/Error/Info | `10279:2440` / `2457` / `2474` / `2491` |
| Variables Component `toast/*` | ~30 (alias Semantic) |

## Estrutura da página

- `topLevelCount=1`
- Seções: header → divider → section-tipos → section-variantes → section-stack → section-propriedades → section-acessibilidade
- 0 nós soltos no canvas

## Properties

- Type (variant), Title, Description, Action Label, Show Description, Show Action, Show Close, Icon, Close Icon
- Style Filled omitido (MVP Subtle only — exceção aprovada)

## Contrato / visual / documentação

| Eixo | Status | Notas |
|------|--------|-------|
| Contrato | passa | fills/strokes/padding/gap/radius bindados a `toast/*` → Semantic |
| Documentação | passa com ressalvas | tabelas atualizadas; linha close-icon ainda espelha Show Close (clone Alert) |
| Visual | passa com ressalvas | alinhado ao Alert; stack demo com 3 instâncias; 1ª com Show Action |

## Pendências conhecidas

1. `Action Label` existe no painel mas não está wired ao TEXT interno do Button (limitação de nested instance) — runtime/repo controla o label.
2. `z/toast` não criado no Figma (categoria z é CSS-only / ADR-016); Semantic JSON no repo.
3. Tipografia title/description: binds de cor ok; font-size via tokens toast aliasando Semantic tipografia.

## Matriz

`evidence/figma-contract-matrix.md` — `unmappedRows=0` validado antes do build.
