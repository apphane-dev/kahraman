# kahraman, test what users perceive

A 32-second, 1920 x 1080, 30 fps film made with fframes 1.2.0. No soundtrack,
narration, or audio stream. The published MP4 is the render's H.264 web
encode, with faststart.

https://github.com/user-attachments/assets/1af273a1-0e68-4671-be60-81f64f301886

[Download the film](https://github.com/user-attachments/assets/1af273a1-0e68-4671-be60-81f64f301886)

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

The checked-in backend targets Linux with Vulkan. Install `mise`, FFmpeg with
the SVT-AV1 and x264 encoders, `pkg-config`, `clang`, `nasm`, and the
x264/x265/opus development libraries using your system package manager. Vulkan needs a working driver. Software Vulkan
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

The render task writes the fframes master to `deliverables/master/` and updates
the README poster in `brand/`. `scripts/web-video.sh` encodes the master into
`deliverables/kahraman-silent.h264.mp4` and `deliverables/kahraman-silent.av1.mp4`.
The task then checks each encode's codec, duration, dimensions, frame count,
faststart, silence, and full-file decoding. Each must have exactly one stream,
the video. `deliverables/verification.json` records their sizes and checksums.
Reports and large renders stay out of Git.

`scripts/web-video.sh` is an unmodified copy of the encoder from the
[web-video skill](https://github.com/evilmartians/agent-skills/blob/b964cf1b164bd0a81019fb54fcb11a7dcec522d4/skills/web-video/SKILL.md).
It reads the repository's `.web-video` defaults. The render passes `--av1-qp 38`
because the default QP 45 smears blocks across the scene crossfades.

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

The README plays and links `deliverables/kahraman-silent.h264.mp4` as a GitHub
user attachment. Only a bare `https://github.com/user-attachments/assets/...`
URL in its own paragraph becomes GitHub's inline player. GitHub strips
`<source>`, `autoplay`, `loop`, and `poster` from README HTML, so the AV1 encode
has no place there. Keep rendered MP4s outside Git.

Upload from `fframes/` after review:

```sh
repo_id=$(gh api repos/apphane-dev/kahraman --jq .id)
gh api --method POST -H 'Content-Type: video/mp4' \
  "https://uploads.github.com/user-attachments/assets?name=kahraman-silent.h264.mp4&content_type=video/mp4&repository_id=$repo_id" \
  --input deliverables/kahraman-silent.h264.mp4 --jq .url
```

Put the returned URL in both READMEs, and record it with the checksum from
`deliverables/verification.json` in `published.json`. The brand CI test rejects
a README that loses the bare attachment URL. A fresh attachment can answer 404
to signed-out requests, so check the URL logged out once the README lands on
`main`.

Media releases use a `media-YYYY-MM-DD` tag, are marked prerelease, and are never
GitHub's latest package release. They hold the review strip, verification
report, and a ZIP of the exported brand assets. They do not change the npm
version or trigger the branch-based npm publishing workflow themselves.
