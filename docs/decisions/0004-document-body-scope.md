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
`text()` ignores them by default. The exclusion lives in the query, not in
`see`/`dontSee`, so duplicate-match errors and `findBy*` waits never see the
chrome, and `see` keeps meaning "present".

Stories that share a document, as on a docs page, share the scope. Play tests
run in story mode for isolation; no docs-mode detection.
