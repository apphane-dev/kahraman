# The I. identity

![kahraman identity](./banner.svg)

`I.` is the actor in `const I = createActor()`. The mark is the same Space Grotesk
Bold capital I and period used in the original kahraman fframes film, extracted
from yonetmen commit `d57f7ea`. Its letter spacing matches the original closing
card, minus 16 pixels at a 640-pixel font size.

The SVGs contain paths, not text. They need no fonts, scripts, network requests,
or CSS. Each has an accessible title. The film draws these same paths rather
than maintaining its own version of the logo.

## Files

| File                        | Use                                                                      |
| --------------------------- | ------------------------------------------------------------------------ |
| `mark.svg`                  | Ink I with a cobalt period, for light backgrounds                        |
| `mark-cobalt.svg`           | Cobalt I., for larger brand moments                                      |
| `mark-dark.svg`             | White I with a light cobalt period, for dark backgrounds                 |
| `logo.svg`, `logo-dark.svg` | Horizontal mark and outlined wordmark                                    |
| `avatar.svg`, `avatar.png`  | Square icon with a paper background, PNG is 512 pixels                   |
| `banner.svg`                | Repository README header                                                 |
| `social.svg`, `social.png`  | 1200 x 630 social preview, ready to upload in GitHub repository settings |
| `video-poster.jpg`          | Frame from the current published silent film                             |
| `tokens.json`, `tokens.css` | Palette and font families                                                |
| `geometry.json`             | Canonical path data, read by the Rust film at build time                 |

## Colors and type

| Color        | Hex       | Use                                       |
| ------------ | --------- | ----------------------------------------- |
| Paper        | `#f3f0e8` | Main background                           |
| Ink          | `#111111` | Mark and text                             |
| Cobalt       | `#2438f5` | Period, actions, focus brackets, progress |
| Muted ink    | `#5b574f` | Secondary text on paper                   |
| Light cobalt | `#8f9bff` | Accent on dark backgrounds                |

Use Space Grotesk for headings and IBM Plex Mono for code. The unmodified font
files are in `fonts/`, with their SIL Open Font Licenses in `licenses/`.
Palette pairs used for text are tested against a 4.5:1 minimum contrast ratio.

## Keep the shape intact

Use the SVG viewBox as the minimum clear area. Do not stretch the mark, add
strokes, substitute a different capital I, or remove the period. Use the dark
variant on dark backgrounds. The square icon carries its own background.

## Regenerate

From the repository root, with `uv` and `resvg` installed:

```sh
mise run brand:generate
mise run brand:check
```

`tokens.json` and the bundled font are the inputs. The generator writes the
SVGs, `geometry.json`, and CSS. `resvg` writes the PNGs. The checks reject stale
vectors, changed mark geometry, missing accessible titles, external SVG
content, and low-contrast text pairs. CI runs these checks independently of
the package tests.

The README ships the images in npm's package allowlist so its relative images
remain available. Fonts, generation tools, and video sources do not ship in
the npm package.
