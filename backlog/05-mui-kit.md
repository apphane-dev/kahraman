# 05: MUI kit fixture

**What to build:** the full conformance catalog runs against MUI, and the
conformance matrix shows its column. Expected gaps: portalled overlays, listbox Select over a hidden native input, `<textarea>`.

**Blocked by:** 02 (known gaps and matrix), 03 (full catalog).

**Status:** blocked

- [ ] A private MUI kit fixture, its own Storybook project, loads the kit's
      default theme and implements every scenario it has a widget for.
- [ ] Every failing scenario is a known gap linked to a filed issue, classified
      per ADR 0003 as a core fix or a kit-extension candidate.
- [ ] The `conformance` CI job includes the kit; the regenerated matrix is
      committed.
