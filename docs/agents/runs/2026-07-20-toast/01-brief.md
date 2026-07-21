- Status: Aguardando aprovação do owner

# Brief proposto

- Nome: Toast
- Classe: Overlay / feedback transitório (não modal)
- Problema: Apps precisam de feedback não bloqueante após ações (salvo, falhou, desfazer). Hoje Alert é persistente no fluxo, Modal é bloqueante e Tooltip não permite ação. Docs já apontam “Toast — futuro”.
- Usar quando: Confirmar ou reportar resultado transitório sem tirar o usuário do contexto; opcionalmente oferecer uma ação rápida (Desfazer, Retry) ligada à mesma notificação.
- Nao usar quando: Mensagem deve permanecer no layout (use Alert); decisão exige foco e confirmação (use Modal); conteúdo é só label de ícone no hover (use Tooltip); conteúdo interativo denso ou formulário ancorado a um trigger (use Popover — run futura).
- Diferencas para componentes proximos:
  - **Alert:** contextual e persistente até dismiss; vive no fluxo da página.
  - **Modal:** bloqueia interação; focus trap.
  - **Tooltip:** hover/focus; sem ação; não é live region de status.
  - **Toast:** viewport overlay, fila, auto-hide (quando seguro), ação opcional, anuncia via live region sem mover foco.
- Acessibilidade/semantica:
  - WCAG **4.1.3 Status Messages:** região(ões) live pré-montadas; injetar toasts nela(s).
  - `role="status"` / polite para success, info, warning; `role="alert"` / assertive só para error.
  - Não mover foco para o toast.
  - Dismiss sempre disponível (botão close + Escape no toast focado).
  - WCAG **2.2.1 Timing:** com botão de ação, **sem auto-hide por padrão** (ou só com pausa obrigatória em hover/focus e duração ≥ 10s documentada); ação “Desfazer/Retry” deve ser redundante no produto quando possível.
  - Auto-hide padrão sem ação: 5s; pausa em hover/focus; resume ao sair.
  - `prefers-reduced-motion`: reduzir/eliminar animação de entrada/saída.
- Composicao DS:
  - Ícones Lucide alinhados ao Alert (`circle-check`, `triangle-alert`, `circle-alert`, `info`).
  - Ação = **Button** `ds-button--ghost ds-button--sm` (não inventar estilo).
  - Close = botão icon-only ghost/sm com `aria-label` (padrão Alert).
  - Elevation/shadow via tokens de surface/shadow existentes; z via `foundation.z.50` (Semantic `z.toast` a criar no repo).
- Variants/states candidatos:
  - Type: `success` | `warning` | `error` | `info`
  - Style visual: `subtle` (default, alinhado Alert subtle) — `filled` fora do MVP se aumentar escopo
  - Show Action: boolean
  - Show Description: boolean (título obrigatório no MVP)
  - States runtime: entering / visible / exiting; paused (hover/focus)
- Slots: conteúdo textual (title, description); ação é property TEXT + boolean, não slot livre no MVP
- Tokens: Component `toast/*` aliasando Semantic `feedback/*`, `content/*`, `space/*`, `radius/*`, `shadow/*`, `z.toast`; tipografia label/body existentes. Motion: duration/ease Semantic (entrada overlay). Sem Foundation direto no CSS.
- Docs Figma: página `Toast` com frame raiz único + seções (padrão vivo Alert/Modal).
- Impacto repo: `css/components/toast.css`, `js/toast.js`, export `ds-tis/toast`, catálogo Experimental→App-ready após gate, `docs/toast.html`, atualizar Alert/Modal (“Toast — futuro”), testes lifecycle/consumer/visual, CHANGELOG; SemVer **minor** na release (`1.1.0`), sem bump neste PR.
- Fora de escopo: Popover; Table; adaptadores framework; posicionamento por âncora (toast é viewport); rich HTML arbitrário; fila persistente cross-page; bump/npm publish.
- Bloqueado antes de: escrita Figma; tokens/CSS/JS/docs de produto; commit/push/PR — até aprovação explícita deste brief + `02-figma-spec.md`.
- Aprovacao necessaria: (1) anatomia e diferenciação Alert/Modal/Tooltip; (2) MVP com ação + fila (max 5); (3) regras a11y live region + timing com ação; (4) runtime `ds-tis/toast` required; (5) Figma-first depois desta aprovação.

## Estado atual isolado

- Preflight 2026-07-20: `main` limpa em `ecd72fe`, branch `feat/toast` criada, run `docs/agents/runs/2026-07-20-toast`.
- Snapshot Figma ~27h (stale para sync de tokens Figma-canônicos); regenerar antes do Token Sync / bindings Component.
- Trabalho desta role: apenas `01-brief.md` e `02-figma-spec.md`.

## Benchmark

| Fonte | Aprendizado aplicado |
|-------|----------------------|
| DS TIS Alert | Tipos success/warning/error/info, ícones, close, anatomia filled/subtle |
| DS TIS Modal / Tooltip | Runtime init/destroy, eventos `ds-*`, z-index overlay |
| foundations-zindex | Toast no topo (`--ds-z-50`) |
| WAI-ARIA / WCAG 4.1.3 | Live region pré-montada; polite vs assertive |
| Padrões toast a11y | Pausar timer em hover/focus; ação + auto-dismiss exige cuidado 2.2.1 |
| Polaris / Radix (conceitual) | Stack viewport, dismiss, action opcional, não roubar foco |

## Classificação final

Overlay de feedback transitório com **runtime do DS** (`behaviorModel: ds-runtime`, `runtime.level: required`). Readiness inicial **Experimental** até `test:app-ready` verde; depois App-ready.

## Anatomia HTML proposta

```html
<div class="ds-toast-region" data-ds-toast-region>
  <!-- polite: success | info | warning -->
  <div class="ds-toast-region__polite" role="status" aria-live="polite" aria-relevant="additions"></div>
  <!-- assertive: error -->
  <div class="ds-toast-region__assertive" role="alert" aria-live="assertive" aria-relevant="additions"></div>
</div>

<div class="ds-toast ds-toast--success" data-ds-toast>
  <span class="ds-toast__icon">…</span>
  <div class="ds-toast__content">
    <p class="ds-toast__title">…</p>
    <p class="ds-toast__description">…</p>
  </div>
  <button type="button" class="ds-button ds-button--ghost ds-button--sm ds-toast__action">Desfazer</button>
  <button type="button" class="ds-toast__close" aria-label="Dispensar">…</button>
</div>
```

## Runtime público proposto

| API | Papel |
|-----|--------|
| `initToasts(root?)` | Monta/observa region; retorna handles |
| `destroyToasts(root?)` | Limpa timers/listeners |
| `showToast(options)` | Enfileira (`type`, `title`, `description?`, `actionLabel?`, `onAction?`, `duration?`) |
| `dismissToast(id)` | Remove um toast |
| Eventos | `ds-toast-show`, `ds-toast-dismiss`, `ds-toast-action` |

Fila: máximo **5** visíveis; novo no topo; excedentes removem o mais antigo.

## Decisões pedidas ao owner

1. Style visual MVP = **subtle only** (filled numa iteração seguinte)?
2. Posição da region: **canto inferior-direito** (LTR) como default?
3. Confirmar: com `actionLabel`, **sem auto-hide** (só dismiss manual / Escape)?

## Handoff bloqueado

- Próxima role após aprovação: **Figma Builder**
- Entrada: este brief + `02-figma-spec.md`
- Não escrever Figma até o owner aprovar este gate
