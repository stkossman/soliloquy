import {
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import { Separator } from '$lib/components/ui/separator'
import { useSidebar } from '$lib/hooks/useSidebar'
import type { WorkspaceRestoreMode } from '$lib/services/import-export/workspace-backup/workspaceBackup'
import type { Chat } from '$lib/types'
import { cn } from '$lib/utils'
import { SidebarChatList } from './sidebar/SidebarChatList'
import { SidebarDialogs } from './sidebar/SidebarDialogs'
import { SidebarHeader } from './sidebar/SidebarHeader'
import { SidebarSelectionBar } from './sidebar/SidebarSelectionBar'
import { SidebarSettings } from './sidebar/settings/SidebarSettings'
import { WorkspaceRestoreDialogs } from './sidebar/WorkspaceRestoreDialogs'

interface SidebarProps {
	activeChatId: number | null
	onChatSelect: (id: number | null) => void
}

type WorkspaceOperation = 'exporting' | 'importing'

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
	const [showSettings, setShowSettings] = useState(false)
	const [workspaceOperation, setWorkspaceOperation] =
		useState<WorkspaceOperation | null>(null)
	const workspaceOperationRef = useRef<WorkspaceOperation | null>(null)

	const startWorkspaceOperation = useCallback(
		(operation: WorkspaceOperation) => {
			if (workspaceOperationRef.current) return false

			workspaceOperationRef.current = operation
			setWorkspaceOperation(operation)
			return true
		},
		[],
	)

	const finishWorkspaceOperation = useCallback(() => {
		workspaceOperationRef.current = null
		setWorkspaceOperation(null)
	}, [])

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
		if (!startWorkspaceOperation('exporting')) return

		try {
			await logic.exportWorkspaceBackup()
			setToast({ type: 'success', message: 'Workspace backup exported.' })
		} catch {
			setToast({ type: 'error', message: 'Failed to export workspace backup.' })
		} finally {
			finishWorkspaceOperation()
		}
	}, [
		finishWorkspaceOperation,
		logic.exportWorkspaceBackup,
		startWorkspaceOperation,
	])

	const restoreWorkspaceBackup = useCallback(
		async (file: File, mode: WorkspaceRestoreMode) => {
			if (!startWorkspaceOperation('importing')) return

			try {
				const result = await logic.importWorkspaceBackup(file, mode)
				onChatSelect(null)
				setToast({
					type: 'success',
					message: `Workspace ${mode === 'merge' ? 'merged' : 'replaced'}: ${result.chatsImported} chats, ${result.messagesImported} messages.`,
				})
			} catch {
				setToast({
					type: 'error',
					message: 'Failed to restore workspace backup.',
				})
			} finally {
				finishWorkspaceOperation()
			}
		},
		[
			finishWorkspaceOperation,
			logic.importWorkspaceBackup,
			onChatSelect,
			startWorkspaceOperation,
		],
	)

	const handleWorkspaceRestoreRequest = useCallback((file: File) => {
		if (workspaceOperationRef.current) return

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

	const handleOpenSettings = useCallback(() => {
		setShowSettings(true)
	}, [])

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
					onOpenSettings={handleOpenSettings}
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

			<SidebarSettings
				open={showSettings}
				onOpenChange={setShowSettings}
				showSystemChat={logic.showSystemChat}
				onShowSystemChatChange={logic.setShowSystemChat}
				onImportChat={handleImportWrapper}
				onExportWorkspace={handleExportWorkspaceBackup}
				onImportWorkspace={handleWorkspaceRestoreRequest}
				workspaceOperation={workspaceOperation}
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

			<WorkspaceRestoreDialogs
				isRestoreDialogOpen={showWorkspaceRestoreDialog}
				onRestoreDialogOpenChange={setShowWorkspaceRestoreDialog}
				mode={workspaceRestoreMode}
				onModeChange={setWorkspaceRestoreMode}
				onContinue={handleWorkspaceRestoreContinue}
				isReplaceConfirmOpen={showReplaceWorkspaceConfirm}
				onReplaceConfirmOpenChange={setShowReplaceWorkspaceConfirm}
				onConfirmReplace={handleReplaceWorkspaceConfirm}
			/>
		</>
	)
}
