import { defineMain } from '@storybook/react-vite/node'

export default defineMain({
	framework: '@storybook/react-vite',
	stories: ['../src/**/*.stories.tsx', '../regressions/*.stories.tsx'],
	addons: ['@storybook/addon-vitest'],
	core: { disableTelemetry: true },
	features: { experimentalTestSyntax: true },
	// react-docgen-typescript needs the TypeScript JS API, which TypeScript 7 lacks.
	typescript: { reactDocgen: false },
})
