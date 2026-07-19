import { describe, expect, test } from 'vitest'

import { button } from '../src/loc'
import {
	createErrorAugmenter,
	createInternalFrameMatcher,
	createStackRetargeter,
	formatStepArgument,
	stepLabel,
} from '../src/steps'

describe('formatStepArgument', () => {
	test('quotes strings', () => {
		expect(formatStepArgument('see', 'Save', 0)).toBe('"Save"')
	})

	test('uses a locator __label when the argument is a locator function', () => {
		expect(formatStepArgument('see', button('Save'), 0)).toBe('button "Save"')
	})

	test('renders bare functions as fn()', () => {
		expect(formatStepArgument('tryTo', () => {}, 1)).toBe('fn()')
	})

	test('collapses callback arguments to an ellipsis', () => {
		// scope/within callback is arg index 1; tryTo/retryTo callback is index 0
		expect(formatStepArgument('within', () => {}, 1)).toBe('…')
		expect(formatStepArgument('retryTo', () => {}, 0)).toBe('…')
	})

	test('stringifies other values', () => {
		expect(formatStepArgument('press', 42, 0)).toBe('42')
	})
})

describe('stepLabel', () => {
	test('formats a full call', () => {
		expect(stepLabel('see', [button('Save')])).toBe('I.see(button "Save")')
	})

	test('joins multiple arguments', () => {
		expect(stepLabel('seeInField', [button('Email'), 'a@b.c'])).toBe(
			'I.seeInField(button "Email", "a@b.c")',
		)
	})
})

describe('createInternalFrameMatcher', () => {
	const moduleUrl = 'https://example.test/pkg/kahraman/dist/index.js'
	const isInternal = createInternalFrameMatcher(moduleUrl)

	test('strips frames in this module directory', () => {
		expect(isInternal('    at track (https://example.test/pkg/kahraman/dist/index.js:10:5)')).toBe(
			true,
		)
	})

	test('strips node_modules frames as a secondary filter', () => {
		expect(isInternal('    at fn (https://example.test/node_modules/storybook/x.js:1:1)')).toBe(
			true,
		)
	})

	test('keeps the consumer story / page-actor frame', () => {
		expect(
			isInternal('    at play (https://example.test/pkg/consumer/src/App.stories.tsx:3:9)'),
		).toBe(false)
	})
})

describe('createStackRetargeter', () => {
	const moduleUrl = 'https://example.test/pkg/kahraman/dist/index.js'
	const retarget = createStackRetargeter(moduleUrl)

	test('injects the consumer call frame ahead of internal frames', () => {
		const error = new Error('boom')
		error.stack = [
			'Error: boom',
			'    at internal (https://example.test/pkg/kahraman/dist/index.js:5:5)',
		].join('\n')
		const callSite = new Error('call site')
		callSite.stack = [
			'Error: call site',
			'    at track (https://example.test/pkg/kahraman/dist/index.js:9:9)',
			'    at userStory (https://example.test/pkg/consumer/src/App.stories.tsx:12:3)',
		].join('\n')

		retarget(error, callSite)

		const lines = error.stack.split('\n')
		expect(lines[1]).toContain('App.stories.tsx')
		// internal call-site frames are filtered out of the injected block
		expect(error.stack).toContain('App.stories.tsx')
	})

	test('is a no-op when either stack is missing', () => {
		const error = new Error('boom')
		error.stack = undefined
		expect(() => retarget(error, new Error('cs'))).not.toThrow()
	})
})

describe('createErrorAugmenter', () => {
	const augment = createErrorAugmenter('https://example.test/pkg/kahraman/dist/index.js')

	test('appends the step trace once', () => {
		const error = new Error('failed')
		const steps = [
			{ label: 'I.see(button "A")', status: 'pass' as const },
			{ label: 'I.click(button "B")', status: 'fail' as const },
		]
		augment(error, steps, new Error('cs'))
		expect(error.message).toContain('Actor steps (most recent last):')
		expect(error.message).toContain('✔ I.see(button "A")')
		expect(error.message).toContain('✖ I.click(button "B")')

		const after = error.message
		augment(error, steps, new Error('cs'))
		expect(error.message).toBe(after) // idempotent
	})

	test('indents nested steps by depth', () => {
		const error = new Error('failed')
		const steps = [
			{ label: 'I.seeDetailError()', status: 'fail' as const, depth: 0 },
			{ label: 'I.see(button "Try again")', status: 'fail' as const, depth: 1 },
		]
		augment(error, steps, new Error('cs'))
		expect(error.message).toContain('\n  ✖ I.seeDetailError()')
		expect(error.message).toContain('\n    ✖ I.see(button "Try again")')
	})
})
