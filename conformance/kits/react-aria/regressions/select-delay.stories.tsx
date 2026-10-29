import { createActor, role, text } from 'kahraman'
import { useEffect, useState } from 'react'
import { configure, expect, getConfig } from 'storybook/test'

import preview from '../.storybook/preview'

const meta = preview.meta({ title: 'Regressions/Select click delay' })

const ReplacedTrigger = ({ native = false }: { native?: boolean }) => {
	const [replace, setReplace] = useState(false)
	const [replacement, setReplacement] = useState(false)
	const [open, setOpen] = useState(false)
	const [value, setValue] = useState('none')
	useEffect(() => {
		if (!replace) {
			return
		}
		const timer = setTimeout(() => setReplacement(true), 50)
		return () => clearTimeout(timer)
	}, [replace])
	return (
		<>
			<button onClick={() => setReplace(true)}>Replace trigger</button>
			{replacement && native ? (
				<select
					aria-label="Country"
					value={value}
					onChange={(event) => setValue(event.target.value)}
				>
					<option value="none">Choose</option>
					<option value="Portugal">Portugal</option>
				</select>
			) : (
				<button
					key={String(replacement)}
					role="combobox"
					aria-label="Country"
					aria-expanded={open}
					onClick={() => setOpen(true)}
				>
					Choose
				</button>
			)}
			{open && (
				<ul role="listbox">
					<li
						role="option"
						aria-selected={value === 'Portugal'}
						onClick={() => {
							setValue('Portugal')
							setOpen(false)
						}}
					>
						Portugal
					</li>
				</ul>
			)}
			<p>Chosen {value}</p>
		</>
	)
}

export const CustomReplacement = meta.story({ render: () => <ReplacedTrigger /> })
CustomReplacement.test(
	'selectOption resolves a replacement trigger after clickDelay',
	async (context) => {
		const I = createActor({ clickDelay: 200, optionTimeout: 100 })
		I.init(context)
		await context.userEvent.click(context.canvas.getByRole('button', { name: 'Replace trigger' }))
		await I.selectOption(role('combobox', 'Country'), 'Portugal')
		await I.see(text('Chosen Portugal'))
	},
)

export const NativeReplacement = meta.story({ render: () => <ReplacedTrigger native /> })
NativeReplacement.test(
	'the native branch is chosen after a delayed trigger replacement',
	async (context) => {
		const I = createActor({ clickDelay: 200, optionTimeout: 100 })
		I.init(context)
		await context.userEvent.click(context.canvas.getByRole('button', { name: 'Replace trigger' }))
		await I.selectOption(role('combobox', 'Country'), 'Portugal')
		await I.see(text('Chosen Portugal'))
	},
)

const RemoteNative = ({ remount = false }: { remount?: boolean }) => {
	const [load, setLoad] = useState(false)
	const [ready, setReady] = useState(false)
	const [value, setValue] = useState('none')
	useEffect(() => {
		if (!load) {
			return
		}
		const timer = setTimeout(() => setReady(true), 200)
		return () => clearTimeout(timer)
	}, [load])
	return (
		<>
			<button onClick={() => setLoad(true)}>Load native options</button>
			<select
				key={String(remount && ready)}
				aria-label="Remote country"
				value={value}
				onChange={(event) => setValue(event.target.value)}
			>
				<option value="none">Choose</option>
				{ready && <option value="Portugal">Portugal</option>}
			</select>
			<p>Native choice {value}</p>
		</>
	)
}

export const Remote = meta.story({ render: () => <RemoteNative /> })
Remote.test('native options can load after selectOption starts', async (context) => {
	const I = createActor()
	I.init(context)
	await context.userEvent.click(context.canvas.getByRole('button', { name: 'Load native options' }))
	await I.selectOption(role('combobox', 'Remote country'), 'Portugal')
	await I.see(text('Native choice Portugal'))
})
Remote.test('native option lookup respects a shorter optionTimeout', async (context) => {
	const I = createActor({ optionTimeout: 25 })
	I.init(context)
	await context.userEvent.click(context.canvas.getByRole('button', { name: 'Load native options' }))
	await expect(I.selectOption(role('combobox', 'Remote country'), 'Portugal')).rejects.toThrow(
		'Unable to find',
	)
	await I.seeInField(role('combobox', 'Remote country'), 'none')
})
Remote.test('native optionTimeout can outlast a shorter global wait', async (context) => {
	const timeout = getConfig().asyncUtilTimeout
	configure({ asyncUtilTimeout: 25 })
	try {
		const I = createActor({ optionTimeout: 2000 })
		I.init(context)
		await context.userEvent.click(
			context.canvas.getByRole('button', { name: 'Load native options' }),
		)
		await I.selectOption(role('combobox', 'Remote country'), 'Portugal')
		await I.see(text('Native choice Portugal'))
	} finally {
		configure({ asyncUtilTimeout: timeout })
	}
})

export const RemountedNative = meta.story({ render: () => <RemoteNative remount /> })
RemountedNative.test(
	'native option loading can replace the select before choosing',
	async (context) => {
		const I = createActor({ optionTimeout: 1000 })
		I.init(context)
		const field = role('combobox', 'Remote country')
		const original = await I.see(field)
		await context.userEvent.click(
			context.canvas.getByRole('button', { name: 'Load native options' }),
		)
		await I.selectOption(field, 'Portugal')
		await expect(original).not.toBeInTheDocument()
		await I.seeInField(field, 'Portugal')
		await I.see(text('Native choice Portugal'))
	},
)
