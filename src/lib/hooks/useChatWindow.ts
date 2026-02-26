import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { db } from '$lib/db'
import type { Message } from '$lib/types'
import { messageService } from '$lib/services/messageService'
import { chatService } from '$lib/services/chatService'
import { importExportService } from '$lib/services/importExportService'

export function useChatWindow(activeChatId: number) {
	const [inputValue, setInputValue] = useState('')
	const [editingMessage, setEditingMessage] = useState<Message | null>(null)
	const [isPinnedView, setIsPinnedView] = useState(false)
	const [activePinIndex, setActivePinIndex] = useState<number>(-1)
	const [showScrollToBottom, setShowScrollToBottom] = useState(false)

	const [zoomLevel, setZoomLevel] = useState(1)

	const [isSearchOpen, setIsSearchOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<number[]>([])
	const [currentMatchIndex, setCurrentMatchIndex] = useState(-1)

	const scrollViewportRef = useRef<HTMLDivElement>(null)
	const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

	const chat = useLiveQuery(() => db.chats.get(activeChatId), [activeChatId])

	const allMessages = useLiveQuery(
		() => db.messages.where('chatId').equals(activeChatId).sortBy('createdAt'),
		[activeChatId],
	)

	const pinnedMessages = useLiveQuery(
		() =>
			db.messages
				.where('chatId')
				.equals(activeChatId)
				.filter(msg => !!msg.isPinned)
				.toArray(),
		[activeChatId],
	)

	useEffect(() => {
		setIsPinnedView(false)
		setEditingMessage(null)
		setShowScrollToBottom(false)

		db.chats.get(activeChatId).then(c => {
			if (c?.draft) {
				setInputValue(c.draft)
			} else {
				setInputValue('')
			}
		})
	}, [activeChatId])

	useEffect(() => {
		const timer = setTimeout(() => {
			if (activeChatId && !editingMessage) {
				chatService.updateChat(activeChatId, { draft: inputValue })
			}
		}, 500)
		return () => clearTimeout(timer)
	}, [inputValue, activeChatId, editingMessage])

	useEffect(() => {
		const savedZoom = localStorage.getItem('soliloquy-zoom-level')
		if (savedZoom) {
			setZoomLevel(parseFloat(savedZoom))
		}
	}, [])

	const handleSetZoom = useCallback((level: number) => {
		setZoomLevel(level)
		localStorage.setItem('soliloquy-zoom-level', level.toString())
	}, [])

	useEffect(() => {
		setIsPinnedView(false)
		setEditingMessage(null)
		setInputValue('')
		setShowScrollToBottom(false)
	}, [activeChatId])

	useEffect(() => {
		if (pinnedMessages && pinnedMessages.length > 0) {
			if (activePinIndex === -1 || activePinIndex >= pinnedMessages.length) {
				setActivePinIndex(pinnedMessages.length - 1)
			}
		} else {
			setActivePinIndex(-1)
		}
	}, [pinnedMessages?.length, activeChatId])

	useEffect(() => {
		if (scrollViewportRef.current && !editingMessage && !isPinnedView) {
			scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight
		}
	}, [allMessages, editingMessage, isPinnedView, activeChatId])

	useEffect(() => {
		if (!searchQuery.trim() || !allMessages) {
			setSearchResults([])
			setCurrentMatchIndex(-1)
			return
		}

		const lowerQuery = searchQuery.toLowerCase()
		const matches = allMessages
			.filter(msg => msg.content.toLowerCase().includes(lowerQuery))
			.map(msg => msg.id!)

		setSearchResults(matches)

		if (matches.length > 0) {
			setCurrentMatchIndex(matches.length - 1)
		} else {
			setCurrentMatchIndex(-1)
		}
	}, [searchQuery, allMessages])

	useEffect(() => {
		if (currentMatchIndex >= 0 && searchResults.length > 0) {
			const msgId = searchResults[currentMatchIndex]
			const el = messageRefs.current.get(msgId)

			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' })
			}
		}
	}, [currentMatchIndex, searchResults])

	const toggleSearch = useCallback(() => {
		setIsSearchOpen(prev => {
			if (prev) {
				setSearchQuery('')
			}
			return !prev
		})
	}, [])

	const nextMatch = useCallback(() => {
		if (searchResults.length === 0) return
		setCurrentMatchIndex(prev =>
			prev < searchResults.length - 1 ? prev + 1 : 0,
		)
	}, [searchResults])

	const prevMatch = useCallback(() => {
		if (searchResults.length === 0) return
		setCurrentMatchIndex(prev =>
			prev > 0 ? prev - 1 : searchResults.length - 1,
		)
	}, [searchResults])

	const jumpToDate = useCallback(
		(date: Date) => {
			if (!allMessages) return

			const targetTime = new Date(date).setHours(0, 0, 0, 0)

			const targetMsg = allMessages.find(msg => {
				const msgTime = new Date(msg.createdAt).setHours(0, 0, 0, 0)
				return msgTime >= targetTime
			})

			if (targetMsg && targetMsg.id) {
				const el = messageRefs.current.get(targetMsg.id)
				if (el) {
					el.scrollIntoView({ behavior: 'smooth', block: 'center' })
					el.classList.add('ring-2', 'ring-primary', 'bg-primary/5')
					setTimeout(
						() => el.classList.remove('ring-2', 'ring-primary', 'bg-primary/5'),
						2000,
					)
				}
			}
		},
		[allMessages],
	)

	const handlePinClick = useCallback(() => {
		if (!pinnedMessages || activePinIndex === -1) return
		const targetMsg = pinnedMessages[activePinIndex]
		const el = messageRefs.current.get(targetMsg.id!)

		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'center' })
			el.classList.add('bg-primary/10', 'ring-2', 'ring-primary/20')
			setTimeout(
				() => el.classList.remove('bg-primary/10', 'ring-2', 'ring-primary/20'),
				1000,
			)
		}

		setActivePinIndex(prev => {
			const next = prev - 1
			return next < 0 ? pinnedMessages.length - 1 : next
		})
	}, [pinnedMessages, activePinIndex])

	const handleSendOrUpdate = useCallback(async () => {
		if (!inputValue.trim()) return
		const text = inputValue.trim()
		if (editingMessage) {
			await messageService.updateMessage(editingMessage, text)
			setEditingMessage(null)
			setInputValue('')
		} else {
			await messageService.sendMessage(activeChatId, text)
			setInputValue('')
		}
	}, [inputValue, editingMessage, activeChatId])

	const deleteMessage = useCallback(
		async (id: number) => {
			await messageService.deleteMessage(id, activeChatId)
		},
		[activeChatId],
	)

	const pinMessage = useCallback(async (msg: Message) => {
		await messageService.togglePin(msg.id!, !msg.isPinned)
	}, [])

	const unpinAllMessages = useCallback(async () => {
		await messageService.unpinAll(activeChatId)
		setIsPinnedView(false)
	}, [activeChatId])

	const startEditing = useCallback((msg: Message) => {
		setIsPinnedView(false)
		setEditingMessage(msg)
		setInputValue(msg.content)
	}, [])

	const cancelEdit = useCallback(() => {
		setEditingMessage(null)
		setInputValue('')
	}, [])

	const currentDisplayPin = useMemo(
		() =>
			pinnedMessages && activePinIndex !== -1
				? pinnedMessages[activePinIndex]
				: null,
		[pinnedMessages, activePinIndex],
	)

	const clearHistory = useCallback(async () => {
		await messageService.clearHistory(activeChatId)
		setIsPinnedView(false)
	}, [activeChatId])

	const exportChat = useCallback(
		async (format: 'json' | 'md') => {
			await importExportService.exportChat(activeChatId, format)
		},
		[activeChatId],
	)

	const handleScroll = useCallback(() => {
		if (!scrollViewportRef.current) return

		const { scrollTop, scrollHeight, clientHeight } = scrollViewportRef.current

		const isDistanceFromBottom = scrollHeight - scrollTop - clientHeight > 100
		setShowScrollToBottom(isDistanceFromBottom)
	}, [])

	const scrollToBottom = useCallback(() => {
		scrollViewportRef.current?.scrollTo({
			top: scrollViewportRef.current.scrollHeight,
			behavior: 'smooth',
		})
		setShowScrollToBottom(false)
	}, [])

	return {
		// State
		inputValue,
		setInputValue,
		editingMessage,
		isPinnedView,
		setIsPinnedView,
		activePinIndex,
		// Data
		chat,
		allMessages,
		pinnedMessages,
		currentDisplayPin,
		// Refs
		scrollViewportRef,
		messageRefs,
		// Methods
		handlePinClick,
		handleSendOrUpdate,
		deleteMessage,
		pinMessage,
		unpinAllMessages,
		startEditing,
		cancelEdit,
		clearHistory,
		exportChat,
		// Scroll
		handleScroll,
		scrollToBottom,
		showScrollToBottom,
		// Zoom
		zoomLevel,
		setZoomLevel: handleSetZoom,
		// Search
		isSearchOpen,
		toggleSearch,
		setIsSearchOpen,
		searchQuery,
		setSearchQuery,
		searchResults,
		currentMatchIndex,
		nextMatch,
		prevMatch,
		jumpToDate,
	}
}
