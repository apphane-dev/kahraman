# 17: locators do not find controls inside shadow roots

**What to build:** locators find accessible elements inside open shadow roots,
so actions and assertions work on web component kits. This is a core fix per
ADR 0003: shadow DOM is a web standard.

Web Awesome renders its controls inside open shadow roots: `wa-button` holds a
`<button>`, `wa-input` an `<input>`, and so on, with the label slotted from the
light DOM. Testing Library queries walk the light DOM only, so 10 of the 12
Web Awesome scenarios fail with `Unable to find an accessible element with the
role …`. `tabs` passes because `wa-tab` and `wa-tab-panel` set their roles on
the host element, and `native-select` uses a plain `<select>`. The kit's
`regressions/shadow-dom.stories.ts` confirms a click that reaches the shadow
button works.

**Experiment:** `createActor({ shadowDom: 'open' })` makes role and text queries
also search open shadow roots (`src/shadow.ts`). Matches from every root are
pooled before the uniqueness check, so a name in two components is ambiguous, not
first-wins. `regressions/shadow-experiment.stories.ts` runs the Web Awesome
catalog with it:

- Pass: button, button-disabled, native-select, menu, tabs, status. Names built
  from slotted text resolve, and `aria-labelledby` inside a shadow root works.
- textbox, textarea: `fill` works; `clear` fails because user-event checks
  `document.activeElement`, which is the host.
- checkbox, switch: the inner input turns off its own pointer events, and the
  hit test calls `document.elementFromPoint`, which also returns the host.
- combobox: `aria-controls` names an id inside the shadow root, which
  `document.getElementById` misses.
- dialog: the closed `<dialog>` stays accessible after Cancel, because the
  accessibility check walks `parentElement` and stops at the shadow root, so
  the hidden host does not hide it.

Default support needs root-aware focus, hit testing, id lookup, and
accessibility checks, besides the queries.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Decide the contract: which queries enter open shadow roots, how an
      accessible name built from slotted content is computed, and how a scope
      set with `I.within(...)` or `.within(...)` applies across shadow
      boundaries. Closed shadow roots stay out of reach.
- [ ] Record the decision in an ADR.
- [ ] Browser regressions cover a role query, a text query, an action, and a
      scoped query across a shadow boundary.
- [ ] The Web Awesome scenarios this unblocks pass and their known-gap markers
      are removed; regenerate the matrix.
- [ ] A changeset describes the core change.
