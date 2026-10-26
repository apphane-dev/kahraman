// selectOption on a native <select>, whose options the browser draws outside the page.
import { createActor, role } from 'kahraman'
import { contract } from 'kahraman-conformance-scenarios'
import { expect } from 'storybook/test'

import preview from '../.storybook/preview'
import { NativeSelectFixture } from '../src/fixtures'

const meta = preview.meta({ title: 'Regressions/Native select' })

export const NativeSelection = meta.story({
	render: () => (
		<section aria-label="Order">
			<NativeSelectFixture />
		</section>
	),
})

NativeSelection.test(
	'selectOption changes a preselected option inside a scope',
	async (context) => {
		const I = createActor()
		I.init(context)
		const c = contract['native-select']
		const field = role('combobox', c.label)
		await I.within(role('region', 'Order'), async () => {
			await I.seeInField(field, c.options[0])
			const changes: string[] = []
			const select = await I.see(field)
			select.addEventListener('change', () => changes.push((select as HTMLSelectElement).value))
			await I.selectOption(field, c.choice)
			await I.seeInField(field, c.choice)
			expect(changes).toEqual([c.choice])
		})
	},
)
