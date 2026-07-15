# 0002 — Publish via OIDC trusted publishing, not long-lived tokens

- **Status:** Accepted
- **Date:** 2026-07-15
- **Scope:** `.github/workflows/release.yml` (npm publish auth)

## Context

npm is phasing out long-lived token publishing
([GitHub changelog, 2026-07-08](https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/)):

- By **early August 2026**, 2FA-bypass granular access tokens lose sensitive
  account/package/org management actions.
- Around **January 2027**, those tokens lose the ability to publish directly —
  they degrade to reading private packages and _staging_ a publish that then
  needs human 2FA approval.
- The recommended path is **trusted publishing (OIDC)** or staged publishing
  with a human approval step.

The same release (npm v12) also changes install-time defaults: dependency
lifecycle scripts, git dependencies, and remote-URL dependencies no longer run /
resolve unless explicitly allowed. `kahraman` has **no** install/postinstall
scripts and no git/remote-URL deps, so it is already compatible — nothing to do
there.

## Decision

Publish from CI via **OIDC trusted publishing**, tokenless.

- `release.yml` keeps `permissions: id-token: write` and updates npm to a version
  that supports trusted publishing before publishing.
- Under a configured trusted publisher, npm mints a short-lived OIDC credential
  and attaches **provenance automatically** — no `NPM_TOKEN` secret to store or
  rotate, and no `NODE_AUTH_TOKEN` / `NPM_CONFIG_PROVENANCE` env in the workflow.

## Bootstrap (done)

Trusted publishing is configured per package on npmjs.com, which requires the
package to exist. The chicken-and-egg was resolved by bootstrapping `0.0.1`:

1. Published `0.0.1` **locally with 2FA** (`npm publish --otp=…`) to create the
   package — no CI token involved.
2. Configured the trusted publisher on npmjs.com: publisher **GitHub Actions**,
   `apphane-dev/kahraman`, workflow filename **`release.yml`**, no environment,
   allowed action **`npm publish`**.
3. Set package **Publishing access** to _require 2FA and disallow tokens_ —
   trusted publishers keep working; long-lived tokens are blocked.

`0.0.1` is a throwaway bootstrap; the first proper release is `0.1.0` (the
pending `minor` changeset takes `0.0.1 → 0.1.0`) via CI.

## Consequences / follow-up

- CI is tokenless: `release.yml` has no `NODE_AUTH_TOKEN` and no `NPM_TOKEN`
  secret. The local `0.0.1` publish has no provenance (local can't do OIDC);
  every CI release does.
- Revisit before **January 2027**: token publishing is gone by then, so OIDC (or
  staged + human approval) must be the only path — already the case here.
- Consumers on npm v12 get kahraman's install-script-free package with no extra
  allow-listing needed.
