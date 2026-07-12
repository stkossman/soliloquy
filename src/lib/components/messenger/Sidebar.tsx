import {
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '$lib/components/ui/alert-dialog'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '$lib/components/ui/dialog'
import { Button } from '$lib/components/ui/button'
import { Separator } from '$lib/components/ui/separator'
import { useSidebar } from '$lib/hooks/useSidebar'
import type { WorkspaceRestoreMode } from '$lib/services/import-export/workspaceBackup'
import type { Chat } from '$lib/types'
import { cn } from '$lib/utils'
import { SidebarChatList } from './sidebar/SidebarChatList'
import { SidebarDialogs } from './sidebar/SidebarDialogs'
import { SidebarHeader } from './sidebar/SidebarHeader'
import { SidebarSelectionBar } from './sidebar/SidebarSelectionBar'

interface SidebarProps {
	activeChatId: number | null
	onChatSelect: (id: number | null) => void
}

export function Sidebar({ activeChatId, onChatSelect }: SidebarProps) {
	const logic = useSidebar()

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event
			if (active.id !== over?.id) {
				logic.updateChatOrder(active.id as number, over?.id as number)
			}
		},
		[logic.updateChatOrder],
	)

	const [toast, setToast] = useState<{
		type: 'success' | 'error'
		message: string
	} | null>(null)
	const [workspaceBackupFile, setWorkspaceBackupFile] = useState<File | null>(
		null,
	)
	const [workspaceRestoreMode, setWorkspaceRestoreMode] =
		useState<WorkspaceRestoreMode>('merge')
	const [showWorkspaceRestoreDialog, setShowWorkspaceRestoreDialog] =
		useState(false)
	const [showReplaceWorkspaceConfirm, setShowReplaceWorkspaceConfirm] =
		useState(false)

	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 3000)
			return () => clearTimeout(timer)
		}
	}, [toast])

	const handleImportWrapper = useCallback(
		async (file: File) => {
			try {
				await logic.importChat(file, onChatSelect)
				setToast({ type: 'success', message: 'Chat imported successfully.' })
			} catch {
				setToast({ type: 'error', message: 'Failed to import chat.' })
			}
		},
		[logic.importChat, onChatSelect],
	)

	const handleExportWorkspaceBackup = useCallback(async () => {
		try {
			await logic.exportWorkspaceBackup()
			setToast({ type: 'success', message: 'Workspace backup exported.' })
		} catch {
			setToast({ type: 'error', message: 'Failed to export workspace backup.' })
		}
	}, [logic.exportWorkspaceBackup])

	const restoreWorkspaceBackup = useCallback(
		async (file: File, mode: WorkspaceRestoreMode) => {
			try {
				const result = await logic.importWorkspaceBackup(file, mode)
				onChatSelect(null)
				setToast({
					type: 'success',
					message: `Workspace ${mode === 'merge' ? 'merged' : 'replaced'}: ${result.chatsImported} chats, ${result.messagesImported} messages.`,
				})
			} catch {
				setToast({ type: 'error', message: 'Failed to restore workspace backup.' })
			}
		},
		[logic.importWorkspaceBackup, onChatSelect],
	)

	const handleWorkspaceRestoreRequest = useCallback((file: File) => {
		setWorkspaceBackupFile(file)
		setWorkspaceRestoreMode('merge')
		setShowWorkspaceRestoreDialog(true)
	}, [])

	const handleWorkspaceRestoreContinue = useCallback(() => {
		if (!workspaceBackupFile) return

		if (workspaceRestoreMode === 'replace') {
			setShowWorkspaceRestoreDialog(false)
			setShowReplaceWorkspaceConfirm(true)
			return
		}

		setShowWorkspaceRestoreDialog(false)
		restoreWorkspaceBackup(workspaceBackupFile, workspaceRestoreMode)
		setWorkspaceBackupFile(null)
	}, [restoreWorkspaceBackup, workspaceBackupFile, workspaceRestoreMode])

	const handleReplaceWorkspaceConfirm = useCallback(() => {
		if (!workspaceBackupFile) return

		restoreWorkspaceBackup(workspaceBackupFile, 'replace')
		setWorkspaceBackupFile(null)
	}, [restoreWorkspaceBackup, workspaceBackupFile])

	const handleCreateChat = useCallback(() => {
		logic.createNewChat(onChatSelect)
	}, [logic.createNewChat, onChatSelect])

	const handlePinChat = useCallback(
		(chat: Chat) => {
			logic.togglePin(chat)
		},
		[logic.togglePin],
	)

	const handleEditChat = useCallback(
		(chat: Chat) => {
			logic.openEditDialog(chat)
		},
		[logic.openEditDialog],
	)

	const handleDeleteChat = useCallback(
		(chat: Chat) => {
			logic.setChatToDelete(chat)
		},
		[logic.setChatToDelete],
	)

	const handleShowBatchDeleteConfirm = useCallback(() => {
		logic.setShowBatchDeleteConfirm(true)
	}, [logic.setShowBatchDeleteConfirm])

	return (
		<>
			<div className='relative flex h-full w-[320px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground'>
				<SidebarHeader
					searchQuery={logic.searchQuery}
					onSearchChange={logic.setSearchQuery}
					onCreateChat={handleCreateChat}
					onImportChat={handleImportWrapper}
					onExportWorkspace={handleExportWorkspaceBackup}
					onImportWorkspace={handleWorkspaceRestoreRequest}
					isSelectionMode={logic.isSelectionMode}
				/>

				<Separator className='bg-sidebar-border' />

				{toast && (
					<div
						className={cn(
							'absolute bottom-4 left-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium animate-in slide-in-from-bottom-2 fade-in duration-300',
							toast.type === 'success'
								? 'bg-green-500/10 text-green-600 border border-green-500/20 dark:text-green-400'
								: 'bg-destructive/10 text-destructive border border-destructive/20',
						)}
					>
						{toast.type === 'success' ? (
							<CheckCircle2 className='h-4 w-4' />
						) : (
							<XCircle className='h-4 w-4' />
						)}
						{toast.message}
					</div>
				)}

				<div className='flex-1 overflow-y-auto min-h-0'>
					<SidebarChatList
						chats={logic.chats}
						searchQuery={logic.searchQuery}
						isSelectionMode={logic.isSelectionMode}
						selectedChatIds={logic.selectedChatIds}
						activeChatId={activeChatId}
						onChatSelect={onChatSelect}
						onPinChat={handlePinChat}
						onEditChat={handleEditChat}
						onDeleteChat={handleDeleteChat}
						onToggleSelection={logic.toggleChatSelection}
						onStartSelection={logic.startSelectionMode}
						onDragEnd={handleDragEnd}
						sensors={sensors}
					/>

					{logic.isSelectionMode && logic.selectedChatIds.size > 0 && (
						<SidebarSelectionBar
							selectedCount={logic.selectedChatIds.size}
							onPinSelected={logic.batchPin}
							onUnpinSelected={logic.batchUnpin}
							onDeleteSelected={handleShowBatchDeleteConfirm}
						/>
					)}
				</div>
			</div>

			<SidebarDialogs
				chatToEdit={logic.chatToEdit}
				chatToDelete={logic.chatToDelete}
				newTitle={logic.newTitle}
				onNewTitleChange={logic.setNewTitle}
				newIcon={logic.newIcon}
				onNewIconChange={logic.setNewIcon}
				newColor={logic.newColor}
				onNewColorChange={logic.setNewColor}
				onCloseEdit={() => logic.setChatToEdit(null)}
				onSaveEdit={logic.saveChatTitle}
				onCloseDelete={() => logic.setChatToDelete(null)}
				onConfirmDelete={() => logic.deleteChat(activeChatId, onChatSelect)}
			/>

			<AlertDialog
				open={logic.showBatchDeleteConfirm}
				onOpenChange={logic.setShowBatchDeleteConfirm}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete {logic.selectedChatIds.size} chats?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action is irreversible. All selected chats and their messages
							will be deleted permanently.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => logic.batchDelete(activeChatId, onChatSelect)}
							className='bg-red-600 hover:bg-red-700 text-white'
							autoFocus
						>
							Delete All
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Dialog
				open={showWorkspaceRestoreDialog}
				onOpenChange={setShowWorkspaceRestoreDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Restore workspace backup</DialogTitle>
						<DialogDescription>
							Choose how to apply the selected backup to your local workspace.
						</DialogDescription>
					</DialogHeader>

					<fieldset className='grid grid-cols-2 overflow-hidden rounded-md border'>
						<legend className='sr-only'>Workspace restore mode</legend>
						<button
							type='button'
							className={cn(
								'px-3 py-2 text-sm font-medium transition-colors',
								workspaceRestoreMode === 'merge'
									? 'bg-primary text-primary-foreground'
									: 'hover:bg-muted',
							)}
							onClick={() => setWorkspaceRestoreMode('merge')}
							aria-pressed={workspaceRestoreMode === 'merge'}
						>
							Merge
						</button>
						<button
							type='button'
							className={cn(
								'border-l px-3 py-2 text-sm font-medium transition-colors',
								workspaceRestoreMode === 'replace'
									? 'bg-destructive text-destructive-foreground'
									: 'hover:bg-muted',
							)}
							onClick={() => setWorkspaceRestoreMode('replace')}
							aria-pressed={workspaceRestoreMode === 'replace'}
						>
							Replace
						</button>
					</fieldset>

					<p className='text-muted-foreground text-sm'>
						{workspaceRestoreMode === 'merge'
							? 'Add the backup chats and messages to the current workspace.'
							: 'Delete all local chats and messages, then restore this backup.'}
					</p>

					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setShowWorkspaceRestoreDialog(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleWorkspaceRestoreContinue}>
							Continue
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={showReplaceWorkspaceConfirm}
				onOpenChange={setShowReplaceWorkspaceConfirm}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Replace current workspace?</AlertDialogTitle>
						<AlertDialogDescription>
							This permanently deletes all local chats and messages before
							restoring the selected backup. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleReplaceWorkspaceConfirm}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							Replace and Restore
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
