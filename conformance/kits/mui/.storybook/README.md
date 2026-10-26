# MUI conformance playground

This kit uses `@mui/material@9.5.0` with its default `createTheme()` configuration,
`ThemeProvider`, `CssBaseline`, and locally bundled Roboto weights 400, 500, and 700. The preview adds page padding and a maximum width, but no component style,
transition, portal, or role overrides.

From the repository root:

```sh
pnpm --filter kahraman-conformance-mui run storybook
pnpm --filter kahraman-conformance-mui run test
mise run conformance
```

Storybook builds Kahraman first, then serves this kit on port 6008. Select a
component's base story to try it manually, or its named test to run the actor
journey. MUI uses the same shared preset and Chromium test settings as the other
kits, but has its own Storybook and styling so CSS resets do not cross kits.

The twelve scenarios run unchanged through the shared contract and
`runnerFor(manifest)`. The [conformance matrix](../../../MATRIX.md) records the
current passes and known gaps. A checked known-gap test is green only while the
scenario fails for the recorded reason; it does not mean the interaction works.

`../regressions/native-select.stories.tsx` changes this fixture's preselected
option with `I.selectOption` inside an actor scope and checks the change event.

Fixtures live in `../src/fixtures.tsx`. They use Material UI components:
`TextField` for single-line, multiline, and custom Select fields, `NativeSelect`
for native selection, `FormControlLabel` for checkbox/switch labels, and the
stock Dialog, Menu, Tabs, and Snackbar. Core Tabs requires the application's
labeled `role="tabpanel"` composition, which the fixture supplies using MUI Box.
No kit-specific actor extension or alternative ARIA-pattern workaround is used.

Keep scenario labels and outcomes in the shared contract. Do not turn off
portals or transitions to make a test pass. Kit-specific regressions stay in
`../regressions/`, outside the matrix generator's story declarations. All
fixtures import the built `kahraman` package through its exports, not a source
shortcut, so rebuild before testing changes to core code.
