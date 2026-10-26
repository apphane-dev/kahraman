import type { KitManifest } from 'kahraman-conformance-scenarios'

export const manifest = {
	kit: 'shadcn/ui (Radix, Nova)',
	scenarios: {
		button: 'pass',
		'button-disabled': 'pass',
		textbox: 'pass',
		textarea: 'pass',
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
	page: {
		knownGap: '14',
		failsWith: 'tabs on the full page: Unable to find an accessible element with the role "tab"',
	},
} as const satisfies KitManifest
