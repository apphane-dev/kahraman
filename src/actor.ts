import type { AnyLocator, ArrayLocator, Canvas, DefiniteLocator, FluentLocator } from './loc'
import type { StoryContext, UserEvent } from './context'

import { expect, waitFor, within as withinElement } from 'storybook/test'

import { invariant } from './invariant'
import { createErrorAugmenter, stepLabel, type Step } from './steps'

type MaybePromise<T> = T | Promise<T>

// Internal-frame detection and stack retargeting are computed relative to THIS
// module's own URL, so kahraman strips its own frames and surfaces the
// consumer's story / page-actor call site — no hardcoded app paths.
const augmentActorError = createErrorAugmenter(import.meta.url)

// `VITE_TEST_STEPS=true` opts into live per-step logging. It is CONSUMER config
// (a Vite/Vitest define); guarded so the package is safe to import under plain
// Node where `import.meta.env` is undefined.
const liveStepLogging = (): boolean =>
	(import.meta as { env?: Record<string, string | undefined> }).env?.['VITE_TEST_STEPS'] === 'true'

type TrackedCallback = (...args: unknown[]) => Promise<unknown>

/** Wraps an actor method so the call is recorded as a step (trace + Storybook). */
type Track = (name: string, callback: TrackedCallback) => TrackedCallback

const trackBaseMethods = <T extends object>(methods: T, track: Track) =>
	Object.fromEntries(
		Object.entries(methods).map(([name, method]) => [
			name,
			name === 'resolveLocator' || name === 'hopeThat' || typeof method !== 'function'
				? method
				: track(name, method as (...args: unknown[]) => Promise<unknown>),
		]),
	) as T

export interface HopeThat {
	(callback: () => MaybePromise<unknown>): Promise<boolean>
	noErrors(): void
}

const toError = (error: unknown) => (error instanceof Error ? error : new Error(String(error)))

const sleep = (ms: number) => new Promise((resolve) => globalThis.setTimeout(resolve, ms))

const isMissingElementError = (error: unknown) =>
	error instanceof Error &&
	error.name === 'TestingLibraryElementError' &&
	error.message.startsWith('Unable to find')

const assertValidMaxTries = (maxTries: number) => {
	invariant(
		Number.isInteger(maxTries) && maxTries > 0,
		'retryTo maxTries must be a positive integer',
	)
}

const retryAfterFailure = async <T>(
	error: unknown,
	callback: (tryNumber: number) => MaybePromise<T>,
	maxTries: number,
	pollInterval: number,
	tryNumber: number,
): Promise<T> => {
	if (tryNumber >= maxTries) {
		throw toError(error)
	}
	await sleep(pollInterval)
	return attemptRetry(callback, maxTries, pollInterval, tryNumber + 1)
}

const attemptRetry = async <T>(
	callback: (tryNumber: number) => MaybePromise<T>,
	maxTries: number,
	pollInterval: number,
	tryNumber: number,
): Promise<T> => {
	try {
		return await callback(tryNumber)
	} catch (error) {
		return retryAfterFailure(error, callback, maxTries, pollInterval, tryNumber)
	}
}

