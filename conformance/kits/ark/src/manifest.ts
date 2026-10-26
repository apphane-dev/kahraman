import type { KitManifest } from 'kahraman-conformance-scenarios'

export const manifest = {
	kit: 'Ark UI',
	scenarios: {
		button: 'pass',
		'button-disabled': 'pass',
		textbox: 'pass',
		textarea: {
			knownGap: '10',
			failsWith: 'Expected locator to resolve to an HTMLInputElement',
		},
		checkbox: 'pass',
		switch: {
			differs: 'checkbox',
			failsWith: 'Unable to find an accessible element with the role "switch"',
		},
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
