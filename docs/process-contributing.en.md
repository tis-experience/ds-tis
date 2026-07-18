# Contributing

This is a site-friendly companion to the repository root
[CONTRIBUTING.md](../CONTRIBUTING.md). When they differ, `CONTRIBUTING.md` is
the canonical source.

## Local setup

Requirements: Node.js 20+, git and GitHub SSH access.

```bash
git clone <repo-url>
cd ds-tis
npm install
npm run build:tokens
```

To serve the site locally:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`.

## Change workflow

1. Open an issue explaining what should change and why.
2. Create a branch: `git checkout -b feat/short-name`.
3. Make the change.
4. Complete the [pre-commit checklist](#pre-commit-checklist).
5. Open a pull request against `main`.

## Commit conventions

Use Conventional Commits with Portuguese commit messages. Supported prefixes:
`feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test` and `ci`.

Example:

```
fix(input): corrigir alinhamento do ícone trailing em sm

- Ajusta margem direita para usar space/control/padding-x
- Valida em docs/input.html

Co-Authored-By: ...
```

## Pre-commit checklist

- [ ] `npm run build:tokens` completes without errors.
- [ ] `npm run sync:docs` regenerates the documented outputs.
- [ ] `npm run verify:tokens` reports no new drift.
- [ ] Observable consumer changes are recorded under `[Não publicado]` in `CHANGELOG.md`.
- [ ] A new or updated ADR exists when the change affects architecture.

## When to open an ADR

Open an ADR when a change:

- changes token architecture;
- introduces or removes a naming convention;
- changes the relationship between Figma, JSON and CSS;
- affects accessibility systemically;
- adds a dependency.

A targeted component fix or visual alignment does not require an ADR.

Use existing files under `docs/decisions/` as the template.

## Token pipeline

For Figma-native categories, decisions start in Figma Variables and are synced
to `tokens/**/*.json`. CSS-only categories defined by ADR-016 start in JSON.
Both paths converge on `build-tokens.mjs` → `css/tokens/generated/*.css` →
`css/components/*.css`.

Never edit files under `css/tokens/generated/` manually. CI verifies generated
outputs on every push to `main`.

See [Token Architecture](./token-architecture.html) and
[ADR-001](./decisions/ADR-001-migracao-tokens.md) for details.
