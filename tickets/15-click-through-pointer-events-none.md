# 15: actions refuse a target with `pointer-events: none`

**What to build:** `I.click` and `I.selectOption` act on an element styled
`pointer-events: none` the way a user's click does: the click lands on whatever
receives pointer events at that point. This is a core fix per ADR 0003, since
`pointer-events` is standard CSS.

Vuetify's `VSelect` renders its `role="combobox"` input with
`pointer-events: none`; the surrounding field takes the click. The `combobox`
scenario's `selectOption` fails with `Unable to perform pointer interaction as
the element has pointer-events: none`, thrown by user-event's
`pointerEventsCheck`. A user clicks the field and the listbox opens.

Once the click lands, the scenario's final check still fails: `VSelect` shows
the chosen value in a sibling of the input, outside the named combobox.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Decide the contract: click the element that receives pointer events at the
      target's position, or skip user-event's check. Never click a target that a
      user cannot reach at all.
- [ ] A browser regression clicks a `pointer-events: none` combobox whose
      ancestor opens its listbox.
- [ ] Decide how `combobox` should read a value rendered outside the named
      combobox, then make the Vuetify `combobox` scenario pass or record what
      remains; regenerate the matrix.
- [ ] A changeset describes the core change.
