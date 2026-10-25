---
'kahraman': minor
---

**Breaking:** locators search the story document's body by default, so they find dialogs, menus, popovers, and toasts a UI kit portals out of `canvasElement`. `.within('global')` is removed; omit it, or pass `context.canvasElement` to `.within()` to keep a query to the canvas. Stories that share a document, as on a docs page, share that scope.

`text()` ignores Storybook's hidden `.sb-wrapper` elements, whose placeholder text ("No Preview", an args table) would otherwise match. Passing `ignore` in `.options()` replaces that exclusion.
