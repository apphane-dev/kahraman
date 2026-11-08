import type { PresetProperty } from 'storybook/internal/types'

// Renderer and styling stay in each kit. These are the common test settings.
export const addons: PresetProperty<'addons'> = ['@storybook/addon-vitest']
export const core: PresetProperty<'core'> = { disableTelemetry: true }
