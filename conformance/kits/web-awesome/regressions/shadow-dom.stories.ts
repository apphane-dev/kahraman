// Confirms the shadow DOM gap is in the queries, not the fixture: a click that
// reaches the button inside wa-button's shadow root works.
import { createActor, text } from 'kahraman'
import { contract } from 'kahraman-conformance-scenarios'
import { expect } from 'storybook/test'

import preview from '../.storybook/preview'
import { ButtonFixture } from '../src/fixtures'

const meta = preview.meta({ title: 'Regressions/Shadow DOM' })

export const ShadowButton = meta.story({ render: ButtonFixture })

ShadowButton.test('the button inside the shadow root works', async (context) => {
	const I = createActor()
	I.init(context)
	const host = context.canvasElement.querySelector('wa-button')
	const inner = host?.shadowRoot?.querySelector('button')
	await expect(inner).toBeInstanceOf(HTMLButtonElement)
	await I.dontSee(text(contract.button.outcome))
	await context.userEvent.click(inner!)
	await I.see(text(contract.button.outcome))
})
