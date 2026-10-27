---
'kahraman': minor
---

With `shadowDom: 'open'`, role and text queries also search elements slotted into open shadow roots, and a role match inside a hidden component is hidden. Hit tests and `aria-controls` ids resolve within the target's own document or shadow root, and `clear` works on an input inside a shadow root. A click on a self-disabled input also passes through a decorative part inside its parent, like a switch thumb, never through a control.
