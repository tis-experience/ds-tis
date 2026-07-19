# Checklist: Release

Use somente com autorizacao explicita para commit, PR, push ou publicacao.

## Pre-flight

- [ ] Role declarada: `Release Agent`.
- [ ] Escopo aprovado.
- [ ] Working tree revisado.
- [ ] Mudancas fora do escopo identificadas e preservadas.
- [ ] CHANGELOG atualizado quando a mudanca for significativa.

## Validacao

- [ ] `npm run verify:tokens`.
- [ ] `npm run verify:registry` quando aplicavel.
- [ ] `npm run verify:figma-structure` quando Figma/snapshot estiver no escopo.
- [ ] `npm run release:figma-evidence` com snapshot vivo e `npm run verify:release-evidence` antes de qualquer bump/publicação.
- [ ] `npm test` ou testes relevantes.
- [ ] `npm run test:app-ready` para qualquer release; não usar `--skip-visual` em CI/release.
- [ ] `npm run pack:check` antes de publicar o pacote no registry.
- [ ] CI verificado quando houver PR/push.
- [ ] GitHub Pages usa `build_type=workflow`, deploy verde e artefato público validado por `npm run build:pages`.

## Git/GitHub

- [ ] Diff revisado.
- [ ] Commit convencional em PT-BR.
- [ ] PR criado quando for o fluxo escolhido.
- [ ] Push direto a `main` somente com autorizacao explicita.
- [ ] Sem force push em `main`.

## Saida

- [ ] Comandos rodados.
- [ ] Resultado das validacoes.
- [ ] Commit/PR/push/prod com links ou evidencia.
