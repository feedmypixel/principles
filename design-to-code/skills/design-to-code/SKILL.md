---
name: design-to-code
description: "Use when turning a design handoff into production code - a Claude Design (claude.ai/design) bundle, or any handoff that ships self-contained HTML mocks. Triggers: do the design to code, process this handoff, build this design. Drives intake → element map → extract → diff → fix loop → gates, and refuses to report done without evidence."
---

# Design to code

Turn a design handoff into production code that **looks like the design**, not merely code that satisfies a list of sentences about the design. Written for Claude Design (claude.ai/design) handoffs; works with any design tool that exports self-contained HTML mocks.

## Vocabulary

| term | meaning |
|---|---|
| **bundle** | one design export: self-contained HTML per screen *and per state*, plus the design-system export (tokens, fonts) |
| **changelog** | the designer's prose notes accompanying a bundle — what changed and why |
| **ruling** | one specific written design decision ("caption steps to 19px/800") |
| **audit row** | one checklist line derived from a ruling, ticked with file:line evidence |

> [!IMPORTANT]
> **The failure this skill exists to prevent.** A handoff ticked all 57 audit rows with file:line evidence and still shipped a card that stacked a figure the design put on one line, striped rows where the design used bordered cards, and a floating button over the tab bar. A real project ran six bundles this way: hundreds of rows ticked, multiple reviewers confirming rulings, every audit green — and the owner rejected every build on sight, because the pages simply did not look like the designs.
>
> Every one of those defects is obvious the instant you put the mock beside the build, and **invisible row by row**. Rules verified in isolation do not add up to a page that matches.
>
> The fix is not more diligence. It is a **diff that must be empty before you are allowed to say done.**

## The spine: extract → diff → fix → repeat

Everything else in this file serves this loop. If you do nothing else, do this.

```
  mock (HTML)  ──extract──►  spec.json  ──┐
                                          ├──►  diff  ──►  defect list (numbers)
  built page   ──extract──►  built.json ──┘                      │
        ▲                                                        │
        └────────────────────  fix  ◄────────────────────────────┘
                        loop until the diff is empty
```

**Why this works:** design tools that ship self-contained HTML give you a DOM. You can query the mock exactly as you query your own page. That converts "does it look right" from an opinion nobody offers into a set of numbers that cannot be fudged.

**If the handoff ships images instead of HTML, say so immediately and ask for renders.** Without a queryable mock the loop degrades to eyeballing, which is what failed before. This is the single most important thing to check at intake.

## Step 0 — intake, before any code

1. **Is the bundle machine-comparable?** Self-contained HTML/JSX per screen *and per state*, plus the design-system export (tokens, fonts). Missing → ask for a re-export; do not work around it.
2. **Read the changelog, but treat the render as the authority.** Prose lags and flattens. Where they disagree the render wins; where the render is ambiguous, ask the designer. Never paraphrase a guess into a task.
3. **Diff against the previous bundle** (`diff -r`) and read every changed file. The changelog is an index, not truth.
4. **Scope check.** Count the surfaces. One surface, finished, beats four surfaces layered — layering is how an app ends up an average of five design directions instead of the newest one.

## Step 1 — the element map (write once per surface, reuse forever)

The only manual step in the loop. A file pairing a semantic name with the selector in each world:

```json
{
  "surface": "home",
  "viewports": [375, 1440],
  "mock": "…/Home.html",
  "mockFrame": ".frame-1440",
  "elements": {
    "page.title":        { "mock": ".compose h2",        "built": ".composer h1" },
    "composer.field":    { "mock": ".compose .field",    "built": ".composer .field" },
    "composer.submit":   { "mock": ".compose .post",     "built": ".composer button[type=submit]" },
    "card":              { "mock": ".feed .card",        "built": ".feed .post-card" },
    "card.emoji":        { "mock": ".feed .card .em",    "built": ".feed .post-card .em" },
    "card.caption":      { "mock": ".feed .card .cap",   "built": ".feed .post-card .caption" },
    "card.meta":         { "mock": ".feed .card .meta",  "built": ".feed .post-card .meta" },
    "rail":              { "mock": ".rail",              "built": "nav.rail" }
  }
}
```

Rules:
- **Name by role, not by looks** (`card.caption`, not `card.bigtext`) so the map survives restyling.
- **Every element the design names in a ruling gets an entry.** If a ruling says "caption steps to 19px/800", `card.caption` must be mappable or you cannot prove it.
- **An element you cannot map is a finding**, not a shrug: either the build is missing it, or it is built as something structurally different. Report it.

## Step 2 — extract

Run one script against both worlds and emit the same shape. Per mapped element, capture at minimum:

| group | properties |
|---|---|
| type | `font-size`, `font-weight`, `line-height`, `letter-spacing`, `text-transform` |
| colour | `color`, `background-color`, `border-color` (resolved, not the token name) |
| box | `padding`, `margin`, `gap`, `width`/`height`, `border-radius`, `border-width` |
| layout | `display`, `flex-direction`, `align-items`, `justify-content` |
| structure | child count, child roles in order, whether the element exists at all |

Structure matters as much as type: *"meta rows: mock 1, built 2"* is the defect that makes a card look amateur, and no single property reveals it.

Capture at every viewport in the map, and in every theme the project ships.

## Step 3 — diff, with honest tolerances

