# ADR-010: Remoção de `foundation.color.white` e `foundation.color.black` puros

**Data:** 2026-04-16
**Status:** Aceita — Implementada em 0.5.0

## Implementação

- `foundation.color.white` e `foundation.color.black` removidos de `tokens/foundation/colors.json` em `f9f7609` (`fix(tokens): migrate theme overrides and foundation to ADR-011 naming; remove white/black (ADR-010)`).
- `neutral.950` suavizado para `#070C17` no mesmo commit.
- Bindings semânticos que apontavam para `{foundation.color.white}` migrados para `{foundation.color.neutral.50}`.
- Arquivos CSS legados removidos em `07cc24d` (`chore(tokens): remove orphaned CSS files (ADR-010 closes)`).

## Contexto

A foundation atual contém dois tokens de cor pura:

```
foundation.color.white  = #FFFFFF (L OKLCH = 1.000)
foundation.color.black  = #000000 (L OKLCH = 0.000)
```

Ambos são consumidos em bindings semânticos ativos do light mode:

- `background.default`, `surface.default`, `surface.raised` → white
- `text.on-brand`, `color.primary.foreground` → white
- `feedback.success.foreground`, `feedback.error.foreground` → white

O uso de branco e preto puros como cores sólidas de UI tem problemas conhecidos e documentados na literatura de design e ergonomia visual:

