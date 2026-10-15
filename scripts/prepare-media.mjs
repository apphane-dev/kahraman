// Download the reviewed film at build time, then serve it from our own domain.
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import film from '../src/data/film.json' with { type: 'json' };

const output = new URL('../public/media/kahraman-silent.mp4', import.meta.url);
const checksum = (bytes) => createHash('sha256').update(bytes).digest('hex');
const isReviewedFilm = (bytes) => bytes.length === film.sizeBytes && checksum(bytes) === film.sha256;

let cached;
try {
  cached = await readFile(output);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

if (cached && isReviewedFilm(cached)) {
  console.log('Reviewed silent film is ready.');
} else {
  const response = await fetch(film.downloadUrl, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Film download failed: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!isReviewedFilm(bytes)) throw new Error('Film size or SHA-256 does not match the reviewed release.');
  await mkdir(new URL('../public/media/', import.meta.url), { recursive: true });
  const temporary = new URL(`${output.href}.tmp`);
  try {
    await writeFile(temporary, bytes);
    await rename(temporary, output);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log('Downloaded and verified the silent film.');
}
