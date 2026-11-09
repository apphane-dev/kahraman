#!/usr/bin/env python3
"""Check the actual encoded deliveries, not just the renderer's scene graph."""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PIX_FMTS = {'h264': 'yuv420p', 'av1': 'yuv420p10le'}

report = {'seconds': 32, 'frames': 960, 'width': 1920, 'height': 1080, 'fps': 30, 'audio_tracks': 0, 'files': {}}
for codec, pix_fmt in PIX_FMTS.items():
    path = ROOT / f'deliverables/kahraman-silent.{codec}.mp4'
    probe = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', str(path)
    ]))
    streams = probe['streams']
    assert len(streams) == 1, f'{path.name}: expected only video, got {[s["codec_type"] for s in streams]}'
    video = streams[0]
    assert video['codec_type'] == 'video' and video['codec_name'] == codec, path.name
    assert (video['width'], video['height']) == (1920, 1080), path.name
    assert video['r_frame_rate'] == '30/1', path.name
    assert int(video['nb_read_frames']) == 960, path.name
    assert abs(float(probe['format']['duration']) - 32) < .001, path.name
    assert video['pix_fmt'] == pix_fmt, path.name
    subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-nostdin', '-i', str(path), '-f', 'null', '-'], check=True)
    # MP4 should start playing before the entire file is downloaded.
    data = path.read_bytes()
    assert data.index(b'moov') < data.index(b'mdat'), f'{path.name} is not faststart'
    report['files'][path.name] = {'size': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
                                  'decode': 'passed', 'faststart': True}
(ROOT / 'deliverables/verification.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
