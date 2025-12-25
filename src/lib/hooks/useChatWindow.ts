import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import type { Message } from '$lib/types'
import { db } from '$lib/db'

export function useChatWindow(activeChatId: number) {
	const [inputValue, setInputValue] = useState('')
	const [editingMessage, setEditingMessage] = useState<Message | null>(null)
	const [isPinnedView, setIsPinnedView] = useState(false)
	const [activePinIndex, setActivePinIndex] = useState<number>(-1)

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
		setInputValue('')
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
	}
}
