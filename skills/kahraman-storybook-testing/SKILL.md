---
name: kahraman-storybook-testing
description: Apply kahraman's recommended style when writing, extending, reviewing, or debugging Storybook interaction tests and portable stories. Use for Storybook `*.stories.ts(x)` tests, accessible actor/locator assertions, user-journey structure, async stabilization, taming noisy Testing Library element-not-found diagnostics, and maintaining a project-local `.storybook/README.md`. Also guides optional MSW state stories and responsive variants when configured.
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

Read `.storybook/README.md` first when it exists. Then verify its claims against
`.storybook/main.*`, `.storybook/preview.*`, package scripts, an interaction
story near the feature, and actor helpers. When optional integrations are
relevant, also inspect their existing handlers, decorators, globals, and
parameters. Reuse the project's Storybook API (`preview.meta(...).story(...)` or
CSF `Meta` / `StoryObj`) rather than mixing patterns.

## Maintain a project-local Storybook guide

Recommend keeping `.storybook/README.md` beside the configuration as the
project's self-contained guide for writing and reviewing interaction stories.
This local document should preserve the essence of Kahraman's recommended style
while replacing generic setup guidance with verified project facts.

Create or update it after inspecting the project, not by blindly copying this
skill. Strip prerequisites that the repository already satisfies, generic
installation instructions, alternative APIs the project does not use, and
examples that conflict with local conventions. Keep a short link to Kahraman as
the upstream rationale, but make the local guide sufficient for everyday work.

Capture the conventions a contributor otherwise has to rediscover:

- the exact story format and actor initialization hook (`loaders`, `beforeEach`,
  or `play`), with imports from the project's adapter;
- where stories, fixtures, page actors, mock handlers, and low-level test helpers
  belong, including the boundary between reusable mechanics and domain journeys;
- accessible locator, scoping, stabilization, retry, and optional-UI agreements;
- package-manager scripts for Storybook, interaction tests, watch mode, and
  focused runs, including unsupported CLI flags or other local gotchas;
- tag meanings and CI agreements, such as `@smoke` for gating journeys and
  `@visual` for intentional screenshot contracts;
- configured viewport names, their source file, breakpoint agreement, and the
  preview test-runner resize workaround when responsive testing is enabled;
- MSW handler registration and override conventions, routing/deep-link
  parameters, persisted-state reset behavior, and cleanup hooks when present;
- screenshot helpers, baseline naming/review policy, diagnostics flags, and
  boundaries that legitimately require raw DOM or browser APIs.

Only document conventions supported by code or scripts in the current
repository. Use exact local paths and commands. If the guide is stale, update it
in the same change when the relevant Storybook agreement changes. Avoid turning
it into a copy of all Storybook configuration; explain the contributor-facing
contract and point to implementation files for details.

## Reference application setups

Use these applications as examples of the recommended style in a working
Storybook stack:

