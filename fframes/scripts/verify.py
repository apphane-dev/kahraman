#!/usr/bin/env python3
"""Check the actual encoded delivery, not just the renderer's scene graph."""
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / 'deliverables/kahraman-silent.mp4'
probe = json.loads(subprocess.check_output([
    'ffprobe', '-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', str(path)
]))
streams = probe['streams']
assert len(streams) == 1, f'Expected only video, got {[s["codec_type"] for s in streams]}'
video = streams[0]
assert video['codec_type'] == 'video' and video['codec_name'] == 'h264'
assert (video['width'], video['height']) == (1920, 1080)
assert video['r_frame_rate'] == '30/1'
assert int(video['nb_read_frames']) == 960
assert abs(float(probe['format']['duration']) - 32) < .001
assert video['pix_fmt'] == 'yuv420p'
subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-nostdin', '-i', str(path), '-f', 'null', '-'], check=True)
# MP4 should start playing before the entire file is downloaded.
data = path.read_bytes()
assert data.index(b'moov') < data.index(b'mdat'), 'MP4 is not faststart'
report = {'file': path.name, 'seconds': 32, 'size': len(data), 'frames': 960, 'width': 1920,
          'height': 1080, 'fps': 30, 'audio_tracks': 0, 'decode': 'passed', 'faststart': True}
(ROOT / 'deliverables/verification.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
