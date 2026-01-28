import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useState, useEffect } from 'react'
import { db } from '$lib/db'
import type { Chat, Message } from '$lib/types'
import { arrayMove } from '@dnd-kit/sortable'

export function useSidebar() {
	const [searchQuery, setSearchQuery] = useState('')
	const [chatToEdit, setChatToEdit] = useState<Chat | null>(null)
	const [chatToDelete, setChatToDelete] = useState<Chat | null>(null)
	const [newTitle, setNewTitle] = useState('')

	const [isSelectionMode, setIsSelectionMode] = useState(false)
	const [selectedChatIds, setSelectedChatIds] = useState<Set<number>>(new Set())
	const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false)

	const chats = useLiveQuery(async () => {
		let allChats = await db.chats.toArray()
		if (searchQuery.trim()) {
			const lowerQuery = searchQuery.toLowerCase()
			allChats = allChats.filter(chat =>
				chat.title.toLowerCase().includes(lowerQuery),
			)
		}

		return allChats.sort((a, b) => {
			if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1
			if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1

			const orderA =
				typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER
			const orderB =
				typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER

			if (orderA !== orderB) return orderA - orderB

			return b.lastModified.getTime() - a.lastModified.getTime()
		})
	}, [searchQuery])

	// Initializes order numbers for chats that don't have an order, ensuring proper sorting and display functionality
	// Separates chats into pinned and regular categories, assigning each its own sequence within its category
	useEffect(() => {
		if (!chats) return

		const missingOrder = chats.filter(
			c => !c.isSystem && typeof c.order !== 'number',
		)

		if (missingOrder.length > 0) {
			const pinned = chats.filter(c => c.isPinned && !c.isSystem)
			const regular = chats.filter(c => !c.isPinned && !c.isSystem)

			db.transaction('rw', db.chats, async () => {
				for (let i = 0; i < pinned.length; i++) {
					if (typeof pinned[i].order !== 'number') {
						await db.chats.update(pinned[i].id!, { order: i })
					}
				}
				for (let i = 0; i < regular.length; i++) {
					if (typeof regular[i].order !== 'number') {
						await db.chats.update(regular[i].id!, { order: i })
					}
				}
			})
		}
	}, [chats?.length])

	const createNewChat = useCallback(async (onSelect: (id: number) => void) => {
		const regularChats = await db.chats
			.filter(c => !c.isPinned && !c.isSystem)
			.toArray()
		const minOrder = regularChats.reduce(
			(min, c) => Math.min(min, c.order || 0),
			0,
		)

		const id = await db.chats.add({
			title: 'New Note',
			isPinned: false,
			order: minOrder - 1,
			createdAt: new Date(),
			lastModified: new Date(),
		})
		onSelect(id as number)
	}, [])

	const importChat = useCallback(
		async (file: File, onSelect: (id: number) => void) => {
			const text = await file.text()
			const extension = file.name.split('.').pop()?.toLowerCase()

			try {
				if (extension === 'json') {
					const data = JSON.parse(text)
					if (!data.chat || !data.messages)
						throw new Error('Invalid JSON format')

					const chatId = await db.chats.add({
						title: data.chat.title + ' (Imported)',
						isPinned: false,
						createdAt: new Date(data.chat.createdAt),
						lastModified: new Date(),
						previewText: data.chat.previewText,
					})

					const messagesToAdd = data.messages.map((msg: any) => ({
						chatId: chatId,
						content: msg.content,
						createdAt: new Date(msg.createdAt),
						isEdited: msg.isEdited,
						isPinned: msg.isPinned,
					}))

					await db.messages.bulkAdd(messagesToAdd)
					onSelect(chatId as number)
					return
				} else if (extension === 'md') {
					const lines = text.split('\n')
					const titleMatch = lines[0].match(/^# (.*)/)
					const title = titleMatch
						? titleMatch[1]
						: file.name.replace('.md', '')

					const chatId = await db.chats.add({
						title: title + ' (Imported)',
						isPinned: false,
						createdAt: new Date(),
						lastModified: new Date(),
					})

					const rawMessages = text.split('\n---\n\n')
					const messagesToAdd: Message[] = []

					const contentChunks = rawMessages.slice(1)

					for (const chunk of contentChunks) {
						if (!chunk.trim()) continue

						const dateMatch = chunk.match(/^### \[(.*?)\]/)
						const createdAt = dateMatch ? new Date(dateMatch[1]) : new Date()

						const isPinned = chunk.includes('> 📌 Pinned')

						let content = chunk
							.replace(/^### \[.*?\]\n/, '')
							.replace(/> 📌 Pinned\n\n?/, '')
							.trim()

						if (content) {
							messagesToAdd.push({
								chatId: chatId as number,
								content,
								createdAt,
								isEdited: false,
								isPinned,
							})
						}
					}

					if (messagesToAdd.length > 0) {
						await db.messages.bulkAdd(messagesToAdd)
						await db.chats.update(chatId as number, {
							previewText: messagesToAdd[messagesToAdd.length - 1].content,
						})
					}
					onSelect(chatId as number)
					return
				}
				throw new Error('Unsupported file format')
			} catch (error) {
				throw error
			}
		},
		[],
	)

	const togglePin = useCallback(async (chat: Chat) => {
		if (!chat.isPinned) {
			const lastPinned = await db.chats.where('isPinned').equals(1).last()
			const allPinned = await db.chats.filter(c => !!c.isPinned).toArray()
			const maxOrder = allPinned.reduce(
				(max, c) => Math.max(max, c.order || 0),
				-1,
			)

			await db.chats.update(chat.id!, { isPinned: true, order: maxOrder + 1 })
		} else {
			await db.chats.update(chat.id!, { isPinned: false })
		}
	}, [])

	const saveChatTitle = useCallback(async () => {
		if (chatToEdit && newTitle.trim()) {
			await db.chats.update(chatToEdit.id!, { title: newTitle.trim() })
			setChatToEdit(null)
		}
	}, [chatToEdit, newTitle])

	const deleteChat = useCallback(
		async (
			activeChatId: number | null,
			onSelect: (id: number | null) => void,
		) => {
			if (chatToDelete) {
				await db.transaction('rw', db.chats, db.messages, async () => {
					await db.messages.where({ chatId: chatToDelete.id! }).delete()
					await db.chats.delete(chatToDelete.id!)
				})
				if (activeChatId === chatToDelete.id) {
					onSelect(null)
				}
				setChatToDelete(null)
			}
		},
		[chatToDelete],
	)

	const openEditDialog = useCallback((chat: Chat) => {
		setChatToEdit(chat)
		setNewTitle(chat.title)
	}, [])

	const startSelectionMode = useCallback((initialChatId: number) => {
		setIsSelectionMode(true)
		setSelectedChatIds(new Set([initialChatId]))
	}, [])

	const toggleChatSelection = useCallback((id: number) => {
		setSelectedChatIds(prev => {
			const newSet = new Set(prev)
			if (newSet.has(id)) {
				newSet.delete(id)
			} else {
				newSet.add(id)
			}

			if (newSet.size === 0) {
				setIsSelectionMode(false)
			}

			return newSet
		})
	}, [])

	const getSafeSelectedIds = async (ids: number[]) => {
		const chatsToCheck = await db.chats.where('id').anyOf(ids).toArray()
		return chatsToCheck.filter(c => !c.isSystem).map(c => c.id!)
	}

	const batchPin = useCallback(async () => {
		const ids = Array.from(selectedChatIds)
		if (ids.length === 0) return

		const safeIds = await getSafeSelectedIds(ids)

		await db.chats.where('id').anyOf(safeIds).modify({ isPinned: true })
		setIsSelectionMode(false)
		setSelectedChatIds(new Set())
	}, [selectedChatIds])

	const batchUnpin = useCallback(async () => {
		const ids = Array.from(selectedChatIds)
		if (ids.length === 0) return

		const safeIds = await getSafeSelectedIds(ids)

		await db.chats.where('id').anyOf(safeIds).modify({ isPinned: false })
		setIsSelectionMode(false)
		setSelectedChatIds(new Set())
	}, [selectedChatIds])

	const batchDelete = useCallback(
		async (
			activeChatId: number | null,
			onSelect: (id: number | null) => void,
		) => {
			const ids = Array.from(selectedChatIds)
			if (ids.length === 0) return
			await db.transaction('rw', db.chats, db.messages, async () => {
				const chatsToDelete = await db.chats.where('id').anyOf(ids).toArray()
				const safeIds = chatsToDelete.filter(c => !c.isSystem).map(c => c.id!)
				if (safeIds.length > 0) {
					await db.messages.where('chatId').anyOf(safeIds).delete()
					await db.chats.where('id').anyOf(safeIds).delete()
				}
			})
			if (activeChatId && selectedChatIds.has(activeChatId)) {
				onSelect(null)
			}
			setShowBatchDeleteConfirm(false)
			setIsSelectionMode(false)
			setSelectedChatIds(new Set())
		},
		[selectedChatIds],
	)

	const updateChatOrder = useCallback(
		async (activeId: number, overId: number) => {
			const currentChats = await db.chats.toArray()

			const activeChat = currentChats.find(
				c => String(c.id) === String(activeId),
			)
			const overChat = currentChats.find(c => String(c.id) === String(overId))

			if (!activeChat || !overChat) return

			if (activeChat.isPinned !== overChat.isPinned) {
				return
			}

			const isPinnedGroup = activeChat.isPinned
			const groupChats = currentChats
				.filter(c => c.isPinned === isPinnedGroup && !c.isSystem)
				.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

			const oldIndex = groupChats.findIndex(
				c => String(c.id) === String(activeId),
			)
			const newIndex = groupChats.findIndex(
				c => String(c.id) === String(overId),
			)

			if (oldIndex !== -1 && newIndex !== -1) {
				const newOrder = arrayMove(groupChats, oldIndex, newIndex)

				await db.transaction('rw', db.chats, async () => {
					for (let i = 0; i < newOrder.length; i++) {
						await db.chats.update(newOrder[i].id!, { order: i })
					}
				})
			}
		},
		[],
	)

	return {
		chats,
		searchQuery,
		setSearchQuery,
		chatToEdit,
		setChatToEdit,
		chatToDelete,
		setChatToDelete,
		newTitle,
		setNewTitle,
		createNewChat,
		importChat,
		togglePin,
		saveChatTitle,
		deleteChat,
		openEditDialog,
		// selection
		startSelectionMode,
		toggleChatSelection,
		isSelectionMode,
		selectedChatIds,
		batchPin,
		batchUnpin,
		batchDelete,
		showBatchDeleteConfirm,
		setShowBatchDeleteConfirm,
		// order
		updateChatOrder,
	}
}
