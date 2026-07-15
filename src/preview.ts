import { configure, prettyDOM } from 'storybook/test'

import {
	capMessage,
	ELEMENT_ERROR_MAX_LENGTH,
	filterRoleListing,
	hasRoleListing,
} from './diagnostics'

export {
	capMessage,
	ELEMENT_ERROR_MAX_LENGTH,
	filterRoleListing,
	hasRoleListing,
	ROLE_LISTING_MARKER,
} from './diagnostics'

/** Options controlling kahraman's element-not-found diagnostics. */
export interface KahramanDiagnosticsOptions {
	/**
	 * Reduce a failed `getByRole` query's accessible-roles listing to just the
	 * queried role's section. Defaults to `true`. Set `false` to keep
	 * Testing-Library's full listing (still length-capped).
	 */
	captureRoleListing?: boolean
	/** Maximum message length before truncation. Defaults to {@link ELEMENT_ERROR_MAX_LENGTH}. */
	maxLength?: number
	/**
	 * Provide your own `getElementError`; when set it wins entirely and kahraman's
	 * formatting is skipped. This is the opt-out so a consumer's existing
	 * diagnostics config can take precedence.
	 */
	getElementError?: (message: string | null, container: Element) => Error
}

/** Storybook `parameters` slice consumed by the kahraman `/preview` annotation. */
export interface KahramanParameters {
	kahraman?: KahramanDiagnosticsOptions
}

/**
 * Build a tamed `TestingLibraryElementError`: keep only the queried role's
 * section (optional) and append a length-capped DOM dump for non-role misses.
 */
export function buildElementError(
	message: string | null,
	container: Element,
	options: KahramanDiagnosticsOptions = {},
): Error {
	const { captureRoleListing = true, maxLength = ELEMENT_ERROR_MAX_LENGTH } = options
	const filtered =
		message === null ? null : captureRoleListing ? filterRoleListing(message) : message
	// The role section already shows the relevant context; dump (capped) DOM only
	// for query types without a listing (e.g. byText misses).
	const full = [filtered, hasRoleListing(message) ? null : prettyDOM(container, 1000)]
		.filter(Boolean)
		.join('\n\n')
	const error = new Error(capMessage(full, maxLength))
	error.name = 'TestingLibraryElementError'
	return error
}

/**
 * Imperatively install kahraman's element-error diagnostics via Testing-Library
 * `configure`. Use this outside Storybook, or when you prefer wiring it yourself
 * instead of adding the `/preview` annotation.
 */
export function configureDiagnostics(options: KahramanDiagnosticsOptions = {}): void {
	if (options.getElementError) {
		configure({ getElementError: options.getElementError })
		return
	}
	configure({
		getElementError: (message: string | null, container: Element) =>
			buildElementError(message, container, options),
	})
}

type PreviewContext = { parameters?: KahramanParameters }

/**
 * Storybook preview annotation. Add it to your `.storybook/preview` so failed
 * element queries get kahraman's tamed diagnostics. Opt out or tune per story
 * via `parameters.kahraman`:
 *
 * ```ts
 * // .storybook/preview.ts
 * import kahraman from 'kahraman/preview'
 * export default { ...kahraman }
 *
 * // in a story:
 * parameters: { kahraman: { captureRoleListing: false } }
 * ```
 */
const preview = {
	beforeEach(context: PreviewContext) {
		configureDiagnostics(context.parameters?.kahraman)
	},
}

export default preview
