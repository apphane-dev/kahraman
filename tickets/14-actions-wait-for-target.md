# 14: actions do not wait for a target an overlay still hides

**What to build:** actions on a definite locator wait for their target to
become accessible, so a journey can act right after an overlay closes. This is
a core fix per ADR 0003.

A modal overlay hides the rest of the page with `aria-hidden` while it is
open. Radix keeps a closing `DropdownMenu` mounted for its exit animation,
about 100 ms, and the page stays hidden until it unmounts. On the shadcn page
story, the `menu` scenario chooses Archive and the `tabs` scenario then fails
at once with `Unable to find an accessible element with the role "tab"`. A user
sees the tabs the whole time. Actions resolve their locator once, with no wait.

**Contract:**

- `I.click`, `I.fill`, and `I.clear` wait until the locator resolves to exactly
  one accessible element, then interact once.
- `I.selectOption` waits for the trigger the same way, clicks it once, then
  waits for the option.
- Only the lookup repeats, never the user action: a second click can undo the
  first.
- Only a missing element is retried. An ambiguous locator or an invalid one
  fails at once.
- The wait belongs to resolving a definite locator for an action, not to a
  general `retryTo` around the step.
- `I.see` and `I.dontSee` keep meaning "present now".
- An actor option sets the timeout, and `0` turns the wait off.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Implement the contract and document the actor option.
- [ ] A browser regression acts on an element right after a closing overlay
      stops hiding it.
- [ ] Regressions show an ambiguous locator failing without the wait, and a
      click that runs once.
- [ ] The shadcn `page` story test passes and its known-gap marker is removed;
      regenerate the matrix.
- [ ] A changeset describes the core change.
