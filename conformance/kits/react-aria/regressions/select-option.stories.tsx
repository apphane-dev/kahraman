// selectOption against a Select whose options load only after the trigger
// opens it, as with a remote source.
import { button, createActor, role, text, type ActorOptions, type StoryContext } from 'kahraman'
import { contract } from 'kahraman-conformance-scenarios'
import { useEffect, useState } from 'react'
import {
	Button,
	Label,
	ListBox,
	ListBoxItem,
	Popover,
	Select,
	SelectValue,
} from 'react-aria-components'
import { configure, expect, getConfig } from 'storybook/test'

import preview from '../.storybook/preview'
import { ComboboxFixture } from '../src/fixtures'

const meta = preview.meta({ title: 'Regressions/Select option' })

const actor = (context: StoryContext, options: ActorOptions = {}) => {
	const I = createActor(options)
	I.init(context)
	return I
}

const loadMs = 200

// Select does not open on an empty collection, so a placeholder shows until
// the options arrive.
const placeholder = 'Loading…'

const RemoteCountries = () => {
	const c = contract.combobox
	const [open, setOpen] = useState(false)
	const [loaded, setLoaded] = useState(false)
	useEffect(() => {
		if (!open || loaded) {
			return
		}
		const timer = setTimeout(() => setLoaded(true), loadMs)
		return () => clearTimeout(timer)
	}, [open, loaded])
	return (
		<Select onOpenChange={setOpen} disabledKeys={[placeholder]}>
			<Label>{c.label}</Label>
			<Button>
				<SelectValue />
			</Button>
			<Popover>
				<ListBox items={loaded ? c.options.map((id) => ({ id })) : [{ id: placeholder }]}>
					{(item) => <ListBoxItem id={item.id}>{item.id}</ListBoxItem>}
				</ListBox>
			</Popover>
		</Select>
	)
}

export const Remote = meta.story({ render: () => <RemoteCountries /> })

const trigger = button(new RegExp(contract.combobox.label))
const { choice } = contract.combobox

Remote.test('selectOption waits for options that load after opening', async (context) => {
	const I = actor(context)
	await I.selectOption(trigger, choice)
	await I.see(text(choice).within(trigger))
})

Remote.test('optionTimeout shortens the wait', async (context) => {
	const I = actor(context, { optionTimeout: 50 })
	await expect(I.selectOption(trigger, choice)).rejects.toThrow(
		`with the role "option" and name "${choice}"`,
	)
})

Remote.test('optionTimeout outlasts a shorter global wait', async (context) => {
	const { asyncUtilTimeout } = getConfig()
	configure({ asyncUtilTimeout: 50 })
	try {
		const I = actor(context, { optionTimeout: 2000 })
		await I.selectOption(trigger, choice)
		await I.see(text(choice).within(trigger))
	} finally {
		configure({ asyncUtilTimeout })
	}
})

// A second listbox exposes an option with the same name as the Select's.
const TwoListboxes = () => (
	<>
		<ComboboxFixture />
		<ListBox aria-label="Favorites">
			<ListBoxItem id="favorite">{contract.combobox.choice}</ListBoxItem>
		</ListBox>
	</>
)

export const Ambiguous = meta.story({ render: () => <TwoListboxes /> })

Ambiguous.test('selectOption picks from the popup its trigger controls', async (context) => {
	const I = actor(context)
	await I.click(trigger)
	await I.seeNumberOfElements(role('option', choice).all(), 2)
	await I.press('{Escape}')
	await I.selectOption(trigger, choice)
	await I.see(text(choice).within(trigger))
})

// Opening replaces the trigger node. A second listbox deliberately exposes the
// requested option both before and after the controlled popup is mounted.
const useMountedAfter = (open: boolean, delay: number) => {
	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		setMounted(false)
		if (!open) {
			return
		}
		const timer = setTimeout(() => setMounted(true), delay)
		return () => clearTimeout(timer)
	}, [open, delay])
	return open && mounted
}

