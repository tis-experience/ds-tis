# AGENTS.md — instruções canônicas para qualquer agente

Este arquivo é a **fonte canônica** de instruções para qualquer agente IA que opere neste repositório (Claude Code, OpenAI Codex, Gemini CLI, Cursor, Aider, etc.). Arquivos específicos como `CLAUDE.md` e `GEMINI.md` existem apenas como adapters de compatibilidade para ferramentas que carregam nomes próprios.

Se você é uma IA começando a operar neste repo, leia este arquivo inteiro **antes de qualquer escrita**.

---

## 0. Pré-flight obrigatório (sempre, antes da primeira escrita)

```bash
npm run agent:preflight
```

Mostra branch atual, dirty/clean, idade do snapshot Figma, último resultado de `verify:tokens`, e estado do CHANGELOG. Não bloqueia — informa. Use o output para decidir se precisa atualizar snapshot, fazer pull, ou abrir nova branch.

---

## 1. Forbidden actions (não faça nunca, sem confirmação explícita do usuário)

| Ação | Razão |
|---|---|
| Editar `css/tokens/generated/*.css` à mão | Arquivos derivados — regerados por `npm run build:tokens`. Mudança aqui é perdida no próximo build. |
| Editar `tokens/*.json` à mão para categorias com equivalente Figma (`color`, `dimension`, `radius`, `opacity`, `border-width`, `typography`) | Figma é fonte de verdade dessas categorias (ADR-003). Edição direta cria drift. |
| Hardcodear `#hex`, `rgb()`, valores em `px`, `rem`, em consumidor final (`css/components/*.css`, `css/base/*.css`) | Quebra a cadeia de tokens. Sempre usar `var(--ds-...)`. |
| Consumir tokens Foundation diretamente em CSS de componente | ADR-013/019: cadeia é Foundation → Semantic → Component → Consumidor. CSS consome Component quando existir contrato anatômico; durante migração, Semantic direto ainda é permitido para componentes não migrados. |
| Usar `ALL_SCOPES` em variáveis Figma | Polui todos os pickers. Usar escopos específicos. |
| Push direto pra `main` sem rodar `npm run verify:tokens` clean | Pode introduzir drift Figma↔JSON ou CSS leak detectável automaticamente. |
| Forçar variables Figma para categorias CSS-only (`motion`, `z`, `shadow`) | ADR-016: essas categorias vivem só em JSON. Criar Figma Variable é cargo culting. |
| Pedir/expor `FIGMA_PAT`, GitHub token, ou outras credenciais em chat | Credenciais ficam em env, secret store ou configuração local do agente. Nunca em arquivo do repo, nunca em mensagem. |
| Bulk update em Figma sem revisão componente-a-componente | Histórico mostra ~60% de retrabalho. Incremental sempre. |
| Editar `.github/workflows/*.yml` via GitHub MCP | API restrita — usar interface web ou git local com SSH. |

**Permitido (não precisa confirmação):** ler arquivos, rodar scripts read-only (`verify:tokens`, `agent:preflight`, `sync:tokens-from-figma` sem `--write`), inspecionar Figma via `get_metadata`/`get_variable_defs`, listar issues/PRs no GitHub.

**Requer confirmação explícita do usuário:** qualquer escrita em arquivos do repo, qualquer escrita no Figma (criar/editar variables, components, text styles), qualquer commit/push/PR, qualquer mudança em config compartilhada.

---

## 2. Visão geral do projeto (1 parágrafo)

Design system white-label em CSS puro com tokens DTCG em JSON, 19 componentes, modos light/dark, paleta brand única customizável. Arquitetura **3-layer** (Foundation/Core → Semantic/System → Component) — Component foi reintroduzida por ADR-019 como contrato anatômico dos componentes, não como wrapper mecânico de tudo. Versão atual em `package.json`. Documentação pública em `docs/` quando servida como site estático.

---

## 3. Source of truth por categoria (a regra mais importante)

A regra "Figma é fonte de verdade" **não é universal**. Depende da categoria de token. Confunda isso e você cria drift silencioso ou edita o lugar errado.

