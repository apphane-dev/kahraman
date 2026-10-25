// Writes conformance/MATRIX.md from kit manifests and their story tests.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import type { KitManifest } from '../src/manifest.ts'
import { renderMatrix, type Kit } from '../src/matrix.ts'
import { storyTestsOf } from '../src/story-tests.ts'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const kitsDir = join(root, 'conformance/kits')

const storyTests = (srcDir: string) =>
	readdirSync(srcDir, { recursive: true, encoding: 'utf8' })
		.filter((file) => /\.stories\.tsx?$/.test(file))
		.flatMap((file) => storyTestsOf(readFileSync(join(srcDir, file), 'utf8'), file))

const loadKit = async (dir: string): Promise<Kit> => {
	const kitDir = join(kitsDir, dir)
	const { manifest } = (await import(pathToFileURL(join(kitDir, 'src/manifest.ts')).href)) as {
		manifest: KitManifest
	}
	return { dir, manifest, storyTests: storyTests(join(kitDir, 'src')) }
}

const tickets = new Map(
	['tickets', 'backlog'].flatMap((folder) => {
		const dir = join(root, folder)
		// git does not keep an empty backlog/.
		return (existsSync(dir) ? readdirSync(dir) : []).flatMap((file) => {
			const number = /^(\d+)-.+\.md$/.exec(file)?.[1]
			return number === undefined ? [] : [[number, `${folder}/${file}`] as const]
		})
	}),
)

// A kit is a directory with a manifest; shared presets and stray files are not.
const kitDirs = readdirSync(kitsDir)
	.filter((dir) => existsSync(join(kitsDir, dir, 'src/manifest.ts')))
	.toSorted()
const kits = await Promise.all(kitDirs.map(loadKit))
writeFileSync(join(root, 'conformance/MATRIX.md'), renderMatrix(kits, tickets))
