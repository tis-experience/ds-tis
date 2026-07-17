- Status: Aprovado pelo owner em 2026-07-17

# Brief proposto

- Nome: Gate de readiness App-ready por evidência executada.
- Classe: Infraestrutura repo-only de qualidade e governança; não é componente, primitive, composição nem padrão visual.
- Problema: O gate atual compara o catálogo com artefatos gerados a partir do próprio catálogo. Para componentes `ds-runtime`, a existência de export, docs e uma classificação `app-ready` é aceita sem provar, por componente, todos os comportamentos exigidos pela ADR-020. Os testes de lifecycle e consumidor executam checks úteis, mas não produzem evidência rastreável por capability e por slug; assim, uma promoção pode ser autoatestada no catálogo.
- Usar quando: Validar qualquer componente marcado `app-ready`, em especial promover ou manter um `ds-runtime`; bloquear a promoção quando faltar ao menos um cenário obrigatório executado com sucesso no código-fonte ou no tarball instalado.
- Nao usar quando: Como substituto para corrigir runtime, revisar UX, validar Figma, criar token, atualizar baseline visual ou aprovar release. O gate detecta ausência/falha de evidência; ele não transforma runtime parcial em completo.
- Diferencas para componentes proximos: `test-component-readiness` continua validando o contrato catálogo/API/arquivos; `test-runtime-lifecycle` prova comportamento e cleanup no código-fonte; `test-consumer-smoke` prova export, instalação e comportamento no tarball; o novo agregador cruza somente evidências produzidas por assertions realmente executadas. Nenhum desses testes deve duplicar a responsabilidade do outro.
- Acessibilidade/semantica: O contrato de evidência de `ds-runtime` deve exigir teclado, focus, ARIA/state sync, abertura/fechamento, eventos, cleanup e axe nos estados fechado e aberto. Cada componente mantém casos específicos compatíveis com seu padrão WAI-ARIA; um único axe global ou um check genérico não pode ser creditado automaticamente a todos os slugs.
- Composicao DS: `component-catalog.mjs` permanece fonte da classificação pública; um registro de requisitos de teste, separado do catálogo, define capabilities obrigatórias; os runners registram somente checks que passaram; um agregador cria relatórios efêmeros, executa as suites e compara a união das evidências com os requisitos dos componentes atualmente `app-ready`.
- Variants/states candidatos: N/A visual. Perfis de gate: contrato-base para todos os componentes; evidência adicional de runtime para `behaviorModel: ds-runtime`. Estados operacionais relevantes: `experimental` enquanto houver lacuna e `app-ready` somente com cobertura completa executada.
- Slots: N/A.
- Tokens: N/A; nenhuma alteração em Foundation, Semantic, Component ou CSS gerado.
- Docs Figma: N/A. O escopo não altera componente, anatomia, variant, state, property, binding, token ou documentação visual.
- Impacto repo: Corrigir temporariamente para `experimental` Accordion, Combobox, Modal, Menu, Tabs e Tooltip; introduzir contrato e coletor de evidência; tornar lifecycle e consumer smoke reportáveis por slug/capability; criar `test:app-ready`; ligar o gate ao CI sem recursão de `npm pack`; eliminar listas de runtimes paralelas nos testes tocados; alinhar ADR-020, API/inventário/LLM derivados e CHANGELOG ao estado verificável.
- Fora de escopo: Corrigir defeitos funcionais dos seis runtimes; promover qualquer runtime novamente; alterar API comportamental; distribuir novos arquivos no pacote; resolver variantes inferidas por CSS; revisar inventário Figma; atualizar baselines; editar Figma/tokens/CSS; bump de versão, commit, push, PR ou release.
- Bloqueado antes de: Qualquer escrita em código, catálogo, ADR, CI ou artefato gerado; qualquer mudança no Figma; commit/push/PR. Esta run registra apenas o gate do DS Architect até aprovação explícita do owner.
- Aprovacao necessaria: Aprovar (1) downgrade temporário dos seis `ds-runtime`; (2) arquitetura de evidência efêmera, sem flags `passed` persistidas no catálogo; (3) requisitos completos por slug; (4) `test:app-ready` como step separado do CI, fora de `npm test`/`build:all`; e (5) escopo estrito do PR 1, sem corrigir os runtimes nesta etapa.

## Estado atual isolado

- Preflight em 2026-07-17: branch `main`, worktree inicialmente limpa, commit `4cc74e6 feat(tooltip): runtime público e App-ready (#21)`, `0↑ 0↓` contra upstream e `verify:tokens` sem erros.
- A run foi criada pelo Orchestrator depois do preflight e aparece como arquivo novo; nesta role, somente `01-brief.md` e `02-figma-spec.md` são alterados.
- Snapshot Figma não é entrada desta decisão. Não há trabalho Figma em disputa nem limpeza Figma autorizada.

## Evidência repo consultada

