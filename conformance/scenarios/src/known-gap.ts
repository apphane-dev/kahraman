export interface Gap {
	ticket: string
	/** The prefix of the primary error diagnostic the scenario must fail with. */
	failsWith: string
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

/**
 * Runs a scenario expected to fail for a stated reason. Passes while `run`
 * throws an Error whose message starts with `failsWith`, ignoring leading
 * whitespace; fails on any other error, and once
 * `run` resolves, so a fixed gap cannot linger as a stale marker.
 */
export const knownGap = async ({ ticket, failsWith }: Gap, run: () => Promise<void>) => {
	// An empty prefix matches every message, so any error would count.
	if (failsWith.trim() === '') {
		throw new Error(`${ticket}: failsWith must not be empty`)
	}
	try {
		await run()
	} catch (error) {
		if (error instanceof Error && messageOf(error).trimStart().startsWith(failsWith)) {
			return
		}
		throw new Error(`${ticket}: expected a failure starting with '${failsWith}'`, { cause: error })
	}
	throw new Error(`known gap fixed, remove marker: ${ticket}`)
}
