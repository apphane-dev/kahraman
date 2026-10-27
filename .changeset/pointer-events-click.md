---
'kahraman': minor
---

`I.click` and `I.selectOption` handle a target with `pointer-events: none`. When the target turned it off itself and the browser hits its parent at the target's center, as with Vuetify's select input, they click the parent; a covering control is never clicked instead. Otherwise the action waits within `actionTimeout`, as during an overlay's open transition, then user-event reports why it cannot click.