| Categoria | Fonte de verdade | Por quê | Como editar |
|---|---|---|---|
| `color.*` | **Figma Variables** | Variable nativa | Editar no Figma → `npm run sync:tokens-from-figma:write` → review diff |
| `dimension.*`, `radius.*`, `opacity.*`, `border.width.*` | **Figma Variables** | Variable nativa | Mesmo fluxo |
| `typography.*` (font family, size, weight) | **Figma Variables + Text Styles** | Text Styles bindam Variables | Mesmo fluxo + atualizar Text Style se necessário |
| `motion.*` (duration, ease) | **JSON** (ADR-016) | Figma não representa — Smart Animate é runtime | Editar `tokens/foundation/motion.json` ou `tokens/semantic/light.json+dark.json` direto → `npm run build:tokens` |
| `z.*` (z-index) | **JSON** (ADR-016) | Figma usa layer order, não z-index | Editar JSON direto → `npm run build:tokens` |
| `shadow.*` | **JSON** (ADR-016) | Figma usa Effect Style, não Variable bindável | Editar JSON direto. Effect Styles `elevation/1..4` no Figma são preview, atualizados manualmente quando JSON muda |

**Antes de editar QUALQUER token**, identifique a categoria. Se está em dúvida, rode preflight e leia `docs/decisions/ADR-016-tokens-sem-equivalencia-no-figma.md`.

### Componentes CSS-only (sem equivalência no Figma)

Análogo a categorias CSS-only de tokens, alguns **componentes** existem só no CSS porque sua razão de existir é uma necessidade de markup HTML/DOM, não uma decisão visual. ADR-017 codifica isso.

| Componente CSS-only | Por quê |
|---|---|
| **Form Field** (`css/components/form-field.css`) | Wrapper para compor `<label>` + control + helper + error com IDs e ARIA. Cada componente Figma de form (Input Text, Select, Textarea, Checkbox, Radio, Toggle) já carrega Label + Required + Helper + Description **inline em cada variant**. Authorar Form Field no Figma criaria duplicação visual. |

**Implicação para auditoria Figma↔Repo**: componentes marcados `cssOnly: true` em `scripts/sync-docs.mjs` (`knownComponents`) **não são drift** quando ausentes no Figma. Tratar como "faltando" é falso-positivo. Adicionar componente novo à lista exige amend de ADR-017.

### Hierarquia geral quando há divergência entre artefatos

1. **ADR** — autoridade arquitetural. ADR prevalece sobre Figma e código. Mudança que contradiz ADR exige novo ADR antes da implementação.
2. **Figma** (para categorias listadas como Figma-canônicas acima) — autoridade de valor.
3. **JSON DTCG** — consolidação canônica em Git. Para categorias Figma-canônicas, espelha o Figma. Para categorias CSS-only, é a fonte direta.
4. **CSS gerado** (`css/tokens/generated/*.css`) — derivado do JSON. Nunca editar à mão.
5. **Component JSON** (`tokens/component/*.json`) — contrato anatômico dos componentes. Component tokens podem aliasar Semantic 1:1 quando isso documenta uma parte pública/estável (`target.height`, `box.size`, `track.width`). Ver ADR-019.
6. **CSS gerado Component** (`css/tokens/generated/component.css`) — derivado dos JSONs Component. Nunca editar à mão.
7. **CSS de componente/base** — consome `var(--ds-...)` espelhando bindings do Figma equivalente. Componentes migrados consomem Component; componentes ainda não migrados podem consumir Semantic direto.
8. **Docs** (`docs/*.html`, `docs/*.md`) — descritivo do estado atual. Nunca fonte de verdade.

---

## 4. Workflows comuns

### 4.1 Adicionar um novo token

1. **Identifique a categoria** (tabela na seção 3) — define se é fluxo Figma ou JSON-direto.
2. **Identifique a camada** (Foundation ou Semantic):
   - Foundation: valor primitivo numérico/neutro (`radius/16`, `color/blue/600`, `z/40`).
   - Semantic: alias com intenção (`radius.lg`, `brand.background.default`, `z.tooltip`).
3. **Identifique a localização correta no JSON** — siga a estrutura existente:
   - Foundation: cada categoria tem seu arquivo (`tokens/foundation/{colors,dimension,motion,opacity,radius,shadows,stroke,typography,z-index}.json`). Categoria nova exige novo arquivo + ADR.
   - Semantic: `tokens/semantic/light.json` e `tokens/semantic/dark.json`. Top-level keys atuais: `background`, `border`, `brand`, `content`, `feedback`, `ghost`, `link`, `motion`, `opacity`, `outline`, `overlay`, `radius`, `shadow`, `size`, `space`, `surface`, `toned`, `typography`, `z`. **Cada nova subkey vai em um destes top-levels — NUNCA aninhar fora do top-level apropriado** (ex: `z.tooltip` vai em `semantic.z`, não em `semantic.typography.z`).
   - Component: `tokens/component/<component>.json`. Estrutura canônica DTCG: `component.<component>.<part>.<property>.<variant-or-state>` (ADR-019). No Figma, dentro da collection `Component`, usar `<component>/<part>/<property>/<variant-or-state>` sem prefixo `component/`. Component existe para contrato anatômico (`checkbox.box.size.md`, `toggle.track.width.md`), não para duplicar roles Semantic sem valor documental.
