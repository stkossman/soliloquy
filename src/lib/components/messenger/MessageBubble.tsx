import { type Message } from '$lib/db'
import { cn } from '@/lib/utils'
import { MarkdownRenderer } from '../shared/MarkdownRenderer'

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "$lib/components/ui/context-menu"
import { Pin, Pencil, Trash2, Copy, Check } from "lucide-react"
import { useState } from "react"

interface MessageBubbleProps {
	message: Message;
	onEdit: (msg: Message) => void;
	onDelete: (id: number) => void;
	onPin: (msg: Message) => void;
}

export function MessageBubble({ message, onEdit, onDelete, onPin }: MessageBubbleProps) {
	const [copied, setCopied] = useState(false);

	const timeStr = message.createdAt.toLocaleTimeString('uk-UA', {
		hour: '2-digit',
		minute: '2-digit',
	});

	const handleCopy = async () => {
		await navigator.clipboard.writeText(message.content);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<div className='flex w-full justify-end mb-2 group'>
					<div
						className={cn(
							'relative max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm transition-all',
							'bg-primary text-primary-foreground',
							'rounded-br-none',
							message.isPinned && 'border-2 border-accent'
						)}
					>
						{message.isPinned && (
							<div className='flex items-center gap-1 text-[10px] opacity-70 mb-1 border-b border-primary-foreground/20 pb-1'>
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
				<ContextMenuItem className='text-destructive focus:text-destructive' onClick={() => onDelete(message.id!)}>
					<Trash2 className='mr-2 h-4 w-4' /> Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}
