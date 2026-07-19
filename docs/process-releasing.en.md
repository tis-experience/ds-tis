# Releases

Step-by-step release process for the design system. Start from a reviewed
release branch with all intended work complete.

## Before starting

- [ ] Release changes are in small, readable commits with Portuguese messages.
- [ ] A Figma snapshot newer than 24 hours was validated with `npm run release:figma-evidence`, and the generated attestation is part of the diff.
- [ ] `npm run build:tokens`, `npm run sync:docs`, `npm run verify:tokens`, `npm run verify:release-evidence` and `npm run test:app-ready` pass.
- [ ] `[Não publicado]` in `CHANGELOG.md` covers every change since the previous version.

## Step-by-step

1. **Choose the version.** Read the [versioning rules](./process-versioning.md). During beta, always use the next `1.0.0-beta.N`.

2. **Update `CHANGELOG.md`:**
   - rename `[Não publicado]` to `[1.0.0-beta.N] — YYYY-MM-DD`;
   - add a new empty `[Não publicado]` section;
   - update comparison links at the bottom.

3. **Update package metadata:** change `package.json` and `package-lock.json` to `1.0.0-beta.N`.

4. **Generate the Figma evidence for this version** after installing a live snapshot:

   ```bash
   npm run release:figma-evidence
   npm run verify:release-evidence
   ```

   The snapshot remains gitignored. The committed
   `docs/api/release-figma-evidence.json` stores safe metadata, gate results and
   SHA-256 digests for the snapshot and tokens. CI fails if the version or any
   token JSON changes after validation.

5. **Create the release commit:**

   ```bash
   git add CHANGELOG.md package.json package-lock.json docs/
   git commit -m "chore(release): 1.0.0-beta.N"
   ```

6. **Push the release branch and open a pull request.** Do not bypass protected `main`.

7. **Wait for pull request CI** and merge only when required checks are green.

8. **Validate `main`.** Test and deployment workflows must pass on the merged release commit.

9. **Create and push the annotated tag:**

   ```bash
   git tag -a v1.0.0-beta.N -m "Release 1.0.0-beta.N"
   git push origin v1.0.0-beta.N
   ```

10. **Publish to npm** after the merged `main` commit is green:

   ```bash
   npm publish --access public --tag beta
   npm dist-tag add ds-tis@1.0.0-beta.N latest --auth-type=web
   ```

11. **Verify the publication:**
   - the home page shows `1.0.0-beta.N`;
   - `docs/changelog.html` lists it as the latest release;
   - `docs/api/tokens-sync.json` is current and has zero errors;
   - `docs/api/release-figma-evidence.json` matches the version and current token digest;
   - GitHub Pages was deployed from the audited `_site/` artifact by the custom Actions workflow;
   - `npm view ds-tis@beta version` and `npm view ds-tis@latest version` return `1.0.0-beta.N`;
   - a clean `npm install ds-tis` succeeds;
   - the installed tarball passes the consumer smoke test.

## If something goes wrong

- **CI fails before the tag:** fix it in a new branch commit and repeat the pull request gate. Do not tag a failing commit.
- **A problem appears after the tag:** do not move the tag silently. Prefer the next `1.0.0-beta.N` containing the fix.
- **Registry publication fails:** keep GitHub installation documented until the registry package is confirmed; never publish documentation that claims an unavailable source.

## npm publication

Betas are published with `npm publish --access public --tag beta`, then the same
version is promoted to the `latest` dist-tag. Therefore `npm install ds-tis` and
`npm install ds-tis@beta` resolve the current beta; production consumers should
pin the exact prerelease. Once a stable release exists, `latest` points to stable
and `beta` remains the prerelease channel.
