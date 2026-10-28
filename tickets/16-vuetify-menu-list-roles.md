# 16: Vuetify menus expose list items, not menu items

**What to build:** a decision for Vuetify's `VMenu` with a `VList`, which
announces a menu but renders a list. Per ADR 0003 this is a kit-specific quirk,
not a core fix.

The activator gets `aria-haspopup="menu"`, but the popup is `role="list"` and its
entries are `role="listitem"` (`VListItem` picks `link`, `option`, or `listitem`,
never `menuitem`). The `menu` scenario fails with `Unable to find an accessible
element with the role "menuitem"`. Vuetify's menu docs give no ARIA guidance, so
the fixture keeps the roles Vuetify renders.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Report the role mismatch upstream, or link an existing Vuetify issue.
- [ ] Decide whether a Vuetify kit extension should locate menu entries, or the
      gap stays until Vuetify renders menu roles.
- [ ] If an extension ships, the `menu` story passes through it and its
      known-gap marker is removed; regenerate the matrix.
