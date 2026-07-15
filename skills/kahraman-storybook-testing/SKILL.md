---
name: kahraman-storybook-testing
description: Write, extend, or review Storybook integration stories and portable interaction tests with kahraman. Use when adding Storybook `*.stories.ts(x)` tests, accessible actor/locator assertions, MSW success/error/loading scenarios, async stabilization, responsive variants, or debugging flaky Storybook browser tests. Applies kahraman's codecept-style `I` actor and accessibility-first Testing Library locators.
license: MIT
compatibility: Requires an existing browser-capable Storybook 9+ configuration and established project story format (CSF or Storybook preview factories). kahraman, or an equivalent project actor, must be available to use its actor examples.
metadata:
  author: apphane
  repository: https://github.com/apphane-dev/kahraman
allowed-tools: Bash read edit write
---

# Kahraman Storybook Testing

Use Storybook stories as executable user journeys. A story supplies a reproducible
application state; its test documents what a user can perceive and do in that
state. Prefer a small number of clear scenarios over one test that branches
through unrelated states.

## Prerequisite: an existing Storybook test setup

This skill extends a configured Storybook project; it does not bootstrap
Storybook or choose its story architecture. Before changing tests, confirm that
all of these already exist:

- `.storybook/main.*` and `.storybook/preview.*` (or the equivalent configured
  Storybook directory), including the browser test integration;
- at least one working `*.stories.ts` or `*.stories.tsx` file that establishes
  the repository's story format; and
