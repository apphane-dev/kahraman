# 16: Vuetify menus expose list items, not menu items

**What to build:** remove the Vuetify `menu` known gap once `VMenu` with a
`VList` renders menu roles. Per ADR 0003 this is a kit-specific quirk, not a
core fix.

The activator gets `aria-haspopup="menu"`, but the popup is `role="list"` and its
entries are `role="listitem"` (`VListItem` picks `link`, `option`, or `listitem`,
never `menuitem`). The `menu` scenario fails with `Unable to find an accessible
element with the role "menuitem"`. Vuetify's menu docs give no ARIA guidance, so
the fixture keeps the roles Vuetify renders.

No Vuetify kit extension locates the list items: passing the scenario that way
would hide a role mismatch a screen reader user meets.

**Blocked by:** Vuetify rendering `menu` and `menuitem` roles for `VMenu` with a
`VList` (external).

**Status:** blocked

- [ ] When Vuetify renders menu roles, upgrade the kit, remove the `menu`
      known-gap marker, and regenerate the matrix.
