# 06: PrimeVue kit fixture

**What to build:** the full conformance catalog runs against PrimeVue, and the
conformance matrix shows its column. First kit on the Vue renderer.

**Blocked by:** 02 (known gaps and matrix), 03 (full catalog).

**Status:** blocked

- [ ] A private PrimeVue kit fixture, its own Storybook project, loads the kit's
      default theme and implements every scenario it has a widget for.
- [ ] Every failing scenario is a known gap linked to a filed issue, classified
      per ADR 0003 as a core fix or a kit-extension candidate.
- [ ] The `conformance` CI job includes the kit; the regenerated matrix is
      committed.
- [ ] The shared kit-fixture preset supports the Vue renderer.
