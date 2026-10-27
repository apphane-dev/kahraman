// Experiment for ticket 17: every scenario with `shadowDom: 'open'`, which also
// searches open shadow roots. A scenario that still fails must fail as
// recorded here, so a fix shows up as a failing test to update.
import { button, createActor, text, type StoryContext } from 'kahraman'
import { contract, scenarios, type ScenarioId } from 'kahraman-conformance-scenarios'
import { html } from 'lit'
import { expect } from 'storybook/test'

import preview from '../.storybook/preview'
import * as f from '../src/fixtures'

const meta = preview.meta({ title: 'Regressions/Shadow DOM experiment' })

// user-event's clear checks document.activeElement, which is the host.
const unfocusable = 'The element to be cleared could not be focused'
// The hit test uses document.elementFromPoint, which also returns the host.
const hostHit = 'Unable to perform pointer interaction as the element has `pointer-events: none`'

const recorded: Partial<Record<ScenarioId, string>> = {
	textbox: unfocusable,
	textarea: unfocusable,
	checkbox: hostHit,
	switch: hostHit,
	// aria-controls names an id inside the shadow root; document.getElementById misses it.
	combobox: 'Controlled popup "listbox" has not mounted',
	// The accessibility check stops at the shadow root, so the hidden host does
	// not hide the closed <dialog> inside it.
	dialog: 'to be null',
}

const run = (id: ScenarioId) => async (context: StoryContext) => {
	const I = createActor({ shadowDom: 'open' })
	I.init(context)
	const failure = recorded[id]
	if (failure === undefined) {
		await scenarios[id](I)
		return
	}
	await expect(Promise.resolve(scenarios[id](I))).rejects.toThrow(failure)
}

export const Button = meta.story({ render: f.ButtonFixture })
Button.test('button', run('button'))
export const ButtonDisabled = meta.story({ render: f.ButtonDisabledFixture })
ButtonDisabled.test('button-disabled', run('button-disabled'))
export const Textbox = meta.story({ render: f.TextboxFixture })
Textbox.test('textbox', run('textbox'))
export const Textarea = meta.story({ render: f.TextareaFixture })
Textarea.test('textarea', run('textarea'))
export const Checkbox = meta.story({ render: f.CheckboxFixture })
Checkbox.test('checkbox', run('checkbox'))
export const Switch = meta.story({ render: f.SwitchFixture })
Switch.test('switch', run('switch'))
export const NativeSelect = meta.story({ render: f.NativeSelectFixture })
NativeSelect.test('native-select', run('native-select'))
export const Combobox = meta.story({ render: f.ComboboxFixture })
Combobox.test('combobox', run('combobox'))
export const Dialog = meta.story({ render: f.DialogFixture })
Dialog.test('dialog', run('dialog'))
export const Menu = meta.story({ render: f.MenuFixture })
Menu.test('menu', run('menu'))
export const Tabs = meta.story({ render: f.TabsFixture })
Tabs.test('tabs', run('tabs'))
export const Status = meta.story({ render: f.StatusFixture })
Status.test('status', run('status'))

export const TwoButtons = meta.story({
	render: () => html`${f.ButtonFixture()} ${f.ButtonFixture()}`,
})
TwoButtons.test('a name in two shadow roots is ambiguous', async (context) => {
	const I = createActor({ shadowDom: 'open', actionTimeout: 0 })
	I.init(context)
	await expect(I.click(button(contract.button.name))).rejects.toThrow(
		`Found multiple elements with the role "button" and name "${contract.button.name}"`,
	)
})

export const ScopedToHost = meta.story({ render: f.ButtonFixture })
ScopedToHost.test('a query scoped to a shadow host searches its shadow root', async (context) => {
	const I = createActor({ shadowDom: 'open' })
	I.init(context)
	const host = context.canvasElement.querySelector<HTMLElement>('wa-button')
	await I.click(button(contract.button.name).within(host!))
	await I.see(text(contract.button.outcome))
})
