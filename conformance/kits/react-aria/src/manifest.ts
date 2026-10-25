import type { KitManifest } from 'kahraman-conformance-scenarios'

export const manifest = {
	kit: 'React Aria Components',
	scenarios: ['button'],
} as const satisfies KitManifest
