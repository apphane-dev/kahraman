---
'kahraman': minor
---

`I.init(context)` accepts a Storybook `StoryContext`, whose `userEvent` is a `userEvent.setup()` instance, as well as a context carrying the direct `userEvent` API.

**Breaking (types):** the exported `UserEvent` types only the methods the actor calls (`clear`, `click`, `keyboard`, `tab`, `type`) and each returns `Promise<unknown>`. Code that used the resolved value of `UserEvent['keyboard']` as `System` must narrow or cast it.
