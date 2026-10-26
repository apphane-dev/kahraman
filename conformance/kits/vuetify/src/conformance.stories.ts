import { role, type BaseActor } from 'kahraman'
import { contract, runnerFor } from 'kahraman-conformance-scenarios'

import preview from '../.storybook/preview'
import {
	ButtonDisabledFixture,
	ButtonFixture,
	CheckboxFixture,
	ComboboxFixture,
	DialogFixture,
	MenuFixture,
	PageFixture,
	StatusFixture,
	SwitchFixture,
	TabsFixture,
	TextareaFixture,
	TextboxFixture,
} from './fixtures'
import { manifest } from './manifest'

const run = runnerFor(manifest)

const meta = preview.meta({ title: 'Conformance/Vuetify' })

// VSwitch renders a checkbox input without role="switch".
const switchAsCheckbox = async (I: BaseActor) => {
	const toggle = role('checkbox', contract.switch.label)
	await I.dontSeeChecked(toggle)
	await I.click(toggle)
	await I.seeChecked(toggle)
}

export const Button = meta.story({ render: () => ButtonFixture })
Button.test('button', run('button'))

export const ButtonDisabled = meta.story({ render: () => ButtonDisabledFixture })
ButtonDisabled.test('button-disabled', run('button-disabled'))

export const Textbox = meta.story({ render: () => TextboxFixture })
Textbox.test('textbox', run('textbox'))

export const Textarea = meta.story({ render: () => TextareaFixture })
Textarea.test('textarea', run('textarea'))

export const Checkbox = meta.story({ render: () => CheckboxFixture })
Checkbox.test('checkbox', run('checkbox'))

export const Switch = meta.story({ render: () => SwitchFixture })
Switch.test('switch', run('switch', switchAsCheckbox))

export const Combobox = meta.story({ render: () => ComboboxFixture })
Combobox.test('combobox', run('combobox'))

export const Dialog = meta.story({ render: () => DialogFixture })
Dialog.test('dialog', run('dialog'))

export const Menu = meta.story({ render: () => MenuFixture })
Menu.test('menu', run('menu'))

export const Tabs = meta.story({ render: () => TabsFixture })
Tabs.test('tabs', run('tabs'))

export const Status = meta.story({ render: () => StatusFixture })
Status.test('status', run('status'))

export const Page = meta.story({ render: () => PageFixture })
Page.test('page', run.page({ switch: switchAsCheckbox }))
