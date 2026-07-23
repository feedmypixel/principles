---
name: grid
description: Read before building any page or section layout: grid anatomy (columns, gutters, margins, max width), hierarchy through column spans, responsive reflow, breaking the grid intentionally. Portable rules — pull concrete values from the project's own tokens.css.
---

# Grid

**How to use grids well in your design system / site / app — not a set of grid values.** A
layout grid is the invisible skeleton the page snaps to — columns (and sometimes rows) that
make alignment predictable instead of eyeballed. Keep the same grid in design and build so
handoff is 1:1. Spacing and rhythm values come from the scales in
[the css skill](../css/SKILL.md); this doc covers the structure they hang on.

> **This skill works with the design system you already have — it never overwrites it.**
> Where the product has its own grid values — tokens, column counts, gutters, breakpoints,
> whether home-grown or a vendor system — those values win, whatever they are (a 58px-column
> system with 8/10/12 wells is as valid as any 12-column textbook grid). The numbers in this
> doc are **best-practice starting defaults for a product that has none** — never a target
> to migrate an existing system towards.

## Anatomy

- **Columns** — the vertical tracks content sits in. **12 on desktop** is the common default
  because 12 divides cleanly by 2, 3, 4, and 6 — but your design system's count is the right
  one, whatever it is. Column count typically drops on smaller viewports.
- **Gutters** — the consistent gaps _between_ columns. A `--space-*` token, not a bespoke
  value.
- **Margins** — the outer space between content and viewport edge. Scale up on large screens
  so content doesn't stretch too wide.
- **Modules / cells** — the rectangles where columns and rows intersect. The unit for card
  layouts, listings, galleries.
- **Max width** — a cap on how wide the grid grows so line length stays readable; margins
  absorb the extra. (Measure detail in [the css skill](../css/SKILL.md) § Readability.)

All of these are **tokens** — columns, gutter, margin, breakpoints, max width live in
`tokens.css` so design and code share one set of values. Where values appear in this doc
(12-column, ~1200–1440px cap, gutters around 16–24px), they're **defaults for starting from
scratch** — a product with existing values keeps them.

## The rules

1. **Spacing comes from the scale.** Every margin, padding, and gutter is a `--space-*` token
   from the product's scale ([the css skill](../css/SKILL.md) § The scales) — never an eyeballed value. One
   scale everywhere is what makes spacing feel proportional across screens.

2. **Align, don't guess.** Every element — text, button, image — hugs a column edge or lines
   up with a module. Vertically too: gaps snap to the space scale so vertical rhythm is as
   deliberate as horizontal alignment ([the css skill](../css/SKILL.md) § Vertical rhythm).

3. **Hierarchy through column spans.** Not all content is equal. Primary elements (hero, main
   CTA) take wider spans (e.g. 8 of 12); secondary content takes narrower (e.g. 4 of 12). The
   grid itself expresses importance — before colour or size have to.

4. **Fluid responsiveness, mobile-first.** Define how the grid reflows at each breakpoint: a
   3-across desktop row (4 columns each) collapses gracefully to 1-column on mobile.
   Breakpoints are explicit tokens, not ad-hoc per component. Cap content width so line
   length holds on large screens.

5. **Break the grid intentionally.** A full-bleed banner or edge-to-edge background catches
   the eye _because_ everything else holds the grid. Deviations are deliberate and rare; core
   content stays firmly inside. Never break it by accident.

## Implementation

- **CSS Grid for two-dimensional** page/section layout; **Flexbox for one-dimensional**
  component alignment. Native, no grid framework.
- **Placement is composition — it lives at the call-site.** The page/layout places components
  onto the grid; a component never bakes its own grid position inside
  ([the css skill](../css/SKILL.md) § component/utility boundary).
- **Components respond to their container**, not the viewport — container queries for
  component-internal responsive; viewport breakpoints are for the page-level grid reflow
  ([the css skill](../css/SKILL.md) § Responsive).
- **Match the design tool to the build.** The same grid set up in Figma (layout grids /
  constraints) as implemented in CSS — same columns, gutters, margins, breakpoints — so
  design and build never drift.

## Quick reference — starting defaults only

**Skip this table if the product already defines its grid** — use its values. These are
reasonable defaults for a product starting with nothing:

| Token                                | Starting default                         |
| ------------------------------------ | ---------------------------------------- |
| Columns (desktop / tablet / mobile)  | 12 / 8 / 4                               |
| Gutter                               | a `--space-*` step (~16–24px territory)  |
| Spacing                              | the product's space scale                |
| Max content width                    | ~1200–1440px                             |
| Breakpoints                          | mobile / tablet / desktop, tokenised     |
