import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useState } from 'react'
import { db } from '$lib/db'
import type { Chat } from '$lib/types'

export function useSidebar() {
	const [searchQuery, setSearchQuery] = useState('')
	const [chatToEdit, setChatToEdit] = useState<Chat | null>(null)
	const [chatToDelete, setChatToDelete] = useState<Chat | null>(null)
	const [newTitle, setNewTitle] = useState('')

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
		togglePin,
		saveChatTitle,
		deleteChat,
		openEditDialog,
	}
}
