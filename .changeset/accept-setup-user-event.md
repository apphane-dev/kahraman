---
'kahraman': patch
---

`I.init(context)` accepts a Storybook `StoryContext`, whose `userEvent` is a `userEvent.setup()` instance, as well as a context carrying the direct `userEvent` API. `UserEvent` now types only the methods the actor calls, with `Promise<unknown>` returns.
