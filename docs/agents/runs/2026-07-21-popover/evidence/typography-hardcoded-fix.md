# Tipografia Popover — correção hardcoded (2026-07-21)

## Contagens

| Escopo | Antes | Depois |
|---|---|---|
| TEXT documental da página (fora do set) sem `textStyleId` / tipografia bindada | **0** | **0** |
| `Title` no component set (8 variants) sem Text Style + tipografia | **8** | **0** |
| `Body Text` no component set (8 variants) sem Text Style + tipografia | **8** | **0** |
| Nested Button `Label` sem Text Style de página | **8** | **8** (exceção) |
| **Hardcoded acionável (Title+Body)** | **16** | **0** |

## Exceção justificada (igual Modal)

Nested Button Ghost `Label` (`I10332:*;68:341`): sem `textStyleId` de página; tipografia e cor via Component tokens Button (`4139:23–29`, `4139:86`). Modal também deixa Label de Button sem Text Style de página.

## Contrato aplicado (após)

### Title (8×)

| Campo | Valor |
|---|---|
| textStyle | `body/sm-bold` `S:20642a844c40c92d2a0a9daf18ec3364d2a4e2c0,` |
| fontSize | `VariableID:3273:10` |
| fontFamily | `VariableID:3273:2` |
| fontStyle | `VariableID:3273:5` (+ estilo Bold do text style) |
| lineHeight | `VariableID:3273:17` |
| letterSpacing | `VariableID:3273:7` |
| fill | Component `popover/title/color` `VariableID:10319:14` |

Node IDs: `10332:347`, `10332:367`, `10332:387`, `10332:407`, `10332:427`, `10332:447`, `10332:467`, `10332:487`

**Por que não `heading/sm` do Modal Title?** Modal Title = `heading/sm` @ 20px (`S:9d32fb965c3a161a6cf03ae0f4f8dfd67e6252a5,`). Popover é painel compacto @ 14px — `body/sm-bold` é o Text Style vivo adequado; tipografia Semantic `3273:*` no mesmo contrato.

### Body Text (8×)

| Campo | Valor |
|---|---|
| textStyle | `body/sm` `S:20c92dad678b6db5c276e80244052d562ed7dce6,` (**igual** Modal Description) |
| fontSize | `VariableID:3273:10` |
| fontFamily | `VariableID:3273:2` |
| fontStyle | `VariableID:3273:3` |
| lineHeight | `VariableID:3273:17` |
| letterSpacing | `VariableID:3273:7` |
| fill | Semantic `content/default` `VariableID:14:3` |

Node IDs: `10332:352`, `10332:372`, `10332:392`, `10332:412`, `10332:432`, `10332:452`, `10332:472`, `10332:492`

## Fill de texto documental (2026-07-21, follow-up)

Após criar `section-exemplos`, 2 TEXTs ficaram com fill sólido sem bind:

| Node | Nome | Antes | Depois |
|---|---|---|---|
| `10338:2284` | section-title (“Exemplos”) | fill hardcoded | `content/strong` `VariableID:14:2` |
| `10338:2285` | example-desc | fill hardcoded | `content/strong` `VariableID:14:2` |

Re-audit página Popover: **95** TEXTs, **0** sem fill bind. Set: **0** TEXT de anatomia sem fill bind (Labels de Button nested continuam via Component Button).

Aprendizado: clonar/criar seção documental exige **Text Style + tipografia + fill** na mesma passagem — Text Style sozinho não basta.

## Pendência residual (não tipografia crua)

- Body fill ainda é Semantic direto (`14:3`); Modal Description usa Component (`7843:11`). Criar `popover/body/color` (ou equivalente) fica para sync/token follow-up — **não** é hardcoded Inter/hex.
