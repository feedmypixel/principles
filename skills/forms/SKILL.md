---
name: forms
description: "Read before building or changing forms: design, UX, client + server validation, the component set, error/help copy."
---

# Forms

How forms are designed, validated, and built. Each form component owns its styling in a scoped
`<style>` (no global form stylesheet); only tokens are shared — see [the css skill](../css/SKILL.md). Where
there's a server, the server is the source of truth — see
[the progressive-enhancement skill](../progressive-enhancement/SKILL.md).

## Contents

- [Field order — fixed](#field-order--fixed)
- [Required vs optional — GOV.UK convention](#required-vs-optional--govuk-convention)
- [Placeholders — keep, never load-bearing](#placeholders--keep-never-load-bearing)
- [ARIA contract](#aria-contract)
- [Validation triggers](#validation-triggers)
- [Submit buttons — always pressable](#submit-buttons--always-pressable)
- [Errors — one location per kind](#errors--one-location-per-kind)
- [In-app notifications — banner vs toast](#in-app-notifications--banner-vs-toast)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Component set](#component-set)
- [Copy style](#copy-style)
- [What we deliberately don't do](#what-we-deliberately-dont-do)

## Field order — fixed

Top → bottom: **label → hint → error → input → below.** Never reorder.

- **Label** always present and visible. Not optional, not a placeholder substitute.
- **Hint** only when it adds something; omit on obvious fields (e.g. password on login). Not a
  fallback for a missing label.
- **Error** sits **above** the input so a screen reader hits it before the control. Error
  colour, normal weight, no icon (icons inside inline errors read noisy and clash in dark mode).
- **Input** the control itself.
- **below** is reserved for **async-availability** feedback only (e.g. "@handle is taken", token
  validation) — `{ state: 'busy' | 'ok' | 'bad', text }`. Not for general guidance — that's the
  hint. Return nothing for the plain "available" case when a positive tick adds nothing; only
  show `bad` when submit truly can't proceed.

## Required vs optional — GOV.UK convention

Fields are **implicitly required**. Mark optional ones with a lowercase `(optional)` tag next to
the label. **No `*` markers.** Required is the default; optional is the exception.

## Placeholders — keep, never load-bearing

Placeholders are fine as visual scaffolding for an empty field, **as long as the label is always
present and any context lives in the hint**. They vanish on type, so nothing the user needs while
filling the field may live there — format constraints, conditional requirements, and
failure-state info belong in the **hint** (persistent, contrast-controllable). If a placeholder
only repeats what label + hint already say, drop it. Search inputs are the idiomatic exception
(placeholder == affordance).

## ARIA contract

Handled by the `Field` wrapper — consumers pass `name` + `error`:

- input `id` = the field `name`.
- `aria-describedby` chains the hint id + error id (space-separated when both present).
- `aria-invalid="true"` only when errored; the attribute is absent otherwise.
- Native `required` on required inputs (on the input, not the wrapper).
- The form-level summary is `role="alert"` so it's announced on render; each item is an in-page
  anchor to `#${name}`.

## Validation triggers

| Trigger                    | What runs                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `blur`                     | the field's sync rules; toggle error state                                                                         |
| `input`                    | if the field currently has an error, re-validate and clear when valid. **Never introduce a new error mid-typing.** |
| debounced `input` (~300ms) | async availability, for fields that have one                                                                       |
| `submit` (client)          | all sync rules; render the summary; focus the first error; block submit                                            |
| `submit` (server)          | source of truth — re-render with errors. **Always wins.**                                                          |

The components are unopinionated about _where_ rules live — the form wires the handlers and owns
the rules.

## Submit buttons — always pressable

- **Always pressable.** Pressing an invalid form is how the user _invokes_ validation: render the
  summary, show inline errors, focus the first. **Never disable-until-valid**, never grey out
  waiting for input — a disabled button is a dead end with no explanation (see
  [the ux skill](../ux/SKILL.md) § Never dead-end the user).
- **Disabled only in-flight** — after press, while the round-trip runs, so a second click can't
  fire. Show a spinner + a "…" label ("Signing in…"), then resolve to a banner / toast / next
  screen.

## Errors — one location per kind

Top to bottom:

1. **Server / result message** — the submit outcome, at the very top of the form.
2. **Form summary** — the client-validation list, below the message, `role="alert"`, links to
   failing fields.
3. **Inline field error** — above each failing input, via the field's `error`.

## In-app notifications — banner vs toast

- **Banner** = the **outcome of the thing in front of you** (submit result, validation failure,
  section state). Stays in flow until resolved.
- **Toast** = a **transient confirmation of an action already done**, attention moved on.
  Auto-dismisses. Settings saved, refresh triggered, the **undo** pattern (destructive delete:
  "Removed · Undo").

Never put a blocking error or a required choice in a toast.

## Keyboard shortcuts

Shortcuts are great — surface them well, don't bolt hints onto fields.

- **Not in field hints.** A hint's first job is helping fill the field; a shortcut there is
  clutter, and meaningless to a touch user. Keep them out.
- **Discoverable, not decorative.** Put shortcuts somewhere findable — a `?` cheat-sheet, a
  command palette (⌘K), or a hover tooltip on the action — not scattered through the form.
- **Show to keyboard users, hide from touch.** You can't detect a keyboard directly. Detect
  _modality_: reveal an inline shortcut hint (e.g. "⌘↵ to send") once keyboard use is observed (a
  `keydown` / Tab — the same heuristic as `:focus-visible`), or gate it behind
  `@media (any-pointer: fine)`. Never show it to a touch-only user.

## Component set

The canonical form primitives (names stable across products; one per job):

| Component       | Use                                                                          |
| --------------- | ---------------------------------------------------------------------------- |
| `Field`         | wraps one input: label → hint → error → input → below, with the ARIA wiring. |
| `Input`         | text/url input; reads id/aria from the surrounding `Field`.                  |
| `PasswordInput` | input with an internal Show/Hide toggle.                                     |
| `FormSummary`   | top-of-form error list, `role="alert"`, links to failing fields.             |
| `SubmitRow`     | primary submit + optional secondary content (links, helper text).            |
| `Banner`        | inline message in document flow (submit outcome, section state).             |
| `Toast`         | corner-anchored transient confirmation; a host renders the stack.            |

`Input` / `PasswordInput` must render inside a `Field` (throw otherwise) — that's what wires the
id and aria. Per-instance variation comes from **props or tokens**, never an override class.

## Copy style

General copy rules live in [the content skill](../content/SKILL.md) (sentence case, the GOV.UK
full-stop rule, verb-first errors). Form-specific: join a two-clause error with a comma ("This
account is locked, contact support"); `(optional)` lowercase, parenthesised, after the label.

## What we deliberately don't do

- **No heavy form library.** Server validation + a thin enhancement layer (blur/submit triggers,
  the summary) is enough — don't stack another abstraction on top.
- **No `*` required markers** — `(optional)` is the exception, required is default.
- **No submit-disabled-until-valid** — always pressable except in-flight.