4. **Paridade light/dark obrigatória** — toda key em `light.json` precisa estar em `dark.json` (mesmo path, valor pode diferir). Verificado por `verify:tokens`.
5. **Adicione entry em `tokens/registry.json`** com `layer`, `type`, `references`, `sentido`, `escopo`, `contexto`, `decisao`. `verify:tokens` reporta erro se faltar.
6. **Rode `npm run build:tokens`** — gera CSS variables em `css/tokens/generated/*.css`.
7. **Rode `npm run sync:docs`** — regenera `docs/token-schema.md` e inventários.
8. **Rode `npm run verify:tokens`** — confirma 0 erros, 0 warnings.
9. **Adicione entrada em `CHANGELOG.md` `[Não publicado]`**.

### 4.2 Refatorar/refinar um componente CSS

1. **Pré-leitura obrigatória do Figma equivalente:**
   - Liste TODAS as variables bindadas no componente (todos os tamanhos, estados, subnodes — incluindo textos via Text Styles).
   - Compare contra o que o CSS atual consome.
2. **Se houver gap (Figma tem variable que CSS não consome, ou vice-versa)**, reporte ao usuário e proponha alinhamento ANTES de continuar.
3. **Se o Figma usa valor literal sem binding** onde devia haver variable, abra issue separada — Figma precisa ser hardenado primeiro. Não inventar variable só no CSS.
4. **Aplicar mudanças no CSS** consumindo `var(--ds-...)` correspondente. Nunca hardcodar.
5. **Rode `npm run verify:tokens`** — confirma `cssFoundationLeak` zero.
6. **Atualize doc HTML do componente** em `docs/<componente>.html` se a mudança altera anatomia/uso.
7. **CHANGELOG entry** em `[Não publicado]` descrevendo o que mudou e por quê.

### 4.2.1 Exemplos e composição em docs

1. Exemplos em `docs/*.html` devem usar os componentes existentes do DS pela API pública/anatomia completa, não classes internas isoladas. Exemplo: para campo de texto, usar `ds-field` + `ds-input` + `ds-input__field`; nunca usar `ds-input__field` solto como se fosse o componente.
2. Quando um componente hospeda conteúdo customizado ou slot (ex: Modal/Card), o conteúdo de exemplo deve ser composto com componentes reais do DS (`Button`, `Input`, `Select`, `Textarea`, etc.) sempre que eles já existirem.
3. Só criar markup ad hoc em docs quando não existir componente DS correspondente ou quando o exemplo estiver documentando explicitamente um primitive/layout genérico.

### 4.2.2 Implementar telas em projetos consumidores com agente IA

Se o pedido for para uma IA implementar tela, fluxo, protótipo ou app **fora deste repositório** usando o DS TIS, a entrada obrigatória é `docs/agent-consumer-usage.md` (página pública: `docs/agent-consumer-usage.html`).

Esse guia ensina o agent consumidor a instalar/importar `ds-tis/css`, `ds-tis/combobox`, `ds-tis/theme` e `ds-tis/templates/*`, consultar `docs/api/components.json`, `docs/api/tokens.json`, páginas de componentes e `docs/llms-full.txt`, usar anatomia pública, preservar acessibilidade e entregar checklist de evidência. Não use o workflow de criação/redesign de componentes abaixo para esse caso, salvo se o trabalho também pedir mudança no próprio DS.

### 4.2.3 Criar ou redesenhar componentes com agente IA

Novo componente, redesenho estrutural ou novo padrão de documentação **não começa com escrita no Figma nem no repo**. Primeiro siga `docs/process-ai-component-workflow.md` e obtenha aprovação explícita do owner para o brief/spec.

