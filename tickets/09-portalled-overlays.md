# 09: Portalled overlays are invisible to default-scope locators

**What to build:** `I.see(role('dialog'))` and other default-scope locators find
overlays a UI kit renders outside `canvasElement`: dialogs, menus, popovers,
toasts. Today only `.within('global')` reaches them, and a user would not think
to write it.

Core fix per ADR 0003. Widening the default scope changes which elements every
existing locator can match, so the approach is a backward-compatibility
decision for the maintainer.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] The approach and its backward-compatibility handling are agreed with the
      maintainer before code changes; recorded as an ADR if hard to reverse.
- [ ] React Aria Components `dialog`, `menu`, and `status` pass; their known-gap
      markers are removed.
- [ ] A changeset describes the behavior change.
