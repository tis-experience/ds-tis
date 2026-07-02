# ADR-008: Recalibração das paletas foundation `green` e `amber`

**Data:** 2026-04-16
**Status:** Aceita — Implementada em 0.5.0

## Implementação

- Paletas `green` e `amber` em `tokens/foundation/colors.json` atualizadas para os valores recalibrados descritos abaixo em `c23661f` (`feat(tokens): recalibrate green/amber palettes + docs + v1.4.0 (ADR-008/009/010)`).
- Binding `feedback.warning.border` apontando para `amber.600` confirmado em `tokens/semantic/light.json`.
- CSS regenerado via `build-tokens.mjs`.

## Contexto

A auditoria de contraste das cores de feedback expôs uma assimetria nas paletas de referência usadas como base do DS. Os L anchors (lightness perceptual em OKLCH) variam entre famílias no mesmo step:

| paleta | L no step 600 | cr vs branco |
|---|---|---|
| neutral.600 | 0.446 | 7.58:1 |
| red.600 | 0.577 | 4.83:1 ✅ |
| sky.600 | 0.588 | 5.17:1 ✅ |
| green.600 | 0.627 | 3.30:1 ❌ |
| amber.600 | 0.666 | 3.19:1 ❌ |

A consequência prática é que a regra implícita do DS ("step 600 é a cor sólida default da família, com foreground branco em superfícies coloridas") só funciona em red e sky. Em green e amber o step 600 não atinge 4.5:1 (WCAG 1.4.3 para texto normal), o que obriga a soluções caso a caso: usar foreground neutral.900 em amber, ou apontar success.default para um step diferente do que feedback.error usa.

Isso quebra duas coisas: a previsibilidade cross-family do sistema (mesmo step, mesmo comportamento) e a regra documentada nos project instructions ("shade 600 ou mais escuro → foreground branco").

A causa é que a calibração das paletas de referência por chroma máximo visível empurra greens e ambers para L mais alto. Trocar steps no binding (apontar success.default para green.700) resolve pontualmente mas mantém a inconsistência de fundo: o step 600 da família green continua sendo um valor que não cumpre o contrato do sistema.

## Decisão

Recalibrar as paletas foundation `green` e `amber` mantendo o hue característico de cada família mas alinhando os L anchors aos da paleta `red` (família que já passa 4.5:1 com branco no step 600). A escala continua de 50 a 950, mantendo a mesma estrutura do schema atual.

### Nova paleta `green` (hue OKLCH 150)

| step | atual | proposto | cr vs branco | cr vs neutral.900 |
|---|---|---|---|---|
| 50 | #F0FDF4 | `#EDF9EF` | 1.08:1 | 16.49:1 |
| 100 | #DCFCE7 | `#D5F2D9` | 1.20:1 | 14.90:1 |
| 200 | #BBF7D0 | `#AEE6B9` | 1.42:1 | 12.60:1 |
| 300 | #86EFAC | `#75D28B` | 1.85:1 | 9.65:1 |
| 400 | #4ADE80 | `#30B65D` | 2.63:1 | 6.78:1 |
| 500 | #22C55E | `#009F42` | 3.48:1 | 5.13:1 |
| **600** | **#16A34A (3.30:1 ❌)** | **`#008535`** | **4.77:1 ✅** | 3.75:1 |
| 700 | #15803D | `#006F2D` | 6.34:1 | 2.82:1 |
| 800 | #166534 | `#035926` | 8.53:1 | 2.09:1 |
| 900 | #14532D | `#07461E` | 11.03:1 | 1.62:1 |
| 950 | #052E16 | `#02240C` | 16.66:1 | 1.07:1 |

### Nova paleta `amber` (hue OKLCH 75)

| step | atual | proposto | cr vs branco | cr vs neutral.900 |
|---|---|---|---|---|
| 50 | #FFFBEB | `#FFF4E3` | 1.09:1 | 16.41:1 |
| 100 | #FEF3C7 | `#FFE3B5` | 1.24:1 | 14.37:1 |
| 200 | #FDE68A | `#FFCA78` | 1.50:1 | 11.88:1 |
| 300 | #FCD34D | `#F1AA34` | 1.99:1 | 8.96:1 |
| 400 | #FBBF24 | `#D28800` | 2.89:1 | 6.17:1 |
| 500 | #F59E0B | `#BB7500` | 3.71:1 | 4.81:1 |
| **600** | **#D97706 (3.19:1 ❌ vs branco)** | **`#A06400`** | **4.86:1 ✅** | 3.67:1 |
| 700 | #B45309 | `#835400` | 6.50:1 | 2.75:1 |
| 800 | #92400E | `#694400` | 8.65:1 | 2.06:1 |
| 900 | #78350F | `#533601` | 11.08:1 | 1.61:1 |
| 950 | #451A03 | `#2E1C01` | 16.37:1 | 1.09:1 |

