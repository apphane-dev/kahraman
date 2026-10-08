import { definePreviewAddon } from 'storybook/internal/csf'
import type { KahramanParameters } from './preview'
import addonAnnotations from './preview'

/** Register the opt-in diagnostics annotation with a CSF Next preview. */
export default () => definePreviewAddon<{ parameters: KahramanParameters }>(addonAnnotations)

export { createActor } from './actor'
export type { Actor, ActorOptions, BaseActor, HopeThat } from './actor'

export { button, heading, link, role, text } from './loc'
export type {
	AnyLocator,
	ArrayLocator,
	Canvas,
	DefiniteLocator,
	FluentLocator,
	Locator,
} from './loc'

export type { StoryContext, UserEvent } from './context'

export { invariant } from './invariant'
