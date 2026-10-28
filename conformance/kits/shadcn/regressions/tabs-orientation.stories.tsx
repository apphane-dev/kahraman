import { createActor, role } from 'kahraman'

import preview from '../.storybook/preview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../src/components/ui/tabs'

const meta = preview.meta({ title: 'Regressions/Tabs orientation' })

export const Vertical = meta.story({
	render: () => (
		<Tabs orientation="vertical" defaultValue="profile">
			<TabsList aria-label="Account">
				<TabsTrigger value="profile">Profile</TabsTrigger>
				<TabsTrigger value="billing">Billing</TabsTrigger>
			</TabsList>
			<TabsContent value="profile">Profile details</TabsContent>
			<TabsContent value="billing">Billing details</TabsContent>
		</Tabs>
	),
})
Vertical.test('vertical orientation reaches Radix and its keyboard navigation', async (context) => {
	const I = createActor()
	I.init(context)
	await I.seeAttribute(role('tablist', 'Account'), 'aria-orientation', 'vertical')
	await I.click(role('tab', 'Profile'))
	await I.press('{ArrowDown}')
	await I.seeAttribute(role('tab', 'Billing'), 'aria-selected', 'true')
	await I.see(role('tabpanel', 'Billing'))
})
