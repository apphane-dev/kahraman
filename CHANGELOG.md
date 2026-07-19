# kahraman

## 0.3.0

### Minor Changes

- f2ad958: Report every actor call as a Storybook Interactions-panel step.

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

## 0.2.1

### Patch Changes

- 3bdbd6c: docs(readme): add the launch video — a 48-second tour of the actor flow, the
  accessibility-first locator DSL, and the step-trace diagnostics, linked from a
  "See it in motion" section with landscape, vertical, and square cuts.

## 0.2.0

### Minor Changes

- e4577c9: Add an opt-in `clickDelay` actor option for pacing interactions during manually played Storybook stories without slowing automated tests by default.

## 0.1.1

### Patch Changes

- c3f0cb0: Accept Storybook 9 and 10.4 story contexts whose `userEvent.setup` signature differs from the version used to build kahraman.

## 0.1.0

### Minor Changes

- f51c100: Initial release: accessibility-first, codecept-style test actor (`createActor`) and locator DSL (`role`, `text`, `heading`, `button`, `link`) for Storybook portable stories and Vitest browser mode, plus an opt-in `kahraman/preview` diagnostics annotation.
