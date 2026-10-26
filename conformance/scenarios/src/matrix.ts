import { baseline, pageTest, scenarioIds, type ScenarioId } from './catalog.ts'
import type { KitManifest, ScenarioStatus } from './manifest.ts'

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
		const differs = Object.values(kit.manifest.scenarios).some(isDiffers)
		return differs && !page.workaround
			? [`story test ${pageTest} must pass the workarounds for different patterns`]
			: []
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
		Object.entries(kit.manifest.scenarios).flatMap(([id, status]) =>
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

const cell = (kit: Kit, id: ScenarioId, tickets: ReadonlyMap<string, string>) => {
	const status: ScenarioStatus | undefined = kit.manifest.scenarios[id]
	if (status === undefined) {
		return 'n/a'
	}
	if (status === 'pass') {
		return 'pass'
	}
	if ('knownGap' in status) {
		return `[known gap ${status.knownGap}](../${tickets.get(status.knownGap)})`
	}
	// Links the story test that holds the workaround.
	const file = kit.storyTests.find((test) => test.name === id)?.file
	return `[differs: ${status.differs}](kits/${kit.dir}/src/${file})`
}

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`

const kindOf = (status: ScenarioStatus) =>
	status === 'pass' ? 'pass' : 'knownGap' in status ? 'known gap' : 'differs'

// A known-gap story test is green while the gap stays, so count support apart
// from gaps instead of reading green tests as support.
const totals = (kit: Kit) => {
	const kinds = Object.values(kit.manifest.scenarios).map(kindOf)
	const count = (kind: ReturnType<typeof kindOf>) => kinds.filter((k) => k === kind).length
	return [
		`${count('pass')} pass`,
		...(count('differs') > 0 ? [`${count('differs')} differs`] : []),
		...(count('known gap') > 0 ? [plural(count('known gap'), 'known gap')] : []),
	].join(', ')
}

/**
 * Renders `conformance/MATRIX.md`: scenarios against kits. `tickets` maps a
 * ticket number to its repo-relative path. Throws on an inconsistent kit.
 */
export const renderMatrix = (kits: readonly Kit[], tickets: ReadonlyMap<string, string>) => {
	for (const kit of kits) {
		validate(kit, tickets)
	}
	return [
		'# Conformance matrix',
		'',
		'Generated by `pnpm conformance:matrix` from kit manifests. Do not edit.',
		'',
		row(['Scenario', ...kits.map((kit) => kit.manifest.kit)]),
		row(['---', ...kits.map(() => '---')]),
		...scenarioIds.map((id) =>
			row([
				`\`${id}\`${isBaseline(id) ? ' (baseline)' : ''}`,
				...kits.map((kit) => cell(kit, id, tickets)),
			]),
		),
		row(['**Total**', ...kits.map(totals)]),
		'',
		"A known gap's story test passes while the scenario still fails as recorded. A differs story test passes through the workaround for the kit's pattern.",
		'',
		`Each kit's \`${pageTest}\` story test runs every scenario in order on one page, as an integration journey. A known gap there stops at its recorded failure and the journey continues without that action's effect.`,
		'',
	].join('\n')
}
