// selectOption against a real UI-kit select (Ark UI) whose options render
// asynchronously in a portal — the exact regression PR #10 fixes: after
// clicking the trigger, the option list is not in the DOM yet, so a plain
// getByRole click misses; findByRole waits for it. Also validates the actor's
// global-scope resolution: options portal to body, outside canvasElement.
// Branch name "ark539" refers to ark issue chakra-ui/ark#539, not Ark UI
// v5.39: the pinned @ark-ui/react 5.38.1 reproduces the async-portal
// behaviour, so no version bump is needed for this fixture.
// Fixture shape mirrors the karkas demo's CollectionSelect usage.
import { Select, createListCollection, type SelectValueChangeDetails } from '@ark-ui/react/select'
import { useState } from 'react'
import { test } from 'vitest'

import { createActor, heading, role, text } from '../../src'

import { renderPage } from './page'

type Harbour = { label: string; value: string }

const collection = createListCollection<Harbour>({
	items: [
		{ label: 'Antalya', value: 'antalya' },
		{ label: 'Bodrum', value: 'bodrum' },
		{ label: 'Çeşme', value: 'cesme' },
	],
	itemToString: (item) => item.label,
	itemToValue: (item) => item.value,
})

const items = collection.items

const HarbourPicker = (): React.ReactElement => {
	const [value, setValue] = useState<string[]>([])
	const picked = collection.items.find((item) => item.value === value[0])
	return (
		<div>
			<h1>Harbour picker</h1>
			<Select.Root
				collection={collection}
				value={value}
				onValueChange={(details: SelectValueChangeDetails<Harbour>) => setValue(details.value)}
			>
				<Select.Label>Harbour</Select.Label>
				<Select.Control>
					<Select.Trigger>Choose harbour</Select.Trigger>
				</Select.Control>
				<Select.Positioner>
					<Select.Content>
						{items.map((item) => (
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

test('selectOption picks an asynchronously rendered option', async () => {
	const I = createActor()
	I.init(renderPage(<HarbourPicker />))
	await I.see(heading('Harbour picker').wait())
	await I.see(text('You picked: nothing yet'))
	await I.selectOption(role('combobox', 'Harbour'), 'Çeşme')
	await I.see(text('You picked: Çeşme'))
})

test('selectOption works for a second pick after the first', async () => {
	const I = createActor()
	I.init(renderPage(<HarbourPicker />))
	await I.see(heading('Harbour picker').wait())
	await I.selectOption(role('combobox', 'Harbour'), 'Antalya')
	await I.see(text('You picked: Antalya'))
	await I.selectOption(role('combobox', 'Harbour'), 'Bodrum')
	await I.see(text('You picked: Bodrum'))
})
