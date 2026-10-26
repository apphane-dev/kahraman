import { baseline, pageTest, scenarioIds, type ScenarioId } from './catalog.ts'
import type { KitManifest, KnownGap, ScenarioStatus } from './manifest.ts'

export interface Kit {
	/** Directory name under `conformance/kits/`, used in error messages. */
	dir: string
	manifest: KitManifest
	/**
	 * The kit's story tests, as Storybook indexes them: the stories file relative
	 * to the kit's `src/`, the scenario ID each passes to `run(...)` (`page` for
	 * `run.page(...)`, undefined for any other body), and whether it passes a
	 * workaround.
	 */
	storyTests: readonly {
		name: string
		file: string
		scenario: string | undefined
		workaround: boolean
		/** Static keys of a literal page workaround object; absent when not inspectable. */
		workaroundKeys?: readonly string[]
	}[]
}

const row = (cells: readonly string[]) => `| ${cells.join(' | ')} |`

const isBaseline = (id: ScenarioId) => (baseline as readonly ScenarioId[]).includes(id)

type Check = (kit: Kit, tickets: ReadonlyMap<string, string>) => string[]

const declares = (kit: Kit, id: string) => Object.hasOwn(kit.manifest.scenarios, id)

const scenarioTests = (kit: Kit) => kit.storyTests.filter((test) => test.name !== pageTest)

const isDiffers = (status: ScenarioStatus | undefined) =>
	typeof status === 'object' && 'differs' in status

const bodyOf = (scenario: string | undefined) =>
	scenario === undefined
		? 'another body'
		: scenario === pageTest
			? 'run.page(...)'
			: `run('${scenario}')`

const checks: readonly Check[] = [
	(kit) =>
		baseline
			.filter((id) => !declares(kit, id))
			.map((id) => `manifest omits baseline scenario ${id}`),
	(kit) =>
		Object.keys(kit.manifest.scenarios)
			.filter((id) => !kit.storyTests.some((test) => test.name === id))
			.map((id) => `manifest declares ${id} but no story test has that name`),
	(kit) =>
		scenarioTests(kit)
			.filter((test) => !declares(kit, test.name))
			.map((test) => `story test ${test.name} is not a scenario the manifest declares`),
	(kit) =>
		scenarioTests(kit)
			.filter((test) => test.scenario !== test.name)
			.map(
				(test) =>
					`story test ${test.name} must run run('${test.name}'), found ${bodyOf(test.scenario)}`,
			),
	(kit) => {
		const page = kit.storyTests.find((test) => test.name === pageTest)
		if (page === undefined) {
			return [`no story test named ${pageTest} runs every scenario on one page`]
		}
		if (page.scenario !== pageTest) {
			return [`story test ${pageTest} must run run.page(...), found ${bodyOf(page.scenario)}`]
		}
		const required = scenarioIds.filter((id) => isDiffers(kit.manifest.scenarios[id]))
		if (!page.workaround) {
			return required.length > 0
				? [`story test ${pageTest} must pass the workarounds for different patterns`]
				: []
		}
		const keys = page.workaroundKeys
		if (keys === undefined) {
			return [`story test ${pageTest} must pass a literal workaround object with static keys`]
		}
		return [
			...required
				.filter((id) => !keys.includes(id))
				.map((id) => `story test ${pageTest} is missing the workaround for ${id}`),
			...keys
				.filter((id) => !required.some((requiredId) => requiredId === id))
				.map((id) => `story test ${pageTest} passes an unexpected workaround for ${id}`),
		]
	},
	(kit) =>
		scenarioTests(kit).flatMap((test) => {
			const differs = isDiffers(kit.manifest.scenarios[test.name as ScenarioId])
			if (differs === test.workaround) {
				return []
			}
			return [
				differs
					? `story test ${test.name} must pass a workaround for its different pattern`
					: `story test ${test.name} passes a workaround, but the manifest does not say differs`,
			]
		}),
	(kit, tickets) =>
		[...Object.entries(kit.manifest.scenarios), [pageTest, kit.manifest.page] as const].flatMap(
			([id, status]) =>
				typeof status === 'object' && 'knownGap' in status && !tickets.has(status.knownGap)
					? [`${id} known gap points at missing ticket ${status.knownGap}`]
					: [],
		),
]

const validate = (kit: Kit, tickets: ReadonlyMap<string, string>) => {
	const [problem] = checks.flatMap((check) => check(kit, tickets))
	if (problem !== undefined) {
		throw new Error(`${kit.dir}: ${problem}`)
	}
}

/** A matrix cell. Paths are repo-relative. */
export type Cell =
	| { status: 'pass' }
	| { status: 'n/a' }
	| { status: 'known gap'; ticket: string; path: string; failsWith: string }
	| { status: 'differs'; pattern: string; path: string; failsWith: string }

