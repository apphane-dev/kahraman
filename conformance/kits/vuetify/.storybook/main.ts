import { defineMain } from '@storybook/vue3-vite/node'

export default defineMain({
	// Fixtures are template components, not SFCs, so there is no docgen to extract.
	framework: { name: '@storybook/vue3-vite', options: { docgen: false } },
	stories: ['../src/**/*.stories.ts', '../regressions/**/*.stories.ts'],
	addons: ['kahraman-conformance-storybook/preset'],
	features: { experimentalTestSyntax: true },
})
