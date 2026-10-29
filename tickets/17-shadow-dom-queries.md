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
Web Awesome catalog with it, both individually and together on one page.
Regressions exclude unassigned light DOM and occupied-slot fallback content
from default role queries. Explicit hidden role queries and text queries keep
including that DOM. ADR 0005 records the opt-in contract without changing the
default or removing known-gap markers.

The default stays off. What remains is how the published matrix reports a kit
that passes only with the option.

**Blocked by:** None (can start immediately).

**Status:** opt-in implemented; published option-enabled coverage remains open

- [x] Define the opt-in contract: query families, accessible-name delegation,
      and scopes across open shadow boundaries. Closed roots stay out of reach.
- [x] Keep traversal off by default; require an explicit actor option.
- [ ] Publish option-enabled coverage separately from default support.
- [x] Record the opt-in contract in an ADR.
- [x] Browser regressions cover a role query, a text query, an action, and a
      scoped query across a shadow boundary.
- [x] The opt-in Web Awesome scenarios pass individually and on one page.
      Keep known-gap markers for the default actor.
- [x] A changeset describes the core change.
