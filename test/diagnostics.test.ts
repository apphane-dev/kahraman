import { describe, expect, test } from 'vitest'

import {
	capMessage,
	ELEMENT_ERROR_MAX_LENGTH,
	filterRoleListing,
	hasRoleListing,
	ROLE_LISTING_MARKER,
} from '../src/diagnostics'

const roleMiss = (roleName: string, sections: Record<string, string>) => {
	const body = Object.entries(sections)
		.map(([name, content]) => `${name}:\n${content}`)
		.join('\n--------------------------------------------------\n')
	return [
		`Unable to find an accessible element with the role "${roleName}"`,
		'',
		ROLE_LISTING_MARKER,
		'',
		body,
	].join('\n')
}

describe('filterRoleListing', () => {
	test('keeps only the queried role section', () => {
		const message = roleMiss('button', {
			button: '  Name "Cancel":\n  <button />',
			heading: '  Name "Title":\n  <h1 />',
		})
		const filtered = filterRoleListing(message)
		expect(filtered).toContain('Elements with role "button"')
		expect(filtered).toContain('Name "Cancel"')
		expect(filtered).not.toContain('Name "Title"')
		expect(filtered).toContain('(other roles omitted)')
	})

	test('reports when the queried role is not rendered at all', () => {
		const message = roleMiss('button', { heading: '  Name "Title":\n  <h1 />' })
		expect(filterRoleListing(message)).toContain('(no "button" elements are rendered)')
	})

	test('passes through messages without a role listing unchanged', () => {
		const message = 'Unable to find an element with the text: Missing.'
		expect(filterRoleListing(message)).toBe(message)
	})
})

describe('hasRoleListing', () => {
	test('true when the marker is present', () => {
		expect(hasRoleListing(`x ${ROLE_LISTING_MARKER} y`)).toBe(true)
	})

	test('false for null or plain messages', () => {
		expect(hasRoleListing(null)).toBe(false)
		expect(hasRoleListing('nope')).toBe(false)
	})
})

describe('capMessage', () => {
	test('leaves short messages intact', () => {
		expect(capMessage('short')).toBe('short')
	})

	test('truncates and annotates long messages', () => {
		const long = 'a'.repeat(ELEMENT_ERROR_MAX_LENGTH + 100)
		const capped = capMessage(long)
		expect(capped.endsWith('\n… (truncated)')).toBe(true)
		expect(capped.length).toBe(ELEMENT_ERROR_MAX_LENGTH + '\n… (truncated)'.length)
	})

	test('respects a custom max length', () => {
		expect(capMessage('abcdef', 3)).toBe('abc\n… (truncated)')
	})
})
