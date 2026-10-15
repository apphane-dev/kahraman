#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p deliverables
run() { cargo run --release --locked -- "$@"; }
run timeline --json > deliverables/timeline.json
run inspect --all-frames --fail-on warning --json > deliverables/inspect.json
run strip -n 18 --columns 3 --width 640 -o deliverables/strip.png
run frame 'KahramanActor@2s,KahramanLocate@4.5s,KahramanRun@5s,KahramanTrace@4s,KahramanContext@4s,KahramanOutro@3s' -o deliverables/frames
