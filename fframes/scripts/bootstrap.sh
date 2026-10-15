#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v cargo >/dev/null || { echo 'Install Rust, or run mise install in fframes/.' >&2; exit 1; }
# Keep the FFmpeg prebuilt's genuine x264 ABI local on rolling Linux distributions.
if [[ $(uname -sm) == 'Linux x86_64' && ! -f .native/libx264.so.163 ]]; then
  mkdir -p .native
  package=$(mktemp)
  trap 'rm -f "$package"' EXIT
  curl -fLsS 'https://archive.ubuntu.com/ubuntu/pool/universe/x/x264/libx264-163_0.163.3060+git5db6aa6-2build1_amd64.deb' -o "$package"
  echo "4b6dc88ca9fee6a234b599cfc67ce1042050dd2814f00b5065406bcdc75baf47  $package" | sha256sum -c -
  ar p "$package" data.tar.zst | tar --zstd -x -C .native --strip-components=4 ./usr/lib/x86_64-linux-gnu/libx264.so.163
  ln -sfn libx264.so.163 .native/libx264.so
fi
cargo build --release --locked
