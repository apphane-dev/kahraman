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
`

describe('storyTestsOf', () => {
	it('lists each story test with the scenario its run(...) body names', () => {
		expect(storyTestsOf(source, 'acme.stories.tsx')).toEqual([
			{ name: 'button', scenario: 'button' },
			{ name: 'switch', scenario: 'checkbox' },
			{ name: 'switch-by-hand', scenario: undefined },
		])
	})
})
