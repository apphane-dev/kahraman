import { loadCsf, type CsfFile } from 'storybook/internal/csf-tools'

import type { Kit } from './matrix.ts'

type TestBody = ReturnType<CsfFile['getStoryTests']>[number]['function']

/** The literal ID in a `run('<id>')` test body. */
const scenarioOf = (body: TestBody) => {
	if (body.type !== 'CallExpression' || body.callee.type !== 'Identifier') {
		return undefined
	}
	const [id] = body.arguments
	return body.callee.name === 'run' && id?.type === 'StringLiteral' ? id.value : undefined
}

/** Story tests in a stories file, read statically the way Storybook indexes them. */
export const storyTestsOf = (code: string, fileName: string): Kit['storyTests'] => {
	const csf = loadCsf(code, { fileName, makeTitle: (title) => title ?? fileName }).parse()
	return csf.indexInputs.flatMap((input) =>
		input.type === 'story' && input.subtype === 'story' && input.exportName !== undefined
			? csf
					.getStoryTests(input.exportName)
					.map((test) => ({ name: test.name, scenario: scenarioOf(test.function) }))
			: [],
	)
}
