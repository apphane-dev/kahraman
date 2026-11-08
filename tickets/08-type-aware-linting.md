# 08: Type-aware linting and awaited DOM matchers

**What to build:** the follow-up recorded in ADR 0001. Type-aware linting is on,
and the actor awaits its `storybook/test` DOM matchers, with the conformance run
proving the actor still behaves.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] `typeAware` and `typeCheck` are enabled in the lint config.
- [ ] Every floating-promise finding on a DOM matcher is resolved with `await`,
      never `void`.
- [ ] The `no-unsafe-type-assertion` findings are re-evaluated and either fixed
      or suppressed inline with a reason.
- [ ] The reference kit's conformance run stays green.
- [ ] ADR 0001 is marked superseded by an ADR recording the new state.
