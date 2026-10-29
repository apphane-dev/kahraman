import { describe, expect, it } from 'vitest'

import { storyTestsOf } from '../src/story-tests.ts'

const source = `
import preview from '../.storybook/preview'
const meta = preview.meta({ title: 'Conformance/Acme UI' })
export const Button = meta.story({ render: () => null })
Button.test('button', run('button'))
export const Switch = meta.story({ render: () => null })
Switch.test('switch', run('checkbox'))
Switch.test('switch-by-hand', async () => {})
export const Combobox = meta.story({ render: () => null })
Combobox.test('combobox', run('combobox', async () => {}))
export const Page = meta.story({ render: () => null })
Page.test('page', run.page({ combobox: async () => {} }))
export const Demo = meta.story({ render: () => null })
Demo.test('demo', run.demo({ combobox: async () => {} }))
`

describe('storyTestsOf', () => {
	it('lists each story test with the scenario its run(...) body names and whether it passes a workaround, including run.page(...)', () => {
		expect(storyTestsOf(source, 'acme.stories.tsx')).toEqual([
			{ name: 'button', file: 'acme.stories.tsx', scenario: 'button', workaround: false },
			{ name: 'switch', file: 'acme.stories.tsx', scenario: 'checkbox', workaround: false },
			{ name: 'switch-by-hand', file: 'acme.stories.tsx', scenario: undefined, workaround: false },
			{ name: 'combobox', file: 'acme.stories.tsx', scenario: 'combobox', workaround: true },
			{
				name: 'page',
				file: 'acme.stories.tsx',
				scenario: 'page',
				workaround: true,
				workaroundKeys: ['combobox'],
			},
			{
				name: 'demo',
				file: 'acme.stories.tsx',
				scenario: 'demo',
				workaround: true,
				workaroundKeys: ['combobox'],
			},
		])
	})
	it('extracts quoted handler keys and preserves an empty page object', () => {
		const code = source.replace(
			'run.page({ combobox: async () => {} })',
			"run.page({ 'combobox': async () => {} })",
		)
		expect(
			storyTestsOf(code, 'acme.stories.tsx').find((test) => test.name === 'page')?.workaroundKeys,
		).toEqual(['combobox'])
		expect(
			storyTestsOf(source.replace('combobox: async () => {}', ''), 'acme.stories.tsx').find(
				(test) => test.name === 'page',
			)?.workaroundKeys,
		).toEqual([])
	})

	it('does not guess page handlers from references, spreads or computed keys', () => {
		for (const argument of ['handlers', '{ ...handlers }', '{ [key]: handler }']) {
			const code = source.replace('{ combobox: async () => {} }', argument)
			const page = storyTestsOf(code, 'acme.stories.tsx').find((test) => test.name === 'page')
			expect(page?.workaround).toBe(true)
			expect(page?.workaroundKeys).toBeUndefined()
		}
	})
})
