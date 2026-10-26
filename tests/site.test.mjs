import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import conformance from '../src/data/conformance.json' with { type: 'json' };
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

test('conformance bundle is the pinned release, unpacked first-party', async () => {
  const bytes = await readFile(new URL('../.cache/conformance-demo.tar.gz', import.meta.url));
  assert.equal(bytes.length, conformance.sizeBytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), conformance.sha256);
  const matrix = JSON.parse(await readFile(new URL('conformance/matrix.json', root), 'utf8'));
  assert.ok(matrix.kits.length > 0);
  for (const kit of matrix.kits) {
    for (const file of ['iframe.html', 'index.html', 'index.json']) {
      assert.ok((await readFile(new URL(`conformance/kits/${kit.dir}/${file}`, root))).length > 0,
        `${kit.dir}/${file} is missing`);
    }
  }
});

test('each kit runs its page story test from our own domain', async () => {
  const matrix = JSON.parse(await readFile(new URL('conformance/matrix.json', root), 'utf8'));
  const frame = html.match(/<iframe\b[^>]*name="kit-run"[^>]*>/)?.[0];
  assert.ok(frame, 'Expected the kit-run iframe');
  assert.match(frame, /src="\/conformance\/kits\//);
  assert.match(frame, /title="[^"]+"/);
  assert.match(html, /href="#conformance"/);
  for (const kit of matrix.kits) {
    const index = JSON.parse(await readFile(new URL(`conformance/kits/${kit.dir}/index.json`, root), 'utf8'));
    const test = Object.values(index.entries).find((e) => e.subtype === 'test' && e.name === 'page');
    assert.ok(test, `${kit.dir} has no page story test`);
    const run = `/conformance/kits/${kit.dir}/iframe.html?id=${test.id}&viewMode=story`;
    // Astro escapes the query's ampersand.
    assert.ok(html.replaceAll('&#38;', '&').includes(`href="${run}" target="kit-run"`), `${kit.name} has no run link`);
    assert.ok(html.includes(`href="/conformance/kits/${kit.dir}/?path=/story/${test.id}"`));
  }
});

test('matrix shows every scenario, and known gaps link to their tickets at the release', async () => {
  const matrix = JSON.parse(await readFile(new URL('conformance/matrix.json', root), 'utf8'));
  const table = html.match(/<table class="mode-table matrix-table[\s\S]*?<\/table>/)?.[0];
  assert.ok(table, 'Expected the matrix table');
  for (const { id } of matrix.scenarios) assert.ok(table.includes(`<code>${id}</code>`), `${id} row missing`);
  assert.ok(table.includes('<code>page</code>'));
  const source = `https://github.com/apphane-dev/kahraman/blob/${conformance.tag}/`;
  const gaps = [...matrix.scenarios.flatMap((row) => row.cells), ...matrix.page]
    .filter((cell) => cell.status === 'known gap');
  for (const gap of gaps) assert.ok(table.includes(`href="${source}${gap.path}"`), `gap ${gap.ticket} link missing`);
  // A halted page journey is explained beside its kit, with the recorded failure.
  for (const [index, cell] of matrix.page.entries()) {
    if (cell.status !== 'known gap') continue;
    assert.ok(html.includes(cell.failsWith.replaceAll('"', '&quot;')), `${matrix.kits[index].name} page gap not explained`);
  }
});
