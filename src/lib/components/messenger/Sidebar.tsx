import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core'
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
	MessageSquare,
	CheckCircle2,
	XCircle,
	Trash2,
	Pin,
	PinOff,
} from 'lucide-react'
import { Separator } from '$lib/components/ui/separator'
import { useSidebar } from '$lib/hooks/useSidebar'
import { SidebarDialogs } from './sidebar/SidebarDialogs'
import { SidebarHeader } from './sidebar/SidebarHeader'
import { SidebarItem } from './sidebar/SidebarItem'
import { SortableSidebarItem } from './sidebar/SortableSidebarItem'
import { useState, useEffect } from 'react'
import { cn } from '$lib/utils'
import { Button } from '$lib/components/ui/button'
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

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (active.id !== over?.id) {
			logic.updateChatOrder(active.id as number, over?.id as number)
		}
	}

	const [toast, setToast] = useState<{
		type: 'success' | 'error'
		message: string
	} | null>(null)

	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 3000)
			return () => clearTimeout(timer)
		}
	}, [toast])

	const handleImportWrapper = async (file: File) => {
		try {
			await logic.importChat(file, onChatSelect)
			setToast({ type: 'success', message: 'Chat imported successfully.' })
		} catch (e) {
			setToast({ type: 'error', message: 'Failed to import chat.' })
		}
	}

	// lists for draggable sorting
	const systemChats = logic.chats?.filter(c => c.isSystem) || []
	const pinnedChats = logic.chats?.filter(c => c.isPinned && !c.isSystem) || []
	const regularChats =
		logic.chats?.filter(c => !c.isPinned && !c.isSystem) || []

	return (
		<>
			<div className='relative flex h-full w-[320px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground'>
				<SidebarHeader
					searchQuery={logic.searchQuery}
					onSearchChange={logic.setSearchQuery}
					onCreateChat={() => logic.createNewChat(onChatSelect)}
					onImportChat={handleImportWrapper}
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
					<div className='flex flex-col gap-1 p-2'>
						{systemChats.map(chat => (
							<SidebarItem
								key={chat.id}
								chat={chat}
								isActive={activeChatId === chat.id}
								onSelect={() => onChatSelect(chat.id!)}
								onPin={() => logic.togglePin(chat)}
								onEdit={() => logic.openEditDialog(chat)}
								onDelete={() => logic.setChatToDelete(chat)}
								isSelectionMode={logic.isSelectionMode}
								isSelected={logic.selectedChatIds.has(chat.id!)}
								onToggleSelection={() => logic.toggleChatSelection(chat.id!)}
								onStartSelection={() => logic.startSelectionMode(chat.id!)}
							/>
						))}

						{!logic.searchQuery && !logic.isSelectionMode ? (
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={pinnedChats.map(c => c.id!)}
									strategy={verticalListSortingStrategy}
								>
									{pinnedChats.map(chat => (
										<SortableSidebarItem
											key={chat.id}
											chat={chat}
											isActive={activeChatId === chat.id}
											onSelect={() => onChatSelect(chat.id!)}
											onPin={() => logic.togglePin(chat)}
											onEdit={() => logic.openEditDialog(chat)}
											onDelete={() => logic.setChatToDelete(chat)}
											isSelectionMode={logic.isSelectionMode}
											isSelected={logic.selectedChatIds.has(chat.id!)}
											onToggleSelection={() =>
												logic.toggleChatSelection(chat.id!)
											}
											onStartSelection={() =>
												logic.startSelectionMode(chat.id!)
											}
										/>
									))}
								</SortableContext>

								<SortableContext
									items={regularChats.map(c => c.id!)}
									strategy={verticalListSortingStrategy}
								>
									{regularChats.map(chat => (
										<SortableSidebarItem
											key={chat.id}
											chat={chat}
											isActive={activeChatId === chat.id}
											onSelect={() => onChatSelect(chat.id!)}
											onPin={() => logic.togglePin(chat)}
											onEdit={() => logic.openEditDialog(chat)}
											onDelete={() => logic.setChatToDelete(chat)}
											isSelectionMode={logic.isSelectionMode}
											isSelected={logic.selectedChatIds.has(chat.id!)}
											onToggleSelection={() =>
												logic.toggleChatSelection(chat.id!)
											}
											onStartSelection={() =>
												logic.startSelectionMode(chat.id!)
											}
										/>
									))}
								</SortableContext>
							</DndContext>
						) : (
							[...pinnedChats, ...regularChats].map(chat => (
								<SidebarItem
									key={chat.id}
									chat={chat}
									isActive={activeChatId === chat.id}
									onSelect={() => onChatSelect(chat.id!)}
									onPin={() => logic.togglePin(chat)}
									onEdit={() => logic.openEditDialog(chat)}
									onDelete={() => logic.setChatToDelete(chat)}
									isSelectionMode={logic.isSelectionMode}
									isSelected={logic.selectedChatIds.has(chat.id!)}
									onToggleSelection={() => logic.toggleChatSelection(chat.id!)}
									onStartSelection={() => logic.startSelectionMode(chat.id!)}
								/>
							))
						)}
						{logic.chats?.length === 0 && (
							<div className='flex flex-col items-center justify-center py-10 text-center text-muted-foreground'>
								<MessageSquare className='mb-2 h-10 w-10 opacity-20' />
								<p className='text-sm'>No notes</p>
							</div>
						)}
					</div>

					{logic.isSelectionMode && logic.selectedChatIds.size > 0 && (
						<div className='absolute bottom-4 left-4 right-4 bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-xl shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300 z-40'>
							<span className='text-xs font-semibold pl-2'>
								{logic.selectedChatIds.size} selected
							</span>
							<div className='flex items-center gap-1'>
								<Button
									size='icon'
									variant='ghost'
									className='h-8 w-8 hover:bg-sidebar-foreground/20 text-sidebar-primary-foreground'
									onClick={logic.batchPin}
									title='Pin Selected'
								>
									<Pin className='h-4 w-4' />
								</Button>
								<Button
									size='icon'
									variant='ghost'
									className='h-8 w-8 hover:bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
									onClick={logic.batchUnpin}
									title='Unpin Selected'
								>
									<PinOff className='h-4 w-4' />
								</Button>
								<div className='w-px h-4 bg-sidebar-primary-foreground/20 mx-1'></div>
								<Button
									size='icon'
									variant='ghost'
									className='h-8 w-8 hover:bg-red-500/20 text-sidebar-primary-foreground hover:text-white'
									onClick={() => logic.setShowBatchDeleteConfirm(true)}
									title='Delete Selected'
								>
									<Trash2 className='h-4 w-4' />
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>

			<SidebarDialogs
				chatToEdit={logic.chatToEdit}
				chatToDelete={logic.chatToDelete}
				newTitle={logic.newTitle}
				onNewTitleChange={logic.setNewTitle}
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
		</>
	)
}
