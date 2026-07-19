# Processo: sync Figma → JSON via snapshot

Como executar o sync das Figma Variables pros arquivos DTCG em `tokens/`. O caminho preferencial é o plugin local `figma-plugin/snapshot-exporter`; o caminho via MCP continua como fallback quando o plugin não estiver instalado.

## Contexto

A ADR-003 (revisada em 0.5.8) estabelece **Figma como autoridade canônica** dos valores de token. Os JSONs em `tokens/` são consolidação derivada. Idealmente existiria um sync automático via REST API, mas `GET /v1/files/:key/variables/local` exige **plano Enterprise** (nosso plano Pro não destrava). No plano atual, o fluxo usa snapshot local: o plugin Figma `figma-plugin/snapshot-exporter` serializa as Variables e a auditoria estrutural num JSON temporário, e os scripts Node leem esse snapshot para comparar com os JSONs e validar invariantes do Figma.

**Disparo:** manual, dentro do Figma Desktop (plugin `figma-plugin/snapshot-exporter`). Automação via REST API ou GitHub Actions **não está no escopo** — plano Pro não expõe Variables API; upgrade Enterprise foi descartado. Ver `docs/backlog.md` para alternativas futuras (plugin com PR automático, Tokens Studio).

## Pré-requisitos

- Figma Desktop com plugin local instalado a partir de `figma-plugin/snapshot-exporter/manifest.json`.
- Acesso de leitura ao arquivo `IE68amP9Hya5ieFw1rX8S8`.

## Passo 1 — verificar via plugin

Na primeira vez:

1. No Figma Desktop, abra **Plugins → Development → Import plugin from manifest...**.
2. Selecione `figma-plugin/snapshot-exporter/manifest.json`.

Uso normal:

1. Abra o arquivo DS Core (`IE68amP9Hya5ieFw1rX8S8`).
2. Rode **DS Core Snapshot Exporter**.
3. Clique em **Verificar com repo publicado**.
4. Leia a mensagem no plugin.

Esse modo compara as Variables vivas do Figma com `docs/api/tokens.json` publicado em GitHub Pages. Não precisa terminal, arquivo local ou servidor local.

Para fluxo de release ou auditoria que precisa comparar contra o working tree local, use o fallback manual: clique em **Baixar .figma-snapshot.json**, coloque o arquivo na raiz do repo e siga o Passo 2. Se o arquivo vier como `figma-snapshot.json` sem ponto, os scripts também aceitam; ele é derivado e não deve ser commitado.

O plugin:

1. Lista as collections locais (Foundation, Semantic) com seus modos.
2. Itera sobre todas as variables locais do arquivo.
3. Para cada variável, captura `id`, `name`, `resolvedType`, `variableCollectionId`, `valuesByMode`, `description`, `scopes`, `codeSyntax` e metadados seguros.
4. Preserva aliases como `{ "type": "VARIABLE_ALIAS", "id": "..." }`.
5. Audita páginas de componentes para detectar regressões estruturais como `glyph`, `Icon Placeholder`, ícones Lucide sem binding Component, focus ring incorreto, `ALL_SCOPES`, WEB code syntax ausente e aliases quebrados.
6. Agrega tudo num único arquivo `.figma-snapshot.json` no formato:

```json
{
  "generatedAt": "2026-04-20T00:00:00.000Z",
  "generator": { "name": "DS Core Snapshot Exporter", "version": "0.1.0" },
  "fileKey": "IE68amP9Hya5ieFw1rX8S8",
  "variableCollections": {
    "VariableCollectionId:4:2": { "id": "...", "name": "Foundation", "modes": [...], "defaultModeId": "..." }
  },
  "variables": {
    "VariableID:5:3": {
      "id": "VariableID:5:3",
      "name": "color/neutral/50",
      "resolvedType": "COLOR",
      "variableCollectionId": "VariableCollectionId:4:2",
      "scopes": ["FRAME_FILL"],
      "codeSyntax": { "WEB": "--ds-color-neutral-50" },
      "valuesByMode": { "4:0": { "r": 0.97, "g": 0.98, "b": 0.99, "a": 1 } }
    }
  },
  "structureAudit": {
    "componentPageCount": 18,
    "issueCount": 0,
    "grouped": {},
    "issues": []
  }
}
```