export interface Matrix {
	kits: { dir: string; name: string; pass: number; differs: number; knownGaps: number }[]
	/** One row per catalog scenario; `cells` follow `kits`. */
	scenarios: { id: ScenarioId; baseline: boolean; cells: Cell[] }[]
	/** The `page` integration journey per kit. */
	page: Cell[]
}

// validate() rejects a missing ticket first; this guards direct use.
const ticketPath = (ticket: string, tickets: ReadonlyMap<string, string>) => {
	const path = tickets.get(ticket)
	if (path === undefined) {
		throw new Error(`missing ticket ${ticket}`)
	}
	return path
}

const gapCell = (gap: KnownGap, tickets: ReadonlyMap<string, string>): Cell => ({
	status: 'known gap',
	ticket: gap.knownGap,
	path: ticketPath(gap.knownGap, tickets),
	failsWith: gap.failsWith,
})

const cell = (kit: Kit, id: ScenarioId, tickets: ReadonlyMap<string, string>): Cell => {
	const status: ScenarioStatus | undefined = kit.manifest.scenarios[id]
	if (status === undefined) {
		return { status: 'n/a' }
	}
	if (status === 'pass') {
		return { status: 'pass' }
	}
	if ('knownGap' in status) {
		return gapCell(status, tickets)
	}
	// Points at the story test that holds the workaround.
	const file = kit.storyTests.find((test) => test.name === id)?.file
	return {
		status: 'differs',
		pattern: status.differs,
		path: `conformance/kits/${kit.dir}/src/${file}`,
		failsWith: status.failsWith,
	}
}

const kindOf = (status: ScenarioStatus) =>
	status === 'pass' ? 'pass' : 'knownGap' in status ? 'known gap' : 'differs'

// A known-gap story test is green while the gap stays, so count support apart
// from gaps instead of reading green tests as support.
const totals = (kit: Kit) => {
	const kinds = Object.values(kit.manifest.scenarios).map(kindOf)
	const count = (kind: ReturnType<typeof kindOf>) => kinds.filter((k) => k === kind).length
	return { pass: count('pass'), differs: count('differs'), knownGaps: count('known gap') }
}

/**
 * Scenarios against kits, as data. `tickets` maps a ticket number to its
 * repo-relative path. Throws on an inconsistent kit.
 */
export const matrixOf = (kits: readonly Kit[], tickets: ReadonlyMap<string, string>): Matrix => {
	for (const kit of kits) {
		validate(kit, tickets)
	}
	return {
		kits: kits.map((kit) => ({ dir: kit.dir, name: kit.manifest.kit, ...totals(kit) })),
		scenarios: scenarioIds.map((id) => ({
			id,
			baseline: isBaseline(id),
			cells: kits.map((kit) => cell(kit, id, tickets)),
		})),
		page: kits.map((kit) =>
			kit.manifest.page === undefined ? { status: 'pass' } : gapCell(kit.manifest.page, tickets),
		),
	}
}

// MATRIX.md lives in conformance/.
const linkPath = (path: string) =>
	path.startsWith('conformance/') ? path.slice('conformance/'.length) : `../${path}`

const markdownCell = (value: Cell) => {
	switch (value.status) {
		case 'pass':
		case 'n/a':
			return value.status
		case 'known gap':
			return `[known gap ${value.ticket}](${linkPath(value.path)})`
		case 'differs':
			return `[differs: ${value.pattern}](${linkPath(value.path)})`
	}
}

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`

const markdownTotals = ({ pass, differs, knownGaps }: Matrix['kits'][number]) =>
	[
		`${pass} pass`,
		...(differs > 0 ? [`${differs} differs`] : []),
		...(knownGaps > 0 ? [plural(knownGaps, 'known gap')] : []),
	].join(', ')

/** Renders `conformance/MATRIX.md`. */
export const renderMatrix = (matrix: Matrix) =>
	[
		'# Conformance matrix',
		'',
		'Generated by `pnpm conformance:matrix` from kit manifests. Do not edit.',
		'',
		row(['Scenario', ...matrix.kits.map((kit) => kit.name)]),
		row(['---', ...matrix.kits.map(() => '---')]),
		...matrix.scenarios.map((scenario) =>
			row([
				`\`${scenario.id}\`${scenario.baseline ? ' (baseline)' : ''}`,
				...scenario.cells.map(markdownCell),
			]),
		),
		row([`\`${pageTest}\` (every scenario on one page)`, ...matrix.page.map(markdownCell)]),
		row(['**Total**', ...matrix.kits.map(markdownTotals)]),
		'',
		"A known gap's story test passes while the scenario still fails as recorded. A differs story test passes through the workaround for the kit's pattern.",
		'',
		`The \`${pageTest}\` row runs every declared scenario in order on one page, as an integration journey, in the kit's \`${pageTest}\` story test. A known gap there stops at its recorded failure and the journey continues without that action's effect. Totals count scenarios.`,
		'',
	].join('\n')
