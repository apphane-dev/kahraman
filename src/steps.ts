// Pure, Storybook-free helpers for the actor's step trace, error augmentation,
// and call-site stack retargeting. Kept free of any runtime import so they can
// be unit-tested directly.

export type Step = {
	label: string
	status: 'pass' | 'fail'
	/** Nesting level: 0 for top-level calls, +1 inside a page-actor method or scope callback. */
	depth?: number
}

const actorStepsAppended = Symbol('actorStepsAppended')

type AugmentedError = Error & { [actorStepsAppended]?: boolean }

const callbackArgument = (name: string, index: number) =>
	(name === 'scope' || name === 'within') && index === 1
		? true
		: (name === 'tryTo' || name === 'retryTo') && index === 0

/** Format one actor call argument for a human-readable step label. */
export const formatStepArgument = (name: string, argument: unknown, index: number): string => {
	if (callbackArgument(name, index)) {
		return '…'
	}
	if (typeof argument === 'string') {
		return JSON.stringify(argument)
	}
	if (typeof argument === 'function') {
		const { __label } = argument as { __label?: unknown }
		return typeof __label === 'string' ? __label : 'fn()'
	}
	return String(argument)
}

/** Build a codecept-style step label, e.g. `I.see(heading "Save")`. */
export const stepLabel = (name: string, args: unknown[]): string =>
	`I.${name}(${args.map((argument, index) => formatStepArgument(name, argument, index)).join(', ')})`

const isStackFrame = (line: string) => /^\s+at /.test(line)

/**
 * Build the "is this stack frame internal to kahraman?" predicate for a given
 * module URL (pass `import.meta.url`). A frame is internal when it lives in this
 * module's own directory (kahraman's own frames, whether installed or vendored)
 * or, as a secondary heuristic, anywhere under `node_modules` (framework
 * internals). Consumer story / page-actor frames live in their own source tree,
 * so they survive both filters and become the surfaced call site.
 */
export const createInternalFrameMatcher = (moduleUrl: string): ((line: string) => boolean) => {
	let moduleDir: string | undefined
	try {
		moduleDir = new URL('.', moduleUrl).href
	} catch {
		moduleDir = undefined
	}
	return (line: string) =>
		(moduleDir !== undefined && line.includes(moduleDir)) || line.includes('node_modules')
}

/**
 * Point `error.stack` at the story / page-actor line that invoked the actor
 * instead of DSL internals. `callSite` is captured synchronously at call time,
 * so its stack still holds the caller frames.
 */
export const createStackRetargeter =
	(moduleUrl: string) =>
	(error: Error, callSite: Error): void => {
		if (typeof error.stack !== 'string' || typeof callSite.stack !== 'string') {
			return
		}
		const isInternal = createInternalFrameMatcher(moduleUrl)
		const callFrames = callSite.stack
			.split('\n')
			.filter((line) => isStackFrame(line) && !isInternal(line))
		if (callFrames.length === 0) {
			return
		}
		const lines = error.stack.split('\n')
		const firstFrame = lines.findIndex(isStackFrame)
		if (firstFrame === -1) {
			return
		}
		error.stack = [...lines.slice(0, firstFrame), ...callFrames, ...lines.slice(firstFrame)].join(
			'\n',
		)
	}

/**
 * Append the actor step trace to a failed error's message (once), and retarget
 * its stack to the call site.
 */
export const createErrorAugmenter =
	(moduleUrl: string) =>
	(error: Error, steps: Step[], callSite: Error): void => {
		const augmentedError = error as AugmentedError
		if (augmentedError[actorStepsAppended]) {
			return
		}
		augmentedError[actorStepsAppended] = true
		createStackRetargeter(moduleUrl)(error, callSite)
		error.message += `\n\nActor steps (most recent last):\n${steps
			.slice(-15)
			.map(
				(step) =>
					`  ${'  '.repeat(Math.max(0, step.depth ?? 0))}${step.status === 'pass' ? '✔' : '✖'} ${step.label}`,
			)
			.join('\n')}`
	}
