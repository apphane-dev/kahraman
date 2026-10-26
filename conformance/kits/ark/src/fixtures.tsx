import { Checkbox } from '@ark-ui/react/checkbox'
import { createListCollection } from '@ark-ui/react/collection'
import { Dialog } from '@ark-ui/react/dialog'
import { ark } from '@ark-ui/react/factory'
import { Field } from '@ark-ui/react/field'
import { Menu } from '@ark-ui/react/menu'
import { Portal } from '@ark-ui/react/portal'
import { Select } from '@ark-ui/react/select'
import { Switch } from '@ark-ui/react/switch'
import { Tabs } from '@ark-ui/react/tabs'
import { createToaster, Toast, Toaster } from '@ark-ui/react/toast'
import { contract } from 'kahraman-conformance-scenarios'
import { useState } from 'react'

export const ButtonFixture = () => {
	const [saved, setSaved] = useState(false)
	return (
		<div className="stack">
			<ark.button onClick={() => setSaved(true)}>{contract.button.name}</ark.button>
			{saved && <p>{contract.button.outcome}</p>}
		</div>
	)
}

export const ButtonDisabledFixture = () => (
	<ark.button disabled>{contract['button-disabled'].name}</ark.button>
)

export const TextboxFixture = () => (
	<Field.Root>
		<Field.Label>{contract.textbox.label}</Field.Label>
		<Field.Input />
	</Field.Root>
)

export const TextareaFixture = () => (
	<Field.Root>
		<Field.Label>{contract.textarea.label}</Field.Label>
		<Field.Textarea />
	</Field.Root>
)

export const CheckboxFixture = () => (
	<Checkbox.Root>
		<Checkbox.Control>
			<Checkbox.Indicator>✓</Checkbox.Indicator>
		</Checkbox.Control>
		<Checkbox.Label>{contract.checkbox.label}</Checkbox.Label>
		<Checkbox.HiddenInput />
	</Checkbox.Root>
)

export const SwitchFixture = () => (
	<Switch.Root>
		<Switch.Control>
			<Switch.Thumb />
		</Switch.Control>
		<Switch.Label>{contract.switch.label}</Switch.Label>
		<Switch.HiddenInput />
	</Switch.Root>
)

export const NativeSelectFixture = () => {
	const c = contract['native-select']
	return (
		<Field.Root>
			<Field.Label>{c.label}</Field.Label>
			<Field.Select defaultValue={c.options[0]}>
				{c.options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</Field.Select>
		</Field.Root>
	)
}

const countries = createListCollection({ items: [...contract.combobox.options] })

export const ComboboxFixture = () => (
	<Select.Root collection={countries}>
		<Select.Label>{contract.combobox.label}</Select.Label>
		<Select.Control>
			<Select.Trigger>
				<Select.ValueText placeholder="Choose a country" />
				<Select.Indicator>▾</Select.Indicator>
			</Select.Trigger>
		</Select.Control>
		<Portal>
			<Select.Positioner>
				<Select.Content>
					{countries.items.map((item) => (
						<Select.Item key={item} item={item}>
							<Select.ItemText>{item}</Select.ItemText>
							<Select.ItemIndicator>✓</Select.ItemIndicator>
						</Select.Item>
					))}
				</Select.Content>
			</Select.Positioner>
		</Portal>
		<Select.HiddenSelect />
	</Select.Root>
)

export const DialogFixture = () => {
	const c = contract.dialog
	return (
		<Dialog.Root>
			<Dialog.Trigger>{c.trigger}</Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Title>{c.title}</Dialog.Title>
						<Dialog.Description>{c.content}</Dialog.Description>
						<Dialog.CloseTrigger>{c.close}</Dialog.CloseTrigger>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	)
}

export const MenuFixture = () => {
	const c = contract.menu
	const [chosen, setChosen] = useState(false)
	return (
		<div className="stack">
			<Menu.Root onSelect={({ value }) => setChosen(value === c.choice)}>
				<Menu.Trigger>{c.trigger}</Menu.Trigger>
				<Portal>
					<Menu.Positioner>
						<Menu.Content>
							{c.items.map((item) => (
								<Menu.Item key={item} value={item}>
									{item}
								</Menu.Item>
							))}
						</Menu.Content>
					</Menu.Positioner>
				</Portal>
			</Menu.Root>
			{chosen && <p>{c.outcome}</p>}
		</div>
	)
}

export const TabsFixture = () => {
	const c = contract.tabs
	return (
		<Tabs.Root defaultValue={c.tabs[0]}>
			<Tabs.List aria-label="Account">
				{c.tabs.map((tab) => (
					<Tabs.Trigger key={tab} value={tab}>
						{tab}
					</Tabs.Trigger>
				))}
			</Tabs.List>
			{c.tabs.map((tab) => (
				<Tabs.Content key={tab} value={tab}>
					{c.panels[tab]}
				</Tabs.Content>
			))}
		</Tabs.Root>
	)
}

export const StatusFixture = () => {
	const c = contract.status
	const [toaster] = useState(() => createToaster({ placement: 'bottom-end' }))
	return (
		<>
			<ark.button onClick={() => toaster.create({ title: c.message, duration: 500 })}>
				{c.trigger}
			</ark.button>
			<Toaster toaster={toaster}>
				{(toast) => (
					<Toast.Root>
						<Toast.Title>{toast.title}</Toast.Title>
					</Toast.Root>
				)}
			</Toaster>
		</>
	)
}
