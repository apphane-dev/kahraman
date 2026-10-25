export interface Gap {
	ticket: string
	/** A substring of the error the scenario must fail with. */
	failsWith: string
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

/**
 * Runs a scenario expected to fail for a stated reason. Passes while `run`
 * throws an error containing `failsWith`; fails on any other error, and once
 * `run` resolves, so a fixed gap cannot linger as a stale marker.
 */
export const knownGap = async ({ ticket, failsWith }: Gap, run: () => Promise<void>) => {
	try {
		await run()
	} catch (error) {
		if (messageOf(error).includes(failsWith)) {
			return
		}
		throw new Error(`${ticket}: expected a failure containing '${failsWith}'`, { cause: error })
	}
	throw new Error(`known gap fixed, remove marker: ${ticket}`)
}
