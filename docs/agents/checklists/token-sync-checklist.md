# Checklist: Token Sync

Use somente depois de Figma aprovado.

## Pre-flight

- [ ] Role declarada: `Token Sync Agent`.
- [ ] Figma aprovado pelo owner.
- [ ] Auditoria Figma sem falhas bloqueantes.
- [ ] Snapshot Figma atualizado quando houve mudanca em variables.
- [ ] Snapshot foi gerado com exporter atualizado quando a auditoria depender de `structureAudit.variableUsage`.
- [ ] Categoria do token confirmada: Figma-canonica ou CSS-only.

## Sync

- [ ] Rodar dry-run `npm run sync:tokens-from-figma`.
- [ ] Classificar divergencias: VALUE_DRIFT, NEW_IN_FIGMA, MISSING_IN_FIGMA, ALIAS_BROKEN, CSS_ONLY, BY_DESIGN.
- [ ] Aplicar `npm run sync:tokens-from-figma:write` somente quando apropriado.
- [ ] Criar/ajustar `tokens/component/*.json` quando houver contrato anatomico.
- [ ] Atualizar `tokens/registry.json`.
- [ ] Rodar `npm run build:tokens`.
- [ ] Rodar `npm run sync:docs`.

## Validacao

- [ ] `npm run verify:tokens`.
- [ ] `npm run verify:figma-structure` quando snapshot estrutural estiver atualizado.
- [ ] `npm run audit:component-tokens` quando criar/remover/renomear Component variables.
- [ ] Se o snapshot estiver desatualizado em relacao ao Figma vivo, nao declarar gate verde; registrar `bloqueado por snapshot desatualizado`.
- [ ] Revisar diff de JSON e CSS gerado.

## Saida

- [ ] Comandos rodados.
- [ ] Divergencias encontradas.
- [ ] Arquivos alterados.
- [ ] Pendencias reais restantes.
