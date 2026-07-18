# Audit Figma vs JSON/CSS — 2026-04-25

> **Status:** HISTÓRICO / SUPERSEDED. Este retrato foi produzido em 25/04/2026
> contra o commit `359826f`; os findings não representam o estado atual e não
> devem ser tratados como backlog. Consulte `docs/backlog.md`, as APIs em
> `docs/api/` e os validadores atuais para o estado vigente.
>
> O arquivo permanece versionado apenas para rastreabilidade e é excluído de
> `docs/llms-full.txt` para não reintroduzir pendências resolvidas em agents.
> **Fonte de verdade:** Figma file `IE68amP9Hya5ieFw1rX8S8`, inspecionado via MCP `use_figma`.
> **Comparado contra:** `tokens/semantic/{light,dark}.json`, `css/components/*.css`, `css/base/*.css` (commit `359826f`).

---

## 1. Inventário Figma

| Coleção | Variables | Naming pattern |
|---|---|---|
| Foundation | 221 | numérico (`radius/8`, `spacing/16`, `typography/font/size/14`) |
| Semantic | 165 | hierárquico (`primary/background/default`, `feedback/success/border/default`) |

18 component pages (`Alert`, `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Card`, `Checkbox`, `Divider`, `Input`, `Modal`, `Radio`, `Select`, `Spinner`, `Skeleton`, `Tabs`, `Textarea`, `Toggle`, `Tooltip`).

Componentes auditados: variant default state + smallest size ou primeira variant. Audit cobre o componente representativo, não todas as variants.

---

## 2. Discrepâncias estruturais críticas

### 2.1 Naming Semantic JSON divergente do Figma (compound vs hierárquico)

Figma usa hierarquia de pasta (`A/B/C`), JSON usa compound com hífen (`A.B-C`). Resultado: o CSS gerado tem nomes de var diferentes do que o componente Figma binda.

| Path no Figma | Path no JSON atual | CSS atual | CSS esperado (espelhando Figma) |
|---|---|---|---|
| `primary/background/default` | `primary.bg-default` | `--ds-primary-bg-default` | `--ds-primary-background-default` |
| `primary/content/default` | `primary.content-default` | `--ds-primary-content-default` | `--ds-primary-content-default` ✅ (3 níveis com hífen no leaf bate com 3 níveis em pasta) — depende de regra de geração |
| `toned/background/default` | `toned.bg-default` | `--ds-toned-bg-default` | `--ds-toned-background-default` |
| `feedback/success/background/default` | `feedback.success.bg-default` | `--ds-feedback-success-bg-default` | `--ds-feedback-success-background-default` |
| `feedback/success/border/default` | `feedback.success.border-default` | `--ds-feedback-success-border-default` | `--ds-feedback-success-border-default` ✅ |
| `feedback/success/content/contrast` | `feedback.success.content-contrast` | `--ds-feedback-success-content-contrast` | `--ds-feedback-success-content-contrast` ✅ |
| `border/control/default` | `border.control-default` | `--ds-border-control-default` | `--ds-border-control-default` ✅ |
| `border/focus/error` | `border.focus-error` | `--ds-border-focus-error` | `--ds-border-focus-error` ✅ |
| `outline/background/active` | `outline.bg-active` | `--ds-outline-bg-active` | `--ds-outline-background-active` |
| `ghost/background/active` | `ghost.bg-active` | `--ds-ghost-bg-active` | `--ds-ghost-background-active` |
| `link/content/default` | `link.content-default` | `--ds-link-content-default` | `--ds-link-content-default` ✅ |

**Regra de naming — observação técnica.** O divergência é especificamente em **`bg` (abreviado) → `background`** no JSON. Os outros (`content`, `border`) já viram nomes corretos no CSS porque o último segmento usa hífen como separador estrutural. O leaf path `bg-default` é a única abreviação que não bate com Figma (`background/default`).

**Impacto:** ~25 tokens com naming divergente (todos os `*.bg-*` em `primary`, `toned`, `outline`, `ghost`, `feedback.{success,info,warning,error}`).

