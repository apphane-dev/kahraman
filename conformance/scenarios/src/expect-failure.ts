export interface Marker {
	/** Names the marker in failure messages, e.g. `known gap 09`. */
	marker: string
	/** A substring of the error the scenario must fail with. */
	failsWith: string
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

/**
 * Runs a scenario expected to fail for a stated reason. Passes while `run`
 * throws an error containing `failsWith`; fails on any other error, and once
 * `run` resolves, so a stale marker cannot linger.
 */
export const expectFailure = async ({ marker, failsWith }: Marker, run: () => Promise<void>) => {
	try {
		await run()
	} catch (error) {
		if (messageOf(error).includes(failsWith)) {
			return
		}
		throw new Error(`${marker}: expected a failure containing '${failsWith}'`, { cause: error })
	}
	throw new Error(`scenario passes, remove marker: ${marker}`)
}
