# Releases

Step-by-step release process for the design system. Start from a reviewed
release branch with all intended work complete.

## Before starting

- [ ] Release changes are in small, readable commits with Portuguese messages.
- [ ] `npm run build:tokens`, `npm run sync:docs`, `npm run verify:tokens` and `npm run test:app-ready` pass.
- [ ] `[Não publicado]` in `CHANGELOG.md` covers every change since the previous version.

## Step-by-step

1. **Choose the version.** Read the [versioning rules](./process-versioning.md). During beta, always use the next `1.0.0-beta.N`.

2. **Update `CHANGELOG.md`:**
   - rename `[Não publicado]` to `[1.0.0-beta.N] — YYYY-MM-DD`;
   - add a new empty `[Não publicado]` section;
   - update comparison links at the bottom.

3. **Update package metadata:** change `package.json` and `package-lock.json` to `1.0.0-beta.N`.

4. **Create the release commit:**

   ```bash
   git add CHANGELOG.md package.json package-lock.json docs/
   git commit -m "chore(release): 1.0.0-beta.N"
   ```

5. **Push the release branch and open a pull request.** Do not bypass protected `main`.

6. **Wait for pull request CI** and merge only when required checks are green.

7. **Validate `main`.** Test and deployment workflows must pass on the merged release commit.

8. **Create and push the annotated tag:**

   ```bash
   git tag -a v1.0.0-beta.N -m "Release 1.0.0-beta.N"
   git push origin v1.0.0-beta.N
   ```

9. **Publish the beta to npm** after the merged `main` commit is green:

   ```bash
   npm publish --access public --tag beta
   ```

10. **Verify the publication:**
   - the home page shows `1.0.0-beta.N`;
   - `docs/changelog.html` lists it as the latest release;
   - `docs/api/tokens-sync.json` is current and has zero errors;
   - `npm view ds-tis@beta version` returns `1.0.0-beta.N`;
   - a clean `npm install ds-tis@beta` succeeds;
   - the installed tarball passes the consumer smoke test.

## If something goes wrong

- **CI fails before the tag:** fix it in a new branch commit and repeat the pull request gate. Do not tag a failing commit.
- **A problem appears after the tag:** do not move the tag silently. Prefer the next `1.0.0-beta.N` containing the fix.
- **Registry publication fails:** keep GitHub installation documented until the registry package is confirmed; never publish documentation that claims an unavailable source.

## npm publication

Betas are published with `npm publish --access public --tag beta`. During the
beta phase, the canonical install command is `npm install ds-tis@beta`, and
production consumers should pin the exact prerelease. The bare package name
(`npm install ds-tis`) becomes canonical only after a stable version is promoted
to the npm `latest` tag.
