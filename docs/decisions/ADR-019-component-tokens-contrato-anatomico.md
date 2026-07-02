# ADR-019 — Reintrodução de Component tokens como contrato anatômico

- **Status:** Aceita
- **Data:** 2026-05-11
- **Substitui:** partes de ADR-013 e ADR-015 que eliminavam a camada Component como regra geral
- **Relaciona:** ADR-006, ADR-013, ADR-015, ADR-017

## Contexto

ADR-013 estabilizou a arquitetura em duas camadas, Foundation -> Semantic, depois de uma migração que eliminou a antiga collection Component. A decisão corrigiu um problema real: muitos tokens Component eram wrappers mecânicos 1:1 sem contrato próprio, por exemplo um token por componente apenas para repetir a mesma cor, motion ou dimensão já expressa por Semantic.

A auditoria dimensional de controles de formulario mostrou outro problema. Componentes com a mesma variant nominal (`sm`, `md`, `lg`) podem precisar de partes anatômicas com tamanhos diferentes:

- Input e Button usam 32/40/48 como altura visual e área interativa.
- Checkbox e Radio usam 32/40/48 como área interativa, mas o ícone visual é 16/20/24.
- Toggle usa 32/40/48 como área interativa, mas a track visual precisa manter proporções próprias.

Sem Component tokens, a implementação precisa escolher entre duas opções ruins:

1. Consumir `semantic.size.xs/sm/md` diretamente em `Checkbox sm/md/lg`, o que parece inconsistente para quem lê a documentação do componente.
2. Criar nomes Semantic artificiais ou específicos demais, como `control.track-width`, tentando esconder uma decisão que na prática pertence ao Toggle.

Design systems de referência usam uma camada equivalente a Component tokens para expor contratos anatômicos de componente. Material Web distingue tokens de sistema (`--md-sys-*`) de tokens de componente (`--md-switch-*`, `--md-checkbox-*`). Carbon documenta component tokens como propriedades associadas a um componente específico. Spectrum modela `component`, `anatomy`, `property`, `variant` e `state` como eixos legítimos de classificação de tokens.

## Decisao

Reintroduzir a camada **Component** como camada de contrato anatômico e de consumo dos componentes.

Nova cadeia:

```txt
Foundation/Core -> Semantic/System -> Component -> implementacao
```

### Responsabilidades por camada

#### Foundation/Core

Primitivos sem intenção de uso:

```txt
foundation.dimension.40
foundation.color.brand.600
foundation.radius.4
foundation.border.width.1
```

Foundation não fala de componente, estado de UI ou anatomia.

#### Semantic/System

Decisões reutilizáveis do sistema:

```txt
semantic.size.xl
semantic.space.md
semantic.primary.background.default
semantic.feedback.error.content.default
semantic.border.control.default
```

Semantic não deve conter nome de componente. `control` continua permitido quando o conceito é reutilizável por vários controles, não quando nomeia uma parte exclusiva de um componente.

#### Component

Contrato publico e anatômico de cada componente:

```txt
component.checkbox.target.height.sm
component.checkbox.box.size.sm
component.checkbox.mark.size.sm
component.toggle.track.width.md
component.toggle.thumb.size.md
component.input.height.md
```

Component tokens podem ser alias 1:1 para Semantic quando esse alias documenta uma parte pública e estável da anatomia do componente. O problema a evitar não é o alias 1:1; é criar wrapper sem anatomia, sem contrato e sem uso claro.

### Naming

Formato canônico DTCG:

```txt
component.<component>.[<part>.]<property>.<variant-or-state>
```

Formato canônico no Figma:

```txt
<component>/[<part>/]<property>/<variant-or-state>
```

No Figma, o prefixo de camada nao entra no nome da variable porque a propria collection `Component` ja define a camada. Assim, `button/height/md` na collection `Component` corresponde a `component.button.height.md` em DTCG. Nao usar `component/button/...` dentro da collection `Component`, porque isso duplica a camada como `Component/component/...` na UI.

O segmento `<part>` é opcional. Ele deve aparecer quando existe anatomia real ou ambiguidade entre partes do componente (`checkbox.target`, `checkbox.box`, `toggle.track`, `toggle.thumb`, `button.label`, `button.icon`, `button.focus-ring`). Quando a propriedade pertence ao componente como um todo ou à superfície principal, o path deve ser mais curto:

```txt
component.button.height.md
component.button.bg.brand.default
component.input.height.sm
component.avatar.size.md
```

Não usar `root` como parte genérica apenas para representar o nó externo. Isso aumenta o nome sem adicionar contrato anatômico público. Se em algum componente o wrapper externo tiver semântica própria diferente da superfície principal, a parte deve receber um nome funcional mais claro.

