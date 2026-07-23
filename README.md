# claude-principles

The canonical engineering principles I build to — CSS, forms, progressive enhancement, UX, testing — packaged as a
Claude Code plugin so any repo can opt in, and an update in one place flows to all of them.

**Rules are portable; values are per-product.** Each principle carries the rule + the reasoning (and at most a worked
example scale, clearly marked). Pull the concrete numbers from the consuming repo's own `tokens.css` — never copy values
between products.

## What's inside

Each principle is a skill (loaded on demand, when a task touches that area):

| Skill                     | Covers                                                                                                                                         |
|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `components`              | inventory-first reuse, new-vs-variant-vs-composition, lifting on second use, family parity through tokens — the lego-brick discipline          |
| `content`                 | UI copy — sentence case, the GOV.UK full-stop rule, verb-first errors, buttons that say what they do, one term per thing                       |
| `css`                     | architecture, the component/utility boundary, rem units, the scales, vertical rhythm                                                           |
| `docs`                    | repo documentation — TOCs kept current, brevity, heading discipline, sparing callouts, descriptive links                                       |
| `forms`                   | design, UX, client + server validation, the component set, copy                                                                                |
| `grid`                    | grid anatomy (columns, gutters, margins, max width), hierarchy through spans, responsive reflow, breaking the grid intentionally              |
| `progressive-enhancement` | resilience, speed, share-don't-duplicate, the no-JS subset                                                                                     |
| `pull-requests`           | watch PRs to green — poll checks, fix failures, flake-vs-real triage, visual-baseline regen, cross-repo merge order                            |
| `ux`                      | never dead-end the user, one clear primary action, respect the user's state, buttons do / links go                                             |
| `testing-strategy`        | pyramid vs trophy, confidence-per-cost, e2e for critical flows only, integration (real DB, no mocks) as the bulk, behaviour not implementation |

## Install (opt-in, per repo)

This is a **local-first** marketplace — no public publish required. Add it once, then enable it only in the repos you
want:

```bash
# from a local clone…
/plugin marketplace add ~/Projects/claude-principles
# …or from the private GitHub repo
/plugin marketplace add feedmypixel/claude-principles

/plugin install claude-principles
```

Enable scope:

- **local** (`.claude/settings.local.json`, gitignored) — just you, just this repo.
- **project** (`.claude/settings.json`, committed) — anyone who clones the repo inherits it.

Work repos simply don't install it — zero footprint.

## Updating

One source of truth, one push, a refresh per repo:

1. Edit a skill here (the rule changes here **first**, then flows to the products).
2. **Bump `version` in `.claude-plugin/plugin.json`** — `/plugin update` is version-keyed; content changes
   without a bump report "nothing to update".
3. `git commit && git push`.
4. In each consuming repo, two separate commands (slash commands can't be `&&`-chained):
   `/plugin marketplace update claude-principles`, then `/plugin update claude-principles`.
5. Fresh session (or `/clear`) — the skill list is snapshotted at session start.

How the update lands depends on how the marketplace was added (`/plugin marketplace list` shows the source):

- **Local path** (`~/Projects/claude-principles`) — update reads the directory on disk. Unpushed commits (and any
  untracked files under `skills/`) ship as-is.
- **GitHub** (`feedmypixel/claude-principles`) — update pulls the remote, so push first or nothing new arrives.

## Why a plugin (not symlinks, not global)

- **Symlinks** are per-machine and break on clone.
- **Global `~/.claude/`** applies everywhere — wrong for principles a work repo shouldn't get.
- A plugin is **opt-in per repo**, **versioned**, and **updatable from one place**. The always-on bits (the
  comment-discipline hook, the global `CLAUDE.md`) stay global by design — they're wanted everywhere; these principles
  are the deeper, opt-in layer beneath them.

## How they're written

Living documents, forged while building — not authored up front. When building reveals a better rule or a gap, the doc
changes here first, then flows out to the products.
