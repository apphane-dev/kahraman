---
name: kahraman-storybook-testing
description: Apply kahraman's recommended style when writing, extending, reviewing, or debugging Storybook interaction tests and portable stories. Use for Storybook `*.stories.ts(x)` tests, accessible actor/locator assertions, user-journey structure, and async stabilization. Also guides optional MSW state stories and responsive variants when the project has those integrations configured.
license: MIT
compatibility: Requires kahraman and an existing browser-capable Storybook 9+ setup with an established story format (CSF or Storybook preview factories). Optional recommendations have additional setup prerequisites described below.
metadata:
  author: apphane
  repository: https://github.com/apphane-dev/kahraman
allowed-tools: Bash read edit write
---

# Kahraman's Recommended Storybook Testing Style

Use Storybook stories as executable user journeys. A story supplies a reproducible
application state; its test documents what a user can perceive and do in that
state. Prefer a small number of clear scenarios over one test that branches
through unrelated states.

This is a recommended style, not a requirement that every project adopt the same
Storybook stack. The actor and accessibility-first locator guidance is the core.
MSW state modeling, routing helpers, responsive variants, screenshots, and other
Storybook integrations are optional enhancements when their prerequisites exist.

## Setup prerequisites

### Core prerequisites

This skill extends a configured Storybook project; it does not bootstrap
Storybook or choose its story architecture. Before changing interaction tests,
confirm that all of these already exist:

- `.storybook/main.*` and `.storybook/preview.*` (or the equivalent configured
  Storybook directory), including browser test execution;
- at least one working `*.stories.ts` or `*.stories.tsx` file that establishes
  the repository's CSF or preview-factory format; and
- kahraman exposed to stories and initialized with their Storybook context.

### Optional integration prerequisites

Apply an optional recommendation only when its setup is already present:

- **MSW state stories** require MSW, the Storybook MSW addon/loader initialized
  in preview, and a project convention for registering and overriding handlers.
- **Responsive variants** require a project-owned viewport map aligned with the
  application's CSS breakpoints, configured Storybook viewport globals, and a
  browser-test hook that applies the selected global to the real test page.
  Setting `globals.viewport` alone may update Storybook state without resizing
  the browser used by the Storybook/Vitest integration.
- **Route/deep-link stories** require the application's Storybook routing or URL
  bootstrap and an established parameter/decorator convention.
- **Visual assertions** require the project's screenshot or visual-regression
  runner and naming convention.

If a prerequisite is missing, say which one is missing. Ask whether to add that
integration or omit the optional variant; do not silently bootstrap an
opinionated stack. Do not invent preview imports, `meta.story()` APIs, aliases,
test callbacks, handler wiring, viewport names, or routing parameters.

## First inspect the project's conventions

Find `.storybook/preview.*`, an interaction story near the feature, and actor
helpers. When optional integrations are relevant, also inspect their existing
handlers, decorators, globals, and parameters. Reuse the project's Storybook API
(`preview.meta(...).story(...)` or CSF `Meta` / `StoryObj`) rather than mixing
patterns.

For a project using kahraman, import the page actor and semantic locators:

```ts
import preview from '#.storybook/preview'
import { App } from '#app/App'
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

## Optional recommendation: model server states with MSW

Use this pattern only when the project already satisfies the MSW prerequisites
listed in setup. Kahraman does not require MSW, and a project may use another
network stub, injected service, fixture, or no network layer at all.

When deterministic server-state mocking is available, separate stories for
success, failure, and persistent loading make those states reproducible and
remove branching from tests. Reuse the application's handlers and override only
the affected handler key:

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

If the project uses this handler convention, handlers should represent realistic
`default`, `error`, and `loading` behavior. Do not introduce that convention as
part of an unrelated story change. Regardless of the mocking mechanism, keep
feature workflow steps, expected copy, and business outcomes in the story;
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

## Optional recommendation: responsive variants

Use responsive variants only when the feature has behavior or layout worth
exercising at that size. Do not add a mobile duplicate merely to satisfy a
matrix.

### Responsive setup prerequisite

Keep test dimensions in a dedicated Storybook config module and align them with
the application's actual design-system breakpoints. Include a desktop fallback
so stories without a viewport global do not inherit a preceding test's size:

```ts
// .storybook/viewports.ts
export const FALLBACK_VIEWPORT = { width: 1280, height: 720 } as const

const breakpointWidths = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
} as const

export function getViewportSize(name: string) {
	const width = breakpointWidths[name as keyof typeof breakpointWidths]
	return width === undefined ? null : { width, height: FALLBACK_VIEWPORT.height }
}
```

Update this map whenever the application's CSS breakpoints change. Do not copy
these example widths when the project uses different breakpoints.

The Storybook/Vitest test integration may not resize its real browser page from
`globals.viewport`. In that setup, add a preview `beforeEach` workaround that
translates the Storybook global into the browser provider's viewport API:

```ts
// .storybook/preview.ts
import { FALLBACK_VIEWPORT, getViewportSize } from './viewports'

const preview = definePreview({
	beforeEach: async ({ globals }) => {
		// Keep manual Storybook rendering independent of the test-runner API.
		if (!(globalThis as Record<string, unknown>)['__vitest_worker__']) return

		const { page } = await import('vite-plus/test/browser')
		const global = globals['viewport'] as { value?: string } | string | undefined
		const name = typeof global === 'string' ? global : global?.value
		const viewport = (name ? getViewportSize(name) : null) ?? FALLBACK_VIEWPORT
		await page.viewport(viewport.width, viewport.height)
	},
})
```

The browser API import is runner-specific; use the API already configured by the
project rather than adding Vite+ solely for this workaround. Preserve any
existing `beforeEach` setup and cleanup when composing this logic. Verify with a
story test that the page's real dimensions change, not only the toolbar value.

Once this setup exists, a responsive story may select its configured viewport.
Reuse the corresponding desktop story's parameters so other setup cannot drift:

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

Use the repository's configured viewport-global shape; some projects use
`{ value: 'sm', isRotated: false }`, while others use `'sm'`. If the viewport map
or test-runner resize hook is absent, omit the variant or handle responsive
setup as a separate explicit task.

## Review checklist

- The story initializes kahraman and uses the local Storybook convention.
- Locators use roles and accessible names; scopes prevent accidental global hits.
- Async assertions wait on visible lifecycle state, not arbitrary timeouts.
- The story spells out domain behavior; shared actor helpers remain generic and
  readable.
- Test names describe outcomes and comments explain non-obvious regressions or
  synchronization constraints.
- Optional MSW, routing, responsive, or visual patterns are used only when their
  project setup exists and the scenario benefits from them.
- When MSW is present, overrides are narrow and existing defaults remain intact.
- Distinct stories represent meaningful reproducible states, not a mandatory
  success/error/loading/mobile matrix.