const ShippingCountries = ({
	selected,
	onChoose,
}: {
	selected: string
	onChoose: (country: string) => void
}) => (
	<ul role="listbox" id="remounted-options" aria-label="Shipping countries">
		{contract.combobox.options.map((country) => (
			<li
				role="option"
				aria-selected={selected === country}
				key={country}
				onClick={() => onChoose(country)}
			>
				{country}
			</li>
		))}
	</ul>
)

const OtherCountries = () => {
	const [clicks, setClicks] = useState(0)
	return (
		<>
			<ul role="listbox" aria-label="Other countries">
				<li role="option" aria-selected="false" onClick={() => setClicks((n) => n + 1)}>
					{contract.combobox.choice}
				</li>
			</ul>
			<p>Other listbox clicks {clicks}</p>
		</>
	)
}

const RemountedTrigger = ({ delay = 0 }: { delay?: number }) => {
	const [open, setOpen] = useState(false)
	const [selected, setSelected] = useState('none')
	const popupMounted = useMountedAfter(open, delay)
	return (
		<>
			<div role="group" aria-label="Shipping">
				<button
					key={open ? 'open' : 'closed'}
					role="combobox"
					aria-label="Remounting country"
					aria-expanded={open}
					aria-controls={open ? 'remounted-options' : undefined}
					onClick={() => setOpen(true)}
				>
					Choose country
				</button>
			</div>
			{popupMounted && (
				<ShippingCountries
					selected={selected}
					onChoose={(country) => {
						setSelected(country)
						setOpen(false)
					}}
				/>
			)}
			<OtherCountries />
			<p>Chosen {selected}</p>
		</>
	)
}

export const Remounted = meta.story({ render: () => <RemountedTrigger /> })

Remounted.test(
	'selectOption follows the replacement trigger across repeated opens',
	async (context) => {
		const I = actor(context)
		const current = role('combobox', 'Remounting country')
		await I.within(role('group', 'Shipping'), async () => {
			await I.selectOption(current, contract.combobox.choice)
			await I.selectOption(current, contract.combobox.options[0])
		})
		await I.see(text(`Chosen ${contract.combobox.options[0]}`))
		await I.see(text('Other listbox clicks 0'))
	},
)

export const RemountedDelayed = meta.story({ render: () => <RemountedTrigger delay={250} /> })

RemountedDelayed.test(
	'an unmounted controlled popup never falls back to another listbox',
	async (context) => {
		const I = actor(context)
		await I.selectOption(role('combobox', 'Remounting country'), contract.combobox.choice)
		await I.see(text(`Chosen ${contract.combobox.choice}`))
		await I.see(text('Other listbox clicks 0'))
	},
)

// The listbox mounts late and takes clicks only once its open transition ends.
const SlowPopup = () => {
	const [open, setOpen] = useState(false)
	const [value, setValue] = useState('none')
	const mounted = useMountedAfter(open, 200)
	const ready = useMountedAfter(open, 300)
	return (
		<>
			<button
				role="combobox"
				aria-label="Slow country"
				aria-expanded={open}
				aria-controls={open ? 'slow-options' : undefined}
				onClick={() => setOpen(true)}
			>
				Choose country
			</button>
			{mounted && (
				<ul
					role="listbox"
					id="slow-options"
					aria-label="Slow countries"
					style={{ pointerEvents: ready ? 'auto' : 'none' }}
				>
					<li
						role="option"
						aria-selected={value === choice}
						onClick={() => {
							setValue(choice)
							setOpen(false)
						}}
					>
						{choice}
					</li>
				</ul>
			)}
			<p>Slow choice {value}</p>
		</>
	)
}

export const SlowOption = meta.story({ render: () => <SlowPopup /> })

SlowOption.test('optionTimeout covers an option that takes clicks late', async (context) => {
	const I = actor(context, { actionTimeout: 50, optionTimeout: 2000 })
	await I.selectOption(role('combobox', 'Slow country'), choice)
	await I.see(text(`Slow choice ${choice}`))
})
