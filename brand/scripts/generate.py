#!/usr/bin/env python3
"""Extract the reference film's actual type outlines. Run with uv, see brand/README.md."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from xml.sax.saxutils import escape

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]


def outline(font, text, x, baseline, size, tracking=0):
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font['head'].unitsPerEm
    pen = SVGPathPen(glyphs)
    for char in text:
        glyph = glyphs[cmap[ord(char)]]
        glyph.draw(TransformPen(pen, (scale, 0, 0, -scale, x, baseline)))
        x += (glyph.width + tracking) * scale
    return pen.getCommands()


def svg(width, height, title, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
            f'viewBox="0 0 {width} {height}" role="img" aria-labelledby="title">\n'
            f'  <title id="title">{escape(title)}</title>\n{body}\n</svg>\n')


def generate():
    tokens = json.loads((ROOT / 'tokens.json').read_text())
    c = tokens['colors']
    font = TTFont(ROOT / tokens['mark']['font'])
    regular = TTFont(ROOT / 'fonts/SpaceGrotesk-Regular.ttf')
    # Original film uses -16px tracking at 640px. Keep the same -25/1000 ratio.
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    bounds = []
    offset = 0
    for char in tokens['mark']['text']:
        glyph = glyphs[cmap[ord(char)]]
        pen = BoundsPen(glyphs)
        glyph.draw(pen)
        left, bottom, right, top = pen.bounds
        bounds.append((left + offset, bottom, right + offset, top))
        offset += glyph.width + tokens['mark']['tracking_font_units']
    left = min(b[0] for b in bounds)
    bottom = min(b[1] for b in bounds)
    right = max(b[2] for b in bounds)
    top = max(b[3] for b in bounds)
    scale = 800 / (top - bottom)
    x = (1000 - (right - left) * scale) / 2 - left * scale
    baseline = 100 + top * scale
    stem = outline(font, 'I', x, baseline, 1000 * scale)
    dot_x = x + (font['hmtx']['I'][0] + tokens['mark']['tracking_font_units']) * scale
    dot = outline(font, '.', dot_x, baseline, 1000 * scale)
    word = outline(font, tokens['name'], 0, 140, 190, -5)
    geometry = {'stem': stem, 'dot': dot, 'wordmark': word}
    outputs = {'geometry.json': json.dumps(geometry, indent=2) + '\n'}

    def mark(ink, accent, transform=''):
        attr = f' transform="{transform}"' if transform else ''
        return (f'<g{attr}>'
                f'<path fill="{ink}" d="{stem}"/>'
                f'<path fill="{accent}" d="{dot}"/></g>')

    for name, ink, accent in [('mark', c['ink'], c['cobalt']),
                               ('mark-cobalt', c['cobalt'], c['cobalt']),
                               ('mark-dark', c['white'], c['cobalt_light'])]:
        outputs[f'{name}.svg'] = svg(1000, 1000, 'kahraman I. mark', mark(ink, accent))
    outputs['avatar.svg'] = svg(1000, 1000, 'kahraman',
        f'<rect width="1000" height="1000" rx="180" fill="{c["paper"]}"/>' + mark(c['ink'], c['cobalt']))
    for suffix, ink, accent in [('', c['ink'], c['cobalt']), ('-dark', c['white'], c['cobalt_light'])]:
        outputs[f'logo{suffix}.svg'] = svg(1160, 230, 'kahraman',
            mark(ink, accent, 'translate(-12 0) scale(.23)') +
            f'<path transform="translate(235 40)" fill="{ink}" d="{word}"/>')
    tagline = outline(regular, tokens['tagline'], 350, 283, 48, -1)
    outputs['banner.svg'] = svg(1600, 420, 'kahraman. Test what users perceive.',
        f'<rect width="1600" height="420" fill="{c["paper"]}"/>' +
        mark(c['ink'], c['cobalt'], 'translate(44 30) scale(.36)') +
        f'<path transform="translate(350 82) scale(1.1)" fill="{c["ink"]}" d="{word}"/>' +
        f'<path fill="{c["mute"]}" d="{tagline}"/>')
    social_word = outline(font, tokens['name'], 90, 260, 145, -5)
    social_tag = outline(regular, tokens['tagline'], 90, 335, 40, -1)
    social_caption = outline(regular, 'Accessibility-first test actor', 90, 515, 26)
    outputs['social.svg'] = svg(1200, 630, 'kahraman. Accessibility-first test actor.',
        f'<rect width="1200" height="630" fill="{c["paper"]}"/>' +
        f'<path fill="{c["ink"]}" d="{social_word}"/>' +
        f'<path fill="{c["mute"]}" d="{social_tag}"/>' +
        mark(c['cobalt'], c['cobalt'], 'translate(790 76) scale(.48)') +
        f'<path fill="{c["mute"]}" d="{social_caption}"/>' +
        f'<rect x="90" y="555" width="1020" height="4" fill="{c["rule"]}"/>' +
        f'<rect x="90" y="555" width="340" height="4" fill="{c["cobalt"]}"/>')
    outputs['tokens.css'] = '/* Generated from tokens.json by scripts/generate.py. */\n:root {\n' + ''.join(
        f'  --kahraman-{name.replace("_", "-")}: {value};\n' for name, value in c.items()
    ) + ''.join(f'  --kahraman-font-{name}: "{value}", {"monospace" if name == "mono" else "sans-serif"};\n'
                for name, value in tokens['fonts'].items()) + '}\n'
    return outputs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail if tracked vector assets are stale')
    args = parser.parse_args()
    stale = []
    for name, content in generate().items():
        path = ROOT / name
        if args.check:
            if not path.exists() or path.read_text() != content:
                stale.append(name)
        else:
            path.write_text(content)
    if stale:
        parser.error('Regenerate brand assets: ' + ', '.join(stale))
    print('Brand vectors match their source.' if args.check else 'Generated brand vectors and tokens.')


if __name__ == '__main__':
    main()
