# ADR-016 — Tokens sem equivalência no Figma (CSS-only)

- **Status:** Aceito
- **Data:** 2026-04-30
- **Relaciona:** ADR-003 (Figma como fonte de verdade), ADR-013 (2-layer architecture)

## Contexto

ADR-003 define Figma Variables como fonte de verdade de **valores de token**, com JSON consolidando o que vive no Figma e CSS sendo derivado. A regra operacional consequente — "nunca editar `tokens/*.json` à mão; alterações vêm do Figma" — assume que toda categoria de token tem representação nativa em Figma Variables.

**Nem toda categoria tem.** Há propriedades CSS que o Figma não expressa como Variable:

| Categoria | Equivalência Figma | Status |
|---|---|---|
| `color`, `dimension`, `radius`, `opacity`, `border-width`, `typography` | Variables nativas | Figma é fonte de verdade |
| `shadow` | **Effect Styles** (não Variables) — Figma trata sombra como style composto, não como variável bindável | Dupla fonte: Effect Style para preview visual, JSON para CSS |
| `motion` (`duration`, `ease`) | Nenhuma — Smart Animate é runtime, não token | **JSON é fonte de verdade** |
| `z-index` | Nenhuma — Figma usa ordem de camada, não z-index numérico | **JSON é fonte de verdade** |

Forçar essas categorias para o Figma é cargo culting da regra: cria Variables que ninguém binda a nada, polui pickers, e desvia a edição da fonte real (CSS de componente que consome).

A regra "Figma é fonte de verdade" deveria ter sido escrita "**Figma é fonte de verdade para propriedades que Figma sabe representar nativamente**". Esta ADR codifica essa qualificação.

## Decisão

### Categorias CSS-only (JSON canônico)

As seguintes categorias **vivem só em JSON** (`tokens/foundation/*.json`, `tokens/semantic/*.json`) e CSS gerado. Não existem como Figma Variables. Edição direta no JSON é permitida e esperada:

- **`motion.*`** — `foundation.duration.{fast,normal,slow}`, `foundation.ease.{default,...}`, e qualquer alias semantic correspondente
- **`z.*`** — `foundation.z.{0,10,20,30,40,50}`, `semantic.z.{tooltip,modal,...}`
- **`shadow.*`** (parcial) — `foundation.shadow.{sm,md,lg,xl,2xl}` é canônico no JSON. O Figma mantém `elevation/1..4` como Effect Styles para preview visual e composição em mockups, mas a fonte da CSS é o JSON. Quando os dois divergem, JSON ganha; Effect Styles são atualizados manualmente para refletir.

### Categorias Figma-canônicas (regra padrão)

Para todas as demais categorias — `color`, `dimension`, `radius`, `opacity`, `border-width`, `typography`, `space`, `size`, `surface`, `background`, `content`, `border`, etc. — **vale a regra padrão de ADR-003**: Figma é fonte de verdade, JSON espelha via sync, edição direta no JSON é proibida.

### Enforcement

- `npm run sync:tokens-from-figma` ignora categorias CSS-only ao comparar Figma vs JSON. Não reporta `MISSING_IN_FIGMA` para tokens em `motion.*`, `z.*`, `shadow.*`.
- `npm run verify:tokens` valida normalmente: tokens CSS-only ainda precisam de `$type`, `$value`, alias chain válida, paridade light/dark.
- Adicionar uma nova categoria à lista CSS-only **exige nova ADR ou amendment a esta**. A presunção continua sendo "Figma é fonte"; a exceção precisa ser justificada.

### Critério para adicionar categoria à lista

Uma categoria é CSS-only quando atende **um dos dois**:

1. **Nenhuma representação Figma**: a propriedade CSS não tem conceito equivalente em Figma (z-index, transition timing).
2. **Representação Figma não-bindável**: a propriedade existe em Figma mas como style composto não-variável (shadow → Effect Style). Nesse caso, JSON é canônico para CSS; o objeto Figma é mantido manualmente para preview.

Categorias que têm Variable Figma — mesmo se subutilizadas hoje — **não** entram na lista. Elas são débito de adoção, não exceção arquitetural.

## Consequências

- **Designers** podem ignorar Variables do Figma para motion/z-index/shadow. Quando um componente Figma precisar mostrar shadow, usa Effect Style local (`elevation/1..4`) — não há Variable a bindar.
- **Devs/IAs** podem editar `tokens/foundation/{motion,z-index,shadows}.json` e `tokens/semantic/*.json` (entradas em `motion.*`, `z.*`, `shadow.*`) diretamente, rodar `npm run build:tokens`, commitar. Não exige passagem pelo Figma.
- **Sync Figma → JSON** continua sendo o caminho para todas as outras categorias. A lista CSS-only é uma exceção pequena e bem delimitada.
- **Drift histórico**: as paletas Foundation `blue/purple/cyan/emerald/indigo` (55 vars no JSON, 0 consumers no Figma) **não** entram na lista. Elas são débito de remoção, não CSS-only — categoria `color` tem representação Figma plena.

## Alternativas consideradas

### (a) Forçar todas as categorias para o Figma

Descartada. Criar Variables sem uso real polui o sistema, força designers a navegar por categorias irrelevantes, e ainda assim não resolve shadow (que conceitualmente é Effect Style).

### (b) Mover essas categorias para arquivo separado fora de `tokens/`

Descartada. JSON DTCG é o formato canônico do design system inteiro; criar segundo formato/local fragmenta o pipeline. Style Dictionary, registry, llms.txt, todos esperam encontrar em `tokens/`.

### (c) Implementar shadow como Variables no Figma via composição

Descartada. Figma Variables não suportam composição shadow nativamente. Workarounds (variable por offset/blur/spread) são frágeis e quebram preview ao publicar library.

## Referências

- [ADR-003](./ADR-003-fontes-verdade.md) — Figma como fonte de valor (regra geral, agora qualificada).
- [ADR-013](./ADR-013-camadas-de-consumo-de-tokens.md) — arquitetura 2-layer (Foundation → Semantic).
- `tokens/foundation/{motion,shadows,z-index}.json` — categorias cobertas por esta ADR.
- `docs/system-principles.md` — princípio "Hierarquia de verdade" atualizado para refletir esta exceção.
- `CLAUDE.md` — regra operacional de edição de JSON atualizada.
