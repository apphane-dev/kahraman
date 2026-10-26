import { createActor, type BaseActor, type StoryContext } from 'kahraman'

import { scenarioIds, type ScenarioId } from './catalog.ts'
import { expectFailure, messageOf } from './expect-failure.ts'
import { scenarios } from './scenarios.ts'

/** A ticket number; the ticket lives in `tickets/` or `backlog/`. */
type Ticket = `${number}`

interface KnownGap {
	knownGap: Ticket
	/** A substring of the error the scenario fails with today. */
	failsWith: string
}

export type ScenarioStatus =
	| 'pass'
	| KnownGap
	| {
			/** The valid ARIA pattern the kit renders instead, e.g. `button + listbox`. */
			differs: string
			/** A substring of the error the scenario fails with. */
			failsWith: string
	  }

/**
 * The scenarios a kit implements; an absent scenario is n/a for the kit.
 * Declare it `as const satisfies KitManifest` so each status stays narrow.
 */
export interface KitManifest {
	kit: string
	scenarios: Partial<Record<ScenarioId, ScenarioStatus>>
	/**
	 * The full-page journey, when it fails although each scenario meets its own
	 * status: widgets that work alone but not side by side. Absent means it passes.
	 */
	page?: KnownGap
}

/** The same user journey, written for the kit's pattern. */
type Workaround = (I: BaseActor) => Promise<void>

// Non-distributive: a status widened to ScenarioStatus still demands the
// workaround, so a manifest without `as const` cannot skip it.
type WorkaroundArgs<S> = [Extract<S, { differs: string }>] extends [never]
	? []
	: [workaround: Workaround]

// Scenarios the manifest says the kit meets with a different pattern.
type DiffersIds<M extends KitManifest> = {
	[Id in keyof M['scenarios']]: [Extract<M['scenarios'][Id], { differs: string }>] extends [never]
		? never
		: Id
}[keyof M['scenarios']]

type PageArgs<M extends KitManifest> = [DiffersIds<M>] extends [never]
	? []
	: [workarounds: Record<DiffersIds<M>, Workaround>]

const markerOf = (status: Exclude<ScenarioStatus, 'pass'>) =>
	'knownGap' in status ? `known gap ${status.knownGap}` : `differs: ${status.differs}`

const runScenario = async (
	I: BaseActor,
	id: ScenarioId,
	status: ScenarioStatus | undefined,
	workaround: Workaround | undefined,
) => {
	const run = () => scenarios[id](I)
	if (status === undefined || status === 'pass') {
		await run()
		return
	}
	await expectFailure({ marker: markerOf(status), failsWith: status.failsWith }, run)
	await workaround?.(I)
}

const actorFor = (context: StoryContext) => {
	const I = createActor()
	I.init(context)
	return I
}

/**
 * Story test bodies for the scenarios a manifest declares; undeclared IDs are
 * a type error. A scenario the kit meets with a different pattern also takes
 * the workaround that passes against it.
 *
 * `run.page(workarounds)` is an integration journey: every declared scenario
 * in catalog order with one actor, against a story that renders all the kit's
 * fixtures together, so the widgets must also work side by side. A known gap
 * stops at its recorded failure and the journey continues without its effect.
 */
export const runnerFor = <M extends KitManifest>(manifest: M) => {
	const statusOf = (id: ScenarioId): ScenarioStatus | undefined =>
		(manifest.scenarios as KitManifest['scenarios'])[id]
	const run =
		<Id extends keyof M['scenarios'] & ScenarioId>(
			id: Id,
			...[workaround]: WorkaroundArgs<M['scenarios'][Id]>
		) =>
		async (context: StoryContext) => {
			await runScenario(actorFor(context), id, statusOf(id), workaround)
		}
	const journey = async (I: BaseActor, workarounds: Partial<Record<ScenarioId, Workaround>>) => {
		const declared = scenarioIds.filter((id) => Object.hasOwn(manifest.scenarios, id))
		for (const id of declared) {
			try {
				// Scenarios share the page, so they run one after another.
				// oxlint-disable-next-line no-await-in-loop
				await runScenario(I, id, statusOf(id), workarounds[id])
			} catch (error) {
				throw new Error(`${id} on the full page: ${messageOf(error)}`, { cause: error })
			}
		}
	}
	const page =
		(...[workarounds]: PageArgs<M>) =>
		async (context: StoryContext) => {
			const run = () => journey(actorFor(context), workarounds ?? {})
			const gap = manifest.page
			if (gap === undefined) {
				await run()
				return
			}
			await expectFailure(
				{ marker: `page known gap ${gap.knownGap}`, failsWith: gap.failsWith },
				run,
			)
		}
	return Object.assign(run, { page })
}
