import { kitTestConfig } from 'kahraman-conformance-storybook/vitest'

// The page journey waits out the 5 s lookup for each of ten known gaps.
export default kitTestConfig({ name: 'web-awesome', port: 6011, testTimeout: 90_000 })
