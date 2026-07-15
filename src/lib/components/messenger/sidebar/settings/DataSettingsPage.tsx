import {
	ArchiveRestore,
	Download,
	FileUp,
	LoaderCircle,
} from 'lucide-react'
import { useRef } from 'react'
import { SettingsActionRow } from './SettingsActionRow'
import type { SidebarSettingsProps } from './settings.types'

type DataSettingsPageProps = Pick<
	SidebarSettingsProps,
	'onImportChat' | 'onExportWorkspace' | 'onImportWorkspace' | 'workspaceOperation'
>

export function DataSettingsPage({
	onImportChat,
	onExportWorkspace,
	onImportWorkspace,
	workspaceOperation,
}: DataSettingsPageProps) {
	const chatFileInputRef = useRef<HTMLInputElement>(null)
	const workspaceFileInputRef = useRef<HTMLInputElement>(null)
	const isWorkspaceOperationInProgress = workspaceOperation !== null
	const workspaceOperationMessage =
		workspaceOperation === 'exporting'
			? 'Exporting workspace backup...'
			: 'Restoring workspace backup...'

	const handleChatFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) onImportChat(file)
		if (chatFileInputRef.current) chatFileInputRef.current.value = ''
	}

	const handleWorkspaceFileChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0]
		if (file) onImportWorkspace(file)
		if (workspaceFileInputRef.current) {
			workspaceFileInputRef.current.value = ''
		}
	}

	return (
		<section className='space-y-4 px-6 py-5' aria-labelledby='data-heading'>
			<h2 id='data-heading' className='sr-only'>
				Data
			</h2>

			<input
				type='file'
				ref={chatFileInputRef}
				onChange={handleChatFileChange}
				className='hidden'
				accept='.json,.md'
			/>
			<SettingsActionRow
				title='Import one chat'
				description='Import a single chat from JSON or Markdown.'
				buttonLabel='Import Chat'
				icon={FileUp}
				onClick={() => chatFileInputRef.current?.click()}
			/>

			<SettingsActionRow
				title='Export workspace'
				description='Download all chats and messages as a backup file.'
				buttonLabel='Export'
				icon={workspaceOperation === 'exporting' ? LoaderCircle : Download}
				iconClassName={workspaceOperation === 'exporting' ? 'animate-spin' : undefined}
				onClick={onExportWorkspace}
				disabled={isWorkspaceOperationInProgress}
			/>

			<input
				type='file'
				ref={workspaceFileInputRef}
				onChange={handleWorkspaceFileChange}
				className='hidden'
				accept='.json,application/json'
			/>
			<SettingsActionRow
				title='Restore workspace'
				description='Restore a workspace backup with merge or replace.'
				buttonLabel='Restore'
				icon={workspaceOperation === 'importing' ? LoaderCircle : ArchiveRestore}
				iconClassName={workspaceOperation === 'importing' ? 'animate-spin' : undefined}
				onClick={() => workspaceFileInputRef.current?.click()}
				disabled={isWorkspaceOperationInProgress}
			/>

			{isWorkspaceOperationInProgress && (
				<output className='flex items-center gap-2 text-sm text-muted-foreground'>
					<LoaderCircle className='h-4 w-4 animate-spin' />
					{workspaceOperationMessage}
				</output>
			)}
		</section>
	)
}
