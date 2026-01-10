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
}

export function MessageList({
	messages,
	messageRefs,
	scrollRef,
	onDelete,
	onPin,
	onEdit,
	onScroll,
}: MessageListProps) {
	return (
		<div
			className='flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth'
			ref={scrollRef}
			onScroll={onScroll}
		>
			{messages?.map(msg => (
				<div
					key={msg.id}
					ref={el => {
						if (el) messageRefs.current.set(msg.id!, el)
						else messageRefs.current.delete(msg.id!)
					}}
					className='transition-all duration-500 rounded-2xl'
				>
					<MessageBubble
						message={msg}
						onDelete={onDelete}
						onPin={onPin}
						onEdit={onEdit}
					/>
				</div>
			))}
		</div>
	)
}
