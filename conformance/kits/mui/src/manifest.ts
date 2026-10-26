import type { KitManifest } from 'kahraman-conformance-scenarios'

export const manifest = {
	kit: 'MUI',
	scenarios: {
		button: 'pass',
		'button-disabled': 'pass',
		textbox: 'pass',
		textarea: 'pass',
		checkbox: 'pass',
		switch: 'pass',
		'native-select': 'pass',
		combobox: 'pass',
		dialog: 'pass',
		menu: 'pass',
		tabs: 'pass',
		status: 'pass',
	},
} as const satisfies KitManifest
