---
name: content
description: "Read before writing any UI copy - labels, buttons, errors, empty states: sentence case, the GOV.UK full-stop rule, verb-first errors, buttons that say what they do, one term per thing."
---

# Content

Words are interface. A label, a button, an error, an empty state — the copy *is* the UI as much
as the pixels. Write it plainly, briefly, and consistently, so the reader never has to decode it.

> **The product's voice is the source of truth.** Where the product ships a content style guide or
> brand voice, that wins. **GOV.UK's [Writing for user interfaces](https://www.gov.uk/service-manual/design/writing-for-user-interfaces)**
> is the portable baseline this doc leans on when the product has none. Every rule below is the
> _portable_ part; specific wording is the product's call.

## The rules

1. **Sentence case, everywhere.** Headings, labels, buttons, menu items — sentence case, not Title
   Case, never ALL CAPS. Word shapes are how people read; caps flatten them. **Acronyms are the only
   caps** (LPA, API) — and only ones read letter-by-letter, never a word forced uppercase for style.

2. **Full stops — the GOV.UK rule.** This is the one people get wrong.
   - **No full stop** on: headings, page titles, sub-headings, form-field labels, button labels,
     hint text, and a **single short sentence** used as micro-copy (a one-line error, toast, or
     banner).
   - **Keep the full stop** on **genuine multi-sentence body copy** — a real paragraph ends each
     sentence with one.
   - So: `Enter your date of birth` (label, no stop) but `We've sent you an email. Open it to
     confirm your address.` (two sentences, stops).

3. **Plain words.** Short over long, common over clever. Cut jargon, or define it once. Aim low on
   reading age (GOV.UK targets ~9) — not because readers are dim, but because they're busy and
   stressed. `Use` not `utilise`; `help` not `facilitate`; `about` not `regarding`.

4. **Be concise. Front-load.** Put the most important word first; cut filler (`please`, `simply`,
   `just`, `in order to`). The reader scans, they don't read. A 6-word label beats a 12-word one
   that says the same thing.

5. **Punctuation stays plain.** Plain hyphens, **no em dashes**. Numerals for numbers (`3 items`,
   not `three`). Curly quotes if the product uses them, consistently.

6. **Errors: verb-first, specific, blameless, fixable.** Say what to do, not what went wrong in the
   abstract. Name the field. Never blame the user.
   - ✗ `Invalid input` · `Error: field required` · `You entered an incorrect value`
   - ✓ `Enter a quantity greater than zero` · `Enter your email address` · `Enter a price using no
     more than 2 decimal places`

7. **Buttons and actions say what they do.** A verb, usually with its object. The label should match
   the outcome — ideally echo the heading of the thing it completes.
   - ✗ `OK` · `Submit` · `Yes` (on a delete dialog)
   - ✓ `Save changes` · `Send message` · `Delete account`

8. **One term for one thing.** Pick `Sign in` **or** `Log in` and never mix. Same object, same word,
   every surface. Inconsistent terms read as different features.

9. **Empty and loading states are copy too.** An empty table isn't blank — it says why and what's
   next (`No holdings yet. They'll appear here once your first order settles.`). A missing value is a
   deliberate signal, not a guessed dash.

## Do / don't

| Don't | Do | Why |
| --- | --- | --- |
| `SUBMIT` | `Save changes` | Sentence case; says what it does |
| `Invalid email.` | `Enter a valid email address` | Verb-first, specific, no stop on one-liner |
| `Utilise the filters to refine your results.` | `Filter your results` | Plain, concise, no filler |
| `Are you sure?` → `OK` / `Cancel` | `Delete account` / `Keep account` | Buttons name the outcome |
| `Log in` here, `Sign in` there | one, everywhere | One term per thing |
| `Loading…` forever | `Loading your holdings…` then a real empty/error state | States carry copy |

## Quick reference

| Surface | Case | Full stop | Shape |
| --- | --- | --- | --- |
| Heading / label / button | sentence | no | short, verb-first for actions |
| Hint / one-line error / toast | sentence | no | specific, tells you how to fix |
| Body paragraph | sentence | yes (each sentence) | plain words, front-loaded |
| Empty / loading state | sentence | per length | says why + what's next |
