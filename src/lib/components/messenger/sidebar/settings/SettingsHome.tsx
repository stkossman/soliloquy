import {
	CircleHelp,
	DatabaseBackup,
	SlidersHorizontal,
} from 'lucide-react'
import { SettingsMenuRow } from './SettingsMenuRow'
import type { SettingsPage } from './settings.types'

interface SettingsHomeProps {
	onSelectPage: (page: Exclude<SettingsPage, 'home'>) => void
}

export function SettingsHome({ onSelectPage }: SettingsHomeProps) {
	return (
		<div className='p-3'>
			<SettingsMenuRow
				icon={SlidersHorizontal}
				iconClassName='bg-sky-500/10 text-sky-500'
				title='General'
				description='General workspace preferences'
				onClick={() => onSelectPage('general')}
			/>
			<SettingsMenuRow
				icon={DatabaseBackup}
				iconClassName='bg-emerald-500/10 text-emerald-500'
				title='Data'
				description='Import, export and workspace backup'
				onClick={() => onSelectPage('data')}
			/>
			<SettingsMenuRow
				icon={CircleHelp}
				iconClassName='bg-amber-500/10 text-amber-500'
				title='About Soliloquy'
				description='Version, author and source code'
				onClick={() => onSelectPage('about')}
			/>
		</div>
	)
}
