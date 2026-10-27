import { contract } from 'kahraman-conformance-scenarios'
import { defineComponent, ref } from 'vue'

// Templates compile at runtime; the preview registers every Vuetify component.

export const ButtonFixture = defineComponent({
	setup: () => ({ c: contract.button, saved: ref(false) }),
	template: `
		<div>
			<v-btn @click="saved = true">{{ c.name }}</v-btn>
			<p v-if="saved">{{ c.outcome }}</p>
		</div>`,
})

export const ButtonDisabledFixture = defineComponent({
	setup: () => ({ c: contract['button-disabled'] }),
	template: `<v-btn disabled>{{ c.name }}</v-btn>`,
})

export const TextboxFixture = defineComponent({
	setup: () => ({ c: contract.textbox }),
	template: `<v-text-field :label="c.label" />`,
})

export const TextareaFixture = defineComponent({
	setup: () => ({ c: contract.textarea }),
	template: `<v-textarea :label="c.label" />`,
})

export const CheckboxFixture = defineComponent({
	setup: () => ({ c: contract.checkbox }),
	template: `<v-checkbox :label="c.label" />`,
})

export const SwitchFixture = defineComponent({
	setup: () => ({ c: contract.switch }),
	template: `<v-switch :label="c.label" />`,
})

export const ComboboxFixture = defineComponent({
	setup: () => ({ c: contract.combobox }),
	template: `<v-select :label="c.label" :items="c.options" />`,
})

export const DialogFixture = defineComponent({
	setup: () => ({ c: contract.dialog }),
	template: `
		<v-dialog max-width="400" aria-labelledby="dialog-title">
			<template #activator="{ props }">
				<v-btn v-bind="props">{{ c.trigger }}</v-btn>
			</template>
			<template #default="{ isActive }">
				<v-card>
					<v-card-title id="dialog-title">{{ c.title }}</v-card-title>
					<v-card-text>{{ c.content }}</v-card-text>
					<v-card-actions>
						<v-btn @click="isActive.value = false">{{ c.close }}</v-btn>
					</v-card-actions>
				</v-card>
			</template>
		</v-dialog>`,
})

export const MenuFixture = defineComponent({
	setup: () => ({ c: contract.menu, chosen: ref(false) }),
	template: `
		<div>
			<v-menu>
				<template #activator="{ props }">
					<v-btn v-bind="props">{{ c.trigger }}</v-btn>
				</template>
				<v-list role="menu">
					<v-list-item
						v-for="item in c.items"
						:key="item"
						role="menuitem"
						:title="item"
						@click="chosen = item === c.choice"
					/>
				</v-list>
			</v-menu>
			<p v-if="chosen">{{ c.outcome }}</p>
		</div>`,
})

export const TabsFixture = defineComponent({
	setup: () => ({ c: contract.tabs, tab: ref(contract.tabs.tabs[0]) }),
	template: `
		<div>
			<v-tabs v-model="tab" aria-label="Account">
				<v-tab
					v-for="name in c.tabs"
					:id="'tab-' + name"
					:key="name"
					:value="name"
					:aria-controls="'panel-' + name"
				>
					{{ name }}
				</v-tab>
			</v-tabs>
			<v-tabs-window v-model="tab">
				<v-tabs-window-item
					v-for="name in c.tabs"
					:id="'panel-' + name"
					:key="name"
					:value="name"
					role="tabpanel"
					:aria-labelledby="'tab-' + name"
				>
					{{ c.panels[name] }}
				</v-tabs-window-item>
			</v-tabs-window>
		</div>`,
})

export const StatusFixture = defineComponent({
	setup: () => ({ c: contract.status, open: ref(false) }),
	template: `
		<div>
			<v-btn @click="open = true">{{ c.trigger }}</v-btn>
			<v-snackbar v-model="open" :timeout="2000">{{ c.message }}</v-snackbar>
		</div>`,
})

// Every fixture at once, as one page of an app.
export const PageFixture = defineComponent({
	components: {
		ButtonFixture,
		ButtonDisabledFixture,
		TextboxFixture,
		TextareaFixture,
		CheckboxFixture,
		SwitchFixture,
		ComboboxFixture,
		DialogFixture,
		MenuFixture,
		TabsFixture,
		StatusFixture,
	},
	template: `
		<main class="d-flex flex-column ga-4">
			<button-fixture />
			<button-disabled-fixture />
			<textbox-fixture />
			<textarea-fixture />
			<checkbox-fixture />
			<switch-fixture />
			<combobox-fixture />
			<dialog-fixture />
			<menu-fixture />
			<tabs-fixture />
			<status-fixture />
		</main>`,
})
