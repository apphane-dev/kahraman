import type { StoryContext } from '../src/context'
import { expect, test } from 'vitest'

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
