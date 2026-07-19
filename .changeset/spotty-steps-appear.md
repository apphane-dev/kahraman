---
'kahraman': minor
---

Report every actor call as a Storybook Interactions-panel step.

When the story context provides `context.step` (it does on any Storybook story
context, including the one loaders receive), each `I.*` call is now reported
through it. The Interactions panel shows codecept-style, collapsible step
groups — `I.see(heading "Quarterly report")`, `I.retry()` — with the raw
Testing-Library / userEvent calls nested inside, instead of a flat stream of
low-level instrumented calls. Contexts without `step` (portable stories, plain
Vitest) keep working unchanged.

Page-actor methods added via `I.extend(...)` are now tracked too: they appear
in the Interactions panel and in the failure step trace with their inner base
calls indented one level deeper. As part of this, extension methods are
wrapped in an async tracker, so they always return a `Promise` — declare them
`async` (returning a promise), which page actors in practice already do.
