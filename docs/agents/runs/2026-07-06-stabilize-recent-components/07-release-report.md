# Release Report — beta.6

**Role:** Release Agent  
**Data:** 2026-07-06

## Veredito

Pacote **justificável** (3 componentes + orquestração agents + ~24 dias desde beta.5), mas **não pronto para tag** sem:

1. Sync overlay `blue-*` → `brand-*` (12 erros `verify:tokens`)
2. `git pull` (2 commits atrás de upstream)
3. Correções de doc P0/P1 nos 3 componentes
4. Fix milestones em `scripts/sync-docs.mjs`

## Gates pré-release (ordem)

```bash
git pull --rebase origin main
# overlay rename manual + registry
npm run sync:tokens-from-figma:write
npm run build:all
npm run verify:tokens          # 0 erros
npm test
# corrigir docs pagination/combobox
# bump package.json → 1.0.0-beta.6
# consolidar CHANGELOG [Não publicado]
```

## Não commitar

- `.figma-snapshot.json` (gitignored)

## Risco se publicar com drift overlay

White-label toned/brand não propaga; CI sem snapshot mascara o problema.
