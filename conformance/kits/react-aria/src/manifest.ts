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
			knownGap: '11',
			failsWith: 'Unable to find an accessible element with the role "combobox"',
		},
		dialog: {
			knownGap: '09',
			failsWith: 'Unable to find an accessible element with the role "dialog"',
		},
		menu: {
			knownGap: '09',
			failsWith: 'Unable to find an accessible element with the role "menuitem"',
		},
		tabs: 'pass',
		status: {
			knownGap: '09',
			failsWith: 'Unable to find an element with the text: Syncing',
		},
	},
} as const satisfies KitManifest
