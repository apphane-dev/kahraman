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

**Opt-in support:** `createActor({ shadowDom: 'open' })` makes role and text
queries also search open shadow roots and the elements slotted into them
(`src/shadow.ts`). Matches from every root are pooled before the uniqueness
check, so a name in two components is ambiguous, not first-wins, and a role
match inside a hidden component is hidden. Hit tests and `aria-controls` ids
resolve within the target's root, and `clear` on an input in a shadow root
deletes its value by typing. `regressions/shadow-dom-option.stories.ts` runs the
Web Awesome catalog with it, and every scenario passes.

What remains is the default: whether actors search open shadow roots unless
told not to, and how the matrix reports a kit that passes only with the option.

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
