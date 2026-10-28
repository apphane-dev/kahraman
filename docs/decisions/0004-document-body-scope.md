# 0004 — Locators search the story document's body

- **Status:** Accepted
- **Date:** 2026-10-25
- **Scope:** default query scope and text-query defaults in `src/actor.ts`

UI kits portal dialogs, menus, popovers, and toasts to `document.body`, outside
`canvasElement`. A user sees the whole page, so locators search
`canvasElement.ownerDocument.body` unless `.within()` or `I.within()` narrows
them. There is no `'global'` scope keyword because the default already is the
whole body. Inside an active `I.within(...)`, locators still use that scope
unless they specify their own. Replace `.within('global')` there with
`.within(context.canvasElement.ownerDocument.body)` to escape it. Passing
`context.canvasElement` instead excludes content portalled outside the canvas.

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

## Trade-off

The default gives up isolation between stories rendered into one document.
On a docs page, a name repeated in a sibling story makes a query ambiguous,
and `dontSee` can fail on the sibling's element. `Regressions/Scope › Docs Page`
in the React Aria kit reproduces this. Play tests run in story mode, where the
document holds one story; there is no docs-mode detection.

A `canvasElement` default keeps that isolation but misses every overlay a kit
portals. Kits portal dialogs, menus, popovers, and toasts by default, so most
interactive stories would need an escape on each overlay step. The common case
wins the default. A test that needs isolation narrows itself:
`.within(context.canvasElement)` per locator, or
`I.within(() => context.canvasElement, ...)` for a block. Inside that block,
portalled overlays need `.within(context.canvasElement.ownerDocument.body)`.
