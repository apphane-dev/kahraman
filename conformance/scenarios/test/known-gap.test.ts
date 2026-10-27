import { describe, expect, it } from 'vitest'

import { knownGap } from '../src/known-gap.ts'

const gap = { ticket: 'ticket 09', failsWith: 'role "dialog"' }

describe('knownGap', () => {
	it('passes while the scenario fails for the stated reason', async () => {
		await expect(
			knownGap(gap, async () => {
				throw new Error('Unable to find an accessible element with the role "dialog"')
			}),
		).resolves.toBeUndefined()
	})

	it('fails when the scenario fails for another reason', async () => {
		await expect(
			knownGap(gap, async () => {
				throw new Error('Unable to find an accessible element with the role "button"')
			}),
		).rejects.toThrow('ticket 09: expected a failure containing \'role "dialog"\'')
	})

	it('rejects an empty failsWith, which would accept any error', async () => {
		let ran = false
		await expect(
			knownGap({ ticket: 'ticket 09', failsWith: ' ' }, async () => {
				ran = true
				throw new Error('anything')
			}),
		).rejects.toThrow('ticket 09: failsWith must not be empty')
		expect(ran).toBe(false)
	})

	it('fails with a removal hint once the scenario passes', async () => {
		await expect(knownGap(gap, async () => {})).rejects.toThrow(
			'known gap fixed, remove marker: ticket 09',
		)
	})
})
