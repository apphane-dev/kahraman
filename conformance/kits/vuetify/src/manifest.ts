import type { KitManifest } from 'kahraman-conformance-scenarios'

export const manifest = {
	kit: 'Vuetify',
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
		combobox: {
			knownGap: '15',
			failsWith: 'Unable to perform pointer interaction as the element has `pointer-events: none`',
		},
		dialog: {
			knownGap: '14',
			failsWith: 'Unable to find an accessible element with the role "button" and name "Cancel"',
		},
		menu: {
			knownGap: '16',
			failsWith: 'Unable to find an accessible element with the role "menuitem"',
		},
		tabs: 'pass',
		status: 'pass',
	},
} as const satisfies KitManifest
