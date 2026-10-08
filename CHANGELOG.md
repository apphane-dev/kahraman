# kahraman

## 0.4.0

### Minor Changes

- 86e3c77: `I.init(context)` accepts a Storybook `StoryContext`, whose `userEvent` is a `userEvent.setup()` instance, as well as a context carrying the direct `userEvent` API.
  
  **Breaking (types):** the exported `UserEvent` types only the methods the actor calls (`clear`, `click`, `keyboard`, `tab`, `type`) and each returns `Promise<unknown>`. Code that used the resolved value of `UserEvent['keyboard']` as `System` must narrow or cast it.
- 41dc85e: Support Storybook 11 and its prereleases while retaining Storybook 9 and 10 compatibility. Add an opt-in default addon factory for CSF Next (`addons: [kahraman()]`) with typed diagnostics parameters. Existing named exports and the `kahraman/preview` annotation remain available.
  
  Raise the minimum Node.js version to 22.12 to match Storybook 11.

## 0.3.1

### Patch Changes

- 5e0f70c: Upgrade @changesets/cli 2.31.0 to 3.0.1 (major). Release workflow moved to changesets/action@v2 as required by CLI v3; the v1 action is incompatible with it.

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
