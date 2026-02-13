import { Check, Copy, Pencil, Pin, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '$lib/components/ui/context-menu'
import type { Message } from '$lib/types'
import { MarkdownRenderer } from '../shared/MarkdownRenderer'

interface MessageBubbleProps {
	message: Message
	onEdit: (msg: Message) => void
	onDelete: (id: number) => void
	onPin: (msg: Message) => void
	isHighlighted?: boolean
}

export function MessageBubble({
	message,
	onEdit,
	onDelete,
	onPin,
	isHighlighted,
}: MessageBubbleProps) {
	const [copied, setCopied] = useState(false)
	const [isFlashing, setIsFlashing] = useState(false)

	useEffect(() => {
		if (isHighlighted) {
			setIsFlashing(true)
			const timer = setTimeout(() => setIsFlashing(false), 1000)
			return () => clearTimeout(timer)
		}
	}, [isHighlighted])

	const timeStr = message.createdAt.toLocaleTimeString('uk-UA', {
		hour: '2-digit',
		minute: '2-digit',
	})

	const handleCopy = async () => {
		await navigator.clipboard.writeText(message.content)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<div className='flex w-full justify-end mb-2 group'>
					<div
						className={cn(
							'relative max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm',
							'rounded-br-none',
							'transition-all duration-1000 ease-out',
							!isFlashing && 'bg-primary text-primary-foreground',
							message.isPinned && !isFlashing && 'border-2 border-accent',
							isFlashing &&
								'bg-chart-3 text-accent-foreground scale-[1.02] shadow-md duration-75',
						)}
					>
						{message.isPinned && (
							<div
								className={cn(
									'flex items-center gap-1 text-[10px] opacity-70 mb-1 border-b pb-1',
									isFlashing
										? 'border-accent-foreground/20'
										: 'border-primary-foreground/20',
								)}
							>
								<Pin className='h-3 w-3' />
								<span>Pinned</span>
							</div>
						)}

						<MarkdownRenderer content={message.content} />

						<div className='mt-1 flex items-center justify-end gap-1 opacity-70'>
							{message.isEdited && <span className='text-[10px]'>edited</span>}
							<span className='text-[10px] tabular-nums'>{timeStr}</span>
							{copied && <Check className='h-3 w-3 animate-in zoom-in' />}
						</div>
					</div>
				</div>
			</ContextMenuTrigger>

			<ContextMenuContent className='w-48'>
				<ContextMenuItem onClick={handleCopy}>
					<Copy className='mr-2 h-4 w-4' /> Copy
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onPin(message)}>
					<Pin className='mr-2 h-4 w-4' /> {message.isPinned ? 'Unpin' : 'Pin'}
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onEdit(message)}>
					<Pencil className='mr-2 h-4 w-4' /> Edit
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem
					className='text-destructive focus:text-destructive'
					onClick={() => onDelete(message.id!)}
				>
					<Trash2 className='mr-2 h-4 w-4' /> Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}
