import {
	ArchiveRestore,
	Download,
	FileUp,
	LoaderCircle,
} from 'lucide-react'
import { useRef } from 'react'
import { Button } from '$lib/components/ui/button'
import { Checkbox } from '$lib/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '$lib/components/ui/dialog'
import { Label } from '$lib/components/ui/label'

interface SidebarSettingsProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	showSystemChat: boolean
	onShowSystemChatChange: (show: boolean) => void
	onImportChat: (file: File) => void
	onExportWorkspace: () => void
	onImportWorkspace: (file: File) => void
	workspaceOperation: 'exporting' | 'importing' | null
}

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className='gap-0 overflow-hidden p-0 sm:max-w-[560px]'
				overlayClassName='backdrop-blur-sm'
			>
				<DialogHeader className='border-b px-6 py-5 text-left'>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Manage local workspace preferences and data.
					</DialogDescription>
				</DialogHeader>

				<div className='max-h-[calc(100vh-12rem)] overflow-y-auto'>
					<section className='space-y-4 px-6 py-5' aria-labelledby='general-heading'>
						<h2 id='general-heading' className='text-sm font-semibold'>
							General
						</h2>
						<div className='flex items-center justify-between gap-6'>
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

					<section className='space-y-4 border-t px-6 py-5' aria-labelledby='data-heading'>
						<h2 id='data-heading' className='text-sm font-semibold'>
							Data
						</h2>

						<input
							type='file'
							ref={chatFileInputRef}
							onChange={handleChatFileChange}
							className='hidden'
							accept='.json,.md'
						/>
						<div className='flex items-center justify-between gap-6'>
							<div className='space-y-1'>
								<p className='text-sm font-medium'>Import one chat</p>
								<p className='text-sm text-muted-foreground'>
									Import a single chat from JSON or Markdown.
								</p>
							</div>
							<Button
								variant='outline'
								size='sm'
								onClick={() => chatFileInputRef.current?.click()}
							>
								<FileUp /> Import Chat
							</Button>
						</div>

						<div className='flex items-center justify-between gap-6 border-t pt-4'>
							<div className='space-y-1'>
								<p className='text-sm font-medium'>Export workspace</p>
								<p className='text-sm text-muted-foreground'>
									Download all chats and messages as a backup file.
								</p>
							</div>
							<Button
								variant='outline'
								size='sm'
								onClick={onExportWorkspace}
								disabled={isWorkspaceOperationInProgress}
							>
								{workspaceOperation === 'exporting' ? (
									<LoaderCircle className='animate-spin' />
								) : (
									<Download />
								)}
								Export
							</Button>
						</div>

						<input
							type='file'
							ref={workspaceFileInputRef}
							onChange={handleWorkspaceFileChange}
							className='hidden'
							accept='.json,application/json'
						/>
						<div className='flex items-center justify-between gap-6 border-t pt-4'>
							<div className='space-y-1'>
								<p className='text-sm font-medium'>Restore workspace</p>
								<p className='text-sm text-muted-foreground'>
									Restore a workspace backup with merge or replace.
								</p>
							</div>
							<Button
								variant='outline'
								size='sm'
								onClick={() => workspaceFileInputRef.current?.click()}
								disabled={isWorkspaceOperationInProgress}
							>
								{workspaceOperation === 'importing' ? (
									<LoaderCircle className='animate-spin' />
								) : (
									<ArchiveRestore />
								)}
								Restore
							</Button>
						</div>

						{isWorkspaceOperationInProgress && (
							<output className='flex items-center gap-2 text-sm text-muted-foreground'>
								<LoaderCircle className='h-4 w-4 animate-spin' />
								{workspaceOperationMessage}
							</output>
						)}
					</section>
				</div>

				<footer className='border-t px-6 py-4 text-xs text-muted-foreground'>
					© 2026 · Made by Kossman
				</footer>
			</DialogContent>
		</Dialog>
	)
}
