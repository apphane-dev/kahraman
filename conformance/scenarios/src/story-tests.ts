import { loadCsf, type CsfFile } from 'storybook/internal/csf-tools'

import type { Kit } from './matrix.ts'

type TestBody = ReturnType<CsfFile['getStoryTests']>[number]['function']

/** The literal ID in a `run('<id>')` or `run('<id>', workaround)` test body. */
const runOf = (body: TestBody) => {
	if (body.type !== 'CallExpression' || body.callee.type !== 'Identifier') {
		return { scenario: undefined, workaround: false }
	}
	const [id, workaround] = body.arguments
	return {
		scenario: body.callee.name === 'run' && id?.type === 'StringLiteral' ? id.value : undefined,
		workaround: workaround !== undefined,
	}
}

/** Story tests in a stories file, read statically the way Storybook indexes them. */
export const storyTestsOf = (code: string, fileName: string): Kit['storyTests'] => {
	const csf = loadCsf(code, { fileName, makeTitle: (title) => title ?? fileName }).parse()
	return csf.indexInputs.flatMap((input) =>
		input.type === 'story' && input.subtype === 'story' && input.exportName !== undefined
			? csf.getStoryTests(input.exportName).map((test) => ({
					name: test.name,
					file: fileName,
					...runOf(test.function),
				}))
			: [],
	)
}
