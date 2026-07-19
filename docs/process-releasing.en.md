# Releases

Canonical process for publishing the TIS Design System. Every release starts on
its own branch, reaches `main` through a pull request and receives a tag only
after the merged commit is green.

## Before starting

- [ ] The owner approved the SemVer classification and publication.
- [ ] `[Não publicado]` covers every change since the previous version.
- [ ] A Figma snapshot newer than 24 hours is available.
- [ ] The working tree is clean and the branch starts from current `main`.

## Step-by-step

1. **Update the version chain**:
   - turn `[Não publicado]` into `[X.Y.Z] — YYYY-MM-DD` and create a new empty section;
   - update CHANGELOG comparison links;
   - update `package.json`, `package-lock.json` and the `VERSION` badge in `index.html`.

2. **Generate version-specific Figma evidence**:

   ```bash
   npm run release:figma-evidence
   npm run verify:release-evidence
   ```

   `.figma-snapshot.json` stays gitignored. The commit contains only
   `docs/api/release-figma-evidence.json`, with safe metadata, gate results and
   SHA-256 digests for the snapshot and tokens. CI fails if the version or token
   state changes after attestation.

3. **Regenerate and validate everything**:

   ```bash
   npm run build:all
   npm run test:app-ready -- --release
   npm run pack:check
   npm run security:check
   ```

4. **Review the diff**, create `chore(release): X.Y.Z`, push the branch and open
   a ready pull request.

5. **Merge only with green CI.** On the pull request, wait for Verify tokens,
   Test on Node 22/24 and Build and Deploy. After merge, wait for the same checks
   and the Pages deployment on the resulting `main` SHA.

6. **Create and push the annotated tag** on the validated commit:

   ```bash
   git tag -a vX.Y.Z -m "Release X.Y.Z"
   git push origin vX.Y.Z
   ```

7. **Publish to npm**:

   Stable release:

   ```bash
   npm publish --access public --tag latest --auth-type=web
   ```

   Prerelease:

   ```bash
   npm publish --access public --tag beta --auth-type=web
   ```

   Never point `latest` to a prerelease while a stable version exists.

8. **Create the GitHub Release** from the tag with notes derived from the
   CHANGELOG. Mark only suffixed versions (`-beta.N`, `-rc.N`) as prereleases.

9. **Synchronize the Figma cover** to `vX.Y.Z` and visually validate the cover
   frame. A version-only text update does not require a new token snapshot.

10. **Verify production**:
    - `npm view ds-tis@latest version` returns the stable release;
    - `npm install ds-tis` works in a clean project;
    - the tarball exposes CSS, runtimes, theme, templates and metadata;
    - GitHub Release and tag point to the same SHA;
    - Pages shows the correct version and contains no private files;
    - `docs/api/release-figma-evidence.json` matches the package;
    - the Figma cover shows the same version;
    - no blocking pull request, issue, check or annotation remains.

## If something goes wrong

- **Before the tag:** fix the branch, repeat every gate and wait for new CI.
- **After the tag, before npm:** never move a tag silently; publish a new version
  if the SHA is wrong.
- **After npm:** registry versions are immutable. Correct with a patch or a new
  prerelease; deprecate a problematic version only with a clear reason.
- **Pages failure:** the last valid deployment stays online. Fix it through a
  pull request and do not declare the release complete before the workflow is green.

## npm dist-tags

- `latest`: stable version recommended to consumers.
- `beta`: opt-in prerelease; it may remain on the most recently published beta
  until a new prerelease exists.
- production uses `latest` or an exact pin; `beta` is never promoted automatically.
