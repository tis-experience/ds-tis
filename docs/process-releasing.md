# Releases

Passo a passo de uma release do design system. Pressupõe uma branch de release
com o trabalho concluído e revisado; `main` recebe a mudança por pull request.

## Antes de começar

- [ ] Todas as mudanças da release estão em commits pequenos, legíveis, com mensagens em português.
- [ ] Um snapshot Figma com menos de 24 horas foi validado por `npm run release:figma-evidence` e a atestação gerada está no diff.
- [ ] `npm run build:tokens`, `npm run sync:docs`, `npm run verify:tokens`, `npm run verify:release-evidence` e `npm run test:app-ready` rodam sem erro.
- [ ] `CHANGELOG.md` tem entradas em `[Não publicado]` cobrindo tudo que mudou desde a última versão.

## Passo a passo

1. **Definir a versão nova**. Consultar [regras de versionamento](./process-versioning.md). Durante beta, usar sempre o próximo `1.0.0-beta.N`; não criar minor/patch separado.

2. **Atualizar `CHANGELOG.md`**:
   - Renomear `[Não publicado]` para `[1.0.0-beta.N] — AAAA-MM-DD` durante beta.
   - Adicionar nova seção `[Não publicado]` vazia no topo.
   - Atualizar links de comparação no rodapé do arquivo.

3. **Atualizar `package.json`**: alterar o campo `version` para `1.0.0-beta.N` durante beta.

4. **Gerar a evidência Figma da versão** depois de instalar um snapshot vivo:

   ```bash
   npm run release:figma-evidence
   npm run verify:release-evidence
   ```

   O snapshot continua gitignored. O arquivo commitado
   `docs/api/release-figma-evidence.json` registra somente metadados seguros,
   resultados dos gates e SHA-256 do snapshot e dos tokens. Se a versão ou
   qualquer JSON de token mudar depois da validação, o CI falha.

5. **Commit de release**:

   ```bash
   git add CHANGELOG.md package.json package-lock.json docs/
   git commit -m "chore(release): 1.0.0-beta.N"
   ```

6. **Push da branch e abertura do pull request**:

   ```bash
   git push -u origin <branch-de-release>
   gh pr create --base main
   ```

7. **Aguardar o CI do pull request e fazer merge** somente com os checks verdes.
   Depois, aguardar também Test, Verify tokens, Build and Deploy e Pages no
   commit resultante em `main`. Só criar a tag quando todos estiverem verdes.

8. **Criar e enviar a tag** no commit já validado:

   ```bash
   git tag -a v1.0.0-beta.N -m "Release 1.0.0-beta.N"
   git push origin v1.0.0-beta.N
   ```

9. **CI valida e publica o site**:
   - `.github/workflows/deploy.yml` roda `npm run build:all`.
   - Valida que o CSS gerado commitado bate com `build:tokens`; o workflow é read-only e não corrige nem auto-commita arquivos.
   - Constrói `_site/` somente com `index.html`, `css/`, `docs/` e `js/`, audita links locais e ausência de arquivos privados.
   - Publica o artefato com `configure-pages`, `upload-pages-artifact` e `deploy-pages`; o Pages não usa mais o builder legado.
   - Todos os derivados de `css/tokens/generated/` e `docs/` devem ser regenerados, revisados e incluídos no commit de release antes da tag.
   - Publica o site estático no ambiente definido pelo projeto.

10. **Publicar no npm** depois que o commit de `main` estiver verde:

   ```bash
   npm publish --access public --tag beta
   npm dist-tag add ds-tis@1.0.0-beta.N latest --auth-type=web
   ```

11. **Verificar**:
   - A página inicial mostra a badge `1.0.0-beta.N`.
   - `docs/changelog.html` lista `1.0.0-beta.N` como versão mais recente.
   - `docs/api/tokens-sync.json` tem timestamp recente e zero erros.
   - `docs/api/release-figma-evidence.json` corresponde à versão e ao digest atual dos tokens.
   - `npm view ds-tis@beta version` e `npm view ds-tis@latest version` retornam `1.0.0-beta.N`.
   - Uma instalação limpa com `npm install ds-tis` passa no consumer smoke.

## Se algo der errado

- **CI falhar antes da tag**: conferir logs no GitHub Actions, corrigir na branch,
  criar novo commit e novo push. Não fazer merge/tag enquanto o commit não estiver verde.
- **Falha descoberta depois da tag**: não mover a tag silenciosamente. Desfazer
  release é operação delicada; preferir a próxima `1.0.0-beta.N` com a correção.
- **Publicação no registry falhar**: não mover a tag. Corrigir a causa; se o
  pacote continuar indisponível, restaurar temporariamente a instalação via GitHub
  na documentação pública em um PR de hotfix.

## Publicação no npm

Betas são publicadas com `npm publish --access public --tag beta` e a mesma versão
é promovida para a dist-tag `latest`. Assim, `npm install ds-tis` e
`npm install ds-tis@beta` resolvem a beta corrente; consumidores de produção
devem fixar a versão exata. Quando houver versão estável, `latest` passa a apontar
para ela e `beta` continua sendo o canal de pré-release.
