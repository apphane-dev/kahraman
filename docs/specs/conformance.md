# Conformance suite

Status: in progress. [tickets/](../../tickets) and [backlog/](../../backlog)
track what is not built yet.

Checks how well the actor and locator DSL fit popular UI kits. Terms follow
[GLOSSARY.md](../../GLOSSARY.md). Gap fixes follow
[ADR 0003](../decisions/0003-core-before-kit-extensions.md).

The suite is a CI regression check. The conformance matrix is a view of its
declarations, so the two cannot drift. A known gap's story test passes while the
gap stays, so report support from the matrix totals, not from green test counts.

## Layout

```text
conformance/
  scenarios/        private package: scenarios, contract, runner
  storybook/        private preset and Chromium test configuration
  kits/<kit>/       private package: one Storybook project per UI kit
  kits/<kit>/regressions/  browser regressions, not matrix scenarios
  MATRIX.md         generated, checked in
```

- All packages are private workspace members. None appear in the root `files`
  or `registry.json`.
- One Storybook per kit, sharing a small preset. Kits never share a Storybook,
  because their styling stacks and dependency trees conflict.
- Kit fixtures depend on `kahraman` via `workspace:*` and resolve the built
  `dist` through its `exports` map. A conformance run starts with `pnpm build`.
- Tests run as story tests through `@storybook/addon-vitest` in Chromium.
- Kit fixtures load the kit's real default theme. Styles decide what the
  accessibility tree exposes. React Aria Components is headless; its preview
  loads a fixture-only stylesheet for both manual exploration and browser tests.
  It adds visual states without overriding hidden elements or native inputs.
- Kits run their latest version on Storybook 11, pinned in `pnpm-lock.yaml`
  and bumped by hand.

## Scenarios

A scenario is a function of the actor. It runs unchanged against every kit.

| ID                | Exercises                     | Baseline |
| ----------------- | ----------------------------- | -------- |
| `button`          | `click`                       | yes      |
| `button-disabled` | `seeDisabled`                 |          |
| `textbox`         | `fill`, `clear`, `seeInField` | yes      |
| `textarea`        | `fill`, `seeInField`          |          |
| `checkbox`        | `click`, `seeChecked`         | yes      |
| `switch`          | `click`, `seeChecked`         |          |
| `native-select`   | `selectOption` on `<select>`  |          |
| `combobox`        | `selectOption` on a listbox   |          |
| `dialog`          | open, `see` content, close    | yes      |
| `menu`            | open, `click` item            |          |
| `tabs`            | `click` tab, `see` panel      |          |
| `status`          | `see`, `waitExit`             | yes      |

Rules:

- Scenarios use no escape hatches such as `.within(document.body)` or
  extra query options. A kit that needs one shows up as a known gap, which is
  the point.
- A contract module exports every accessible name and expected value
  (the "Email" textbox, the "Country" combobox with option "Portugal"). The
  scenario asserts them, the fixture renders them. The compiler checks both
  sides.
- Each scenario is its own story test and one matrix row.
- Each kit also renders all its fixtures on one page. Its `page` story test,
  `run.page(workarounds)`, is an integration journey: every declared scenario
  in catalog order with one actor. Names must stay unique, overlays must close,
  and portals must not collide with the rest of the page. A known-gap scenario
  stops at its recorded failure and the journey continues without that
  action's effect, so the page does not show every action succeeding.
- Interactions-panel step reporting is out of scope. It does not depend on the
  kit, and `test/steps.test.ts` covers step labels.

## Kit manifest

Each kit exports a manifest: the scenarios it implements, each with one status.

- `'pass'`.
- `{ knownGap, failsWith }`: the number of the ticket that would fix it, and a
  prefix of the primary error diagnostic the scenario fails with today.
- `{ differs, failsWith }`: the valid ARIA pattern the kit renders instead
  (React Aria Components `Select` is `button + listbox`, not a combobox), and
  the error the scenario fails with. Its story test passes a workaround, the
  same journey written for that pattern, which must pass.

The manifest's optional `page: { knownGap, failsWith }` records a page
integration journey that fails although each scenario meets its own status:
widgets that work alone but not side by side.

The kit's stories run scenarios through `runnerFor(manifest)`, and the matrix
generator reads the same data.

- A scenario missing from the manifest is n/a: the kit has no such widget.
- Story titles and test names must be string literals, because Storybook
  indexes them statically. Each kit therefore declares one `Story.test` per
  scenario, named after the scenario ID.
- Each story test body is `run('<id>')` for its own scenario ID, or
  `run('<id>', workaround)` for a different pattern. The types require the
  workaround exactly where the manifest says `differs`.
- A page journey supplies its different-pattern handlers as an inline object
  with static keys, for example `run.page({ combobox: selectByButton })`.
  The generator checks every required key and rejects unexpected keys,
  references, spreads, and computed keys instead of evaluating fixture code.
  The runner also rejects a missing handler at runtime, since a string-indexed
  TypeScript record can be empty despite satisfying the required keyed type.
- The generator fails when a manifest omits a baseline scenario, when declared
  scenarios and story test names differ, when a test body runs another
  scenario, when a workaround is missing for `differs` or present without
  it, when the `page` story test is missing or lacks the workarounds, or when a known gap names a ticket that exists in neither
  `tickets/` nor `backlog/`.

## `expectFailure({ marker, failsWith }, run)`

CSF Next's `story.test` has no `.fails`, so a wrapper does the job for known
gaps and different patterns.

- `run` throws an Error whose message starts with `failsWith`: the test passes, then a
  different pattern runs its workaround.
- `run` throws anything else: the test fails, so a broken fixture cannot pass
  as a known gap.
- `run` resolves: the test fails with `scenario passes, remove marker:
known gap <NN>` (or `differs: <pattern>`).

## Matrix

A script renders scenarios against kits into `conformance/MATRIX.md`, each cell
pass, known gap (linked to its ticket), differs (linked to the stories file
holding the workaround), or n/a. It reads manifests and story
files and needs no browser.
CI regenerates it and runs `git diff --exit-code`. The README links it next to
the supported-frameworks list.

## CI

A `conformance` job, matrix over kits, Chromium only, on every PR with no
`paths` filter. Any `src/` change can break a kit.

## Kits and rollout

| PR  | Kit                   | Risk it probes                            |
| --- | --------------------- | ----------------------------------------- |
| 1   | React Aria Components | reference; strictest ARIA                 |
| 2   | shadcn/ui, Radix/Nova | portals, ARIA-only widgets, native select |
| 3   | MUI                   | portals, listbox Select over hidden input |
| 4   | Vuetify               | Vue renderer                              |
| 5   | Web Awesome           | shadow DOM                                |
| 6   | Ark UI                | options mounted after open, headless      |

PR 1 also carries the scenarios package, contract, runner, matrix
generator, and CI job. Web Awesome lands with every scenario as a known gap. Shadow DOM
support in core is separate work.

The shadcn fixture targets the official CLI's `radix-nova` components and neutral
theme. It does not claim coverage of raw Radix Primitives or Base UI. Generated
component sources, upstream license, and generation details live in the kit.

## Kit extensions

A kit extension starts as a jsrepo registry item (`kits/<kit>`). It becomes an
npm package only on demand.

## Out of scope

- Type-aware linting and awaiting DOM matchers
  ([ADR 0001](../decisions/0001-type-aware-linting.md) follow-up). Separate PR
  after conformance lands, verified by it.
- Changes to the `web-components` entry in `package.json`.
- Storybook 9 and 10 per kit. The `storybook-compatibility` job covers core.
