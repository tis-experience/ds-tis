# Backlog

Itens fora do escopo imediato mas que devem ser implementados. Organizados por prioridade.

## Alta prioridade

### Automatizar o sync Figma → JSON em CI

**Status (2026-07-12):** automação via REST API (`GET /v1/files/:key/variables/local`) **fora de escopo** — exige plano Enterprise, que não será adotado. O fluxo canônico permanece **manual via plugin** + `npm run figma:snapshot:refresh` (ver `docs/process-figma-sync.md`).

Caminhos alternativos se o disparo manual virar gargalo:

**(a) Plugin Figma custom** — botão "Publicar variables" que serializa DTCG e abre PR no GitHub (Plugin API não é plano-gated). Custo: 1–2 semanas + manutenção.

**(b) Tokens Studio for Figma** — export Figma → JSON + push Git via OAuth. Exige migrar Variables nativas. Custo: 2–3 dias + curva do plugin.

**(c) ~~Upgrade Enterprise~~** — descartado por decisão de produto/custo.

Enquanto o volume de sync manual for baixo, manter plugin + refresh local. Revisitar **(a)** se divergências manuais crescerem.

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

Pacote nunca foi publicado no registry. Consumo oficial hoje: `npm install github:tis-experience/ds-tis` (README + guia de agents consumidores alinhados). Decidir quando (e com qual nome de escopo) fazer o primeiro publish. Antes: `npm run pack:check`, validar `files`/`exports`, e reescrever docs de instalação para `npm install ds-tis`.

### Resolução de conflitos inteligente no `sync-tokens-from-figma`

Hoje o script loga e pede intervenção quando encontra ambiguidade (ex: variável renomeada no Figma vs variável nova; alias quebrado). Evoluir pra sugerir ação com heurística (ex: "detectei que `color/primary/toned` pode ter virado `brand/toned/default` com base em similaridade de valor; aplicar?").
