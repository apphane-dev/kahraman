import type { KitManifest } from 'kahraman-conformance-scenarios'

export const manifest = {
	kit: 'Ark UI',
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
		'native-select': {
			knownGap: '13',
			failsWith: 'expect(element).toHaveValue(Large)',
		},
		combobox: 'pass',
		dialog: 'pass',
		menu: 'pass',
		tabs: 'pass',
		status: 'pass',
	},
} as const satisfies KitManifest
