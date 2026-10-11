# design-to-code

Turn a design handoff into production code that **looks like the design** — not merely code that satisfies a list of sentences about the design.

Written for [Claude Design](https://claude.ai/design) → Claude Code handoffs; works with any design tool that exports self-contained HTML mocks.

## The idea

An HTML mock is a queryable DOM. Extract computed styles and structure from the mock and from your built page with the same script, diff the two, and "does it look right" stops being an opinion — it's a defect list with two numbers per line that must reach **zero** before the skill lets you say done.

```
mock (HTML)  ──extract──►  spec.json  ──┐
                                        ├──►  diff  ──►  defect list (numbers)
built page   ──extract──►  built.json ──┘                      │
      ▲                                                        │
      └────────────────────  fix  ◄────────────────────────────┘
                      loop until the diff is empty
```

The failure it prevents: every audit row ticked with file:line evidence, every reviewer agreeing — and the shipped page still obviously not the design the moment you put mock beside build. Rules verified in isolation don't add up to a page that matches; an empty diff does.

## What's inside

One skill (`design-to-code`) covering: intake checks (is the bundle machine-comparable?), the element map, Playwright-driven extraction, diff tolerances, the fix loop with capped iterations and reasoned waivers, a paired mock-beside-build gallery for what numbers can't catch, honest reporting language, and the whole standing installation the loop runs inside - seeded surfaces, pinned mocks, waiver hygiene, a drops round-trip back to the designer, and the diff as a CI gate.

**Plus reference implementations**, so setup is a copy rather than a build
([`reference/`](./skills/design-to-code/reference/)): `extract.mjs` and `diff.mjs` drop in unchanged,
`design-check.mjs` adapts to your app through two small contracts (boot + seeds), and
[`SETUP.md`](./skills/design-to-code/reference/SETUP.md) walks the whole thing - element map schema, CI
wiring, how to read the output. Point Claude Code at SETUP.md in a fresh repo and it can stand the loop up.

Pairs well with the [`principles`](../principles/README.md) plugin — its progressive-enhancement, grid, components, and testing-strategy skills cover what the mock can't show.

## Install

```
/plugin marketplace add feedmypixel/principles
/plugin install design-to-code@principles
```
