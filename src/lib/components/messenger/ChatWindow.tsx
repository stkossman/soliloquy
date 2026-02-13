import { useChatWindow } from '$lib/hooks/useChatWindow'
import { ChatHeader } from './chat/ChatHeader'
import { ChatInput } from './chat/ChatInput'
import { MessageList } from './chat/MessageList'
import { PinnedBar } from './chat/PinnedBar'
import { Button } from '$lib/components/ui/button'
import { ArrowDown } from 'lucide-react'
import { ChatSearchToolbar } from './chat/ChatSearchToolbar'
import { useEffect } from 'react'

interface ChatWindowProps {
	activeChatId: number
}

export function ChatWindow({ activeChatId }: ChatWindowProps) {
	const logic = useChatWindow(activeChatId)

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
				e.preventDefault()
				logic.setIsSearchOpen(true)
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [])

	if (!logic.chat)
		return (
			<div className='flex h-full items-center justify-center'>Loading...</div>
		)

	const messagesToRender = logic.isPinnedView
		? logic.pinnedMessages
		: logic.allMessages

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

			{logic.isSearchOpen && (
				<ChatSearchToolbar
					query={logic.searchQuery}
					onQueryChange={logic.setSearchQuery}
					currentMatch={logic.currentMatchIndex + 1}
					totalMatches={logic.searchResults.length}
					onNext={logic.nextMatch}
					onPrev={logic.prevMatch}
					onClose={() => logic.setIsSearchOpen(false)}
					onDateSelect={logic.jumpToDate}
				/>
			)}

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
						activeSearchId={
							logic.searchResults.length > 0 && logic.currentMatchIndex >= 0
								? logic.searchResults[logic.currentMatchIndex]
								: null
						}
						zoomLevel={logic.zoomLevel}
					/>
				</div>

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
