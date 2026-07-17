# Inventário de componentes — Design System Core

> Gerado automaticamente por `scripts/sync-docs.mjs` em 2026-07-17. Não editar manualmente.
> Para regenerar: `npm run sync:docs`
> Versão atual: **1.0.0-beta.6**

## Status geral

| Componente | Readiness | Responsabilidade | CSS | Figma (visual) | Figma (binding) | Stories | Docs site |
|------------|-----------|------------------|-----|-----------------|-----------------|---------|----------|
| Accordion | 🟡 Experimental | Runtime do DS | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Button | 🟢 App-ready | HTML nativo | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Input Text | 🟢 App-ready | HTML nativo | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Textarea | 🟢 App-ready | HTML nativo | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Select | 🟢 App-ready | HTML nativo | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Combobox | 🟡 Experimental | Runtime do DS | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Checkbox | 🟢 App-ready | HTML nativo | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Radio | 🟢 App-ready | HTML nativo | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Toggle | 🟢 App-ready | HTML nativo | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Badge | 🟢 App-ready | Apresentação | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Alert | 🟢 App-ready | Apresentação | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Card | 🟢 App-ready | Apresentação | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Modal | 🟡 Experimental | Runtime do DS | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Tooltip | 🟡 Experimental | Runtime do DS | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Menu | 🟡 Experimental | Runtime do DS | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Tabs | 🟡 Experimental | Runtime do DS | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Breadcrumb | 🟢 App-ready | HTML nativo | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Pagination | 🔵 Composição | Aplicação | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Avatar | 🟢 App-ready | Apresentação | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Divider | 🟢 App-ready | Apresentação | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Form Field | 🔵 Composição | Aplicação | 🟢 | — (CSS-only, ADR-017) | — | ⬜ | 🟢 |
| Spinner | 🟢 App-ready | Apresentação | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |
| Skeleton | 🟢 App-ready | Apresentação | 🟢 | 🟢 | 🟢 | ⬜ | 🟢 |

**Legenda de artefatos:** ⬜ Não iniciado | 🟡 Em progresso | 🟢 Completo | ⚠️ Verificar | 🔴 Precisa revisão | — Não aplicável

### Readiness de consumo

| Nível | Significado |
|-------|-------------|
| 🟢 **App-ready** | API pública recomendada para aplicações: anatomia, estados e responsabilidade de comportamento estão documentados. |
| 🔵 **Composição** | Padrão público e estável cuja orquestração, navegação ou estado de negócio permanece sob responsabilidade da aplicação. |
| 🟡 **Experimental** | Contrato ainda não concluiu o gate de runtime e consumo; pode mudar e não deve sustentar fluxo crítico sem avaliação explícita. |

Readiness não substitui responsabilidade. Um componente pode ser App-ready usando HTML nativo, enquanto uma Composição é pública e estável, mas mantém orquestração no app. Componentes Experimentais não devem sustentar fluxos críticos sem avaliação explícita.

**Nota sobre binding:**
- Button: tokens Component para background, content, border, height, padding, radius, gap, focus ring e ícones
- Input Text / Select / Textarea: tokens Component compartilhados de Field/Form Field para label, required, helper, erro, superfície, borda, foco e estados
- Checkbox / Radio / Toggle: tokens Component para target/control/track/thumb/content, com Content frame vertical (Label + Description + Helper Text) e booleans show/hide
- **Form Field**: CSS-only (ADR-017). Não tem (e não deve ter) equivalente Figma — componentes Figma de form (Input, Select, Textarea, Checkbox, Radio, Toggle) já carregam Label + Required + Helper inline em cada variant. Form Field só existe no CSS porque HTML não tem elemento "form control" composto.
- Demais componentes: tokens Component quando a anatomia já foi materializada; tokens Semantic só quando o componente ainda não tem contrato anatômico próprio.

## Pipeline

| Etapa | Status |
|-------|--------|
| JSON (DTCG) canônico | 🟢 `tokens/` |
| Style Dictionary | 🟢 `build-tokens.mjs` |
| CSS gerado | 🟢 `css/tokens/generated/` |
| Import pipeline | 🟢 index.css importa apenas generated/ |
| Figma binding | 🟢 componentes vivos vinculados |

