# ADR-007: Estabelecer sistema de cores toned com overlays coloridos e tokens semânticos toned

**Data:** 2026-04-15
**Status:** Aceita — Implementada em 0.5.0 (fechamento formal em 0.5.4, sincronização Figma completa em 0.5.6)

## Implementação

Toda a camada de código foi executada durante ADR-011:

- **Foundation overlays**: `tokens/foundation/colors.json` contém `foundation.color.overlay.blue-600.{12,20,28}` (light) e `foundation.color.overlay.blue-400.{15,25,32}` (dark). CSS gerado em `css/tokens/generated/foundation.css` emite `--ds-overlay-blue-600-*` e `--ds-overlay-blue-400-*`.
- **Semantic toned**: `semantic.brand.toned.{default,hover,active}` existem em `tokens/semantic/light.json` (linhas 111–127) e `dark.json` (linhas 105–121) referenciando os overlays foundation. CSS gerado: `--ds-brand-toned-*` em `theme-light.css` e `theme-dark.css`.
- **Component button**: `tokens/component/button.json` tem `button.background.toned.{default,hover,active,disabled}` e `button.foreground.toned.{default,disabled}`. Os estados toned apontam para `semantic.brand.toned.*`; o disabled aponta para `semantic.state.disabled.*` e `semantic.content.disabled` (opaco neutro, conforme ADR).
- **CSS consumer**: `css/components/button.css` consome `--ds-brand-toned-*` na variante `.ds-button--toned`. Zero rgba hardcoded.

### Sincronização Figma (0.5.6)

Confirmação do estado real do arquivo Figma `IE68amP9Hya5ieFw1rX8S8` em 2026-04-21:

- Variáveis `color/primary/toned`, `color/primary/toned-hover`, `color/primary/toned-active` (naming flat antigo) **não existem mais** — foram migradas durante ADR-011 para `brand/toned/default`, `brand/toned/hover`, `brand/toned/active` (naming aninhado) apontando para os overlays foundation corretos.
- Variáveis `color/primary/toned-disabled` e `color/primary/toned-disabled-fg` **não existem mais** — removidas durante ADR-011.
- **Rebinding executado em 0.5.6**: as 6 variantes Toned+Disabled do componente Button (3 tamanhos × Icon Only false/true) tinham o background correto (`state/disabled/background`) mas o foreground apontava para `brand/content/contrast-disabled` (o token para texto sobre fill brand sólido disabled) ou para uma variável órfã (`VariableID:2732:1651`). Foram re-vinculadas para `content/disabled` (neutral-400 opaco), conforme a decisão do ADR.

## Pré-requisitos

- ADR-005 implementada (naming do brand consolidado).
- ADR-011 implementada (estrutura `brand/toned/*` já está em vigor no JSON).

## Estimativa de esforço

3 horas. 1h para adicionar os tokens de overlay colorido em `foundation/colors.json` (já presentes parcialmente — ver nota abaixo), 1h para completar os tokens semânticos `brand.toned.*` nos dois modos (parte já implementada via ADR-011), 30min para atualizar `tokens/component/button.json` com os bindings corretos, 30min para Figma e validação.

**Estado atual do código.** Em `tokens/foundation/colors.json` já existem `foundation.color.overlay.blue-600.{12,20,28}` e `overlay.blue-400.{15,25,32}`. `tokens/semantic/light.json` e `dark.json` já têm `semantic.brand.toned.{default,hover,active}` apontando para esses overlays. A implementação está quase pronta; ADR-007 só precisa ser fechada formalmente depois que ADR-005 consolidar o naming.

## Passos concretos para sair do estado Proposta

1. Revisar `tokens/foundation/colors.json` e confirmar que os 6 overlays coloridos cobrem todos os estados (default/hover/active em light e dark).
2. Adicionar tokens equivalentes para feedback se e quando Alert ganhar variante toned (adiamento intencional — só implementar quando houver uso concreto).
3. Atualizar `tokens/component/button.json` garantindo que `button.background.toned.*` referencia `{semantic.brand.toned.*}` (não `rgba` literal).
4. No Figma, renomear variáveis flat (`color/primary/toned`, `-hover`, `-active`) para a hierarquia aninhada (`color/primary/toned/default`, `/hover`, `/active`).
5. Remover `color/primary/toned-disabled` e `color/primary/toned-disabled-fg` do Figma; Button Toned disabled passa a consumir `state/disabled/*`.
6. Executar `npm run build:tokens` e `npm run verify:tokens` para confirmar sincronia.
7. Documentar como mudança estrutural (não breaking visual). Bump patch.

## Contexto

