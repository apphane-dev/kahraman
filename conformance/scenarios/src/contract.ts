import type { ScenarioId } from './catalog.ts'

// Accessible names and outcomes shared by scenarios (which assert them) and kit
// fixtures (which render them). A fixture cannot pass by renaming a widget.
export const contract = {
	button: { name: 'Save', outcome: 'Saved' },
	'button-disabled': { name: 'Delete' },
	textbox: { label: 'Email', value: 'ada@example.com' },
	textarea: { label: 'Comment', value: 'Looks good' },
	checkbox: { label: 'Remember me' },
	switch: { label: 'Notifications' },
	'native-select': { label: 'Size', options: ['Small', 'Large'], choice: 'Large' },
	combobox: { label: 'Country', options: ['Norway', 'Portugal'], choice: 'Portugal' },
	dialog: {
		trigger: 'Delete account',
		title: 'Delete account?',
		content: 'This cannot be undone.',
		close: 'Cancel',
	},
	menu: { trigger: 'Actions', items: ['Edit', 'Archive'], choice: 'Archive', outcome: 'Archived' },
	tabs: {
		tabs: ['Profile', 'Billing'],
		choice: 'Billing',
		panels: { Profile: 'Profile details', Billing: 'Billing details' },
	},
	status: { trigger: 'Sync', message: 'Syncing' },
} as const satisfies Record<ScenarioId, unknown>
