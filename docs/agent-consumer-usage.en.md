# Using DS TIS with agents in consumer projects

This guide is the official instruction for AI agents implementing screens in
consumer applications with DS TIS. It does not replace `AGENTS.md`, which is
for maintaining this repository. The focus here is consumption: building real
screens with the package's public API without inventing an official layer that
does not exist.

Use this guide before generating, reviewing or refactoring any screen in a
consumer application.

## Scope

DS TIS is stack-agnostic. Its public foundation is HTML, CSS and JavaScript
distributed by the `ds-tis` package. React, Vue, Angular, Svelte or another
framework may wrap this foundation inside the consumer application, but that
wrapper belongs to the consumer project.

Do not present React, Vue or Angular wrappers as official DS TIS APIs unless
they exist in this repository.

## Expected inputs

Before implementing, the agent must gather:

- the goal of the screen or flow;
- the consumer project's stack and conventions;
- the installed `ds-tis` version, when available;
- existing routes, layouts, providers and local patterns;
- expected states: loading, empty, error, disabled, success, read-only, destructive and responsive;
- accessibility, language, data and permission constraints.

If these inputs are unclear, inspect the project first. Ask the owner only when
the decision changes product behavior, real data, permissions or local architecture.

## Required sources

Before writing new markup, consult the public DS sources:

- `README.md` for installation and primary imports;
- `docs/llms.txt` for the lightweight LLM index;
- `docs/llms-full.txt` for complete canonical context;
- `docs/api/components.json` for components, readiness, responsibility, variants, consumed tokens and JS runtime metadata (`runtime.level`, `runtime.module`, `runtime.init`, `runtime.destroy`, `runtime.events`);
- `docs/api/tokens.json` for Foundation, Semantic and Component layers;
- component pages at `docs/<component>.html`;
- templates under `docs/templates/` and exports under `ds-tis/templates/*` when the flow matches a published pattern.

Do not depend on memory or assumptions about classes. When in doubt, read the
component page and the JSON API.

The tarball includes machine-readable context. After installation, read it
through `ds-tis/metadata`, `ds-tis/metadata/components`,
`ds-tis/metadata/tokens`, `ds-tis/agent-guide`, `ds-tis/agent-guide/en`, `ds-tis/llms` and
`ds-tis/llms-full`, or directly from `node_modules/ds-tis/docs/`. Without the
package, use the public fallback
`https://tis-experience.github.io/ds-tis/docs/api/components.json`.

`ds-tis/metadata` points to `consumer-context.json`, a compact manifest with
official entrypoints, version, sources of truth and the responsive contract.
JSON modules may require an import attribute in some stacks; agents and scripts
may also read the file through the package resolver or filesystem.

## Readiness and responsibility

Before selecting a component, read `readiness` and `responsibility` in
`docs/api/components.json`:

| Readiness | Expected use |
|---|---|
| `app-ready` | Recommended for applications within the documented public API. |
| `composition` | Public and stable, but the application owns orchestration, navigation or shared state. |
| `experimental` | Do not use in a critical flow without explicitly accepting the limitation in `readinessNotes`. |

`responsibility.model` identifies who owns behavior:

- `native`: use the appropriate HTML element; the app owns data and business events;
- `presentation`: there is no component runtime; the app supplies content and context;
- `consumer`: the DS provides visual composition, while the app owns orchestration;
- `ds-runtime`: the DS owns reusable interaction; initialize the module declared in `runtime`.

Do not promote an Experimental component to App-ready locally. If the project
fills a gap with custom code, identify it as a local adaptation and record the
demand for the DS.

## Official imports

Install the current version from the npm registry:

```bash
npm install ds-tis
```

During the beta phase, the npm `latest` and `beta` dist-tags point to the same
prerelease; `npm install ds-tis@beta` makes the channel explicit. In production,
prefer `"ds-tis": "1.0.0-beta.9"` in `package.json`. GitHub release fallback:
`npm install github:tis-experience/ds-tis#v1.0.0-beta.9`.

Import the public CSS once in the application's global entrypoint:

```js
import 'ds-tis/css';
```

For Accordion, Combobox, Modal, Action Menu, Tabs and Tooltip, initialize the
public behavior after render or hydration. On teardown (SPA route, view or
portal), call the corresponding `destroy` function to remove listeners:

```js
import { initAccordions, destroyAccordions } from 'ds-tis/accordion';
import { initComboboxes, destroyComboboxes } from 'ds-tis/combobox';
import { initModals, destroyModals } from 'ds-tis/modal';
import { initActionMenus, destroyActionMenus } from 'ds-tis/menu';
import { initTabs, destroyTabs } from 'ds-tis/tabs';
import { initTooltips, destroyTooltips } from 'ds-tis/tooltip';

initAccordions();
initComboboxes();
initModals();
initActionMenus();
initTabs();
initTooltips();

// when leaving the view / unmounting:
destroyAccordions();
destroyComboboxes();
destroyModals();
destroyActionMenus();
destroyTabs();
destroyTooltips();
```

