#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p deliverables
cargo run --release --locked -- render -o deliverables/kahraman-master.mp4
# Preserve encoded pixels. Explicitly reject sound in the published deliverable.
ffmpeg -hide_banner -loglevel error -nostdin -y -i deliverables/kahraman-master.mp4 \
  -map 0:v:0 -c:v copy -an -movflags +faststart deliverables/kahraman-silent.mp4
ffmpeg -hide_banner -loglevel error -nostdin -y -ss 2 -i deliverables/kahraman-silent.mp4 \
  -frames:v 1 -vf scale=1200:-1 -q:v 2 ../brand/video-poster.jpg
python3 scripts/verify.py
