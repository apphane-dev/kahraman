// Clicks on targets that do not take pointer events: one that turns them off
// itself, as Vuetify's select input does, and one inside a container that
// turns them off, as an overlay does during its open transition.
import { button, createActor, role, text, type ActorOptions, type StoryContext } from 'kahraman'
import { useState } from 'react'
import { expect } from 'storybook/test'

import preview from '../.storybook/preview'

const meta = preview.meta({ title: 'Regressions/Pointer events' })

const actor = (context: StoryContext, options: ActorOptions = {}) => {
	const I = createActor(options)
	I.init(context)
	return I
}

const blockMs = 200

const PassThroughCombobox = () => {
	const [open, setOpen] = useState(false)
	const [value, setValue] = useState('')
	return (
		<>
			{/* The field, not the input, opens the listbox. */}
			<div onClick={() => setOpen(true)}>
				<input
					role="combobox"
					aria-label="Fruit"
					aria-expanded={open}
					value={value}
					readOnly
					style={{ pointerEvents: 'none' }}
				/>
			</div>
			{open && (
				<ul role="listbox" aria-label="Fruits">
					<li role="option" aria-selected={value === 'Apple'} onClick={() => setValue('Apple')}>
						Apple
					</li>
				</ul>
			)}
		</>
	)
}

export const PassThrough = meta.story({ render: () => <PassThroughCombobox /> })

PassThrough.test('selectOption clicks the field under the input', async (context) => {
	const I = actor(context)
	const fruit = role('combobox', 'Fruit')
	await I.selectOption(fruit, 'Apple')
	await I.seeInField(fruit, 'Apple')
})

const BlockedContainer = ({ permanent = false }: { permanent?: boolean }) => {
	const [blocked, setBlocked] = useState(permanent)
	const [clicks, setClicks] = useState(0)
	const block = () => {
		setBlocked(true)
		setTimeout(() => setBlocked(permanent), blockMs)
	}
	return (
		<>
			<button onClick={block}>Block briefly</button>
			<div style={{ pointerEvents: blocked ? 'none' : 'auto' }}>
				<button onClick={() => setClicks((n) => n + 1)}>Inside</button>
			</div>
			<p>Clicked {clicks}</p>
		</>
	)
}

export const Blocked = meta.story({ render: () => <BlockedContainer /> })

Blocked.test('click waits while the container turns pointer events off', async (context) => {
	const I = actor(context)
	await I.click(button('Block briefly'))
	await I.click(button('Inside'))
	await I.see(text('Clicked 1'))
})

export const Unreachable = meta.story({ render: () => <BlockedContainer permanent /> })

Unreachable.test('click fails on a target a user cannot reach', async (context) => {
	const I = actor(context, { actionTimeout: 100 })
	await expect(I.click(button('Inside'))).rejects.toThrow(
		'Unable to perform pointer interaction as the element',
	)
	await I.see(text('Clicked 0'))
})

const CoveredField = () => {
	const [fieldClicks, setFieldClicks] = useState(0)
	const [coverClicks, setCoverClicks] = useState(0)
	return (
		<>
			<div
				style={{ position: 'relative', width: 320, height: 120 }}
				onClick={() => setFieldClicks((n) => n + 1)}
			>
				<input
					aria-label="Covered field"
					readOnly
					style={{ pointerEvents: 'none', width: 120, height: 40 }}
				/>
				<button
					style={{ position: 'absolute', inset: 0 }}
					onClick={(event) => {
						event.stopPropagation()
						setCoverClicks((n) => n + 1)
					}}
				>
					Covering control
				</button>
			</div>
			<p>Field clicks {fieldClicks}</p>
			<p>Cover clicks {coverClicks}</p>
		</>
	)
}

export const Covered = meta.story({ render: () => <CoveredField /> })

Covered.test('click never redirects through an overlapping control', async (context) => {
	const I = actor(context, { actionTimeout: 100 })
	await expect(I.click(role('textbox', 'Covered field'))).rejects.toThrow(
		'Unable to perform pointer interaction as the element',
	)
	await I.see(text('Field clicks 0'))
	await I.see(text('Cover clicks 0'))
})

const OffsetField = () => {
	const [clicks, setClicks] = useState(0)
	return (
		<>
			<div
				style={{ position: 'relative', width: 400, height: 120 }}
				onClick={() => setClicks((n) => n + 1)}
			>
				<input
					aria-label="Offset field"
					readOnly
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: 100,
						height: 40,
						pointerEvents: 'none',
					}}
				/>
				<button style={{ position: 'absolute', right: 0, top: 0, width: 250, height: 120 }}>
					Parent center is covered
				</button>
			</div>
			<p>Offset clicks {clicks}</p>
		</>
	)
}

export const Offset = meta.story({ render: () => <OffsetField /> })

Offset.test(
	'fallback hit testing uses the original target, not the parent center',
	async (context) => {
		const I = actor(context)
		await I.click(role('textbox', 'Offset field'))
		await I.see(text('Offset clicks 1'))
	},
)

// A switch-like control: a decorative thumb covers the self-disabled input
// inside its label, as Web Awesome's switch draws it.
const ThumbSwitch = () => (
	<label style={{ position: 'relative', display: 'inline-block', width: 40, height: 20 }}>
		<input
			type="checkbox"
			aria-label="Thumb switch"
			style={{ pointerEvents: 'none', position: 'absolute', inset: 0, margin: 0 }}
		/>
		<span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'gray' }} />
	</label>
)

export const Thumb = meta.story({ render: () => <ThumbSwitch /> })

Thumb.test('click passes through a decorative part inside the parent', async (context) => {
	const I = actor(context)
	const toggle = role('checkbox', 'Thumb switch')
	await I.click(toggle)
	await I.seeChecked(toggle)
})
