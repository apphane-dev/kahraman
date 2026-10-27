// Runs each kit's built `page` test from conformance-demo.tar.gz the way the
// website shows it: unpacked under /conformance/ and embedded in an iframe.
// Run `pnpm conformance:demo` first.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { once } from 'node:events'
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { extname, join, resolve, sep } from 'node:path'
import { chromium, type Browser, type FrameLocator } from 'playwright'

import { contract } from '../src/contract.ts'
import type { Matrix } from '../src/matrix.ts'
import { root } from './kits.ts'

type IndexEntry = { id: string; name: string; subtype?: string }
type Finished = { storyId: string; status: 'success' | 'error' }

const readJson = (file: string): unknown => JSON.parse(readFileSync(file, 'utf8'))

const bundle = mkdtempSync(join(tmpdir(), 'kahraman-demo-'))
execFileSync('tar', ['-xzf', join(root, 'conformance-demo.tar.gz'), '-C', bundle])
const matrix = readJson(join(bundle, 'matrix.json')) as Matrix
assert.deepEqual(
	matrix,
	readJson(join(root, 'conformance/matrix.json')),
	'The bundle packs a stale matrix.json',
)

// Collects Storybook's storyFinished events, which the preview posts to the
// page embedding it.
const hostPage = (src: string) => `<!doctype html>
<script>
window.finished = []
addEventListener('message', ({ data }) => {
	try {
		const message = typeof data === 'string' ? JSON.parse(data) : data
		if (message?.key === 'storybook-channel' && message.event?.type === 'storyFinished') {
			window.finished.push(message.event.args[0])
		}
	} catch {}
})
</script>
<iframe id="run" src="${src}" style="width: 1200px; height: 900px; border: 0"></iframe>`

const contentTypes: Record<string, string> = {
	'.css': 'text/css',
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.woff2': 'font/woff2',
}

// Only files inside the unpacked bundle, under the site's /conformance/ path.
const bundleFile = (pathname: string) => {
	const file = resolve(bundle, `.${decodeURIComponent(pathname.slice('/conformance'.length))}`)
	const inBundle = pathname.startsWith('/conformance/') && file.startsWith(bundle + sep)
	return inBundle && statSync(file, { throwIfNoEntry: false })?.isFile() ? file : null
}

const sendFile = (pathname: string, response: ServerResponse) => {
	const file = bundleFile(pathname)
	if (!file) {
		response.writeHead(404).end()
		return
	}
	const type = contentTypes[extname(file)] ?? 'application/octet-stream'
	response.writeHead(200, { 'content-type': type }).end(readFileSync(file))
}

const serve = (request: IncomingMessage, response: ServerResponse) => {
	const url = new URL(request.url ?? '/', 'http://localhost')
	const src = url.searchParams.get('src')
	if (src) {
		response.writeHead(200, { 'content-type': 'text/html' }).end(hostPage(src))
		return
	}
	sendFile(url.pathname, response)
}

const pageTest = (dir: string) => {
	const index = readJson(join(bundle, 'kits', dir, 'index.json')) as {
		entries: Record<string, IndexEntry>
	}
	const tests = Object.values(index.entries).filter(
		(entry) => entry.subtype === 'test' && entry.name === 'page',
	)
	assert.equal(tests.length, 1, `${dir}: expected one built page test`)
	return tests[0]!.id
}

// The journey's last steps leave Saved shown, Billing selected, the toast
// gone, and no dialog on screen.
const checkEndState = async (frame: FrameLocator, kit: number) => {
	const passes = (id: string) =>
		['pass', 'differs'].includes(matrix.scenarios.find((row) => row.id === id)!.cells[kit]!.status)
	if (passes('button')) {
		assert.ok(await frame.getByText(contract.button.outcome, { exact: true }).isVisible())
	}
	if (passes('tabs')) {
		const tab = frame.getByRole('tab', { name: contract.tabs.choice, exact: true })
		assert.equal(await tab.getAttribute('aria-selected'), 'true')
	}
	if (passes('status')) {
		assert.equal(await frame.getByText(contract.status.message, { exact: true }).count(), 0)
	}
	const dialogsOnScreen = await frame
		.locator('[role="dialog"]')
		.evaluateAll((dialogs) => dialogs.filter((dialog) => dialog.getClientRects().length > 0).length)
	assert.equal(dialogsOnScreen, 0, 'A closed dialog is still on screen')
}

const smokeKit = async (browser: Browser, origin: string, dir: string, kit: number) => {
	const id = pageTest(dir)
	const page = await browser.newPage()
	const errors: string[] = []
	page.on('pageerror', (error) => errors.push(error.message))
	const src = `/conformance/kits/${dir}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`
	await page.goto(`${origin}/?src=${encodeURIComponent(src)}`)
	const finished = await page.waitForFunction(
		(storyId) =>
			(window as unknown as { finished: Finished[] }).finished.find(
				(event) => event.storyId === storyId,
			),
		id,
		{ timeout: 120_000 },
	)
	const { status } = (await finished.jsonValue()) as Finished
	assert.equal(status, 'success', `${dir}: the built page test failed ${errors.join('; ')}`)
	assert.deepEqual(errors, [], `${dir}: page errors`)
	await checkEndState(page.frameLocator('#run'), kit)
	await page.close()
	console.info(`${dir}: page journey passed from the bundle`)
}

const server = createServer(serve).listen(0, '127.0.0.1')
await once(server, 'listening')
const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
const browser = await chromium.launch()
try {
	await matrix.kits.reduce(async (previous, { dir }, kit) => {
		await previous
		await smokeKit(browser, origin, dir, kit)
	}, Promise.resolve())
} finally {
	await browser.close()
	server.close()
	rmSync(bundle, { recursive: true, force: true })
}
