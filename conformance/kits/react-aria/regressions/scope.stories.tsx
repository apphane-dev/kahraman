// Actor scope regressions that need a real Storybook document and a kit that
// portals. Not conformance scenarios, so the matrix generator does not read them.
import { button, createActor, role, text, type StoryContext } from 'kahraman'
import { contract } from 'kahraman-conformance-scenarios'
import { useEffect, useState } from 'react'
import { expect } from 'storybook/test'

import preview from '../.storybook/preview'
import { ComboboxFixture, DialogFixture } from '../src/fixtures'

const meta = preview.meta({ title: 'Regressions/Scope' })

const actor = (context: StoryContext) => {
	const I = createActor()
	I.init(context)
	return I
}

// Storybook's hidden args-table placeholder also contains "Name".
const DelayedName = () => {
	const [shown, setShown] = useState(false)
	useEffect(() => {
		const timer = setTimeout(() => setShown(true), 100)
		return () => clearTimeout(timer)
	}, [])
	return shown ? <p>Name</p> : null
}

export const StorybookChrome = meta.story({ render: () => <DelayedName /> })

StorybookChrome.test('text skips hidden Storybook wrappers', async (context) => {
	const I = actor(context)
	const ghost = document.createElement('div')
	ghost.className = 'sb-wrapper'
	ghost.hidden = true
	ghost.textContent = 'Ghost'
	document.body.append(ghost)
	try {
		await I.dontSee(text('No Preview'))
		await I.dontSee(text('Ghost'))
	} finally {
		ghost.remove()
	}
})

StorybookChrome.test('waiting text resolves to the story, not the chrome', async (context) => {
	const I = actor(context)
	const name = await I.see(text('Name').wait())
	await I.seeNumberOfElements(text('Name').all().wait(), 1)
	if (!context.canvasElement.contains(name)) {
		throw new Error('text("Name").wait() resolved outside the canvas')
	}
})

StorybookChrome.test('a user ignore replaces the chrome exclusion', async (context) => {
	const I = actor(context)
	await I.see(text('No Preview').options({ ignore: false }))
	await I.see(text('No Preview').options({ ignore: 'script' }))
})

export const ScopedSelect = meta.story({
	render: () => (
		<>
			<div role="group" aria-label="Shipping">
				<ComboboxFixture />
			</div>
			<button type="button">Outside</button>
		</>
	),
})

ScopedSelect.test('selectOption inside within finds portalled options', async (context) => {
	const I = actor(context)
	const c = contract.combobox
	await I.within(role('group', 'Shipping'), async () => {
		await I.selectOption(button(new RegExp(c.label)), c.choice)
	})
	await I.see(text(c.choice).within(button(new RegExp(c.label))))
})

ScopedSelect.test('within restores the scope after its callback throws', async (context) => {
	const I = actor(context)
	await I.tryTo(() =>
		I.within(role('group', 'Shipping'), async () => {
			throw new Error('inside')
		}),
	)
	await I.see(button('Outside'))
})

export const ScopedDialog = meta.story({
	render: () => (
		<div role="group" aria-label="Form">
			<DialogFixture />
		</div>
	),
})

ScopedDialog.test(
	'explicit body scope escapes within to find a portalled dialog',
	async (context) => {
		const I = actor(context)
		const c = contract.dialog
		const body = context.canvasElement.ownerDocument.body
		await I.within(role('group', 'Form'), async () => {
			await I.click(button(c.trigger))
			// Dropping the old .within('global') keeps this lookup in Form.
			await I.dontSee(role('dialog'))
			// The canvas also excludes the portalled dialog.
			await I.dontSee(role('dialog').within(context.canvasElement))
			const dialog = await I.see(role('dialog').within(body))
			await expect(context.canvasElement).not.toContainElement(dialog)
			// An explicit scope on one locator must not replace the actor scope.
			await I.dontSee(role('dialog'))
			await I.click(button(c.close).within(dialog))
			await I.waitExit(role('dialog').within(body))
			await I.see(button(c.trigger))
		})
	},
)
