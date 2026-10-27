import { defineMain } from '@storybook/web-components-vite/node'

export default defineMain({
	framework: '@storybook/web-components-vite',
	stories: ['../src/**/*.stories.ts', '../regressions/*.stories.ts'],
	addons: ['kahraman-conformance-storybook/preset'],
	features: { experimentalTestSyntax: true },
})
