# ADR-017 — Componentes CSS-only (sem equivalência no Figma)

- **Status:** Aceito
- **Data:** 2026-04-30
- **Relaciona:** ADR-003 (Figma como fonte de verdade), ADR-016 (Tokens sem equivalência no Figma)

## Contexto

A regra geral do DS (ADR-003) é que componentes existem em Figma como fonte canônica de design e são espelhados em CSS. ADR-016 já documentou que algumas **categorias de token** não têm equivalência Figma e vivem só em JSON. Esta ADR documenta o análogo para **componentes**: alguns componentes existem só no CSS porque sua razão de existir é uma característica do HTML/DOM que não tem equivalente em Figma.

O caso concreto é **Form Field** (`.ds-field`):

- No **HTML**, não existe um elemento "form control composto" — para construir um campo acessível precisamos compor `<label>` + `<input/select/textarea>` + `<span>` (helper) + `<span role="alert">` (error), com `for=`, `aria-describedby`, `aria-invalid` ligando os pedaços. Form Field é o wrapper CSS que dá esse composto consistente.
- No **Figma**, cada componente de form (Input Text, Select, Textarea, Checkbox, Radio, Toggle) já carrega **Label, Required, Helper Text e Description inline em cada variant**. Designer não precisa compor — ele coloca o componente Input no canvas e Label + Required + Helper já aparecem. O wrapper só existiria no Figma para repetir o que cada componente já tem.

Tratamentos errados que essa ADR previne:

- Auditor reclama que "Form Field não existe no Figma" e classifica como **drift / componente faltando**. Não é. É decisão arquitetural.
- Designer/dev tenta authorar Form Field no Figma para "completar paridade". Cria duplicação visual e bind ambíguo.
- IA repete a auditoria sem contexto e refaz a mesma classificação errada.

## Decisão

### Componentes CSS-only

Um componente é classificado como **CSS-only** quando:

1. Sua razão de existir é uma necessidade de composição/markup do HTML/DOM, não uma decisão visual.
2. Os componentes Figma equivalentes já cobrem visualmente tudo o que o componente CSS-only cobre estruturalmente.
3. Authorar o componente no Figma criaria duplicação ou ambiguidade de bind, sem agregar valor visual.

Esses componentes:

- **Existem em** `css/components/*.css` e `docs/<componente>.html`.
- **Não existem no Figma** e **não devem ser authorados lá**.
- Têm seu equivalente visual coberto pelos componentes Figma de granularidade adequada (Form Field ↔ Input/Select/Textarea/Checkbox/Radio/Toggle, cada um já com Label/Required/Helper/Description inline).

### Lista atual de componentes CSS-only

| Componente | CSS file | Razão |
|---|---|---|
| **Form Field** | `css/components/form-field.css` | Wrapper para compor `<label>` + control + helper + error em HTML. Cada componente Figma de form já carrega esses elementos inline em cada variant. |

Adicionar componente novo à lista exige amend desta ADR.

### Marcação no inventário

`scripts/sync-docs.mjs` marca componentes CSS-only com `cssOnly: true` no array `knownComponents`. A tabela em `docs/component-inventory.md` mostra `— (CSS-only, ADR-017)` em vez de status Figma para esses componentes. A nota explicativa fica visível na seção "Nota sobre binding".

### Verificação

`npm run verify:tokens` e auditorias futuras Figma↔Repo **devem ignorar** componentes marcados `cssOnly: true` ao reportar "componente faltando no Figma". O sinal de drift só vale para componentes que esperamos ter equivalência Figma.

## Consequências

- **Designers** sabem que não precisam authorar Form Field. Para usar uma campo de form em mockup, instanciam Input/Select/Textarea direto, que já mostram Label/Required/Helper.
- **Devs** continuam consumindo `.ds-field` no HTML para acessibilidade composta. Sem mudança na API de uso.
- **IAs / auditores** não classificam Form Field como drift quando comparam Figma vs Repo. Auditoria filtra por `cssOnly`.
- **Adicionar futuros CSS-only**: precisa amend desta ADR + entrada em `knownComponents`. Exemplos potenciais (não decididos hoje): Field Group, Stack, Cluster — primitivos de layout que HTML/CSS expressa com flex/grid mas Figma resolve via auto-layout no próprio componente.

## Alternativas consideradas

### (a) Authorar Form Field no Figma para "paridade"

Descartada. Cria duplicação visual: o que o designer vê no Form Field do Figma seria igual ao que ele já vê em Input/Select/etc. Mais variants pra manter, mais bindings pra auditar, sem ganho visual ou de comunicação.

### (b) Remover Form Field do CSS e fazer cada componente carregar tudo (mirror do Figma)

Descartada. HTML não tem essa composição embutida — Input só renderiza o `<input>`. Sem o wrapper, cada uso precisa replicar markup com label + helper + error + IDs + ARIA. Decisão errada para acessibilidade e ergonomia de dev.

### (c) Não classificar e tolerar a divergência

Descartada. Sem classificação explícita, toda auditoria nova gera o mesmo falso-positivo. Não é decisão custosa de codificar — uma flag `cssOnly: true` resolve.

## Referências

- [ADR-003](./ADR-003-fontes-verdade.md) — Figma como fonte de verdade (regra geral).
- [ADR-016](./ADR-016-tokens-sem-equivalencia-no-figma.md) — análogo desta ADR para tokens.
- `css/components/form-field.css` — implementação canônica.
- `docs/form-field.html` — doc de uso, anatomy, a11y.
- `scripts/sync-docs.mjs` — mecanismo de marcação no inventário.
