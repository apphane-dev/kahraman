import { definePreview } from '@storybook/react-vite'
import kahraman from 'kahraman'

export default definePreview({
	addons: [kahraman()],
})
