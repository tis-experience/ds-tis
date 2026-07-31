- Status: Aprovado para o draft Figma

# Figma Audit Report

- Componente: Accordion vNext
- Página: `2:6` `❖ Accordion`, arquivo `VJtzLJV8Ie9yq7b00jfT2g`
- Node principal: `5:9` `Accordion`
- Spec usada: `02-figma-spec.md`
- Páginas modelo declaradas: Accordion `8519:3603`, Checkbox `135:8` e Select `146:20`, arquivo original `IE68amP9Hya5ieFw1rX8S8`
- Auditor: Codex, role Figma Auditor independente
- Data: 2026-07-29
- Veredito: **Aprovado para o draft Figma**
- Severidades atuais: P0 = 0; P1 = 0; P2 = 0; P3 = 0
- Severidades da primeira rodada, resolvidas: P0 = 0; P1 = 3; P2 = 2; P3 = 0

## Primeira rodada — resolvida

### Passou na primeira rodada

- `topLevelCount`: 1/1.
- root: um único frame raiz, auto-layout vertical, altura HUG e `clipsContent=false`. A largura de 1440 px é somente canvas de referência e não foi tratada como ganho arquitetural.
- seções: 7/7, na ordem aprovada (`5:10` a `5:16`).
- variants: nenhum component set foi criado ou alterado no piloto; 4 combinações visuais planejadas foram exercitadas em 6 instâncias remotas.
- component properties: as 6 instâncias preservam as 7 properties publicadas (`Title`, `Content`, `Content Slot`, `Show Leading Icon`, `Leading Icon`, `State`, `Open`).
- slots: `Content Slot` preservado nas 6 instâncias, sem detach.
- token binds: nenhuma variable foi criada ou alterada. Bindings profundos das instâncias remotas são não aplicáveis a esta auditoria do draft.
- instance detaches: 0.
- focus ring: o exemplo Focus reutiliza a variant publicada e não há clipping visível no screenshot do draft; isto não aprova o risco de clipping da implementação final.
- elevation: não aplicável; o draft não cria overlay nem Effect Style.
- loose nodes: 0.
- documentation text fixed height: 0.
- documentation frames `clipsContent=true`: 0/28.
- estrutura visual do alvo: sem frame colapsado, placeholder ou clipping aparente no screenshot revisado.
- escopo de paridade: comparação Figma→Figma de componente, anatomia, estados e tokens. Layout/IA da documentação Astro é independente e não foi usado como critério; 1440 px permanece apenas canvas interno.
- Code Connect: não aplicável e fora de escopo.

### Achados da primeira rodada

| Severidade | Item | Evidência | Node IDs | Correção sugerida |
|---|---|---|---|---|
| P1 | A API apresentada como neutra vaza um tipo específico de React | O contrato mostra `leadingIcon?: ReactNode`, apesar de a própria seção afirmar que nenhum tipo do provider entra no contrato do consumidor. | `5:14` `section-api`; `10:57` `Card body`, propriedade `characters` visível no screenshot | Substituir `ReactNode` por uma descrição neutra de slot/conteúdo e deixar o mapeamento para tipos de cada stack fora do contrato cross-stack. |
| P1 | O identificador público do item diverge do contrato recomendado | O exemplo React usa `<Accordion.Item id="billing">`, enquanto o contrato recomendado anterior usa `itemId`; a lista de contrato em `10:57` também não explicita a identificação do item. | `5:14` `section-api`; `10:57` `Card body`; `10:60` `Code`, propriedade `characters` visível no screenshot | Escolher uma única property pública (`itemId` conforme o contrato recomendado), adicioná-la ao contrato e alinhar exemplo, spec e implementação futura. |
| P1 | Tipografia documental não segue o contrato das páginas maduras | A spec declara `Text styles: zero; documentação usa Inter com auto-height`. `grounding.md` exige `textStyleId` e binds tipográficos/cores equivalentes aos modelos; Inter cru é bloqueio explícito. | Root `5:9`; seções documentais `5:10` a `5:16` | Aplicar os Text Styles e bindings de cor/tipografia dos modelos vivos a todos os TEXTs e persistir a contagem pós-correção por node. |
| P2 | Gate de contrato não tem matriz objetiva executada | O Build Report registra que não existe matriz CSV e que `agents:validate-matrix --strict-exceptions` não foi executado; assim, `unmappedRows=0` não foi demonstrado. | Não aplicável a node; `03-figma-build-report.md`, seção Entrada | Materializar a matriz aprovada, incluir `itemId` e a neutralidade cross-stack, executar a validação estrita e registrar `unmappedRows=0`. |
| P2 | Paridade visual independente não está comprovada na evidência persistida | A run guarda o screenshot do alvo e lista três node IDs de referência, mas não persiste screenshots dos modelos para comparação independente de densidade, tipografia, tabelas e spacing. | Alvo `5:9`; modelos `8519:3603`, `135:8`, `146:20` | Persistir screenshots datados dos três modelos e uma comparação objetiva. O alvo isolado não mostra defeito visual grave, mas a evidência atual não fecha o gate Visual. |

