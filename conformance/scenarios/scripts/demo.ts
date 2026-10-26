// Packs conformance-demo.tar.gz: a static Storybook per kit under kits/<dir>/,
// plus matrix.json. Kits read kahraman's dist, so build it first.
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

import { kitDirs, kitsDir, root } from './kits.ts'

const staging = join(root, 'conformance-demo')
rmSync(staging, { recursive: true, force: true })
mkdirSync(staging)

for (const dir of kitDirs) {
	execFileSync(
		'pnpm',
		[
			'exec',
			'storybook',
			'build',
			'--quiet',
			'--disable-telemetry',
			'--output-dir',
			join(staging, 'kits', dir),
		],
		{ cwd: join(kitsDir, dir), stdio: 'inherit' },
	)
}
copyFileSync(join(root, 'conformance/matrix.json'), join(staging, 'matrix.json'))

execFileSync(
	'tar',
	[
		'--sort=name',
		'-czf',
		join(root, 'conformance-demo.tar.gz'),
		'-C',
		staging,
		'matrix.json',
		'kits',
	],
	{ stdio: 'inherit' },
)
