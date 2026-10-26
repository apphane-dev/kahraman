# Ark UI conformance playground

This kit uses `@ark-ui/react@5.39.3`. Ark is headless, so `../src/styles.css`
adds a small presentation layer over Ark's `data-scope`/`data-part`
attributes. It changes no visibility, positioning, or roles.

From the repository root:

```sh
pnpm --filter kahraman-conformance-ark run storybook
pnpm --filter kahraman-conformance-ark run test
mise run conformance
```

Storybook builds Kahraman first, then serves this kit on port 6009.

The [conformance matrix](../../../MATRIX.md) records passes, known gaps, and
different patterns. Ark's Switch exposes its hidden input as a checkbox, without
`role="switch"`, so the `switch` story passes a checkbox workaround.

`../regressions/select-option.stories.tsx` holds the Ark Select journeys from
#10 and a picker whose options load after it opens. The last one fails if
`selectOption` stops waiting for its option.
