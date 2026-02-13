import type { Message } from '$lib/types'
import { MessageBubble } from '../MessageBubble'

interface MessageListProps {
	messages: Message[] | undefined
	messageRefs: React.MutableRefObject<Map<number, HTMLDivElement>>
	scrollRef: React.RefObject<HTMLDivElement | null>
	onDelete: (id: number) => void
	onPin: (msg: Message) => void
	onEdit: (msg: Message) => void
	onScroll?: () => void
	activeSearchId?: number | null
	zoomLevel: number
}

export function MessageList({
	messages,
	messageRefs,
	scrollRef,
	onDelete,
	onPin,
	onEdit,
	onScroll,
	activeSearchId,
	zoomLevel,
}: MessageListProps) {
	return (
		<div
			className='flex-1 overflow-y-auto scroll-smooth'
			ref={scrollRef}
			onScroll={onScroll}
		>
			<div className='p-4 space-y-4 min-h-full' style={{ zoom: zoomLevel }}>
				{messages?.map(msg => (
					<div
						key={msg.id}
						ref={el => {
							if (el) messageRefs.current.set(msg.id!, el)
							else messageRefs.current.delete(msg.id!)
						}}
						className='transition-all duration-500 rounded-2xl scroll-m-20'
					>
						<MessageBubble
							message={msg}
							onDelete={onDelete}
							onPin={onPin}
							onEdit={onEdit}
							isHighlighted={activeSearchId === msg.id}
						/>
					</div>
				))}
			</div>
		</div>
	)
}
