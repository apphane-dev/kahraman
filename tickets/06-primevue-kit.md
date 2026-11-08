# 06: PrimeVue kit fixture

**What to build:** the full conformance catalog runs against PrimeVue, and the
conformance matrix shows its column. First kit on the Vue renderer.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A private PrimeVue kit fixture, its own Storybook project, loads the kit's
      default theme and implements every scenario it has a widget for.
- [ ] Every failing scenario is either a known gap naming a ticket, classified
      per ADR 0003 as a core fix or a kit-extension candidate, or a different
      pattern with a passing workaround. Each is confirmed to fail for the
      stated reason.
- [ ] The `conformance` CI job includes the kit; the regenerated matrix is
      committed.
- [ ] The shared kit-fixture preset supports the Vue renderer.
