// React Aria Components ships unstyled, so there is no default theme to load.
import { contract } from 'kahraman-conformance-scenarios'
import { useState } from 'react'
import { Button } from 'react-aria-components'

export const ButtonFixture = () => {
	const [saved, setSaved] = useState(false)
	return (
		<>
			<Button onPress={() => setSaved(true)}>{contract.button.name}</Button>
			{saved && <p>{contract.button.outcome}</p>}
		</>
	)
}
