// Every scenario with `shadowDom: 'open'`, which also searches open shadow
// roots (ticket 17). The conformance stories run the default actor.
import { button, createActor, role, text, type StoryContext } from 'kahraman'
import { contract, scenarios, type ScenarioId } from 'kahraman-conformance-scenarios'
import { html } from 'lit'
import { expect } from 'storybook/test'

import preview from '../.storybook/preview'
import * as f from '../src/fixtures'

const meta = preview.meta({ title: 'Regressions/Shadow DOM option' })

const run = (id: ScenarioId) => async (context: StoryContext) => {
	const I = createActor({ shadowDom: 'open' })
	I.init(context)
	await scenarios[id](I)
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

export const ScopedDialog = meta.story({ render: f.DialogFixture })
ScopedDialog.test('a scope reaches a component slotted into it', async (context) => {
	const I = createActor({ shadowDom: 'open' })
	I.init(context)
	const c = contract.dialog
	await I.click(button(c.trigger))
	await I.within(role('dialog', c.title), async () => {
		await I.click(button(c.close))
	})
	await I.waitExit(role('dialog'))
})

// A listbox inside a shadow root, hidden, with its option slotted from outside.
class HiddenPopup extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: 'open' }).innerHTML =
			'<div role="listbox" aria-label="Countries" hidden><slot></slot></div>'
	}
}
if (!customElements.get('hidden-popup')) {
	customElements.define('hidden-popup', HiddenPopup)
}

export const HiddenSlot = meta.story({
	render: () => html`<hidden-popup><div role="option">Portugal</div></hidden-popup>`,
})
HiddenSlot.test('an option slotted into a hidden listbox is hidden', async (context) => {
	const I = createActor({ shadowDom: 'open' })
	I.init(context)
	await I.dontSee(role('option', 'Portugal'))
	await I.see(role('option', 'Portugal').options({ hidden: true }))
})
