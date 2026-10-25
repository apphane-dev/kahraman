import { button, text, type BaseActor } from 'kahraman'

import { contract } from './contract'

type Scenario = (I: BaseActor) => Promise<void>

// Scenarios use no escape hatches such as `.within('global')`: a kit that needs
// one shows up as a known gap.
export const scenarios = {
	button: async (I) => {
		await I.click(button(contract.button.name))
		await I.see(text(contract.button.outcome))
	},
} satisfies Record<string, Scenario>

export type ScenarioId = keyof typeof scenarios
