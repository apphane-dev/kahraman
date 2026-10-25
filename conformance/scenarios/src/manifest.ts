import { createActor, type StoryContext } from 'kahraman'

import { scenarios, type ScenarioId } from './scenarios'

export interface KitManifest<Id extends ScenarioId = ScenarioId> {
	kit: string
	scenarios: readonly Id[]
}

/** Story test bodies for the scenarios a kit declares; undeclared IDs are a type error. */
export const runnerFor =
	<Id extends ScenarioId>(_manifest: KitManifest<Id>) =>
	(id: Id) =>
	async (context: StoryContext) => {
		const I = createActor()
		I.init(context)
		await scenarios[id](I)
	}
