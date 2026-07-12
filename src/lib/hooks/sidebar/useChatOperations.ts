import { useCallback, useState } from 'react'
import { chatService } from '$lib/services/chatService'
import { importExportService } from '$lib/services/importExportService'
import type { Chat } from '$lib/types'

interface UseChatOperationsParams {
	selectedChatIds: Set<number>
	clearSelection: () => void
	setShowBatchDeleteConfirm: (show: boolean) => void
}

export function useChatOperations({
	selectedChatIds,
	clearSelection,
	setShowBatchDeleteConfirm,
}: UseChatOperationsParams) {
	const [chatToEdit, setChatToEdit] = useState<Chat | null>(null)
	const [chatToDelete, setChatToDelete] = useState<Chat | null>(null)
	const [newTitle, setNewTitle] = useState('')
	const [newIcon, setNewIcon] = useState<string>('message')
	const [newColor, setNewColor] = useState<string>('#71717a')

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

	const exportWorkspaceBackup = useCallback(async () => {
		await importExportService.exportWorkspaceBackup()
	}, [])

	const importWorkspaceBackup = useCallback(async (file: File) => {
		return importExportService.importWorkspaceBackup(file)
	}, [])

	const togglePin = useCallback(async (chat: Chat) => {
		await chatService.togglePin(chat)
	}, [])

	const saveChatTitle = useCallback(async () => {
		const chatId = chatToEdit?.id

		if (typeof chatId === 'number' && newTitle.trim()) {
			await chatService.updateChat(chatId, {
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
			const chatId = chatToDelete?.id

			if (typeof chatId === 'number') {
				await chatService.deleteChatWithMessages(chatId)
				if (activeChatId === chatId) onSelect(null)
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

	const batchPin = useCallback(async () => {
		if (selectedChatIds.size === 0) return
		await chatService.batchPin(Array.from(selectedChatIds), true)
		clearSelection()
	}, [selectedChatIds, clearSelection])

	const batchUnpin = useCallback(async () => {
		if (selectedChatIds.size === 0) return
		await chatService.batchPin(Array.from(selectedChatIds), false)
		clearSelection()
	}, [selectedChatIds, clearSelection])

	const batchDelete = useCallback(
		async (
			activeChatId: number | null,
			onSelect: (id: number | null) => void,
		) => {
			if (selectedChatIds.size === 0) return
			await chatService.batchDelete(Array.from(selectedChatIds))
			if (activeChatId && selectedChatIds.has(activeChatId)) onSelect(null)
			setShowBatchDeleteConfirm(false)
			clearSelection()
		},
		[selectedChatIds, clearSelection, setShowBatchDeleteConfirm],
	)

	const updateChatOrder = useCallback(
		async (activeId: number, overId: number) => {
			await chatService.reorderChats(activeId, overId)
		},
		[],
	)

	return {
		chatToEdit,
		setChatToEdit,
		chatToDelete,
		setChatToDelete,
		newTitle,
		setNewTitle,
		createNewChat,
		importChat,
		exportWorkspaceBackup,
		importWorkspaceBackup,
		togglePin,
		saveChatTitle,
		deleteChat,
		openEditDialog,
		newIcon,
		setNewIcon,
		newColor,
		setNewColor,
		batchPin,
		batchUnpin,
		batchDelete,
		updateChatOrder,
	}
}
