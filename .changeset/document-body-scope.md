---
'kahraman': minor
---

**Breaking:** locators search the story document's body by default, so they find dialogs, menus, popovers, and toasts a UI kit portals out of `canvasElement`. `.within('global')` is removed. Stories that share a document, as on a docs page, share that scope.

To migrate `.within('global')`, omit it only when no actor scope is active. Inside `I.within(...)`, omitting it keeps the locator in that scope; use `.within(context.canvasElement.ownerDocument.body)` to escape to the document body and find portalled content. `.within(context.canvasElement)` deliberately limits the query to the canvas and excludes content portalled outside it.

Actors exclude `script, style, .sb-wrapper, .sb-wrapper *` from text queries by default, since Storybook's placeholder text ("No Preview", an args table) would otherwise match. `createActor({ textIgnore })` replaces the selector for that actor, including when user content uses `.sb-wrapper`; `false` disables filtering. A query's `.options({ ignore })` overrides the actor setting. Role queries are unchanged.