### 2.2 Discrepância numérica

| Token | Figma | JSON | CSS |
|---|---|---|---|
| `radius/full` (Foundation) | `radius/999` | `radius/9999` | `--ds-radius-9999` |

1 token. Decisão: padronizar em **`999`** (Figma) — conforme aprovado.

---

## 3. Foundation leaks (bindings ADR-013 violations)

**ADR-013:** Componentes nunca consomem Foundation direto. Apenas Semantic. Foundation está hidden from publishing.

### Bindings detectados a Foundation `typography/font/size/14` em componentes Figma:

| Componente | Node | Path no node | Tipo de binding |
|---|---|---|---|
| Alert | `Description` (TEXT) | `fontSize[1]` | foundation leak (multi-style run) |
| Alert | `Title` (TEXT) | `fontSize[0]` | foundation leak |
| Card | `Content` (TEXT) | `fontSize[1]` | foundation leak (multi-style run) |
| Checkbox | `Description` (TEXT) | `fontSize[1]` | foundation leak (multi-style run) |
| Checkbox | `Label` (TEXT) | `fontSize[1]` | foundation leak (multi-style run) |
| Input | `Required` (TEXT) | `fontSize[1]` | foundation leak (multi-style run) |
| Modal | `Content` (TEXT) | `fontSize[1]` | foundation leak (multi-style run) |
| Radio | `Description` (TEXT) | `fontSize[1]` | foundation leak (multi-style run) |
| Radio | `Label` (TEXT) | `fontSize[1]` | foundation leak (multi-style run) |
| Select | `Required` (TEXT) | `fontSize[1]` | foundation leak (multi-style run) |
| Tabs | `Label` (TEXT) | `fontSize[0]` | foundation leak |
| Textarea | `Required` (TEXT) | `fontSize[1]` | foundation leak (multi-style run) |
| Textarea | `Text` (placeholder TEXT) | `fontSize[1]` | foundation leak (multi-style run) |

**Padrão:** 11 dos 13 leaks são `fontSize[1]` — segunda style run no mesmo texto (multi-style runs). Provavelmente artefato de copy/paste ou template. Alguns textos têm dois style runs com binding diferente: `[0]` Semantic, `[1]` Foundation. Visualmente resolve pra 14px nos dois, mas estruturalmente o `[1]` viola ADR-013.

**Remediação:** rebindar `fontSize[1]` pra equivalente Semantic (`typography/body/font-size/sm`) ou eliminar a segunda style run consolidando o texto.

---

## 4. Textos com bindings incompletos

### 4.1 Multi-style runs (texto com mais de uma style range)

13 textos com 2 style runs detectados. Idealmente texto deveria ter 1 style run só (todo o texto tem mesma formatação). Os multi-style runs são um vazamento de Foundation.

### 4.2 `fontWeight` sem binding (24 ocorrências)

A propriedade `fontWeight` está mostrada como sem binding na primeira style run (`bindings.fontWeight` ausente — embora `fontStyle` esteja bindado).

Investigando: o Figma binda `fontStyle` (que é o nome da prop a partir da combinação fontFamily+fontStyle, ex: "Inter Bold"). O `fontWeight` (numérico — 700) é derivado do `fontStyle`. **Não é um problema real** — Figma binda fontStyle ao token de weight, e o weight numérico vem disso. **Falso positivo do audit script.**

Confirmar: textos têm `fontStyle[0]` bindado a `typography/body/font-weight/bold` etc. ✅

### 4.3 Helper Text e Placeholder sem `fontSize` bindado (real)

Ocorrências detectadas:

| Componente | Node | Props sem binding |
|---|---|---|
| Input | Helper Text | fontSize, fontWeight |
| Input | Placeholder Text | fontSize, fontStyle, fontWeight, lineHeight, letterSpacing, fontFamily (TODOS) |
| Radio | Helper Text | fontSize, fontWeight |
| Select | Helper Text | fontSize, fontWeight |
| Select | Placeholder Text | TODOS sem binding |
| Textarea | Helper Text | fontSize, fontWeight |
| Toggle | Helper Text | fontSize, fontWeight |

