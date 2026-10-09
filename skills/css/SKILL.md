---
name: css
description: "Read before writing or refactoring CSS/styles: architecture, the component-vs-utility boundary, rem units, type/space scales, vertical rhythm. Portable rules — pull concrete values from the project's own tokens.css."
---

# CSS architecture

Tokens-first, scoped components, a shared scale. Modern CSS only — no SCSS, no BEM (scope
handles collisions). The rule everything else hangs off:

> **A component renders correctly from tokens alone — it never leans on a global class for its
> own identity.**

## Contents

- [The layer spectrum — the sweet spot](#the-layer-spectrum--the-sweet-spot)
- [The component / utility boundary — share by kind (WIP)](#the-component--utility-boundary--share-by-kind-wip)
- [Units — rem, not px](#units--rem-not-px)
- [The scales](#the-scales)
- [Vertical rhythm](#vertical-rhythm)
- [Readability](#readability)
- [Conventions](#conventions)
- [Overrides are a smell — fix the source](#overrides-are-a-smell--fix-the-source)
- [Know the box before you size it](#know-the-box-before-you-size-it)
- [Accessibility baseline](#accessibility-baseline)

## The layer spectrum — the sweet spot

Between "everything in scoped components" and "a full ITCSS global stack" there's a spectrum.
Where a product sits depends on how much genuinely-shared, classless styling it has — not on
dogma. Start minimal; add a layer only when repetition earns it (YAGNI).

**Always present:**

| Layer        | Holds                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------- |
| `tokens`     | custom properties — colour, type, space, radii, motion, focus. The only place raw hex lives. |
| `base`       | reset (Josh Comeau) + element defaults; body type from tokens.                               |
| `a11y`       | accessibility helpers only (`.visually-hidden`).                                             |
| _components_ | everything else — each component's scoped `<style>`, built from tokens.                      |

**Add only when repetition justifies it** (a value/layout repeated across many call-sites that
a token alone can't dry up):

| Layer       | Holds                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| `objects`   | layout primitives — `.stack` / `.cluster` / `.center` (Every-Layout vocabulary). |
| `utilities` | single-purpose classes — `.visually-hidden`, spacing helpers.                    |
| `patterns`  | named multi-property patterns — `.card`, `.page-header`.                         |

**The decision rule:** is the thing a **component** (markup + behaviour, repeats) or a
**classless layout primitive** used across many surfaces? Component or token covers almost
everything. Reach for an `objects`/`utilities`/`patterns` layer only when a genuinely classless
primitive repeats across surfaces and no token expresses it. A small, dense product may never
need them; a larger app with many composed pages will. Both are correct.

### Cascade layers (when you run the global stack)

One entry stylesheet declares the order and imports each concern into its layer:

```css
@layer tokens, base, objects, utilities, patterns;
```

Later layers win, so order is drift-proof — no specificity wars. **Scoped-CSS caveat:** a
component's scoped `<style>` lands in the _anonymous_ layer, which beats every named layer.
That's intended — components win over global utilities by design.

> Where there's no single document (e.g. a browser extension with a separate HTML entry per
> surface), "global" CSS is imported into each entry and the bundler dedupes. Same layers, no
> single global stylesheet.

## The component / utility boundary — share by kind (WIP)

The hard question in a scoped-CSS codebase: how do components share styling without coupling? The
answer isn't one mechanism — it's **matching the mechanism to the _kind_ of thing shared.**

| Shared thing                                                 | Mechanism                                 | Applied at                      |
| ------------------------------------------------------------ | ----------------------------------------- | ------------------------------- |
| a **value** (space, colour, type, radius)                    | **token**                                 | each consumer's own scoped rule |
| **structure + markup** that repeats (list, button, card)     | **component**                             | the component                   |
| **layout / composition between components** (stack, cluster) | **utility / layout object**               | the call-site (page/layout)     |
| a single-property tweak                                      | **utility**                               | the call-site                   |
| a state / variant                                            | the component's own rule (an _exception_) | the component                   |

Two rules fall out:

- **Components own their identity.** A component styles its own chrome in its scoped `<style>`,
  from tokens — it renders correctly without depending on a global class for _its own look_. That
  keeps it portable.
- **Composition lives at the call-site.** Layout and spacing _between_ components — `.stack`,
  `.cluster`, a grid — are applied by the parent placing them, not baked inside. That's not a
  boundary violation; it's the division of labour.

**The sharing contract:** a token or shared class means "change once, every consumer moves." That
lockstep is the _feature_ when you want it (brand padding, a label treatment) and the _footgun_
when you don't — so share what should move together, localise what shouldn't. Duplication is the
smell that you've missed a token or a component; a global class load-bearing _inside_ a component
is the smell that composition has leaked into identity.

This is essentially **CUBE CSS** (Composition · Utility · Block · Exception): tokens generate the
utility layer, composition handles the between-space, blocks are components, exceptions are state.
It sits between **utility-first** (Tailwind/shadcn — utilities everywhere, including inside
components) and **max-portability** (toofer — tokens the only shared surface); CUBE is the
pragmatic middle. The earlier strict line here — _"never a global class in a component"_ — was the
max-portability end: right for components you _distribute_, heavier than an app needs.

> **WIP — still settling (researching CUBE).** Open threads from building three live apps:
>
> - **"Few utilities" is normal, not a smell.** The count tracks app _shape_: a component-first
>   app (a feed) has almost no page-level call-sites, so utilities/objects/patterns stay sparse; a
>   page-composed app (forms, routes) grows real ones (`.auth-card`, `.button-group`, `.eyebrow`).
>   Holds at scale — even large, mature ITCSS/SASS codebases carry few utilities outside
>   components.
> - **Plain CSS is the real constraint.** Sharing a _value_ works (tokens); sharing _multi-property
>   structure_ that isn't a component doesn't — a token is one value, not a bundle. SASS does it
>   (`@mixin`, `%placeholder`); native CSS mixins/functions are coming. Small in practice — most
>   shared treatment is a token or a component.
> - **a11y helpers are an exception.** `.visually-hidden` used _inside_ components is sensible — an
>   a11y helper behaves like a base primitive, not a composition utility. Carve it out (allow a11y
>   helpers in components, or ship `<VisuallyHidden>`).
> - **Resolve by building.** Whether the utility/composition layer fills out as page-level surfaces
>   grow is the real test. Building tells us; theory won't.

### Responsive: container, not viewport

A self-contained component should respond to **its own container's** size, not the global
viewport — that's what makes it genuinely drop-anywhere. Use **container queries** (`@container`,
with `container-type: inline-size` on the parent) for component-internal responsive; reserve
viewport media queries for page/layout-level decisions. Viewport queries couple a component to
the page; container queries don't. Well-supported across modern browsers.

## Units — rem, not px

Scale values use **rem** so the UI scales with the user's browser font-size — an accessibility
win px can't give. With the root left at the browser default, `1rem = 16px` and
`0.0625rem = 1px`.

- **Never fix `font-size` on `html`.** Leave the root at the browser default so rem respects the
  user's setting. Put body text size on `body` (e.g. `font-size: var(--font-size-body)`), not on
  the root. Fixing the root to 17px silently inflates every rem by ~6% and overrides the user.
- **px is reserved for genuine device-pixel work:** `1px` hairline borders, shadow/focus
  offsets, fixed icon/control boxes, and the iOS-16px input floor (below 16px iOS Safari zooms
  on focus — a device threshold, not a scale value). Everything else is a token.

## The scales

Spacing, type, line-height and weight are **rem scales** in `tokens.css`. The tables below are
a **worked example, not a mandate** — set the actual numbers per product (a dense tool runs
tighter than a roomy app). Copy the _rule_, not the numbers.

**Spacing** — a rem scale on a small-px baseline (2px or 4px), widening as it climbs. Used for
`margin`, `padding`, and `gap`. Example (4px baseline):

| token         | rem  | px  |
| ------------- | ---- | --- |
| `--space-xs`  | 0.25 | 4   |
| `--space-sm`  | 0.5  | 8   |
| `--space-md`  | 0.75 | 12  |
| `--space-lg`  | 1    | 16  |
| `--space-xl`  | 1.5  | 24  |
| `--space-2xl` | 2    | 32  |
| `--space-3xl` | 3    | 48  |

**Type drives spacing.** Type and space are designed _together_ — the spacing scale harmonises
with the typographic hierarchy, not picked independently. Two valid anchors: a **geometric** set
(clean multiples of a 4px base, as above) or a **type-derived** set (the natural margins of your
type become the units — GOV.UK: "typography defines the spacing for everything else"). Either
way, spacing and type share one rhythm.

**Type** — a rem scale, named by role (mono/label/ui/body/headings). A _proportional_ set —
sizes related by a ratio rather than picked arbitrarily — which is what makes the hierarchy feel
harmonious (Boulton's typographic scale; Gerstner: the grid as a "proportional regulator"). It's
the same proportion-not-columns idea behind a typographic grid; dense UI hand-tunes the smallest
steps to dodge fussy half-pixels. **Line height** — tighter
for headings, looser for running copy (`1` single-line chrome · `1.2` headings · `1.4–1.45`
body · `1.55` notes). **Weight** — a named set (medium/semibold/bold/…). Set all per product in
`tokens.css`; the role names stay stable across products even when the numbers differ.

## Vertical rhythm

Snapping values _to_ the scale is what creates rhythm: spacing and type repeat instead of
drifting. Off-scale values (9, 11, 13px…) are the magic numbers the scale replaces — snap to
the nearest step.

- **Space comes from one side.** Prefer a parent `gap` or a consistent `margin-bottom`; don't
  fight margin-collapse with top+bottom on the same elements. Stacked form fields use a single
  `margin-bottom` so gaps stay uniform. (GOV.UK: aim for a uni-directional margin — keeps layout
  controllable, avoids unintended space.)
- **Group with proximity.** Related items get a small step; section breaks get a large one. The
  size _difference_ is what signals grouping, not a border.
- **Whitespace is deliberate.** Every gap is a token chosen for rhythm, never an eyeballed px.
- **Responsive spacing (optional).** Large steps may grow at larger breakpoints while small
  steps stay fixed — section margins breathe on desktop, touch-target paddings stay constant
  (the GOV.UK pattern). A per-product choice; mobile-first apps can skip it.

### Dense UI

Information-dense tools (dashboards, data grids, devtools, admin) tune rhythm differently from
roomy content apps. The modern approach — and the key shift — is that **the baseline grid is
effectively dead on the web**: rhythm comes from token discipline, not from snapping every text
baseline to a grid line (too fragile with mixed sizes, images, and components). Four moves:

- **Row height carries the rhythm.** Lists, tables, and feeds think in **rows** — fixed
  height tiers (e.g. 24/28/32px), each a base-unit multiple. Consistent row height _is_ the
  vertical rhythm in a data view. Density modes swap the row-height token, nothing else.
- **`line-height: 1` for chrome, `1.4–1.5` for copy.** Single-line elements (buttons, chips,
  labels, icon boxes) use unitless `line-height: 1` so their box height is predictable and
  grid-snappable; running copy keeps the relaxed leading. Line-height is the rhythm anchor.
- **Density as a token axis.** A `--density` setting (compact / default / comfortable)
  multiplies spacing + row-height tokens. Rhythm stays consistent because everything derives
  from one density-scaled source. Keep it separate from user font-zoom — density is a product
  choice, rem is the a11y axis.
- **`text-box-trim` for precise spacing (progressive enhancement).** `text-box-trim` +
  `text-box-edge` remove the invisible half-leading above/below text, so spacing tokens apply
  to the **visual glyph box**, not the line box — the precision a baseline grid used to chase.
  Chrome/Edge 133+, Safari 18.2+; **not Firefox yet**, so layer it on, never depend on it.

## Readability

- Body copy at the body size / normal leading; multi-line help at relaxed leading.
- Keep the measure (line length) sane — ~50–75 characters; cap text containers with a
  `max-width` rather than letting copy run the full surface width.
- **Leading follows measure.** Line-height scales _with_ line length: small measure, less
  leading; wide measure, more leading (Boulton). A wide column on tight leading loses the line
  return.
- Copy rules (sentence case, full stops, plain words) live in [the content skill](../content/SKILL.md).

## Conventions

- **No magic numbers** in component styles — reference a `--space-*` / `--font-size-*` /
  `--line-height-*` / `--weight-*` token. The only exception is true device-pixel values.
- **No hex outside `tokens.css`** (a `white` keyword for status glyphs is the allowed
  exception).
- **Tokens are the only shared surface** between components — never a shared class.
- **Full, descriptive class names** — the same standard as a JS variable. `.delete-button` not
  `.x`, `.optional` not `.opt`, `.icon` not `.ic`. Saving characters isn't worth making the
  reader decode.
- **Scoped `<style>` per component**; `:global(...)` is a scalpel for third-party injected
  markup only, always scoped (`.wrapper :global(.thing)`).

## Overrides are a smell — fix the source

An override that **cancels** rather than sets — `border-radius: 0`, `outline: none`, a `margin: 0`
that only undoes an inherited value — means an ancestor or global rule is over-reaching. Reach for
the source, not a counter-rule.

- **A component looking wrong is a global-layer bug until proven otherwise.** Before patching the
  component, check `base`/global rules — a too-broad selector (e.g. `a:focus-visible { border-radius }`
  rounding _every_ link on focus) is the usual culprit. Chasing it locally papers over it and leaves
  the next element of that kind still broken.
- **Omit, don't zero.** A fresh element needs no `border-radius: 0` — that line only exists to fight
  something inherited. If you're writing one, go find what you're fighting and narrow _it_.
- **Scoped styles already beat every named layer.** A component's scoped `<style>` is unlayered, so
  it wins over `@layer base/utilities/…` regardless of specificity. So when you're tempted to add a
  component override to beat a global, you usually _already_ win — and if you don't, the global is
  the thing to fix, not out-muscle. This is a layer/`display`-context question, not a specificity war.

## Know the box before you size it

How an element fills its space depends on whether it's a **block**, a **flex/grid item**, or
out-of-flow — they don't behave the same. Read the parent's `display` before reaching for a width.

- **`max-width` + `margin-inline: auto` centres a _block_** at up to that width. It does **not**
  stretch a **flex item** — a flex item shrinks to its content unless told otherwise (`width: 100%`,
  `flex: 1`, or cross-axis `align-self: stretch`). A child that "won't go full width" beside a sibling
  that does is almost always this: the working sibling has `width: 100%`/`flex`, the broken one only
  has `max-width`.
- **Align siblings by sharing the sizing mechanism, not by guessing widths.** If two elements should
  line up, give them the same recipe (same `width`/`max-width`/`margin`), don't hand-tune one to match.

## Accessibility baseline

Semantic HTML, `:focus-visible` outlines, a skip link, keyboard reachability, 4.5:1 contrast
(WCAG 2.1 AA). Respect `prefers-reduced-motion` and `prefers-color-scheme`. These are not
optional polish — they're part of "done".

**Keep DOM order = visual order** for focusable and meaningful content. Grid placement, `order`,
and `row-reverse` reposition visually but **not** tab or screen-reader order — those follow
source order, so a visual sequence that diverges from the DOM strands keyboard users. Don't let
the two split for interactive content (`reading-flow` / `reading-order` will help, but aren't
broadly supported yet).
