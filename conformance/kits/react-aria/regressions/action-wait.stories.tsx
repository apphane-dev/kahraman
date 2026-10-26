// Actions against a target an overlay hides for a moment, as a closing modal
// keeps aria-hidden on the page until its exit animation ends.
import { button, createActor, role, text, type ActorOptions, type StoryContext } from 'kahraman'
import { useState } from 'react'
import { expect } from 'storybook/test'

import preview from '../.storybook/preview'

const meta = preview.meta({ title: 'Regressions/Action wait' })

const actor = (context: StoryContext, options: ActorOptions = {}) => {
	const I = createActor(options)
	I.init(context)
	return I
}

const hideMs = 200

const Overlay = () => {
	const [hidden, setHidden] = useState(false)
	const [clicks, setClicks] = useState(0)
	const flash = () => {
		setHidden(true)
		setTimeout(() => setHidden(false), hideMs)
	}
	return (
		<>
			<button onClick={flash}>Flash overlay</button>
			<div aria-hidden={hidden}>
				<button onClick={() => setClicks((n) => n + 1)}>Target</button>
				<label>
					Note <input />
				</label>
				<button>Twin</button>
				<button>Twin</button>
			</div>
			<p>Clicked {clicks}</p>
		</>
	)
}

export const Hidden = meta.story({ render: () => <Overlay /> })

const flash = button('Flash overlay')
const target = button('Target')

Hidden.test('click waits for the target and clicks once', async (context) => {
	const I = actor(context)
	await I.click(flash)
	await I.click(target)
	await I.see(text('Clicked 1'))
})

Hidden.test('fill waits for the target', async (context) => {
	const I = actor(context)
	const note = role('textbox', 'Note')
	await I.click(flash)
	await I.fill(note, 'Ready')
	await I.seeInField(note, 'Ready')
})

Hidden.test('actionTimeout 0 disables the wait', async (context) => {
	const I = actor(context, { actionTimeout: 0 })
	await I.click(flash)
	await expect(I.click(target)).rejects.toThrow(
		'Unable to find an accessible element with the role "button" and name "Target"',
	)
})

Hidden.test('an ambiguous locator fails without waiting', async (context) => {
	const I = actor(context, { actionTimeout: 5000 })
	const start = performance.now()
	await expect(I.click(button('Twin'))).rejects.toThrow('Found multiple elements')
	expect(performance.now() - start).toBeLessThan(1000)
})
