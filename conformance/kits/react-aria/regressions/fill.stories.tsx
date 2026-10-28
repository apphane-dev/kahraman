import { createActor, role, text, type StoryContext } from 'kahraman'
import { useState } from 'react'
import { configure, expect, getConfig } from 'storybook/test'

import preview from '../.storybook/preview'

const meta = preview.meta({ title: 'Regressions/Literal fill' })

const actor = (context: StoryContext) => {
	const I = createActor()
	I.init(context)
	return I
}

const Fields = ({ preventEnter = false }: { preventEnter?: boolean }) => {
	const [enters, setEnters] = useState(0)
	return (
		<>
			<label>
				Literal input <input defaultValue="replace me" />
			</label>
			<label>
				Notes{' '}
				<textarea
					defaultValue="replace me"
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							setEnters((n) => n + 1)
							if (preventEnter) {
								event.preventDefault()
							}
						}
					}}
				/>
			</label>
			<p>Enter events {enters}</p>
			<button>After fields</button>
		</>
	)
}

const literal = '{"name":"Ada"} [Enter] {Tab} [[nested]] {{braces}}'

export const Literal = meta.story({ render: () => <Fields /> })
Literal.test('fill enters braces and brackets literally in an input', async (context) => {
	const I = actor(context)
	const field = role('textbox', 'Literal input')
	await I.fill(field, literal)
	await I.seeInField(field, literal)
	await I.clear(field)
	await I.seeInField(field, '')
})
Literal.test('fill enters braces and brackets literally in a textarea', async (context) => {
	const I = actor(context)
	const field = role('textbox', 'Notes')
	await I.fill(field, literal)
	await I.seeInField(field, literal)
	await I.clear(field)
	await I.seeInField(field, '')
})
Literal.test('textarea LF, CRLF and CR each produce one real Enter', async (context) => {
	const I = actor(context)
	const field = role('textbox', 'Notes')
	for (const value of ['first\nsecond', 'first\r\nsecond', 'first\rsecond']) {
		// oxlint-disable-next-line no-await-in-loop
		await I.fill(field, value)
		// oxlint-disable-next-line no-await-in-loop
		await I.seeInField(field, 'first\nsecond')
	}
	await I.see(text('Enter events 3'))
})

export const Prevented = meta.story({ render: () => <Fields preventEnter /> })
Prevented.test('fill cannot bypass a textarea handler that prevents Enter', async (context) => {
	const I = actor(context)
	const field = role('textbox', 'Notes')
	const timeout = getConfig().asyncUtilTimeout
	configure({ asyncUtilTimeout: 100 })
	try {
		await expect(I.fill(field, 'first\nsecond')).rejects.toThrow()
		await I.seeInField(field, 'firstsecond')
		await I.see(text('Enter events 1'))
	} finally {
		configure({ asyncUtilTimeout: timeout })
	}
})
