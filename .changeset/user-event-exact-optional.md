---
'kahraman': patch
---

Accept the `userEvent` imported from `storybook/test` in `I.init` under `exactOptionalPropertyTypes`. Its `type()` options are stricter than the `userEvent.setup()` instance's, so the context failed to typecheck.
