import { contract } from 'kahraman-conformance-scenarios'
import { html } from 'lit'

// The preview registers every Web Awesome element used here.

type Toast = HTMLElement & { create(message: string, options: { duration: number }): unknown }

// Adds the outcome only once the action happens, as text queries also match
// hidden elements.
const announce = (event: Event, outcome: string) => {
	const container = (event.currentTarget as Element).parentElement
	if (container && !container.querySelector('p')) {
		container.append(Object.assign(document.createElement('p'), { textContent: outcome }))
	}
}

export const ButtonFixture = () => html`
	<div>
		<wa-button @click=${(event: Event) => announce(event, contract.button.outcome)}>
			${contract.button.name}
		</wa-button>
	</div>
`

export const ButtonDisabledFixture = () =>
	html`<wa-button disabled>${contract['button-disabled'].name}</wa-button>`

export const TextboxFixture = () => html`<wa-input label=${contract.textbox.label}></wa-input>`

export const TextareaFixture = () =>
	html`<wa-textarea label=${contract.textarea.label}></wa-textarea>`

export const CheckboxFixture = () => html`<wa-checkbox>${contract.checkbox.label}</wa-checkbox>`

export const SwitchFixture = () => html`<wa-switch>${contract.switch.label}</wa-switch>`

// Web Awesome styles native form controls; it has no select of its own that
// stays native.
export const NativeSelectFixture = () => {
	const c = contract['native-select']
	return html`
		<label>
			${c.label}
			<select>
				${c.options.map((option) => html`<option>${option}</option>`)}
			</select>
		</label>
	`
}

export const ComboboxFixture = () => {
	const c = contract.combobox
	return html`
		<wa-select label=${c.label}>
			${c.options.map((option) => html`<wa-option value=${option}>${option}</wa-option>`)}
		</wa-select>
	`
}

const dialogOf = (event: Event) =>
	(event.currentTarget as Element).closest('div')?.querySelector('wa-dialog') as
		| (HTMLElement & { open: boolean })
		| null

export const DialogFixture = () => {
	const c = contract.dialog
	const setOpen = (open: boolean) => (event: Event) => {
		const dialog = dialogOf(event)
		if (dialog) {
			dialog.open = open
		}
	}
	return html`
		<div>
			<wa-button @click=${setOpen(true)}>${c.trigger}</wa-button>
			<wa-dialog label=${c.title}>
				${c.content}
				<wa-button slot="footer" @click=${setOpen(false)}>${c.close}</wa-button>
			</wa-dialog>
		</div>
	`
}

export const MenuFixture = () => {
	const c = contract.menu
	const choose = (event: CustomEvent<{ item: { value: string } }>) => {
		if (event.detail.item.value === c.choice) {
			announce(event, c.outcome)
		}
	}
	return html`
		<div>
			<wa-dropdown @wa-select=${choose}>
				<wa-button slot="trigger" with-caret>${c.trigger}</wa-button>
				${c.items.map((item) => html`<wa-dropdown-item value=${item}>${item}</wa-dropdown-item>`)}
			</wa-dropdown>
		</div>
	`
}

export const TabsFixture = () => {
	const c = contract.tabs
	return html`
		<wa-tab-group>
			${c.tabs.map((name) => html`<wa-tab panel=${name}>${name}</wa-tab>`)}
			${c.tabs.map((name) => html`<wa-tab-panel name=${name}>${c.panels[name]}</wa-tab-panel>`)}
		</wa-tab-group>
	`
}

export const StatusFixture = () => {
	const c = contract.status
	const sync = (event: Event) => {
		const toast = (event.currentTarget as Element).parentElement?.querySelector(
			'wa-toast',
		) as Toast | null
		toast?.create(c.message, { duration: 2000 })
	}
	return html`
		<div>
			<wa-button @click=${sync}>${c.trigger}</wa-button>
			<wa-toast></wa-toast>
		</div>
	`
}

// Every fixture at once, as one page of an app.
export const PageFixture = () => html`
	<main style="display: flex; flex-direction: column; gap: 1rem; align-items: start">
		${ButtonFixture()} ${ButtonDisabledFixture()} ${TextboxFixture()} ${TextareaFixture()}
		${CheckboxFixture()} ${SwitchFixture()} ${NativeSelectFixture()} ${ComboboxFixture()}
		${DialogFixture()} ${MenuFixture()} ${TabsFixture()} ${StatusFixture()}
	</main>
`
