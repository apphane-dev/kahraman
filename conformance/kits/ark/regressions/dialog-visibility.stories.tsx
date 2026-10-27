// A closed dialog must occupy no layout boxes. Role/visibility matchers alone
// respect `hidden` even if fixture CSS accidentally overrides its display.
import { button, createActor, role, type StoryContext } from 'kahraman'
import { contract } from 'kahraman-conformance-scenarios'
import { expect } from 'storybook/test'

import preview from '../.storybook/preview'
import { DialogFixture } from '../src/fixtures'

const meta = preview.meta({ title: 'Regressions/Dialog visibility' })
const c = contract.dialog

const assertClosedLayout = async (context: StoryContext) => {
	const parts = context.canvasElement.ownerDocument.querySelectorAll(
		"[data-scope='dialog']:is([data-part='content'], [data-part='backdrop'])",
	)
	// The empty, pointer-transparent positioner can stay mounted. Only the
	// content and backdrop paint visible UI; unmounted parts are also correct.
	await Promise.all(
		[...parts].map((part) => expect(part.getClientRects(), part.outerHTML).toHaveLength(0)),
	)
}

export const Closed = meta.story({ render: () => <DialogFixture /> })

Closed.test('the closed dialog is off screen before and after opening', async (context) => {
	const I = createActor()
	I.init(context)
	await assertClosedLayout(context)

	await I.click(button(c.trigger))
	const dialog = await I.see(role('dialog', c.title))
	await expect(dialog).toBeVisible()
	await expect(dialog.getBoundingClientRect().width).toBeGreaterThan(0)

	await I.click(button(c.close))
	await I.waitExit(role('dialog'))
	await assertClosedLayout(context)
})
