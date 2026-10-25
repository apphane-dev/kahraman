# 05: MUI kit fixture

**What to build:** the full conformance catalog runs against MUI, and the
conformance matrix shows its column. Expected gaps: portalled overlays, listbox Select over a hidden native input, `<textarea>`.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A private MUI kit fixture, its own Storybook project, loads the kit's
      default theme and implements every scenario it has a widget for.
- [ ] Every failing scenario is a known gap naming a ticket, classified per
      ADR 0003 as a core fix or a kit-extension candidate, and confirmed to fail
      for the stated reason.
- [ ] The `conformance` CI job includes the kit; the regenerated matrix is
      committed.
