import { loadCsf, type CsfFile } from 'storybook/internal/csf-tools'

import { pageTest } from './catalog.ts'
import type { Kit } from './matrix.ts'

type TestBody = ReturnType<CsfFile['getStoryTests']>[number]['function']

type Callee = Extract<TestBody, { type: 'CallExpression' }>['callee']

const isIdentifier = (node: { type: string; name?: string }, name: string) =>
	node.type === 'Identifier' && node.name === name

const isRunPage = (callee: Callee) =>
	callee.type === 'MemberExpression' &&
	isIdentifier(callee.object, 'run') &&
	isIdentifier(callee.property, 'page')

type Argument = Extract<TestBody, { type: 'CallExpression' }>['arguments'][number]

// Do not evaluate fixture code to discover handlers. Uninspectable arguments
// are rejected by matrix validation when supplied to run.page(...).
const workaroundKeysOf = (argument: Argument | undefined): string[] | undefined => {
	if (argument?.type !== 'ObjectExpression') {
		return undefined
	}
	const keys: string[] = []
	for (const property of argument.properties) {
		if (
			(property.type !== 'ObjectProperty' && property.type !== 'ObjectMethod') ||
			property.computed
		) {
			return undefined
		}
		const key = property.key
		if (key.type === 'Identifier') {
			keys.push(key.name)
		} else if (key.type === 'StringLiteral') {
			keys.push(key.value)
		} else {
			return undefined
		}
	}
	return keys
}

/**
 * The literal ID in a `run('<id>')` or `run('<id>', workaround)` test body, or
 * `page` for a `run.page(...)` body.
 */
const runOf = (body: TestBody) => {
	if (body.type !== 'CallExpression') {
		return { scenario: undefined, workaround: false }
	}
	const [id, workaround] = body.arguments
	if (isRunPage(body.callee)) {
		return {
			scenario: pageTest,
			workaround: id !== undefined,
			workaroundKeys: workaroundKeysOf(id),
		}
	}
	return {
		scenario:
			isIdentifier(body.callee, 'run') && id?.type === 'StringLiteral' ? id.value : undefined,
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
