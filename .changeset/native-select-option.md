---
'kahraman': patch
---

`I.selectOption` on a native `<select>` picks the option through user-event's `selectOptions`, so the value changes and `change` fires. A hand-built `StoryContext` must now provide `userEvent.selectOptions`; Storybook's context already does.
