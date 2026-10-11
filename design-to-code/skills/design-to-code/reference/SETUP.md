# Setting up the design-to-code loop in your project

Reference implementations for the extract → diff → fix loop described in [the skill](../SKILL.md).
Two files are drop-in; two are contracts you implement for your app. Total setup is typically under
an hour, and Claude Code can do most of it — point it at this file.

## Contents

- [What ships here](#what-ships-here)
- [Install](#install)
- [1. Create the directory layout](#1-create-the-directory-layout)
- [2. Write the element map](#2-write-the-element-map)
- [3. Implement server.mjs — the boot contract](#3-implement-servermjs--the-boot-contract)
- [4. Implement seeds.mjs — the seed contract](#4-implement-seedsmjs--the-seed-contract)
- [5. Run it](#5-run-it)
- [6. Wire it into CI](#6-wire-it-into-ci)
- [Reading the output](#reading-the-output)
- [Element map reference](#element-map-reference)
- [Extending the harness](#extending-the-harness)

## What ships here

| File | Status | Job |
| --- | --- | --- |
| `extract.mjs` | **drop-in** | runs in the page (mock or build), returns one JSON spec per mapped element — type, colour, box, layout, text, structure, position |
| `diff.mjs` | **drop-in** | compares two specs with honest tolerances; reports defects and waivers |
| `design-check.mjs` | **adapt lightly** | the orchestrator — boots your app, seeds each surface, extracts both worlds per viewport, diffs, exits non-zero on unwaived defects |
| `element-map.example.json` | **example** | the schema for your own `design/element-map.json` |

The tolerances in `diff.mjs` are deliberate and match the skill: type, colour, layout and structure
compare **exact** (they are tokens — "close" means wrong token); spacing allows **±2px** (rendering
and rounding differ legitimately); width/height allow **±8%** (content differs between mock copy and
seeded data). Change them only with a reason you would put in a commit message.

## Install

```bash
npm install --save-dev playwright
npx playwright install chromium
```

Copy the three `.mjs` files into `scripts/design/` (or let Claude Code do it — the skill knows they
are here). Add the npm script:

```json
{
  "scripts": {
    "design:check": "node scripts/design/design-check.mjs"
  }
}
```

## 1. Create the directory layout

```
design/
  element-map.json      your element map (start from element-map.example.json)
  mocks-pinned/         stable copies of the mock HTML you diff against
scripts/design/
  design-check.mjs      the orchestrator (from here)
  extract.mjs           drop-in (from here)
  diff.mjs              drop-in (from here)
  server.mjs            you write — boots your app (step 3)
  seeds.mjs             you write — seeds app state per surface (step 4)
```

Copy each mock you build against into `design/mocks-pinned/` and never edit it there. The diff
target must not drift while you loop.

## 2. Write the element map

Start from `element-map.example.json`. One top-level key per surface; each surface names its mock
file, the built route, the viewports to compare at, and the elements to measure. Name elements by
role (`card.caption`, not `card.bigtext`) so the map survives restyling.

Open the mock in a browser, inspect it, and record a selector per element for the mock side and the
build side. Ten well-chosen elements per surface beats fifty noisy ones — start with the elements
the design's rulings actually name, plus the structural containers.

## 3. Implement server.mjs — the boot contract

`design-check.mjs` imports one function:

```js
export const bootApp = async () => {
  // start your dev server (or connect to one already running)
  return {
    baseUrl: 'http://localhost:5173',
    stop: async () => {
      // shut down whatever bootApp started
    }
  }
}
```

The simplest correct version spawns your dev server as a child process, polls `baseUrl` until it
answers, and kills the child in `stop`. If your dev server is always running locally, `bootApp` can
return the URL and a no-op `stop` — but CI needs the real thing.

## 4. Implement seeds.mjs — the seed contract

The check never extracts from whatever state the app happens to be in: every surface declares the
exact state it needs, and the seed produces it. This is what makes diffs repeatable, and
repeatable diffs are what make the gate trustworthy.

```js
export const seedBySurface = {
  home: async () => {
    // create a user + enough data to render the home surface the mock shows
    return {
      session: [/* Playwright cookie objects for a signed-in page, or omit */],
      builtRoute: '/',          // optional — overrides the map's builtRoute
      cleanup: async () => {}   // remove whatever this seed created
    }
  },
  'home-dark': async () => ({ cleanup: async () => {} })
}
```

How you seed is your app's business: hit a test-only API, insert database rows, or reuse your e2e
fixtures (if you have Playwright e2e tests, you likely already have everything this needs). Rules
that keep it honest:

- **One seed per distinct state.** Empty, one item, many items, error — each surface in the map
  names the state its mock shows, and gets a seed that produces exactly that.
- **Seeds create and clean up their own data.** A check you can run twice is a check you will run.
- **Never seed through the UI.** Clicking through forms to reach a state is slow and flaky; create
  state directly, then measure the page that renders it.

## 5. Run it

```bash
npm run design:check             # every surface in the map
npm run design:check home        # just one, while looping on it
```

Fix in the component, re-run, repeat until `0 defects`. The skill's loop rules apply: one group of
defects at a time (structure first — structural fixes collapse spacing defects), re-run after every
fix batch, cap the iterations, waive only with a written reason.

## 6. Wire it into CI

The diff only stops regressions if it runs on every PR. GitHub Actions sketch:

```yaml
design-check:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with: { node-version: 22 }
    - run: npm ci
    - run: npx playwright install --with-deps chromium
    - run: npm run design:check
```

If your seeds need a database, add its service container the same way your integration tests do.

## Reading the output

```
=== home @ 375 ===
waived (1):
  rail	waived	desktop rail ships in the next milestone; tracked in the plan
3 defects:
  card.caption	type.fontSize	mock 19px	built 28px
  card	box.height	mock 62px	built 175px
  card.meta	children	mock [span]	built [span, span]
```

Every line is two values — element, property, mock, built. A run that cannot express a difference
as two values has not measured it. `waived` lines print on every run so waivers stay visible
instead of rotting silently; delete a waiver the moment a new bundle or a better fix resolves it.

Exit code is non-zero when any **gating** surface has unwaived defects — that is what CI keys off.

## Element map reference

Per surface:

| Key | Required | Meaning |
| --- | --- | --- |
| `viewports` | yes | built-page widths to compare at, e.g. `[375, 1280]` |
| `mock` | yes | path to the pinned mock HTML, relative to the repo root |
| `builtRoute` | yes | route of the built page (a seed may override it) |
| `mockFrame` | no | selector scoping extraction when the mock wraps the screen in a frame |
| `mockViewportWidth` | no | mock page width if its frames need room (default 1600) |
| `mockSettleMs` | no | wait after mock load for fonts/animation to settle (default 1000) |
| `mockStyle` | no | CSS injected into the mock, e.g. tokens its export forgot to inline |
| `colorScheme` | no | `dark` to compare the dark theme (default `light`) |
| `viewportHeight` | no | built-page height (default 1000) |
| `gate` / `gateNote` | no | `false` reports without failing the run — for surfaces still converging |

Per element:

| Key | Required | Meaning |
| --- | --- | --- |
| `mock` / `built` | yes | the selector in each world (first match is measured; count is compared) |
| `origin` | no | `{ mock, built }` selectors; measures the element's edge offsets from that origin — catches "right thing, wrong place" |
| `exact` | no | box/edge properties to hold exact instead of tolerant, e.g. `["box.height"]` |
| `ignore` | no | `{ "property": "reason" }` — skip one property, reason reported every run |
| `waiver` | no | skip the whole element, reason reported every run |

## Extending the harness

Patterns that earn their place once a project grows into them, in the order they usually arrive:

- **Interactions** — a hook that clicks/hovers/focuses before extraction, for surfaces whose mock
  shows an open menu or a hover state. Give `runSurface` an optional `config.interaction` and a
  module that performs each named interaction on the built page.
- **A paired gallery** — screenshot mock and build side by side per surface into one scrollable
  page (the skill's step 5). The same Playwright pages the check already opens can
  `page.screenshot()` on the way through.
- **Theme sweep** — duplicate a surface with `colorScheme: "dark"` and a dark mock, rather than
  parameterising the harness; map entries stay greppable.
- **Auth variants** — seeds return different `session` cookies (signed out, member, admin) for
  surfaces whose mock differs by role.
