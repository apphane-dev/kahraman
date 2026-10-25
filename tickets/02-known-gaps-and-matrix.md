# 02: Known gaps and the conformance matrix

**What to build:** a kit can declare a known gap for a scenario, and the repo
carries a generated conformance matrix that CI keeps current.

**Blocked by:** 01 (tracer bullet).

**Status:** ready-for-agent

- [ ] `knownGap(issueUrl, run)` passes when `run` throws and fails with
      `known gap fixed, remove marker: <issueUrl>` when `run` resolves; both
      paths are unit-tested.
- [ ] The kit manifest marks each implemented scenario as pass or known gap with
      its issue URL; the stories apply `knownGap` from it.
- [ ] A generator renders scenarios against kits from manifests alone (no
      browser), each cell pass, linked known gap, or n/a.
- [ ] The generator fails when a manifest omits a baseline scenario.
- [ ] The generator fails when a manifest declares a scenario the kit's stories
      file has no story test for (read statically, the way Storybook indexes
      `Story.test` calls).
- [ ] CI regenerates the matrix and fails on any diff.
- [ ] The README links the matrix next to the supported-frameworks text.
