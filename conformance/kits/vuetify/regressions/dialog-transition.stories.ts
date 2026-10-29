// Hold the real Vuetify transition in its visible-but-unclickable state.
import { button, createActor, role } from 'kahraman'
import { contract, runnerFor } from 'kahraman-conformance-scenarios'
import { expect, waitFor, within } from 'storybook/test'

import preview from '../.storybook/preview'
import { DialogFixture, PageFixture } from '../src/fixtures'
import { manifest } from '../src/manifest'

const meta = preview.meta({ title: 'Regressions/Vuetify dialog transition' })
const c = contract.dialog

export const Paused = meta.story({ render: () => DialogFixture })
Paused.test('Cancel waits for the real Vuetify enter animation before closing', async (context) => {
	const I = createActor()
	I.init(context)
	const animations: Animation[] = []
	const animate = Element.prototype.animate
	Element.prototype.animate = function (this: Element, ...args: Parameters<typeof animate>) {
		const animation = animate.apply(this, args)
		animation.pause()
		animations.push(animation)
		return animation
	}
	try {
		await I.click(button(c.trigger))
		const document = context.canvasElement.ownerDocument
		const canvas = within(document.body)
		await waitFor(() => {
			const close = canvas.getByRole('button', { name: c.close })
			expect(getComputedStyle(close).pointerEvents).toBe('none')
			expect(animations.length).toBeGreaterThan(0)
		})
		const close = canvas.getByRole('button', { name: c.close })
		let rejected = ''
		let clicked = false
		close.addEventListener(
			'click',
			() => {
				clicked = true
			},
			{ once: true },
		)
		const click = I.click(button(c.close)).catch((error: unknown) => {
			rejected = error instanceof Error ? error.message : String(error)
		})
		// Keep the actual animation paused across at least one actor polling interval.
		await new Promise<void>((resolve) => setTimeout(resolve, 100))
		expect(clicked).toBe(false)
		// Restore before closing so the leave transition runs normally.
		Element.prototype.animate = animate
		for (const animation of animations) {
			animation.finish()
		}
		await click
		expect(rejected).toBe('')
		expect(clicked).toBe(true)
		await I.waitExit(role('dialog'))
		expect(canvas.queryByRole('dialog')).toBeNull()
	} finally {
		Element.prototype.animate = animate
		for (const animation of animations) {
			animation.finish()
		}
	}
})

export const Finished = meta.story({ render: () => DialogFixture })
Finished.test(
	'Cancel also works when the real enter transition has already completed',
	async (context) => {
		const I = createActor()
		I.init(context)
		await I.click(button(c.trigger))
		const canvas = within(context.canvasElement.ownerDocument.body)
		await waitFor(() => {
			const close = canvas.getByRole('button', { name: c.close })
			expect(getComputedStyle(close).pointerEvents).not.toBe('none')
		})
		await I.click(button(c.close))
		await I.waitExit(role('dialog'))
		expect(canvas.queryByRole('dialog')).toBeNull()
	},
)

export const Journey = meta.story({ render: () => PageFixture })
Journey.test('the page journey closes its dialog before continuing', async (context) => {
	const canvas = within(context.canvasElement.ownerDocument.body)
	let dialogsAtMenuClick: number | undefined
	canvas.getByRole('button', { name: contract.menu.trigger }).addEventListener(
		'click',
		() => {
			dialogsAtMenuClick = canvas.queryAllByRole('dialog').length
		},
		{ once: true },
	)
	await runnerFor(manifest).page({
		switch: async (I) => {
			const toggle = role('checkbox', contract.switch.label)
			await I.dontSeeChecked(toggle)
			await I.click(toggle)
			await I.seeChecked(toggle)
		},
	})(context)
	expect(dialogsAtMenuClick).toBe(0)
	expect(canvas.queryByRole('dialog')).toBeNull()
})
