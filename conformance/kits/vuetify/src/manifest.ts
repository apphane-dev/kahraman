import type { KitManifest } from 'kahraman-conformance-scenarios'

export const manifest = {
	kit: 'Vuetify',
	scenarios: {
		button: 'pass',
		'button-disabled': 'pass',
		textbox: 'pass',
		textarea: 'pass',
		checkbox: 'pass',
		switch: {
			differs: 'checkbox',
			failsWith: 'Unable to find an accessible element with the role "switch"',
		},
		combobox: 'pass',
		dialog: 'pass',
		menu: 'pass',
		tabs: 'pass',
		status: 'pass',
	},
} as const satisfies KitManifest
