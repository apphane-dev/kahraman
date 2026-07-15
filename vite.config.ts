import { defineConfig } from 'vite-plus'

// vite-plus is the unified toolchain here: `vp test` runs the `test` block,
// `vp fmt` (oxfmt) reads the `fmt` block, and `vp lint` (oxlint) reads the
// `lint` block — Vite+ keeps all of this in vite.config.ts rather than in
// separate .oxfmtrc.json / .oxlintrc.json files.
//
// The unit tests cover the PURE, Storybook-free logic only: locator label
// construction, step-label formatting, role-listing filtering, message capping,
// and stack-frame retargeting. Full actor behaviour needs a Storybook browser
// context and is out of scope here — see README (Testing the pure helpers).
export default defineConfig({
	fmt: {
		useTabs: true,
		semi: false,
		singleQuote: true,
		printWidth: 100,
		trailingComma: 'all',
	},
	lint: {
		categories: {
			correctness: 'error',
			suspicious: 'warn',
			perf: 'warn',
		},
		rules: {
			'no-unused-vars': 'error',
			// Forbid braceless control statements — every if/else/for/while body
			// must be wrapped in braces, no single-line `if (x) doThing()`.
			curly: ['error', 'all'],
			// __label / __within are the locator DSL's public metadata markers and
			// _ctx is a conventional private field — intentional, so allow them
			// while still catching accidental dangling underscores elsewhere.
			'no-underscore-dangle': ['error', { allow: ['__label', '__within', '_ctx'] }],
		},
		ignorePatterns: ['dist', 'coverage', 'node_modules'],
		// Type-aware linting (`options.typeAware`/`typeCheck`, via tsgolint) is off
		// by default. It surfaces mostly intentional patterns here, plus one class
		// worth real follow-up (no-floating-promises on storybook/test `expect`
		// DOM matchers). Rationale and follow-up:
		// docs/decisions/0001-type-aware-linting.md
	},
	test: {
		environment: 'node',
		include: ['test/**/*.test.ts'],
	},
})
