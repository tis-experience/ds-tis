# Repo Implementation Report

- Status: Implementação corretiva concluída — aguardando aprovação do owner
- Componente/padrão: fundação documental vNext + piloto source-backed de Button
- Run: `docs/agents/runs/2026-07-29-vnext-accordion`
- Agent: Repo Component Agent (Codex)
- Data: 2026-07-30

## Entrada

- Figma aprovado: sim; gate `figma-audit` aprovado pelo owner.
- Token sync: aprovado como não aplicável; nenhuma variable/token foi alterada.
- Plano repo: `05-repo-sync-plan.md`.
- Fonte visual: componentes e contratos já refletidos em HTML, CSS, JS e JSON no
  repositório; o layout do portal não tenta reproduzir uma página Figma.

## Implementação

- O portal preserva o `PageTitle` nativo do Starlight. `SiteTitle.astro` limita-se
  à marca no header, sem transformar metadados internos em decoração.
- `ComponentPageLayout.astro` + `ComponentPanel.astro` entregam quatro visões
  server-rendered: Design, Uso, Implementação/Disponibilidade e Acessibilidade.
  Tabs, setas, Home/End, hash, deep link, índice contextual e regiões roláveis
  focáveis fazem parte do contrato.
- `ComponentGuidance.astro` + `component-source.mjs` leem
  `docs/api/components.json` e landmarks explícitos de `docs/button.html`,
  preservam idioma/ordem, removem markup e atributos inseguros, tornam demos
  legadas inertes, reescrevem links seguros para `/docs/` e bloqueiam traversal.
- As quatro rotas Button (PT-BR/EN × Web/React) usam a mesma fonte compartilhada.
  Web documenta instalação, import e markup estáveis; React publica a receita
  beta do registry somente para componentes com implementação validada e não
  anuncia um pacote `@tis/react` inexistente.
- O portal importa apenas o CSS público do componente da página. Ark/Zag
  permanece a referência do provider principal da vNext; a integração React
  beta usa Base UI e distribuição shadcn na exceção específica permitida pela
  ADR-021, sem Tailwind e sem export público de `@tis/react`.
- O Storybook é uma superfície separada, sem iframe ou embed no portal. O
  rebuild parcial do Astro preserva o catálogo já construído.
- A rota raiz, canonical, favicon e 404 PT-BR/EN respeitam o base path público
  `/ds-tis/next/`.
- Nenhum CSS, token, component set ou arquivo Figma do DS original foi alterado.

## Loop de auditoria

O primeiro baseline encontrou problemas reais de IA, responsividade, semântica,
conteúdo por stack e integração. As iterações corrigiram:

- overflow global em 320px e scroll local sem foco;
- tema divergente no iframe Storybook;
- fonte não determinística e título da marca truncado;
- painel React serializado como texto e evidências React indevidas;
- ícones vazios, links relacionados incorretos e rótulos ambíguos;
- vazamento PT/EN e estrutura acessível de recursos;
- redirect fora do base path, favicon ausente e alternates 404 quebrados;
- possível traversal `../` no adaptador de links editoriais.

## Extensão aprovada — registry React beta

- Registry público versionado em `/registry/v1`, com namespace `@tis` e
  manifesto machine-readable.
- Nove componentes React validados: Accordion, Button, Checkbox, Form Field,
  Input Text, Modal, Radio, Textarea e Toggle.
- `consumer-context.json` e `components.json` avançam para schema v2 e publicam
  disponibilidade explícita por tecnologia, sem inventar implementações para os
  17 componentes ainda ausentes em React.
- O consumer permanente extrai o tarball gerado por `npm pack`, instala os nove
  sources pela CLI shadcn e executa Vite, browser, interação e Axe.
- O builder do registry restringe qualquer limpeza recursiva a `_site/registry`
  ou a um descendente de `/tmp`.

A rodada rejeitada pelo owner foi invalidada. A implementação corretiva removeu
os padrões visuais artificiais, reenquadrou os componentes contra as referências
v1 e passou por nova auditoria independente; os resultados atuais estão
registrados na seção de evidência abaixo.

## Evidência final

- Astro: 15 páginas geradas; 16 HTML no artefato incluindo o redirect raiz.
- Crawl independente: 303 âncoras, 371 destinos internos e 0 links quebrados.
- Axe completo: 11 estados, incluindo os dois 404, com 0 violações.
- Responsividade: 320px e 390px sem overflow global; tabelas/código usam scroll
  local focável quando necessário.
- Ark/Zag gzip incremental (provider, não bundle público final):
  - Accordion: 10,24 KiB / orçamento 12 KiB;
  - Dialog: 17,59 KiB / orçamento 20 KiB;
  - combinado: 21,61 KiB / orçamento 25 KiB.
- Preview integrado, incluindo wrapper, Lucide, tokens e CSS:
  - Accordion: 21,29 KiB / orçamento 24 KiB;
  - Dialog: 29,64 KiB / orçamento 32 KiB;
  - combinado: 34,72 KiB / orçamento 38 KiB.
- Storybook v1: 26/26 componentes, 92 stories contratuais, 120 propriedades e
  8 runtimes; browser auditou 93 stories.
- `verify:tokens`: 0 erros e 1 warning conhecido de snapshot Figma antigo;
  `VALUE_DRIFT=0`.
- `git diff --check`: passou.

## Gates executados

- `npm run build:all`
- `npm run build:preview:vnext`
- `npm run test:vnext`
- `npm run test:vnext:browser`
- `npm run test:storybook`
- `node scripts/test-pages-artifact.mjs`
- `npm run agents:validate-run -- docs/agents/runs/2026-07-29-vnext-accordion`

## Pendências deliberadas

- O gate `repo` permanece `in_progress` até a inspeção e aprovação do owner.
- O package `@tis/react` continua fechado. A API React pública atual é o source
  distribuído pelo registry, enquanto o spike Ark/Zag permanece comparativo.
- O adaptador HTML é uma ponte de migração; uma API editorial estruturada pode
  substituí-lo sem mudar os consumidores MDX.
- Snapshot Figma antigo bloqueia bump/release do pacote, mas não o PR nem a
  publicação do registry beta em Pages, pois não houve mudança de tokens/Figma.

## Bloqueado antes de

- Release: sim; exige gate Repo aprovado, snapshot/release evidence fresco e
  Release Agent.
- Commit/push/PR: não autorizados nesta etapa.
