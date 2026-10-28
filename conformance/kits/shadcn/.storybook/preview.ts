import { definePreview } from '@storybook/react-vite'
import kahraman from 'kahraman'
import 'kahraman-conformance-storybook/waits'

import '../src/styles.css'

export default definePreview({ addons: [kahraman()] })
