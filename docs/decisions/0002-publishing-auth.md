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
  rotate.
- `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` is retained **only** as a bootstrap
  fallback for the very first publish (see below) and should be removed once the
  trusted publisher is configured.

## Bootstrap wrinkle (first publish)

Trusted publishing is configured per package on npmjs.com, which requires the
package to exist. For the first-ever `0.1.0`:

1. Publish once with a short-lived automation token (`NPM_TOKEN` secret) **or**
   locally with 2FA, then
2. configure the trusted publisher on npmjs.com (this repo +
   `.github/workflows/release.yml`), then
3. delete the `NPM_TOKEN` secret and the `NODE_AUTH_TOKEN` env line — all
   subsequent releases are tokenless.

## Consequences / follow-up

- Set up the trusted publisher on npmjs.com right after the first publish.
- Revisit before **January 2027**: by then token publishing is gone, so OIDC (or
  staged + human approval) must be the only path.
- Consumers on npm v12 get kahraman's install-script-free package with no extra
  allow-listing needed.
