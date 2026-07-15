import { defineConfig } from 'jsrepo'
import { repository } from 'jsrepo/outputs'

// jsrepo registry manifest. `pnpm run registry:build` generates the committed
// `registry.json`, letting consumers vendor kahraman's source directly:
//
//   npx jsrepo add github/apphane-dev/kahraman/actor
//   npx jsrepo add --with test github/apphane-dev/kahraman/actor
//
// This is the "copy the source into your project" path, complementary to
// `npm install kahraman`. `storybook` stays a peer the consumer provides.
export default defineConfig({
	registry: {
		name: 'kahraman',
		version: 'package',
		description: 'Accessibility-first, codecept-style test actor and locator DSL for Storybook.',
		homepage: 'https://apphane.dev/',
		repository: 'https://github.com/apphane-dev/kahraman',
		bugs: 'https://github.com/apphane-dev/kahraman/issues',
		tags: ['storybook', 'testing', 'actor', 'a11y', 'testing-library'],
		excludeDeps: ['storybook'],
		outputs: [repository({ format: true })],
		items: [
			{
				name: 'actor',
				type: 'lib',
				title: 'Actor + locator DSL',
				description:
					'createActor() and the role/text/heading/button/link locator DSL, with step-trace diagnostics and call-site stack retargeting.',
				files: [
					{ path: './src/index.ts' },
					{ path: './src/actor.ts' },
					{ path: './src/loc.ts' },
					{ path: './src/steps.ts' },
					{ path: './src/invariant.ts' },
					{ path: './src/context.ts' },
					{ path: './test/loc.test.ts', role: 'test' },
					{ path: './test/steps.test.ts', role: 'test' },
					{ path: './examples/pageActor.ts', role: 'example' },
				],
			},
			{
				name: 'preview',
				type: 'lib',
				title: 'Diagnostics preview annotation',
				description:
					'Opt-in Storybook preview annotation that tames Testing-Library element-not-found output (role-listing filter + DOM cap).',
				files: [
					{ path: './src/preview.ts' },
					{ path: './src/diagnostics.ts' },
					{ path: './test/diagnostics.test.ts', role: 'test' },
				],
			},
		],
	},
})
