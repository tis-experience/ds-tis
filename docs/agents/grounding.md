# Grounding — regras anti-alucinação para qualquer agente

Este documento é a **espinha anti-alucinação** do trabalho multi-agent no DS Core.
Toda role (`docs/agents/roles/*`) o referencia. Ele existe porque a documentação
do processo, sozinha, não impede erro: na construção do Combobox, o contrato
existia e o agente mesmo assim entregou tokens errados, foco na borda estrutural,
properties incompletas e documentação divergente da API.

> A lição central do post-mortem: **o problema não foi falta de documentação; foi
> não obedecer a documentação como contrato operacional.** Trate o Figma vivo
> maduro como fonte de comparação, nunca como inspiração aproximada.

As regras abaixo são normativas. Quando uma delas conflita com "o que parece
razoável", a regra ganha.

---

## 1. Fundamentação: nunca afirme um fato que você não leu nesta sessão

1. Toda afirmação sobre o Figma (binding, valor, property, ordem, anatomia) precisa
   ser lastreada por uma leitura feita **nesta sessão** e **persistida** na run
   (`evidence/`): dump de nó, screenshot ou saída de validador.
2. Toda afirmação precisa citar **`node ID + propriedade`**. "O Field usa o token
   certo" não é evidência; "`8082:60 fills -> field/bg/default`" é.
3. Se a ferramenta necessária (Figma MCP, shell, GitHub) não estiver disponível no
   runtime, **declare a limitação e pare**. Nunca improvise um workaround nem
   invente o resultado que a ferramenta daria.
4. Builder, Auditor e Repo Agent raciocinam sobre o **mesmo snapshot datado**
   (`state.json.figmaSnapshot`). Se você re-ler o Figma e o valor divergir do
   snapshot, isso é um achado a reportar, não um valor a assumir.

## 2. Contagem nunca é prova de qualidade

O erro mais perigoso do Combobox foi validar "número de variants", "752/757 binds"
e "zero nós soltos" como se provassem aderência. Não provam.

1. Binding é validado **por propriedade e por nó**, nunca por total agregado.
   Para cada nó relevante, verifique individualmente: `fills`, `strokes`,
   `strokeWeight`/`strokeTopWeight`/..., `cornerRadius`, `paddingLeft/Right/Top/Bottom`,
   `itemSpacing` (gap), `height`/`minHeight`, text style e `componentPropertyReferences`.
2. Um total alto pode mascarar token errado, anatomia fraca e property incompleta.
   Contagem agregada **não** fecha gate.
3. "Parecido na superfície" não é "consistente em comportamento estrutural".

## 3. Composição de padrões existentes, não desenho novo

Componentes novos são composições de padrões maduros. Para cada parte, prove
paridade com o modelo vivo antes de manter qualquer diferença:

- Form control (root, label, field, helper, error): seguir `Input Text` / `Select`.
- Popup/listbox: seguir `Menu` / `Menu Item`.
- Erro/helper/label: seguir o padrão de form field (`form-field/*`).
- Foco: seguir Focus Ring dedicado.

Diferença só permanece com **justificativa explícita** registrada como exceção na
matriz e aprovada pelo owner. Popup, erro e empty state tratados como blocos locais
inventados são regressão.

## 4. Inspeção correta de ícones (binding mora no vetor interno)

No Combobox, ícones Lucide foram contados como "sem binding" porque o agente olhou
o **nó pai** (a instância). O binding de cor/stroke geralmente está no **vetor
interno**. O validador (`figma-plugin/snapshot-exporter` / `verify:figma-structure`)
desce na árvore (`findDescendants`) justamente por isso. Raciocine igual:

1. Para `width`/`height`: verifique o binding na própria instância do ícone.
2. Para cor (`fills`/`strokes`) e `strokeWeight`: desça até o vetor interno.
3. Ícone vivo deve ser instância Lucide (`lucide/*`), com `size`, `color` e
   `stroke-width` em Component token. `glyph` e `Icon Placeholder` são legado.
