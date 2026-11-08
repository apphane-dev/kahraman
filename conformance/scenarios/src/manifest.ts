import { createActor, type BaseActor, type StoryContext } from 'kahraman'

import type { ScenarioId } from './catalog.ts'
import { expectFailure } from './expect-failure.ts'
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
	| {
			/** The valid ARIA pattern the kit renders instead, e.g. `button + listbox`. */
			differs: string
			/** The prefix of the primary error diagnostic the scenario fails with. */
			failsWith: string
	  }

/**
 * The scenarios a kit implements; an absent scenario is n/a for the kit.
 * Declare it `as const satisfies KitManifest` so each status stays narrow.
 */
export interface KitManifest {
	kit: string
	scenarios: Partial<Record<ScenarioId, ScenarioStatus>>
}

/** The same user journey, written for the kit's pattern. */
type Workaround = (I: BaseActor) => Promise<void>

// Non-distributive: a status widened to ScenarioStatus still demands the
// workaround, so a manifest without `as const` cannot skip it.
type WorkaroundArgs<S> = [Extract<S, { differs: string }>] extends [never]
	? []
	: [workaround: Workaround]

const markerOf = (status: Exclude<ScenarioStatus, 'pass'>) =>
	'knownGap' in status ? `known gap ${status.knownGap}` : `differs: ${status.differs}`

/**
 * Story test bodies for the scenarios a manifest declares; undeclared IDs are
 * a type error. A scenario the kit meets with a different pattern also takes
 * the workaround that passes against it.
 */
export const runnerFor =
	<M extends KitManifest>(manifest: M) =>
	<Id extends keyof M['scenarios'] & ScenarioId>(
		id: Id,
		...[workaround]: WorkaroundArgs<M['scenarios'][Id]>
	) =>
	async (context: StoryContext) => {
		const I = createActor()
		I.init(context)
		const run = () => scenarios[id](I)
		const status = manifest.scenarios[id]
		if (status === undefined || status === 'pass') {
			await run()
			return
		}
		await expectFailure({ marker: markerOf(status), failsWith: status.failsWith }, run)
		await workaround?.(I)
	}
