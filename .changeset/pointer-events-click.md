---
'kahraman': minor
---

`I.click` and `I.selectOption` click where a user's click lands. A target that turns off its own `pointer-events` passes the click to its parent, as Vuetify's select input does. A target inside a container that turned pointer events off, as an overlay does during its open transition, makes the action wait within `actionTimeout`; past it, user-event reports why it cannot click.
