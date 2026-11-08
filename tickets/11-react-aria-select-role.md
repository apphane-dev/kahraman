# 11: React Aria Components `Select` trigger is a button, not a combobox

**What to build:** a user can choose an option in a React Aria Components
`Select` the way the `combobox` scenario does. The trigger renders as
`<button aria-haspopup="listbox">`, so `role('combobox', 'Country')` finds
nothing. Its accessible name also includes the current value
("Country Select an item").

A quirk of one UI kit, so a kit-extension candidate per ADR 0003.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Decide with the maintainer: a React Aria Components kit extension, or a
      permanent known gap documenting the kit's semantics.
- [ ] If an extension: it ships as a jsrepo registry item, and the `combobox`
      scenario passes through it.
