- Status: Aguardando aprovação do owner
- Role: DS Architect
- Run: `docs/agents/runs/2026-07-21-feedback-actions`

# Spec Figma proposta

- Componente/padrao: Actions nested em **Alert** e **Toast** (correção; não página nova)
- Pagina Figma: páginas existentes `Alert` e `Toast` no DS Core `IE68amP9Hya5ieFw1rX8S8`
- Sets alvo (IDs vivos na run Toast / dump prévio):
  - Alert set: `147:67`
  - Toast set: `10279:2508`
- Referencias DS Core consultadas:
  - Component set **Button** — Style Ghost, Size Sm, states Default/Hover/Pressed/Focus/Disabled
  - Alert / Toast pages (anatomia Content, Style Subtle|Solid, Type)
  - Tokens Component `alert/action/*`, `toast/action/*`, `alert|toast/actions/gap`
- Referencias externas consultadas:
  - Carbon Actionable notification (Button nested)
  - Polaris Banner actions (Button nested, até 2)
  - Material Snackbar TextButton nested
  - Figma: nested instance properties; boolean + text vs variant explosion
  - Benchmark canvas desta sessão

## Padrão de página

Não criar página nova. Ao atualizar docs visuais:

- Manter um único frame raiz por página (`Alert`, `Toast`)
- Atualizar apenas seções afetadas: `section-anatomy`, `section-action` (ou equivalente), `section-properties`, exemplos com actions
- Zero nós soltos no canvas
- Antes de editar docs: dump rápido de 2 páginas modelo (ex. Button, Modal) só se reorganizar seções — correção pontual de Actions não exige redesign de página

## Anatomia (Actions)

### Opção A — default

- Container `Actions` (FRAME, auto-layout horizontal)
  - `Action 1` — **INSTANCE** do component set Button
    - Locked/preferred: `Style=Ghost`, `Size=Sm`
    - `State` disponível via nested props (protótipo)
  - `Action 2` — mesma INSTANCE Button Ghost/Sm
- Remover completamente qualquer FRAME+TEXT “falso botão” atual (padding/radius/font literais)
- Nested instances: Button (obrigatório); Lucide não entra na action
- Slots: nenhum

### Opção B — escape (só se critério do brief disparar)

- Criar component set interno `.Feedback Action` (nome com `.` para ocultar do Assets)
- Variants: `Type` × `Style` (Subtle|Solid) × `State` (Default|Hover|Pressed|Focus|Disabled) — ou Type×Style com State como propriedade se o kit Button permitir espelhar
- TEXT property `Label` no próprio átomo
- Bindings: `alert/action/color/{type}/{style}` **ou** tokens espelhados `feedback-action/*` que aliasam os mesmos Semantic; hosts Alert/Toast nestam o átomo e **não** duplicam literais
- Documentar no build report: por que A falhou (qual dos 3 critérios)

## Auto-layout

- `Actions`: horizontal; gap = `alert/actions/gap` ou `toast/actions/gap`; padding 0; align center; width hug; height hug
- Visibilidade:
  - `Show Action 1 = false` → `Actions` inteiro `visible=false` (zero gap no Content)
  - `Show Action 2 = false` → só `Action 2` oculto; fileira permanece se Action 1 on
- Content (coluna): Title → Description → Actions; gap vertical já tokenizado (`content/gap`)
- `clipsContent`: false

## Properties

### Manter / ajustar no host (Alert e Toast)

- Variants existentes: `Type`, `Style` (Subtle | Solid) — **não** adicionar variant “Has Actions”
- Boolean:
  - `Show Action 1` → visible de `Actions` (e implica Action 1)
  - `Show Action 2` → visible de `Action 2`
- Text:
  - Preferência: **não** manter TEXT órfão `Action 1 Label` / `Action 2 Label` no parent se nested props cobrirem
  - Expor **Nested instance** de Action 1 e Action 2 (Label do Button; opcional State)
  - Se Figma exigir TEXT no parent para override estável: parent TEXT wired a `componentPropertyReferences.characters` do TEXT interno do Button — sem segundo controle concorrente
- Instance swaps: **não** expor swap livre de Style do Button (evitar Primary em Solid Alert)
- Ordem no painel (Actions bloco):
  1. `Show Action 1`
  2. Nested / Label Action 1
  3. `Show Action 2`
  4. Nested / Label Action 2  
  (imediatamente após Description / Show Description, conforme AGENTS.md)