Campos:

- `<component>`: slug estável do componente (`button`, `input`, `checkbox`, `radio`, `toggle`).
- `<part>`: anatomia pública quando necessária (`target`, `box`, `track`, `thumb`, `icon`, `label`, `helper`, `description`, `focus-ring`).
- `<property>`: propriedade visual ou estrutural (`height`, `width`, `size`, `bg`, `border`, `radius`, `font-size`, `line-height`, `gap`, `inset`).
- `<variant-or-state>`: size, state ou role quando necessário (`sm`, `md`, `lg`, `default`, `hover`, `selected`, `disabled`, `error`).

Exemplos aceitos:

```txt
component.checkbox.target.height.sm -> semantic.size.lg
component.checkbox.box.size.sm -> semantic.size.xs
component.input.height.sm -> semantic.size.lg
component.toggle.target.height.md -> semantic.size.xl
component.toggle.track.height.md -> semantic.size.md
```

Exemplos rejeitados:

```txt
component.button.bg.brand.default -> semantic.primary.background.default
```

Rejeitado quando for apenas duplicação de uma decisão de role/style já expressa por Semantic e não houver contrato anatômico adicional. Se a documentação do componente precisar expor essa decisão como API de customização, o token Component passa a ser aceitável.

### Regra de consumo

CSS e bindings Figma de componentes devem consumir Component tokens quando existir token Component para aquela anatomia.

Durante a migração, componentes ainda podem consumir Semantic diretamente até receberem seus Component tokens. Novos trabalhos estruturais em componentes devem preferir a camada Component.

### Valores especificos de componente

O caminho preferencial e Component -> Semantic -> Foundation.

Se uma dimensão específica de componente não existir em Semantic, a decisão deve seguir esta ordem:

1. Verificar se a escala Semantic existente resolve o caso.
2. Criar ou reaproveitar um token Semantic se a decisao for reutilizavel fora do componente.
3. Criar um token Component se a decisao for anatômica e especifica do componente.

Quando a decisão for específica e ainda assim precisar de valor fora da escala Semantic, a ADR da mudança deve explicitar se o valor entra em Semantic como novo padrão reutilizável ou se fica como contrato Component. Essa exceção não pode ser implícita.

## Consequencias

### Positivas

- A variant de componente (`Checkbox sm`, `Input sm`, `Toggle sm`) deixa de ser confundida com o nome do token global usado internamente.
- A documentacao pode mostrar o contrato do componente sem expor a engenharia interna da escala global.
- Figma, CSS e docs passam a ter uma camada comum para anatomia de componente.
- Evita nomes Semantic falsamente genericos para decisoes exclusivas de componente.

### Negativas

- Reintroduz uma terceira camada e aumenta o número de tokens.
- Exige migração incremental de componentes existentes.
- Requer disciplina para não recriar a antiga camada Component como espelho mecânico de tudo.
- Exige ajustes em build, docs, API, registry e verificação.

## Plano de migracao

1. Reativar suporte de pipeline a `tokens/component/*.json` e `css/tokens/generated/component.css`.
2. Criar a collection `Component` no Figma, com modo `Default`, quando a sessao Figma estiver autenticada.
3. Pilotar Checkbox, Radio e Toggle porque concentram a diferenca entre area interativa e ícone visual.
4. Documentar a matriz dimensional:

| Componente | Variant | Area interativa | Forma visual |
|---|---:|---:|---:|
| Checkbox/Radio | sm | 32 | 16 |
| Checkbox/Radio | md | 40 | 20 |
| Checkbox/Radio | lg | 48 | 24 |
| Toggle | sm | 32 | 28x16 |
| Toggle | md | 40 | 44x24 |
| Toggle | lg | 48 | 56x32 |

5. Migrar os demais componentes em PRs separados.

## Alternativas consideradas

### Manter apenas Foundation -> Semantic

Descartada. Funciona para tokens globais, mas torna confusa a relacao entre variant de componente e valor absoluto usado por partes internas.

### Criar nomes Semantic especificos de componente

Descartada. `semantic.size.toggle.*` mistura decisao de componente com camada de sistema e torna o Semantic menos previsivel.

### Usar `control.*` para tudo que foge da escala

Descartada como regra geral. `control` deve representar padroes reutilizaveis entre controles. Usar `control.track-width` para uma anatomia que so existe no Toggle cria falsa genericidade.

## Referencias

- Material Web: system tokens e component tokens (`--md-sys-*`, `--md-switch-*`, `--md-checkbox-*`).
- Carbon Design System: component tokens como propriedades associadas a componentes especificos.
- Spectrum Design Data: eixos `component`, `anatomy`, `property`, `variant` e `state`.
