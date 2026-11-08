// Confirms the native-select gap is in the actor interaction, not the fixture.
import { createActor, role } from 'kahraman'
import { contract } from 'kahraman-conformance-scenarios'

import preview from '../.storybook/preview'
import { NativeSelectFixture } from '../src/fixtures'

const meta = preview.meta({ title: 'Regressions/Native select' })

export const NativeSelection = meta.story({ render: () => <NativeSelectFixture /> })

NativeSelection.test('native selection changes the MUI field value', async (context) => {
	const I = createActor()
	I.init(context)
	const c = contract['native-select']
	const field = role('combobox', c.label)
	await I.seeInField(field, c.options[0])
	await context.userEvent.selectOptions(await I.see(field), c.choice)
	await I.seeInField(field, c.choice)
})
