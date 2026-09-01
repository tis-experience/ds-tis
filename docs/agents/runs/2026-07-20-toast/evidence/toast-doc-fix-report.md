# Toast — correção de documentação visual (Figma)

- **Role:** Figma Builder
- **Data:** 2026-07-21
- **FileKey:** `IE68amP9Hya5ieFw1rX8S8`
- **Página:** `10279:2544` (❖ Toast)
- **Root:** `10279:2545`
- **Modelos:** Tooltip `194:39`, Modal `155:370`, Alert `155:134` (página `147:2`)
- **Escopo:** PAGE DOC apenas (component set Toast preservado)
- **Status:** `corrigido — pronto para auditoria de documentação/visual`

## Diagnóstico (read-only)

### O que já estava alinhado ao padrão vivo

| Item | Toast | Modelo (Alert/Tooltip) |
|---|---|---|
| Root width | 1440 | 1440 (Alert/Tooltip) |
| Root padding | 96 bound `space/section/xl` | idem |
| Root gap | 64 bound `space/section/md` | idem |
| Root fill | `background/default` | idem |
| Root `clipsContent` | `false` | `false` |
| Header title/body | `heading/xl` + `body/md` + `content/strong` | idem |
| Divider root | `overlay/default` | idem |
| Tabelas Tipos / maior parte Props | text styles + Semantic binds | idem |

**Conclusão:** não era rebuild total. O root e a maior parte da doc já seguiam o padrão; os desvios estavam em seções pontuais e conteúdo de tabelas.

### O que estava errado

| Severidade | Item | Evidência | Node IDs |
|---|---|---|---|
| Alta | Nó solto no canvas da página | Instance `Toast` fora do root | `10314:184` |
| Alta | `section-stack` sem text styles / fill hardcoded `#000` | title fontSize 24 sem style; desc fontSize 14 sem style | `10279:2735`, `10279:2736` |
| Média | `section-stack` gap sem variable | `itemSpacing=20` unbound | `10279:2734` |
| Média | Falta `section-estilos` (Alert tem) | Toast tinha Style variant sem tabela de estilos | — |
| Média | Colunas Padrão/Descrição trocadas + tipos em casing inconsistente | Props vs Alert | `10279:2646` (várias células) |
| Média | Divider faltando entre Type e Style | Ordem quebrada na tabela | entre `10279:2655` e `10297:2021` |
| Média | A11y: Critério/Nível mal formatados | `4.1.3` \| `Status Messages` em vez de critério completo + nível AA/A | `10279:2705`–`10279:2717` |

### Contagens pré-fix (doc, excl. component set/instances)

- `topLevelCount`: 2 (root + loose) → esperado 1
- Textos doc sem text style / fill unbound: 2
- Component set: intacto (não auditado nesta correção de page doc)

## Correções aplicadas

1. **Removido loose node** `10314:184`.
2. **`section-stack` (`10279:2734`)**:
   - title → `heading/sm` + `content/strong`
   - desc → `body/md` + `content/strong`
   - `itemSpacing` bound a `VariableID:3440:7` (mesmo token da `section-variantes`)
3. **Criada `section-estilos` (`10333:2926`)** após `section-tipos`, espelhando Alert (`155:45`): Solid / Subtle.
4. **Tabela Propriedades** realinhada ao contrato Alert: `Propriedade | Tipo | Padrão | Descrição`, casing `VARIANT`/`BOOLEAN`/`TEXT`/`NESTED`, divider `10333:2953` entre Type e Style.
5. **Tabela Acessibilidade** no formato Critério completo + Nível (AA/A) + Implementação.

## Pós-fix (objetivo)

| Check | Resultado |
|---|---|
| `topLevelCount` | 1 (`10279:2545` only) |
| Loose nodes | 0 |
| Doc texts sem style / fill unbound | 0 |
| Seções | header → divider → tipos → **estilos** → variantes → stack → propriedades → acessibilidade |
| Root layout/binds | inalterados e corretos |
| Component set Toast | preservado em `section-variantes` (`10279:2508`) |

## Node IDs relevantes

| Papel | ID |
|---|---|
| Página | `10279:2544` |
| Root | `10279:2545` |
| section-estilos (novo) | `10333:2926` |
| divider Type↔Style (novo) | `10333:2953` |
| section-stack | `10279:2734` |
| Loose removido | `10314:184` |
| Component set (não mexido) | `10279:2508` |

## O que ainda falta

- **Figma Auditor** (outro agente): contrato do component set + screenshot visual formal vs modelos.
- Critérios a11y de Toast são específicos (Status Messages / Timing / Focus) — Auditor pode pedir paridade adicional com Alert (`1.4.1`, `1.4.3`, `4.1.2`) se o brief exigir.
- Seções documentais ainda têm `clipsContent=true` (igual Alert maduro); não alterado de propósito.
- **Sem** sync repo / commit (fora de escopo).
- Run `2026-07-20-toast` não existia mais no working tree; esta nota recria só `evidence/`.

## Screenshots

- Pré: root Toast vs Alert/Tooltip capturados via MCP na sessão.
- Pós: root `10279:2545` re-capturado após correções (estilos + props + a11y visíveis).
