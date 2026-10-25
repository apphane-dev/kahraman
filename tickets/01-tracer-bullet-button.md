# 01: Tracer bullet: `button` scenario passes against React Aria Components in CI

**What to build:** the thinnest end-to-end conformance run. One conformance
scenario, `button`, runs as a story test against a React Aria Components kit
fixture in Chromium, using the built package, and a CI job runs it on every PR.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A private scenarios package exports the `button` scenario and its contract
      entry (accessible name and expected outcome).
- [ ] A private React Aria Components kit fixture is its own Storybook project
      with `@storybook/addon-vitest`, loading the kit's default theme.
- [ ] The kit fixture resolves kahraman through the workspace dependency and the
      package `exports` map, after a build.
- [ ] The kit manifest declares the scenarios the kit implements; the stories
      run exactly those.
- [ ] A `conformance` CI job, a matrix over kits with one entry, runs Chromium on
      every PR with no `paths` filter.
- [ ] Root `pnpm check`, `publint`, `attw`, and the jsrepo registry check stay
      green; no conformance package appears in the published tarball.
