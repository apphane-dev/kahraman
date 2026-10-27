# 0003 — Standard-driven gaps are fixed in core, not in kit extensions

- **Status:** Accepted
- **Date:** 2026-10-25
- **Scope:** actor (`src/`) vs kit extensions

A known gap rooted in a web standard (native `<select>`, `<textarea>`,
portalled overlays, shadow DOM) is fixed in the core actor. Only a quirk
specific to one UI kit goes into a kit extension. Without this rule, every
extension patches the same core gaps and every UI kit ends up needing one.
