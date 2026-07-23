---
name: ux
description: Read before designing any interaction: never dead-end the user, one clear primary action, respect the user's current state. Cross-cutting.
---

# UX

Cross-cutting interaction principles — broader than any one form or component. Pairs with
[the forms skill](../forms/SKILL.md) (form-specific UX) and [the css skill](../css/SKILL.md) (the visual layer).

## Never dead-end the user

**Every state offers a way forward.** A screen with no next action is a trap. Whatever the
state — error, empty, blocked, mid-task, done — the user can always do _something_ to continue.

- **No disabled buttons.** A disabled button is a dead end with no explanation. Keep it
  pressable: clicking an invalid form surfaces the errors and focuses the first one. The only
  valid disable is the transient in-flight window after submit. (Form detail in
  [the forms skill](../forms/SKILL.md) § Submit buttons.)
- **Empty states carry a CTA.** "Nothing here yet" _plus_ the action that fills it — never a
  blank panel.
- **Errors offer recovery.** Say what happened in plain language and the way out (retry, go
  back, contact) — not a code and a shrug.
- **404 / wrong turn → a route home.** Search, home, or the nearest sensible place. Never a
  terminal page.
- **Blocked / permission / not-yet states explain + offer the unblock.** Why it's blocked and
  what would change it — not just "no". If an action will _never_ apply in the current state,
  don't render it (hidden beats greyed-out); if it can't be done _yet_, keep it live and explain
  on click.

**The test:** on every screen, can the user always move forward? A state with no exit is
unfinished.

## Reduce, then enhance

- **One clear primary action per screen.** Make the main path obvious; let everything else be
  quieter. Choice overload is its own kind of dead-end.
- **Progressive disclosure.** Show what's needed now; reveal advanced/rare controls on demand
  (a `?` panel, a command palette, an expander) rather than crowding the default view. See
  [the forms skill](../forms/SKILL.md) § Keyboard shortcuts for the modality-aware version.

## Respect the user's state

- **Don't lose their work.** Preserve input across validation re-renders and navigation; confirm
  before discarding.
- **Match the input modality.** Touch, mouse, keyboard each want different affordances — detect
  _use_, don't assume hardware (the `:focus-visible` heuristic). Don't show keyboard-only hints
  to touch users.
- **Honour preferences.** `prefers-reduced-motion`, `prefers-color-scheme`, and the user's font
  size (rem, never a fixed root) — see [the css skill](../css/SKILL.md).

## Button or link

**Buttons do; links go.** An action that changes state (save, delete, submit, toggle) is a
`<button>`; navigation to another place is an `<a href>`.

- Styling doesn't change the element: a link styled as a button is still `<a href>`; a
  quiet text-styled action is still `<button>`.
- The wrong element breaks real behaviour - links get open-in-new-tab, copy address, and
  prefetch; buttons get form submit, `disabled` semantics, and correct screen-reader
  announcement. A `<div onclick>` gets none of either.
- If it needs `href="#"` plus a click handler, it's a button.
