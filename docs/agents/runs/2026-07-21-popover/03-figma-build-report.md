# Figma Build Report — Popover (rebuild documental)

- Role: Figma Builder
- Run: `docs/agents/runs/2026-07-21-popover`
- Data: 2026-07-21
- Correção owner: dump de modelos + matriz documental **antes** da escrita; página clonada de Tooltip (não Inter/hex soltos)

## Status tripartite

| Eixo | Status | Nota |
|---|---|---|
| **contrato** | ok parcial | Docs: pad/gap/bg/title/desc/section/table/divider binds batem com Tooltip. Set: 8 variants, props, Component tokens `10319:2–21`, arrow VECTOR, default Medium/Bottom. **Tipografia do set:** Title/Body com Text Style + variables (correção 2026-07-21) |
| **documentação** | ok parcial | Página clonada de Tooltip com tabelas Propriedades/A11y/Diferenças + estilos/variables. Falta seção anatomia explícita (Tooltip também não tem) |
| **visual** | melhorar | Arrow discreta; ordem Size Medium→Small; **Content Slot nativo** adicionado (2026-07-21) em 8/8 variants — padrão Modal (`↳ Content Slot` + Show Content Slot / Show Content Text) |

**Handoff:** `bloqueado` para auditoria final automática — pedir **aprovação visual do owner** primeiro. Não é “pronto” absoluto.

## Node IDs

| Artefato | ID |
|---|---|
| Página | `10333:817` |
| Root `Popover` | `10333:818` |
| Component set | `10332:504` |
| Default Medium/Bottom | `10332:344` |
| Vars `popover/*` | `VariableID:10319:2` … `10319:21` (mantidas) |

Link: https://www.figma.com/design/IE68amP9Hya5ieFw1rX8S8/DS---TIS?node-id=10333-817

## Evidência documental vs modelo

Matriz: `evidence/doc-contract-matrix.md`

Validação automática pós-escrita (`failures=[]`):
- root pad `17:26`, gap `17:24`, bg `12:2`
- title textStyle page-title + fill `14:2` + typography binds
- description textStyle + binds
- section-titles textStyle section + binds
- dividers fill `2486:3`
- table cell “Size” textStyle description + binds
- arrow: frame `Arrow` (Border+Fill) + `Arrow Seam`; base/depth 24×12; border tokens `10347:43–44`; fill `10319:20` (ver `evidence/arrow-fix.md`)

Screenshots: `model-tooltip.png`, `model-modal.png`, `after-rebuild-page.png`, `after-rebuild-variant.png`

Tipografia set (before/after): `evidence/typography-hardcoded-fix.md`

## O que foi feito

1. Dump Tooltip/Modal/Alert (bindings textuais/layout/divider)
2. Matriz documental gravada
3. Draft ruim anterior já removido; set reconstruído com arrow VECTOR (clone Tooltip)
4. Página nova = **clone de Tooltip `194:39`** + textos/tabelas Popover + set aninhado
5. Button Ghost: ícones L/R desligados; Body Text fill → `content/default`
6. **Correção tipografia no set (owner):** `Title` ×8 → `body/sm-bold` + binds `3273:*` + fill `10319:14`; `Body Text` ×8 → `body/sm` (mesmo ID do Modal Description) + binds + fill `14:3`. Nested Button Label permanece exceção (como Modal).
7. **Content Slot:** `variant.createSlot()` em 8/8 → `↳ Content Slot#10336:0` + Show Content Slot/Text.
8. **Revisão slot (owner — aplicação ruim):** removido `Actions` hardcoded e seed do Button no master; `Show Content Slot` default **false** (Modal); slot vazio/transparente; exemplo de composição só na seção Exemplos da página.

## Pendências

1. Ordem visual Size Small→Medium no component set (hoje Medium primeiro por defaultVariant)
2. Arrow reconstruída (24×12 + border tokens + seam); OK visual do owner pendente
3. Ordem no painel: mover `Show Content Slot` imediatamente acima de `↳ Content Slot` (hoje SLOT aparece antes do boolean)
4. Exemplos Trigger+Popover separados (opcional)
5. Token Component para body text color (hoje Semantic `content/default` `14:3`; Modal Description usa Component)
6. Atualizar linha da tabela Propriedades na página se ainda não citar Content Slot

## Bloqueado antes de

- Token sync / CSS repo
- Commit/push
- Declarar audit aprovado sem OK visual do owner
