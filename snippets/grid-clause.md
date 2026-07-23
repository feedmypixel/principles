# Grid clause — paste verbatim into a product's CLAUDE.md / project instructions

Copy everything below the line into the consuming product's always-on context (Claude Code
`CLAUDE.md`, Claude Design project instructions). Fill in the grid-contract pointer for that
product. Edit here first, then re-paste to each copy.

The clause is deliberately **value-free**: every number (spacing base, columns, gutters,
wells, breakpoints) comes from the product's own grid contract and tokens. Pasting example
values as rules into a product that has its own system puts the two in permanent conflict.

---

## Grid — non-negotiable

<!-- source: claude-principles/snippets/grid-clause.md — edit there first -->

**The grid contract is `<path to the product's grid doc, e.g. docs/design/grid.md>`** — its
columns, gutters, wells, breakpoints, and spacing tokens are the only valid values. Read it
before any layout work.

1. **Spacing comes from the product's scale.** Every margin, padding, and gap is a spacing
   token. Never an off-scale or hand-picked value.
2. **Align, don't guess.** Everything sits on column lines or module edges per the contract;
   vertical gaps snap to the scale too.
3. **Hierarchy via column spans.** Primary content takes wider spans, secondary narrower —
   expressed as spans per breakpoint, never ad-hoc ratios.
4. **Mobile-first fluid reflow** at the contract's breakpoints and column counts.
5. **Break the grid only on purpose.** Full-bleed is deliberate and rare; core content stays
   on grid.
