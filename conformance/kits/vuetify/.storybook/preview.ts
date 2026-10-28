import { definePreview, setup } from '@storybook/vue3-vite'
import kahraman from 'kahraman'
import 'kahraman-conformance-storybook/waits'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import 'vuetify/styles'

setup((app) => {
	app.use(
		createVuetify({ components, directives, icons: { defaultSet: 'mdi', aliases, sets: { mdi } } }),
	)
})

export default definePreview({
	addons: [kahraman()],
	decorators: [
		() => ({
			template:
				'<v-app><v-main><v-container style="max-width: 768px"><story /></v-container></v-main></v-app>',
		}),
	],
})