Para trabalho com agentes especializados, use também `docs/agents/README.md`. Para Product Designers, a entrada preferencial é `docs/agents/product-designer-workflow.md`: o Orchestrator deve esconder terminal, scripts e handoffs técnicos, conduzindo o fluxo por gates de aprovação. Comandos curtos oficiais vivem em `docs/agents/quick-commands.md` e devem ser resolvidos para a role/checklist correspondente. Para trabalho multi-chat ou multi-IA, use `docs/agents/protocol.md`, `docs/agents/orchestration.md` e uma run em `docs/agents/runs/` criada por `npm run agents:create-run`. Cada agente deve declarar a role e o checklist antes de agir (`DS Architect`, `Figma Builder`, `Figma Auditor`, `Token Sync Agent`, `Repo Component Agent` ou `Release Agent`). A regra operacional é: **quem constrói não aprova o próprio trabalho**.

Gate obrigatório antes de qualquer escrita:

1. **Estado atual isolado**: rodar preflight/status, identificar sujeira existente e declarar o que fica fora do escopo.
2. **Benchmark curto**: olhar 2-3 design systems maduros no Figma ou documentação pública relevante, incluindo pelo menos uma referência fornecida pelo owner quando existir.
3. **Classificação do padrão**: definir se é componente, primitive, composição, overlay, form control, menu, combobox ou outro padrão com semântica própria.
4. **Brief aprovado**: problema, quando usar/não usar, diferença para componentes próximos, padrão ARIA quando aplicável, composição com componentes DS existentes e nível de interatividade.
5. **Spec Figma aprovada**: anatomia, slots reais, propriedades públicas, variants, states, tokens necessários, regras de conteúdo e exemplos mínimos para designers.
6. **Padrão de página Figma aprovado**: antes de criar página nova ou documentação visual, inspecionar 2-3 páginas equivalentes no Figma vivo e registrar frame raiz, largura, margens, ordem de seções, padrão de tabelas/exemplos e onde component sets ficam aninhados.
7. **Draft Figma primeiro**: criar ou alterar apenas como draft/revisão, validar visualmente, documentalmente e estruturalmente, e só então espelhar no repo.

Para páginas de componentes no Figma, o padrão atual é **um único frame raiz** com o nome do componente e seções internas (`header`, `divider`, `section-*`). Componentes, component sets, exemplos, labels de matriz e documentação visual ficam dentro das seções. Nós gerados soltos no canvas da página são regressão, exceto quando uma página existente provar que aquele componente segue outro padrão e o owner aprovar a exceção.

Qualquer criação/edição de documentação visual no Figma ativa automaticamente o gate permanente de paridade visual e documental em `docs/process-ai-component-workflow.md`: consultar páginas maduras como modelo antes de escrever, capturar screenshots do alvo e dos modelos, manter textos com altura automática/height hug, evitar `clipsContent=true` em frames documentais salvo exceção aprovada, preservar root/seções/tabelas conforme o padrão vivo e auditar contagens objetivas depois. O owner não precisa lembrar essa regra em cada tarefa.

`pronto para auditoria` só pode ser declarado quando três checagens passam juntas:

- **Contrato**: properties, variants, slots, component tokens e bindings batem com a matriz aprovada.
- **Documentação**: tabelas, exemplos, textos e linhas de tokens/properties refletem a API real do componente; nenhum item removido ou renomeado permanece documentado.
- **Visual**: screenshot do componente/página foi comparado contra 2-3 páginas modelo vivas e as diferenças relevantes foram corrigidas ou registradas como exceção aprovada.

Contagem agregada (`752/757 binds`, `topLevelCount=1`, `0 loose nodes`) nunca é suficiente para encerrar Builder. Se contrato passa, mas documentação ou visual falham, o status obrigatório é `bloqueado`, não `pronto para auditoria`.

Se o owner rejeitar visualmente um draft, o agente deve parar qualquer escrita, fazer uma auditoria read-only do estado atual contra os modelos vivos e apresentar um plano de recuperação com node IDs antes de nova edição. Correções pontuais sem esse diagnóstico são consideradas improviso.

O agente deve mostrar o status do gate atual e parar quando faltar aprovação. "Ok", "vai" ou "pode seguir" só contam como aprovação para o gate imediatamente apresentado; não autorizam automaticamente Figma, repo, commit ou push.

Se o usuário pedir uma correção pontual em componente existente, mantenha o escopo estreito e use o fluxo de edição/auditoria de Figma da seção 4.3. Não transformar correção pequena em redesign sem autorização.

### 4.3 Editar componentes no Figma

Editar um component set no Figma exige preservar a API pública do componente, não só o visual. Antes e depois de qualquer mudança em variants, sublayers, icons, texts ou bindings, execute uma auditoria do component set.

#### Antes de escrever

