export type SettingsPage = 'home' | 'general' | 'data' | 'about'

export interface SidebarSettingsProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	showSystemChat: boolean
	onShowSystemChatChange: (show: boolean) => void
	onImportChat: (file: File) => void
	onExportWorkspace: () => void
	onImportWorkspace: (file: File) => void
	workspaceOperation: 'exporting' | 'importing' | null
}
