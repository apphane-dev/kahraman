# kahraman website

Astro landing page for `kahraman.apphane.dev`. This orphan `website` branch is
independent of the npm package on `main`.

## Run and check

```sh
mise run dev -- --host 0.0.0.0
mise run build
mise run check
```

`build` and `dev` prepare the silent film first. `check` builds the site and tests
the rendered video element, playback attributes, accessible description, local
assets, palette, and film checksum. It does not run Astro type diagnostics.

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

## Deploy

A fast-forward push to `website` runs `.github/workflows/deploy.yml`. It builds
with mise and deploys `dist/` to Cloudflare Pages project `kahraman-website`,
production branch `main`. The public site is `kahraman.apphane.dev`.