| kind | tolerance | why |
|---|---|---|
| type scale, weight, colour | **exact** | these are tokens; "close" means wrong token |
| spacing, radius | **±2px** | rendering and rounding differ legitimately |
| element existence and order | **exact** | never a rounding issue |
| computed box height | **±8%** | content differs between mock and real data |

Output one line per defect, always with both numbers:

```
card.caption      font-size   mock 19px   built 28px
card              height      mock 62px   built 175px
card.meta         rows        mock 1      built 2
card.reaction     position    mock inline-end, centred   built own row
staleness         element     mock text node             built <span class="dot">
```

**A defect list of adjectives is a failed run.** If you cannot express it as two values, you have not measured it.

## Step 4 — fix, then re-run. Loop.

- Fix in the **component**, never at the call site. A page-local override is a defect that will regress.
- Change one group at a time (type, then spacing, then structure) and re-run. Structural fixes often collapse a dozen spacing defects.
- **Re-run after every fix batch.** The loop is the control; a fix you did not re-measure is a guess.
- **Exit condition: the diff is empty.** Not "the remaining ones are minor". If a defect is genuinely intended — the project's tokens deliberately differ from the mock — record it as an explicit, reasoned waiver in the map (`"waiver": "project radius scale has no 5px step; uses 4px"`), so it stops appearing and the reason survives.
- **Cap the iterations** (5 is plenty). If it will not converge, stop and report exactly which defects resisted and what you think is structurally in the way. Never loop silently forever, and never declare done with a non-empty diff.

## Step 5 — the paired gallery (what numbers cannot catch)

Numbers miss: visual balance, whether the eye lands in the right place, whether something *feels* cheap, whether the composition reads as the same design.

- Render **mock left, built right, same viewport, 1:1**, one pair per surface per viewport per theme, into a single scrollable page.
- **Run it before the first fix as well as after** — the "before" tells you what already matches, so you build less.
- **Look at it yourself.** Then attach it to the PR so a human can. A gallery generated and not viewed is theatre.
- Deliberately *not* an end gate — as an end gate it gets skipped when time is short.

## Step 6 — make it stick

- **The diff runs in CI on every PR.** That is what stops the next handoff regressing this one. A checklist item you can skip is not a control; a test that fails is.
- **The element map and the waivers live in the repo**, reviewed like code.
- **A new bundle re-extracts the spec.** The target moves when the designer moves it, automatically — nobody transcribes numbers by hand.

## Reporting

Never "it renders", never "first pass", never "matches the design". State the gate first, then counts:

> **Spec diff: 0 defects across 6 surfaces × 2 viewports × 2 themes.** Gallery walked, 12 pairs, 2 flagged for the owner (composer field width, empty-state illustration). 41/41 audit rows ticked. Outstanding: none.

or honestly:

> **Spec diff: 7 defects remain after 5 iterations.** 5 are the card structure (the built card has a third row the design does not have — needs `CardActionRow` restructured, not a CSS change). 2 are colour, blocked on a token the DS does not have — question for the designer, raised.

## Everything the design will not say

The loop verifies what the mock shows. It cannot verify what the mock omits. These remain audit rows and are still your job (the [principles plugin](https://github.com/feedmypixel/principles) covers most of them in depth — its `progressive-enhancement`, `grid`, `components`, and `testing-strategy` skills pair well with this one):

- **States**: empty, loading, error, hover, focus-visible, active, disabled, first-run. The interactive half is the half that silently does not get built.
- **Accessibility**: contrast in both themes, keyboard operability, focus management in and out of overlays, `aria-current`/`aria-expanded`/`aria-sort`, never nesting interactive elements, reduced-motion variants for every transition.
- **Responsive**: container queries not JS viewport switches; breakpoints from the grid contract, not numbers in the mock.
- **Progressive enhancement**: semantic HTML that works before it is enhanced; server-side data loading; forms through form actions.
- **Engineering**: one responsibility per component; no speculative abstraction; typed without `any`; no silent failures; performance (lazy-load heavy things, destroy on unmount, no layout shift).
- **Data**: extend seeds/fixtures so every state the design shows can actually be produced locally. You cannot judge a page you cannot populate.
- **Regression net**: when a shared component gains capability, cover its *other* consumers too, make sure each is in the component catalogue so visual regression photographs it, and say in the PR which existing pages the change now drives.

## Component decisions

Before building anything, decide **reuse, extend, or new** — and record the reasoning:

- **EXISTS** — a component already does this. Mount it, pass props. Grep the components tree before ever writing new.
- **EXTEND** — nearly does it. Extend the *component*, never the call site, and **migrate every existing consumer in the same change**. A shared component with an un-migrated sibling is worse than none.
- **NEW** — genuinely new. Ships with tests and a catalogue entry in the same change.

Two pages showing the same thing is one component with different props, not two components that happen to look alike.

## Authority and escalation

- Component calls are yours; make them, record why.
- Where the design and the codebase genuinely conflict on **intent**, that is a question for the product owner — not a silent divergence and not a quiet register entry.
- Where the design is ambiguous, ask the designer. A guess written into a task is how a ruling gets "done" without being built.
- Concrete values are the project's: a design naming a shadow or radius the project has no token for is telling you its intent, not its implementation.

## Handover

Hand over on the **defect list and the map**, never on prose. They carry what is measured, what is waived and why, and what remains — so the next session resumes without re-deriving anything, and a long session cannot quietly lower its own bar.
