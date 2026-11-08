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
`

describe('storyTestsOf', () => {
	it('lists each story test with the scenario its run(...) body names and whether it passes a workaround', () => {
		expect(storyTestsOf(source, 'acme.stories.tsx')).toEqual([
			{ name: 'button', file: 'acme.stories.tsx', scenario: 'button', workaround: false },
			{ name: 'switch', file: 'acme.stories.tsx', scenario: 'checkbox', workaround: false },
			{ name: 'switch-by-hand', file: 'acme.stories.tsx', scenario: undefined, workaround: false },
			{ name: 'combobox', file: 'acme.stories.tsx', scenario: 'combobox', workaround: true },
		])
	})
})
