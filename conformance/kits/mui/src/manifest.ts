import type { KitManifest } from 'kahraman-conformance-scenarios'

export const manifest = {
	kit: 'MUI',
	scenarios: {
		button: 'pass',
		'button-disabled': 'pass',
		textbox: 'pass',
		textarea: {
			knownGap: '10',
			failsWith: 'Expected locator to resolve to an HTMLInputElement',
		},
		checkbox: 'pass',
		switch: 'pass',
		'native-select': {
			knownGap: '13',
			failsWith: 'toHaveValue(Large)',
		},
		combobox: 'pass',
		dialog: 'pass',
		menu: 'pass',
		tabs: 'pass',
		status: 'pass',
	},
} as const satisfies KitManifest
