# principles

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code plugins](https://img.shields.io/badge/Claude%20Code-plugins-d97757.svg)](https://docs.claude.com/en/docs/claude-code/plugins)

**Make Claude Code build to your engineering principles — loaded on demand, not crammed into context.**

A Claude Code plugin marketplace carrying two plugins:

| Plugin | What it does |
|---|---|
| [`principles`](./principles/README.md) | Ten portable web/engineering principles as on-demand skills — components, content, CSS, docs, forms, grid, progressive enhancement, UX, testing strategy, PR discipline. Rules are portable; values come from your own `tokens.css`. |
| [`design-to-code`](./design-to-code/README.md) | Turn a design handoff (Claude Design or any self-contained HTML mocks) into production code via a measurable extract → diff → fix loop. "Looks like the design" becomes a numeric spec diff that must be empty — no done without evidence. |

## Install

Add the marketplace once:

```
/plugin marketplace add feedmypixel/principles
```

Then install either or both:

```
/plugin install principles@principles
/plugin install design-to-code@principles
```

Scope prompt: **user** = every session on your machine; **project** = committed to the repo, everyone who clones it inherits the plugin.

## Updating

```
/plugin marketplace update principles
/plugin update principles
/plugin update design-to-code
```

Then a fresh session or `/clear` — the skill list is snapshotted at session start.

## License

[MIT](LICENSE).
