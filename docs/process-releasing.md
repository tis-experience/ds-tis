# Releases

Processo canônico para publicar uma versão do Design System TIS. Toda release
parte de branch própria, entra em `main` por pull request e só recebe tag depois
que o commit mesclado estiver verde.

## Antes de começar

- [ ] Classificação SemVer e publicação aprovadas pelo owner.
- [ ] `[Não publicado]` cobre todas as mudanças desde a versão anterior.
- [ ] Snapshot Figma com menos de 24 horas disponível.
- [ ] Working tree limpo e branch criada a partir de `main` atualizada.

## Passo a passo

1. **Atualizar a cadeia de versão**:
   - transformar `[Não publicado]` em `[X.Y.Z] — AAAA-MM-DD` e criar nova seção vazia;
   - atualizar os links de comparação do CHANGELOG;
   - atualizar `package.json`, `package-lock.json` e a badge `VERSION` de `index.html`.

2. **Gerar a evidência Figma da versão**:

   ```bash
   npm run release:figma-evidence
   npm run verify:release-evidence
   ```

   `.figma-snapshot.json` continua gitignored. O commit recebe apenas
   `docs/api/release-figma-evidence.json`, com metadados seguros, resultados dos
   gates e SHA-256 do snapshot e dos tokens. O CI falha se versão ou tokens
   mudarem depois da atestação.

3. **Regenerar e validar tudo**:

   ```bash
   npm run build:all
   npm run test:app-ready -- --release
   npm run pack:check
   npm run security:check
   ```

4. **Revisar o diff**, criar `chore(release): X.Y.Z`, enviar a branch e abrir um
   pull request pronto para merge.

5. **Mesclar somente com CI verde.** Aguardar no PR: Verify tokens, Test Node
   22/24 e Build and Deploy. Depois do merge, aguardar os mesmos checks e o
   deploy Pages no SHA resultante de `main`.

6. **Criar e enviar a tag anotada** no commit validado:

   ```bash
   git tag -a vX.Y.Z -m "Release X.Y.Z"
   git push origin vX.Y.Z
   ```

7. **Publicar no npm**:

   Versão estável:

   ```bash
   npm publish --access public --tag latest --auth-type=web
   ```

   Pré-release:

   ```bash
   npm publish --access public --tag beta --auth-type=web
   ```

   Nunca apontar `latest` para uma pré-release enquanto houver versão estável.

8. **Criar o GitHub Release** a partir da tag, com notas derivadas do CHANGELOG.
   Marcar como prerelease somente versões com sufixo (`-beta.N`, `-rc.N`).

9. **Sincronizar a capa do Figma** com `vX.Y.Z` e validar visualmente o frame da
   capa. Mudança somente de texto da versão não exige novo snapshot de tokens.

10. **Verificar produção**:
    - `npm view ds-tis@latest version` retorna a versão estável publicada;
    - `npm install ds-tis` funciona em projeto limpo;
    - o tarball expõe CSS, runtimes, theme, templates e metadados;
    - GitHub Release e tag apontam para o mesmo SHA;
    - Pages mostra a versão correta e responde sem arquivos privados;
    - `docs/api/release-figma-evidence.json` corresponde ao pacote;
    - Figma mostra a mesma versão na capa;
    - não há PR, issue, check ou anotação bloqueante pendente.

## Se algo der errado

- **Antes da tag:** corrigir na branch, repetir todos os gates e esperar novo CI.
- **Depois da tag, antes do npm:** não mover a tag silenciosamente; se o SHA
  estiver incorreto, publicar uma nova versão.
- **Depois do npm:** versões do registry são imutáveis. Corrigir por patch ou
  nova pré-release; deprecar uma versão problemática somente com justificativa.
- **Pages falhar:** o último deploy válido permanece no ar. Corrigir em PR e não
  declarar a release concluída até o workflow verde.

## Dist-tags npm

- `latest`: versão estável recomendada para consumidores.
- `beta`: pré-release opt-in; pode permanecer na última beta publicada até haver
  nova pré-release.
- produção deve usar `latest` ou pin exato; `beta` nunca é promovida
  automaticamente.
