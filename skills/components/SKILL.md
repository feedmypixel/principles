---
name: components
description: Read before creating or changing any UI component: decompose the design first, inventory-first reuse, the new-vs-variant-vs-composition decision, right-sized components, logic/display separation, lifting shared components, token discipline for family parity, component groups. The lego-brick discipline.
---

# Components

How components are created, reused, and grown. The model is **lego bricks**: a small set of
well-made pieces, combined everywhere — not a fresh sculpture per page. Styling rules live in
[the css skill](../css/SKILL.md) (a component renders from tokens alone); this doc covers when a component
exists at all, and where it lives.

> **The product's design system is the source of truth.** Where the consuming product ships
> its own design system — tokens, components, naming — build with and extend that. Everything
> here is the portable discipline around it.

## Decompose the design first

**Before building anything, slice the design into components on paper.** Look over the whole
design, draw boxes around the logical chunks — nav, card, filter bar — and name them. Then
build the pieces, then assemble. The pieces are the building blocks; pages become composition,
not construction.

- **Target medium-sized logical blocks** — a product card, a page header. Not a page-sized
  monolith, not a component per HTML tag.
- Each named box then goes through the inventory check below — decomposition tells you what
  you need; inventory tells you what already exists.
- If you can't name a box in a word or two, the boundary is probably wrong — re-slice.

## Inventory first — the hard rule

**Before creating any component, list the existing ones and justify why none fit.** Rebuilding
a component that already exists is the cardinal failure — two sources of truth that drift
apart, doubled maintenance, broken parity.

- Search the components directory _and_ the pages for near-misses before writing a line.
- A near-miss that's 80% right is a **variant or prop away** — extend it, don't fork it.
- If you can't articulate why every existing component fails, you haven't looked hard enough.

## New, variant, or composition — the decision

The recurring question: new component, variant of an existing one, or no component at all?
Work down this list; take the **first** match:

1. **Same thing, different look or state** → a **variant** of the existing component (a
   `variant`/`size` prop, a state class). A destructive button is not a new component.
2. **Same structure, different content** → the **same component** with different props/slots.
   Content never justifies a fork.
3. **Existing components arranged differently** → **composition at the call-site** — the page
   places and spaces them ([the css skill](../css/SKILL.md) § component/utility boundary). No new component
   until the _arrangement itself_ repeats; then it becomes a pattern component (e.g. a page
   header).
4. **Genuinely new markup + behaviour that repeats** → a **new component**, built from tokens.
5. **Genuinely new but used once** → **don't componentise yet** (YAGNI). Extract on second
   use — the repeat proves the boundary and shows which parts actually vary.

**The variant-bloat guard:** when variants multiply until the component is a pile of
conditionals, or two variants share almost nothing but a name — split. One component
straining to be two things is as wrong as two components pretending to be one.

## Right-sized — split when it hurts, not before

Component boundaries earn their cost. **Split on a real symptom, not on principle:**

- **Split when** the file is hard to hold in your head, the same markup repeats within it,
  or one part changes for reasons the rest doesn't (single responsibility — one job each).
- **Don't split** just because a component "feels long" or to make the tree look tidy.
  Over-fragmentation — a component per tag, prop-drilling through layers that add nothing —
  costs more than a slightly big component. A wrong abstraction is worse than duplication.

## Logic and display — keep them apart

**A component that fetches data, runs business logic, _and_ renders complex markup is doing
three jobs.** Keep data-loading and state in thin container/page-level code; display
components take simple props and render.

- Display components are the reusable ones — pure input → markup, trivially testable.
- Containers are per-use wiring — they rarely repeat, so they rarely need extracting.
- When a display component starts reaching out for its own data, that's the seam to split at.

## Where a component lives — lift on second use

- **Flat, shared components directory.** A component used by two or more consumers lives at
  the shared level — never nested inside one consumer's folder where the second consumer
  can't reasonably find or import it.
- **Nesting is for true private parts only** — a subcomponent that exists solely to break up
  its parent and is meaningless anywhere else. The moment anything else wants it, lift it.
- **Lifting is part of the change that needs it,** not a someday-refactor. Importing across
  consumers from a nested one-off location is the hack; the lift is the proper fix.

## Family parity — same tokens, same family

What makes independently-built components look like one product is **shared tokens, used
without exception**.

- **No magic numbers, no raw hex** — every space, size, colour, radius comes from the token
  set ([the css skill](../css/SKILL.md) § Conventions). A component with bespoke values is out of the family
  no matter how nice it looks alone.
- **Parity is a requirement, not an aspiration.** The same control looks and behaves the same
  everywhere it appears. Two sightings of "the same" component that differ is a bug — trace
  it to the fork or magic number and fix the source.
- **New components inherit the family by construction:** build from tokens and existing
  primitives and it matches; hand-roll values and it never will.

## Component groups

Some components aren't standalone — they travel as a **group** with shared vocabulary:

- **Form controls** — input, select, textarea, checkbox, radio share field anatomy, error
  treatment, spacing ([the forms skill](../forms/SKILL.md)). A new control joins the group's rules; it
  doesn't invent its own.
- **Pattern groups** — a page header, a card row, a filter bar: named arrangements that
  repeat across pages. Once an arrangement repeats, it's a pattern component, not copy-pasted
  layout.
- **Consistent API across siblings.** Same prop names for the same ideas (`size`, `variant`,
  `label`, `error`) across the whole set — a developer who's used one has used them all.

## Red flags — stop and check

- Building a page top-to-bottom without having sliced the design into components first.
- Writing a component without having listed the existing ones.
- A component per HTML tag — over-fragmentation; boundaries need a reason.
- A display component fetching its own data — logic and display split at the wrong seam.
- A px/hex value in a component style — token missing or ignored.
- Copy-pasting a component to change one thing — that's a variant.
- Importing from another consumer's nested folder — that's a lift.
- Two components with near-identical markup — that's one component.
- A "new" design that doesn't map to existing tokens — question the design before coding it.
