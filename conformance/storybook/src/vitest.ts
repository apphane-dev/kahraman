import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export const kitTestConfig = ({ name, port }: { name: string; port: number }) =>
	defineConfig({
		plugins: [storybookTest({ configDir: '.storybook', storybookUrl: `http://localhost:${port}` })],
		test: {
			name,
			browser: {
				enabled: true,
				headless: true,
				provider: playwright(),
				instances: [{ browser: 'chromium' }],
			},
		},
	})
