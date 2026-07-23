# Grid Principles for Web Design

<!-- source: claude-principles/snippets/grid-principles-full.md — edit there first. Full doc for surfaces that can't load the grid skill (e.g. Claude Design); Claude Code repos use the plugin's grid skill + snippets/grid-clause.md instead. -->

> **Only for products WITHOUT their own grid contract.** If the product has a grid doc /
> design-system tokens (columns, gutters, wells, spacing scale), paste THAT instead — its
> values win, and every number below (8-point, 12/8/4 columns, 16–24px gutters, 1200–1440px)
> is a generic example that will conflict with it.

A shared reference for how grids work and the rules we follow when building layouts. Keep these consistent across design and build so we're all working to the same system.

## Core Anatomy of a Web Design Grid

A layout grid is an invisible structure that divides the page into columns (and sometimes rows) so content aligns predictably. It's the skeleton every element snaps to.

**Columns** — the vertical tracks content sits in. The industry standard is a **12-column grid** on desktop, because 12 divides cleanly by 2, 3, 4, and 6, giving flexible, balanced layouts. Columns typically collapse to 8 on tablet and 4 (or 1) on mobile.

**Gutters** — the consistent gaps *between* columns that keep blocks of content from touching. Commonly 16–24px.

**Margins** — the outer space between the content and the edges of the viewport. These scale up on large screens to stop content stretching too wide.

**Modules / cells** — the rectangular units formed where columns and rows intersect. Useful for card layouts, product listings, and image galleries.

**Max width (content container)** — a cap on how wide the grid grows (commonly ~1200–1440px) so line lengths stay readable on large monitors; margins absorb the extra space.

## The 5 Rules for Working With Grids

1. **Apply the 8-point spacing system.** Standardise all margins, padding, and gutters on multiples of 8 (8, 16, 24, 32…). This creates consistent, proportional spacing across every screen size. Use 4px only for fine adjustments.

2. **Align, don't guess.** Every element — text, buttons, images — hugs a column edge or lines up with a module. Never eyeball spacing; enforce grid locking. This applies vertically too: keep a consistent baseline rhythm so vertical gaps are as deliberate as horizontal ones.

3. **Use hierarchy through column spans.** Not all content is equal. Give primary elements (hero, CTA) wider spans (e.g. 8 of 12); secondary content gets narrower spans (e.g. 4 of 12). The grid itself expresses importance.

4. **Implement fluid responsiveness.** Design mobile-first and define how the 12-column grid reflows at each breakpoint. A 3-column desktop layout (4 columns each) should collapse gracefully to 1-column (12 columns) on mobile. Set explicit breakpoints for mobile, tablet, and desktop, and cap the content width so line length stays readable on large screens.

5. **Break the grid intentionally.** Deliberate deviations catch the eye — a full-bleed banner or edge-to-edge background adds impact. But it must be deliberate: the core content and features stay firmly inside the grid. Never break it by accident.

## Implementation Notes

- **Build with CSS Grid and Flexbox natively.** CSS Grid for two-dimensional page/section layout; Flexbox for one-dimensional component alignment.
- **Use design tokens** for columns, gutter, margin, and breakpoints so design and code share the same values.
- **Match the design tool to the build.** Set up the same 12-column fluid grid in Figma (layout grids / constraints) that we implement in CSS, so handoff is 1:1.
- **Consider container queries** for components that should respond to their container's width rather than the viewport.

## Quick Reference

| Token | Typical value |
|---|---|
| Columns (desktop / tablet / mobile) | 12 / 8 / 4 |
| Gutter | 16–24px |
| Spacing scale | Multiples of 8 |
| Max content width | ~1200–1440px |
| Breakpoints | mobile / tablet / desktop |
