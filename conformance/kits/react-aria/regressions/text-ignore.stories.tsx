// Actor-local text-query policy, exercised through real Testing Library queries.
import { button, createActor, role, text, type ActorOptions, type StoryContext } from 'kahraman'
import { expect, within } from 'storybook/test'

import preview from '../.storybook/preview'

const meta = preview.meta({ title: 'Regressions/Text ignore' })
const customIgnore = 'script, style, .custom-chrome, .custom-chrome *'

const actor = (context: StoryContext, options: ActorOptions = {}) => {
	const I = createActor(options)
	I.init(context)
	return I
}

export const TextIgnore = meta.story({
	render: () => (
		<div role="group" aria-label="Text defaults">
			<div className="sb-wrapper">
				User wrapper root
				<p>User wrapper child</p>
				<p>Shared text</p>
			</div>
			<div className="custom-chrome">
				Custom chrome root
				<p>Custom chrome child</p>
				<p>Shared text</p>
			</div>
			<button type="button" className="custom-chrome">
				Role match
			</button>
			<script type="application/json">{'Fixture script content'}</script>
		</div>
	),
})

TextIgnore.test(
	'the default excludes user sb-wrapper elements and descendants too',
	async (ctx) => {
		const I = actor(ctx)
		await I.dontSee(text('User wrapper root'))
		await I.dontSee(text('User wrapper child'))
		await I.dontSee(text('Fixture script content'))
		await I.see(text('Custom chrome child'))
	},
)

TextIgnore.test('a factory selector replaces the default in every text query mode', async (ctx) => {
	const I = actor(ctx, { textIgnore: customIgnore })
	await I.dontSee(text('Custom chrome root'))
	await I.dontSee(text('Custom chrome child'))
	await I.seeNumberOfElements(text('Custom chrome child').all(), 0)
	// Each mode must exclude the duplicate in .custom-chrome, but include the
	// user .sb-wrapper that the default would exclude.
	await I.see(text('Shared text'))
	await I.see(text('shared text').options({ exact: false }))
	await I.see(text('Shared text').maybe())
	await I.see(text('Shared text').wait())
	await I.seeNumberOfElements(text('Shared text').all(), 1)
	await I.seeNumberOfElements(text('Shared text').all().wait(), 1)
	await I.seeNumberOfElements(text('Shared text').wait().all(), 1)
	await I.see(button('Role match'))
})

TextIgnore.test('false and an empty selector disable text filtering', async (ctx) => {
	const check = async (textIgnore: ActorOptions['textIgnore']) => {
		const I = actor(ctx, { textIgnore })
		await I.see(text('User wrapper child'))
		await I.see(text('Custom chrome child'))
		await I.see(text('Fixture script content'))
		await I.seeNumberOfElements(text('Shared text').all(), 2)
	}
	await check(false)
	await check('')
})

TextIgnore.test(
	'query ignore wins over the factory without changing later queries',
	async (ctx) => {
		const I = actor(ctx, { textIgnore: customIgnore })
		await I.see(text('Custom chrome child').options({ ignore: false }))
		await I.see(text('Custom chrome child').options({ ignore: 'script, style' }))
		await I.dontSee(text('User wrapper child').options({ ignore: '.sb-wrapper *' }))
		await I.seeNumberOfElements(text('Shared text').all().wait().options({ ignore: false }), 2)
		await I.dontSee(text('Custom chrome child'))
		await I.see(text('User wrapper child'))
	},
)

TextIgnore.test('one locator can be shared by actors with different defaults', async (ctx) => {
	const defaults = actor(ctx)
	const custom = actor(ctx, { textIgnore: customIgnore })
	const shared = text('Shared text')
	const defaultElement = await defaults.see(shared)
	const customElement = await custom.see(shared)
	await expect(defaultElement.closest('.custom-chrome')).not.toBeNull()
	await expect(customElement.closest('.sb-wrapper')).not.toBeNull()
	await expect(await defaults.see(shared)).toBe(defaultElement)
	custom.init(ctx)
	await expect(await custom.see(shared)).toBe(customElement)
})

TextIgnore.test('factory defaults survive actor and locator scoping and extension', async (ctx) => {
	const I = actor(ctx, { textIgnore: customIgnore }).extend((base) => ({
		seeUserContent: () => base.see(text('Shared text')),
	}))
	await I.within(role('group', 'Text defaults'), async () => {
		await I.seeUserContent()
		await I.dontSee(text('Custom chrome child'))
	})
	await I.see(text('Shared text').within(role('group', 'Text defaults')))
	await I.dontSee(text('Custom chrome child').within(ctx.canvasElement))
})

TextIgnore.test('custom locator callbacks receive the same text defaults', async (ctx) => {
	const I = actor(ctx, { textIgnore: customIgnore })
	await I.see((canvas) => canvas.getByText('Shared text'))
	await I.see((canvas) => canvas.queryByText('Shared text'))
	await I.see((canvas) => canvas.findByText('Shared text'))
	await I.seeNumberOfElements((canvas) => canvas.getAllByText('Shared text'), 1)
	await I.seeNumberOfElements((canvas) => canvas.queryAllByText('Shared text'), 1)
	await I.seeNumberOfElements((canvas) => canvas.findAllByText('Shared text'), 1)
})

TextIgnore.test('direct locator calls keep the supplied canvas defaults', async (ctx) => {
	const I = actor(ctx, { textIgnore: customIgnore })
	await I.see(text('Shared text'))
	const canvas = within(ctx.canvasElement)
	await expect(text('User wrapper child')(canvas)).toBeInTheDocument()
	await expect(text('Custom chrome child')(canvas)).toBeInTheDocument()
	await expect(text('Fixture script content').maybe()(canvas)).toBeNull()
	await expect(() => text('Shared text')(canvas)).toThrow('Found multiple elements')
})
