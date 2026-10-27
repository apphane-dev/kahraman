import { createActor, type StoryContext } from 'kahraman'

import type { ScenarioId } from './catalog.ts'
import { knownGap } from './known-gap.ts'
import { scenarios } from './scenarios.ts'

/** A ticket number; the ticket lives in `tickets/` or `backlog/`. */
type Ticket = `${number}`

export type ScenarioStatus =
	| 'pass'
	| {
			knownGap: Ticket
			/** The prefix of the primary error diagnostic the scenario fails with today. */
			failsWith: string
	  }

/** The scenarios a kit implements; an absent scenario is n/a for the kit. */
export interface KitManifest {
	kit: string
	scenarios: Partial<Record<ScenarioId, ScenarioStatus>>
}

/** Story test bodies for the scenarios a manifest declares; undeclared IDs are a type error. */
export const runnerFor =
	<M extends KitManifest>(manifest: M) =>
	(id: keyof M['scenarios'] & ScenarioId) =>
	async (context: StoryContext) => {
		const I = createActor()
		I.init(context)
		const run = () => scenarios[id](I)
		const status = manifest.scenarios[id]
		await (typeof status === 'object'
			? knownGap({ ticket: `ticket ${status.knownGap}`, failsWith: status.failsWith }, run)
			: run())
	}
