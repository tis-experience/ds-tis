# Releases

Passo a passo de uma release do design system. Pressupõe uma branch de release
com o trabalho concluído e revisado; `main` recebe a mudança por pull request.

## Antes de começar

- [ ] Todas as mudanças da release estão em commits pequenos, legíveis, com mensagens em português.
- [ ] `npm run build:tokens`, `npm run sync:docs`, `npm run verify:tokens` e `npm run test:app-ready` rodam sem erro.
- [ ] `CHANGELOG.md` tem entradas em `[Não publicado]` cobrindo tudo que mudou desde a última versão.

## Passo a passo

1. **Definir a versão nova**. Consultar [regras de versionamento](./process-versioning.md). Durante beta, usar sempre o próximo `1.0.0-beta.N`; não criar minor/patch separado.

2. **Atualizar `CHANGELOG.md`**:
   - Renomear `[Não publicado]` para `[1.0.0-beta.N] — AAAA-MM-DD` durante beta.
   - Adicionar nova seção `[Não publicado]` vazia no topo.
   - Atualizar links de comparação no rodapé do arquivo.

3. **Atualizar `package.json`**: alterar o campo `version` para `1.0.0-beta.N` durante beta.

4. **Commit de release**:

   ```bash
   git add CHANGELOG.md package.json package-lock.json docs/
   git commit -m "chore(release): 1.0.0-beta.N"
   ```

5. **Push da branch e abertura do pull request**:

   ```bash
   git push -u origin <branch-de-release>
   gh pr create --base main
   ```

6. **Aguardar o CI do pull request e fazer merge** somente com os checks verdes.
   Depois, aguardar também Test, Verify tokens, Build and Deploy e Pages no
   commit resultante em `main`. Só criar a tag quando todos estiverem verdes.

7. **Criar e enviar a tag** no commit já validado:

   ```bash
   git tag -a v1.0.0-beta.N -m "Release 1.0.0-beta.N"
   git push origin v1.0.0-beta.N
   ```

8. **CI valida e publica o site**:
   - `.github/workflows/deploy.yml` roda `npm run build:all`.
   - Valida que o CSS gerado commitado bate com `build:tokens`; o workflow é read-only e não corrige nem auto-commita arquivos.
   - Todos os derivados de `css/tokens/generated/` e `docs/` devem ser regenerados, revisados e incluídos no commit de release antes da tag.
   - Publica o site estático no ambiente definido pelo projeto.

9. **Verificar**:
   - A página inicial mostra a badge `1.0.0-beta.N`.
   - `docs/changelog.html` lista `1.0.0-beta.N` como versão mais recente.
   - `docs/api/tokens-sync.json` tem timestamp recente e zero erros.

## Se algo der errado

- **CI falhar antes da tag**: conferir logs no GitHub Actions, corrigir na branch,
  criar novo commit e novo push. Não fazer merge/tag enquanto o commit não estiver verde.
- **Falha descoberta depois da tag**: não mover a tag silenciosamente. Desfazer
  release é operação delicada; preferir a próxima `1.0.0-beta.N` com a correção.

## Publicação no npm

Ainda não fazemos. Consumidores instalam via GitHub (`npm install github:tis-experience/ds-tis`) — documentado no README e em `docs/agent-consumer-usage.md`. O pacote entra no backlog para o primeiro publish no registry quando a decisão for tomada. Ver [backlog](./backlog.md).

Antes do publish:

1. Confirmar `npm run pack:check` e `npm run build:all` limpos.
2. Trocar a instalação documentada (README, agent-consumer-usage, llms) de GitHub → `npm install ds-tis`.
3. Atualizar este arquivo e o backlog removendo o “ainda não”.
