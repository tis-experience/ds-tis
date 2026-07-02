# ADR-013: Camadas de consumo de tokens — Foundation nunca direto em consumidor final

**Data:** 2026-04-22
**Status:** Aceita — implementada em 0.7.0 e parcialmente substituída por ADR-019 em 2026-05-11

> **Atualização (2026-04-26):** Naquele release, a arquitetura foi estabilizada como **2-layer (Foundation + Semantic)**. Component collection foi eliminada em 0.7.0. ADR-015 unificou a escala de dimensão dentro de Semantic. Em 1.0.0-beta.1, todos os 111 leaks Foundation em `css/base/` foram migrados pra Semantic, fechando o débito original deste ADR.

> **Atualização (2026-05-11):** ADR-019 reintroduz **Component tokens** como contrato anatômico de componente. A regra de fundo permanece: consumidor final não consome Foundation direto. A cadeia vigente passa a ser Foundation/Core → Semantic/System → Component → implementação. Component não volta como wrapper mecânico; volta para partes públicas de componente (`target`, `box`, `track`, `thumb`, etc.).

## Contexto

O sistema começou com três camadas de tokens, passou por uma simplificação 2-layer em 0.7.0 e voltou a ter três camadas com ADR-019. A arquitetura vigente é:

1. **Foundation** — valores crus, escalas primitivas (`spacing/3 = 0.75rem`, `color/blue/600`, `radius/sm`, `shadow/md`, `duration/fast`). Sem significado funcional, só quantidade.
2. **Semantic** — aliases com intenção de uso (`brand/default`, `content/default`, `border/width/default`, `space/inset/md`, `typography/control/font-size/md`).
3. **Component** — contrato público de anatomia de componente (`component.checkbox.target.height.sm`, `component.button.bg.brand.default`, `component.toggle.track.width.md`), aliasando Semantic quando possível.

A regra vigente é que consumidores finais — CSS de componente, bindings em componentes Figma, docs de uso — operam em cima de Component quando houver contrato de componente, ou Semantic enquanto o componente ainda não foi migrado. Foundation existe pra **abastecer Semantic e aliases Component**, não pra ser consumido direto.

Essa regra **nunca foi codificada explicitamente** e por isso **não é respeitada hoje**. Auditoria em 22/04/2026:

### No Figma (fonte de verdade — ADR-003)

- 51 componentes (COMPONENT/COMPONENT_SET) auditados.
- **3.479 bindings diretos pra Foundation** encontrados. Distribuição:
  - Typography (`font-family`, `font-weight`, `font-size`, `line-height`, `letter-spacing`): ~2.500 bindings. Causa: Semantic nunca teve aliases pra typography genérica, só `typography/control/*` pra controles single-line.
  - Border width (`border/width/1` em vez de `border/width/default`): ~500 bindings. Causa: negligência — o alias Semantic já existe.
  - Restante: opacity, z-index, shadow, motion, radius — Semantic não tem aliases pra essas categorias.
- A antiga collection **Component** tinha variáveis com valores literais raw (ex: `avatar/size/sm = 32`) em vez de aliases. Essa camada foi eliminada em 0.7.0.

### No CSS (derivado)

- Todos os 19 arquivos em `css/components/*.css` consomem Foundation direto em: spacing (`var(--ds-spacing-12)`), radius não-component (`var(--ds-radius-8)`), border-width (`var(--ds-border-width-1)`), typography (`var(--ds-font-size-14)`, `var(--ds-font-weight-medium)`, `var(--ds-line-height-normal)`), shadow, motion, opacity, z-index.
- Cor é o único domínio limpo: zero uso de `var(--ds-color-*)` raw.

### Por que isso importa

O sistema perdeu propriedades arquiteturais importantes:

1. **Rastreabilidade quebra.** Um valor `0.75rem` no CSS pode vir de `--ds-spacing-12` direto, ou via `--ds-space-md` → `foundation.spacing.3`. O primeiro não carrega intenção; o segundo carrega. Buscar "onde usamos o inset médio" com grep falha no primeiro caso.
2. **Theming fica rígido.** Pra mudar o inset médio global de 12px pra 10px, teria que ir token por token no CSS substituindo `--ds-spacing-12` por `--ds-spacing-10` caso a caso. Com Semantic, muda `space/inset/md` num lugar e propaga.
3. **Dois consumidores divergem.** Figma binda `typography/font/weight/medium` direto; CSS usa `var(--ds-font-weight-medium)`. Quando alguém quiser mudar "peso médio" pra `semibold` em contextos de label de controle, precisa fazer hunt manual nos dois lados. Com Semantic `typography/control/font-weight`, muda uma vez.

