import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useState, useEffect } from 'react'
import { db } from '$lib/db'
import type { Chat } from '$lib/types'
import { chatService } from '$lib/services/chatService'
import { importExportService } from '$lib/services/importExportService'
//import { arrayMove } from '@dnd-kit/sortable'

export function useSidebar() {
	const [searchQuery, setSearchQuery] = useState('')
	const [chatToEdit, setChatToEdit] = useState<Chat | null>(null)
	const [chatToDelete, setChatToDelete] = useState<Chat | null>(null)
	const [newTitle, setNewTitle] = useState('')

	const [newIcon, setNewIcon] = useState<string>('message')
	const [newColor, setNewColor] = useState<string>('#71717a')

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
		chatService.fixMissingOrders()
	}, [chats?.length])

	const createNewChat = useCallback(async (onSelect: (id: number) => void) => {
		const id = await chatService.createChat()
		onSelect(id as number)
	}, [])

	const importChat = useCallback(
		async (file: File, onSelect: (id: number) => void) => {
			const id = await importExportService.importChat(file)
			onSelect(id)
		},
		[],
	)

	const togglePin = useCallback(async (chat: Chat) => {
		await chatService.togglePin(chat)
	}, [])

	const saveChatTitle = useCallback(async () => {
		if (chatToEdit && newTitle.trim()) {
			await chatService.updateChat(chatToEdit.id!, {
				title: newTitle.trim(),
				icon: newIcon,
				color: newColor,
			})
			setChatToEdit(null)
		}
	}, [chatToEdit, newTitle, newIcon, newColor])

	const deleteChat = useCallback(
		async (
			activeChatId: number | null,
			onSelect: (id: number | null) => void,
		) => {
			if (chatToDelete) {
				await chatService.deleteChatWithMessages(chatToDelete.id!)
				if (activeChatId === chatToDelete.id) onSelect(null)
				setChatToDelete(null)
			}
		},
		[chatToDelete],
	)

	const openEditDialog = useCallback((chat: Chat) => {
		setChatToEdit(chat)
		setNewTitle(chat.title)
		setNewIcon(chat.icon || 'message')
		setNewColor(chat.color || '#71717a')
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
		if (selectedChatIds.size === 0) return
		await chatService.batchPin(Array.from(selectedChatIds), true)
		setIsSelectionMode(false)
		setSelectedChatIds(new Set())
	}, [selectedChatIds])

	const batchUnpin = useCallback(async () => {
		if (selectedChatIds.size === 0) return
		await chatService.batchPin(Array.from(selectedChatIds), false)
		setIsSelectionMode(false)
		setSelectedChatIds(new Set())
	}, [selectedChatIds])

	const batchDelete = useCallback(
		async (
			activeChatId: number | null,
			onSelect: (id: number | null) => void,
		) => {
			if (selectedChatIds.size === 0) return
			await chatService.batchDelete(Array.from(selectedChatIds))
			if (activeChatId && selectedChatIds.has(activeChatId)) onSelect(null)
			setShowBatchDeleteConfirm(false)
			setIsSelectionMode(false)
			setSelectedChatIds(new Set())
		},
		[selectedChatIds],
	)

	const updateChatOrder = useCallback(
		async (activeId: number, overId: number) => {
			await chatService.reorderChats(activeId, overId)
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
		newIcon,
		setNewIcon,
		newColor,
		setNewColor,
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
