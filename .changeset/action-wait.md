---
'kahraman': minor
---

`I.click`, `I.fill`, `I.clear`, and the trigger of `I.selectOption` wait for their locator to match, up to Testing Library's `asyncUtilTimeout`, so an action right after an overlay opens or closes finds a target the overlay hid for a moment. Only a missing element is retried: an ambiguous or invalid locator fails at once, and the action runs once. `createActor({ actionTimeout })` sets the wait for one actor; `0` disables it. `I.see` and `I.dontSee` do not wait.