O componente Button tem uma variante de estilo "Toned" que usa fundo colorido translúcido (cor primary com ~12% de opacidade). Essa variante já existe no arquivo Figma com 5 variáveis na coleção Semantic:

| Variável | Light | Dark |
|----------|-------|------|
| `color/primary/toned` | rgba(37,99,235, 0.12) | rgba(96,165,250, 0.15) |
| `color/primary/toned-hover` | rgba(37,99,235, 0.20) | rgba(96,165,250, 0.25) |
| `color/primary/toned-active` | rgba(37,99,235, 0.28) | rgba(96,165,250, 0.32) |
| `color/primary/toned-disabled` | rgba(219,226,240, 0.50) | rgba(43,48,55, 1.00) |
| `color/primary/toned-disabled-fg` | rgba(140,164,217, 0.50) | rgba(255,255,255, 0.60) |

Problemas:

1. Esses tokens existem no Figma mas **não no JSON canônico**, violando o princípio de que JSON é a fonte da verdade.
2. Os tokens semânticos contêm valores rgba literais em vez de referenciar foundation, violando a regra 2 (semantic nunca hardcoded).
3. Os tokens semânticos existentes `*.subtle` e `*.muted` usam cores opacas (ex.: blue.100, blue.50), que é um conceito diferente. Toned usa transparência, permitindo que a superfície de fundo atravesse — crucial para UI em camadas.
4. O componente Alert também tem um estilo "Subtle" que usa fundos opacos claros. Se uma variante "Toned" ou "Inline" do Alert for necessária no futuro, o mesmo pattern de overlay colorido se aplicaria às cores de feedback (success, warning, error, info).
5. A camada foundation já tem `overlay.black.{5,10,20,40,60,80}` e `overlay.white.{...}` — overlays coloridos são a extensão natural desse pattern.

## Decisão

### 1. Estender foundation overlays com variantes coloridas

Adicionar tokens de overlay colorido em `tokens/foundation/colors.json` seguindo o pattern existente de `overlay.black` e `overlay.white`:

```
foundation.color.overlay.primary.{alpha-step}
```

A cor base em light mode vem de `foundation.brand.primary` (blue-600) e em dark mode do equivalente dark (blue-400). Os steps de alpha batem com o uso existente de toned: 12, 15, 20, 25, 28, 32.

Como tokens foundation devem ter valores absolutos (regra 3) e `brand.primary` já é um alias, os overlays coloridos usam os valores resolvidos da paleta diretamente:

```json
// Em colors.json
"foundation.color.overlay.blue-600.12":  { "$type": "color", "$value": "rgba(37, 99, 235, 0.12)" }
"foundation.color.overlay.blue-600.20":  { "$type": "color", "$value": "rgba(37, 99, 235, 0.20)" }
"foundation.color.overlay.blue-600.28":  { "$type": "color", "$value": "rgba(37, 99, 235, 0.28)" }
"foundation.color.overlay.blue-400.15":  { "$type": "color", "$value": "rgba(96, 165, 250, 0.15)" }
"foundation.color.overlay.blue-400.25":  { "$type": "color", "$value": "rgba(96, 165, 250, 0.25)" }
"foundation.color.overlay.blue-400.32":  { "$type": "color", "$value": "rgba(96, 165, 250, 0.32)" }
```

Para cores de feedback, adicionar conforme necessidade (não agora — expandir quando Alert Toned ou componente similar exigir):

```
foundation.color.overlay.red-500.12    (error toned)
foundation.color.overlay.green-500.12  (success toned)
foundation.color.overlay.amber-500.12  (warning toned)
foundation.color.overlay.blue-500.12   (info toned)
```

### 2. Criar tokens semantic toned em light.json e dark.json

```json
// Em light.json
"semantic.brand.toned.default":  { "$value": "{foundation.color.overlay.blue-600.12}" }
"semantic.brand.toned.hover":    { "$value": "{foundation.color.overlay.blue-600.20}" }
"semantic.brand.toned.active":   { "$value": "{foundation.color.overlay.blue-600.28}" }

// Em dark.json
"semantic.brand.toned.default":  { "$value": "{foundation.color.overlay.blue-400.15}" }
"semantic.brand.toned.hover":    { "$value": "{foundation.color.overlay.blue-400.25}" }
"semantic.brand.toned.active":   { "$value": "{foundation.color.overlay.blue-400.32}" }
```

Para o estado disabled toned, reutilizar tokens semânticos existentes:

- `component.button.background.toned.disabled` → `{semantic.state.disabled.background}` (neutro opaco)
- `component.button.foreground.toned.disabled` → `{semantic.content.disabled}` (neutro opaco)

Isso evita criar tokens disabled translúcidos — o estado disabled não precisa do efeito toned de transparência, e um estado disabled neutro opaco é mais claro para acessibilidade.

