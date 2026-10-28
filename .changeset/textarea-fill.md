---
'kahraman': patch
---

`I.fill` and `I.clear` accept a `<textarea>` as well as an `<input>`.

`I.fill` treats braces and brackets as literal text instead of keyboard commands.
For textareas, CRLF and CR line endings are normalized to LF and each line break
is typed as Enter, so the application's Enter handlers can handle or prevent it.
