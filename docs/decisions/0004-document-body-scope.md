# 0004 — Locators search the story document's body

- **Status:** Accepted
- **Date:** 2026-10-25
- **Scope:** default locator scope in `src/actor.ts`, text queries in `src/loc.ts`

UI kits portal dialogs, menus, popovers, and toasts to `document.body`, outside
`canvasElement`. A user sees the whole page, so locators search
`canvasElement.ownerDocument.body` unless `.within()` or `I.within()` narrows
them. There is no `'global'` scope keyword because the default already is the
whole body.

The body also holds Storybook's hidden `.sb-wrapper` elements with placeholder
text. Role queries skip them as inaccessible; text queries would match them, so
actors exclude `script, style, .sb-wrapper, .sb-wrapper *` from text queries by
default. The actor factory owns this Storybook-specific policy, not `text()`.
It supplies the default through the canvas queries, not through `see`/`dontSee`,
so duplicate-match errors and `findBy*` waits never see the chrome, and `see`
keeps meaning "present".

The selector also excludes user content with the `.sb-wrapper` class.
`createActor({ textIgnore })` replaces it for a different Storybook DOM or a
class collision; `false` disables filtering. A query's `.options({ ignore })`
wins over the actor's setting. Defaults stay local to the actor and apply to
all text query modes, scoped queries, and custom locator callbacks. Role
queries and global Testing Library configuration do not change. Calling a
locator directly with a canvas uses that canvas's defaults.

Stories that share a document, as on a docs page, share the scope. Play tests
run in story mode for isolation; no docs-mode detection.
