# Shared conformance Storybook setup

Private workspace package used by the kit fixtures.

- `kahraman-conformance-storybook/preset` registers the Vitest addon and disables
  telemetry. React-specific CSF Next flags and docgen settings stay in each
  React kit's main configuration.
- `kahraman-conformance-storybook/vitest` exports `kitTestConfig({ name, port })`.
  It runs the story tests in headless Chromium and points failure links at the
  kit's own Storybook port. Run it from the kit directory, where `.storybook`
  lives; package scripts already do this.
- `kahraman-conformance-storybook/waits` raises Testing Library's
  `asyncUtilTimeout` to 5 s. Import it from the kit's preview, so manual
  playback and story tests wait alike.

Keep framework selection, renderer flags, story globs, preview factories, Vite plugins, fonts,
and CSS in each kit. A Vue kit can reuse this test wiring with its own Storybook
framework. Do not add a shared component theme or a cross-kit CSS reset here.
