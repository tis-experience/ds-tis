# Documentation guidelines

This guide defines the editorial contract for TIS Design System pages. Read it
before creating, refactoring or reviewing files under `docs/`.

## Principles

1. **Documentation describes the current state.** Sources of truth remain ADRs, Figma, JSON and CSS according to `AGENTS.md`.
2. **Structure follows purpose.** Foundation, Component, Process and System pages do not need the same template.
3. **Exceptions are explicit.** When a page omits a common section, explain the reason on the page or in this guide.
4. **Documentation does not invent official names.** Use the name from Figma, JSON or CSS. Put usage explanations in role or usage columns.
5. **TIS Design System is the public product name.** Use it consistently in public documentation and package guidance.

## Page types

| Type | Purpose | Examples |
|---|---|---|
| Foundation | Explain scales, tokens, values and recommended use | Colors, Spacing, Elevation |
| Component | Teach usage, anatomy, states, tokens, CSS and accessibility | Button, Input, Tabs |
| Process | Explain a verifiable operational workflow | Contributing, Releasing, Versioning |
| System | Explain principles, architecture and cross-cutting rules | Token Architecture, Accessibility |

## Foundation pages

Recommended template:

1. Overview.
2. Visual reference or scale.
3. Token reference.
4. Usage and relationships with other systems, when relevant.
5. Architectural exceptions, when an ADR exists.
6. JSON (DTCG).

Allowed variations:

- Colors and Theme Colors may use swatches instead of tables.
- Typography may include type previews.
- Elevation must mention surfaces because depth combines shadow and surface, especially in dark mode.
- Motion, Z-index and Shadow/Elevation may reference CSS-only exceptions connected to ADR-016.

## Component pages

Recommended template:

1. When to use.
2. Anatomy.
3. Variants, sizes, states and examples.
4. Best practices.
5. Content guidelines when the component renders text, a label or a message.
6. Token mapping.
7. CSS classes.
8. Figma properties when variants or properties matter for handoff.
9. Keyboard interaction when interactive.
10. Accessibility.
11. Related components.

Allowed exceptions:

- Non-interactive components do not need Keyboard interaction.
- Simple components may have short anatomy, but must not omit structural intent.
- `Form Field` uses a dedicated template because ADR-017 defines it as CSS-only.

## Static documentation and Storybook

The two surfaces complement each other and must not maintain competing editorial contracts:

- static documentation is the canonical reference for usage, anatomy, tokens, classes, Figma properties and accessibility;
- Storybook demonstrates the real public implementation through Controls, variants, sizes, states and runtime behavior;
- every Storybook component must link to its canonical static page;
- the documentation home and global navigation must keep access to the published Storybook under `/storybook/`;
- `npm run test:storybook` protects contract coverage, while `npm run test:storybook:browser:pages` validates the final artifact on desktop, mobile, dark mode, Axe and real interactions.

## Form Field

`Form Field` is CSS-only and must not be reported as a missing visual component
in Figma. Its page must explain that it:

- composes HTML markup for label, control, helper and error;
- does not replace Figma Input, Select, Textarea, Checkbox, Radio or Toggle components;
- maps DOM and ARIA behavior rather than introducing a new Figma surface.

## Process pages

Recommended template:

1. Scope and source of truth.
2. Before starting.
3. Step-by-step workflow.
4. Validation.
5. Common failures or rollback.
6. Related links.

## System pages

Recommended template:

1. Principle or decision.
2. Design impact.
3. Code impact.
4. Related tokens or artifacts.
5. Verification.
6. Related ADRs and processes.

## Official table labels

Use these labels in English:

| Concept | Label |
|---|---|
| CSS variable | CSS variable |
| Description | Description |
| WCAG criterion | WCAG criterion |
| Function / role | Role |
| Reference | Reference |
| Class | Class |
| Property | Property |
| Value | Value |
| Usage | Usage |

## Authored vs generated

| File | Type | How to change it |
|---|---|---|
| Manual `docs/*.html` | Authored | Edit the HTML directly |
| `docs/*.md` published by `sync:docs` | Authored source | Edit the Markdown and run `npm run sync:docs` |
| `docs/*.en.md` paired with a public page | Authored English source | Edit the English Markdown and run `npm run sync:docs` |
| `docs/decisions/ADR-*.md` | Authored source | Edit the Markdown and run `npm run sync:docs` |
| `docs/decisions/adr-*.html` | Generated | Never edit manually |
| `docs/changelog.html` | Generated | Edit `CHANGELOG.md` |
| `docs/token-schema.md`, `docs/component-inventory.md`, `docs/adr-index.md` | Generated | Run `npm run sync:docs` |
| `docs/llms*.txt` | Generated | Run `npm run build:llms` |

## Review checklist

- The page follows the correct template for its type.
- Exceptions are declared.
- Referenced tokens exist and pass `npm run verify:tokens`.
- Table labels use the official terminology in this guide.
- Observable changes are recorded in `CHANGELOG.md`.
- Generated files were updated with the correct command.
- Public bilingual pages contain complete PT-BR and English sources.
- Storybook and static documentation remain linked in both directions.
