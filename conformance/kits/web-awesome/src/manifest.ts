import type { KitManifest } from 'kahraman-conformance-scenarios'

// Web Awesome renders its controls inside open shadow roots, which the
// locators do not enter (ticket 17).
export const manifest = {
	kit: 'Web Awesome',
	scenarios: {
		button: {
			knownGap: '17',
			failsWith: 'Unable to find an accessible element with the role "button" and name "Save"',
		},
		'button-disabled': {
			knownGap: '17',
			failsWith: 'Unable to find an accessible element with the role "button" and name "Delete"',
		},
		textbox: {
			knownGap: '17',
			failsWith: 'Unable to find an accessible element with the role "textbox" and name "Email"',
		},
		textarea: {
			knownGap: '17',
			failsWith: 'Unable to find an accessible element with the role "textbox" and name "Comment"',
		},
		checkbox: {
			knownGap: '17',
			failsWith:
				'Unable to find an accessible element with the role "checkbox" and name "Remember me"',
		},
		switch: {
			knownGap: '17',
			failsWith:
				'Unable to find an accessible element with the role "switch" and name "Notifications"',
		},
		'native-select': 'pass',
		combobox: {
			knownGap: '17',
			failsWith: 'Unable to find an accessible element with the role "combobox" and name "Country"',
		},
		dialog: {
			knownGap: '17',
			failsWith:
				'Unable to find an accessible element with the role "button" and name "Delete account"',
		},
		menu: {
			knownGap: '17',
			failsWith: 'Unable to find an accessible element with the role "button" and name "Actions"',
		},
		tabs: 'pass',
		status: {
			knownGap: '17',
			failsWith: 'Unable to find an accessible element with the role "button" and name "Sync"',
		},
	},
} as const satisfies KitManifest
