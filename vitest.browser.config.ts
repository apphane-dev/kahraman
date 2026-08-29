// Browser-mode Vitest config for the actor integration suite.
//
// The unit tests (test/*.test.ts, node env via vite.config.ts) cover the pure
// helpers. This project exercises the ACTOR itself against a real browser DOM:
// `page.render()` mounts a fixture, `page.context` provides canvasElement +
// userEvent, and every actor method runs through Testing Library queries the
// way a consumer story does. Run via `pnpm run test:browser` (see
// docs/testing.md).
import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

export default defineConfig({
	test: {
		browser: {
			enabled: true,
			headless: true,
			provider: playwright(),
			instances: [{ browser: 'chromium' }],
		},
		include: ['test/browser/**/*.test.tsx'],
	},
} as never)
