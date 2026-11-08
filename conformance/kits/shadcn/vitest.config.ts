import { kitTestConfig } from 'kahraman-conformance-storybook/vitest'
import { mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(viteConfig, kitTestConfig({ name: 'shadcn', port: 6007 }))
