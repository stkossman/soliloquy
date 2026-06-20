import { ArrowDown } from 'lucide-react'
import { useCallback } from 'react'
import { Button } from '$lib/components/ui/button'
import { useKeyboardShortcuts } from '$lib/hooks/chat/useKeyboardShortcuts'
import { useChatWindow } from '$lib/hooks/useChatWindow'
import { ChatHeader } from './chat/ChatHeader'
import { ChatInput } from './chat/ChatInput'
import { ChatSearchToolbar } from './chat/ChatSearchToolbar'
import {
	getActiveSearchId,
	getMessagesForChatView,
} from './chat/chatWindowState'
import { MessageList } from './chat/MessageList'
import { PinnedBar } from './chat/PinnedBar'

interface ChatWindowProps {
	activeChatId: number
}

export function ChatWindow({ activeChatId }: ChatWindowProps) {
	const logic = useChatWindow(activeChatId)

	const openSearch = useCallback(() => {
		logic.setIsSearchOpen(true)
	}, [logic.setIsSearchOpen])

	useKeyboardShortcuts({ onOpenSearch: openSearch })

	const showPinnedList = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation()
			logic.setIsPinnedView(true)
		},
		[logic.setIsPinnedView],
	)

	const closeSearch = useCallback(() => {
		logic.setIsSearchOpen(false)
	}, [logic.setIsSearchOpen])

	if (!logic.chat) return <ChatWindowLoading />

	const messagesToRender = getMessagesForChatView({
		isPinnedView: logic.isPinnedView,
		pinnedMessages: logic.pinnedMessages,
		allMessages: logic.allMessages,
	})
	const activeSearchId = getActiveSearchId(
		logic.searchResults,
		logic.currentMatchIndex,
	)

	return (
		<div className='flex h-full flex-col w-full'>
			<ChatHeader
				chat={logic.chat}
				isPinnedView={logic.isPinnedView}
				pinnedCount={logic.pinnedMessages?.length || 0}
				onBackToNormal={() => logic.setIsPinnedView(false)}
				onClearHistory={() => logic.clearHistory()}
				onExport={format => logic.exportChat(format)}
				zoomLevel={logic.zoomLevel}
				onSetZoom={level => logic.setZoomLevel(level)}
				onToggleSearch={logic.toggleSearch}
			/>

			<ChatPinnedRegion
				isPinnedView={logic.isPinnedView}
				message={logic.currentDisplayPin}
				index={logic.activePinIndex}
				onClick={logic.handlePinClick}
				onViewList={showPinnedList}
			/>

			<ChatSearchRegion
				isOpen={logic.isSearchOpen}
				query={logic.searchQuery}
				onQueryChange={logic.setSearchQuery}
				currentMatch={logic.currentMatchIndex + 1}
				totalMatches={logic.searchResults.length}
				onNext={logic.nextMatch}
				onPrev={logic.prevMatch}
				onClose={closeSearch}
				onDateSelect={logic.jumpToDate}
			/>

			<div className='relative flex-1 min-h-0 flex flex-col'>
				<div className='flex-1 flex flex-col min-h-0'>
					<MessageList
						messages={messagesToRender}
						messageRefs={logic.messageRefs}
						scrollRef={logic.scrollViewportRef}
						onDelete={logic.deleteMessage}
						onPin={logic.pinMessage}
						onEdit={logic.startEditing}
						onScroll={logic.handleScroll}
						activeSearchId={activeSearchId}
						zoomLevel={logic.zoomLevel}
					/>
				</div>

				<ScrollToBottomButton
					isVisible={logic.showScrollToBottom}
					onClick={logic.scrollToBottom}
				/>
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

function ChatWindowLoading() {
	return (
		<div className='flex h-full items-center justify-center'>Loading...</div>
	)
}

interface ChatPinnedRegionProps extends React.ComponentProps<typeof PinnedBar> {
	isPinnedView: boolean
}

function ChatPinnedRegion({ isPinnedView, ...props }: ChatPinnedRegionProps) {
	if (isPinnedView) return null
	return <PinnedBar {...props} />
}

interface ChatSearchRegionProps
	extends React.ComponentProps<typeof ChatSearchToolbar> {
	isOpen: boolean
}

function ChatSearchRegion({ isOpen, ...props }: ChatSearchRegionProps) {
	if (!isOpen) return null
	return <ChatSearchToolbar {...props} />
}

function ScrollToBottomButton({
	isVisible,
	onClick,
}: {
	isVisible: boolean
	onClick: () => void
}) {
	if (!isVisible) return null

	return (
		<Button
			size='icon'
			className='absolute bottom-4 right-4 rounded-full shadow-md bg-secondary/80 hover:bg-secondary animate-in zoom-in duration-200 z-20 text-foreground'
			onClick={onClick}
		>
			<ArrowDown className='h-5 w-5' />
		</Button>
	)
}
