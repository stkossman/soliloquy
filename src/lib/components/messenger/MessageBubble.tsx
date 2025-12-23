import { type Message } from '$lib/db'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
	message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
	const timeStr = message.createdAt.toLocaleTimeString('uk-UA', {
		hour: '2-digit',
		minute: '2-digit',
	})

	return (
		<div className='flex w-full justify-end mb-2'>
			<div
				className={cn(
					'relative max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm',
					'bg-primary text-primary-foreground',
					'rounded-br-none'
				)}
			>
				<p className='whitespace-pre-wrap leading-relaxed'>{message.content}</p>

				<div className='mt-1 flex items-center justify-end gap-1 opacity-70'>
					{message.isEdited && <span className='text-[10px]'>edited</span>}
					<span className='text-[10px] tabular-nums'>{timeStr}</span>
				</div>
			</div>
		</div>
	)
}
