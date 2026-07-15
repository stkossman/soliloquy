import { ArrowLeft } from 'lucide-react'
import { Button } from '$lib/components/ui/button'
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '$lib/components/ui/dialog'
import type { SettingsPage } from './settings.types'

interface SettingsHeaderProps {
	page: SettingsPage
	onBack: () => void
}

export function SettingsHeader({ page, onBack }: SettingsHeaderProps) {
	const title =
		page === 'general'
			? 'General'
			: page === 'data'
				? 'Data'
				: page === 'about'
					? 'About Soliloquy'
					: 'Settings'

	return (
		<DialogHeader className='min-h-18 border-b px-6 py-5 text-left'>
			<div className='flex items-center gap-2 pr-8'>
				{page !== 'home' && (
					<Button
						variant='ghost'
						size='icon-sm'
						onClick={onBack}
						title='Back to Settings'
					>
						<ArrowLeft />
					</Button>
				)}
				<DialogTitle>{title}</DialogTitle>
			</div>
			{page === 'home' && (
				<DialogDescription>
					Manage local workspace preferences and data.
				</DialogDescription>
			)}
		</DialogHeader>
	)
}
