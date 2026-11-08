// These checks keep fixture presentation from breaking keyboard operation,
// decorative indicators, or the visibility semantics the actor tests depend on.
import { createActor, invariant, role, type StoryContext } from 'kahraman'
import { contract } from 'kahraman-conformance-scenarios'
import { expect } from 'storybook/test'

import preview from '../.storybook/preview'
import { CheckboxFixture, SwitchFixture, TabsFixture } from '../src/fixtures'

const meta = preview.meta({ title: 'Regressions/Presentation' })

const actor = (context: StoryContext) => {
	const I = createActor()
	I.init(context)
	return I
}

export const Toggles = meta.story({
	render: () => (
		<>
			<CheckboxFixture />
			<SwitchFixture />
		</>
	),
})

Toggles.test('keyboard focus and selection have visible decorative indicators', async (context) => {
	const I = actor(context)
	const checkbox = role('checkbox', contract.checkbox.label)
	const toggle = role('switch', contract.switch.label)
	const checkboxElement = await I.see(checkbox)
	const switchElement = await I.see(toggle)
	const checkboxLabel = checkboxElement.closest('label')
	const switchLabel = switchElement.closest('label')
	invariant(checkboxLabel && switchLabel, 'React Aria toggles must have labels')
	const checkMark = checkboxLabel.querySelector('.fixture-checkbox-indicator')
	const switchTrack = switchLabel.querySelector('.fixture-switch-indicator')
	invariant(checkMark && switchTrack, 'Toggles must have decorative indicators')
	await expect(checkMark).toHaveAttribute('aria-hidden', 'true')
	await expect(switchTrack).toHaveAttribute('aria-hidden', 'true')
	await expect(checkMark).toBeVisible()
	await expect(switchTrack).toBeVisible()
	const uncheckedColor = getComputedStyle(checkMark).backgroundColor
	const offPosition = getComputedStyle(switchTrack, '::after').transform

	await I.press('{Tab}')
	await expect(checkboxElement).toHaveFocus()
	await expect(checkboxLabel).toHaveAttribute('data-focus-visible')
	await expect(getComputedStyle(checkboxLabel).outlineWidth).toBe('3px')
	await I.press(' ')
	await I.seeChecked(checkbox)
	await expect(getComputedStyle(checkMark).backgroundColor).not.toBe(uncheckedColor)

	await I.press('{Tab}')
	await expect(switchElement).toHaveFocus()
	await expect(switchLabel).toHaveAttribute('data-focus-visible')
	await expect(getComputedStyle(switchLabel).outlineWidth).toBe('3px')
	await I.press(' ')
	await I.seeChecked(toggle)
	await expect(getComputedStyle(switchTrack, '::after').transform).not.toBe(offPosition)
	await I.press(' ')
	await I.dontSeeChecked(toggle)
	await expect(getComputedStyle(switchTrack, '::after').transform).toBe(offPosition)

	// A layout declaration must not override the native hidden attribute.
	checkboxLabel.hidden = true
	try {
		await expect(checkboxLabel).not.toBeVisible()
		await I.dontSee(checkbox)
	} finally {
		checkboxLabel.hidden = false
	}
})

export const StyledTabs = meta.story({ render: () => <TabsFixture /> })

StyledTabs.test('styles do not expose the inactive tab panel', async (context) => {
	const I = actor(context)
	await I.see(role('tabpanel', 'Profile'))
	await I.dontSee(role('tabpanel', 'Billing'))
	await I.click(role('tab', 'Billing'))
	await I.dontSee(role('tabpanel', 'Profile'))
	await I.see(role('tabpanel', 'Billing'))
})
