import {
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	FormControlLabel,
	InputLabel,
	Menu,
	MenuItem,
	NativeSelect,
	Snackbar,
	Stack,
	Switch,
	Tab,
	Tabs,
	TextField,
	Typography,
} from '@mui/material'
import { contract } from 'kahraman-conformance-scenarios'
import { useState } from 'react'

export const ButtonFixture = () => {
	const [saved, setSaved] = useState(false)
	return (
		<Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
			<Button variant="contained" onClick={() => setSaved(true)}>
				{contract.button.name}
			</Button>
			{saved && <Typography>{contract.button.outcome}</Typography>}
		</Stack>
	)
}

export const ButtonDisabledFixture = () => (
	<Button variant="contained" disabled>
		{contract['button-disabled'].name}
	</Button>
)

export const TextboxFixture = () => (
	<TextField id="email" label={contract.textbox.label} sx={{ width: 360, maxWidth: '100%' }} />
)

export const TextareaFixture = () => (
	<TextField
		id="comment"
		label={contract.textarea.label}
		multiline
		minRows={3}
		sx={{ width: 360, maxWidth: '100%' }}
	/>
)

export const CheckboxFixture = () => (
	<FormControlLabel control={<Checkbox />} label={contract.checkbox.label} />
)

export const SwitchFixture = () => (
	<FormControlLabel control={<Switch />} label={contract.switch.label} />
)

export const NativeSelectFixture = () => (
	<FormControl sx={{ width: 360, maxWidth: '100%' }}>
		<InputLabel htmlFor="size">{contract['native-select'].label}</InputLabel>
		<NativeSelect inputProps={{ id: 'size' }} defaultValue={contract['native-select'].options[0]}>
			{contract['native-select'].options.map((option) => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</NativeSelect>
	</FormControl>
)

export const ComboboxFixture = () => (
	<TextField
		id="country"
		label={contract.combobox.label}
		select
		defaultValue=""
		sx={{ width: 360, maxWidth: '100%' }}
	>
		{contract.combobox.options.map((option) => (
			<MenuItem key={option} value={option}>
				{option}
			</MenuItem>
		))}
	</TextField>
)

export const DialogFixture = () => {
	const c = contract.dialog
	const [open, setOpen] = useState(false)
	return (
		<>
			<Button variant="contained" onClick={() => setOpen(true)}>
				{c.trigger}
			</Button>
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				aria-labelledby="confirmation-title"
				aria-describedby="confirmation-description"
			>
				<DialogTitle id="confirmation-title">{c.title}</DialogTitle>
				<DialogContent>
					<DialogContentText id="confirmation-description">{c.content}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)}>{c.close}</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}

export const MenuFixture = () => {
	const c = contract.menu
	const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null)
	const [chosen, setChosen] = useState(false)
	return (
		<Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
			<Button
				variant="outlined"
				aria-haspopup="menu"
				aria-expanded={anchor !== null}
				onClick={(event) => setAnchor(event.currentTarget)}
			>
				{c.trigger}
			</Button>
			<Menu anchorEl={anchor} open={anchor !== null} onClose={() => setAnchor(null)}>
				{c.items.map((item) => (
					<MenuItem
						key={item}
						onClick={() => {
							setChosen(item === c.choice)
							setAnchor(null)
						}}
					>
						{item}
					</MenuItem>
				))}
			</Menu>
			{chosen && <Typography>{c.outcome}</Typography>}
		</Stack>
	)
}

// MUI's core Tabs API leaves the labeled panel composition to the application.
// Follow the documented Tabs/Tab + role="tabpanel" pattern without MUI Lab.
export const TabsFixture = () => {
	const c = contract.tabs
	const [selected, setSelected] = useState<(typeof c.tabs)[number]>(c.tabs[0])
	return (
		<Box sx={{ maxWidth: 480 }}>
			<Tabs
				value={selected}
				aria-label="Account"
				onChange={(_event, next: unknown) => {
					if (next === c.tabs[0] || next === c.tabs[1]) {
						setSelected(next)
					}
				}}
			>
				{c.tabs.map((tab) => (
					<Tab
						key={tab}
						value={tab}
						label={tab}
						id={`account-tab-${tab}`}
						aria-controls={`account-panel-${tab}`}
					/>
				))}
			</Tabs>
			{c.tabs.map((tab) => (
				<Box
					key={tab}
					role="tabpanel"
					hidden={selected !== tab}
					id={`account-panel-${tab}`}
					aria-labelledby={`account-tab-${tab}`}
					tabIndex={0}
					sx={{ p: 2 }}
				>
					{c.panels[tab]}
				</Box>
			))}
		</Box>
	)
}

export const StatusFixture = () => {
	const [open, setOpen] = useState(false)
	return (
		<>
			<Button variant="contained" onClick={() => setOpen(true)}>
				{contract.status.trigger}
			</Button>
			<Snackbar
				open={open}
				message={contract.status.message}
				autoHideDuration={500}
				onClose={() => setOpen(false)}
			/>
		</>
	)
}