### Cross-family após recalibração (step 600 + texto branco)

| paleta | cr |
|---|---|
| red.600 | 4.83:1 ✅ |
| sky.600 | 5.17:1 ✅ |
| green.600 (novo) | 4.77:1 ✅ |
| amber.600 (novo) | 4.86:1 ✅ |

## Consequências

### Tokens semânticos afetados

A mudança é em foundation. Os bindings semânticos podem permanecer apontando para os mesmos steps, mas alguns ganham comportamento diferente:

**Light mode (semantic/light.json):**

| Token semantic | Aponta para | Comportamento atual | Comportamento novo |
|---|---|---|---|
| `feedback.success.default` | green.600 | falha 4.5:1 com branco | passa 4.5:1 com branco |
| `feedback.success.hover` | green.700 | OK | OK (mais escuro) |
| `feedback.success.active` | green.800 | OK | OK |
| `feedback.success.text` | green.700 | 5.02:1 vs branco | 6.34:1 vs branco |
| `feedback.success.border` | green.600 | 3.15:1 vs green.50 | passa 3:1 |
| `feedback.warning.default` | amber.500 | precisa fg dark | precisa fg dark (igual) |
| `feedback.warning.border` | amber.500 | 2.07:1 vs amber.50 ❌ | 4.47:1 vs amber.50 ✅ |
| `feedback.warning.text` | amber.700 | 4.84:1 vs amber.50 | 5.97:1 vs amber.50 |

**Decorrência adicional:** com a nova paleta amber, `feedback.warning.border` pode subir do step 500 para o step 600 (#A06400) e ainda passar 3:1 (4.07:1). Sugiro rebinding para manter consistência com error.border (red.600) e info.border (sky.600).

### Decorrência relevante: foreground do success button

Hoje `feedback.success.foreground` aponta para white. Com a nova paleta, success.default (#008535) + branco dá 4.77:1, então o foreground branco passa a fazer sentido (era a intenção original). Nenhuma mudança no binding necessária.

Para o button success em dark mode, o binding atual (`success.default → green.500`, `success.foreground → neutral.900`) continua válido: green.500 novo (#009F42) + neutral.900 = 5.13:1 ✅.

### Componentes afetados

Tudo que consome `feedback.success.*` ou `feedback.warning.*` muda visualmente, sem mudança estrutural:

- Button (variantes Success e Warning, se existir)
- Alert (variantes Success e Warning)
- Badge (variantes correspondentes)
- Input (estado de validação success, se existir)
- Toast/Snackbar (futuro)

### Pipeline

1. Editar `tokens/foundation/colors.json` substituindo os 22 valores (11 green + 11 amber)
2. Regenerar CSS via Style Dictionary
3. Atualizar Figma Variables nas paletas correspondentes
4. Validar visualmente em Storybook ou docs site após o pipeline CSS estar saudável (debt técnica conhecida em `component-inventory.md`)
5. Atualizar `tokens/semantic/light.json` se decidir mover `feedback.warning.border` para amber.600

### Compatibilidade

A mudança é breaking visualmente (cores diferentes do que está no ar). Não é breaking estruturalmente (mesmas chaves, mesmo schema). Como o DS ainda não tem consumers externos formais, o risco é baixo. Bump de minor version no `package.json` é apropriado, com nota no Figma Changelog.

## Alternativas consideradas

**A. Trocar bindings sem recalibrar foundation.**

Apontar `feedback.success.default` para green.700 em vez de green.600, e `feedback.warning.default` para amber.700. Resolve a falha pontual mas não resolve a inconsistência cross-family — o "step 600" continua significando coisas diferentes em famílias diferentes, o que viola a previsibilidade do sistema. Foi descartada.

**B. Manter as paletas de referência sem recalibração e mudar a regra do DS.**

Documentar que "step 600 + foreground branco" só funciona em algumas paletas, e cada família declara seu próprio "default + foreground". Aumenta a carga cognitiva e contradiz o objetivo de tokens AI-readable — uma AI lendo o JSON não consegue inferir comportamento sem ler regra textual em outro lugar. Foi descartada.

**C. Recalibrar todas as paletas (incluindo red e sky) para um padrão único.**

Tecnicamente possível, mas red e sky já passam o critério com folga e a divergência entre L anchors é menor (0.577 vs 0.588). Recalibrar tudo aumenta o blast radius da mudança sem ganho mensurável. Descartada por escopo.

## Referências

- WCAG 2.2 SC 1.4.3 Contrast (Minimum) — texto normal precisa 4.5:1
- WCAG 2.2 SC 1.4.11 Non-text Contrast — UI components precisam 3:1
- ADR-005 (Brand como foundation, regra "shade 600+ → texto branco")
- token-schema.md — regras invioláveis 1, 5, 6
- system-principles.md — seção 3 (Tokens são transversais)
