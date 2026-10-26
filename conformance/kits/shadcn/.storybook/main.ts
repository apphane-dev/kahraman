import { defineMain } from '@storybook/react-vite/node'

export default defineMain({
	framework: '@storybook/react-vite',
	stories: ['../src/**/*.stories.tsx'],
	addons: ['kahraman-conformance-storybook/preset'],
	features: { experimentalTestSyntax: true },
	// These settings belong to the React renderer, not the generic kit preset.
	typescript: { reactDocgen: false },
})
