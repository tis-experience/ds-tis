# Brand principles — TIS Design System

> This document defines the brand expression of the **TIS Design System**. It
> does not replace corporate brand guidelines; it turns the identity available
> in this repository into operational rules for products, documentation and
> components.

## Mission

Give designers, developers and AI agents a dependable visual and behavioral
foundation for building consistent, accessible and sustainable TIS products
without coupling the experience to a specific framework.

## Design principles

### 1. Clarity before ornament

Every visual decision must make hierarchy, state or the next action easier to
understand. Color, spacing and motion have a purpose; decoration without
information must not compete with content.

**Concrete example:** a destructive Button combines an explicit label,
feedback color and a visible focus ring; color is not the only signal.

**Anti-pattern:** adding surfaces, shadows or badges only to fill space or
simulate hierarchy unsupported by the content.

### 2. Accessibility is part of the identity

WCAG 2.2 AA is the system baseline. Contrast, semantics, keyboard support,
focus, targets and reduced motion belong to the component from its first state;
they are not a layer added later.

**Concrete example:** interactive components preserve perceptible focus in
light, dark and forced-colors modes, with documented keyboard behavior.

**Anti-pattern:** removing outlines, relying only on hover or using brand text
without validating its actual background.

### 3. Explicit contracts, flexible composition

Tokens, public anatomy, readiness and runtime responsibility must be readable
by people and machines. The core remains stack-agnostic and intrinsic-first;
each product may create local layouts and wrappers without inventing official
DS APIs.

**Concrete example:** an agent reads `ds-tis/metadata/components`, builds the
documented anatomy and initializes the public runtime when required.

**Anti-pattern:** copying an appearance with internal classes, omitting states
or presenting a local framework wrapper as an official component.

## Voice and tone

### Attributes

- **Clear:** uses specific terms and explains the next action.
- **Direct:** avoids long introductions, unnecessary jargon and vague promises.
- **Responsible:** describes limits, states and risks without blaming the user.

### This, not that

| This ✓ | Not this ✗ | Why |
|---|---|---|
| "Enter an email in the name@company.com format." | "Invalid input." | Explains how to fix the issue. |
| "Save changes." | "OK" | Makes the action predictable. |
| "This component requires `ds-tis/modal`." | "Behavior is automatic." | Makes runtime responsibility explicit. |
| "This version is not published yet." | "Coming soon." | Records a verifiable limit. |

## Visual identity

### Color

The default brand palette is blue and can be replaced through the white-label
contract. Components do not consume Foundation directly: they use Semantic or
Component tokens according to their anatomy.

| Role | Canonical token | Current value | Use |
|---|---|---|---|
| Brand fill | `foundation.color.brand.600` | `#0065ED` | CTA and brand surfaces with contrast foreground. |
| Brand content | `foundation.color.brand.700` | `#0050DA` | Text and links on light backgrounds, through Semantic. |
| Brand dark | `foundation.color.brand.400` | `#56A7FA` | Brand content on dark surfaces, through Semantic. |
| Neutral canvas | `foundation.color.neutral.50` | `#F8FAFC` | Light base; consumers use its Semantic counterpart. |

The Theme Playground seed is `#0056E0`; the engine generates the full scale and
audits contrast pairs before export.

### Typography

| Role | Family | Fallback | Use |
|---|---|---|---|
| Display and headings | Inter | system-ui, Segoe UI, Roboto, sans-serif | Titles and editorial hierarchy. |
| Body and controls | Inter | system-ui, Segoe UI, Roboto, sans-serif | Body text, labels and controls. |
| Code | DM Mono | JetBrains Mono, Fira Code, Cascadia Code, Consolas, monospace | Snippets, tokens and technical data. |

Use only published typography tokens. Do not simulate bold or italic and do not
compress type to fit labels.

### Logo

- **Primary version:** `docs/assets/logo-tis.svg`, for contexts with horizontal space.
- **Reduced version:** `docs/assets/logo-tis-mark.svg`, for the top bar, product avatars and favicons.
- **Color:** the reduced mark is white and must sit on a surface with sufficient contrast; do not recolor individual dots.
- **Clear space:** keep at least one symbol dot diameter (`1x`) around the mark.
- **Minimum digital size:** `24px` for the mark; the documentation top bar uses `36px`.
- **Misuse:** do not distort, rotate, change proportions, rearrange dots or apply effects that reduce legibility.

## Accessibility as a principle

The TIS Design System brand commits to WCAG 2.2 AA as a minimum:

- validated contrast in light and dark modes;
- functional keyboard navigation for every interactive component;
- semantics and states that screen readers can announce;
- reduced motion honored through `prefers-reduced-motion`;
- visible focus never removed or hidden;
- forced colors preserved for essential controls and states.

Exceptions must be recorded, have a known impact and must not be presented as
approved system behavior.
