# 12: `selectOption` with multiple open listboxes

**What to build:** a browser regression and an explicit lookup contract for
`I.selectOption` when multiple exposed listboxes contain the same option name.

The method clicks the trigger, then looks up `getByRole('option', { name: value })`
in the story document's body, regardless of an active `I.within(...)` scope.
Two matching options cause a Testing Library multiple-match error. This lookup
predates the document-wide default in PR #20; handling it is a separate follow-up.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A real browser fixture has two simultaneously exposed listboxes with an
      identically named option, including a portalled listbox. The test confirms
      the current ambiguity rather than hiding it with a unique option name.
- [ ] Decide and document whether `selectOption` requires document-wide option
      uniqueness or associates the trigger with its popup. Cover the chosen
      contract with a regression.
- [ ] Never choose an arbitrary first match or silently click an option in an
      unrelated listbox.
- [ ] Preserve single-listbox selection and the existing scoped, portalled
      selection regression.
- [ ] A changeset describes any runtime or API change.
