// Illustration only — NOT part of the published package.
//
// kahraman ships the generic actor + locator DSL. App-specific expectations
// belong in YOUR repo, composed with `I.extend(...)`. This trimmed page-actor
// mirrors the pattern the library was extracted from: reusable, page-level
// expectations built on top of the base actor's `see` / `click` / `dontSee`.
//
// In a real consumer you would import from the package:
//
//   import { button, heading, role, text, type BaseActor } from 'kahraman'
//
// Here we import from source so the example type-checks inside this repo.
import { button, heading, role, text, type BaseActor } from '../src'

type LocatorName = string | RegExp

type PageErrorExpectation = {
	title: LocatorName
	description?: LocatorName
}

const seePageError = async (I: Pick<BaseActor, 'see'>, error: PageErrorExpectation) => {
	await I.see(heading(error.title))
	if (error.description !== undefined) {
		await I.see(text(error.description))
	}
	await I.see(role('alert'))
	await I.see(button('Try again'))
}

export const withPageError = (error: PageErrorExpectation) => (I: Pick<BaseActor, 'see'>) => ({
	seeError: () => seePageError(I, error),
})

export const withRetryAndLoading =
	(loadingLabel: string) => (I: Pick<BaseActor, 'click' | 'dontSee' | 'see'>) => ({
		retry: () => I.click(button('Try again')),
		seeLoading: async () => {
			await I.see(role('status', loadingLabel))
			await I.dontSee(role('alert'))
		},
	})
