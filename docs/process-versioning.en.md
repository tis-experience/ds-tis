# Versioning

The TIS Design System follows [Semantic Versioning](https://semver.org/) and is
stable from `1.0.0` onward.

## Current policy

| Type | Example | When |
|---|---|---|
| **Patch** | `1.0.1` | Compatible fix, hardening, documentation or internal adjustment with no public contract break. |
| **Minor** | `1.1.0` | Compatible addition such as a component, token, foundation, template or API. |
| **Major** | `2.0.0` | Breaking removal or incompatible rename of a token, class, markup contract, export or public behavior. |

Classification is based on impact for designers, developers and AI agents, not
diff size. A small change may require a major release if it breaks a public
contract; a large additive implementation may remain minor.

## Prereleases

Future prereleases use `X.Y.Z-beta.N` and are published only to the npm `beta`
dist-tag:

```text
1.1.0-beta.1  → npm install ds-tis@beta
1.1.0         → npm install ds-tis
```

`latest` always points to the newest stable release. A beta never replaces
`latest` while a stable release exists.

## When to version

Create a release when a coherent package of observable changes is complete,
documented and approved. Typical triggers include:

- a production-ready compatible or accessibility fix;
- a complete component or runtime;
- a public token or contract change;
- infrastructure that changes publication or consumption;
- documentation or machine-readable API changes that affect handoff.

Do not version work in progress, regeneration with no observable change,
internal notes or refactors that do not affect the contract.

## 1.0 maturity closure

The owner approved the stable promotion after this evidence was complete.

### Architecture and consumption

- [x] `verify:tokens` reports zero errors and zero warnings.
- [x] No Foundation leaks remain in component or base CSS.
- [x] Components are audited across Figma, tokens, CSS and documentation.
- [x] All 23 components are classified: 21 App-ready and 2 compositions, with no experimental components.
- [x] Six public runtimes prove init, destroy, hydration, keyboard, ARIA and consumer smoke behavior.
- [x] The npm package exposes explicit entrypoints, templates, theme engine and AI-agent metadata.

### Quality and governance

- [x] Automated WCAG 2.2 AA checks pass in light and dark with no accepted violations.
- [x] Linux and Darwin visual regression baselines are separate and stable.
- [x] The DTCG registry is complete and the Foundation → Semantic → Component chain is enforced.
- [x] Historical ADRs were reviewed; superseded and partially superseded decisions link to their current evolution in the canonical index.
- [x] Every release carries live-Figma evidence: export remains manual on the Pro plan, while CI enforces the version, results and token SHA-256 produced from a snapshot newer than 24 hours.
- [x] GitHub Pages deploys through an auditable Actions workflow with no legacy builder.

## Single version chain

These artifacts must agree:

- `package.json` and `package-lock.json`;
- the latest released section in `CHANGELOG.md`;
- the `VERSION` badge in `index.html`;
- `docs/api/release-figma-evidence.json`;
- the annotated git tag.

Generators propagate the version to inventories, JSON APIs, HTML documentation
and the LLM corpus. Any mismatch blocks the release.

## CHANGELOG

`[Não publicado]` contains only changes that have not shipped. At release time,
the whole section becomes one `[X.Y.Z] — YYYY-MM-DD` entry grouped under Added,
Changed, Fixed and Removed, and a new empty section is created at the top.

## Bump workflow

1. Confirm the SemVer classification and owner approval.
2. Consolidate `[Não publicado]` and update comparison links.
3. Update `package.json`, `package-lock.json` and the `index.html` badge.
4. With a live Figma snapshot, run `npm run release:figma-evidence`.
5. Run `npm run build:all`, `npm run test:app-ready -- --release`,
   `npm run pack:check` and `npm run security:check`.
6. Open a pull request and merge only when every check is green.
7. Confirm CI and deployment for the resulting `main` commit.
8. Create and push the annotated `vX.Y.Z` tag.
9. Publish to npm and validate clean installation, GitHub Release, Pages and Figma.

## History

The 0.x tags record the initial phase. `1.0.0-beta.1` through
`1.0.0-beta.10` record pre-1.0 stabilization. Published history is immutable;
no released tag is moved or rewritten.
