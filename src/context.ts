// Renderer-agnostic Storybook context types.
//
// The actor only ever reads `canvasElement` and `userEvent` from the story
// context (the canvas is derived from `canvasElement` internally), and both are
// renderer-agnostic. Deriving the types from `storybook/test` via `import(...)`
// type queries keeps this file free of any runtime import and free of any
// renderer-specific package (`@storybook/react-vite`, `-vue`, `-svelte`, …), so
// the DSL types work for every Storybook renderer.

/**
 * The Testing-Library bound-queries object, as returned by `within(...)` from
 * `storybook/test`. Locators receive this and call `getByRole`, `findByText`, …
 */
export type Canvas = ReturnType<typeof import('storybook/test').within>

type UserEventInstance = ReturnType<typeof import('storybook/test').userEvent.setup>

/**
 * The `userEvent` methods the actor calls. Returns are `Promise<unknown>` so both
 * the `userEvent.setup()` instance on `StoryContext` (`keyboard(): Promise<void>`)
 * and the direct `userEvent` API (`keyboard(): Promise<System>`) are accepted.
 */
export type UserEvent = {
	[K in 'clear' | 'click' | 'keyboard' | 'tab' | 'type']: (
		...args: Parameters<UserEventInstance[K]>
	) => Promise<unknown>
}

/**
 * The minimal, renderer-agnostic slice of a Storybook `StoryContext` the actor
 * needs. A real `StoryContext` (from any renderer) structurally satisfies this.
 */
export interface StoryContext {
	canvasElement: HTMLElement
	userEvent: UserEvent
	/**
	 * Storybook's `context.step`. When present, every actor call is reported
	 * through it, so the Interactions panel shows codecept-style step groups
	 * (`I.see(heading "Dashboard")`) instead of raw Testing-Library calls.
	 * Optional so portable-story / plain-Vitest contexts remain valid.
	 */
	step?: (label: string, play: () => Promise<void> | void) => Promise<void> | void
}
