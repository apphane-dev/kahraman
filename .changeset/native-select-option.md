---
'kahraman': minor
---

`I.selectOption` on a native `<select>` picks the option through user-event's `selectOptions`, so the value changes and `change` fires. A hand-built `StoryContext` must now provide `userEvent.selectOptions`; Storybook's context already does.

Native option lookup also waits within `optionTimeout`. Trigger resolution and the native/custom branch choice happen after `clickDelay`, so a replacement during that delay is not missed.
