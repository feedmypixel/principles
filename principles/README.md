# principles

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code plugin](https://img.shields.io/badge/Claude%20Code-plugin-d97757.svg)](https://docs.claude.com/en/docs/claude-code/plugins)

**Make Claude Code build to your engineering principles — loaded on demand, not crammed into context.**

Portable web/engineering principles — components, content, CSS, docs, forms, grid, progressive enhancement, UX, testing, PR discipline — packaged as a Claude Code plugin. Each principle is a skill: it loads only when a task touches that area (writing CSS pulls in the css skill, raising a PR pulls in pull-requests), so sessions carry the rules they need and none they don't.

**Rules are portable; values are per-product.** Each principle carries the rule + the reasoning (and at most a worked
example scale, clearly marked). Pull the concrete numbers from the consuming repo's own `tokens.css` — never copy values
between products.

## Contents

- [What's inside](#whats-inside)
- [Install](#install)
- [Updating](#updating)
- [How they're written](#how-theyre-written)
- [License](#license)

## What's inside

| Skill                     | Covers                                                                                                                                         |
|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `components`              | decompose the design first, inventory-first reuse, new-vs-variant-vs-composition, right-sizing, logic/display split, family parity through tokens |
| `content`                 | UI copy — sentence case, the GOV.UK full-stop rule, verb-first errors, buttons that say what they do, one term per thing                       |
| `css`                     | architecture, the component/utility boundary, rem units, the scales, vertical rhythm                                                           |
| `docs`                    | repo documentation — TOCs kept current, brevity, heading discipline, sparing callouts, descriptive links                                       |
| `forms`                   | design, UX, client + server validation, the component set, copy                                                                                |
| `grid`                    | grid anatomy (columns, gutters, margins, max width), hierarchy through spans, responsive reflow, breaking the grid intentionally              |
| `progressive-enhancement` | resilience, speed, share-don't-duplicate, the no-JS subset                                                                                     |
| `pull-requests`           | watch PRs to green — poll checks, fix failures, flake-vs-real triage, visual-baseline regen, cross-repo merge order                            |
| `ux`                      | never dead-end the user, one clear primary action, respect the user's state, buttons do / links go                                             |
| `testing-strategy`        | pyramid vs trophy, confidence-per-cost, e2e for critical flows only, integration (real DB, no mocks) as the bulk, behaviour not implementation |

`snippets/` holds paste-into-context versions of the grid rules for surfaces that can't load skills
(e.g. Claude Design project instructions).

## Install

Add the marketplace once, then enable the plugin per repo:

```bash
/plugin marketplace add feedmypixel/principles

/plugin install principles@principles
```

Enable scope:

- **local** (`.claude/settings.local.json`, gitignored) — just you, just this repo.
- **project** (`.claude/settings.json`, committed) — anyone who clones the repo inherits it.

Repos that don't install it — zero footprint. That's the point of a plugin over global config:
opt-in per repo, versioned, updatable from one place.

## Updating

```bash
/plugin marketplace update principles

/plugin update principles
```

(Two separate commands — slash commands can't be `&&`-chained.) Then a fresh session or `/clear` —
the skill list is snapshotted at session start.

## How they're written

Living documents, forged while building — not authored up front. When building reveals a better rule or a gap, the doc
changes here first, then flows out to the products. Sections still settling are marked **WIP** or **Draft** inline.

## License

[MIT](LICENSE).
