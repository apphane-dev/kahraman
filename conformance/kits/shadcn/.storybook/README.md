# shadcn/ui playground: Radix, Nova

This project tests the generated Radix-based shadcn components, using the Nova
style and neutral theme. It does not establish compatibility with raw Radix
Primitives or shadcn's Base UI implementation. Toasts use shadcn's Sonner wrapper.

From the repository root:

```sh
pnpm --filter kahraman-conformance-shadcn run storybook
pnpm --filter kahraman-conformance-shadcn run test
mise run conformance
```

The Storybook command builds Kahraman first, then serves this kit on port 6007.
Select a base component story to try it manually, or its named test entry to run
the actor journey. This kit and React Aria use the shared test preset in
`../../../storybook/`, but each owns its renderer and CSS.

The twelve scenarios run through the shared contract and `runnerFor(manifest)`
with no kit-specific actor methods. The
[conformance matrix](../../../MATRIX.md) lists which pass and which are known
gaps. A known-gap test is green only while the scenario still fails for the
recorded reason, so native select works by hand even though the actor cannot
drive it yet.

`../src/components/ui/` contains the official CLI-generated sources and upstream
license. Read its provenance guide before regenerating. The original component
classes and behavior are intact; local formatting is the only source change.
`../src/styles.css` loads the generated neutral theme, Tailwind utilities,
shadcn state variants, animations, and locally bundled Geist font. The only
extra CSS controls the story's page width and padding. Tests load the same CSS.

Stories use `preview.meta(...).story(...)` and literal `.test` names. Fixtures
live in `../src/fixtures.tsx`; the manifest and story declarations generate the
matrix. Import the built `kahraman` package, not a source-path shortcut, so
browser tests exercise the package consumers install.
