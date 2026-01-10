import { useChatWindow } from '$lib/hooks/useChatWindow'
import { ChatHeader } from './chat/ChatHeader'
import { ChatInput } from './chat/ChatInput'
import { MessageList } from './chat/MessageList'
import { PinnedBar } from './chat/PinnedBar'
import { Button } from '$lib/components/ui/button'
import { ArrowDown } from 'lucide-react'

interface ChatWindowProps {
	activeChatId: number
}

export function ChatWindow({ activeChatId }: ChatWindowProps) {
	const logic = useChatWindow(activeChatId)

	if (!logic.chat)
		return (
			<div className='flex h-full items-center justify-center'>Loading...</div>
		)

	const messagesToRender = logic.isPinnedView
		? logic.pinnedMessages
		: logic.allMessages

	return (
		<div className='flex h-full flex-col'>
			<ChatHeader
				chat={logic.chat}
				isPinnedView={logic.isPinnedView}
				pinnedCount={logic.pinnedMessages?.length || 0}
				onBackToNormal={() => logic.setIsPinnedView(false)}
				onClearHistory={() => logic.clearHistory()}
				onExport={format => logic.exportChat(format)}
			/>

			{!logic.isPinnedView && (
				<PinnedBar
					message={logic.currentDisplayPin}
					index={logic.activePinIndex}
					onClick={logic.handlePinClick}
					onViewList={e => {
						e.stopPropagation()
						logic.setIsPinnedView(true)
					}}
				/>
			)}

			<div className='relative flex-1 min-h-0 flex flex-col'>
				<MessageList
					messages={messagesToRender}
					messageRefs={logic.messageRefs}
					scrollRef={logic.scrollViewportRef}
					onDelete={logic.deleteMessage}
					onPin={logic.pinMessage}
					onEdit={logic.startEditing}
					onScroll={logic.handleScroll}
				/>

				{logic.showScrollToBottom && (
					<Button
						size='icon'
						className='absolute bottom-4 right-4 rounded-full shadow-md bg-secondary/80 hover:bg-secondary animate-in zoom-in duration-200 z-20 text-foreground'
						onClick={logic.scrollToBottom}
					>
						<ArrowDown className='h-5 w-5' />
					</Button>
				)}
			</div>

			<ChatInput
				value={logic.inputValue}
				onChange={logic.setInputValue}
				onSend={logic.handleSendOrUpdate}
				editingMessage={logic.editingMessage}
				onCancelEdit={logic.cancelEdit}
				isSystemChat={logic.chat.isSystem || false}
				isPinnedView={logic.isPinnedView}
				pinnedCount={logic.pinnedMessages?.length || 0}
				onUnpinAll={logic.unpinAllMessages}
			/>
		</div>
	)
}
