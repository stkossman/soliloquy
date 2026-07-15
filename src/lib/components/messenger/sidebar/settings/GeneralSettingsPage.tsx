import { Checkbox } from '$lib/components/ui/checkbox'
import { Label } from '$lib/components/ui/label'

interface GeneralSettingsPageProps {
	showSystemChat: boolean
	onShowSystemChatChange: (show: boolean) => void
}

export function GeneralSettingsPage({
	showSystemChat,
	onShowSystemChatChange,
}: GeneralSettingsPageProps) {
	return (
		<section className='space-y-4 px-6 py-5' aria-labelledby='general-heading'>
			<h2 id='general-heading' className='text-sm font-semibold'>
				Workspace
			</h2>
			<div className='flex min-h-14 items-center justify-between gap-6'>
				<div className='space-y-1'>
					<Label htmlFor='show-system-chat'>Show system chat</Label>
					<p className='text-sm text-muted-foreground'>
						Show Soliloquy Info in the sidebar.
					</p>
				</div>
				<Checkbox
					id='show-system-chat'
					checked={showSystemChat}
					onCheckedChange={checked => onShowSystemChatChange(checked === true)}
				/>
			</div>
		</section>
	)
}
