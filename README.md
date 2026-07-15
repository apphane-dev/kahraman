# kahraman

**Accessibility-first, codecept-style test actor and locator DSL for Storybook
portable stories and Vitest browser mode.**

`kahraman` gives you a small, declarative `I.see(...)` / `I.click(...)` actor
built on Testing Library queries, plus a fluent locator DSL that biases every
assertion toward roles, accessible names, and visible text. It runs inside a
Storybook story `play` function or a Vitest browser test — anywhere you have a
canvas and `userEvent`.

Built and maintained by [apphane](https://apphane.dev/).

[![Skills](https://skills.sh/b/apphane-dev/kahraman)](https://skills.sh/apphane-dev/kahraman)

```ts
import { createActor, button, heading, role } from 'kahraman'

const I = createActor()

export const Default = meta.story()
Default.test('signs the user in', async (context) => {
	I.init(context)
	await I.see(heading('Sign in'))
	await I.fill(role('textbox', 'Email'), 'ada@example.com')
	await I.click(button('Continue'))
	await I.waitExit(role('status'))
	await I.see(heading('Welcome, Ada'))
})
```

## Why accessibility-first

Every locator resolves through Testing Library's accessibility tree — by role,
accessible name, heading, link, button, or visible text — before you ever reach
for a lower-level selector. Tests written this way assert what a user (and a
screen reader) actually perceives, and they surface real accessibility gaps: if
you can't target an element by its role or name, neither can assistive tech.
`kahraman` deliberately keeps the public locator surface small so the path of
least resistance is also the accessible one.

## Install

```sh
npm install --save-dev kahraman
# or: pnpm add -D kahraman
```

`storybook` (which provides `storybook/test`, and with it Testing Library and
`userEvent`) is a **peer dependency** — you already have it. `kahraman` ships
ESM only and is renderer-agnostic: it reads only `canvasElement` and `userEvent`
from the story context, so it works with the React, Vue, and Svelte renderers
alike.

### Or vendor the source with jsrepo

Prefer to own the code? `kahraman` is also published as a
[jsrepo](https://jsrepo.dev) registry, so you can copy the source straight into
your project and adapt it:

```sh
# the actor + locator DSL
npx jsrepo add github/apphane-dev/kahraman/actor

# the opt-in diagnostics preview annotation
npx jsrepo add github/apphane-dev/kahraman/preview

# include the unit tests / example page actor too
npx jsrepo add --with test --with example github/apphane-dev/kahraman/actor
```

The full source also lives in `src/` inside the published npm tarball, so it is
available for reference even when you install the package normally.

## AI agent skill

The repository includes a portable Agent Skill for writing and reviewing these
Storybook tests. Install it with [`skills`](https://skills.sh):

```sh
npx skills add apphane-dev/kahraman --skill kahraman-storybook-testing
```

Or install directly from a checked-out copy:

```sh
npx skills add . --skill kahraman-storybook-testing
```

The skill lives at
[`skills/kahraman-storybook-testing/SKILL.md`](./skills/kahraman-storybook-testing/SKILL.md),
so `npx skills add apphane-dev/kahraman --list` can discover it from the GitHub
repository.

### Reference application setups

- [`guria/modern-stack/.storybook`](https://github.com/guria/modern-stack/tree/main/.storybook)
  — application integration stories with MSW, routing, and viewport-aware
  browser tests.
- [`reatom/reatom/packages/admin/.storybook`](https://github.com/reatom/reatom/tree/main/packages/admin/.storybook)
  — Reatom Admin's adapter, preview factory, test setup, viewports, and local
  Storybook testing guide.

These are examples rather than required infrastructure; adopt only the parts
supported by your project's Storybook setup.

## Usage

### Create and initialize an actor

```ts
import { createActor } from 'kahraman'

const I = createActor()
// Inside a story play / test, before any actor call:
I.init(context) // context: the Storybook StoryContext (any renderer)
```

`createActor()` returns a fresh actor with its own step trace. Call
`I.init(context)` first — it wires up the canvas and resets the trace.

To make clicks easier to follow when manually playing a story, configure an
explicit delay. The default is `0`, so automated tests are not slowed down:

```ts
const I = createActor({
	clickDelay: navigator.webdriver ? 0 : 500,
})
```

Keeping the environment check in the consumer makes the pacing policy visible
and lets each Storybook choose how it distinguishes manual and automated runs.

### Locators

Build locators with `role`, `text`, and the `heading` / `button` / `link`
shorthands, then refine them fluently:

```ts
import { role, text, heading, button, link } from 'kahraman'

role('textbox', 'Email') // by role + accessible name
heading('Dashboard') // role('heading', 'Dashboard')
text(/items? found/) // by visible text (string or RegExp)

link('Storage').options({ current: 'page' }) // extra Testing Library options
button('Save').within(role('dialog')) // scope to a container
role('listitem').all() // all matches (for counts)
role('status', 'Loading').wait() // findBy* (async)
role('alert').maybe() // queryBy* (nullable)
```

| Transition   | Query mode          | Returns              |
| ------------ | ------------------- | -------------------- |
| _(default)_  | `getBy*`            | one element (throws) |
| `.wait()`    | `findBy*`           | `Promise<element>`   |
| `.all()`     | `getAllBy*`         | `element[]`          |
| `.maybe()`   | `queryBy*`          | `element \| null`    |
| `.within(s)` | scope to `s`        | same variant, scoped |
| `.options()` | merge query options | same variant         |

`.within(scope)` accepts a locator, an `HTMLElement`, or `'global'` (the whole
document body).

### Actor methods

```ts
// Assertions
await I.see(role('alert')) // present in the document
await I.dontSee(button('Delete')) // absent
await I.waitExit(role('status')) // wait for it to disappear (stabilization)
await I.seeInField(role('textbox', 'Email'), 'ada@example.com')
await I.seeChecked(role('checkbox', 'Remember me'))
await I.seeDisabled(button('Save'))
await I.seeAttribute(link('Docs'), 'target', '_blank')
await I.seeNumberOfElements(role('listitem').all(), 3)

// Interactions
await I.click(button('Save'))
await I.fill(role('textbox', 'Email'), 'ada@example.com')
await I.clear(role('textbox', 'Email'))
await I.selectOption(role('combobox', 'Country'), 'Portugal')
await I.press('{Enter}')

// Scoping
await I.within(role('main'), async () => {
	await I.see(heading('Details'))
})

// Extraction
const title = await I.grabTextFrom(heading())
const rows = await I.grabTextFromAll(role('row').all())

// Resilience
await I.retryTo((n) => I.see(text(`Attempt ${n}`)), 3, 200)
if (await I.tryTo(() => I.see(role('dialog')))) {
	/* optional */
}

// Soft assertions — collect failures, report all at once
await I.hopeThat(() => I.see(heading('A')))
await I.hopeThat(() => I.see(heading('B')))
I.hopeThat.noErrors() // throws an AggregateError if any failed
```

### Extending with page actors

Keep reusable, page-level expectations out of your stories with `I.extend(...)`:

```ts
import { button, heading, role, text, type BaseActor } from 'kahraman'

const withPageError =
	(error: { title: string; description?: string }) => (I: Pick<BaseActor, 'see'>) => ({
		seeError: async () => {
			await I.see(heading(error.title))
			if (error.description) {
				await I.see(text(error.description))
			}
			await I.see(role('alert'))
			await I.see(button('Try again'))
		},
	})

const I = createActor().extend(withPageError({ title: 'Something went wrong' }))
// ...later: await I.seeError()
```

See [`examples/pageActor.ts`](./examples/pageActor.ts) for a fuller illustration.

For a real-world app that exercises `kahraman` in its Storybook stories, see
[`guria/modern-setup`](https://github.com/guria/modern-setup).

## Failure diagnostics

When an actor call fails, `kahraman` augments the error to make the failure
readable:

- **Step trace** — the message ends with every actor call that ran, `✔`/`✖`,
  with locator labels (e.g. `✖ I.see(heading "Welcome")`).
- **Retargeted stack** — the code frame points at _your_ story / page-actor call
  site, not `kahraman`'s internals. Internal frames are detected relative to the
  package's own module URL, so this works whether kahraman is installed or
  vendored.

### Opt-in: tame element-not-found output (`kahraman/preview`)

Testing Library's `getByRole` misses dump a listing of _every_ accessible role
on the page — hundreds of lines on a full app mount. The `kahraman/preview`
annotation filters that to just the queried role's near-misses and caps the DOM
dump. Add it to your Storybook preview:

```ts
// .storybook/preview.ts
import kahraman from 'kahraman/preview'

export default {
	...kahraman,
	// ...your other preview config
}
```

Tune or opt out per story via parameters:

```ts
parameters: {
  kahraman: {
    captureRoleListing: false, // keep TL's full role listing (still length-capped)
    maxLength: 4000, // raise the truncation ceiling
    // getElementError: myOwnHandler, // your handler wins entirely
  }
}
```

Outside Storybook you can wire it up imperatively with
`configureDiagnostics()` from `kahraman/preview`.

## Consumer configuration

Two behaviors are controlled by _your_ Vitest/Storybook setup, not by the
package:

- **`VITE_TEST_STEPS`** — set `VITE_TEST_STEPS=true` (a Vite/Vitest env var) to
  log each actor step live as it runs, like `codeceptjs run --steps`. `kahraman`
  reads it defensively; when unset (or under plain Node), logging is off.
- **`screenshotFailures`** — failure screenshots are a
  [Vitest browser mode](https://vitest.dev/guide/browser/) feature. Configure
  `test.browser.screenshotFailures` in your own Vitest config to write a
  screenshot next to the story on failure.

## Testing the pure helpers

`kahraman`'s own test suite unit-tests only the **Storybook-free** logic:
locator label construction, step-label formatting, role-listing filtering,
message capping, and stack-frame retargeting. The full actor behavior requires a
real Storybook browser context and is exercised by consumers' stories — that
boundary is intentional. The DOM-touching modules (`actor.ts`, `preview.ts`) run
only in the browser.

## Development

This repo uses the [Vite+](https://viteplus.dev/) / Oxc toolchain:

| Task       | Command            | Tool                                   |
| ---------- | ------------------ | -------------------------------------- |
| Typecheck  | `pnpm typecheck`   | `tsc` (TypeScript 7, native)           |
| Lint       | `pnpm lint`        | oxlint (via `vp lint`)                 |
| Analyze    | `pnpm lint:fallow` | fallow (dead-code, dupes, health)      |
| Format     | `pnpm format`      | oxfmt (via `vp fmt`)                   |
| Test       | `pnpm test`        | Vitest (via `vp test`)                 |
| Build      | `pnpm build`       | tsdown (Rolldown) → ESM + `.d.ts`      |
| Everything | `pnpm check`       | typecheck + lint + fallow + fmt + test |

Formatter and linter configuration lives in the `fmt` / `lint` blocks of
`vite.config.ts` (the Vite+ convention), not in separate `.oxfmtrc.json` /
`.oxlintrc.json` files. Notable engineering decisions are recorded under
[`docs/decisions/`](./docs/decisions) — e.g. why type-aware linting is off by
default ([0001](./docs/decisions/0001-type-aware-linting.md)).

Node, pnpm, and the git-hook runner are pinned with
[mise](https://mise.jdx.dev/) (`mise install`). Git hooks run through
[hk](https://hk.jdx.dev/) — configured in `hk.pkl`, install them once with
`hk install` (pre-commit: format + lint + typecheck + hygiene; pre-push adds
fallow).

Publish quality is gated by `publint` and
[`@arethetypeswrong/cli`](https://github.com/arethetypeswrong/arethetypeswrong.github.io)
against the packed tarball, releases run through
[Changesets](https://github.com/changesets/changesets), and every commit gets an
installable preview via [pkg.pr.new](https://pkg.pr.new).

## Acknowledgements

kahraman stands on prior art:

- **[CodeceptJS](https://codecept.io)** (MIT) — the actor DSL is modelled on its
  `I.see(...)` / `I.click(...)` / `hopeThat` / `retryTo` / `tryTo` style. The
  concepts and API shape are borrowed; the implementation here is original (no
  CodeceptJS code is used or redistributed).
- **[Testing Library](https://testing-library.com)** — every locator resolves
  through its accessibility-first queries.
- **[Storybook](https://storybook.js.org)** — the actor runs against the
  `storybook/test` runtime (portable stories, Vitest browser mode).

## License

[MIT](./LICENSE) © Aleksei Gurianov
