// selectOption against a Select whose options load only after the trigger
// opens it, as with a remote source.
import { button, createActor, text, type ActorOptions, type StoryContext } from 'kahraman'
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
		`Unable to find role="option" and name "${choice}"`,
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
