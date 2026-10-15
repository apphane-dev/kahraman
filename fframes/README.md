# kahraman, test what users perceive

A 32-second, 1920 x 1080, 30 fps film made with fframes 1.2.0. No soundtrack,
narration, or audio stream. The published MP4 is H.264, yuv420p, with faststart.

https://github.com/user-attachments/assets/a7e5ee02-7ded-4aea-a8a7-1ff3ad713914

[Download the film](https://github.com/apphane-dev/kahraman/releases/download/media-2026-10-15/kahraman-silent.mp4)

## What changed

This is the kahraman film from the "Three Product Marketing Videos" production,
adapted from yonetmen commit `d57f7ea`. Its six scenes and accessibility-first
examples remain. The header, opening actor, renderer diagram, and closing card
now use the exact vector `I.` identity extracted into this repository's
[`brand/`](../brand/README.md). The closing URL points to the repository.

The palette and mark geometry are compiled from `brand/tokens.json` and
`brand/geometry.json` by `build.rs`. Fonts come from `brand/fonts/`. No duplicate
brand constants or generated soundtrack are needed.

| Scene           | Time       | Content                                   |
| --------------- | ---------- | ----------------------------------------- |
| KahramanActor   | 0 to 5 s   | I.see, I.fill, I.click, I.waitExit        |
| KahramanLocate  | 5 to 11 s  | Role and accessible name resolve a button |
| KahramanRun     | 11 to 17 s | The README's sign-in example              |
| KahramanTrace   | 17 to 22 s | A failing step points to the story line   |
| KahramanContext | 22 to 27 s | One actor for React, Vue, and Svelte      |
| KahramanOutro   | 27 to 32 s | Install command, repository, I. mark      |

## Build

The checked-in backend targets Linux with Vulkan. Install `mise`, FFmpeg,
`pkg-config`, `clang`, `nasm`, and the x264/x265/opus development libraries using
your system package manager. Vulkan needs a working driver. Software Vulkan
can render but will be slower.

From the repo root:

```sh
cd fframes
mise install
cd ..
mise run film:setup
```

`film:setup` builds in release mode with the checked-in lockfile. On Linux
x86_64 it downloads a checksum-verified Ubuntu x264 ABI 163 runtime into
`.native/`, because fframes 1.2.0's FFmpeg prebuilt needs it. It does not change
system libraries. Cargo and Rust are isolated to `fframes/mise.toml`.

## Review, render, test

From the repo root:

```sh
mise run brand:check
mise run film:review
mise run film:test
mise run film:render
```

The review task checks all 960 frames, exports six full-size key frames, and
writes `deliverables/strip.png`. View those images before accepting a changed
snapshot. The test task checks Rust formatting and Clippy, timeline pacing, every frame,
six approved snapshots,
and the absence of audio tracks in the source timeline.

The render task writes `deliverables/kahraman-silent.mp4`, updates the README
poster in `brand/`, and verifies the encoded stream, duration, dimensions, frame
count, faststart, silence, and full-file decoding. The final encoded MP4 must
have exactly one stream, the video. Reports and large renders stay out of Git.

Watch with the native fframes player:

```sh
cd fframes
mise exec -- cargo run --release --locked -- preview
```

Accept intentional snapshot changes only after viewing them:

```sh
cd fframes
FFRAMES_UPDATE_SNAPSHOTS=1 mise exec -- cargo test --release --locked
```

## Publish media

Media releases use a `media-YYYY-MM-DD` tag, are marked prerelease, and are never
GitHub's latest package release. They do not change the npm version or trigger
the branch-based npm publishing workflow themselves.

After review, commit and push the source. Create a media release targeting that
commit and attach `kahraman-silent.mp4`, the review strip, verification report,
and a ZIP of the exported brand assets. Update the README's release links
when publishing a later film. Keep the rendered MP4 outside Git.

For the README player, upload the MP4 as a GitHub user attachment and place the
returned `https://github.com/user-attachments/assets/...` URL in its own paragraph.
A release download link or a linked poster does not create GitHub's inline
player. Keep the release link as a separate download fallback.

The installed GitHub CLI's attachment uploader uses
`POST https://uploads.github.com/user-attachments/assets` with `name`,
`content_type`, and `repository_id` query parameters, a binary request body, and
GitHub authentication. Its JSON response contains the attachment `url`. Record
that URL and the video's checksum in `published.json`. The brand CI test rejects
a README that loses the bare attachment URL.
