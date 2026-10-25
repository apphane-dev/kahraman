// Accessible names and outcomes shared by scenarios (which assert them) and kit
// fixtures (which render them). A fixture cannot pass by renaming a widget.
export const contract = {
	button: { name: 'Save', outcome: 'Saved' },
} as const