A `required` module does not automatically make a component App-ready.
Accordion, Combobox, Modal, Action Menu, Tabs and Tooltip have completed the
executable ADR-020 gate. Their modules remain required whenever those
components are used because they preserve the published interactive and
accessible contract.

In the App-ready Combobox, DOM focus stays on the input while arrow keys update
`aria-activedescendant`; `Escape` closes the listbox without moving focus. The
`ds-combobox-change` event exposes `value`, `input`, `root` and the selected
`option` in `detail`.

In the App-ready Modal, only siblings outside the dialog path receive `inert`;
the runtime preserves and restores each node's previous state. `ds-modal-open`
and `ds-modal-close` expose the overlay, dialog and relevant focus reference in
`detail`.

In the App-ready Action Menu, `menuitem`, `menuitemradio` and
`menuitemcheckbox` are part of the contract. `aria-disabled` items remain
focusable but do not activate or close the menu; typeahead, arrows, Home/End and
Escape are maintained by the runtime.

In the App-ready Tabs, the runtime keeps exactly one tab in the focus order,
skips disabled tabs with arrows and Home/End, synchronizes `aria-selected` with
`hidden` on panels and ensures focus entry on the selected tabpanel. Tab buttons
without an explicit `type` are normalized to `type="button"`, preventing
accidental form submission. `ds-tabs-change` exposes the root, tab, panel and
previous tab in `detail`.

In the App-ready Tooltip, the runtime ensures valid `role="tooltip"`, ID and
`aria-describedby` even when the markup omits them. Focus and hover open it
without moving DOM focus; blur and leaving both trigger and content close it;
Escape keeps it dismissed until pointer and focus leave. Content stays
hoverable under WCAG 1.4.13. `ds-tooltip-show` and `ds-tooltip-hide` expose the
root, trigger and content in `detail`.

For theme customization, use the public theme engine:

```js
import { applyTheme, toCssSnippet } from 'ds-tis/theme';
```

When a published template is a useful starting point, use its export:

```js
import loginTemplate from 'ds-tis/templates/login.html?raw';
```

`ds-tis/templates/*` points to public HTML templates. Adapt content, routes and
data to the consumer application; do not copy fictional text into production.

## JavaScript runtime by component

Read `docs/api/components.json` before importing JS modules. Each component
exposes `runtime`:

| Field | Meaning |
|---|---|
| `null` | CSS-only; no published JS module. |
| `runtime.level: "required"` | The interactive and accessible contract depends on initialization (Accordion, Combobox, Modal, Action Menu, Tabs and Tooltip). |
| `runtime.level: "optional"` | Reserved for enhancements unnecessary to the accessible contract; no current module uses this level. |
| `runtime.module` | Package export (`ds-tis/accordion`, `ds-tis/combobox`, `ds-tis/modal`, `ds-tis/menu`, `ds-tis/tabs`, `ds-tis/tooltip`). |
| `runtime.init` | Function called after render or hydration. |
| `runtime.destroy` | Function called during teardown. |
| `runtime.events` | Public events emitted by the module. |

The top-level `runtimeModules` array in `components.json` lists every published
module. Do not import JS for components with `runtime: null`.

## Responsive contract

The DS uses an `intrinsic-first` strategy and publishes no automatic
breakpoints. `publicBreakpoints` is intentionally empty: `sm`, `md`, `lg` and
`full` variants are explicit product choices, not viewport-triggered rules.
Read `responsiveContract`, `responsiveProfiles` and each component's
`responsive` field in `ds-tis/metadata/components`.

- `container`: the component preserves its anatomy in the supplied width; the app owns grid and reflow;
- `viewport-constrained`: Modal and Tooltip apply intrinsic viewport limits;
- `consumer-managed-horizontal`: Tabs, Breadcrumb and Pagination do not remove or summarize items; the app decides overflow, reduction or an alternative composition;
- `consumer-selectable-width`: Button provides explicit width choices; the app decides when to apply them.

The tarball is exercised at 320×568, 568×320 and 1280×800. This proves the
reference fixture and overlay limits; it does not replace tests with the
consumer product's content, zoom, language, orientation and layout.

## Implementation rules

