---
'kahraman': patch
---

`selectOption` waits for the option to appear after opening the trigger, up to Testing Library's `asyncUtilTimeout` (1 s by default), so it works with listboxes that fill late: lazy mounting, open transitions, or options loaded on open. Based on #10.
