import { definePreview } from 'storybook/internal/csf'
import type { InferTypes } from 'storybook/internal/csf'
import { configure, getConfig } from 'storybook/test'
import { afterEach, beforeEach, expect, expectTypeOf, test } from 'vitest'
import kahraman, { button, createActor, heading, invariant, link, role, text } from '../src/index'
import annotations from '../src/preview'
import type { KahramanParameters } from '../src/preview'

const customElementError = (message: string | null) => new Error(message ?? 'Custom error')

let originalConfig: ReturnType<typeof getConfig>

beforeEach(() => {
	originalConfig = getConfig()
})

afterEach(() => {
	configure(originalConfig)
})

test('registers the existing diagnostics hook with a CSF Next preview', () => {
	const addon = kahraman()
	const preview = definePreview({ addons: [addon] })

	expect(addon.beforeEach).toBe(annotations.beforeEach)
	expect(preview.composed.beforeEach).toContain(annotations.beforeEach)
	expectTypeOf<InferTypes<[typeof addon]>['parameters']>().toEqualTypeOf<KahramanParameters>()
})

test('creating the addon leaves diagnostics opt-in', () => {
	const originalHandler = getConfig().getElementError

	kahraman()

	expect(getConfig().getElementError).toBe(originalHandler)
})

test('the registered hook uses per-story diagnostics and resets to defaults', () => {
	const addon = kahraman()

	expect(addon.beforeEach).toBe(annotations.beforeEach)
	annotations.beforeEach({ parameters: { kahraman: { getElementError: customElementError } } })
	expect(getConfig().getElementError).toBe(customElementError)

	annotations.beforeEach({ parameters: {} })
	expect(getConfig().getElementError).not.toBe(customElementError)
})

test('the legacy annotation and named actor exports remain available', () => {
	expect(annotations.beforeEach).toBeTypeOf('function')
	expect(createActor()).toHaveProperty('init')
	expect(button('Save').__label).toBe('button "Save"')
	expect(heading('Dashboard').__label).toBe('heading "Dashboard"')
	expect(link('Home').__label).toBe('link "Home"')
	expect(role('textbox', 'Email').__label).toBe('textbox "Email"')
	expect(text('Welcome').__label).toBe('text "Welcome"')
	expect(() => invariant(true, 'passes')).not.toThrow()
})
