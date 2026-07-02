# ADR-002: Stack agnóstica — HTML + CSS + vanilla JS como base

**Data:** 2026-04-14
**Status:** Aceita

## Contexto

O DS precisa servir como fundação para projetos futuros cuja stack ainda não foi definida (React, Vue, SwiftUI, ou outra). Definir a stack agora acoplaria o DS a uma tecnologia prematuramente.

## Decisão

O DS é implementado em HTML + CSS + vanilla JS. Componentes são classes CSS (.ds-button, .ds-input, etc.) sem dependência de runtime JS para funcionalidade visual básica. JS é usado apenas para comportamentos interativos (modal open/close, tooltip positioning, etc.).

Tokens em JSON (DTCG) + Style Dictionary permitem gerar outputs para qualquer plataforma quando a stack for definida.

Storybook será implementado com @storybook/html para playground de componentes — sem dependência de framework.

## Consequências

- Componentes não têm props, state management, ou lifecycle — são classes CSS
- A migração futura para React/Vue/SwiftUI será de implementação de componentes, não de redesign
- Tokens e documentação são 100% portáveis
- Storybook stories são HTML strings, não JSX

## Alternativas consideradas

**Web Components:** Framework-agnostic com encapsulamento. Descartado por adicionar complexidade de Shadow DOM e slots que não seria aproveitada na migração futura para React/SwiftUI.

**React como base:** Descartado por acoplar prematuramente. React components não ajudam em iOS/macOS (SwiftUI).