## Decisão

### A regra

**Foundation só pode ser consumido por Semantic.** Isso é: o único lugar onde `foundation.*` aparece como referência é dentro de outro `$value: "{foundation.*}"` em arquivos JSON de `tokens/semantic/`, ou dentro de alias de Variable Figma na coleção Semantic.

**Foundation nunca aparece em consumidor final**, ou seja:

- Nenhum `var(--ds-{foundation-name}-*)` em `css/components/*.css` ou `css/base/*.css`.
- Nenhum binding de componente Figma (fills, strokes, paddings, typography props, etc.) apontando pra variável da coleção Foundation.
- Nenhuma referência em código de docs a token Foundation (exceto nas próprias páginas de `foundations-*.html` que documentam a escala).

### Cadeia permitida

```
Foundation  ──►  Semantic  ──►  Component  ──►  Consumidor final
                                            (CSS, Figma binding, docs de componente)
```

Consumidor final **só** vê Component quando houver contrato Component, ou Semantic durante a migração. Nunca Foundation, nunca valor hardcoded.

### Exceção explícita — `semantic.control.*` (ADR-006)

Já codificado em ADR-006 e depois simplificado por ADR-015: dimensões e tipografia compartilhadas entre controles interativos vivem em Semantic. Button, Input, Select e Textarea consomem os semantic tokens finais diretamente.

### Valores específicos de componente

Alguns valores são genuinamente específicos de um componente e não têm equivalente abstrato Semantic no momento da auditoria. Exemplos: `modal.max-width`, `avatar.icon-size`, `textarea.min-height`. Na arquitetura vigente pós-ADR-019, isso não autoriza hardcode nem consumo direto de Foundation: primeiro reaproveita-se Semantic quando houver decisão reutilizável; se a decisão for anatômica e específica do componente, cria-se um token Component.

### Enforcement automatizado

O script `npm run verify:tokens` (`scripts/tokens-verify.mjs`) é estendido com três checks que falham o CI:

1. **CSS foundation leak**: scan de `css/components/*.css` e `css/base/*.css` por `var(--ds-{categorias-foundation}-*)` não aliasado.
2. **Figma foundation leak**: scan do `.figma-snapshot.json` por bindings apontando pra variáveis da collection Foundation dentro de nodes COMPONENT/COMPONENT_SET.
3. **Token Registry completude**: toda variável em `tokens/**/*.json` precisa ter entrada em `tokens/registry.yaml` com campos `sentido`, `contexto`, `decisao` preenchidos.

### Quando criar um token Semantic para uma necessidade de componente

A primeira execução desta ADR (Fases 0-7) criou tokens component em excesso — 151 novos, dos quais 105 eram aliases 1:1 pra Semantic/Foundation sem variação entre componentes. Exemplos: `component.button.transition-duration`, `component.input.transition-duration`, `component.checkbox.transition-duration` — todos apontando pra `{foundation.duration.fast}` e resolvendo pro mesmo valor, sem razão arquitetural pra divergir.

Isso transgrediu a intenção da regra e motivou a eliminação da camada Component. Token Semantic é a camada de intenção compartilhada ou consumível.

**Criar ou reaproveitar Semantic token quando:**

1. **Um consumidor final precisa de um valor visual.**
   Ex: `modal` usa `semantic.size.layout.{sm,md,lg}` para largura máxima.

2. **Há variação por size/state dentro de um padrão reutilizável.**
   Ex: controles interativos usam semantic tokens de tamanho/spacing/typography.

3. **A decisão parece específica, mas pode nomear uma intenção.**
   Ex: `radius.full`, `radius.lg`, `shadow.lg`, `size.layout.lg`.

**NÃO fazer:**

- Criar wrapper mecânico por componente.
- Usar Foundation direto em CSS/Figma/docs.
- Usar valor literal em consumidor final quando existe Semantic equivalente.

**Exemplo da distinção**:
- Motion (`duration.fast`, `ease.default`) é decisão sistêmica: sempre os mesmos valores em todo lugar. Vive em **Semantic** (`motion.duration.fast`, `motion.ease.default`), não em cada Component.
- Border-radius é intenção semântica de forma (`radius.sm/md/lg/full`) e o componente escolhe o semantic token aplicável.

Aplicação retroativa: **Fase 8** do plano de execução remove os 105 tokens redundantes criados na Fase 5.

### Token Registry

Criado como parte desta ADR: arquivo único `tokens/registry.yaml` que cataloga todos os tokens do sistema (Foundation, Semantic) com metadados por entrada:

- `layer` — camada da arquitetura
- `type` — tipo DTCG
- `references` — alias (null se raw)
- `sentido` — o que o token representa
- `escopo` — scopes Figma aplicáveis
- `contexto` — quando usar
- `usos` — auto-calculado (CSS + Figma + outros tokens)
- `decisao` — link pra ADR que motiva a existência do token

Gerado em MD (`docs/token-registry.md`) via `scripts/build-token-registry.mjs`. Integrado ao `sync-tokens-from-figma`: toda variável nova detectada no Figma exige entrada no registry antes do sync finalizar.

## Consequências

### Positivas

- **Rastreabilidade restaurada**: cada uso de valor no CSS ou Figma passa por um token com intenção nomeada. `grep` recupera contexto.
- **Theming escala**: mudanças semânticas (ex: "densidade média quer menos padding") mudam um alias, propagam pra todo sistema.
- **Figma e código convergem**: os dois consomem Component quando há contrato de componente, ou Semantic durante a migração, não Foundation direto em caminhos diferentes.
- **CI pega regressão**: qualquer PR que introduzir foundation leak em CSS de componente ou binding Figma falha o verify.
- **Decisões ficam explícitas**: Token Registry obriga preencher `sentido`/`contexto`/`decisao` pra cada token. Tokens sem justificativa documentada não entram no sistema.

### Negativas

- **Trabalho grande de remediação**: ~3.500 bindings Figma pra rebind, 19 CSS de componente pra reescrever, ~20-30 Semantic novas pra criar. Estimado em 17-24h, dividido em 5 PRs.
- **Processo de sync mais rígido**: adicionar variável nova no Figma agora exige entrada no registry com metadados obrigatórios antes do sync completar. Fricção proposital pra forçar intenção.
- **Sem atalhos para exceções**: quando um componente precisar de uma intenção nova, a decisão deve virar Semantic antes de aparecer em CSS/Figma/docs.

## Alternativas consideradas

### (a) Aceitar o estado atual e só documentar

Descartada. Rastreabilidade quebrada não é aceitável num sistema que se propõe white-label e teme ter usuários diferentes com necessidades de customização diferente.

### (b) Manter Component → Foundation como exceção

Descartada como regra geral. Componentes têm valores específicos, mas Component não pode apontar direto para Foundation nem virar wrapper mecânico. Quando o contrato for anatômico, o caminho preferencial é Component → Semantic → Foundation.

### (c) Criar camada adicional entre Foundation e Semantic (ex: "Alias")

Descartada. Três camadas já são o suficiente; adicionar uma quarta complica o modelo mental sem resolver o problema real. O problema é Foundation aparecendo em consumidor final, não a arquitetura de camadas em si.

### (d) Só corrigir no Figma e deixar CSS como está

Descartada. Foundation leak em CSS de componente é equivalente à do Figma — mesma quebra de rastreabilidade e theming. Corrigir um lado e não o outro perpetua a inconsistência.

## Plano de execução

Fases 0-7. Divisão em 5 PRs:

- **PR #A**: ADR-013 + Token Registry skeleton + check de completude
- **PR #B**: Audit de reuso Semantic + expansão no Figma + sync parcial
- **PR #C**: Rebind de 3.479 bindings Figma + remoção de raw values da antiga collection Component
- **PR #D**: Semantic tokens necessários + 19 CSS atualizados + checks de leak
- **PR #E**: Docs finais + integração registry↔sync

## Referências

- [ADR-001](./ADR-001-migracao-tokens.md) — arquitetura Foundation → Semantic → Component original.
- [ADR-003](./ADR-003-fontes-verdade.md) — Figma como autoridade de valor.
- [ADR-005](./ADR-005-brand-foundation-e-estados-explicitos.md) — brand como foundation, convenção `-default`.
- [ADR-006](./ADR-006-semantic-control-tokens.md) — tokens de controle, parcialmente substituídos pela simplificação de ADR-015.
- [ADR-011](./ADR-011-renaming-tokens-semanticos-de-cor.md) — renaming de semantic de cor; princípio 9 é o precedente direto deste ADR.
- [ADR-019](./ADR-019-component-tokens-contrato-anatomico.md) — reintrodução da camada Component como contrato anatômico.
- `tokens/registry.yaml` — Token Registry (artefato criado por esta ADR).
- `scripts/tokens-verify.mjs` — checks de enforcement.
- `CLAUDE.md` — seção "Hierarquia de verdade" atualizada com referência a este ADR.
- Design systems de referência consultados: IBM Carbon (Token Explorer), GitHub Primer (primer/primitives YAML + CI), Material Design 3, Shopify Polaris, Adobe Spectrum.