### Defaults PT-BR

- Action 1: `Desfazer` (Toast) / `Ver detalhes` (Alert) — Builder pode alinhar aos exemplos vivos da página
- Action 2: `Dispensar` ou `Cancelar` — só em exemplos com 2 actions

## States

| Camada | Default | Hover | Focus | Pressed | Disabled |
|--------|---------|-------|-------|---------|----------|
| Host Alert/Toast | sim | n/a na action | n/a | n/a | n/a |
| Action (Button A ou átomo B) | sim | **obrigatório** | **obrigatório** | **obrigatório** | **obrigatório** |

- Focus ring: tokens `focus-ring/*` do Button (não inventar ring local)
- Documentar na página: protótipo pode trocar State via nested prop

## Tokens/bindings

### Opção A

- Button mantém seus Component tokens (`button/*`)
- Override permitido na instância nested: **somente** fill do label (e hover/pressed correlatos se o Button expuser) apontando para:
  - Subtle: `alert|toast/action/color/subtle` (ou por type se já existir)
  - Solid: `alert|toast/action/color/{type}/solid`
- Se o override não for possível sem detach → critério de escape B
- Gap da fileira: Component `*/actions/gap` → Semantic space

### Opção B

- Todas as cores/spacing do átomo em Component `feedback-action/*` **ou** reutilizar paths `alert/action/*` / `toast/action/*` com aliases Semantic
- Component → Semantic only; sem Foundation; sem Component→Component

### Effect / Text styles

- Nenhum Effect Style novo para Actions
- Tipografia: a do Button sm (Text Style já usado pelo Button)

## Exemplos no canvas

1. Alert Success Subtle — 1 action
2. Alert Error Solid — 2 actions (prova de contraste)
3. Toast Info Subtle — 1 action (“Desfazer”)
4. Toast Warning Solid — 1 action (prova Solid)
5. Mesmos exemplos com Show Action 1 off (fileira some)

Atualizar matriz visual Type × Style **sem** explodir por action on/off (boolean resolve).

## Documentacao visual

- Anatomy: marcar Actions como nested Button (não “text button local”)
- Properties table: Show Action 1/2 + nested Label
- Nota designer: não detach Button; não trocar Style para Primary/Solid do Button dentro do feedback
- Do/Don’t: Don’t = FRAME+TEXT; Do = nested Ghost/Sm

## Matriz de contrato (resumo)

| part | figmaProperty | componentProperty | componentToken | modelEvidence |
|------|---------------|-------------------|----------------|---------------|
| Actions row | visible, gap | Show Action 1 | `*/actions/gap` | Content column |
| Action 1 | instance Button Ghost/Sm | nested Label / Show Action 1 | Button `button/*` (+ override action color se A) | Button set |
| Action 2 | instance Button Ghost/Sm | nested Label / Show Action 2 | idem | Button set |
| (B only) Feedback Action | Type×Style×State, Label | nested no host | `alert|toast/action/*` | Material Snackbar btn |

Builder expande `evidence/figma-contract-matrix.md` com `unmappedRows=0` antes de “pronto para auditoria”.

## Validacao planejada

- Dump before/after do component set: zero FRAME+TEXT action; só INSTANCE Button (ou `.Feedback Action`)
- Nested props: Label editável no painel do host
- Screenshot Type×Style com action — contraste ≥ 4.5:1 no Solid
- States: pelo menos um variant do Button nested mostra Hover/Focus no dump ou protótipo
- `verify:figma-structure` após snapshot (quando Token Sync)
- Auditor: quem construiu não aprova

## Critério “pronto para auditoria”

- **Contrato:** Actions = nested atom; props Show 1/2 + labels; máx. 2; fileira some sem residual
- **Documentação:** anatomy/properties/exemplos refletem nested Button (ou B documentado)
- **Visual:** screenshots vs página Button + Alert modelo; Solid contrast OK
- Contagem agregada sozinha **não** fecha o Builder

## Bloqueado antes de

- Figma write: até owner aprovar `01-brief.md` + este arquivo
- Escalada B: aprovação rápida adicional do owner no meio do build
- Repo sync: até Figma Auditor + owner no gate `figma-audit`
- Commit/push: Release / pedido explícito
