import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['src/index.ts', 'src/preview.ts'],
	format: 'esm',
	platform: 'neutral',
	dts: true,
	clean: true,
	sourcemap: true,
	treeshake: true,
	// `storybook` and its `storybook/test` subpath are peer dependencies — never
	// bundle them into the output.
	deps: {
		neverBundle: [/^storybook(\/.*)?$/],
	},
})