1. Dump completo do component set alvo:
   - `componentPropertyDefinitions` com ordem atual.
   - `componentPropertyReferences` dos sublayers editáveis.
   - Ordem dos variants e dimensões por size.
   - Ordem dos sublayers dentro da anatomia afetada (`Field`, `Text Frame`, `Icon Left`, `Chevron`, `Error Message`, etc.).
2. Não extrapole de um variant para todos sem confirmar os outros variants. Se o componente tem `sm/md/lg` e estados, leia pelo menos um variant por size e todos os states afetados.
3. Antes de substituir um layer, registre quais propriedades públicas ele alimenta. Ao recriar o layer, religue as mesmas referências de componente.
4. Se a edição criar ou reorganizar página de componente, faça dump do padrão de 2-3 páginas equivalentes antes de escrever: frame raiz, largura, margens, ordem das seções, tabelas, exemplos e aninhamento de component sets.

#### Regras de properties no painel do Figma

1. Todo texto visível ou configurável de componente deve ter propriedade `TEXT` no painel e o node deve referenciar essa propriedade em `componentPropertyReferences.characters`. Isso inclui, sem limitar a: label, placeholder, value/content preenchido, helper text, error message, title, description, badge label, avatar initials, tab label, breadcrumb item, tooltip content e qualquer outro texto exposto por variant ou slot do componente.
2. Placeholder e conteúdo preenchido são propriedades diferentes quando o componente tem os dois estados:
   - Input Text e Select devem expor texto de placeholder e texto de value/content preenchido quando houver state `Filled`.
   - Textarea deve expor placeholder e content/value separadamente; não tratar os dois como a mesma propriedade.
3. Mensagens de erro devem expor o texto da mensagem como propriedade editável no painel. O frame `Error Message` não pode ter apenas texto fixo no canvas.
4. Quando um booleano habilita outro campo, o campo dependente deve vir imediatamente abaixo do booleano no painel:
   - `Show Left Icon` → `Left Icon`
   - `Show Right Icon` → `Right Icon` ou `Chevron Icon`
   - `Show Label` → `Label`
   - `Show Helper Text` → `Helper Text`
5. Não exponha duas propriedades para o mesmo conceito. No Select, o chevron é o ícone da direita; não manter `Chevron Icon` e `Right Icon` como controles concorrentes para o mesmo sublayer.
6. Booleanos de visibilidade e instance swaps precisam estar ligados ao layer correspondente:
   - `visible` aponta para o booleano.
   - `mainComponent` aponta para o instance swap.
   - Validar isso em todos os variants, não só no primeiro.
7. A ordem visual das propriedades deve seguir a ordem de uso do componente: label/required/helper, conteúdo principal, adornments relacionados, estados auxiliares. Pares booleano→campo dependente ficam juntos mesmo que isso quebre uma ordenação alfabética.

#### Regras de ordenação

1. Qualquer ordenação de tamanho deve começar pelo menor e crescer para o maior: `Small`, `Medium`, `Large` ou `sm`, `md`, `lg`.
2. Essa regra vale em todos os lugares:
   - ordem visual dos variants no canvas, de cima para baixo;
   - ordem das opções de variant no component set;
   - ordem das variables dentro de cada grupo;
   - ordem dos tokens no JSON e nas docs geradas quando a ordem for controlável;
   - ordem das tabelas e exemplos de documentação.
3. Variables de size devem manter ordem menor→maior dentro do grupo: `sm`, `md`, `lg`.
4. A lista de componentes dentro da collection `Component` deve permanecer em ordem alfabética; dentro de cada componente, priorize ordem semântica quando ela melhorar leitura e manutenção, respeitando sempre a ordem menor→maior para sizes.

#### Regras para ícones

1. Ícones usados por componentes vivos devem ser instâncias da biblioteca Lucide (`lucide/*`), não `Icon Placeholder`, fonte de ícone ou texto `glyph`.
2. `Icon Placeholder` e `glyph` são legado. Se aparecerem em componente vivo, trate como regressão e substitua por uma instância Lucide equivalente.
3. Todo ícone Lucide dentro de componente final deve ter:
   - `width` e `height` bindados em token Component de tamanho;
   - cor bindada em token Component de cor da anatomia;
   - `strokeWeight` bindado em token Component de stroke-width quando o ícone usa stroke.
