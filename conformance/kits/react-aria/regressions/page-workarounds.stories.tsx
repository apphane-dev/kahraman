import type { BaseActor } from 'kahraman'
import { runnerFor } from 'kahraman-conformance-scenarios'
import { expect } from 'storybook/test'

import preview from '../.storybook/preview'
import { PageFixture } from '../src/fixtures'
import { manifest } from '../src/manifest'

const meta = preview.meta({ title: 'Regressions/Page workarounds' })
const run = runnerFor(manifest)

// A string-indexed record can satisfy the keyed type while holding no handler.
const missing: Record<string, (I: BaseActor) => Promise<void>> = {}

export const Missing = meta.story({ render: () => <PageFixture /> })
Missing.test('a page cannot pass without the required differs workaround', async (context) => {
	await expect(run.page(missing)(context)).rejects.toThrow(
		'combobox requires a workaround for its different pattern',
	)
})

Missing.test('a demo also requires the equivalent differs outcome', async (context) => {
	await expect(run.demo(missing)(context)).rejects.toThrow(
		'combobox requires a workaround for its different pattern',
	)
})
