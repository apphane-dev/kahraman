import { runnerFor } from 'kahraman-conformance-scenarios'

import preview from '../.storybook/preview'
import { ButtonFixture } from './fixtures'
import { manifest } from './manifest'

const run = runnerFor(manifest)

const meta = preview.meta({ title: 'Conformance/React Aria Components' })

export const Button = meta.story({ render: () => <ButtonFixture /> })
Button.test('button', run('button'))
