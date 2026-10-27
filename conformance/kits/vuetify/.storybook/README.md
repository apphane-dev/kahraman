# Vuetify conformance playground

This kit uses `vuetify@4.3.0` on Vue 3 with its default theme, the MDI SVG icon
set, and locally bundled Roboto weights 400, 500, and 700. The preview registers
every Vuetify component and wraps stories in `v-app`, with no component style,
transition, or role overrides.

From the repository root:

```sh
pnpm --filter kahraman-conformance-vuetify run storybook
pnpm --filter kahraman-conformance-vuetify run test
mise run conformance
```

Storybook builds Kahraman first, then serves this kit on port 6010.

Fixtures in `../src/fixtures.ts` are `defineComponent` templates, compiled at
runtime, so the kit needs no SFC tooling. Vuetify has no native select
component, so `native-select` is n/a.

The fixture adds the ARIA an accessible app supplies itself: `aria-labelledby`
on `v-dialog`, which lands on the `role="dialog"` overlay, and labelled
`role="tabpanel"` window items. It keeps the roles Vuetify renders.

`VSwitch` renders a checkbox input without `role="switch"`, so the `switch`
story passes a checkbox workaround. The [conformance matrix](../../../MATRIX.md)
records the known gaps.

`VMenu` renders its entries as list items, so the `menu` scenario stays a known
gap. The opt-in `kits/vuetify` extension adds `I.chooseMenuItem(trigger, name)`;
`../regressions/menu-extension.stories.ts` tests it next to the plain actor's
recorded failure.
