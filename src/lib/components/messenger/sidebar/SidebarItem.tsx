import { Info, Pencil, Pin, PinOff, Trash2 } from 'lucide-react'
import { cn, formatChatDate } from '@/lib/utils'
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '$lib/components/ui/context-menu'
import type { Chat } from '$lib/types'

interface SidebarItemProps {
	chat: Chat
	isActive: boolean
	onSelect: () => void
	onPin: () => void
	onEdit: () => void
	onDelete: () => void
}

export function SidebarItem({
	chat,
	isActive,
	onSelect,
	onPin,
	onEdit,
	onDelete,
}: SidebarItemProps) {
	return (
		<ContextMenu>
			<ContextMenuTrigger disabled={chat.isSystem}>
				<button
					type='button'
					className={cn(
						'flex flex-col items-start gap-1 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent w-full',
						isActive && 'bg-accent',
					)}
					onClick={onSelect}
				>
					<div className='flex w-full items-center justify-between'>
						<span className='font-semibold truncate w-[180px] flex items-center gap-2'>
							{chat.isSystem && <Info className='h-3.5 w-3.5 text-blue-400' />}
							{chat.title}
						</span>
						<span className='text-xs text-muted-foreground tabular-nums'>
							{formatChatDate(chat.lastModified)}
						</span>
					</div>

					<div className='flex w-full items-center justify-between text-muted-foreground'>
						<span className='truncate text-xs w-[200px] h-4'>
							{chat.previewText || (
								<span className='opacity-50 italic'>No messages</span>
							)}
						</span>
						{chat.isPinned && <Pin className='h-3 w-3 rotate-45' />}
					</div>
				</button>
			</ContextMenuTrigger>

			{!chat.isSystem && (
				<ContextMenuContent className='w-48'>
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
