# 14: actions do not wait for a target an overlay still hides

**What to build:** actions such as `I.click` wait for their target to become
accessible, so a journey can act right after an overlay closes. This is a core
fix per ADR 0003.

A modal overlay hides the rest of the page with `aria-hidden` while it is
open. Radix keeps a closing `DropdownMenu` mounted for its exit animation,
about 100 ms, and the page stays hidden until it unmounts. On the shadcn page
story, the `menu` scenario chooses Archive and the `tabs` scenario then fails
at once with `Unable to find an accessible element with the role "tab"`. A user
sees the tabs the whole time. Actions resolve their locator once, with no wait.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Decide the waiting contract for actions on definite locators: which
      methods wait, for how long, and how a test opts out. Keep `see` and
      `dontSee` meaning "present now" unless the decision says otherwise.
- [ ] A browser regression acts on an element right after a closing overlay
      stops hiding it.
- [ ] The shadcn `page` story test passes and its known-gap marker is removed;
      regenerate the matrix.
- [ ] A changeset describes the core change.
