# Índice de ADRs — Design System Core

> Gerado automaticamente por `scripts/sync-docs.mjs` em 2026-07-20. Não editar manualmente.
> Para regenerar: `npm run sync:docs`

20 decisões registradas.

| ADR | Título | Status | Data |
|-----|--------|--------|------|
| [ADR-001](decisions/ADR-001-migracao-tokens.md) | Migração da arquitetura de tokens para Foundation→Semantic→Component com DTCG + Style Dictionary | Aceita — superseded em parte por [ADR-014](ADR-014-action-tokens-role-style.md) (themes Default/Ocean/Forest removidos em 0.8.0; Brand virou paleta única customizável) | 2026-04-14 |
| [ADR-002](decisions/ADR-002-stack-agnostica.md) | Stack agnóstica — HTML + CSS + vanilla JS como base | Aceita | 2026-04-14 |
| [ADR-003](decisions/ADR-003-fontes-verdade.md) | Figma como origem canônica de tokens, Git como consolidação | Aceita — Revisada em 0.5.8 | 2026-04-14 (original) · 2026-04-21 (revisada) |
| [ADR-004](decisions/ADR-004-wcag.md) | WCAG 2.2 AA como padrão de acessibilidade | Aceita — Implementada em 0.5.0 | 2026-04-14 |
| [ADR-005](decisions/ADR-005-brand-foundation-e-estados-explicitos.md) | Brand como camada foundation, estados explícitos no semantic, e limpeza tipográfica | Aceita — Implementada em 0.5.0 (fechamento formal em 0.5.2). Superseded por [ADR-014](ADR-014-action-tokens-role-style.md): collection Brand (modes Default/Ocean/Forest) deletada em 0.8.0, Brand virou paleta única customizável dentro da Foundation. | 2026-04-14 |
| [ADR-006](decisions/ADR-006-semantic-control-tokens.md) | Tokens semânticos de controle para dimensões e tipografia compartilhadas entre controles interativos | Parcialmente substituída — `size.control.*` e `space.control.padding-{x,y}.*` substituídos por escala `size.{xs..5xl}` + `space.{xs..2xl}` + `space.control.padding.10` em **ADR-015** (2026-04-26). O contrato público de anatomia dos componentes foi movido para tokens Component em **ADR-019** (2026-05-10). `typography.control.*` permanece vigente. | 2026-04-15 |
| [ADR-007](decisions/ADR-007-toned-color-system.md) | Estabelecer sistema de cores toned com overlays coloridos e tokens semânticos toned | Aceita — Implementada em 0.5.0 (fechamento formal em 0.5.4, sincronização Figma completa em 0.5.6) | 2026-04-15 |
| [ADR-008](decisions/ADR-008-recalibracao-paletas-feedback.md) | Recalibração das paletas foundation `green` e `amber` | Aceita — Implementada em 0.5.0 | 2026-04-16 |
| [ADR-009](decisions/ADR-009-border-control-vs-decorative.md) | Separação de `border.default` (decorativa) e `border.control` (funcional) | Aceita — Implementada em 0.5.0 | 2026-04-16 |
| [ADR-010](decisions/ADR-010-abolir-white-black-puros.md) | Remoção de `foundation.color.white` e `foundation.color.black` puros | Aceita — Implementada em 0.5.0 | 2026-04-16 |
| [ADR-011](decisions/ADR-011-renaming-tokens-semanticos-de-cor.md) | Reestruturação do naming de tokens semânticos de cor | Aceita — Implementada em 0.5.0 | 2026-04-17 |
| [ADR-012](decisions/ADR-012-typography-tokens-divergence.md) | Tokens de line-height e letter-spacing divergem por design entre Figma e JSON | Aceita | 2026-04-21 |
| [ADR-013](decisions/ADR-013-camadas-de-consumo-de-tokens.md) | Camadas de consumo de tokens — Foundation nunca direto em consumidor final | Aceita — implementada em 0.7.0 e parcialmente substituída por ADR-019 em 2026-05-11 | 2026-04-22 |
| [ADR-014](decisions/ADR-014-action-tokens-role-style.md) | Reestruturação Semantic em `action` × `style` × `prop` × `state` — eliminação de brand/accent e themes | Aceita — implementada em 0.7.0 e estabilizada em 1.0.0-beta.1 | 2026-04-22 |
| [ADR-015](decisions/ADR-015-unificacao-de-size-e-dimension.md) | — Unificação da escala size, eliminação de tokens component-specific e renomeação spacing→dimension | Aceito | 2026-04-26 |
| [ADR-016](decisions/ADR-016-tokens-sem-equivalencia-no-figma.md) | — Tokens sem equivalência no Figma (CSS-only) | Aceito | 2026-04-30 |
| [ADR-017](decisions/ADR-017-componentes-css-only.md) | — Componentes CSS-only (sem equivalência no Figma) | Aceito | 2026-04-30 |
| [ADR-018](decisions/ADR-018-content-naming-strong-default-subtle.md) | — Renomear `content.{default,secondary,tertiary}` para `content.{strong,default,subtle}` | Aceito | 2026-05-06 |
| [ADR-019](decisions/ADR-019-component-tokens-contrato-anatomico.md) | — Reintrodução de Component tokens como contrato anatômico | Aceita | 2026-05-11 |
| [ADR-020](decisions/ADR-020-biblioteca-consumivel-componentes-app-ready.md) | Biblioteca consumível e contrato de readiness dos componentes | Aceita | 2026-07-16 |
