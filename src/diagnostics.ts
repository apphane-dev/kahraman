// Pure, Storybook-free helpers for taming Testing-Library element-not-found
// output. These are unit-tested directly; the `./preview` entry wires them into
// Storybook via `configure({ getElementError })`.

/** Maximum length of a formatted element-error message before it is truncated. */
export const ELEMENT_ERROR_MAX_LENGTH = 2000

/** Marker that precedes Testing-Library's accessible-roles listing. */
export const ROLE_LISTING_MARKER = 'Here are the accessible roles:'

/**
 * Reduce Testing-Library's `getByRole` miss output to just the queried role's
 * section. The default lists EVERY accessible role on the page — hundreds of
 * lines on a full app mount — burying the near-misses that actually help.
 */
export function filterRoleListing(message: string): string {
	const roleName = /the role "([^"]+)"/.exec(message)?.[1]
	const markerIndex = message.indexOf(ROLE_LISTING_MARKER)
	if (roleName === undefined || markerIndex === -1) {
		return message
	}
	const head = message.slice(0, markerIndex)
	const sections = message.slice(markerIndex + ROLE_LISTING_MARKER.length).split(/^\s*-{10,}\s*$/m)
	const roleSection = sections.find((section) => section.trimStart().startsWith(`${roleName}:`))
	if (roleSection === undefined) {
		return `${head}(no "${roleName}" elements are rendered)`
	}
	return `${head}Elements with role "${roleName}":\n\n${roleSection.trim()}\n\n(other roles omitted)`
}

/** Truncate a message to `maxLength`, appending a truncation notice when cut. */
export function capMessage(message: string, maxLength = ELEMENT_ERROR_MAX_LENGTH): string {
	return message.length > maxLength ? `${message.slice(0, maxLength)}\n… (truncated)` : message
}

/** True when `message` contains an accessible-roles listing (a `byRole` miss). */
export function hasRoleListing(message: string | null): boolean {
	return message?.includes(ROLE_LISTING_MARKER) ?? false
}
