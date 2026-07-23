---
name: testing-strategy
description: Read before writing tests or shaping a test suite: pyramid vs trophy, confidence-per-cost, e2e for critical flows only, integration (real DB, no mocks) as the bulk, test behaviour not implementation.
---

# Testing strategy

> **Status — Draft.** Living document. The stance is settled; the per-layer detail sharpens as the products exercise it.

How to spend testing effort. The goal isn't "more tests" — it's **confidence per pound**: the most assurance the code works, for the least cost to write, run, and maintain.

## The two models — pyramid and trophy

Two well-known shapes describe how to distribute tests:

- **The Testing Pyramid** (Mike Cohn / Martin Fowler) — a wide base of **unit** tests, fewer **integration** tests, a thin cap of **end-to-end** tests. Rationale: lower tests are faster and more isolated, so push volume down.
- **The Testing Trophy** (Kent C. Dodds) — **static** analysis at the base, then **unit**, then a **fat middle of integration** tests, then a thin **e2e** cap. Rationale: _"Write tests. Not too many. Mostly integration."_ Integration tests give the most confidence per test because they exercise units working together the way the app actually runs.

They agree on the cap (**e2e is thin**) and disagree on the bulk: the pyramid leans unit-heavy, the trophy leans integration-heavy.

## The stance we build to

**Closer to the trophy.** The principle underneath both is the real rule:

> **e2e tests are the most valuable _and_ the most expensive.** They give the highest confidence (they prove the whole stack works together) but cost the most to write, are the slowest to run, and are the most brittle. So they are reserved for **critical user flows only** — never a mirror of the behaviour suite.

From most-confidence-per-cost downward:

1. **Static** (free, instant) — types + lint catch a whole class of bugs before a test runs. The base.
2. **Unit** (cheap, fast) — pure logic, components in isolation, edge cases. Broad coverage of the fiddly bits.
3. **Integration** (the bulk) — units working together against **real** collaborators (a real database, not a mock). The best confidence-per-test; where most behaviour coverage should live.
4. **e2e** (scarce, precious) — a handful of **critical flows** through the whole running system. Proves the wiring; does not re-test behaviour the lower layers already cover.

## Rules

- **e2e = critical flows only.** The front door (sign-up / sign-in), the core loop (the one or two things the product exists to do), and each cross-system path. If an e2e test would only re-check logic a unit/integration test already covers, it doesn't belong.
- **Don't mock the database in integration tests.** Hit a real one. A mock that drifts from real DB behaviour gives false confidence — the exact thing integration tests exist to prevent.
- **Test behaviour, not implementation.** Assert what the user/caller observes, not internal structure. Implementation-coupled tests break on refactors that didn't change behaviour — they cost without protecting.
- **Push coverage down.** Before writing an e2e, ask whether an integration or unit test would catch the same regression cheaper. Usually it would.
- **The expensive layer stays thin on purpose.** Resisting the urge to grow e2e is a discipline, not an oversight. More e2e = slower CI, more flakes, more maintenance — for confidence the cheaper layers already bought.

## How stat applies it

The four CI/test layers map straight onto the model:

| Layer           | Stat instantiation                                                                                       | Scope                 |
| --------------- | -------------------------------------------------------------------------------------------------------- | --------------------- |
| **Static**      | `tsc` / `svelte-check` + ESLint (both repos)                                                             | every file            |
| **Unit**        | Vitest — server (Node) + client (browser component) projects                                             | broad                 |
| **Integration** | `stat-api` integration tests against a **real Postgres** service container (e2e-CI Layer 1)              | the bulk of behaviour |
| **e2e**         | Playwright — full suite locally pre-PR; the `@smoke`-tagged **critical path** cross-repo in CI (Layer 3) | critical flows only   |

- The **`@smoke` tag** marks the critical-flow e2e specs — they're part of the normal e2e suite (not a separate folder); CI runs `--grep @smoke`. The smoke set grows **one spec per cross-repo critical path** as features land (sign-up, friends, invites, feed, channels), never a mirror of the full suite. See `tasks/prd-e2e-ci.md`.
- Integration coverage lives in `stat-api` against real Postgres — that's the fat middle, by design.

## References

- Martin Fowler — _The Practical Test Pyramid_.
- Kent C. Dodds — _The Testing Trophy and Testing Classifications_ (_"Write tests. Not too many. Mostly integration."_).
- `tasks/prd-e2e-ci.md` — the CI layering + the smoke mechanics that implement this stance.
