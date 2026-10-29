import type { Canvas } from './loc'

import { buildQueries, queryAllByRole, queryAllByText } from 'storybook/test'

// The container, its own shadow root, and every open shadow root below them.
// Closed roots stay out of reach: their hosts expose no shadowRoot.
const openRoots = (container: Element): (Element | ShadowRoot)[] => {
	const roots: (Element | ShadowRoot)[] = container.shadowRoot
		? [container, container.shadowRoot]
		: [container]
	for (const root of roots) {
		for (const el of root.querySelectorAll('*')) {
			if (el.shadowRoot) {
				roots.push(el.shadowRoot)
			}
		}
	}
	return roots
}

type RoleArgs = Parameters<typeof queryAllByRole> extends [unknown, ...infer A] ? A : never
type TextArgs = Parameters<typeof queryAllByText> extends [unknown, ...infer A] ? A : never

const described = (value: unknown) =>
	value instanceof RegExp ? `\`${String(value)}\`` : `"${String(value)}"`

const roleLabel = ([role, options]: RoleArgs) =>
	`the role "${String(role)}"${options?.name === undefined ? '' : ` and name ${described(options.name)}`}`

// Matches from every root, in tree order per root. A node reached twice is
// kept once; distinct elements with the same name stay distinct.
const allByRole = (container: HTMLElement, ...args: RoleArgs) => [
	...new Set(openRoots(container).flatMap((root) => queryAllByRole(root as HTMLElement, ...args))),
]

const allByText = (container: HTMLElement, ...args: TextArgs) => [
	...new Set(openRoots(container).flatMap((root) => queryAllByText(root as HTMLElement, ...args))),
]

const [queryByRole, getAllByRole, getByRole, findAllByRole, findByRole] = buildQueries(
	allByRole,
	(_container, ...args: RoleArgs) => `Found multiple elements with ${roleLabel(args)}`,
	(_container, ...args: RoleArgs) => `Unable to find an accessible element with ${roleLabel(args)}`,
)

const [queryByText, getAllByText, getByText, findAllByText, findByText] = buildQueries(
	allByText,
	(_container, ...[text]: TextArgs) => `Found multiple elements with the text: ${String(text)}`,
	(_container, ...[text]: TextArgs) => `Unable to find an element with the text: ${String(text)}`,
)

/**
 * A canvas whose role and text queries also search open shadow roots inside
 * `container`. Experimental: see ticket 17.
 */
export const withShadowRoots = (canvas: Canvas, container: HTMLElement): Canvas =>
	({
		...canvas,
		queryAllByRole: (...args: RoleArgs) => allByRole(container, ...args),
		queryByRole: (...args: RoleArgs) => queryByRole(container, ...args),
		getAllByRole: (...args: RoleArgs) => getAllByRole(container, ...args),
		getByRole: (...args: RoleArgs) => getByRole(container, ...args),
		findAllByRole: (
			...args: Parameters<typeof findAllByRole> extends [unknown, ...infer A] ? A : never
		) => findAllByRole(container, ...args),
		findByRole: (
			...args: Parameters<typeof findByRole> extends [unknown, ...infer A] ? A : never
		) => findByRole(container, ...args),
		queryAllByText: (...args: TextArgs) => allByText(container, ...args),
		queryByText: (...args: TextArgs) => queryByText(container, ...args),
		getAllByText: (...args: TextArgs) => getAllByText(container, ...args),
		getByText: (...args: TextArgs) => getByText(container, ...args),
		findAllByText: (
			...args: Parameters<typeof findAllByText> extends [unknown, ...infer A] ? A : never
		) => findAllByText(container, ...args),
		findByText: (
			...args: Parameters<typeof findByText> extends [unknown, ...infer A] ? A : never
		) => findByText(container, ...args),
	}) as Canvas
