# 0001 — Type-aware linting is off by default

- **Status:** Accepted
- **Date:** 2026-07-15
- **Scope:** `lint` config in `vite.config.ts` (`vp lint` / oxlint + tsgolint)

## Context

Vite+'s `vp lint` (oxlint) can enable **type-aware** rules via
`lint.options.typeAware` / `typeCheck` (powered by tsgolint), which use full
TypeScript type information. The Vite+ docs recommend enabling both. We
evaluated turning them on for kahraman.

With type-aware linting enabled, the codebase produces 34 findings in three
groups:

| Rule                                   | Count | Assessment                                                                                                                                                                                                                                       |
| -------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `eslint(no-underscore-dangle)`         | 18    | **Intentional.** All `__label` / `__within` (the locator DSL's public metadata markers) and `_ctx` (a private field). This is a deliberate naming convention, already allow-listed in the non-type-aware config.                                 |
| `typescript(no-unsafe-type-assertion)` | 4     | **Intentional / by design.** The guarded `import.meta.env` access, the generic `as T` in the method-tracking wrapper, and metadata narrowing (`argument as { __label? }`). Controlled, deliberate casts — not defects.                           |
| `typescript(no-floating-promises)`     | 12    | **Real, but unverifiable here.** Flags `expect(el).toBeChecked()` and the other DOM-matcher assertions in the actor's methods, because `storybook/test`'s `expect` returns an awaitable (for auto-retrying assertions) and the code discards it. |

So ~26 of 34 findings are intentional patterns; the one class worth acting on is
the floating promises.

### Why the floating-promise class is genuinely ambiguous

`storybook/test`'s `expect(...).toBeChecked()` is thenable, so
`await expect(...).toBeChecked()` can poll/retry until it passes. Un-awaited, the
matcher still evaluates and throws **synchronously** on immediate failure — which
is why the source app (and this package) is green without awaiting. But:

- if a matcher ever defers work, an un-awaited failure becomes an **unhandled
  promise rejection** instead of a test failure attributed to that line, and
- the retry-until-true behavior is lost.

Whether this is a latent bug depends on runtime behavior we **cannot observe in
this repo**: kahraman's own tests deliberately cover only the pure,
Storybook-free helpers (locator labels, step formatting, role-listing filter,
message capping, stack retargeting). There is no browser/Storybook context here
to prove the timing change is safe.

## Decision

**Keep `typeAware` / `typeCheck` off by default.**

Turning it on today would force one of two bad options:

1. Add `await` to ~13 assertion sites — a behavior change (assertions would yield
   to the microtask queue and could retry) that **must** be verified against a
   real Storybook / Vitest-browser run, which this repo does not have; or
2. Blanket-suppress `no-floating-promises` — which would bury the one finding
   actually worth attention behind the ~26 intentional ones.

Neither is justified for the initial seed. The non-type-aware rule set (with
`curly` enforced and the intentional underscores allow-listed) is clean and
green.

## `await` vs `void` (for the record)

The rule's help text suggests `void expect(...)` to silence it. For **assertions
this is the wrong fix**: `void` marks the promise as intentionally ignored and
drops its rejection, keeping the exact risk the rule points at while disguising
an assertion as fire-and-forget. The correct resolution is `await`, which waits
for the assertion and surfaces its failure at the call site. If we ever need to
silence a specific case instead, an inline `// oxlint-disable-next-line` with a
reason is more honest than `void`.

## Consequences / follow-up

- The `lint` block in `vite.config.ts` carries a short comment pointing here.
- **Revisit when this repo gains a Storybook / Vitest-browser smoke test.** At
  that point: enable `typeAware` + `typeCheck`, resolve the floating-promise
  sites with `await` (not `void`), verify the actor still behaves correctly in
  the browser, and re-evaluate the `no-unsafe-type-assertion` sites.
- Consumers who vendor the source and already run stories in a browser can
  enable type-aware linting on their side sooner.
