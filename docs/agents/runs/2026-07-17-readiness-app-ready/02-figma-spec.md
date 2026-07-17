- Status: N/A — repo-only; pronto para aprovação junto do brief

# Spec Figma proposta

- Componente/padrao: N/A. Infraestrutura de gate de readiness no repo.
- Pagina Figma: N/A; nenhuma página ou node será lido, criado ou alterado.
- Referencias DS Core consultadas: N/A visual. Foram consultados ADR-020, catálogo, API gerada, testes de readiness/lifecycle/consumer, fixtures e CI do repo.
- Referencias externas consultadas: N/A para benchmark. O escopo não cria nem redesenha comportamento; os contratos WAI-ARIA já definidos para cada runtime serão requisitos dos testes funcionais posteriores.

## Justificativa do N/A

O escopo aprovado corrige um falso positivo sistêmico de infraestrutura: a classificação pública consegue concordar consigo mesma sem estar ligada a cenários executados. Não há mudança de anatomia, visual, propriedades, variants, states, slots, tokens, bindings ou conteúdo Figma. Por isso, benchmark Figma, spec visual, matriz de contrato, Figma Builder, Figma Auditor, screenshots e snapshot estrutural não são aplicáveis.

## Anatomia

- Root: N/A.
- Subcamadas: N/A.
- Nested instances: N/A.
- Slots: N/A.

## Auto-layout

- Root: N/A.
- Secoes/containers: N/A.
- Regras de resize: N/A.
- `clipsContent`: N/A.

## Properties

- Variants: N/A.
- Text properties: N/A.
- Boolean properties: N/A.
- Instance swaps: N/A.
- Slot properties: N/A.
- Ordem no painel: N/A.

## States

- Default: N/A.
- Hover: N/A.
- Focused: N/A.
- Pressed: N/A.
- Disabled: N/A.
- Open/Closed: N/A visual; esses estados serão exercitados somente como evidência automatizada no repo.
- Error/Invalid: N/A.

## Tokens/bindings

- Foundation: N/A.
- Semantic: N/A.
- Component: N/A.
- Variables novas: Nenhuma.
- Effect styles: N/A.
- Text styles: N/A.

## Exemplos no canvas

- Exemplo 1: N/A.
- Exemplo 2: N/A.
- Matriz de variants: N/A.

## Documentacao visual

- Secoes: N/A.
- Tabelas: N/A.
- Notas para designers: N/A; a mudança é de governança técnica para devs e agents consumidores.
- Diferencas para componentes proximos: N/A.

## Validacao planejada

- Estrutura: Verificar que todo slug em `RUNTIME_BY_SLUG` tem perfil de requisitos e que não existem perfis órfãos, IDs duplicados ou capability sem suite dona.
- Bindings: N/A Figma. No repo, validar que `app-ready` é computado contra a união das evidências efêmeras, não contra flags persistidas.
- Slots: N/A.
- Textos: Atualizar somente afirmações públicas derivadas do catálogo/ADR para não declarar gate concluído sem prova.
- Instancias: N/A Figma. Validar runtimes instalados via bare imports a partir do projeto consumidor.
- Screenshot: N/A; não há mudança visual. Não atualizar baselines neste PR.
- Validadores repo: `npm run agent:preflight`; teste negativo de promoção sem evidência; `npm run test:readiness`; `npm run test:runtime-lifecycle`; `npm run test:consumer-smoke`; novo `npm run test:app-ready`; `npm run test:audit-scenarios`; `npm run build:all`; `npm run verify:agent-docs`; `npm run verify:tokens`; `git diff` revisado.

## Contrato de evidência repo

- Cada resultado tem chave `slug + capability` e só é emitido depois de uma assertion aprovada.
- Os relatórios são criados em diretório temporário por execução e nunca commitados.
- O agregador falha se um subprocesso falhar, se um relatório não for concluído ou se faltar capability obrigatória para qualquer `ds-runtime` `app-ready`.
- Capabilities de axe open/closed são atribuídas somente ao componente efetivamente escaneado naquele estado.
- Eventos são validados por contagem exata, não apenas por presença.
- A fixture consumidora e probes do pacote são derivados dos runtimes canônicos sempre que possível; listas paralelas nos testes tocados são removidas.
- O gate negativo permanece executado mesmo quando nenhum `ds-runtime` está temporariamente `app-ready`.

## Arquivos previstos após aprovação

- Novos: módulos compartilhados de requisitos/coleta e agregador `test-app-ready`.
- Ajustados: `scripts/test-component-readiness.mjs`, `scripts/test-runtime-lifecycle.mjs`, `scripts/test-consumer-smoke.mjs`, testes de contrato runtime/audit tocados, fixtures necessárias, `scripts/lib/component-catalog.mjs`, `package.json`, `.github/workflows/test.yml`, ADR-020 e CHANGELOG.
- Derivados: API, inventário, ADR HTML e LLM docs gerados pelos scripts existentes.
- Não previstos: `js/*.js`, `css/**`, `tokens/**`, snapshot Figma ou baselines visuais.

## Bloqueado antes de

- Figma write: Permanentemente N/A neste escopo; nenhuma autorização de Figma deve ser inferida.
- Repo sync: Bloqueado até aprovação explícita do owner para `01-brief.md` + este N/A e avanço do gate da run.
- Commit/push: Bloqueados; exigem role/gate de Release separados após implementação e validação.
