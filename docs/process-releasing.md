# Releases

Passo a passo de uma release do design system. Pressupõe que você está na branch `main` com o trabalho da release concluído e revisado.

## Antes de começar

- [ ] Todas as mudanças da release estão em commits pequenos, legíveis, com mensagens em português.
- [ ] `npm run build:tokens`, `npm run sync:docs` e `npm run verify:tokens` rodam sem erro.
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

5. **Tag**:

   ```bash
   git tag -a v1.0.0-beta.N -m "Release 1.0.0-beta.N"
   ```

6. **Push**:

   ```bash
   git push origin main
   git push origin v1.0.0-beta.N
   ```

7. **CI faz o resto**:
   - `.github/workflows/deploy.yml` roda `npm run build:all`.
   - Regenera `css/tokens/generated/*.css`, `docs/adr-index.md`, `docs/token-schema.md`, `docs/component-inventory.md`, `docs/changelog.html`, APIs JSON, `llms.txt`.
   - Auto-commita os derivados com `[skip ci]`.
   - Publica o site estático no ambiente definido pelo projeto.

8. **Verificar**:
   - A página inicial mostra a badge `1.0.0-beta.N`.
   - `docs/changelog.html` lista `1.0.0-beta.N` como versão mais recente.
   - `docs/api/tokens-sync.json` tem timestamp recente e zero erros.

## Se algo der errado

- **CI falhar no build**: conferir logs no GitHub Actions. Se for falha de token ou referência quebrada, corrigir na branch, novo commit, novo push — sem precisar mexer na tag.
- **Precisar desfazer**: tags só removem com `git push origin :refs/tags/vx.y.z`. Desfazer release é operação delicada; prefira publicar um `x.y.z+1` com correção.

## Publicação no npm

Ainda não fazemos. Pacote está no backlog para ser publicado quando a decisão for tomada. Ver [backlog](./backlog.md).
