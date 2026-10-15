import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import film from '../src/data/film.json' with { type: 'json' };

const root = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const player = html.match(/<video\b([^>]*)>([\s\S]*?)<\/video>/);

test('film plays inline without JavaScript, autoplay, or external redirects', () => {
  assert.ok(player, 'Expected a real video element, not a linked poster');
  const [, attributes, content] = player;
  for (const flag of ['controls', 'playsinline', 'muted']) {
    assert.match(attributes, new RegExp(`\\b${flag}(?:\\s|=|$)`));
  }
  assert.doesNotMatch(attributes, /\bautoplay\b/);
  assert.match(attributes, /preload="metadata"/);
  assert.ok(content.includes(`src="${film.src}"`));
  assert.ok(content.includes('type="video/mp4"'));
  assert.ok(attributes.includes(`poster="${film.poster}"`));
  assert.match(attributes, /aria-labelledby="film-title"/);
  assert.match(attributes, /aria-describedby="film-description"/);
  assert.ok(html.includes('Read the film summary'));
  assert.ok(html.includes('href="#film"'));
});

test('published video is exactly the reviewed, silent release', async () => {
  const bytes = await readFile(new URL(`.${film.src}`, root));
  assert.equal(bytes.length, film.sizeBytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), film.sha256);
  assert.equal(film.audioTracks, 0);
  assert.equal(film.seconds, 32);
  assert.ok(bytes.indexOf('moov') < bytes.indexOf('mdat'), 'Faststart metadata must precede video');
});

test('brand images and local fonts are part of the static deployment', async () => {
  for (const asset of ['favicon.svg', 'brand/mark.svg', 'brand/mark-cobalt.svg', 'brand/social.png',
    'brand/video-poster.jpg', 'brand/tokens.css', 'brand/fonts/SpaceGrotesk-Regular.woff2',
    'brand/fonts/SpaceGrotesk-Bold.woff2', 'brand/fonts/IBMPlexMono-Regular.woff2']) {
    assert.ok((await readFile(new URL(asset, root))).length > 0, `${asset} is missing`);
  }
  assert.deepEqual(await readFile(new URL('favicon.svg', root)), await readFile(new URL('brand/avatar.svg', root)));
  assert.match(html, /property="og:image" content="https:\/\/kahraman\.apphane\.dev\/brand\/social.png"/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
});

test('site and film use the same documented palette', async () => {
  const css = await readFile(new URL('brand/tokens.css', root), 'utf8');
  const tokens = JSON.parse(await readFile(new URL('brand/tokens.json', root), 'utf8'));
  for (const [name, color] of Object.entries(tokens.colors)) {
    assert.ok(css.includes(`--kahraman-${name.replaceAll('_', '-')}: ${color};`));
  }
});