- `scripts/test-component-readiness.mjs`: compara profundamente API e catálogo, mas a API é derivada do mesmo catálogo; para `app-ready` + `ds-runtime`, exige apenas runtime público `required`.
- `scripts/test-runtime-lifecycle.mjs`: cobre um happy path de init, interação, destroy e re-init para seis runtimes, sem identidade formal de capability por slug e usando `includes` para eventos, o que não detecta duplicidade.
- `scripts/test-consumer-smoke.mjs`: instala o tarball e importa seis runtimes, mas só prova o export map via bare import para Modal; no browser interage apenas com Modal e Combobox e executa axe após os estados interativos já terem sido fechados.
- `scripts/lib/component-catalog.mjs`: todos os seis `ds-runtime` estão marcados `app-ready` com notas que afirmam evidência completa.
- ADR-020: determina que runtime incompleto permaneça Experimental, mas a classificação atual e a frase de conclusão do gate não são sustentadas pelos testes observados.
- `.github/workflows/test.yml`: executa readiness, lifecycle, a11y e consumer smoke separadamente, porém não cruza a cobertura executada com os slugs `app-ready` e não roda `test:audit-scenarios`.

## Benchmark e classificação

- Benchmark de design systems/Figma: N/A por decisão de escopo. Esta entrega corrige infraestrutura de verificação existente e não propõe componente, interação, anatomia ou documentação visual.
- Referência arquitetural aplicável: ADR-020 e contratos/testes vivos do próprio repo.
- Classificação final: infraestrutura de gate repo-only.

## Arquitetura mínima aprovada para implementação

1. Um módulo de requisitos declara IDs estáveis, suite dona e requisitos comuns/específicos por slug. Requisitos são normativos, nunca resultados.
2. Um coletor compartilhado recebe `check(slug, capability, condition, message)` e só adiciona uma capability ao relatório quando a assertion passa. Falha mantém exit code não zero.
3. Lifecycle e consumer smoke geram JSON efêmero apenas quando chamados pelo agregador. O relatório inclui schema/version, suite, conclusão e capabilities aprovadas; o agregador rejeita arquivo ausente, malformado, incompleto ou de suite diferente.
4. `test-component-readiness` valida catálogo/API/arquivos, cobertura estrutural do registro e, quando recebe relatórios, a cobertura executada obrigatória de cada `app-ready`.
5. `test-app-ready.mjs` cria uma pasta temporária, executa contract, lifecycle e consumer smoke, lê os relatórios e roda a validação final. Nenhuma evidência verde é commitada ou reaproveitada de execução anterior.
6. O CI executa `test:app-ready` depois de instalar Chromium. O agregador fica fora de `npm test` e `build:all`: o consumer smoke chama `npm pack`, que aciona `prepublishOnly -> build:all`; incluí-lo ali criaria recursão.
7. Um teste negativo usa catálogo sintético/in-memory para provar que mudar um `ds-runtime` de `experimental` para `app-ready` sem todas as capabilities falha. Isso mantém o enforcement exercitado enquanto os seis slugs estão temporariamente Experimentais.

## Addendum da revisão independente

- O comportamento local do npm confirmou que `npm pack` não executa
  `prepublishOnly`. Portanto `test:app-ready` também pode e deve integrar
  `prepublishOnly` sem recursão; ele continua fora de `npm test`/`build:all`.
- `test:audit-scenarios` mantém por padrão os checks do snapshot Figma local.
  No CI, uma variante explícita pula apenas esses checks porque
  `.figma-snapshot.json` é gitignored, preservando os demais cenários.

## Capabilities mínimas do contrato `ds-runtime`

- Contrato/pacote: export público por bare specifier, exports declarados e eventos públicos.
- Inicialização: `document`, container e component root; segundo init idempotente; markup incompleto não fica marcado; late mount/hydration recuperável.
- Interação: teclado específico do padrão, focus, ARIA/state sync e fluxo principal open/close/select.
- Lifecycle: destroy escopado e idempotente, timers/listeners limpos, nenhuma emissão pós-destroy e re-init com exatamente um evento por ação.
- Consumidor: instalação do tarball, interação pelo pacote instalado, zero `pageerror`/console error inesperado e axe critical/serious zero em estado fechado e aberto.

## Decisões pendentes do owner

1. Confirmar o downgrade temporário dos seis runtimes no PR 1.
2. Confirmar que evidência runtime completa é exigida agora; cobertura isolada de `native`/`presentation` permanece melhoria posterior e não reclassifica os demais componentes neste PR.
3. Confirmar que os PRs funcionais seguintes re-promovem um slug por vez, sem exceções manuais no gate.

## Handoff bloqueado

- Role seguinte após aprovação: Repo Component Agent; gates Figma Builder, Figma Auditor e Token Sync são N/A para esta run repo-only e não devem gerar escrita Figma/token.
- Artefato de entrada: este brief e `02-figma-spec.md` N/A.
- Artefato esperado depois da aprovação: `05-repo-sync-plan.md` declarando N/A para tokens e `06-repo-implementation-report.md` com o PR 1.
- Bloqueado antes de: aprovação explícita do owner para o gate `brief` e autorização do porteiro da run.
