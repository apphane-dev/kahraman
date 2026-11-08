// The Ark UI Select journeys from apphane-dev/kahraman#10, plus a picker whose
// options load only after the trigger opens it, as with a remote source.
import { createListCollection, type ListCollection, Select } from '@ark-ui/react/select'
import { createActor, heading, role, text, type StoryContext } from 'kahraman'
import { useEffect, useMemo, useState } from 'react'

import preview from '../.storybook/preview'

const meta = preview.meta({ title: 'Regressions/Select option' })

const actor = (context: StoryContext) => {
	const I = createActor()
	I.init(context)
	return I
}

type Harbour = { label: string; value: string }

const harbourCollection = (items: Harbour[]) =>
	createListCollection<Harbour>({
		items,
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value,
	})

const harbours = harbourCollection([
	{ label: 'Antalya', value: 'antalya' },
	{ label: 'Bodrum', value: 'bodrum' },
	{ label: 'Çeşme', value: 'cesme' },
])

const HarbourPicker = ({
	collection = harbours,
	onOpenChange,
}: {
	collection?: ListCollection<Harbour>
	onOpenChange?: (open: boolean) => void
}) => {
	const [value, setValue] = useState<string[]>([])
	const picked = harbours.items.find((item) => item.value === value[0])
	return (
		<div>
			<h1>Harbour picker</h1>
			<Select.Root
				collection={collection}
				value={value}
				onOpenChange={(details) => onOpenChange?.(details.open)}
				onValueChange={(details) => setValue(details.value)}
			>
				<Select.Label>Harbour</Select.Label>
				<Select.Control>
					<Select.Trigger>Choose harbour</Select.Trigger>
				</Select.Control>
				<Select.Positioner>
					<Select.Content>
						{collection.items.map((item) => (
							<Select.Item key={item.value} item={item}>
								<Select.ItemText>{item.label}</Select.ItemText>
							</Select.Item>
						))}
					</Select.Content>
				</Select.Positioner>
				<Select.HiddenSelect />
			</Select.Root>
			<p>You picked: {picked === undefined ? 'nothing yet' : picked.label}</p>
		</div>
	)
}

export const Harbours = meta.story({ render: () => <HarbourPicker /> })

Harbours.test('selectOption picks an option rendered after opening', async (context) => {
	const I = actor(context)
	await I.see(heading('Harbour picker'))
	await I.selectOption(role('combobox', 'Harbour'), 'Çeşme')
	await I.see(text('You picked: Çeşme'))
})

Harbours.test('selectOption picks again after a first pick', async (context) => {
	const I = actor(context)
	await I.selectOption(role('combobox', 'Harbour'), 'Antalya')
	await I.see(text('You picked: Antalya'))
	await I.selectOption(role('combobox', 'Harbour'), 'Bodrum')
	await I.see(text('You picked: Bodrum'))
})

const loadMs = 200

const RemoteHarbourPicker = () => {
	const [open, setOpen] = useState(false)
	const [loaded, setLoaded] = useState(false)
	useEffect(() => {
		if (!open || loaded) {
			return
		}
		const timer = setTimeout(() => setLoaded(true), loadMs)
		return () => clearTimeout(timer)
	}, [open, loaded])
	const collection = useMemo(() => harbourCollection(loaded ? harbours.items : []), [loaded])
	return <HarbourPicker collection={collection} onOpenChange={setOpen} />
}

export const RemoteHarbours = meta.story({ render: () => <RemoteHarbourPicker /> })

RemoteHarbours.test('selectOption waits for options that load after opening', async (context) => {
	const I = actor(context)
	await I.selectOption(role('combobox', 'Harbour'), 'Bodrum')
	await I.see(text('You picked: Bodrum'))
})
