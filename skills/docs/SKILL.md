---
name: docs
description: "Read before writing or restructuring any repo doc (README, design doc, decision record, runbook): TOCs kept current, brevity, heading discipline, sparing callouts, tables via the formatter, descriptive links."
---

# Docs

How repo documentation is written and structured. Docs are for **reading** - a doc that isn't
scannable doesn't get read, and a doc that doesn't get read is dead weight. UI copy is
[the content skill](../content/SKILL.md); this doc covers documents: READMEs, design docs,
decision records, runbooks, discovery notes.

> **The product's conventions are the source of truth.** Where the consuming repo has its own
> doc conventions (ticket-linking format, changelog policy, a docs/ layout), those win. Every
> rule below is the portable part.

## Structure

1. **Lead with the point.** First paragraph says what the doc is and why it exists. A reader
   who stops after three lines should still leave with the headline.
2. **Every substantial doc gets a `## Contents`.** Anchor-linked, near the top, **updated in the
   same edit as any heading change** - a stale TOC is worse than none. A README that is itself a
   folder index skips it.
3. **Never skip heading levels.** `##` to `####` breaks navigation and generated TOCs. `#` is
   the title, once.
4. **One doc, one job.** A doc that needs two titles is two docs. Link between them rather than
   growing an appendix that outweighs the body.
5. **State current truth.** No history noise ("this used to be X") - git holds the history. A
   decision record states the decision and the why; it doesn't narrate the meeting.

## Brevity

**Fewer words, same meaning.** Each section earns its space.

- Cut every sentence that doesn't carry a fact or a why. Re-read and cut again before calling
  it done.
- A two-line explanation beats a five-line one saying the same thing.
- Front-load: most important point first in every section, most important word first in every
  heading.
- Don't restate what an adjacent table, code block, or linked doc already says.

## Formatting

- **Run the repo's formatter over every doc you touch** (typically prettier - it aligns tables
  and normalises lists). Hand-aligned markdown drifts on the next edit.
- **Callouts are for scope guards and warnings only** - a `> [!NOTE]` / `> [!IMPORTANT]` that
  repeats body prose is noise; drop one of them. Sparing use is what keeps them loud.
- **Tables for enumerable facts, prose for reasoning.** A table cell holding a paragraph wants
  to be a section; three parallel paragraphs of name-value pairs want to be a table.
- **Code fences always carry a language tag** - ```bash, ```ts, ```json - never bare fences.
- **Links are descriptive**: `[the grid contract](docs/design/grid.md)`, never `here` or a bare
  path in prose. Tickets, PRs, and jobs get real links in the repo's convention - an unlinked
  reference is a dead end.
- Plain hyphens, no em dashes. Sentence case headings.

## Kinds of doc, briefly

| Kind | Leads with | Earns its place by |
| --- | --- | --- |
| README | what this is + how to start | being the true front door - index, not encyclopedia |
| Design / discovery doc | the problem and the stance taken | evidence and decisions, not exploration transcripts |
| Decision record | the decision, one line | the why + the rejected alternatives, tersely |
| Runbook | when to use it | exact commands that work when pasted, verified |

## Red flags - stop and fix

- A heading changed but the Contents didn't.
- A callout restating the paragraph above it.
- A bare code fence, a `click here` link, an unlinked ticket number.
- A doc growing a second subject - split it.
- "Previously", "used to", "as of the old version" - delete; state what is.
