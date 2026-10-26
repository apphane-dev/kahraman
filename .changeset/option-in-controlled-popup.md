---
'kahraman': patch
---

`I.selectOption` looks up the option in the popup the trigger's `aria-controls` names, so another open listbox with an option of the same name no longer makes the lookup ambiguous. A trigger without `aria-controls` still needs the option to be unique in the document.
