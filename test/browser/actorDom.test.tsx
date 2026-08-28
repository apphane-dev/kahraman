// Actor integration suite against a plain-DOM React page — no UI kit. Covers
// the core out-of-the-box methods end-to-end in a real browser: locators,
// see/dontSee, fields, fill, scopes, soft assertions, grab* helpers.
// First paint is awaited with `.wait()` locators because React renders
// concurrently — after that the DOM is stable and sync queries are exact.
import { expect, test } from 'vitest'

import { useState } from 'react'

import { button, createActor, heading, link, role, text } from '../../src'

import { renderPage } from './page'

const Catalogue = (): React.ReactElement => {
	const [query, setQuery] = useState('')
	const items = ['Anchor', 'Buoy', 'Chart'].filter((item) =>
		query === '' ? true : item.toLowerCase().includes(query.toLowerCase()),
	)
	return (
		<div>
			<h1>Catalogue</h1>
			<main role="main">
				<h2>Items</h2>
				<label>
					Search
					<input value={query} onChange={(event) => setQuery(event.target.value)} />
				</label>
				<ul aria-label="Results">
					{items.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
				{query !== '' && items.length === 0 ? <p role="alert">No matches for {query}</p> : null}
				<a href="#details">Details</a>
				<button type="button" onClick={() => setQuery('')}>
					Reset
				</button>
			</main>
		</div>
	)
}

test('locators resolve by role, name, and text', async () => {
	const I = createActor()
	I.init(renderPage(<Catalogue />))
	await I.see(heading('Catalogue').wait())
	await I.see(role('main'))
	await I.see(link('Details'))
	await I.see(button('Reset'))
	await I.see(text('Buoy'))
	await I.dontSee(text('Deleted'))
})

test('fill filters the list and the empty state appears', async () => {
	const I = createActor()
	I.init(renderPage(<Catalogue />))
	await I.see(heading('Items').wait())
	await I.seeNumberOfElements(role('listitem').all(), 3)
	await I.fill(role('textbox', 'Search'), 'zzz')
	await I.see(role('alert'))
	await I.seeNumberOfElements(role('listitem').all(), 0)
	await I.click(button('Reset'))
	await I.seeNumberOfElements(role('listitem').all(), 3)
})

test('field assertions and grab helpers read live DOM state', async () => {
	const I = createActor()
	I.init(renderPage(<Catalogue />))
	await I.see(heading('Items').wait())
	await I.fill(role('textbox', 'Search'), 'an')
	await I.seeInField(role('textbox', 'Search'), 'an')
	await I.dontSeeInField(role('textbox', 'Search'), 'buoy')
	const results = await I.grabTextFromAll(role('listitem').all())
	expect(results).toEqual(['Anchor', 'Chart'])
})

test('scope narrows queries and restores on exit', async () => {
	const I = createActor()
	I.init(renderPage(<Catalogue />))
	await I.see(heading('Items').wait())
	await I.scope(role('main'), async () => {
		await I.see(heading('Items'))
	})
	await I.see(heading('Catalogue'))
})

test('hopeThat collects soft failures and noErrors throws them', async () => {
	const I = createActor()
	I.init(renderPage(<Catalogue />))
	await I.see(heading('Items').wait())
	expect(await I.hopeThat(() => I.see(text('Buoy')))).toBe(true)
	expect(await I.hopeThat(() => I.see(text('Deleted')))).toBe(false)
	await expect(I.hopeThat.noErrors()).rejects.toThrow(/soft assertion/)
})
