---
'kahraman': patch
---

`I.selectOption` looks up the option in the popup the trigger's `aria-controls` names, so another open listbox with an option of the same name no longer makes the lookup ambiguous. Each try looks up the trigger and its popup again, since opening may replace the trigger's node, and a named popup that has not mounted yet is waited for. A trigger without `aria-controls` still needs the option to be unique in the document. `optionTimeout` covers both finding the option and waiting until it takes clicks.