### Contagens da primeira rodada

- Variants esperadas/encontradas: não aplicável para criação de set (0 sets criados); 4/4 combinações planejadas exercitadas em 6 instâncias.
- Slots esperados/encontrados: 6/6 instâncias com `Content Slot`; inspeção profunda do master remoto não aplicável.
- Binds esperados/encontrados: não aplicável para instâncias remotas; 0 variables criadas/alteradas. A documentação não tem contagem por propriedade persistida.
- Linhas documentais com contrato divergente: 2 confirmadas (`ReactNode`; `id` versus `itemId`).
- Linhas da matriz sem mapeamento: não demonstrado; matriz CSV ausente.
- Textos `autoRename=true`/total: não medido na evidência persistida.
- Textos documentais com altura fixa indevida: 0.
- TEXTs sem `textStyleId`/binds equivalentes ao modelo: total não medido; a própria spec declara 0 Text Styles para a documentação inteira.
- Frames documentais com `clipsContent=true`: 0/28.
- Divergências contra páginas modelo: 1 gap de evidência comparativa; screenshots dos modelos não foram persistidos.
- Divergências visuais graves confirmadas no alvo isolado: 0.
- Instance name mismatches: não medido; instâncias detached: 0.
- Hardcoded fills/strokes: não medido por node; nenhuma variable ou style foi criado.
- Loose nodes: 0.
- Variables novas sem WEB code syntax: 0.
- Component variables sem uso: não aplicável; 0 Component variables criadas ou alteradas.
- Content Slots com seed/chrome/default incorreto: não aplicável à inspeção profunda das instâncias remotas; 0 detach.

### Status tripartite da primeira rodada

- Contrato: **falhou** — neutralidade cross-stack e identificação do item estão inconsistentes; matriz estrita ausente.
- Documentação: **falhou** — duas linhas contradizem o contrato e a tipografia documental não segue Text Styles/bindings dos modelos.
- Visual: **falhou no gate de evidência** — o alvo isolado está estruturalmente íntegro, mas a comparação independente com os três modelos não foi persistida.
- Gate/processo: **falhou** — não há `unmappedRows=0` nem evidência comparativa completa. O snapshot canônico stale não é o bloqueio desta decisão porque o piloto não alterou variables.

### Bloqueios definidos na primeira rodada

- Figma aprovado: não; retornar ao Figma Builder apenas para as correções pontuais acima e novo dump/screenshot.
- Repo sync: bloqueado até Contrato, Documentação e Visual passarem juntos.
- Commit/push: bloqueado; não autorizado por esta auditoria.

## Segunda rodada

- Escopo: reauditoria documental independente dos artefatos persistidos na run, sem nova leitura do Figma e sem avaliação do runtime.
- ReactNode: resolvido. O tipo específico de React foi removido do contrato cross-stack.
- Identidade do item: resolvida. `itemId` está registrado como nome público único na matriz, e os relatórios pós-correção confirmam o alinhamento entre contrato e exemplo React.
- Tipografia documental: resolvida. A evidência pós-correção registra 29 textos vinculados a nove Text Styles publicados do DS TIS. A declaração anterior de `Text styles: zero` em `02-figma-spec.md` descreve o estado anterior à correção e é superada pelo dump pós-escrita e pelo Build Report desta rodada.
- Matriz objetiva: resolvida. `evidence/accordion-contract-matrix.md` contém 12 linhas, sem exceções, e a validação estrita está registrada com `unmappedRows=0`.
- Paridade visual persistida: resolvida. Existem os quatro PNGs declarados — alvo após correção, Accordion original, Checkbox original e Select original — e `evidence/figma-draft-audit.md` registra os respectivos node IDs.
- Astro: confirmado como superfície independente do layout Figma. A paridade exigida é do componente; o canvas de 1440 px, os cards e a composição da página Figma não são contrato de layout, navegação ou responsividade do Astro.

### Status tripartite

- Contrato: **passou** — neutralidade cross-stack e identificação por `itemId` estão fechadas; a matriz objetiva cobre 12/12 linhas com `unmappedRows=0`.
- Documentação: **passou** — contrato, exemplo e matriz estão alinhados, e os 29 textos documentais têm Text Styles publicados aplicados conforme a evidência pós-correção.
- Visual: **passou** — o alvo e os três modelos estão persistidos para comparação independente, sem divergência visual grave registrada.

### Veredito

**Aprovado para o draft Figma.** Os cinco bloqueios da primeira rodada foram resolvidos na evidência atual. Implementação executável, comportamento de runtime, SSR/hydration, teclado, responsividade e promoção do wrapper continuam fora do escopo desta aprovação.
