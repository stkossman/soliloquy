import { useState } from 'react'
import { APP_NAME, APP_VERSION } from '$lib/appInfo'
import { Dialog, DialogContent } from '$lib/components/ui/dialog'
import { AboutSettingsPage } from './AboutSettingsPage'
import { DataSettingsPage } from './DataSettingsPage'
import { GeneralSettingsPage } from './GeneralSettingsPage'
import { SettingsHeader } from './SettingsHeader'
import { SettingsHome } from './SettingsHome'
import type { SettingsPage, SidebarSettingsProps } from './settings.types'

export function SidebarSettings({
	open,
	onOpenChange,
	showSystemChat,
	onShowSystemChatChange,
	onImportChat,
	onExportWorkspace,
	onImportWorkspace,
	workspaceOperation,
}: SidebarSettingsProps) {
	const [page, setPage] = useState<SettingsPage>('home')

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) setPage('home')
		onOpenChange(nextOpen)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className='gap-0 overflow-hidden p-0 sm:max-w-[560px]'
				overlayClassName='backdrop-blur-sm'
			>
				<SettingsHeader page={page} onBack={() => setPage('home')} />

				<div className='max-h-[calc(100vh-12rem)] overflow-y-auto'>
					{page === 'home' && <SettingsHome onSelectPage={setPage} />}
					{page === 'general' && (
						<GeneralSettingsPage
							showSystemChat={showSystemChat}
							onShowSystemChatChange={onShowSystemChatChange}
						/>
					)}
					{page === 'data' && (
						<DataSettingsPage
							onImportChat={onImportChat}
							onExportWorkspace={onExportWorkspace}
							onImportWorkspace={onImportWorkspace}
							workspaceOperation={workspaceOperation}
						/>
					)}
					{page === 'about' && <AboutSettingsPage />}
				</div>

				{page === 'home' && (
					<footer className='border-t px-6 py-4 text-xs text-muted-foreground'>
						{APP_NAME} · v{APP_VERSION}
					</footer>
				)}
			</DialogContent>
		</Dialog>
	)
}
