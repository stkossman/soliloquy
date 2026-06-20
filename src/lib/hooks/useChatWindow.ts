import { chatService } from '$lib/services/chatService'
import { importExportService } from '$lib/services/importExportService'
import { messageService } from '$lib/services/messageService'
import { useChatState } from '$lib/hooks/chat/useChatState'
import { useMessageSearch } from '$lib/hooks/chat/useMessageSearch'
import { usePinnedMessages } from '$lib/hooks/chat/usePinnedMessages'
import { useScrollBehavior } from '$lib/hooks/chat/useScrollBehavior'
import { useZoomControl } from '$lib/hooks/chat/useZoomControl'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useRef } from 'react'

export function useChatWindow(activeChatId: number) {
	const scrollViewportRef = useRef<HTMLDivElement>(null)
	const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
	const chat = useLiveQuery(
		() => chatService.getChat(activeChatId),
		[activeChatId],
	)
	const allMessages = useLiveQuery(
		() => messageService.getMessagesForChat(activeChatId),
		[activeChatId],
	)

	const p = usePinnedMessages({ activeChatId, messageRefs })
	const s = useChatState({
		activeChatId,
		onStartEditing: () => p.setIsPinnedView(false),
	})
	const c = useMessageSearch({ allMessages, messageRefs })
	const sc = useScrollBehavior({
		activeChatId,
		allMessages,
		isPinnedView: p.isPinnedView,
		isEditing: !!s.editingMessage,
		scrollViewportRef,
	})
	const z = useZoomControl()

	const handleSendOrUpdate = useCallback(async () => {
		if (!s.inputValue.trim()) return
		if (s.editingMessage) {
			await messageService.updateMessage(s.editingMessage, s.inputValue.trim())
			s.setEditingMessage(null)
			s.setInputValue('')
		} else {
			await messageService.sendMessage(activeChatId, s.inputValue.trim())
			s.setInputValue('')
		}
	}, [s.inputValue, s.editingMessage, s.setEditingMessage, activeChatId])

	return {
		inputValue: s.inputValue,
		setInputValue: s.setInputValue,
		editingMessage: s.editingMessage,
		isPinnedView: p.isPinnedView,
		setIsPinnedView: p.setIsPinnedView,
		activePinIndex: p.activePinIndex,
		chat,
		allMessages,
		pinnedMessages: p.pinnedMessages,
		currentDisplayPin: p.currentDisplayPin,
		scrollViewportRef,
		messageRefs,
		handlePinClick: p.handlePinClick,
		handleSendOrUpdate,
		deleteMessage: (id: number) =>
			messageService.deleteMessage(id, activeChatId),
		pinMessage: p.pinMessage,
		unpinAllMessages: p.unpinAllMessages,
		startEditing: s.startEditing,
		cancelEdit: s.cancelEdit,
		clearHistory: () => {
			messageService.clearHistory(activeChatId)
			p.setIsPinnedView(false)
		},
		exportChat: (fmt: 'json' | 'md') =>
			importExportService.exportChat(activeChatId, fmt),
		handleScroll: sc.handleScroll,
		scrollToBottom: sc.scrollToBottom,
		showScrollToBottom: sc.showScrollToBottom,
		zoomLevel: z.zoomLevel,
		setZoomLevel: z.setZoomLevel,
		isSearchOpen: c.isSearchOpen,
		toggleSearch: c.toggleSearch,
		setIsSearchOpen: c.setIsSearchOpen,
		searchQuery: c.searchQuery,
		setSearchQuery: c.setSearchQuery,
		searchResults: c.searchResults,
		currentMatchIndex: c.currentMatchIndex,
		nextMatch: c.nextMatch,
		prevMatch: c.prevMatch,
		jumpToDate: c.jumpToDate,
	}
}
