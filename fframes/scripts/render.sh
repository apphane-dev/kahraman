#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p deliverables/master
cargo run --release --locked -- render -o deliverables/master/kahraman-silent.mp4
# Writes deliverables/kahraman-silent.{h264,av1}.mp4, silent per ../.web-video.
# The default AV1 QP 45 smears blocks across the scene crossfades; 38 doesn't.
bash scripts/web-video.sh --av1-qp 38 --no-poster -o deliverables deliverables/master/kahraman-silent.mp4
ffmpeg -hide_banner -loglevel error -nostdin -y -ss 2 -i deliverables/master/kahraman-silent.mp4 \
  -frames:v 1 -vf scale=1200:-1 -q:v 2 ../brand/video-poster.jpg
python3 scripts/verify.py