**Issue real.** Placeholders em Input/Select são 100% hardcoded. Helper texts faltam fontSize/fontWeight.

### 4.4 Frame `itemSpacing` sem binding

| Componente | Node | Valor literal | Esperado |
|---|---|---|---|
| Radio | `Content` frame | 4px | bindar a `space/xs` |
| Toggle | `Content` frame | 4px | bindar a `space/xs` |

---

## 5. Issues visuais reportados (não auditados via Figma ainda)

Itens reportados pelo usuário que precisam ser verificados visualmente comparando renderização do site vs Figma:

### 5.1 Badges com estilo divergente
Detalhar em audit visual: Color × Style × Size.

### 5.2 Modal com linha separatória no header (não existe no Figma)
Verificar `.ds-modal__header` em `css/components/modal.css` — provavelmente `border-bottom`. Confirmar contra Figma `Modal/Header`.

### 5.3 Tooltip sem arrow/pointer
Figma `Tooltip` tem variant `Position=top` (entre outras posições) que provavelmente inclui um vector/triangle apontando pra origem. CSS atual não tem essa peça. Investigar nodes da tooltip Figma.

### 5.4 Anomalias de contraste e tokens incorretos no site (não localizadas)
Audit visual sistemático componente por componente, comparando cada propriedade contra Figma.

---

## 6. Variables Semantic Figma — análise de uso

Audit anterior reportou **45 distintas em uso vs 165 totais = 120 não usadas**, o que estava errado. Audit foi feito apenas na **primeira variant default** de cada componente. Variants Hover/Pressed/Focused/Disabled bindam variables adicionais.

**Necessário re-audit** percorrendo todas as variants × estados pra ter número real. Estimo que com Hover/Pressed/Focused/Disabled, o uso real seja ~100-120, deixando ~50 verdadeiramente não usadas.

Categorias prováveis das não usadas (a confirmar):
- `surface/raised`, `surface/overlay` — system-level, não componente. Mantidas.
- `feedback/X/background/disabled`, `feedback/X/content/disabled` — usadas em variants `disabled` que ainda não inspecionei.
- `border/inverse` — sistema dark mode.
- `outline/border/disabled` — Button variant disabled.

**Plano:** rodar audit completo (todas variants × estados) antes de declarar dead code. Manter todas até auditadas.

---

## 7. Plano de remediação

Ordem importante: **Figma primeiro**, depois sincronizar JSON/CSS.

### Fase 1 — Hardening do Figma (write no Figma)

1. **Eliminar Foundation leaks (13 ocorrências):** rebindar `fontSize[1]: typography/font/size/14` → `typography/body/font-size/sm` em Alert/Card/Checkbox/Input/Modal/Radio/Select/Tabs/Textarea (multi-style runs) ou consolidar texto pra 1 style run.

2. **Bindar Helper Text e Placeholder (7 textos):** adicionar bindings em fontSize/fontWeight/lineHeight/fontFamily/letterSpacing nos placeholders de Input/Select e helper texts de Input/Radio/Select/Textarea/Toggle.

3. **Bindar `itemSpacing` faltante:** Radio/Content e Toggle/Content → `space/xs`.

4. **Investigar e corrigir issues visuais:**
   - Modal: confirmar ausência de linha separatória no header Figma. Se ausente, remover `border-bottom` do CSS.
   - Tooltip: verificar variant `Position=top/bottom/left/right` no Figma e listar nodes. Se Figma tem arrow/pointer, replicar no CSS.
   - Badges: comparar variant por variant (Color × Style × Size) Figma vs CSS.

5. **Renomear `radius/9999` → `radius/999`** em Foundation Figma (1 token). Rebindar refs.

### Fase 2 — Snapshot Figma → JSON (write em JSON)

