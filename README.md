# kahraman website

Astro landing page for `kahraman.apphane.dev`. This orphan `website` branch is
independent of the npm package on `main`.

## Run and check

```sh
mise run dev -- --host 0.0.0.0
mise run build
mise run check
```

`build` and `dev` prepare the silent film and the conformance demo first. `check`
builds the site and tests the rendered video element, playback attributes,
accessible description, local assets, palette, film checksum, and the
conformance bundle, kit links, and matrix. It does not run Astro type diagnostics.

## Identity and film

The `I.` mark, paper-and-cobalt palette, poster, social card, and fonts come from
`main` commit `8f58cdd`. Static exports live in `public/brand/`. The WOFF2 files
contain the complete, unmodified font outlines. Font licenses are alongside
them in `public/brand/licenses/`.

`src/data/film.json` identifies the reviewed film and its SHA-256. The media task
fetches the public release, validates its exact bytes, and writes it to
`public/media/kahraman-silent.mp4`. The built website serves that first-party
file. It does not send visitors to a GitHub release download or use an expiring
GitHub attachment URL. Cached media must match the same checksum.

The native player has controls, inline playback, a poster, and metadata-only
preloading. It does not autoplay. The 32-second film has zero audio tracks. A
text summary describes each scene for people who cannot watch it.

To publish a later film, update the manifest, poster, and tests together. Keep
large rendered MP4s out of Git.

## Conformance demo

`src/data/conformance.json` pins `conformance-demo.tar.gz` from a
`conformance-<date>` release on `main` by URL, SHA-256, and size. The
`conformance` task keeps the verified download in `.cache/` and unpacks it into
`public/conformance/`: a static Storybook per UI kit and `matrix.json`. Both
paths stay out of Git.

The `#conformance` section renders the matrix as a table and links each kit's
`page` story test into one iframe, so the test runs in the visitor's browser.
Known gaps link to their tickets at the release tag. A kit whose page journey
halts shows the recorded failure beside it.

To publish a later bundle, run the `Conformance demo` workflow on `main`, then
copy the tag, SHA-256, and size from its summary into the manifest.

## Deploy

A fast-forward push to `website` runs `.github/workflows/deploy.yml`. It builds
with mise and deploys `dist/` to Cloudflare Pages project `kahraman-website`,
production branch `main`. The public site is `kahraman.apphane.dev`.
