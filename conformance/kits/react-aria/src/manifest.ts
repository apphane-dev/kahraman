import type { KitManifest } from 'kahraman-conformance-scenarios'

export const manifest = {
	kit: 'React Aria Components',
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
		combobox: {
			differs: 'button + listbox',
			failsWith: 'Unable to find an accessible element with the role "combobox"',
		},
		dialog: 'pass',
		menu: 'pass',
		tabs: 'pass',
		status: 'pass',
	},
} as const satisfies KitManifest