6. Regenerar `.figma-snapshot.json` (atual está stale ~70h+).
7. Renomear estrutura JSON Semantic compound `bg-*` → hierárquico `background.*`:
   - `primary.bg-{default,hover,active,disabled}` → `primary.background.{default,hover,active,disabled}`
   - `toned.bg-{default,hover,active}` → `toned.background.{default,hover,active}`
   - `outline.bg-{active,hover}` → `outline.background.{active,hover}`
   - `ghost.bg-{active,hover}` → `ghost.background.{active,hover}`
   - `feedback.{success,info,warning,error}.bg-{default,subtle,hover,active,disabled,background}` → `feedback.X.background.{default,subtle,hover,active,disabled,background}` (~20 tokens)

8. Renomear `radius.9999` → `radius.999`.

### Fase 3 — Regenerar CSS + atualizar consumer (write em CSS)

9. `npm run build:tokens` — CSS gerado com `--ds-*-background-*` em vez de `--ds-*-bg-*`.
10. Atualizar `css/components/*.css`: substituir `--ds-{primary,toned,outline,ghost,feedback-X}-bg-*` → `--ds-...-background-*` (~80 refs estimadas).
11. Atualizar `css/base/*.css` se houver.
12. Atualizar geradores `scripts/sync-docs.mjs`, `scripts/tokens-verify.mjs` (THEME_COLOR_SECTIONS, inline CSS).
13. Atualizar HTMLs de docs (CSS inline + tabelas mostrando nomes de tokens).

### Fase 4 — Audit visual completo

14. Rodar audit completo — todas variants × estados de cada componente — pra confirmar usado vs reservado em Semantic.
15. Comparação visual sistemática: para cada componente, cada propriedade renderizada deve bater com a propriedade no Figma.
16. Adicionar smoke test que automatiza isso (extensão do `test-self.mjs`).

### Fase 5 — Documentação

17. Novo ADR formalizando "Figma é fonte estrutural absoluta — JSON espelha hierarquia 1:1".
18. ADR-013 reforçado: zero tolerância para Foundation em consumer (componente Figma OU CSS).
19. CHANGELOG entry.

---

## 8. Critérios de sucesso

- ✅ Zero `foundation-leak` em componente Figma (audit Plugin API confirma)
- ✅ Zero text-no-binding em fontSize/fontWeight/lineHeight em qualquer texto de componente Figma
- ✅ JSON Semantic bate 1:1 com Semantic Figma em estrutura e valor
- ✅ CSS gerado bate 1:1 com bindings Figma (toda var consumida em componente é o token bindado no node Figma equivalente)
- ✅ `npm test` passa
- ✅ Visual: badge, modal, tooltip alinhados com Figma (componente por componente)

---

## 9. Estimativa

| Fase | Esforço |
|---|---|
| Fase 1 — Hardening Figma | ~3h |
| Fase 2 — Snapshot + JSON rename | ~30min |
| Fase 3 — CSS + consumer + docs | ~1h |
| Fase 4 — Audit visual completo | ~2h |
| Fase 5 — ADRs + CHANGELOG | ~30min |
| **Total** | **~7h** |

---

## 10. Próximas decisões necessárias

Antes de iniciar Fase 1, preciso confirmação:

1. **Multi-style runs em textos Figma**: posso consolidar pra 1 style run só (sem mudar valor visual) ou prefere manter 2 runs e rebindar o `[1]` pra Semantic? (Recomendo consolidar — multi-run sem propósito é débito.)

2. **Helper Text fontWeight literal**: bindar a `typography/body/font-weight/regular`?

3. **Placeholder em Input/Select sem nenhum binding**: bindar TUDO (fontSize/fontWeight/lineHeight/fontFamily/letterSpacing) a `typography/control/*`?

4. **Modal divider**: você confirma que Figma não tem? Vou confirmar visualmente no Figma e remover do CSS.

5. **Tooltip arrow**: vou inspecionar no Figma. Se confirmado, adicionar no CSS via pseudo-elemento (`::before` ou `::after`) ou SVG?
