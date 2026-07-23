---
name: pull-requests
description: Read after raising any pull request (or a batch). A PR is not "done" until its checks reach a terminal state — poll them, fix failures, and only then report. Covers flake-vs-real triage, visual-baseline regen, and cross-repo merge order.
---

# Pull requests — watch them to green

Raising a PR is the start of the job, not the end. **"PR opened" is not "PR ready."** The work
is done when every check is green, or red for a reason only the human can resolve (and you've
said so). Until then you are still on the hook.

## The rule

**Never report a PR as ready / done / passing while its checks are pending or unseen.** Opening
the PR and moving on to a summary is the failure mode. Poll first; report the true state.

If you opened **several** PRs, you owe this for **every one of them**. A batch is not finished
because the last `gh pr create` returned a URL — it's finished when all of them are green or
explicitly handed back. The pull to write a tidy wrap-up before the checks land is exactly when
this gets dropped; resist it.

## The loop

After `gh pr create` (and after every push that re-triggers checks):

1. **Poll** the PR's checks until they reach a terminal state (`gh pr checks <n>`). Don't
   declare anything while one is `pending`.
2. On **failure**, get the *real* error — open the failing job's log, find the actual assertion
   / message, not the cache/teardown noise around it.
3. **Triage the failure by type** (next section) — the fix differs.
4. **Fix**, push, and **re-poll**. Repeat until green or genuinely owner-gated.

## Triage: what kind of failure is it?

Don't reach for "re-run" by reflex. Identify the cause first.

- **Flake** (intermittent — a timing race, a pixel diff that *varies* run to run): re-run the
  failed job **once**. If it fails again the same way, it is **not** a flake — stop re-running
  and find the root. A diff that is byte-identical across runs (same pixel count every time) is
  not a flake; it's a real, stale, or structural difference.
- **Visual baseline drift** (a screenshot check failing because the rendered output legitimately
  changed, or the committed baseline is stale): **regenerate the baseline** through the proper
  CI path — never hand-edit baselines, never just re-run hoping it passes. If a section is
  *genuinely* non-deterministic (e.g. a large colour-emoji, a live clock), fix the source of
  non-determinism (freeze it, mask it) rather than regenerating into a coin-flip.
- **Cross-repo / merge-order dependency**: the check fails because another PR (an API change, a
  contract change) must merge or deploy first. The fix is **ordering**, not code — state the
  order, get the dependency in, then re-run. (Design the dependency so the producer is
  backward-compatible and can ship first.)
- **Real regression**: the check is right and the code is wrong. Fix the code.

## What you must not do

- **Don't re-run to dodge a real failure.** Re-running is only valid for a *confirmed* flake.
- **Don't loosen the gate to go green** — raising a pixel/diff tolerance, skipping a test,
  `continue-on-error`, deleting an assertion. Make the thing actually pass.
- **Don't report green you haven't seen.** "Should pass now" is not "passed." Check.

## Reporting

Distinguish, every time:

- **"PR up / opened"** — raised, checks running. Not done.
- **"PR green"** — checks passed, ready for the human's merge gate.
- **"PR red, needs you"** — failing on something only the human can resolve (a secret, an
  external dependency, a product decision). Say what and why.

The human gates the merge. Your job is to hand them a **green** PR (or an honest red one), never
an unwatched one.
