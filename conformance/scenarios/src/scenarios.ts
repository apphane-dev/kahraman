import { button, role, text, type BaseActor } from 'kahraman'

import type { ScenarioId } from './catalog.ts'
import { contract } from './contract.ts'

type Scenario = (I: BaseActor) => Promise<void>

// Scenarios use no escape hatches such as an explicit scope or extra query
// options: a kit that needs one shows up as a known gap.
export const scenarios = {
	button: async (I) => {
		const c = contract.button
		await I.click(button(c.name))
		await I.see(text(c.outcome))
	},
	'button-disabled': async (I) => {
		await I.seeDisabled(button(contract['button-disabled'].name))
	},
	textbox: async (I) => {
		const c = contract.textbox
		const field = role('textbox', c.label)
		await I.fill(field, c.value)
		await I.seeInField(field, c.value)
		await I.clear(field)
		await I.seeInField(field, '')
	},
	textarea: async (I) => {
		const c = contract.textarea
		const field = role('textbox', c.label)
		await I.fill(field, c.value)
		await I.seeInField(field, c.value)
	},
	checkbox: async (I) => {
		const box = role('checkbox', contract.checkbox.label)
		await I.dontSeeChecked(box)
		await I.click(box)
		await I.seeChecked(box)
	},
	switch: async (I) => {
		const toggle = role('switch', contract.switch.label)
		await I.dontSeeChecked(toggle)
		await I.click(toggle)
		await I.seeChecked(toggle)
	},
	'native-select': async (I) => {
		const c = contract['native-select']
		const field = role('combobox', c.label)
		await I.selectOption(field, c.choice)
		await I.seeInField(field, c.choice)
	},
	combobox: async (I) => {
		const c = contract.combobox
		await I.selectOption(role('combobox', c.label), c.choice)
		await I.see(text(c.choice).within(role('combobox', c.label)))
	},
	dialog: async (I) => {
		const c = contract.dialog
		await I.click(button(c.trigger))
		await I.see(role('dialog', c.title))
		await I.see(text(c.content))
		await I.click(button(c.close))
		await I.waitExit(role('dialog'))
	},
	menu: async (I) => {
		const c = contract.menu
		await I.click(button(c.trigger))
		await I.click(role('menuitem', c.choice))
		await I.see(text(c.outcome))
	},
	tabs: async (I) => {
		const c = contract.tabs
		await I.click(role('tab', c.choice))
		await I.seeAttribute(role('tab', c.choice), 'aria-selected', 'true')
		await I.see(role('tabpanel', c.choice))
		await I.see(text(c.panels[c.choice]))
	},
	status: async (I) => {
		const c = contract.status
		await I.click(button(c.trigger))
		await I.see(text(c.message).wait())
		await I.waitExit(text(c.message))
	},
} satisfies Record<ScenarioId, Scenario>
