import { describe, expect, test } from 'vitest'

import { button, heading, link, role, text } from '../src/loc'

// Locator construction is pure: building a locator and reading its metadata
// never touches the DOM or Storybook, so it is unit-testable directly.

describe('locator __label construction', () => {
	test('role with no name', () => {
		expect(role('button').__label).toBe('button')
	})

	test('role with string name is quoted', () => {
		expect(role('button', 'Save').__label).toBe('button "Save"')
	})

	test('role with RegExp name is stringified', () => {
		expect(role('heading', /Dashboard/i).__label).toBe('heading /Dashboard/i')
	})

	test('text locator', () => {
		expect(text('Hello').__label).toBe('text "Hello"')
	})

	test('heading / button / link are role shorthands', () => {
		expect(heading('Title').__label).toBe('heading "Title"')
		expect(button('OK').__label).toBe('button "OK"')
		expect(link('Home').__label).toBe('link "Home"')
	})
})

describe('fluent transitions extend the label', () => {
	test('.within(global)', () => {
		expect(button('Save').within('global').__label).toBe('button "Save" .within(global)')
	})

	test('.within(locator) uses the scope label', () => {
		const scoped = button('Save').within(role('dialog'))
		expect(scoped.__label).toBe('button "Save" .within(dialog)')
	})

	test('.options(...) is appended and captured', () => {
		const current = link('Storage').options({ current: 'page' })
		expect(current.__label).toBe('link "Storage" .options({"current":"page"})')
	})

	test('.wait() / .all() / .maybe() chain into the label', () => {
		expect(role('status').wait().__label).toBe('status .wait()')
		expect(role('listitem').all().__label).toBe('listitem .all()')
		expect(role('alert').maybe().__label).toBe('alert .maybe()')
	})
})

describe('__within scope metadata', () => {
	test('defaults to undefined', () => {
		expect(button('Save').__within).toBeUndefined()
	})

	test('is set by .within(global)', () => {
		expect(button('Save').within('global').__within).toBe('global')
	})
})

describe('invalid transitions after .maybe()', () => {
	test('.wait() throws', () => {
		expect(() => role('alert').maybe().wait()).toThrow('Cannot call .wait() after .maybe()')
	})

	test('.all() throws', () => {
		expect(() => role('alert').maybe().all()).toThrow('Cannot call .all() after .maybe()')
	})
})