**Branco puro (#FFFFFF):**

- Reflectância máxima causa strain ocular em sessões longas. Papel branco real reflete ~88% da luz, o que mapeia para L≈0.96. O olho não está adaptado a 100% de brilho.
- Em ambientes escuros, dispara miose (contração pupilar) repetida ao alternar entre tela e ambiente, causando fadiga.
- Aumenta percepção de glare em telas brilhantes.

**Preto puro (#000000):**

- Em telas OLED, pixels totalmente desligados criam efeito "buraco" em torno de texto branco, com smear visível em scroll.
- Contraste 21:1 com branco é cansativo em leitura corrida (estudos de tipografia recomendam 13–18:1 como sweet spot).
- iOS, Material 3, Linear, Vercel, Polaris — todos os DSs maduros recentes evitam #000 como background.

A escala neutral atual já tem a versão "saudável" desses extremos:

```
neutral.50  = #F8FAFC  (L = 0.984, off-white slate)
neutral.950 = #020617  (L = 0.129, near-black)
```

A neutral.50 é tecnicamente correta como off-white. A neutral.950 está no limite inferior aceitável e merece suavização.

## Decisão

Remover `foundation.color.white` e `foundation.color.black` da paleta foundation, usando `neutral.50` e `neutral.950` como extremos universais. Suavizar ligeiramente `neutral.950` para reduzir efeito OLED-hole.

### Mudanças em foundation/colors.json

| token | atual | novo |
|---|---|---|
| `foundation.color.white` | #FFFFFF | **REMOVER** |
| `foundation.color.black` | #000000 | **REMOVER** |
| `foundation.color.neutral.950` | #020617 (L=0.129) | `#070C17` (L=0.150) |

A suavização de neutral.950 mantém o tom slate (mesmo hue OKLCH ~262), aumenta L de 0.129 para 0.150, e reduz contraste com branco de 20.17:1 para ~19:1 — diferença imperceptível para legibilidade mas suficiente para evitar pixel-off em OLED.

### Mudanças em semantic/light.json

| token | binding atual | binding novo | impacto contraste |
|---|---|---|---|
| `background.default` | `{foundation.color.white}` | `{foundation.color.neutral.50}` | text.default: 17.85 → 17.06:1 |
| `surface.default` | `{foundation.color.white}` | `{foundation.color.neutral.50}` | igual |
| `surface.raised` | `{foundation.color.white}` | `{foundation.color.neutral.50}` | igual |
| `text.on-brand` | `{foundation.color.white}` | `{foundation.color.neutral.50}` | sobre primary.default: 5.17 → 4.94:1 |
| `color.primary.foreground` | `{foundation.color.white}` | `{foundation.color.neutral.50}` | sobre primary.default: 5.17 → 4.94:1 |
| `feedback.success.foreground` | `{foundation.color.white}` | `{foundation.color.neutral.50}` | depende da nova paleta (ADR-008) |
| `feedback.error.foreground` | `{foundation.color.white}` | `{foundation.color.neutral.50}` | sobre error.default: 4.83 → 4.65:1 ✅ |

Todas as combinações continuam passando WCAG 1.4.3 AA (4.5:1) ou estão no limite aceitável. A diferença é perceptualmente irrelevante.

### Mudanças em semantic/dark.json

`text.on-brand` e `*.foreground` que apontam para `neutral.900` permanecem como estão (já não usavam white em dark mode).

`background.default`, `surface.default`, `surface.raised` apontam para `neutral.950` ou `neutral.900` (já não usavam black). Apenas o valor de `neutral.950` muda automaticamente para a nova versão suavizada.

## Consequências

### Pipeline

1. Remover entradas `white` e `black` em `tokens/foundation/colors.json`
2. Atualizar `tokens/foundation/colors.json` substituindo o valor de `neutral.950`
3. Atualizar `tokens/semantic/light.json` em todos os bindings que apontavam para `{foundation.color.white}`
4. Regenerar CSS via Style Dictionary (vai remover `--ds-color-white`, `--ds-color-black`, atualizar `--ds-color-neutral-950`)
5. Atualizar Figma Variables removendo `color/white` e `color/black` da coleção Foundation, e atualizando `color/neutral/950`
6. Buscar uso direto de `#FFFFFF`, `#FFF`, `white`, `#000000`, `#000`, `black` no código CSS dos componentes e substituir por referências a tokens
7. Validar que nenhum component token ainda referencia `{foundation.color.white}` ou `.black`

### Componentes afetados

Mudança visual mínima em todos os componentes que renderizam fundo branco ou texto branco sobre cor sólida. A diferença entre #FFFFFF e #F8FAFC é aproximadamente 2% em luminância — perceptível apenas em comparação direta lado a lado.

### Tokens de overlay

Os tokens `foundation.color.overlay.white.*` e `foundation.color.overlay.black.*` permanecem, pois usam rgba aplicado como sobreposição (não como cor sólida de superfície). Os problemas de strain e OLED-hole não se aplicam a overlays semitransparentes.

### Casos de uso para preto/branco puro

Se algum caso futuro precisar de pureza absoluta (ex: render para impressão, alto contraste forçado, sinalização de teste), o valor pode ser declarado inline com `$description` justificando, sem reintroduzir o token foundation.

### Documentação

- Atualizar `token-schema.md` removendo `white` e `black` da lista de tokens em `colors.json` e atualizando o valor de `neutral.950`
- Atualizar tabela de mapeamento JSON ↔ CSS ↔ Figma
- Adicionar nota em `system-principles.md` sobre a abolição de cores puras como princípio do DS
- No site de docs, página de Foundation/Colors precisa refletir a remoção

### Compatibilidade

Estruturalmente breaking (tokens removidos). Não breaking visualmente para o usuário final. Como o DS ainda não tem consumers externos formais, o risco é baixo. Bump minor version. Code review nos componentes para garantir que ninguém referencia `--ds-color-white` ou `--ds-color-black` diretamente após a regeneração.

### Atualizar regra inviolável do token-schema

Adicionar à lista de regras invioláveis em `token-schema.md`:

> **11. Cores puras (#FFFFFF e #000000) não são tokens foundation.** Use `neutral.50` como off-white e `neutral.950` como near-black. Casos excepcionais devem usar valor inline com `$description` justificando.

## Alternativas consideradas

**A. Manter `white` e `black` mas desencorajar uso via documentação.**

Sem enforcement automático, a tendência é que apareçam em PRs futuros por hábito ou por copy-paste de outros projetos. Descartada porque "não usar" precisa ser uma propriedade do sistema, não da disciplina.

**B. Renomear `white` → `neutral.0` e `black` → `neutral.1000`, mantendo valores puros.**

Resolve apenas o naming, não o problema visual. Descartada.

**C. Criar `foundation.color.surface.top` e `surface.bottom` como tokens semânticos novos para essa camada.**

Adiciona uma camada conceitual nova só para acomodar dois valores. A escala neutral já cobre essa função (50 e 950 são exatamente os extremos da escala). Descartada por excesso de abstração.

**D. Suavizar neutral.950 sem remover white/black.**

Resolve metade do problema. Descartada porque o uso de white puro como background.default continua sendo o ponto mais problemático em sessões longas.

## Referências

- W3C WAI Working Group — orientação informal sobre evitar contraste máximo em interfaces de leitura prolongada
- Material Design 3 — uso de surface tonal em vez de white puro
- iOS Human Interface Guidelines — system colors usam off-white/near-black
- ADR-008 (recalibração de paletas — relacionado, mas independente)
- ADR-009 (border.control vs border.default — independente)
- token-schema.md — atualizar regras invioláveis
