# 04: Radix / shadcn kit fixture

**What to build:** the full conformance catalog runs against Radix / shadcn, and the
conformance matrix shows its column. Expected gaps: portalled overlays.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A private Radix / shadcn kit fixture, its own Storybook project, loads the kit's
      default theme and implements every scenario it has a widget for.
- [ ] Every failing scenario is a known gap naming a ticket, classified per
      ADR 0003 as a core fix or a kit-extension candidate, and confirmed to fail
      for the stated reason.
- [ ] The `conformance` CI job includes the kit; the regenerated matrix is
      committed.
- [ ] The Storybook setup shared by kit fixtures is extracted into a preset that
      this fixture and the React Aria Components fixture both use.