// Inspired by codecept.js — see https://codecept.io/blog/codeceptjs-4/ for the
// actor API this mirrors (selectOption, hopeThat soft assertions, retryTo, etc.)
function createBase(ctx: () => StoryContext, track: Track, actorOptions: ActorOptions): BaseActor {
	const scopeStack: HTMLElement[] = []
	const softErrors: Error[] = []

	function rootCanvas() {
		return withinElement(ctx().canvasElement.ownerDocument.body)
	}

	function activeCanvas() {
		if (scopeStack.length > 0) {
			return withinElement(scopeStack.at(-1)!)
		}
		return withinElement(ctx().canvasElement)
	}

	async function resolveScopeLocator(
		scopeLocator: DefiniteLocator,
		resolvingScopes: Set<DefiniteLocator>,
	): Promise<HTMLElement> {
		if (resolvingScopes.has(scopeLocator)) {
			throw new Error('Circular locator scope detected in .within(...)')
		}
		resolvingScopes.add(scopeLocator)
		try {
			const result = await resolveLocator(scopeLocator, resolvingScopes)
			invariant(
				result instanceof HTMLElement,
				'Expected .within(locator) to resolve to an HTMLElement',
			)
			return result
		} finally {
			resolvingScopes.delete(scopeLocator)
		}
	}

	async function canvasFor(
		locator: AnyLocator,
		resolvingScopes: Set<DefiniteLocator>,
	): Promise<Canvas> {
		// __within is part of every locator type via LocatorMeta — no cast needed
		const explicitScope = locator.__within
		if (!explicitScope) {
			return activeCanvas()
		}
		if (explicitScope === 'global') {
			return rootCanvas()
		}
		if (explicitScope instanceof HTMLElement) {
			return withinElement(explicitScope)
		}
		return withinElement(await resolveScopeLocator(explicitScope, resolvingScopes))
	}

	async function resolveLocator(
		locator: AnyLocator,
		resolvingScopes: Set<DefiniteLocator> = new Set(),
	): Promise<HTMLElement | HTMLElement[] | null> {
		return await locator(await canvasFor(locator, resolvingScopes))
	}

	const elementFrom = async (
		locator: DefiniteLocator,
		message = 'Expected locator to resolve to an HTMLElement',
	) => {
		const el = await resolveLocator(locator)
		invariant(el instanceof HTMLElement, message)
		return el
	}

	const elementsFrom = async (locator: AnyLocator, options?: { missingAsEmpty?: boolean }) => {
		try {
			const result = await resolveLocator(locator)
			if (Array.isArray(result)) {
				return result
			}
			return result ? [result] : []
		} catch (error) {
			if (options?.missingAsEmpty === true && isMissingElementError(error)) {
				return []
			}
			throw error
		}
	}

	const click = async (locator: DefiniteLocator) => {
		if (actorOptions.clickDelay && actorOptions.clickDelay > 0) {
			await sleep(actorOptions.clickDelay)
		}
		await ctx().userEvent.click(await elementFrom(locator))
	}

	const editInput = async (
		locator: DefiniteLocator,
		expectedValue: string,
		action: (el: HTMLInputElement, userEvent: UserEvent) => Promise<void>,
	) => {
		const { userEvent } = ctx()
		const el = await elementFrom(locator, 'Expected locator to resolve to an HTMLInputElement')
		invariant(el instanceof HTMLInputElement, 'Expected locator to resolve to an HTMLInputElement')
		await userEvent.click(el)
		await action(el, userEvent)
		await waitFor(() => expect(el.value).toBe(expectedValue))
		return userEvent
	}

	const scope = async <T>(locator: DefiniteLocator, callback: () => MaybePromise<T>) => {
		const element = await elementFrom(
			locator,
			'Expected scope locator to resolve to an HTMLElement',
		)
		scopeStack.push(element)
		try {
			return await callback()
		} finally {
			scopeStack.pop()
		}
	}

	const retryTo = async <T>(
		callback: (tryNumber: number) => MaybePromise<T>,
		maxTries: number,
		pollInterval = 200,
	) => {
		assertValidMaxTries(maxTries)
		return attemptRetry(callback, maxTries, pollInterval, 1)
	}

	const hopeThat = Object.assign(
		async (callback: () => MaybePromise<unknown>) => {
			try {
				await callback()
				return true
			} catch (error) {
				softErrors.push(toError(error))
				return false
			}
		},
		{
			noErrors: () => {
				if (softErrors.length === 0) {
					return
				}
				const errors = softErrors.splice(0)
				throw new AggregateError(
					errors,
					`${errors.length} soft assertion(s) failed:\n${errors
						.map((error, index) => `${index + 1}) ${error.message}`)
						.join('\n')}`,
				)
			},
		},
	) satisfies HopeThat

	const methods = {
		resolveLocator,
		see: async (locator: AnyLocator) => {
			const [el] = await elementsFrom(locator)
			expect(el).toBeInTheDocument()
			invariant(el instanceof HTMLElement, 'Expected locator to resolve to an HTMLElement')
			return el
		},
		dontSee: async (locator: FluentLocator) => {
			expect(await resolveLocator(locator.maybe())).toBeNull()
		},
		waitExit: async (locator: FluentLocator) => {
			await waitFor(async () => void expect(await resolveLocator(locator.maybe())).toBeNull())
		},
		seeInField: async (locator: DefiniteLocator, value: string | number) => {
			expect(await elementFrom(locator)).toHaveValue(value)
		},
		dontSeeInField: async (locator: DefiniteLocator, value: string | number) => {
			expect(await elementFrom(locator)).not.toHaveValue(value)
		},
		seeChecked: async (locator: DefiniteLocator) => {
			expect(await elementFrom(locator)).toBeChecked()
		},
		dontSeeChecked: async (locator: DefiniteLocator) => {
			expect(await elementFrom(locator)).not.toBeChecked()
		},
		seeDisabled: async (locator: DefiniteLocator) => {
			expect(await elementFrom(locator)).toBeDisabled()
		},
		dontSeeDisabled: async (locator: DefiniteLocator) => {
			expect(await elementFrom(locator)).not.toBeDisabled()
		},
		seeAttribute: async (locator: DefiniteLocator, name: string, value?: string | RegExp) => {
			const el = await elementFrom(locator)
			if (value === undefined) {
				expect(el).toHaveAttribute(name)
			} else {
				expect(el).toHaveAttribute(name, value)
			}
		},
		dontSeeAttribute: async (locator: DefiniteLocator, name: string) => {
			expect(await elementFrom(locator)).not.toHaveAttribute(name)
		},
		seeNumberOfElements: async (locator: AnyLocator, count: number) => {
			expect(await elementsFrom(locator, { missingAsEmpty: count === 0 })).toHaveLength(count)
		},
		grabTextFrom: async (locator: DefiniteLocator) =>
			(await elementFrom(locator)).textContent ?? '',
		grabTextFromAll: async (locator: ArrayLocator) =>
			(await elementsFrom(locator)).map((el) => el.textContent ?? ''),
		grabValueFrom: async (locator: DefiniteLocator) => {
			const el = await elementFrom(locator)
			invariant('value' in el, 'Expected locator to resolve to a value-bearing element')
			return String(el.value)
		},
		click,
		fill: async (locator: DefiniteLocator, value: string) => {
			// oxlint-disable-next-line no-shadow
			const userEvent = await editInput(locator, value, async (el, userEvent) => {
				await userEvent.type(el, value, {
					initialSelectionStart: 0,
					initialSelectionEnd: el.value.length,
				})
			})
			await userEvent.tab()
		},
		selectOption: async (locator: DefiniteLocator, value: string | RegExp) => {
			const global = withinElement(ctx().canvasElement.ownerDocument.body)
			await click(locator)
			await click(() => global.getByRole('option', { name: value }))
		},
		clear: async (locator: DefiniteLocator) => {
			await editInput(locator, '', async (el, userEvent) => {
				await userEvent.clear(el)
			})
		},
		press: async (key: string) => {
			await ctx().userEvent.keyboard(key)
		},
		scope,
		within: scope,
		say: async (message: string) => {
			console.info(message)
		},
		tryTo: async (callback: () => MaybePromise<unknown>) => {
			try {
				await callback()
				return true
			} catch {
				return false
			}
		},
		retryTo,
		hopeThat,
	} satisfies BaseActor

	return trackBaseMethods(methods, track)
}

