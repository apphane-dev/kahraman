import { expect } from 'storybook/test'

import preview from '../.storybook/preview'
import { CheckboxFixture, SwitchFixture } from '../src/fixtures'

const meta = preview.meta({ title: 'Regressions/Keyboard focus' })

export const Checkbox = meta.story({ render: () => <CheckboxFixture /> })
Checkbox.test('keyboard focus outlines the visible checkbox control', async (context) => {
	await context.userEvent.tab()
	const control = context.canvasElement.querySelector<HTMLElement>(
		'[data-scope="checkbox"][data-part="control"]',
	)!
	await expect(control).toHaveAttribute('data-focus-visible')
	await expect(getComputedStyle(control).outlineStyle).toBe('solid')
	await expect(getComputedStyle(control).outlineWidth).toBe('2px')
})

export const Switch = meta.story({ render: () => <SwitchFixture /> })
Switch.test('keyboard focus outlines the visible switch control', async (context) => {
	await context.userEvent.tab()
	const control = context.canvasElement.querySelector<HTMLElement>(
		'[data-scope="switch"][data-part="control"]',
	)!
	await expect(control).toHaveAttribute('data-focus-visible')
	await expect(getComputedStyle(control).outlineStyle).toBe('solid')
	await expect(getComputedStyle(control).outlineWidth).toBe('2px')
})
