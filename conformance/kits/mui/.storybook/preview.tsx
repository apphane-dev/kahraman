import { Box, CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { definePreview } from '@storybook/react-vite'
import kahraman from 'kahraman'

import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

const theme = createTheme()

export default definePreview({
	addons: [kahraman()],
	decorators: [
		(Story) => (
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Box sx={{ p: 3, maxWidth: 768, mx: 'auto' }}>
					<Story />
				</Box>
			</ThemeProvider>
		),
	],
})
