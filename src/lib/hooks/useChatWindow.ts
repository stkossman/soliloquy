import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState } from 'react'
import { db, type Message } from '$lib/db'

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
	}, [allMessages?.length, activeChatId, isPinnedView])

	const handlePinClick = () => {
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
	}

	const handleSendOrUpdate = async () => {
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
	}

	const deleteMessage = async (id: number) => {
		await db.messages.delete(id)
		if (isPinnedView && pinnedMessages && pinnedMessages.length <= 1) {
			setIsPinnedView(false)
		}
		const lastMsg = await db.messages
			.where('chatId')
			.equals(activeChatId)
			.last()
		await db.chats.update(activeChatId, {
			previewText: lastMsg ? lastMsg.content : '',
		})
	}

	const pinMessage = async (msg: Message) =>
		db.messages.update(msg.id!, { isPinned: !msg.isPinned })

	const unpinAllMessages = async () => {
		if (!pinnedMessages) return
		await db.transaction('rw', db.messages, async () => {
			for (const msg of pinnedMessages) {
				await db.messages.update(msg.id!, { isPinned: false })
			}
		})
		setIsPinnedView(false)
	}

	const startEditing = (msg: Message) => {
		if (isPinnedView) setIsPinnedView(false)
		setEditingMessage(msg)
		setInputValue(msg.content)
	}

	const cancelEdit = () => {
		setEditingMessage(null)
		setInputValue('')
	}

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
		currentDisplayPin:
			pinnedMessages && activePinIndex !== -1
				? pinnedMessages[activePinIndex]
				: null,
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