O arquivo `.figma-snapshot.json` está em `.gitignore` e não deve ser commitado — é regenerado a cada sync.

Para releases, o CI não precisa receber o snapshot completo. Depois de validar
um export vivo, rode `npm run release:figma-evidence`. O comando exige snapshot
com menos de 24 horas, executa `verify:tokens`, `verify:figma-structure` e
`audit:component-tokens`, e grava `docs/api/release-figma-evidence.json` com os
resultados e os SHA-256 do snapshot e dos tokens. O CI recalcula o digest dos
tokens e bloqueia versão ou conteúdo que não correspondam à atestação.

Depois de gerar um snapshot pelo plugin atualizado, rode:

```bash
npm run verify:figma-structure
```

Esse gate falha se o snapshot não tiver `structureAudit`. O fallback via MCP continua útil para comparar valores de tokens, mas não substitui o snapshot do plugin para auditoria estrutural.

### Fallback — gerar via MCP

Peça ao agente Claude Code:

> "Gere um snapshot das Figma Variables do design system em `.figma-snapshot.json`."

O agente vai executar uma sequência de chamadas `use_figma` que:

1. Lista as 2 collections atuais (Foundation, Semantic) com seus modos.
2. Itera sobre as variables do arquivo em batches pequenos (o MCP tem limite de resposta, então precisa chunkar).
3. Para cada variável, captura `id`, `name`, `resolvedType`, `variableCollectionId`, `valuesByMode` e `description`.
4. Agrega tudo num único arquivo `.figma-snapshot.json` no formato:

```json
{
  "generatedAt": "2026-04-20T00:00:00.000Z",
  "fileKey": "IE68amP9Hya5ieFw1rX8S8",
  "variableCollections": {
    "VariableCollectionId:4:2": { "id": "...", "name": "Foundation", "modes": [...], "defaultModeId": "..." },
    ...
  },
  "variables": {
    "VariableID:5:3": {
      "id": "VariableID:5:3",
      "name": "color/neutral/50",
      "resolvedType": "COLOR",
      "variableCollectionId": "VariableCollectionId:4:2",
      "valuesByMode": { "4:0": { "r": 0.97, "g": 0.98, "b": 0.99, "a": 1 } }
    },
    ...
  }
}
```

O arquivo está em `.gitignore` e não deve ser commitado — é regenerado a cada sync.

Limitação: o fallback MCP descrito aqui gera apenas dados de Variables quando usado para sync Figma → JSON. Para auditoria estrutural sem sobrescrever o snapshot completo de tokens, gere `.figma-snapshot.structure.json`. Sem `--snapshot`, `npm run verify:figma-structure` usa o snapshot mais recente entre `.figma-snapshot.structure.json`, `.figma-snapshot.json` e `figma-snapshot.json`, evitando validar acidentalmente um arquivo estrutural antigo. Quando o snapshot tiver `structureAudit.variableUsage`, o verificador também lista Component variables sem uso nos variants finais; rode `npm run audit:component-tokens` para tratar esses casos como erro durante limpezas de tokens.

## Passo 2 — dry-run

```bash
node scripts/sync-tokens-from-figma.mjs
```

Para gates de release ou qualquer validação que precise representar o Figma vivo, use:

```bash
node scripts/sync-tokens-from-figma.mjs --require-fresh
```

Esse modo falha se `.figma-snapshot.json` tiver mais de 24h. Sem a flag, o script ainda roda e compara normalmente, mas imprime aviso de snapshot stale. Isso evita interpretar `VALUE_DRIFT=0` como “Figma vivo está em dia” quando a comparação foi feita contra um dump antigo.

O script:

1. Lê `.figma-snapshot.json` (ou `--snapshot <path>` pra outro caminho).
2. Constrói o estado esperado dos JSONs (`tokens/foundation/`, `tokens/semantic/`) a partir das Variables.
3. Lê os JSONs atuais e compara.
4. Reporta categorias de divergência:

| Categoria | Significado | Ação em `--write` |
|-----------|-------------|-------------------|
| **VALUE_DRIFT** | Mesmo token, valor difere. | Aplica valor do Figma no JSON. |
| **NEW_IN_FIGMA** | Figma tem, JSON não. | Não cria — revisão manual. |
| **MISSING_IN_FIGMA** | JSON tem, Figma não. | Não deleta — revisão manual. |
| **ALIAS_BROKEN** | Figma aponta pra variável inexistente. | Não resolve — fix no Figma. |
| **CSS_ONLY** | Token existe dos dois lados mas representação diverge por capacidade CSS (font family stack, `rem`, weight numérico). Introduzido após PR #18 / 0.5.11. | **Não aplica** — aplicar regridiria o CSS (ex: trocaria `'Inter', system-ui, ...` por `"Inter"`; ou `0.875rem` por `14`, quebrando WCAG 1.4.4). |
| **BY_DESIGN** | Token existe só de um lado por escolha arquitetural documentada — ver **ADR-012** (line-height/letter-spacing: PX no Figma, ratio/em no JSON) e **ADR-016** (categorias CSS-only `motion.*`, `z.*`, `shadow.*` vivem só no JSON porque Figma não as representa como Variables). | **Não aplica** — não é drift, é arquitetura. |

Se as 4 primeiras categorias zerarem, Figma e JSON estão em dia. Exit 0.

Se tem divergências reais (VALUE_DRIFT, NEW_IN_FIGMA, MISSING_IN_FIGMA), exit 1. CSS_ONLY e BY_DESIGN são informativos — não contam como divergência.

Review no output antes de aplicar.

## Passo 3 — aplicar VALUE_DRIFT

Quando os drifts representarem mudanças intencionais feitas no Figma:

```bash
node scripts/sync-tokens-from-figma.mjs --write
```

Esse modo:

1. Aplica os VALUE_DRIFT sobrescrevendo `$value` nos arquivos `tokens/**/*.json` correspondentes.
2. Roda `npm run build:tokens` pra regenerar `css/tokens/generated/*.css`.
3. Roda `npm run sync:docs` pra atualizar docs.
4. NEW_IN_FIGMA e MISSING_IN_FIGMA continuam reportados — requer ação manual.

Review `git diff` antes de commitar. Toda mudança de token entra numa PR separada pra auditoria.

## Passo 4 — commit

```bash
git add tokens/ css/tokens/generated/ docs/api/ docs/tokens-*.html
git commit -m "sync: tokens do Figma"
```

Não commitar `.figma-snapshot.json` (está ignorado).

## Troubleshooting

**`Snapshot não encontrado`**: rode o Passo 1 antes.

**`Snapshot stale`**: `.figma-snapshot.json` tem mais de 24h. Regenerar via `use_figma` antes de concluir sync, release ou auditoria Figma-canônica. `VALUE_DRIFT=0` com snapshot stale significa apenas que JSON e snapshot antigo batem.

**`Snapshot inválido: faltam variables/variableCollections`**: o arquivo JSON não tem a estrutura esperada. Re-gerar no Passo 1.

**ALIAS_BROKEN > 0**: alguém apagou uma variável no Figma sem atualizar os aliases. Fix no Figma e re-gerar snapshot.

**Muitos NEW_IN_FIGMA / MISSING_IN_FIGMA**: possível desalinhamento do mapeamento prefix→file em `scripts/lib/figma-dtcg.mjs` (`FOUNDATION_PREFIX_TO_FILE`). Confirme que Figma e JSON usam as mesmas convenções de nome; ajuste o mapa se necessário.

**Ruído de ponto flutuante** (`0.05` vs `0.05000000074505806`): a função `normalizeForCompare` arredonda pra 4 casas. Se ainda aparecer como VALUE_DRIFT, o valor realmente mudou.

## Limitações

- **Export manual; prova automatizada.** O plano Pro não permite regenerar o snapshot no CI, mas `verify:release-evidence` valida no runner a atestação e o digest produzidos a partir do export vivo.
- **Não gera commits automáticos.** O usuário decide o que entra em `--write` e quando.
- **Não cria nem deleta tokens** em JSON. NEW_IN_FIGMA e MISSING_IN_FIGMA exigem edição explícita pra evitar divergências acidentais.
- **Sem resolução inteligente de rename.** Se um token for renomeado no Figma, aparece como MISSING + NEW — o operador precisa identificar e tratar manualmente.
