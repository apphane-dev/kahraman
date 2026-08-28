// Page fixture for the browser-mode actor suite: mounts a component, hands the
// actor a Storybook-shaped context (canvasElement + userEvent from
// storybook/test), and unmounts afterwards — the same wiring a consumer story
// does via `I.init(context)` in a play function.
import { createRoot } from 'react-dom/client'
import { userEvent } from 'storybook/test'
import { afterEach } from 'vitest'

import type { StoryContext } from '../../src/context'

/**
 * Render a React element into a fresh canvas div and return its context.
 * React 18+ renders concurrently, so callers must wait for the first content
 * (`await I.see(...)`) before interacting — exactly like a real story.
 */
export const renderPage = (element: React.ReactElement): StoryContext => {
	const host = document.createElement('div')
	document.body.appendChild(host)
	const root = createRoot(host)
	root.render(element)
	afterEach(() => {
		root.unmount()
		host.remove()
	})
	const user = userEvent.setup({ document: host.ownerDocument })
	const userEventAdapter = {
		clear: (el: Element) => user.clear(el),
		click: (el: Element) => user.click(el),
		keyboard: (text: string) => user.keyboard(text),
		tab: (el?: Parameters<typeof user.tab>[0]) => user.tab(el),
		type: (el: Element, text: string, options?: Parameters<typeof user.type>[2]) =>
			user.type(el, text, options),
	}
	return {
		canvasElement: host,
		// Structural match for storybook/test's userEvent subset the actor uses
		userEvent: userEventAdapter as unknown as StoryContext['userEvent'],
	}
}