- [`apphane-dev/karkas/.storybook`](https://github.com/apphane-dev/karkas/tree/main/.storybook)
  — application integration stories with MSW, routing, project breakpoints, and
  a preview hook that applies viewport globals to the browser test page.
- [`reatom/reatom/packages/admin/.storybook`](https://github.com/reatom/reatom/tree/main/packages/admin/.storybook)
  — Reatom Admin's project adapter, preview factory, browser-test setup, viewport
  configuration, and project-local testing guide.

Read their current configuration and nearby stories when a concrete example is
useful. Treat them as references, not templates: copy no alias, command, tag,
handler, breakpoint, or lifecycle convention until the target project supports
it.

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

## Use the actor API before dropping to low-level test calls

Prefer Kahraman's intent-level methods when they express the interaction or
assertion. Besides `see`, `dontSee`, `click`, and `fill`, check for the existing
actor operations before reaching for raw `userEvent` or DOM assertions:

- field and state assertions: `seeInField`, `seeChecked`, `seeDisabled`,
  `seeAttribute`, and `seeNumberOfElements`;
- interactions: `clear`, `selectOption`, and `press`;
- extraction: `grabTextFrom` and `grabTextFromAll`;
- controlled resilience: `tryTo`, `retryTo`, and `hopeThat`.

Use `tryTo` only for genuinely optional behavior, not to turn a required outcome
into a silent branch. Use `hopeThat` when several independent assertions should
be reported together, and finish with `I.hopeThat.noErrors()` so collected
failures cannot pass unnoticed. Raw Storybook/browser APIs remain appropriate
for capabilities the actor does not model, such as focus, history, geometry, or
screenshots.

## Build reusable page vocabulary with actor extensions

Use `I.extend(...)` for reusable page-level controls and expectations. Keep an
extension narrowly typed to the base actor methods it needs, and name its methods
in user/domain language. Extensions should remove repeated mechanics without
hiding the causal steps or business outcome of a story. Prefer `seeError()` or
`selectCountry()` over an opaque `completeCheckoutJourney()` helper.

Keep environment-specific pacing explicit in actor construction. If manual
Storybook playback benefits from visible clicks, configure `clickDelay` in the
project adapter while retaining a zero delay for automation; do not slow every
browser test by default.

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

## Opt in to concise element-not-found diagnostics

On a full application mount, a failed Testing Library `getByRole` query can print
hundreds of lines because its error lists every accessible role on the page. When
that noise makes Storybook interaction failures hard to inspect, recommend the
opt-in `kahraman/preview` annotation. It keeps only the queried role's relevant
near-misses and caps the diagnostic DOM output:

```ts
// .storybook/preview.ts
import kahraman from 'kahraman/preview'

export default {
	...kahraman,
	// ...the project's other preview config
}
```

Compose this with the project's existing preview export rather than replacing
its decorators, loaders, parameters, or lifecycle hooks. Inspect the local
preview format first and preserve any existing `beforeEach` behavior. If a
simple object spread would overwrite the project's hook, call
`configureDiagnostics(context.parameters?.kahraman)` from the existing hook
instead of dropping either behavior.

Tune or opt out for an individual story through `parameters.kahraman`:

```ts
parameters: {
	kahraman: {
		captureRoleListing: false, // retain Testing Library's full role listing
		maxLength: 4000, // raise the truncation ceiling
		// getElementError: myOwnHandler, // the custom handler wins entirely
	},
}
```

`captureRoleListing: false` disables role-list filtering but still applies the
length cap. `maxLength` changes that cap. Supplying `getElementError` bypasses
Kahraman's formatting entirely, so preserve a project's custom handler instead
of silently overriding it.

Outside Storybook, or when the project explicitly prefers imperative setup,
install the same behavior with `configureDiagnostics()`:

```ts
import { configureDiagnostics } from 'kahraman/preview'

configureDiagnostics({ maxLength: 4000 })
```

This annotation changes Testing Library's element-not-found output only; it
does not replace actor initialization or fix an inaccessible/missing element.
Kahraman actor failures still provide their step trace and retargeted story/page-
actor stack. Keep the queried role and accessible-name diagnosis visible, and do
not use truncation to hide the cause of a failing journey.

Live actor-step logging (`VITE_TEST_STEPS`) and failure screenshots
(`test.browser.screenshotFailures`) are consumer-runner settings, not preview
annotation options. Reuse the project's environment and Vitest conventions
rather than silently enabling them. Record preview wiring, project-wide
parameter defaults, and any such diagnostics flags in `.storybook/README.md`
when they become part of the local testing contract.

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

- `.storybook/README.md` was read first when present, and changes to Storybook
  conventions are reflected there with verified local commands and paths.
- The story initializes kahraman and uses the local Storybook convention.
- Locators use roles and accessible names; scopes prevent accidental global hits.
- Async assertions wait on visible lifecycle state, not arbitrary timeouts.
- When `kahraman/preview` diagnostics are enabled, existing preview hooks remain
  composed and per-story `parameters.kahraman` overrides are intentional.
- The story spells out domain behavior; shared actor helpers remain generic and
  readable.
- Test names describe outcomes and comments explain non-obvious regressions or
  synchronization constraints.
- Optional MSW, routing, responsive, or visual patterns are used only when their
  project setup exists and the scenario benefits from them.
- When MSW is present, overrides are narrow and existing defaults remain intact.
- Distinct stories represent meaningful reproducible states, not a mandatory
  success/error/loading/mobile matrix.
