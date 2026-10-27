// The opt-in Vuetify extension drives VMenu as rendered; without it, the menu
// entries are not menu items and the conformance `menu` scenario stays a known
// gap (backlog ticket 16).
import { button, createActor, role, text } from 'kahraman'
import { contract } from 'kahraman-conformance-scenarios'
import { expect, waitFor } from 'storybook/test'

import { vuetify } from '../../../../kits/vuetify'
import preview from '../.storybook/preview'
import { MenuFixture } from '../src/fixtures'

const meta = preview.meta({ title: 'Regressions/Menu extension' })

const c = contract.menu

export const Menu = meta.story({ render: () => MenuFixture })

Menu.test('chooseMenuItem picks a VMenu entry', async (context) => {
	const I = createActor().extend(vuetify)
	I.init(context)
	await I.dontSee(text(c.outcome))
	await I.chooseMenuItem(button(c.trigger), c.choice)
	await I.see(text(c.outcome))
})

Menu.test('without the extension the entry is not a menu item', async (context) => {
	const I = createActor({ actionTimeout: 500 })
	I.init(context)
	const trigger = await I.see(button(c.trigger))
	await I.click(button(c.trigger))
	// The menu is open and the entry on screen, so only its role is missing.
	const menu = document.getElementById(trigger.getAttribute('aria-controls') ?? '')
	const entry = await I.see(text(c.choice).wait().within(menu!))
	await waitFor(() => expect(entry).toBeVisible())
	await expect(I.click(role('menuitem', c.choice))).rejects.toThrow(
		`Unable to find an accessible element with the role "menuitem" and name "${c.choice}"`,
	)
	await I.dontSee(text(c.outcome))
})