- kahraman (or the project's equivalent actor) exposed to stories that need
  interaction tests.

If a prerequisite is missing, say which one is missing and first ask whether to
set up Storybook, migrate the story format, or write a non-interaction story.
Do not invent preview imports, `meta.story()` APIs, aliases, test callbacks, or
MSW wiring.

## First inspect the project's conventions

Find `.storybook/preview.*`, an integration story near the feature, actor
helpers, and MSW handlers. Reuse the project's Storybook API
(`preview.meta(...).story(...)` or CSF `Meta` / `StoryObj`), viewport names,
path setup, and mock registration rather than mixing patterns.

For a project using kahraman, import the page actor and semantic locators:

```ts
import preview from '#.storybook/preview'
import { App } from '#app/App'
import { featureList } from '#entities/feature/mocks/handlers'
import { featureActor as I } from '#pages/feature/testing'
import { button, heading, link, role, text } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Feature',
	component: App,
	parameters: { layout: 'fullscreen', initialPath: 'feature' },
	loaders: [(context) => I.init(context)],
})
export default meta
```

`I.init(context)` is required before actor calls. It binds the Storybook canvas,
`userEvent`, and a fresh step trace. If the repository uses plain `StoryObj`,
initialize the actor at the beginning of `play` instead.

## Address the UI as a user would

Use `role`, `heading`, `button`, `link`, and `text`, with accessible names:

```ts
await I.see(heading('Billing'))
await I.fill(role('textbox', 'Email'), 'ada@example.com')
await I.click(button('Save'))
await I.see(role('alert'))
```

This is both a robust selector strategy and an accessibility check. Do not use
CSS selectors, test IDs, DOM traversal, or text-content matching when a role and
name can express the intent. Use `text(...)` for genuinely non-semantic visible
content.

Use locator modifiers deliberately:

- `locator.wait()` waits for an element that will appear.
- `locator.maybe()` makes an optional lookup nullable; use it only when an
  optional overlay must be acted on.
- `locator.all()` asserts or extracts a collection.
- `locator.within(container)` limits a query to a region; it accepts a locator,
  captured `HTMLElement`, or `'global'` to escape the current actor scope.
- `locator.options(...)` supplies Testing Library query options.

Scope feature assertions to the region under test so global chrome and toasts do
not produce false matches:

```ts
await I.within(role('main'), async () => {
	await I.click(link('Quarterly report'))
	await I.waitExit(role('status'))
	await I.see(heading('Quarterly report'))
})
```

Capture a stable container once when one panel swaps between states. Assert both
sides of a mutually exclusive transition:

```ts
const panel = await I.see(role('main'))
await I.see(text('No article selected').within(panel))
await I.dontSee(heading('Quarterly report').within(panel))

await I.click(link('Quarterly report'))
await I.waitExit(role('status', 'Loading article detail').within(panel))
await I.dontSee(text('No article selected').within(panel))
await I.see(heading('Quarterly report').within(panel))
```

## Stabilize on observable lifecycle signals

Do not add arbitrary sleeps. Loaded and async-error stories should normally wait
for their loading status to leave the UI:

```ts
export const Default = meta.story({
	name: 'Default',
	play: () => I.waitExit(role('status')),
})
```

After an action that starts a request, click, wait for the relevant status to
exit, then assert the result. Use `.wait()` only when no stable exit signal
exists. A persistent-loading story intentionally keeps its request pending, so
it must not use a broad `waitExit(role('status'))`; assert its loading UI
instead. If a parent guard settles while a feature request intentionally hangs,
wait only for that named parent status.

Use `I.retryTo` for a documented eventual UI transition that has no better
lifecycle signal. Explain why it is needed in a comment. Avoid retries that hide
a broken synchronization contract.

## Model states with separate stories and MSW

Give each durable server state a separate, named story. Reuse the application's
handlers and override only the affected handler key:

```ts
export const FeatureLoadServerError = meta.story({
	name: 'Feature Load Server Error',
	parameters: { msw: { handlers: { featureList: featureList.error } } },
	play: () => I.waitExit(role('status')),
})

FeatureLoadServerError.test('shows a recoverable error', async () => {
	await I.see(role('alert'))
	await I.click(button('Try again'))
})

export const FeatureRequestLoadingState = meta.story({
	name: 'Feature Request Loading State',
	parameters: { msw: { handlers: { featureList: featureList.loading } } },
})

FeatureRequestLoadingState.test('keeps the feature loading', async () => {
	await I.see(role('status', 'Loading feature'))
})
```

Handlers should represent realistic `default`, `error`, and `loading` behavior.
Keep feature workflow steps, expected copy, and business outcomes in the story;
shared actors are for reusable page controls and assertions, not opaque methods
such as `playCheckoutFlow()`.

## Write journeys, not implementation probes

Name the test after the user-visible outcome and keep steps in causal order:

```ts
Default.test('creates a connection after completing the form', async () => {
	await I.click(button('New connection'))
	await I.fill(role('textbox', 'Name'), 'Production')
	await I.click(button('Create'))
	await I.waitExit(role('status'))
	await I.see(heading('Production'))
})
```

Prefer a journey that proves meaningful behavior over asserting internal state.
Direct browser APIs or raw `storybook/test` assertions are appropriate for
things outside the actor's scope, such as browser history, geometry, keyboard
focus, screenshots, or an external admin panel. Keep that exceptional code
local and use `waitFor` for its observable condition.

## Responsive variants

Create mobile variants when the behavior or layout needs coverage. Reuse the
corresponding desktop story's parameters so mocks cannot drift:

```ts
export const FeatureLoadServerErrorMobile = meta.story({
	name: 'Feature Load Server Error (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: FeatureLoadServerError.input.parameters,
	play: () => I.waitExit(role('status')),
})

FeatureLoadServerErrorMobile.test('[mobile] shows a recoverable error', async () => {
	await I.see(role('alert'))
})
```

Use the repository's configured viewport shape; some projects use
`{ value: 'sm', isRotated: false }`, while others use `'sm'`.

## Review checklist

- The story initializes its actor and uses the local Storybook convention.
- Locators use roles and accessible names; scopes prevent accidental global hits.
- Async assertions wait on visible lifecycle state, not timeouts.
- Success, failure, loading, retry, deep-link, and mobile states are separate
  stories when they represent different reproducible states.
- MSW overrides are narrow and existing default handlers remain intact.
- The story spells out domain behavior; shared actor helpers remain generic and
  readable.
- Test names describe outcomes and comments explain non-obvious regressions or
  synchronization constraints.
