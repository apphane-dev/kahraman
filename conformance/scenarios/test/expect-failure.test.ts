import { describe, expect, it } from 'vitest'

import { expectFailure } from '../src/expect-failure.ts'

const gap = { marker: 'known gap 09', failsWith: 'role "dialog"' }

describe('expectFailure', () => {
	it('passes while the scenario fails for the stated reason', async () => {
		await expect(
			expectFailure(gap, async () => {
				throw new Error('Unable to find an accessible element with the role "dialog"')
			}),
		).resolves.toBeUndefined()
	})

	it('fails when the scenario fails for another reason', async () => {
		await expect(
			expectFailure(gap, async () => {
				throw new Error('Unable to find an accessible element with the role "button"')
			}),
		).rejects.toThrow('known gap 09: expected a failure containing \'role "dialog"\'')
	})

	it('fails with a removal hint once the scenario passes', async () => {
		await expect(expectFailure(gap, async () => {})).rejects.toThrow(
			'scenario passes, remove marker: known gap 09',
		)
	})
})
