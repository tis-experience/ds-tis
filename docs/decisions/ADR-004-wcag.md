# ADR-004: WCAG 2.2 AA como padrão de acessibilidade

**Data:** 2026-04-14
**Status:** Aceita — Implementada em 0.5.0

## Implementação

- `prefers-reduced-motion` adicionado a todos os componentes com transitions em `ecc45a7` (`feat(a11y): add prefers-reduced-motion to all components with transitions (ADR-004)`).
- Focus rings granulares e migração dos componentes remanescentes em `4a574ed`, `a1d295f`, `384cdf6`, `82b40f4` (todos 0.5.0).

## Contexto

O DS precisa de um padrão de acessibilidade definido e operacionalizado em regras concretas.

## Decisão

WCAG 2.2 AA é o piso obrigatório. Regras operacionais:

**Contraste de texto:**
- Fundo shade 400 ou mais claro → foreground neutral-900
- Fundo shade 600 ou mais escuro → foreground branco
- text/on-brand: branco em Light (fundo escuro), neutral-900 em Dark (fundo claro 400-level)
- feedback/info/foreground: neutral-900 em ambos os modos (sky-500/400 são claros demais para branco)

**Focus:**
- Focus ring obrigatório em todo elemento interativo
- Implementação: frame absoluto 2px stroke + 2px gap, contraste ≥ 3:1
- clipsContent = false no componente pai no Figma

**Target size:**
- Mínimo 32px (supera o requisito AA de 24px)
- Large (48px) atende AAA (44px touch)

**Cor como informação:**
- Estados nunca comunicados apenas por cor — sempre acompanhados de indicador visual (focus ring, texto esmaecido, ícone)

**Boas práticas adicionais (além da WCAG):**
- Respeitar prefers-reduced-motion para animações
- aria-label obrigatório em Icon Only buttons
- Semantic HTML (button para ações, a para navegação)
- Tab order lógica em componentes compostos (Modal, Tabs)
- Testar com: axe-core, VoiceOver (macOS), teclado only

## Consequências

- Todo novo token de cor precisa ter contraste verificado antes de commit
- Todo componente precisa de seção de acessibilidade na documentação Figma
- CSS de componentes precisa incluir :focus-visible e prefers-reduced-motion

## Alternativas consideradas

**WCAG 2.2 AAA:** Ideal mas impraticável como padrão obrigatório — exige contraste 7:1 que limita paleta de cores severamente. Alcançar AAA onde possível (target size Large já atende).
