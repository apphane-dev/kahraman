import type { Canvas } from './loc'

import { buildQueries, getConfig, queryAllByRole, queryAllByText } from 'storybook/test'

// Where a query looks: the container, its own shadow root, and every open
// shadow root below them, nested included, plus the elements slotted into
// their slots, such as a select's options projected into its listbox. Closed
// roots stay out of reach: their hosts expose no shadowRoot.
const scopesOf = (container: Element) => {
	const roots = new Set<Element | ShadowRoot>([container])
	const slotted = new Set<Element>()
	const enter = (el: Element) => {
		if (el.shadowRoot) {
			roots.add(el.shadowRoot)
		}
	}
	enter(container)
	// A slotted element is scanned like a root, so shadow roots inside it count.
	for (const root of roots) {
		for (const el of root.querySelectorAll('*')) {
			enter(el)
			if (el instanceof HTMLSlotElement) {
				for (const assigned of el.assignedElements({ flatten: true })) {
					slotted.add(assigned)
					roots.add(assigned)
					enter(assigned)
				}
			}
		}
	}
	return { roots: [...roots], slotted: [...slotted] }
}

// Queries search descendants only, so a slotted element is queried through
// its parent and the matches outside it are dropped.
const matchesIn = (container: Element, query: (scope: HTMLElement) => HTMLElement[]) => {
	const { roots, slotted } = scopesOf(container)
	return [
		...new Set([
			...roots.flatMap((root) => query(root as HTMLElement)),
			...slotted.flatMap((el) =>
				el.parentNode ? query(el.parentNode as HTMLElement).filter((m) => el.contains(m)) : [],
			),
		]),
	]
}

type RoleArgs = Parameters<typeof queryAllByRole> extends [unknown, ...infer A] ? A : never
type TextArgs = Parameters<typeof queryAllByText> extends [unknown, ...infer A] ? A : never

const described = (value: unknown) =>
	value instanceof RegExp ? `\`${String(value)}\`` : `"${String(value)}"`

const roleLabel = ([role, options]: RoleArgs) =>
	`the role "${String(role)}"${options?.name === undefined ? '' : ` and name ${described(options.name)}`}`

// The parent in the rendered tree: the slot an element is assigned to, its
// parent element, or the host of the shadow root it sits at the top of.
const renderedParent = (el: Element): Element | null => {
	const root = el.getRootNode()
	return el.assignedSlot ?? el.parentElement ?? (root instanceof ShadowRoot ? root.host : null)
}

// Testing Library's accessibility check walks parentElement, so it stops at a
// shadow root and skips the slot a match is assigned to. This applies its
// subtree rules along the rendered tree instead.
const hidesSubtree = (el: Element) =>
	(el instanceof HTMLElement && el.hidden) ||
	el.getAttribute('aria-hidden') === 'true' ||
	getComputedStyle(el).display === 'none'

const hiddenInRenderedTree = (el: Element) => {
	for (let node: Element | null = el; node; node = renderedParent(node)) {
		const parent = node.parentElement
		// Light DOM below an open shadow host is rendered only through a slot.
		// A populated slot also removes its own fallback children from that tree.
		if (
			!node.assignedSlot &&
			(parent?.shadowRoot ||
				(parent instanceof HTMLSlotElement && parent.assignedNodes().length > 0))
		) {
			return true
		}
		if (node !== el && hidesSubtree(node)) {
			return true
		}
	}
	return false
}

// A node reached twice is kept once; distinct elements with the same name
// stay distinct.
const allByRole = (container: HTMLElement, ...args: RoleArgs) => {
	const matches = matchesIn(container, (scope) => queryAllByRole(scope, ...args))
	const hidden = args[1]?.hidden ?? getConfig().defaultHidden
	return hidden ? matches : matches.filter((el) => !hiddenInRenderedTree(el))
}

const allByText = (container: HTMLElement, ...args: TextArgs) =>
	matchesIn(container, (scope) => queryAllByText(scope, ...args))

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
