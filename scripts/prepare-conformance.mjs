// Download the pinned conformance demo bundle, check it, and unpack it into
// public/conformance/ so the site serves the kits' Storybooks first-party.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import bundle from '../src/data/conformance.json' with { type: 'json' };

const cacheDir = new URL('../.cache/', import.meta.url);
const cached = new URL('conformance-demo.tar.gz', cacheDir);
const output = new URL('../public/conformance/', import.meta.url);
const checksum = (bytes) => createHash('sha256').update(bytes).digest('hex');
const isPinned = (bytes) => bytes.length === bundle.sizeBytes && checksum(bytes) === bundle.sha256;

let bytes;
try {
  bytes = await readFile(cached);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

if (bytes && isPinned(bytes)) {
  console.log('Pinned conformance bundle is cached.');
} else {
  const response = await fetch(bundle.downloadUrl, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`Conformance bundle download failed: HTTP ${response.status}`);
  bytes = Buffer.from(await response.arrayBuffer());
  if (!isPinned(bytes)) throw new Error('Conformance bundle size or SHA-256 does not match the pin.');
  await mkdir(cacheDir, { recursive: true });
  const temporary = new URL(`${cached.href}.tmp`);
  try {
    await writeFile(temporary, bytes);
    await rename(temporary, cached);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log('Downloaded and verified the conformance bundle.');
}

// Unpack the checked bytes, not the file, so nothing can swap it in between.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
execFileSync('tar', ['-xzf', '-', '--no-same-owner', '-C', fileURLToPath(output)], { input: bytes });
console.log('Unpacked the conformance bundle into public/conformance/.');
