// React Aria Components ships unstyled, so there is no default theme to load.
import { contract } from 'kahraman-conformance-scenarios'
import { useEffect, useRef, useState } from 'react'
import {
	Button,
	Checkbox,
	Dialog,
	DialogTrigger,
	Heading,
	Input,
	Label,
	ListBox,
	ListBoxItem,
	Menu,
	MenuItem,
	MenuTrigger,
	Modal,
	Popover,
	Select,
	SelectValue,
	Switch,
	Tab,
	TabList,
	TabPanel,
	Tabs,
	TextArea,
	TextField,
	UNSTABLE_Toast as Toast,
	UNSTABLE_ToastContent as ToastContent,
	UNSTABLE_ToastQueue as ToastQueue,
	UNSTABLE_ToastRegion as ToastRegion,
} from 'react-aria-components'

export const ButtonFixture = () => {
	const [saved, setSaved] = useState(false)
	return (
		<>
			<Button onPress={() => setSaved(true)}>{contract.button.name}</Button>
			{saved && <p>{contract.button.outcome}</p>}
		</>
	)
}

export const ButtonDisabledFixture = () => (
	<Button isDisabled>{contract['button-disabled'].name}</Button>
)

export const TextboxFixture = () => (
	<TextField>
		<Label>{contract.textbox.label}</Label>
		<Input />
	</TextField>
)

export const TextareaFixture = () => (
	<TextField>
		<Label>{contract.textarea.label}</Label>
		<TextArea />
	</TextField>
)

export const CheckboxFixture = () => <Checkbox>{contract.checkbox.label}</Checkbox>

export const SwitchFixture = () => <Switch>{contract.switch.label}</Switch>

export const ComboboxFixture = () => (
	<Select>
		<Label>{contract.combobox.label}</Label>
		<Button>
			<SelectValue />
		</Button>
		<Popover>
			<ListBox>
				{contract.combobox.options.map((option) => (
					<ListBoxItem key={option} id={option}>
						{option}
					</ListBoxItem>
				))}
			</ListBox>
		</Popover>
	</Select>
)

export const DialogFixture = () => {
	const c = contract.dialog
	return (
		<DialogTrigger>
			<Button>{c.trigger}</Button>
			<Modal>
				<Dialog>
					<Heading slot="title">{c.title}</Heading>
					<p>{c.content}</p>
					<Button slot="close">{c.close}</Button>
				</Dialog>
			</Modal>
		</DialogTrigger>
	)
}

export const MenuFixture = () => {
	const c = contract.menu
	const [chosen, setChosen] = useState(false)
	return (
		<>
			<MenuTrigger>
				<Button>{c.trigger}</Button>
				<Popover>
					<Menu onAction={(key) => setChosen(key === c.choice)}>
						{c.items.map((item) => (
							<MenuItem key={item} id={item}>
								{item}
							</MenuItem>
						))}
					</Menu>
				</Popover>
			</MenuTrigger>
			{chosen && <p>{c.outcome}</p>}
		</>
	)
}

export const TabsFixture = () => {
	const c = contract.tabs
	return (
		<Tabs>
			<TabList aria-label="Account">
				{c.tabs.map((tab) => (
					<Tab key={tab} id={tab}>
						{tab}
					</Tab>
				))}
			</TabList>
			{c.tabs.map((tab) => (
				<TabPanel key={tab} id={tab}>
					{c.panels[tab]}
				</TabPanel>
			))}
		</Tabs>
	)
}

// The status stays up while a simulated sync runs, then closes.
const syncMs = 2000

export const StatusFixture = () => {
	const c = contract.status
	const [toasts] = useState(() => new ToastQueue<string>())
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
	useEffect(() => () => clearTimeout(timer.current), [])
	return (
		<>
			<ToastRegion queue={toasts}>
				{({ toast }) => (
					<Toast toast={toast}>
						<ToastContent>{toast.content}</ToastContent>
					</Toast>
				)}
			</ToastRegion>
			<Button
				onPress={() => {
					const key = toasts.add(c.message)
					timer.current = setTimeout(() => toasts.close(key), syncMs)
				}}
			>
				{c.trigger}
			</Button>
		</>
	)
}
