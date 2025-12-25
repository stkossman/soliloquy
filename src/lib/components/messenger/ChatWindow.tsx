import { useChatWindow } from '$lib/hooks/useChatWindow'
import { ChatHeader } from './chat/ChatHeader'
import { ChatInput } from './chat/ChatInput'
import { MessageList } from './chat/MessageList'
import { PinnedBar } from './chat/PinnedBar'

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

			<MessageList
				messages={messagesToRender}
				messageRefs={logic.messageRefs}
				scrollRef={logic.scrollViewportRef}
				onDelete={logic.deleteMessage}
				onPin={logic.pinMessage}
				onEdit={logic.startEditing}
			/>

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
