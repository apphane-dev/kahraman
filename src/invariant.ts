/**
 * Assert a condition, throwing an {@link Error} with `message` when it is falsy.
 *
 * A tiny local replacement for a framework `assert`/`invariant` so kahraman has
 * no runtime dependency on any state-management library.
 */
export function invariant(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message)
	}
}