## ADRs

| ADR | Título | Status |
|-----|--------|--------|
| ADR-001 | Migração da arquitetura de tokens para Foundation→Semantic→Component com DTCG + Style Dictionary | Aceita — superseded em parte por [ADR-014](ADR-014-action-tokens-role-style.md) (themes Default/Ocean/Forest removidos em 0.8.0; Brand virou paleta única customizável) |
| ADR-002 | Stack agnóstica — HTML + CSS + vanilla JS como base | Aceita |
| ADR-003 | Figma como origem canônica de tokens, Git como consolidação | Aceita — Revisada em 0.5.8 |
| ADR-004 | WCAG 2.2 AA como padrão de acessibilidade | Aceita — Implementada em 0.5.0 |
| ADR-005 | Brand como camada foundation, estados explícitos no semantic, e limpeza tipográfica | Aceita — Implementada em 0.5.0 (fechamento formal em 0.5.2). Superseded por [ADR-014](ADR-014-action-tokens-role-style.md): collection Brand (modes Default/Ocean/Forest) deletada em 0.8.0, Brand virou paleta única customizável dentro da Foundation. |
| ADR-006 | Tokens semânticos de controle para dimensões e tipografia compartilhadas entre controles interativos | Parcialmente substituída — `size.control.*` e `space.control.padding-{x,y}.*` substituídos por escala `size.{xs..5xl}` + `space.{xs..2xl}` + `space.control.padding.10` em **ADR-015** (2026-04-26). O contrato público de anatomia dos componentes foi movido para tokens Component em **ADR-019** (2026-05-10). `typography.control.*` permanece vigente. |
| ADR-007 | Estabelecer sistema de cores toned com overlays coloridos e tokens semânticos toned | Aceita — Implementada em 0.5.0 (fechamento formal em 0.5.4, sincronização Figma completa em 0.5.6) |
| ADR-008 | Recalibração das paletas foundation `green` e `amber` | Aceita — Implementada em 0.5.0 |
| ADR-009 | Separação de `border.default` (decorativa) e `border.control` (funcional) | Aceita — Implementada em 0.5.0 |
| ADR-010 | Remoção de `foundation.color.white` e `foundation.color.black` puros | Aceita — Implementada em 0.5.0 |
| ADR-011 | Reestruturação do naming de tokens semânticos de cor | Aceita — Implementada em 0.5.0 |
| ADR-012 | Tokens de line-height e letter-spacing divergem por design entre Figma e JSON | Aceita |
| ADR-013 | Camadas de consumo de tokens — Foundation nunca direto em consumidor final | Aceita — implementada em 0.7.0 e parcialmente substituída por ADR-019 em 2026-05-11 |
| ADR-014 | Reestruturação Semantic em `action` × `style` × `prop` × `state` — eliminação de brand/accent e themes | Aceita — implementada em 0.7.0 e estabilizada em 1.0.0-beta.1 |
| ADR-015 | — Unificação da escala size, eliminação de tokens component-specific e renomeação spacing→dimension | Aceito |
| ADR-016 | — Tokens sem equivalência no Figma (CSS-only) | Aceito |
| ADR-017 | — Componentes CSS-only (sem equivalência no Figma) | Aceito |
| ADR-018 | — Renomear `content.{default,secondary,tertiary}` para `content.{strong,default,subtle}` | Aceito |
| ADR-019 | — Reintrodução de Component tokens como contrato anatômico | Aceita |
| ADR-020 | Biblioteca consumível e contrato de readiness dos componentes | Aceita |

## Próximos milestones

1. **Fechar runtimes experimentais** — Accordion, Combobox, Modal, Tooltip, Menu e Tabs só sobem para App-ready após runtime público e teste em consumidor
2. **Teste de projeto consumidor** — validar instalação, imports, teclado e axe fora do site de docs
3. **Distribuição da API para agents** — incluir ou exportar o catálogo machine-readable no pacote
4. **Componentes pendentes** — Table, Toast, Popover
5. **Storybook** — opcional, depois do contrato app-ready