4. O token Component de cor do ícone deve aliasar um Semantic de iconografia (`icon/color/*`) ou outro Semantic de conteúdo apropriado via token Component. Não aplicar Semantic direto no ícone dentro de componente final.
5. `frame-size` pertence ao frame que contém o ícone; `icon-size` pertence à instância/vetor do ícone. Não aplicar token de frame diretamente no vetor.
6. Ao trocar um ícone legado por Lucide, preserve:
   - variável de cor;
   - variável de tamanho;
   - variável de stroke-width;
   - instance swap;
   - booleano de visibilidade;
   - ordem do sublayer na anatomia.
7. A biblioteca de ícones e componentes utilitários de iconografia podem consumir Semantic `icon/*` diretamente. Componentes finais do DS consomem Component tokens.

#### Validação obrigatória após editar Figma

1. Reexecutar dump do component set e comparar com o dump inicial.
2. Verificar que todos os texts editáveis continuam com `componentPropertyReferences.characters`.
3. Verificar que todos os booleans e instance swaps esperados estão referenciados pelos sublayers em todos os variants.
4. Verificar que não há `glyph`, `Icon Placeholder` ou ícone de fonte em componentes vivos.
5. Verificar que todos os ícones Lucide em componentes finais têm size, color e stroke-width por Component token.
6. Verificar que Focus Ring usa `focus-ring/color/*` e `focus-ring/width`; radius pode ficar local quando acompanha o shape.
7. Verificar que `Component` aponta apenas para `Semantic`; `Component → Foundation`, `Component → Component` e valor cru em Component são regressões.
8. Verificar que não há `ALL_SCOPES`, variável sem WEB code syntax, `error-hover`, nem `danger` fora de Button/action destructive.
9. Após regenerar `.figma-snapshot.json` ou `.figma-snapshot.structure.json` com o snapshot exporter atualizado, rodar `npm run verify:figma-structure`. Esse gate valida regressões estruturais objetivas; não substitui screenshot.
10. Quando a mudança cria, renomeia ou remove tokens Component, rodar `npm run audit:component-tokens` com snapshot estrutural contendo `structureAudit.variableUsage`. Token sem uso real em variants finais deve ser tratado como candidato a remoção ou exigir justificativa explícita.
11. Verificar screenshot do component set quando a mudança mexer em layout, icon, spacing ou texto.
12. Se variables Figma foram alteradas, regenerar `.figma-snapshot.json` antes de afirmar que Figma↔JSON está em dia.
13. Se a mudança impacta repo, repetir o fluxo Figma → JSON → CSS gerado → docs/API/LLM → `verify:tokens` → testes relevantes.
14. Para página nova ou reorganizada no Figma, validar objetivamente que há um único frame raiz nomeado pelo componente, seções internas na ordem esperada e zero nós gerados soltos no canvas da página.

### 4.4 Sync Figma → JSON (após mudança visual feita no Figma)

Detalhes em `docs/process-figma-sync.md`. Resumo:

**Export pelo plugin (caminho preferencial):** o navegador salva `figma-snapshot.json` (sem ponto) na raiz do repo.

**Quando o owner sinalizar que o snapshot foi atualizado** (arquivo na pasta, “pronto”, “salvei o export”, etc.), o agente **deve rodar imediatamente**, sem pedir confirmação:

```bash
npm run figma:snapshot:refresh
```

Esse comando encadeia: `figma:snapshot:install` → `sync:tokens-from-figma` (dry-run) → `verify:tokens`. Não delegue isso ao owner.

**Após revisar divergências** (se houver VALUE_DRIFT acionável):

```bash
npm run sync:tokens-from-figma:write   # só quando a estratégia estiver fechada
npm run verify:tokens
```

Fallback sem plugin: regenerar `.figma-snapshot.json` via MCP `use_figma` em chunks (ver `docs/process-figma-sync.md`).

CSS_ONLY e BY_DESIGN são informativos (não drift). VALUE_DRIFT/NEW_IN_FIGMA/MISSING_IN_FIGMA exigem ação.

### 4.5 Criar ou editar uma ADR

1. Próximo número sequencial (ver `ls docs/decisions/`).
2. Nome em snake-kebab: `ADR-NNN-titulo-em-pt-br.md`.
3. Frontmatter: Status, Data (YYYY-MM-DD), Substitui/Relaciona (se aplicável).
4. Seções: Contexto, Decisão, Consequências, Alternativas consideradas, Referências.
5. PT-BR. Termos técnicos (focus ring, overlay, padding, radius, etc.) em inglês.
6. **Não escrever HTML manualmente** — `npm run sync:docs` regenera `docs/decisions/adr-NNN-...html` a partir do MD.

---

