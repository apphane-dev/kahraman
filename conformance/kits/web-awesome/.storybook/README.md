# Web Awesome conformance playground

This kit uses `@awesome.me/webawesome@3.14.0` with its default theme and native
styles from `webawesome.css`. The preview registers each component the fixtures
use, with no style or role overrides.

From the repository root:

```sh
pnpm --filter kahraman-conformance-web-awesome run storybook
pnpm run build # required before a standalone kit test
pnpm --filter kahraman-conformance-web-awesome run test
mise run conformance
```

Storybook builds Kahraman first, then serves this kit on port 6011.

Fixtures in `../src/fixtures.ts` are Lit templates. Web Awesome has no native
select of its own, so `native-select` is a plain `<select>` in Web Awesome's
native styles.

Web Awesome renders its controls inside open shadow roots, which the locators
do not enter, so most scenarios are known gaps under ticket 17.
`../regressions/shadow-dom.stories.ts` confirms a click that reaches the shadow
button works, so the gaps are in the queries, not the fixture. The `page`
journey waits out each gap's lookup, so the kit raises its test timeout. The
[conformance matrix](../../../MATRIX.md) records the gaps.

For the opt-in experiment, open `Regressions/Shadow DOM option`, then its `Page`
test, `all scenarios share a page with open-shadow queries`. It runs all twelve
shared scenarios with one `createActor({ shadowDom: 'open' })`, without
expected-failure markers. Individual option-enabled stories remain available.
The demo bundle smoke test runs this page as well as the default `page` journey.
This does not change the default matrix or the website's chosen journey.

The public `Demo` test uses the default actor but skips known gaps without
waiting for expected failures. The ordinary `Page` remains the full conformance
regression and still checks those failures. The matrix describes the default
actor, not a claim that skipped demo interactions work.
