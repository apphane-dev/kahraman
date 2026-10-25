# 10: `fill` and `clear` reject `<textarea>`

**What to build:** `I.fill` and `I.clear` work on a multi-line text field.
Both reject anything but an `HTMLInputElement`, so a `<textarea>` throws
"Expected locator to resolve to an HTMLInputElement".

Core fix per ADR 0003.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] `fill` and `clear` accept `<textarea>` and keep accepting `<input>`.
- [ ] React Aria Components `textarea` passes; its known-gap marker is removed.
- [ ] A changeset describes the fix.
