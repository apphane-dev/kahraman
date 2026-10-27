import { invariant, text, type BaseActor, type DefiniteLocator } from '../src/index'

/**
 * Opt-in Vuetify kit extension: `createActor().extend(vuetify)`.
 *
 * `VMenu` with a `VList` gives its trigger `aria-haspopup="menu"` but renders
 * its entries as list items, never `menuitem`, so `role('menuitem', name)`
 * finds nothing. Assistive technology meets the same mismatch, so prefer menu
 * roles where you control the markup; use this to drive the menu as Vuetify
 * renders it.
 */
export const vuetify = (I: BaseActor) => ({
	/** Opens the menu `trigger` controls and clicks the entry with the text `name`. */
	async chooseMenuItem(trigger: DefiniteLocator, name: string | RegExp) {
		const activator = await I.see(trigger)
		await I.click(trigger)
		const menuId = activator.getAttribute('aria-controls')
		const menu = menuId ? activator.ownerDocument.getElementById(menuId) : null
		invariant(menu, 'Expected the menu trigger to name its menu with aria-controls')
		await I.click(text(name).within(menu))
	},
})
