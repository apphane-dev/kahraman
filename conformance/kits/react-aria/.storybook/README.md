# React Aria fixture playground

From the repository root:

```sh
pnpm --filter kahraman-conformance-react-aria run storybook
mise run conformance
```

The Storybook command builds Kahraman first and serves this kit on port 6006.
Use a component's base story to interact manually, or select its named test
entry to run the Kahraman journey. Stories use the CSF Next preview factory.

React Aria Components is headless. `preview.ts` imports `../src/fixtures.css`
for typography, spacing, controls, focus rings, selected and disabled states,
popovers, dialogs, and toasts. It reuses the repository's brand tokens and local
fonts, with no external font requests. Browser tests load the same stylesheet.

Keep presentation here, not in the published actor or shared scenarios. Use
React Aria's default classes and state data attributes. Decorative checkbox,
switch, and select indicators are `aria-hidden` so accessible names stay the
same. Do not override hidden elements, reset native inputs, or add text through
CSS. React Aria owns semantics, visibility, focus management, and popover positioning.
There are no animations, so tests do not depend on transition timing.

Component fixtures are in `../src/fixtures.tsx`. The conformance stories use
`runnerFor(manifest)` and the shared contract. Actor-specific regressions live
in `../regressions/` and are not included in the generated matrix. Fixtures
resolve Kahraman through `dist/`, so rebuild after changing core source.