4. `frame-size` pertence ao frame; `icon-size` pertence ao vetor. Não troque.

## 5. Foco: borda estrutural ≠ Focus Ring

Regressão recorrente: variants `Focused` mantendo cor de foco na **borda estrutural**.

1. A borda do container reflete o estado estrutural (`default`, `filled`, `error`,
   `readonly`, `disabled`).
2. O foco aparece no layer **Focus Ring** dedicado, com `focus-ring/color/*` e
   `focus-ring/width` (Component tokens). `verify:figma-structure` bloqueia Focus
   Ring que não use esses tokens.
3. Quando o modelo vivo de form control (Input Text/Select) usa também
   `field/border-color/focus` no Field além do ring, isso é uma decisão do
   componente e deve estar como **linha explícita na matriz** com evidência do
   modelo — não inferida.

## 6. Documentação é derivada da API real, nunca escrita à mão

1. Primeiro leia `componentPropertyDefinitions`.
2. Depois valide `componentPropertyReferences` (cada property é referenciada por um
   sublayer real?).
3. Só então gere a tabela de properties/tokens/acessibilidade **a partir** desse dump.
4. Nenhuma linha de documentação pode existir se não corresponder a uma property,
   state, slot ou token real. Editar texto de doc manualmente, sem derivar da API,
   é proibido.
5. Property pública removida/renomeada também é removida/renomeada na documentação.

## 7. Comparação com modelos vivos é estrutural **e** visual

1. Antes de escrever documentação visual, extraia dos modelos vivos para `evidence/`:
   frame raiz, largura, margens, ordem de seções, padrão de tabelas, exemplos e
   conteúdo. Construa a partir disso, não de memória.
2. Capture screenshot do alvo e dos 2-3 modelos. Compare densidade, hierarquia,
   espaçamento, tabelas e exemplos.
3. Registre cada divergência. Só mantenha diferença com exceção aprovada.

## 8. Erros que bloqueiam o handoff (status = `bloqueado`)

Qualquer um destes impede declarar "pronto para auditoria":

- property pública sem sublayer que a referencie;
- documentação divergente da API real;
- foco usando borda estrutural em vez de Focus Ring;
- popup/listbox/empty state com dimensões inventadas (sem modelo vivo);
- Component token sem uso real nos variants finais;
- estilo hardcoded (fill/stroke/radius cru) sem justificativa aprovada;
- `unmappedRows > 0` na matriz de contrato.

## 9. Protocolo de recuperação pós-rejeição

Quando o owner ou o Auditor rejeita um draft, **pare**. Não aplique correções
incrementais soltas (isso gerou retrabalho no Combobox).

1. Auditoria read-only do estado atual contra os modelos vivos.
2. Monte uma **matriz de divergências** (mesmo formato da matriz de contrato).
3. Corrija em **grupos pequenos e nomeados**, nesta ordem:
   `properties → focus → error/helper → popup/listbox → documentation → visual polish`.
4. Rode a validação objetiva após **cada** grupo e registre o exit code no `state.json`
   (`agents:gate -- <run> --record-check <nome> --exit <code>`).
5. Só no fim capture screenshot e declare o status tripartite.

## 10. Status tripartite é computado, não declarado

O Builder não "acha" que está pronto. Ele reporta três status separados, cada um
lastreado em saída de validador ou evidência:

- **Contrato**: matriz executada, `unmappedRows=0`, bindings por propriedade ok,
  properties referenciadas, `verify:figma-structure` exit 0.
- **Documentação**: tabelas derivadas da API; zero linhas citando property/slot/
  token/state inexistente.
- **Visual**: screenshot final comparado aos modelos vivos; divergências corrigidas
  ou aprovadas como exceção.

Se contrato passa mas documentação ou visual falham, o status final obrigatório é
`bloqueado`. Contagem agregada nunca substitui esses três.