1. Choose existing components before creating ad hoc markup. Read `readiness`, `responsibility` and `runtime` in `docs/api/components.json`.
2. Use the documented public anatomy. Do not use isolated internal classes as autonomous components.
3. Forms must combine `ds-field` with the actual control: `ds-input`, `ds-select`, `ds-textarea`, `ds-combobox`, `ds-checkbox`, `ds-radio` or `ds-toggle`. For Input, the native field remains inside the public anatomy with `ds-input__field`.
4. Do not hardcode `#hex`, `rgb()`, `px` or `rem` when a public token, class, variant or utility exists for the same role.
5. Preserve the DS visual chain. Public tokens appear as `var(--ds-...)`; do not invent local values for color, spacing, radius, border, typography or focus ring without justification.
6. Preserve accessibility: semantic landmarks, heading order, labels, `aria-*`, `aria-describedby`, `aria-expanded`, `aria-current`, keyboard support, disabled/error/read-only states and a visible focus ring.
7. States are not decoration. Implement loading, empty, error, disabled, hover, focus and responsive states when they belong to the expected flow.
8. Icons should follow the consumer project's library when one exists; when reproducing DS examples, prefer the documented visual vocabulary.
9. Do not invent official wrappers. In React, Vue or Angular, create local app components only as adaptations of public anatomy and state that boundary.
10. Do not change DS tokens, generated CSS or documentation from the consumer project. Record real gaps and open a demand for the DS.

## Recommended workflow

1. Read the request, identify the stack and find the global entrypoint for `ds-tis/css`.
2. Inventory the screen: navigation, forms, feedback, cards, overlays, lists, loading, empty states and actions.
3. Map each part to an existing DS component and check readiness. Use local markup only when no suitable DS component exists.
4. Read the component HTML page and `docs/api/components.json` before writing anatomy.
5. Implement with public DS classes without copying internal classes outside their component context.
6. Initialize JS modules when `components.json` declares a runtime: always for `required`, and for `optional` when the screen needs the enhancement.
7. Apply `ds-tis/theme` only for an actual runtime brand or mode requirement.
8. Run the consumer project's tests and linters. When possible, validate accessibility with axe, Playwright, a real browser or an equivalent tool.
9. Deliver evidence: components, imports, relevant tokens/classes, accessibility validation and assumed limits.

## Framework adaptation

React, Vue and Angular may render public DS anatomy through local components.
The adaptation must:

- preserve public DS class names;
- preserve labels, IDs, `aria-*` and `for`/`id` relationships;
- expose local product-aligned props without promising an official DS API;
- initialize JS modules after render or hydration when required;
- avoid recreating complex behavior when the DS already exports a public helper such as `ds-tis/combobox`.

Correct boundary example: "I created `AppTextField` in the consumer application
using `ds-field` + `ds-input`; this is a local app wrapper, not an official
component exported by `ds-tis`."

## Short prompt for a consumer agent

Copy this block to start an agent that will implement a screen with DS TIS in a
consumer project:

```text
Role: DS TIS consumer agent.

Input artifact:
- Screen or flow request.
- Consumer project stack.
- Current app files defining layout, global styles, routes and local components.
- Installed ds-tis version, if any.

Required sources:
- README.md
- docs/llms.txt
- docs/llms-full.txt
- docs/api/components.json (readiness, responsibility and runtime)
- docs/api/tokens.json
- docs/<component>.html for every component used
- docs/templates/ or ds-tis/templates/* when a relevant template exists

Rules:
- Install with `npm install ds-tis`; pin the exact version in production during beta.
- Import ds-tis/css once in the global entrypoint.
- For each component, derive the module from runtime.module in docs/api/components.json; when runtime.level is required, call init after render/hydration and destroy before unmount.
- Prefer App-ready components; treat Composition as an explicit app boundary and do not use Experimental in critical flows without recording the limitation.
- Use ds-tis/theme only for an actual runtime theme or brand requirement.
- Choose existing components before creating ad hoc markup.
- Use public component anatomy; do not use isolated internal classes.
- Form controls must combine ds-field with the actual control, such as ds-input + ds-input__field.
- Do not hardcode hex/rgb/px/rem when a public token, class or variant exists.
- Preserve landmarks, labels, aria-*, keyboard behavior, focus ring and disabled/error/read-only states.
- In React/Vue/Angular, adapt public anatomy into local app wrappers; do not invent official DS TIS wrappers.

Expected output:
- Changed files.
- DS components used and why.
- Added DS imports.
- Relevant public tokens and classes.
- Accessibility and keyboard evidence.
- Assumed limits or DS gaps that require a demand.

Blocked before:
- Creating an official DS API that does not exist.
- Changing ds-tis package tokens or CSS inside the consumer application.
- Replacing an existing DS component with ad hoc markup without justification.
- Removing labels, aria-* or focus ring.
```

## Delivery checklist

Before finishing, the agent must report:

- DS components used and alternatives rejected;
- readiness and responsibility for each component used;
- imports added: `ds-tis/css`, JS modules declared in `components.json`, `ds-tis/theme` and/or `ds-tis/templates/*`;
- main public classes such as `ds-field`, `ds-input` and `ds-input__field`;
- relevant CSS tokens when customization uses `var(--ds-...)`;
- accessibility evidence: labels, landmarks, `aria-*`, keyboard, focus ring and contrast when applicable;
- implemented states: default, hover, focus, disabled, error, loading, empty and responsive as required by the flow;
- assumed limitations and gaps that belong in the DS or product backlog.

If an item does not apply, state why. Never leave missing states or
accessibility implicit.
