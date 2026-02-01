import { Info, Pencil, Pin, PinOff, Trash2, CheckSquare } from 'lucide-react'
import { cn, formatChatDate, stripMarkdown } from '@/lib/utils'
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '$lib/components/ui/context-menu'
import type { Chat } from '$lib/types'
import { Checkbox } from '$lib/components/ui/checkbox'

interface SidebarItemProps {
	chat: Chat
	isActive: boolean
	onSelect: () => void
	onPin: () => void
	onEdit: () => void
	onDelete: () => void
	isSelectionMode: boolean
	isSelected: boolean
	onToggleSelection: () => void
	onStartSelection: () => void
}

export function SidebarItem({
	chat,
	isActive,
	onSelect,
	onPin,
	onEdit,
	onDelete,
	isSelectionMode,
	isSelected,
	onToggleSelection,
	onStartSelection,
}: SidebarItemProps) {
	const handleClick = (e: React.MouseEvent) => {
		if (isSelectionMode) {
			e.preventDefault()
			if (!chat.isSystem) {
				onToggleSelection()
			}
		} else {
			onSelect()
		}
	}

	const hasDraft = chat.draft && chat.draft.trim().length > 0

	const Content = (
		<div
			onClick={handleClick}
			className={cn(
				'flex items-center gap-3 rounded-lg p-3 text-left text-sm transition-all hover:bg-sidebar-accent w-full cursor-pointer',
				isActive &&
					!isSelectionMode &&
					'bg-sidebar-accent text-sidebar-accent-foreground',
				isSelected &&
					isSelectionMode &&
					'bg-sidebar-accent/70 ring-1 ring-sidebar-ring/20',
				isSelectionMode && chat.isSystem && 'opacity-50 cursor-not-allowed',
			)}
		>
			{isSelectionMode && (
				<div className='animate-in slide-in-from-left-2 fade-in duration-200'>
					{!chat.isSystem ? (
						<Checkbox
							checked={isSelected}
							onCheckedChange={() => onToggleSelection()}
							onClick={e => e.stopPropagation()}
							className='border-sidebar-primary data-[state=checked]:bg-sidebar-primary data-[state=checked]:text-sidebar-primary-foreground'
						/>
					) : (
						<div className='h-4 w-4' />
					)}
				</div>
			)}

			<div className='flex flex-col flex-1 gap-1 overflow-hidden'>
				<div className='flex w-full items-center justify-between'>
					<span className='font-semibold truncate flex items-center gap-2'>
						{chat.isSystem && <Info className='h-3.5 w-3.5 text-blue-400' />}
						{chat.title}
					</span>
					<span
						className={cn(
							'text-xs tabular-nums',
							hasDraft
								? 'text-destructive font-medium'
								: 'text-muted-foreground',
						)}
					>
						{formatChatDate(chat.lastModified)}
					</span>
				</div>

				<div className='flex w-full items-center justify-between text-muted-foreground'>
					<span className='truncate text-xs h-4 block flex-1 pr-2'>
						{hasDraft ? (
							<>
								<span className='text-destructive font-medium mr-1'>
									Draft:
								</span>
								<span className='text-foreground/80'>
									{stripMarkdown(chat.draft || '')}
								</span>
							</>
						) : (
							stripMarkdown(chat.previewText || '') || (
								<span className='opacity-50 italic'>No messages</span>
							)
						)}
					</span>
					{chat.isPinned && <Pin className='h-3 w-3 rotate-45 shrink-0' />}
				</div>
			</div>
		</div>
	)

	if (isSelectionMode) {
		return Content
	}

	return (
		<ContextMenu>
			<ContextMenuTrigger disabled={chat.isSystem}>
				{Content}
			</ContextMenuTrigger>
			{!chat.isSystem && (
				<ContextMenuContent className='w-48'>
					<ContextMenuItem onClick={onStartSelection}>
						<CheckSquare className='mr-2 h-4 w-4' /> Select Multiple
					</ContextMenuItem>
					<ContextMenuSeparator />

					<ContextMenuItem onClick={onPin}>
						{chat.isPinned ? (
							<>
								<PinOff className='mr-2 h-4 w-4' /> Unpin
							</>
						) : (
							<>
								<Pin className='mr-2 h-4 w-4' /> Pin
							</>
						)}
					</ContextMenuItem>
					<ContextMenuItem onClick={onEdit}>
						<Pencil className='mr-2 h-4 w-4' /> Rename
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem
						className='text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/30'
						onClick={onDelete}
					>
						<Trash2 className='mr-2 h-4 w-4' /> Delete
					</ContextMenuItem>
				</ContextMenuContent>
			)}
		</ContextMenu>
	)
}
