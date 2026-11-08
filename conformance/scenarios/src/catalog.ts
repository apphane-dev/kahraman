export const scenarioIds = [
	'button',
	'button-disabled',
	'textbox',
	'textarea',
	'checkbox',
	'switch',
	'native-select',
	'combobox',
	'dialog',
	'menu',
	'tabs',
	'status',
] as const

export type ScenarioId = (typeof scenarioIds)[number]

/** Scenarios every kit fixture must implement. */
export const baseline = [
	'button',
	'textbox',
	'checkbox',
	'dialog',
	'status',
] as const satisfies readonly ScenarioId[]
