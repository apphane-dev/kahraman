import { contract } from 'kahraman-conformance-scenarios'
import { useEffect, useId, useState } from 'react'
import { toast } from 'sonner'

import { Button } from './components/ui/button'
import { Checkbox } from './components/ui/checkbox'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './components/ui/dropdown-menu'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { NativeSelect, NativeSelectOption } from './components/ui/native-select'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './components/ui/select'
import { Toaster } from './components/ui/sonner'
import { Switch } from './components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Textarea } from './components/ui/textarea'

export const ButtonFixture = () => {
	const [saved, setSaved] = useState(false)
	return (
		<div className="grid justify-items-start gap-4">
			<Button onClick={() => setSaved(true)}>{contract.button.name}</Button>
			{saved && <p>{contract.button.outcome}</p>}
		</div>
	)
}

export const ButtonDisabledFixture = () => (
	<Button disabled>{contract['button-disabled'].name}</Button>
)

export const TextboxFixture = () => (
	<div className="grid w-full max-w-sm gap-2">
		<Label htmlFor="email">{contract.textbox.label}</Label>
		<Input id="email" />
	</div>
)

export const TextareaFixture = () => (
	<div className="grid w-full max-w-sm gap-2">
		<Label htmlFor="comment">{contract.textarea.label}</Label>
		<Textarea id="comment" />
	</div>
)

export const CheckboxFixture = () => (
	<div className="flex items-center gap-2">
		<Checkbox id="remember" />
		<Label htmlFor="remember">{contract.checkbox.label}</Label>
	</div>
)

export const SwitchFixture = () => (
	<div className="flex items-center gap-2">
		<Switch id="notifications" />
		<Label htmlFor="notifications">{contract.switch.label}</Label>
	</div>
)

export const NativeSelectFixture = () => (
	<div className="grid w-full max-w-sm gap-2">
		<Label htmlFor="size">{contract['native-select'].label}</Label>
		<NativeSelect id="size" defaultValue={contract['native-select'].options[0]}>
			{contract['native-select'].options.map((option) => (
				<NativeSelectOption key={option} value={option}>
					{option}
				</NativeSelectOption>
			))}
		</NativeSelect>
	</div>
)

// This scenario exercises the Select's combobox/listbox ARIA pattern, not an
// editable search field. It is the Radix-backed shadcn Select, not Base UI.
export const ComboboxFixture = () => (
	<div className="grid w-full max-w-sm gap-2">
		<Label htmlFor="country">{contract.combobox.label}</Label>
		<Select>
			<SelectTrigger id="country" className="w-full">
				<SelectValue placeholder="Choose a country" />
			</SelectTrigger>
			<SelectContent>
				{contract.combobox.options.map((option) => (
					<SelectItem key={option} value={option}>
						{option}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	</div>
)

export const DialogFixture = () => {
	const c = contract.dialog
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>{c.trigger}</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{c.title}</DialogTitle>
					<DialogDescription>{c.content}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{c.close}</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export const MenuFixture = () => {
	const c = contract.menu
	const [chosen, setChosen] = useState(false)
	return (
		<div className="grid justify-items-start gap-4">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">{c.trigger}</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{c.items.map((item) => (
						<DropdownMenuItem key={item} onSelect={() => setChosen(item === c.choice)}>
							{item}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			{chosen && <p>{c.outcome}</p>}
		</div>
	)
}

export const TabsFixture = () => {
	const c = contract.tabs
	return (
		<Tabs defaultValue={c.tabs[0]} className="w-full max-w-sm">
			<TabsList aria-label="Account">
				{c.tabs.map((tab) => (
					<TabsTrigger key={tab} value={tab}>
						{tab}
					</TabsTrigger>
				))}
			</TabsList>
			{c.tabs.map((tab) => (
				<TabsContent key={tab} value={tab} className="rounded-lg border p-4">
					{c.panels[tab]}
				</TabsContent>
			))}
		</Tabs>
	)
}

export const StatusFixture = () => {
	const c = contract.status
	const id = useId()
	useEffect(() => () => void toast.dismiss(id), [id])
	return (
		<>
			<Toaster theme="light" />
			<Button onClick={() => toast(c.message, { id, duration: 2000 })}>{c.trigger}</Button>
		</>
	)
}

// Every fixture at once, as one page of an app.
export const PageFixture = () => (
	<main className="grid justify-items-start gap-6">
		<ButtonFixture />
		<ButtonDisabledFixture />
		<TextboxFixture />
		<TextareaFixture />
		<CheckboxFixture />
		<SwitchFixture />
		<NativeSelectFixture />
		<ComboboxFixture />
		<DialogFixture />
		<MenuFixture />
		<TabsFixture />
		<StatusFixture />
	</main>
)
