# 13: `selectOption` does not select a native `<option>`

**What to build:** `I.selectOption` supports a native `<select>` as well as a
combobox that opens a portalled listbox. This is a core fix per ADR 0003.

The shadcn/Radix and MUI fixtures' `native-select` scenarios click the Size
select and its Large option, but the value remains Small. `selectOption` returns success;
`seeInField` then fails with `expect(element).toHaveValue(Large)`, expected Large,
received Small. The unmarked scenarios confirmed this failure in Chromium.
MUI's native-selection regression separately proves that the fixture changes
value when Testing Library's `selectOptions` interaction drives it directly.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Use the native selection interaction for `<select>` instead of only
      clicking its option. Preserve custom combobox/listbox selection.
- [ ] Cover changing a preselected native option and confirming the resulting
      value/change behavior in a real browser, including inside an actor scope.
- [ ] The shadcn and MUI `native-select` scenarios pass and their known-gap
      markers are removed; regenerate the matrix.
- [ ] The existing portalled-select and actor-scope regressions stay green.
- [ ] A changeset describes the core fix.
