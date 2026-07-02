# Brand principles — [NOME DA MARCA]

> Template para ser preenchido com os princípios da marca.
> Este documento alimenta tanto o Claude Project quanto o doc site.

## Missão

[Uma frase. O que a marca existe para fazer.]

## Princípios de design

> Estes princípios orientam toda decisão de design — de tokens a componentes a patterns.
> Cada princípio deve ser acionável: alguém deve conseguir olhar para um componente e dizer
> "isso está alinhado com o princípio X" ou "isso viola o princípio Y".

### 1. [Princípio]
[Descrição de 2-3 frases. O que isso significa na prática.]
**Exemplo concreto:** [como isso se manifesta num componente ou decisão]
**Anti-padrão:** [o que violaria esse princípio]

### 2. [Princípio]
[Descrição]
**Exemplo concreto:** [...]
**Anti-padrão:** [...]

### 3. [Princípio]
[Descrição]
**Exemplo concreto:** [...]
**Anti-padrão:** [...]

---

## Tom de voz

### Atributos
- [Adjetivo 1]: [o que isso significa na comunicação]
- [Adjetivo 2]: [...]
- [Adjetivo 3]: [...]

### Isso, não aquilo
| Isso ✓ | Não isso ✗ | Por quê |
|--------|-----------|---------|
| [exemplo] | [exemplo] | [razão] |
| [exemplo] | [exemplo] | [razão] |

---

## Identidade visual

### Cores da marca
| Role | Token | Valor | Uso |
|------|-------|-------|-----|
| Primary | `foundation.brand.primary` | [hex] | CTA, links, foco |
| Secondary | `foundation.brand.secondary` | [hex] | Complementar, destaques |
| ~~Accent~~ | *(não definido — foundation só tem `primary`/`secondary`. Se precisar de 3ª cor, criar em ADR)* | — | — |

### Tipografia
| Role | Font | Fallback | Uso |
|------|------|----------|-----|
| Headings | [font] | [fallback] | Títulos, destaque |
| Body | [font] | [fallback] | Texto corrido |
| Code | [font] | [fallback] | Code snippets, dados |

### Logo
- Versão principal: [descrição/localização]
- Versão reduzida: [descrição/localização]
- Área de segurança: [regras]
- Uso indevido: [o que não fazer]

---

## Acessibilidade como princípio

A marca se compromete com WCAG 2.2 AA como mínimo. Isso implica:
- Contrastes validados em todas as combinações de cor do DS
- Navegação por teclado funcional em todos os componentes
- Screen reader support testado com VoiceOver (macOS/iOS)
- Motion reduzida respeitada via `prefers-reduced-motion`
- Focus visible nunca removido ou escondido
