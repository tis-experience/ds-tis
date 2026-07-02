# Backlog

Itens fora do escopo imediato mas que devem ser implementados. Organizados por prioridade.

## Alta prioridade

### Automatizar o sync Figma → JSON em CI

Em 0.5.10 implementamos a opção **(b) adaptar pra MCP** (ver `docs/process-figma-sync.md`): o agente Claude Code dumpa as Variables em `.figma-snapshot.json` via `use_figma` em chunks, e `scripts/sync-tokens-from-figma.mjs` compara/aplica divergências. Funciona, mas exige sessão interativa — não roda em GitHub Actions.

Pra automatizar de verdade (disparo por webhook ou agendamento), há alguns caminhos:

**(a) Plugin Figma custom** — rodaria dentro do Figma via Plugin API (que não é plano-gated). Botão "Publicar variables" que serializa em DTCG e faz POST/commit pra GitHub (usando GitHub App ou OAuth). Custo: 1–2 semanas de dev + manutenção própria.

**(b) Tokens Studio for Figma (plugin de terceiros)** — plugin com free tier, que faz Figma → JSON + push pra Git via OAuth. Migrar as Variables nativas atuais pra dentro do Tokens Studio exige reconfiguração. Ajusta `build-tokens.mjs` pro formato que ele exporta. Custo: 2–3 dias + designer precisa aprender o plugin.

**(c) Upgrade para plano Enterprise** — destrava a REST API direta (`GET /v1/files/:key/variables/local`), possibilitando o script original revertido em 0.5.9. Decisão de negócio (≈ US$ 75/editor/mês).

Enquanto o disparo manual não virar gargalo, fica como está. Revisitar quando frequência de sync aumentar ou quando o volume de divergências manuais crescer.

### Preencher `docs/brand-principles.md`

Template existe, conteúdo real ainda não foi definido. Passa por: missão, 3 princípios de design, tom de voz, identidade visual, logo.

### Reduzir documentação textual do Figma

Decisão tomada em 21/04/2026 junto com a revisão da ADR-003: reduzir as páginas textuais do Figma (Introdução, Theming, Accessibility, Changelog) e concentrar a documentação de desenvolvimento no GitHub. Tarefa manual, Figma:

- Esvaziar conteúdo narrativo das páginas textuais mencionadas.
- Manter uma referência curta em cada ("Ver documentação completa: docs/...").
- Eventualmente consolidar tudo na Capa.
- Component Status pode ficar como está (é informação visual útil no contexto Figma).

## Média prioridade

### Comparação avançada Figma ↔ JSON no `scripts/tokens-verify.mjs`

A partir de 0.5.8, o script classifica divergências em `NEEDS_SYNC`, `DRIFT_FROM_SOURCE` e `VALUE_DRIFT`. Próxima iteração: resolução completa de aliases Figma e normalização de formato (hex vs rgba). Depois do FIGMA_PAT ficar configurado como secret do CI.

### Futuro do site de documentação

Avaliar opções quando a manutenção manual do site virar gargalo:

- **Astro**: permite manter HTML + MDX, adiciona autor-experience sem mudar a filosofia atual.
- **Zeroheight**: CMS especializado em design system, integração forte com Figma, custo recorrente.
- **Supernova**: similar ao Zeroheight, com sync bidirecional Figma ↔ doc.
- **Manter custom**: evoluir o `sync-docs.mjs` com editor WYSIWYG interno.

Decisão aguarda: volume de contribuição, necessidade de editores não-técnicos, orçamento. Por ora, o fluxo MD → HTML via `marked` no `sync-docs.mjs` atende.

### Sincronização automática de tokens (webhook ou agendado)

A Fase 7 implementou sync manual via `workflow_dispatch`. Evoluir pra:

- Webhook do Figma disparando o workflow quando Variables são modificadas.
- Ou agendamento diário (cron) pra detectar mudanças e abrir PR.

Só se o disparo manual virar gargalo.

### Sincronização de textos Figma ↔ site

A Fase 7 original previa. Substituída pela decisão de reduzir doc textual do Figma (item acima). Se no futuro houver demanda real de ter textos idênticos em ambos os lados, reavaliar.

## Baixa prioridade

### Form Field como Component dedicado no Figma

Hoje (Pattern A): cada controle Figma — Input Text, Select, Textarea, Checkbox, Radio — encapsula label/helper/error/required internamente. Form Field existe no CSS (`.ds-field*`) e na doc (`docs/form-field.html`) como wrapper standalone, mas não há Component Figma dedicado — criar um seria duplicar o que cada controle já tem.

Avaliar mudança pra Pattern B (Carbon/Polaris/Atlassian): extrair label/helper/error dos controles Figma, criar Component Form Field standalone com slot pra qualquer controle, recompor cada doc afetada. Custo: refactor profundo nos controles Figma impactados, repensar bindings de Text Style e atualizar a documentação relacionada. Benefício: source of truth do wrapping pattern em um lugar só, alinhamento com DS de referência.

Trigger pra revisitar: pedido explícito de consumidor que precise compor controles custom (ex: combobox, color-picker) usando o wrapping nativo, ou observação de drift em a11y patterns entre Input/Select/Textarea.

### Storybook

Componente inventory marca como pendente. Hoje o site cumpre o papel de vitrine interativa. Só implementar se houver demanda explícita de time Dev consumidor. Integração com os tokens DTCG já gerados (formato padrão de import), sem reinventar.

### MCP próprio do design system

Expõe tokens, componentes e guidelines via MCP para agentes. `llms.txt` + APIs JSON cobrem a maior parte dos casos. Implementar só se aparecer um caso onde MCP próprio faz diferença real.

### Publicação no npm

Pacote nunca foi publicado. Decidir quando (e com qual nome de escopo) fazer o primeiro publish. Antes de publicar, validar que `files` no `package.json` cobre o que deve ser distribuído.

### Revisão das páginas do Figma em estado de teste

Você mencionou que páginas vazias (Icons, Grids, Images, Templates) e resíduos nas páginas de componente (SECTION e `image 1` em Input Text, INSTANCE soltas em Button, `Frame 1` em Textarea) estão em uso para experimentos. Quando terminar os testes, decidir se preenche ou remove.

### Resolução de conflitos inteligente no `sync-tokens-from-figma`

Hoje o script loga e pede intervenção quando encontra ambiguidade (ex: variável renomeada no Figma vs variável nova; alias quebrado). Evoluir pra sugerir ação com heurística (ex: "detectei que `color/primary/toned` pode ter virado `brand/toned/default` com base em similaridade de valor; aplicar?").