## 5. Verification protocol (rodar antes de cada commit)

| Comando | O que faz | Bloqueia commit? |
|---|---|---|
| `npm run build:tokens` | Regenera CSS de tokens a partir do JSON | Sim se falha |
| `npm run sync:docs` | Regenera `docs/token-schema.md`, `docs/component-inventory.md`, `docs/adr-index.md`, ADR HTMLs | Sim se falha |
| `npm run verify:tokens` | Valida JSON integrity, JSON↔CSS, CSS leak (ADR-013), Registry completeness, JSON↔Figma drift | **Sim se erro** |
| `npm run verify:figma-structure` | Valida snapshot Figma contra invariantes estruturais: bindings de ícone, glyph/Icon Placeholder, scopes, WEB syntax, aliases Component→Semantic e focus rings | Sim quando o snapshot foi regenerado para mudanças Figma |
| `npm run audit:component-tokens` | Falha para Component variables sem uso real nos variants finais, usando `structureAudit.variableUsage` | Sim durante limpeza/criação de tokens Component |
| `npm run verify:release-evidence` | Confirma que versão e digest dos tokens correspondem à última validação Figma fresca atestada | **Sim para qualquer release/bump** |
| `git diff` review | Confirmar que diff bate com a intenção da mudança | Manual |

Atalho: `npm run build:all` roda `build:tokens → sync:docs → build:api → build:llms → verify:tokens` em sequência.

**Se algum passo falha, fix e rode tudo de novo. Não commit com `verify:tokens` em erro, exceto se for explicitamente um commit de "WIP" autorizado pelo usuário.**

---

## 6. Convenções de commit, branch e PR

### Commits

[Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) em **português**. Prefixos: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`, `ci`.

```
fix(tokens): recalibrar paletas green e amber para contraste 4.5:1

Corpo opcional explicando o porquê. Bullet list permitido.

Co-Authored-By: <agente> <noreply@...>
```

Co-Author do agente que ajudou. Para Claude Code: `Co-Authored-By: Claude <noreply@anthropic.com>`. Para Codex/Gemini: usar identificador equivalente.

### Branches

- `main` é protegida no GitHub (ruleset). PRs preferíveis a push direto.
- Push direto a `main` é tecnicamente possível mas o owner precisa autorizar caso a caso. Padrão: trabalhar em branch `feat/<nome>` ou `fix/<nome>`, abrir PR.
- Nunca `git push --force` em main. Em branches feature, só com OK do owner.

### Pull requests

Título curto em PT-BR, corpo em markdown:

```
## Summary
- bullet 1
- bullet 2

