import type {
	Renderer,
	StoryContext as StorybookStoryContext,
	StoryContextForLoaders,
} from 'storybook/internal/types'
import type { Canvas, StoryContext } from '../src/context'
import type { ActorOptions } from '../src/actor'
import { expect, expectTypeOf, test } from 'vitest'

type StorybookUserEvent = typeof import('storybook/test').userEvent

type Storybook10_4UserEvent = Omit<StorybookUserEvent, 'setup'> & {
	setup(
		options: NonNullable<Parameters<StorybookUserEvent['setup']>[0]>,
	): ReturnType<StorybookUserEvent['setup']>
}

test('accepts Storybook contexts whose userEvent.setup requires options', () => {
	const rendererContext = {
		canvasElement: {} as HTMLElement,
		userEvent: {} as Storybook10_4UserEvent,
	}
	const context: StoryContext = rendererContext

	expect(context).toBe(rendererContext)
})

// `StepFunction<TRenderer, TArgs>` is invariant in its generics, so these use a
// renderer and args unrelated to the defaults.
interface AnchorRenderer extends Renderer {
	component: (props: AnchorArgs) => HTMLAnchorElement
	storyResult: HTMLAnchorElement
}
interface AnchorArgs {
	href: string
	ref?: { current: HTMLAnchorElement | null }
}

test('accepts a Storybook StoryContext (userEvent.setup() instance)', () => {
	expectTypeOf<StorybookStoryContext<AnchorRenderer, AnchorArgs>>().toExtend<StoryContext>()
	expectTypeOf<StorybookStoryContext>().toExtend<StoryContext>()
})

test('accepts a Storybook loader context', () => {
	expectTypeOf<StoryContextForLoaders<AnchorRenderer, AnchorArgs>>().toExtend<StoryContext>()
})

test('accepts a context built with the direct userEvent API', () => {
	expectTypeOf<{
		canvasElement: HTMLElement
		userEvent: StorybookUserEvent
	}>().toExtend<StoryContext>()
})

test('canvas text options retain the Testing Library query types', () => {
	type TextOptions = NonNullable<Parameters<Canvas['getByText']>[1]>
	expectTypeOf<TextOptions['ignore']>().toEqualTypeOf<boolean | string | undefined>()
	expectTypeOf<ActorOptions['textIgnore']>().toEqualTypeOf<TextOptions['ignore']>()
	expectTypeOf<ReturnType<Canvas['queryByText']>>().toEqualTypeOf<HTMLElement | null>()
})
