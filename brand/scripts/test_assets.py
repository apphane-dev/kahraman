"""Brand assets must work without installed fonts, scripts, or network access."""
import json
from pathlib import Path
import unittest
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = {'s': 'http://www.w3.org/2000/svg'}


class BrandAssets(unittest.TestCase):
    def test_vectors_are_self_contained_and_accessible(self):
        for file in ROOT.glob('*.svg'):
            with self.subTest(file=file.name):
                root = ET.parse(file).getroot()
                self.assertEqual(root.attrib['role'], 'img')
                title = root.find('s:title', NS)
                self.assertIsNotNone(title)
                self.assertEqual(title.attrib['id'], root.attrib['aria-labelledby'])
                self.assertTrue(title.text)
                self.assertIn('viewBox', root.attrib)
                for tag in ['text', 'image', 'script', 'foreignObject', 'style']:
                    self.assertEqual(root.findall(f'.//s:{tag}', NS), [], f'{file} requires runtime content')

    def test_marks_share_exact_geometry(self):
        geometry = json.loads((ROOT / 'geometry.json').read_text())
        for name in ['mark', 'mark-cobalt', 'mark-dark', 'avatar']:
            with self.subTest(name=name):
                paths = ET.parse(ROOT / f'{name}.svg').findall('.//s:path', NS)
                self.assertEqual([p.attrib['d'] for p in paths], [geometry['stem'], geometry['dot']])

    def test_colors_have_accessible_contrast(self):
        colors = json.loads((ROOT / 'tokens.json').read_text())['colors']
        def light(hex_color):
            channels = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
            linear = [c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in channels]
            return sum(c * weight for c, weight in zip(linear, (.2126, .7152, .0722)))
        for text, bg in [('ink', 'paper'), ('mute', 'paper'), ('cobalt', 'paper'), ('white', 'cobalt'),
                         ('white', 'dark'), ('cobalt_light', 'dark'), ('dark_mute', 'dark'), ('fail_text', 'dark')]:
            high, low = sorted([light(colors[text]), light(colors[bg])], reverse=True)
            self.assertGreaterEqual((high + .05) / (low + .05), 4.5, f'{text} on {bg}')


if __name__ == '__main__':
    unittest.main()
