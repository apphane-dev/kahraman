import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = fileURLToPath(new URL('../../../', import.meta.url))
export const kitsDir = join(root, 'conformance/kits')

// A kit is a directory with a manifest; shared presets and stray files are not.
export const kitDirs = readdirSync(kitsDir)
	.filter((dir) => existsSync(join(kitsDir, dir, 'src/manifest.ts')))
	.toSorted()
