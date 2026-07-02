# ADR-003: Figma como origem canônica de tokens, Git como consolidação

**Data:** 2026-04-14 (original) · 2026-04-21 (revisada)
**Status:** Aceita — Revisada em 0.5.8

## Contexto

A versão original deste ADR (abril/2026) declarava Git como fonte de verdade para tokens (JSON) e Figma como consumidor. A direção implementada seguia essa convenção: editar JSON → `build-tokens.mjs` gera CSS → Figma era atualizado manualmente.

Revisitando esta decisão em 21/04/2026 com o time, ficou claro que a direção correta do fluxo é o oposto: **as decisões de design nascem no Figma**, onde o designer explora, testa, valida e fecha valores de cor, spacing, tipografia. Essas decisões precisam virar código e documentação, não o contrário. Forçar o desenvolvedor a editar JSON e depois "sincronizar" o Figma quebra a cadeia natural designer → dev e distancia a fonte real (decisões humanas em uma ferramenta visual) da representação técnica.

Esta revisão alinha a ADR à realidade desejada: **Figma Variables são a autoridade** para valores de token. JSON em `tokens/` é uma **consolidação** — um contrato em formato transportável (DTCG) que vira código, documentação e futuramente Storybook.

## Decisão

### Fontes de verdade

- **Figma Variables**: fonte canônica de todos os valores de token (cor, spacing, tipografia, radius, shadow, stroke, opacity, motion, z-index). Arquivo `IE68amP9Hya5ieFw1rX8S8`.
- **Figma (frames e componentes)**: fonte canônica do design visual (auto-layout, variantes, properties, anatomy).
- **Git (`tokens/**/*.json`)**: consolidação derivada do Figma em formato DTCG. Versionado, transportável entre plataformas.
- **Git (`css/`, `docs/`, ADRs, código)**: fonte canônica do código e da documentação textual. Inclui `CHANGELOG.md`, `CONTRIBUTING.md`, ADRs, schemas.

### Fluxo explícito

```
Figma Variables (autoridade de valor)
       │
       │ npm run sync:tokens-from-figma (manual, abre PR)
       ▼
tokens/**/*.json (DTCG, consolidação em Git)
       │
       │ npm run build:tokens (automático no CI)
       ▼
css/tokens/generated/*.css
       │
       │ @import em design-system.css
       ▼
css/components/*.css (consumo nos 18 componentes)
       │
       ▼
site em docs/ + Storybook (futuro)
```

### Regras operacionais

1. Mudanças de token **começam no Figma**. Designer edita a Variable, valida visualmente.
2. Quando o designer decide que o conjunto de mudanças está fechado, alguém roda `npm run sync:tokens-from-figma` (dry-run por padrão, `--write` pra aplicar). Dispara em comando manual — não é automático.
3. O script abre um PR com o diff pros JSONs. Revisão mínima antes do merge (nomes novos, remoções inesperadas, valores discrepantes).
4. Após o merge, `build-tokens.mjs` regenera o CSS. CI publica o site.
5. **Nunca editar `tokens/*.json` à mão** num commit normal. JSONs são derivados. A exceção é em PRs do próprio script de sync, onde a edição é gerada automaticamente e revisada como diff.
6. Mudanças visuais de componente (não de token) continuam acontecendo no Figma normalmente. CSS de componente é atualizado manualmente pra refletir.

### Ferramentas

- **MCP remoto do Figma** (`use_figma`): canal pelo qual o script acessa as Variables. Autenticado via MCP TIS (Pro/Expert).
- **`scripts/sync-tokens-from-figma.mjs`**: o script de sync. Dry-run por padrão.
- **`scripts/tokens-verify.mjs`**: passa a interpretar divergências orientadas — Figma como autoridade.

## Verificação automatizada

`scripts/tokens-verify.mjs` classifica divergências em três categorias:

- **NEEDS_SYNC** (warning): Figma tem uma Variable que o JSON ainda não representa. Rodar `sync:tokens-from-figma` resolve.
- **DRIFT_FROM_SOURCE** (erro): JSON tem um token que não existe no Figma. Indica edição manual do JSON ou Variable deletada no Figma sem sync.
- **VALUE_DRIFT** (erro): mesmo nome, valor diferente. Sincronizar.

O workflow `.github/workflows/verify-tokens.yml` roda em pull requests e push pra main. Em 0.5.8, a interpretação fica em warning em todos os casos (fase de adaptação). Depois de duas semanas estáveis, `DRIFT_FROM_SOURCE` e `VALUE_DRIFT` passam a falhar o CI.

## Consequências

- A "porta de entrada" para mudanças de tokens passa a ser o Figma. Fluxo natural pro designer.
- Desenvolvedores que quiserem sugerir uma mudança de token abrem uma issue ou negociam com design. Não têm permissão de editar o JSON diretamente (convenção, não bloqueio técnico).
- O CI continua rápido e simples: build-tokens depende só do JSON do repo, igual antes. Novo script é invocado manualmente, não bloqueia deploys.
- A versão "oficial" dos tokens é a que está no Git em `tokens/` — o Figma é a autoridade mas o Git é o backup imutável e o ponto de consumo pra todo o resto da cadeia.

## Alternativas consideradas

**Manter Git como source (ADR-003 original, pré-revisão).** Descartada porque separa a decisão (Figma) da representação canônica (JSON), forçando sincronização em ordem não natural.

**Tokens Studio como intermediário no Figma.** Avaliada e descartada pra este momento. Tokens Studio exigiria migrar 462 Variables do formato nativo pra dentro do plugin, ajustar `build-tokens.mjs` pro formato exportado por ele, e requer que designers aprendam UI nova. Sem ganho proporcional ao custo na nossa escala atual. Reavaliar quando houver time de design maior e necessidade explícita das features do Tokens Studio (branches em tokens, temas via plugin, etc.).

**Plugin Figma custom.** Descartada por ROI. Desenvolvimento + manutenção maior que o script via MCP pra o mesmo resultado funcional no cenário atual.

**Bidirecional automático (webhook Figma).** Descartada pra início. Manual garante controle e revisão. Se o fluxo manual virar gargalo, reavaliar.

## Referências

- [ADR-001](./ADR-001-migracao-tokens.md) — Migração de tokens para DTCG + Style Dictionary.
- [ADR-011](./ADR-011-renaming-tokens-semanticos-de-cor.md) — Renaming semântico que consolidou a estrutura atual do JSON.
- `scripts/sync-tokens-from-figma.mjs` — implementação do sync (a partir de 0.5.8).
- `scripts/tokens-verify.mjs` — verificador com interpretação revisada (a partir de 0.5.8).
