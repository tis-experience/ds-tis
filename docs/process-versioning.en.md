# Versioning

The design system follows [Semantic Versioning](https://semver.org/). It is
currently in the **1.0 beta phase**: releases remain `1.0.0-beta.N` until the
design owner approves the official release.

## Current beta policy

Every release increments `N` in `1.0.0-beta.N`. There are no separate minor or
patch releases during beta; each release is a coherent system snapshot:

```
v0.8.0           ← last pre-beta release
v1.0.0-beta.1    ← first beta release
v1.0.0-beta.2
v1.0.0-beta.3
...
v1.0.0-rc.1      ← release candidate, owner decision
v1.0.0           ← official release, owner decision
```

### When to bump

Use a coherent package plus a time fallback.

#### 1. Significant change

Bump when at least one of these happens since the previous beta:

- an accepted ADR changes architecture or a public contract;
- a public namespace or token is renamed;
- a new component ships outside draft status;
- a token layer is removed or consolidated;
- a source-of-truth rule changes;
- a relevant structural migration closes across Figma and the repository.

#### 2. Complete feature

Bump when a set of changes closes a feature, not for each partial commit. A
theming feature, for example, ships with Foundation, Semantic, adapted
components and documentation together.

#### 3. Time fallback

When patches accumulate without an architectural or feature trigger, publish a
weekly beta. This prevents `[Não publicado]` from becoming an unbounded dump.

### When not to bump

- unshipped work in progress;
- partial cleanup;
- every isolated session commit;
- internal documentation or scripts with no consumer impact;
- automatic regeneration by CI;
- refactors without observable impact.

## Post-1.0 policy

After the owner approves `1.0.0`, use standard semver:

| Type | Example | When |
|---|---|---|
| Patch | 1.0.1 | Targeted compatible fix. |
| Minor | 1.1.0 | Compatible addition such as a component, foundation or token. |
| Major | 2.0.0 | Breaking removal or rename of a public token, class or API. |

## Maturity criteria for leaving beta

The official 1.0 release is an owner decision, not an automatic technical gate.
This checklist records maturity.

### Architecture

- [x] Zero errors in `verify:tokens`.
- [x] Zero Foundation leaks in component and base CSS.
- [x] Components audited between Figma and CSS.
- [x] Complete Text Style coverage for non-Material component text in Figma.
- [x] Designer-focused descriptions on Figma component sets.

### Current maturity

- [x] `Form Field` defined as CSS-only by ADR-017.
- [x] `docs/brand-principles.md` contains real operational content.
- [x] Snapshot exporter and local Figma↔JSON/structure gates available.
- [ ] Historical ADRs reviewed with evolution notes where needed.
- [x] `docs/process-figma-sync.md` reflects current naming and exporter flow.
- [x] `tokens/registry.json` has complete metadata.
- [x] Visual regression runs in CI and platform-specific local baselines.
- [x] axe-core accessibility tests run in light and dark modes.
- [ ] Automated Figma→JSON CI sync; conditional on a plugin because the REST API requires Enterprise.

## Single version chain

Four places display the version and must agree:

- `package.json`;
- the latest released section in `CHANGELOG.md`;
- the badge in `index.html`;
- the annotated git tag `v1.0.0-beta.N`.

When all four match, published documentation is current.

## One CHANGELOG entry per release

`[Não publicado]` is staging. At release time, the entire section becomes
`[1.0.0-beta.N] — YYYY-MM-DD` and a new empty `[Não publicado]` section is added.

Avoid:

- fragmented subsections for every daily adjustment;
- a version bump for every commit;
- many dates under unreleased changes.

Prefer one release entry grouped by Added, Changed, Fixed and Removed, with each
item explaining why in one or two lines.

## Bump workflow

1. Confirm that `[Não publicado]` is consolidated.
2. Rename it to `[1.0.0-beta.N] — YYYY-MM-DD`.
3. Add a new empty `[Não publicado]` section.
4. Update `package.json` and `package-lock.json`.
5. Update the `index.html` version badge.
6. Run `npm run build:all`.
7. Commit with `chore(release): 1.0.0-beta.N`.
8. Open and merge the release pull request.
9. Wait for green CI on `main`.
10. Create and push the annotated tag.

## Non-versioned changes

Internal agent notes, archived scripts, CI workflows with no deployment impact
and local configuration may ship in `docs:`, `chore:` or `ci:` commits without
a release bump.

## Pre-beta history

Before beta, the system used 0.x.y minor and patch releases. Tags from
`v0.5.0` through `v0.8.0` remain valid and the CHANGELOG preserves that
history. No history rewrite is required.
