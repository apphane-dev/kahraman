export interface Marker {
	/** Names the marker in failure messages, e.g. `known gap 09`. */
	marker: string
	/** The prefix of the primary error diagnostic the scenario must fail with. */
	failsWith: string
}

export const messageOf = (error: unknown) =>
	error instanceof Error ? error.message : String(error)

/**
 * Runs a scenario expected to fail for a stated reason. Passes while `run`
 * throws an Error whose message starts with `failsWith`, ignoring leading
 * whitespace; fails on any other error, and once
 * `run` resolves, so a stale marker cannot linger.
 */
export const expectFailure = async ({ marker, failsWith }: Marker, run: () => Promise<void>) => {
	// An empty prefix matches every message, so any error would count.
	if (failsWith.trim() === '') {
		throw new Error(`${marker}: failsWith must not be empty`)
	}
	try {
		await run()
	} catch (error) {
		if (error instanceof Error && messageOf(error).trimStart().startsWith(failsWith)) {
			return
		}
		throw new Error(`${marker}: expected a failure starting with '${failsWith}'`, { cause: error })
	}
	throw new Error(`scenario passes, remove marker: ${marker}`)
}
