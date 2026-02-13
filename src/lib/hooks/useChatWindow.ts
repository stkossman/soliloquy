import { useLiveQuery } from 'dexie-react-hooks'
import { saveAs } from 'file-saver'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { db } from '$lib/db'
import type { Message } from '$lib/types'
import { set } from 'astro:schema'

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
				db.chats.update(activeChatId, { draft: inputValue })
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
			scrollViewportRef.current.scrollTop =
				scrollViewportRef.current.scrollHeight
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
			await db.messages.update(editingMessage.id!, {
				content: text,
				isEdited: true,
			})
			const lastMsg = await db.messages
				.where('chatId')
				.equals(activeChatId)
				.last()
			if (lastMsg && lastMsg.id === editingMessage.id) {
				await db.chats.update(activeChatId, { previewText: text })
			}
			setEditingMessage(null)
			setInputValue('')
		} else {
			await db.transaction('rw', db.chats, db.messages, async () => {
				await db.messages.add({
					chatId: activeChatId,
					content: text,
					createdAt: new Date(),
					isEdited: false,
					isPinned: false,
				})
				await db.chats.update(activeChatId, {
					lastModified: new Date(),
					previewText: text,
					draft: '',
				})
			})
			setInputValue('')
		}
	}, [inputValue, editingMessage, activeChatId])

	const deleteMessage = useCallback(
		async (id: number) => {
			await db.messages.delete(id)

			const lastMsg = await db.messages
				.where('chatId')
				.equals(activeChatId)
				.last()
			await db.chats.update(activeChatId, {
				previewText: lastMsg ? lastMsg.content : '',
			})
		},
		[activeChatId],
	)

	const pinMessage = useCallback(async (msg: Message) => {
		await db.messages.update(msg.id!, { isPinned: !msg.isPinned })
	}, [])

	const unpinAllMessages = useCallback(async () => {
		if (!pinnedMessages) return
		await db.transaction('rw', db.messages, async () => {
			for (const msg of pinnedMessages) {
				await db.messages.update(msg.id!, { isPinned: false })
			}
		})
		setIsPinnedView(false)
	}, [pinnedMessages])

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
		await db.transaction('rw', db.messages, db.chats, async () => {
			await db.messages.where({ chatId: activeChatId }).delete()
			await db.chats.update(activeChatId, {
				previewText: '',
				lastModified: new Date(),
				draft: '',
			})
		})

		setIsPinnedView(false)
	}, [activeChatId])

	const exportChat = useCallback(
		async (format: 'json' | 'md') => {
			const messages = await db.messages
				.where('chatId')
				.equals(activeChatId)
				.sortBy('createdAt')

			const chatInfo = await db.chats.get(activeChatId)
			const title = chatInfo?.title || 'Unknown Chat'
			const dateStr = new Date().toISOString().split('T')[0]
			const fileName = `soliloquy_export_${title.replace(/\s+/g, '_')}_${dateStr}`

			if (format === 'json') {
				const data = JSON.stringify({ chat: chatInfo, messages }, null, 2)
				const blob = new Blob([data], { type: 'application/json' })

				const url = URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = `${fileName}.json`
				a.click()
				URL.revokeObjectURL(url)
			} else if (format === 'md') {
				let mdContent = `# ${title}\n\n`
				mdContent += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`

				messages.forEach(msg => {
					const time = msg.createdAt.toLocaleString()
					mdContent += `### [${time}]\n${msg.content}\n\n`
					if (msg.isPinned) mdContent += `> 📌 Pinned\n\n`
					mdContent += `---\n\n`
				})

				const blob = new Blob([mdContent], { type: 'text/markdown' })
				const url = URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = `${fileName}.md`
				a.click()
				URL.revokeObjectURL(url)
			}
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
