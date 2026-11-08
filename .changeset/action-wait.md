---
'kahraman': minor
---

`I.click`, `I.fill`, `I.clear`, and the trigger of `I.selectOption` wait for their locator to match, up to Testing Library's `asyncUtilTimeout`, so an action right after an overlay opens or closes finds a target the overlay hid for a moment. Only a missing element is retried: an ambiguous or invalid locator fails at once, and the action runs once. `createActor({ actionTimeout })` sets the wait for one actor; `0` disables it. Actions use immediate role/text lookups for explicit waiting locators and their scopes, keeping the action deadline in control. Polling stops at that deadline. `I.see` and `I.dontSee` add no wait themselves; an explicitly waiting locator can still wait before `I.see` asserts.
