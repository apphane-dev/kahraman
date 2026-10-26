// A closed dialog must not keep a box on screen. Role queries respect the
// `hidden` attribute, but computed styles do not follow on their own: a
// fixture `display` on the content would keep the closed dialog visible to
// sighted users while the tests see nothing.
import { button, createActor, role, text, type StoryContext } from 'kahraman'
import { contract } from 'kahraman-conformance-scenarios'
import { expect } from 'storybook/test'

import preview from '../.storybook/preview'
import { DialogFixture } from '../src/fixtures'

const meta = preview.meta({ title: 'Regressions/Dialog visibility' })

const actor = (context: StoryContext) => {
	const I = createActor()
	I.init(context)
	return I
}

const c = contract.dialog

// Ark keeps the content mounted around the open state and marks a closed one
// with `hidden`; while it is unmounted the query finds nothing at all.
const contentDisplay = (context: StoryContext) => {
	const el = context.canvasElement.ownerDocument.querySelector<HTMLElement>(
		"[data-scope='dialog'][data-part='content']",
	)
	return el === null ? 'absent' : getComputedStyle(el).display
}

const hiddenState = (display: string) => expect(['none', 'absent']).toContain(display)

export const Closed = meta.story({ render: () => <DialogFixture /> })

Closed.test('the closed dialog is off screen before and after opening', async (context) => {
	const I = actor(context)
	hiddenState(contentDisplay(context))

	await I.click(button(c.trigger))
	expect(contentDisplay(context)).not.toBe('none')
	await I.see(text(c.title))

	await I.click(button(c.close))
	await I.waitExit(role('dialog'))
	hiddenState(contentDisplay(context))
})