## Test plan
- [ ] passos pra reproduzir/validar
```

Mudança arquitetural exige ADR anexada ou criada no mesmo PR.

### Idiomas

- Textos do Figma: **PT-BR**.
- Site GitHub Pages: **bilíngue PT-BR + EN** via spans `<span data-lang="pt">…</span><span data-lang="en">…</span>`.
- Termos técnicos universais (label, placeholder, focus ring, padding, radius, overlay) ficam em inglês mesmo em PT-BR.
- ADRs e CHANGELOG: **PT-BR**.

---

## 7. Versionamento e CHANGELOG

- Versão atual em `package.json` e `README.md` (badge). Manter em sincronia.
- Pré-1.0.0: faixa `1.0.0-beta.N` enquanto ainda em fase beta. Tags 0.x são histórico pré-beta.
- Durante beta, releases incrementam apenas `N` e devem seguir pacote coerente ou cadência semanal, sem minor/patch separados.
- Qualquer bump ou publicação exige snapshot Figma com menos de 24h e `npm run release:figma-evidence`; o snapshot permanece gitignored e somente `docs/api/release-figma-evidence.json` entra no commit.
- CHANGELOG segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Seção `[Não publicado]` acumula entradas até o owner decidir tagear nova versão.
- **Cada mudança significativa entra em `[Não publicado]`** antes do commit. Significativo = observável pelo consumidor (designer ou dev), ou que muda processo/arquitetura. Refactor interno sem efeito externo não exige entrada.
- Bump de versão (`package.json` + tag git) é decisão do owner. Agente não bumpa sem pedido explícito.

---

## 8. Acessibilidade (WCAG 2.2 AA é obrigatório)

- Contraste 4.5:1 para texto normal, 3:1 para componentes UI e texto large (≥18pt regular ou ≥14pt bold).
- Novo par foreground/background sempre validado contra contraste antes de virar token. Fundo shade 400 ou mais claro pede foreground neutral-900; fundo shade 600+ pede neutral-50.
- Focus ring visível em todos componentes interativos. Token `outline.focus.*`.
- `aria-*` correto em componentes com estado (`aria-invalid`, `aria-describedby`, `aria-expanded`, `aria-current`, etc.).
- Testar via `npm run test:a11y` (axe-core + Playwright).
- Detalhes em `docs/accessibility.html`.

---

## 9. Pipeline (resumo executável)

```
Figma Variables  ──[sync manual]──►  tokens/**/*.json  ──[build-tokens.mjs]──►  css/tokens/generated/*.css
   (categorias)                       (DTCG, fonte canônica em Git)              (derivado, não editar)
   Figma-canônicas
                                                                                          │
                           tokens CSS-only (motion/z/shadow)                              │
                           ──[edição direta no JSON]──────►                               ▼
                                                                                  css/components/*.css
                                                                                  css/base/*.css
                                                                                  (consome var(--ds-*))
                                                                                          │
                                                                                          ▼
                                                                                  docs/*.html
                                                                                  (preview e doc)
```

CI (`.github/workflows/deploy.yml`) constrói e audita `_site/` em pull requests e pushes para `main`. O workflow é read-only no repositório: falha se CSS/derivados commitados estiverem inconsistentes e, em `main`, publica o artefato mínimo pelo GitHub Pages Actions. Não há auto-commit.

---

## 10. Glossário

- **DTCG** — Design Tokens Community Group format (W3C draft). Estrutura `{ "$type": "color", "$value": "#fff" }`. JSON canônico.
- **Foundation token** — primitivo numérico/neutro (`radius/16`, `color/blue/600`).
- **Semantic token** — alias com intenção (`radius.lg`, `brand.background.default`).
- **Binding** — variable Figma aplicada em uma propriedade de um node (`fills`, `cornerRadius`, etc.).
- **Drift** — divergência entre fonte de verdade e seu derivado (Figma vs JSON, JSON vs CSS).
- **Leak** — consumidor final consumindo camada errada (CSS de componente referenciando `--ds-color-blue-600` direto em vez de `--ds-brand-background-default`).
- **CSS-only token** — categoria sem equivalência Figma Variable (motion, z-index, shadow). ADR-016.
- **VALUE_DRIFT / NEEDS_SYNC / ALIAS_BROKEN / CSS_ONLY / BY_DESIGN** — categorias do `sync:tokens-from-figma`. Detalhes em `docs/process-figma-sync.md`.
- **Snapshot** — `.figma-snapshot.json` (gitignored), dump local das Variables Figma usado por scripts de sync. Regenerado manualmente via `use_figma`.
- **Text Style** — preset Figma para tipografia (`body/sm`, `label/md`). Internamente binda Variables. Texto de componente recebe Text Style, não bindings prop-a-prop.
- **ADR** — Architecture Decision Record. Vivem em `docs/decisions/ADR-NNN-*.md`.

---

## 11. Quando houver dúvida (ordem de consulta)

1. Este `AGENTS.md` (você está aqui).
2. `docs/decisions/adr-index.md` — decisões arquiteturais ativas.
3. `docs/system-principles.md` — princípios operacionais profundos.
4. `docs/process-ai-component-workflow.md` — gate para agentes antes de criar/redesenhar componentes e padrões.
5. `docs/agent-consumer-usage.md` — guia para agents implementarem telas em projetos consumidores usando o DS TIS.
6. `docs/token-architecture.html` — arquitetura visual.
7. `docs/process-figma-sync.md` — fluxo Figma↔JSON.
8. `docs/backlog.md` — o que ainda está por fazer.
9. Issue no GitHub ou perguntar ao owner.

---

## 12. Integrações e adapters de agentes

- **Integrações Figma/GitHub/MCP**: ver `docs/agent-integrations.md`.
- **Claude Code**: `CLAUDE.md` é adapter fino para ferramentas Claude.
- **Gemini CLI**: `GEMINI.md` é adapter fino para ferramentas Gemini.
- **Codex / Cursor / Aider / outros**: este arquivo (`AGENTS.md`) é completo. Se uma ferramenta precisar de configuração própria, ela deve apontar para este arquivo e manter apenas detalhes operacionais específicos.

Configurações locais de agente (`.claude/settings.local.json`, `.gemini/settings.json`, `.codex/config.toml`, equivalentes) não são fonte de verdade do projeto e não devem carregar regras arquiteturais que outras IAs deixariam de ver.
