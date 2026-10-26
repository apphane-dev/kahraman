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
		combobox: {
			knownGap: '15',
			failsWith: 'Unable to perform pointer interaction as the element has `pointer-events: none`',
		},
		dialog: {
			knownGap: '15',
			failsWith: 'Unable to perform pointer interaction as the element has `pointer-events: none`',
		},
		menu: {
			knownGap: '16',
			failsWith: 'Unable to find an accessible element with the role "menuitem"',
		},
		tabs: 'pass',
		status: 'pass',
	},
} as const satisfies KitManifest