export interface BaseActor {
	resolveLocator(locator: AnyLocator): Promise<HTMLElement | HTMLElement[] | null>
	see(locator: AnyLocator): Promise<HTMLElement>
	dontSee(locator: FluentLocator): Promise<void>
	waitExit(locator: FluentLocator): Promise<void>
	seeInField(locator: DefiniteLocator, value: string | number): Promise<void>
	dontSeeInField(locator: DefiniteLocator, value: string | number): Promise<void>
	seeChecked(locator: DefiniteLocator): Promise<void>
	dontSeeChecked(locator: DefiniteLocator): Promise<void>
	seeDisabled(locator: DefiniteLocator): Promise<void>
	dontSeeDisabled(locator: DefiniteLocator): Promise<void>
	seeAttribute(locator: DefiniteLocator, name: string, value?: string | RegExp): Promise<void>
	dontSeeAttribute(locator: DefiniteLocator, name: string): Promise<void>
	seeNumberOfElements(locator: AnyLocator, count: number): Promise<void>
	grabTextFrom(locator: DefiniteLocator): Promise<string>
	grabTextFromAll(locator: ArrayLocator): Promise<string[]>
	grabValueFrom(locator: DefiniteLocator): Promise<string>
	click(locator: DefiniteLocator): Promise<void>
	fill(locator: DefiniteLocator, value: string): Promise<void>
	selectOption(locator: DefiniteLocator, value: string | RegExp): Promise<void>
	clear(locator: DefiniteLocator): Promise<void>
	press(key: string): Promise<void>
	scope<T>(locator: DefiniteLocator, callback: () => MaybePromise<T>): Promise<T>
	within<T>(locator: DefiniteLocator, callback: () => MaybePromise<T>): Promise<T>
	say(message: string): Promise<void>
	tryTo(callback: () => MaybePromise<unknown>): Promise<boolean>
	retryTo<T>(
		callback: (tryNumber: number) => MaybePromise<T>,
		maxTries: number,
		pollInterval?: number,
	): Promise<T>
	hopeThat: HopeThat
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Actor<T extends {} = {}> = BaseActor &
	T & {
		init(context: StoryContext): void
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		extend<U extends {}>(extension: (current: BaseActor & T) => U): Actor<T & U>
	}

// Extension (page-actor) methods are tracked like base methods, so
// `I.seeDetailError()` shows up in the step trace and the Interactions panel
// with its inner base calls nested one level deeper. Extra own properties on a
// function (e.g. a `hopeThat`-style hybrid) are carried over onto the wrapper.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const trackExtensionMethods = <U extends {}>(extension: U, track: Track): U =>
	Object.fromEntries(
		Object.entries(extension).map(([name, value]) => [
			name,
			typeof value === 'function'
				? Object.assign(track(name, value as TrackedCallback), value)
				: value,
		]),
	) as U

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
function makeActor<M extends {}>(
	methods: BaseActor & M,
	initFn: (context: StoryContext) => void,
	track: Track,
) {
	return Object.assign({}, methods, {
		init: initFn,
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		extend<U extends {}>(ext: (current: BaseActor & M) => U) {
			const extra = trackExtensionMethods(ext(methods), track)
			return makeActor<M & U>({ ...methods, ...extra }, initFn, track)
		},
	}) as Actor<M>
}

export interface ActorOptions {
	/**
	 * Milliseconds to wait before each click. Useful for making interactions
	 * observable when stories are played manually. Defaults to no delay.
	 */
	clickDelay?: number
}

/**
 * Create a fresh actor. Call `I.init(storyContext)` inside a story `play` /
 * test before using any actor method, then drive the UI declaratively:
 *
 * ```ts
 * const I = createActor()
 * I.init(context)
 * await I.see(heading('Dashboard'))
 * await I.click(button('Save'))
 * ```
 */
export const createActor = (options: ActorOptions = {}): Actor => {
	let _ctx: StoryContext | null = null

	function ctx() {
		invariant(_ctx !== null, 'I.init(ctx) must be called before using I methods')
		return _ctx
	}

	const steps: Step[] = []
	// Shared nesting counter for step indentation. Correct for the normal
	// sequential-await flow (page-actor methods and scope callbacks nest their
	// inner base calls one level deeper). Interleaved concurrent chains — e.g.
	// `await Promise.all([I.click(a), I.click(b)])` — can read each other's depth
	// and mis-indent the trace; per-chain accuracy would need AsyncLocalStorage,
	// which is not appropriate in the browser test runtime. Best-effort by design:
	// it only affects trace indentation, never control flow or pass/fail.
	let depth = 0

	const track: Track =
		(name, callback) =>
		async (...args) => {
			const step = {
				label: stepLabel(name, args),
				status: 'pass' as Step['status'],
				depth,
			} satisfies Step
			// Captured before any await so the stack still holds the caller frames.
			const callSite = new Error('actor call site')
			steps.push(step)
			if (liveStepLogging()) {
				console.info(`${'  '.repeat(step.depth)}${step.label}`)
			}
			// Nested actor calls (inside a page-actor method or a scope callback)
			// indent one level deeper in the trace.
			const invoke = async () => {
				depth += 1
				try {
					return await callback(...args)
				} finally {
					depth -= 1
				}
			}
			try {
				// When Storybook provides `context.step` (it is on the story context
				// the loader/play receives), report the call through it so the
				// Interactions panel shows this label as a collapsible step group.
				const storyContext = _ctx
				let result: unknown
				if (storyContext?.step) {
					// Call `step` as a member so a `this`-dependent implementation keeps
					// its receiver (real Storybook's `context.step` needs no `this`).
					await storyContext.step(step.label, async () => {
						result = await invoke()
					})
				} else {
					result = await invoke()
				}
				step.status = 'pass'
				return result
			} catch (error) {
				step.status = 'fail'
				if (error instanceof Error) {
					augmentActorError(error, steps, callSite)
				}
				throw error
			}
		}

	return makeActor(
		createBase(ctx, track, options),
		(context) => {
			_ctx = context
			steps.length = 0
			depth = 0
		},
		track,
	)
}
