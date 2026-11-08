import { describe, expect, it } from 'vitest'

import { expectFailure } from '../src/expect-failure.ts'

const gap = {
	marker: 'known gap 09',
	failsWith: 'Unable to find an accessible element with the role "dialog"',
}

describe('expectFailure', () => {
	it('passes while the scenario fails for the stated reason', async () => {
		await expect(
			expectFailure(gap, async () => {
				throw new Error('Unable to find an accessible element with the role "dialog"')
			}),
		).resolves.toBeUndefined()
	})

	it('allows leading whitespace and context after the primary diagnostic', async () => {
		await expect(
			expectFailure(gap, async () => {
				throw new Error(`\n  ${gap.failsWith}\n\nActor steps: I.see(dialog)`)
			}),
		).resolves.toBeUndefined()
	})

	it('fails when the scenario fails for another reason', async () => {
		await expect(
			expectFailure(gap, async () => {
				throw new Error('Unable to find an accessible element with the role "button"')
			}),
		).rejects.toThrow('known gap 09: expected a failure starting with')
	})

	it('rejects an unrelated error that only quotes the expected diagnostic', async () => {
		await expect(
			expectFailure(gap, async () => {
				throw new Error(`Fixture failed while quoting: ${gap.failsWith}`)
			}),
		).rejects.toThrow('known gap 09: expected a failure starting with')
	})

	it('rejects the diagnostic when it appears only in appended context', async () => {
		await expect(
			expectFailure(gap, async () => {
				throw new Error(`Fixture failed\n\nPrevious error: ${gap.failsWith}`)
			}),
		).rejects.toThrow('known gap 09: expected a failure starting with')
	})

	it('rejects a thrown string even when it matches the diagnostic', async () => {
		await expect(
			expectFailure(gap, async () => {
				throw 'Unable to find an accessible element with the role "dialog"'
			}),
		).rejects.toThrow('known gap 09: expected a failure starting with')
	})

	it('rejects an empty failsWith, which would accept any error', async () => {
		let ran = false
		await expect(
			expectFailure({ marker: 'known gap 09', failsWith: ' ' }, async () => {
				ran = true
				throw new Error('anything')
			}),
		).rejects.toThrow('known gap 09: failsWith must not be empty')
		expect(ran).toBe(false)
	})

	it('fails with a removal hint once the scenario passes', async () => {
		await expect(expectFailure(gap, async () => {})).rejects.toThrow(
			'scenario passes, remove marker: known gap 09',
		)
	})
})
