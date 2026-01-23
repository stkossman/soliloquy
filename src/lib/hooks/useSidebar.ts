import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useState } from 'react'
import { db } from '$lib/db'
import type { Chat, Message } from '$lib/types'

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
			if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
			return b.lastModified.getTime() - a.lastModified.getTime()
		})
	}, [searchQuery])

	const createNewChat = useCallback(async (onSelect: (id: number) => void) => {
		const id = await db.chats.add({
			title: 'New Note',
			isPinned: false,
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
				console.error('Import failed:', error)
				throw error
			}
		},
		[],
	)

	const togglePin = useCallback(async (chat: Chat) => {
		await db.chats.update(chat.id!, { isPinned: !chat.isPinned })
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

	const toggleSelectionMode = useCallback(() => {
		setIsSelectionMode(prev => {
			if (prev) {
				setSelectedChatIds(new Set())
			}
			return !prev
		})
	}, [])

	const toggleChatSelection = useCallback((id: number) => {
		setSelectedChatIds(prev => {
			const newSet = new Set(prev)
			if (newSet.has(id)) {
				newSet.delete(id)
			} else {
				newSet.add(id)
			}
			return newSet
		})
	}, [])

	const batchPin = useCallback(async () => {
		const ids = Array.from(selectedChatIds)
		if (ids.length === 0) return

		await db.chats.where('id').anyOf(ids).modify({ isPinned: true })
		setIsSelectionMode(false)
		setSelectedChatIds(new Set())
	}, [selectedChatIds])

	const batchUnpin = useCallback(async () => {
		const ids = Array.from(selectedChatIds)
		if (ids.length === 0) return

		await db.chats.where('id').anyOf(ids).modify({ isPinned: false })
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
				await db.messages.where('chatId').anyOf(ids).delete()
				await db.chats.where('id').anyOf(ids).delete()
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
		toggleSelectionMode,
		toggleChatSelection,
		isSelectionMode,
		selectedChatIds,
		batchPin,
		batchUnpin,
		batchDelete,
		showBatchDeleteConfirm,
		setShowBatchDeleteConfirm,
	}
}