As variáveis Figma existentes `color/primary/toned-disabled` e `color/primary/toned-disabled-fg` usam valores não padronizados (fora da paleta). Elas serão depreciadas no Figma e substituídas por bindings para `state/disabled/background` e `state/disabled/foreground` no nível do componente.

### 3. Cor de texto para variantes toned

O foreground (texto/ícone) das variantes toned reutiliza o token `semantic.brand.content.default` (blue-700 em light, blue-300 em dark). Nenhum token novo precisa ser criado — `brand.content.default` já existe e é a escolha semântica correta para texto sobre fundo primary translúcido.

### 4. Expansão futura: feedback toned

Quando uma variante toned for necessária para Alert, Badge ou outros componentes de feedback:

1. Adicionar tokens `foundation.color.overlay.{palette}.{alpha}` para a paleta de feedback relevante.
2. Adicionar tokens `semantic.feedback.{type}.toned.{state}` em light.json e dark.json.
3. Adicionar component tokens conforme necessário.
4. Foreground usa o token `semantic.feedback.{type}.content.default` existente (ou `content.contrast` para necessidades de alto contraste).

Segue o mesmo pattern de três camadas, sem mudança arquitetural.

### 5. Convenção de naming para toned

Na camada semantic, estados toned ficam aninhados dentro do grupo da cor pai:

```
semantic.brand.default       (opaco, 100%)
semantic.brand.hover         (opaco, mais escuro)
semantic.brand.subtle        (opaco, step 100 da paleta)
semantic.brand.toned.default (transparente, ~12%)
semantic.brand.toned.hover   (transparente, ~20%)
semantic.brand.toned.active  (transparente, ~28%)
```

O namespace `.toned` deixa a distinção clara: toned = transparente, subtle = opaco claro.

No Figma, as variáveis existentes são flat: `color/primary/toned`, `color/primary/toned-hover`. Devem ser reestruturadas para `color/primary/toned/default`, `color/primary/toned/hover`, `color/primary/toned/active` para casar com a hierarquia do JSON.

No CSS, geradas como: `--ds-brand-toned-default`, `--ds-brand-toned-hover`, `--ds-brand-toned-active`.

## Consequências

- **Tokens (Foundation):** +6 tokens de overlay colorido em colors.json (blue-600 × 3 alphas + blue-400 × 3 alphas). Mais tokens quando feedback toned for implementado.
- **Tokens (Semantic):** +3 tokens por modo (toned.default, toned.hover, toned.active) em light.json e dark.json. Total +6. Remoção de `toned-disabled` e `toned-disabled-fg` do semantic (movidos para o nível de componente referenciando tokens de disabled existentes).
- **Tokens (Component):** button.json ganha `background.toned.{default/hover/active/disabled}` e `foreground.toned.{default/disabled}` referenciando os novos tokens semânticos.
- **CSS:** Novas variáveis `--ds-brand-toned-default/hover/active`. Novas `--ds-overlay-blue-600-12/20/28`, `--ds-overlay-blue-400-15/25/32`.
- **Figma:** Renomear `color/primary/toned` → `color/primary/toned/default` (e hover, active). Deletar `color/primary/toned-disabled` e `color/primary/toned-disabled-fg`. Atualizar bindings do Button para referenciar as variáveis renomeadas. Os valores rgba em si permanecem iguais — é mudança estrutural, não visual.
- **Docs:** Nova subseção na documentação de cores: "Toned colors". Docs do Button atualizadas para explicar a distinção toned vs subtle/muted. `token-schema.md` atualizado com o pattern toned.
- **Breaking changes:** Renomeação de variáveis Figma de flat para aninhada. Sem breaking change no CSS (essas variáveis não existiam no CSS antes).

## Alternativas consideradas

**A) Usar `semantic.brand.subtle` para variantes toned.** Descartada porque subtle (blue-100) é opaca. Toned exige transparência para se adaptar a diferentes superfícies de fundo. A distinção visual e funcional é real.

**B) Colocar valores rgba diretamente na camada semantic sem foundation overlays.** Descartada porque viola a regra 2 (tokens semânticos nunca contêm valores hardcoded). A camada foundation overlay fornece os valores brutos; semantic dá a intenção.

**C) Criar uma coleção Figma separada "Toned".** Descartada porque toned é um estado/variante da cor primary, não um sistema separado. Pertence à mesma coleção Semantic junto de default, hover, subtle etc.

**D) Usar a propriedade CSS `opacity` em vez de alpha rgba.** Descartada porque `opacity` afeta o elemento inteiro, incluindo texto e filhos. Alpha rgba no background afeta apenas o fill, deixando o texto em opacidade total — que é o comportamento desejado.
