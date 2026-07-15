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

/** The `userEvent` instance re-exported by `storybook/test`. */
export type UserEvent = typeof import('storybook/test').userEvent

/**
 * The minimal, renderer-agnostic slice of a Storybook `StoryContext` the actor
 * needs. A real `StoryContext` (from any renderer) structurally satisfies this.
 */
export interface StoryContext {
	canvasElement: HTMLElement
	userEvent: UserEvent
}
