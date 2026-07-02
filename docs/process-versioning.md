# Versionamento

O design system usa [Semantic Versioning](https://semver.org/lang/pt-BR/). Atualmente está em **fase beta de 1.0** — todas as releases são `1.0.0-beta.N` até o lançamento oficial decidido pelo design owner.

## Política de versionamento — fase beta (atual)

Cada release **incrementa N** em `1.0.0-beta.N`. Não há "minor" ou "patch" durante o beta — todo release é igualmente um snapshot do estado do sistema:

```
v0.8.0  ←  último release pré-beta (histórico)
v1.0.0-beta.1  ←  primeiro release beta (consolida pós-0.8.0)
v1.0.0-beta.2
v1.0.0-beta.3
...
v1.0.0-rc.1   ←  release candidate (decisão do owner)
v1.0.0        ←  oficial (decisão do owner)
```

**Não existe release minor/patch separado** durante a fase beta. Cada release incrementa apenas `N`, o CHANGELOG agrupa o trabalho do incremento e a tag git marca o ponto.

### Quando bumpar (trigger)

Bump pra próximo `beta.N` é por **pacote coerente** + fallback de tempo:

#### 1. Mudança considerável (preferencial)
Bumpa quando ocorre **uma das seguintes** desde o último beta, ainda que isolada:
- Novo ADR aceito que muda arquitetura ou contrato
- Renomeação de namespace/token público (breaking)
- Novo componente shipado (não em rascunho)
- Eliminação ou consolidação de camada de tokens
- Mudança de fonte de verdade
- Migração estrutural relevante (ex: alinhamento Figma de N componentes)

#### 2. Feature completa
Bumpa quando um conjunto de mudanças **fecha** uma feature — não em pedaços. Exemplo: adicionar Theming requer foundation + semantic + componentes adaptados + docs.

#### 3. Cadência temporal (fallback)
Se há acúmulo de patches sem trigger arquitetural ou feature, faça um bump **semanal** consolidando o que houve. Evita `[Não publicado]` virar dump infinito e mantém o beta versionado em ciclos previsíveis.

### Quando NÃO bumpar

- Trabalho em andamento (não shipado).
- Cleanup parcial, ajustes de WIP.
- Cada commit isolado de uma sessão.
- Documentação interna (CLAUDE.md, scripts internos).
- Regeneração automática por CI.
- Refactor de scripts sem impacto observável.

## Política pós-1.0 (futuro)

Quando o owner decidir que está pronto, drop do beta tag → `1.0.0` oficial. A partir daí, **semver normal**:

| Tipo | Exemplo | Quando |
|---|---|---|
| **Patch** | 1.0.1 | Correção pontual, ajuste interno sem impacto visível. |
| **Minor** | 1.1.0 | Adição compatível (novo componente, nova foundation, novo token). |
| **Major** | 2.0.0 | Breaking change (renomeação ou remoção de token/classe/API). |

## Critérios de maturidade pra dropping do beta (guia, não gate)

1.0 oficial é **decisão do design owner**, não gate técnico. Esta lista funciona como guia de maturidade — não bloqueia release, mas marca prontidão técnica:

### Arquitetura ✅ satisfeitos em 1.0.0-beta.1
- [x] 0 erros em `verify:tokens`
- [x] 0 leaks Foundation em `css/components/*.css`
- [x] 0 leaks Foundation em `css/base/*.css`
- [x] Componentes auditados Figma vs CSS (alinhamento 1:1)
- [x] 100% Text Style coverage em textos non-Material de components Figma
- [x] Descriptions designer-focused nos component sets Figma

### Pendente pra futuras betas
- [x] **Form Field** definido — CSS-only por ADR-017, fora de escopo como componente Figma dedicado até surgir demanda real de composição.
- [ ] **`docs/brand-principles.md`** preenchido com conteúdo real
- [x] **Snapshot exporter + gates locais Figma↔JSON/Figma structure** — `verify:tokens`, `verify:figma-structure` e `audit:component-tokens` rodam contra snapshot do plugin.
- [ ] **ADRs históricos** atualizados com notas de evolução — _parcial em beta.1: 006/013/014 atualizados_
- [x] **`docs/process-figma-sync.md`** atualizado pra naming atual e fluxo do snapshot exporter.
- [x] **`tokens/registry.json`** sem warnings (entries com metadados completos).
- [x] **Visual regression tests** (Playwright + screenshot diff) — disponível localmente; CI depende de estabilizar fontes/capturas.
- [x] **A11y tests** (axe-core) — rodam em `npm test` contra docs em light/dark com baseline incremental.
- [ ] **Sync Figma→JSON automatizado** em CI — _depende de Enterprise/plugin_

## Cadeia única de versão

Quatro lugares exibem a versão e **precisam bater**:

- `package.json` (campo `version`).
- `CHANGELOG.md` (última entrada não rotulada como `[Não publicado]`).
- Badge no topo de `index.html` (injetada pelo build).
- Tag git (`git tag -a v1.0.0-beta.N`).

Se os quatro baterem, a documentação está em dia. Se divergirem, algo no pipeline está quebrado.

## CHANGELOG — uma entrada por release

`[Não publicado]` é staging. Todas as mudanças desde a última release vão pra lá, **agrupadas por tema** (Adicionado / Mudado / Corrigido / Removido). Quando bumpa, a seção inteira vira `[1.0.0-beta.N] — AAAA-MM-DD` e nasce um novo `[Não publicado]` vazio.

Más práticas a evitar:
- ❌ Subseções fragmentadas pra cada ajuste do dia.
- ❌ Bump de versão pra cada commit.
- ❌ "Mudanças não publicadas" tendo 10 datas diferentes — sinal de que faltou release.

Boa prática:
- ✅ Uma entrada por release, agrupada em **Adicionado / Mudado / Corrigido / Removido**.
- ✅ Cada item tem 1-2 linhas explicando **por quê**.

## Fluxo de bump

1. Confirmar que `CHANGELOG.md` tem `[Não publicado]` consolidada (não fragmentada).
2. Renomear `[Não publicado]` para `[1.0.0-beta.N] — AAAA-MM-DD`.
3. Adicionar nova seção vazia `[Não publicado]` no topo.
4. Ajustar `package.json` com a versão nova.
5. Atualizar badge em `index.html` (`<!-- VERSION:1.0.0-beta.N -->`).
6. Rodar `npm run build:all` — regenerar artefatos derivados.
7. Commit: `chore(release): 1.0.0-beta.N`.
8. Criar tag: `git tag -a v1.0.0-beta.N -m "Release 1.0.0-beta.N"`.
9. Push com tag: `git push origin main v1.0.0-beta.N`.
10. CI regenera CSS/changelog HTML/APIs/llms.txt e publica no GitHub Pages.

## O que não conta como versionável

- Mudanças em `CLAUDE.md` (documentação interna para agentes).
- Mudanças em `scripts/archive/`.
- Workflows CI sem impacto no deploy.
- Atualizações de `.gitignore`, configs locais.

Esses podem ir em commits `docs:`, `chore:`, `ci:` sem bump.

## Histórico — versionamento pré-beta (0.x)

Antes da fase beta, o sistema usava 0.x.y com bumps minor/patch. Tags `v0.5.0..v0.8.0` permanecem válidas. CHANGELOG preserva todas as entradas históricas. A partir de `v1.0.0-beta.1`, o esquema beta substitui o 0.x.

A transição não envolve rewrite de história — o 0.8.0 simplesmente foi o último 0.x antes de entrar em beta.
