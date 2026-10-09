---
name: progressive-enhancement
description: "Read before building interactive features: resilience, speed, share-don't-duplicate, the works-without-JS subset. Best-practice default, not a mandate."
---

# Progressive enhancement

Build the thing to work on the server first, then enhance it on the client. The page is
functional before a line of client JS runs; JS makes it _nicer_, not _possible_. Still relevant
— arguably more so — in a framework world that defaults to shipping everything to the client.

It's a **best practice and a strong default — not an absolute mandate.** Lean on it hard, but
weigh it against cost case by case. Two things are _not_ negotiable and aren't really "PE" at
all: **where there's a server, the server validates** (client-only validation is a security
hole, not a trade-off), and you never ship a core action that exists _only_ on the client. The
rest is a dial. And the **enhancement layer is where the nice UX lives** — inline validation,
availability/unique checks that skip a server round-trip — all cheap because they're the
server's own rules running early.

## Why it still matters

- **Resilience.** JS fails — flaky networks, blocked scripts, an error in one bundle, a slow
  device parsing megabytes before hydration. A server-rendered, server-submitting page survives
  all of it. The user gets the content and can complete the task regardless.
- **Speed.** Server-rendered HTML paints before client JS arrives. Fetching on the server
  (close to the data, parallelised) beats a waterfall of client requests after hydration. Less
  shipped JS = less to download, parse, execute.
- **One thing done well, in one place.** The server owns truth — validation, authorisation,
  data. The client _reuses_ that, it doesn't re-implement it. No drift between two copies of the
  rules.
- **Reach.** Works on the widest set of devices and conditions for free, instead of being
  bolted on later.

## The shape (server-rendered apps)

When there's a server (SvelteKit and the like), the spine is:

- **Forms post to a server action.** A real `<form method="POST" action>` works with no JS —
  the action validates, mutates, and re-renders with results. That's the baseline, always
  functional.
- **`use:enhance` layers on top.** It intercepts the submit when JS is present — no full reload,
  inline errors, focus management — but the un-enhanced form already worked. Enhancement is
  additive, and it's where the polish is: inline errors, availability checks, no flash of reload.
- **Server validation always wins.** Client-side blur/submit validation is a fast-feedback
  convenience. The server re-validates everything and is the source of truth; a passing client
  never lets a failing server through. See [the forms skill](../forms/SKILL.md) § Validation triggers.
- **Fetch on the server.** Load data in the server load function, close to the source and
  parallelised — not from the client after the page arrives. Don't fetch client-side what the
  server can fetch first.

## One rule, two places — share, don't duplicate

The highest-value PE move: **the same validation logic runs on client and server.** Define the
rules once (a shared schema) and run them in both places — instant client feedback _and_
authoritative server enforcement, with zero drift. The client copy can never disagree with the
server because there is only one copy. It's also what makes the enhancement wins cheap: an inline
or availability check that skips a round-trip is just the shared rule running early.

This is the "one thing done well in one place" principle applied to the client/server boundary:
truth lives server-side; the client borrows it.

## What belongs where

- **Server:** validation, authorisation, data fetching/mutation, anything secret or
  trust-sensitive, the canonical render.
- **Client:** enhancement of what already works — debounced availability checks, optimistic
  affordances, focus/scroll management, transient UI state. Never the _only_ path to a core
  action.

A useful gut-check (a guideline, not a gate): **turn JS off — how much still works?** The more
core paths survive, the more resilient the app. Aim high — it's a dial, not pass/fail.

## When there's no server

A pure client-side product (a browser extension, a static offline tool) has no server to enhance
_from_ — there's no "works without JS" baseline because JS _is_ the app. The PE form story
doesn't apply. But the underlying principles still do:

- **Resilience** — handle the absent/slow/failed dependency (the remote API, storage) gracefully
  instead of assuming it's there.
- **One thing done well in one place** — single source for config/state access; don't scatter
  reads of the same store across the code.
- **Speed** — ship the least you can; defer and lazy-load the rest.

So: full PE where there's a server; the resilience-and-single-source subset where there isn't.
