import {
	useChatList,
	useChatOperations,
	useChatSelection,
} from '$lib/hooks/sidebar'

export function useSidebar() {
	const list = useChatList()
	const selection = useChatSelection()
	const operations = useChatOperations({
		selectedChatIds: selection.selectedChatIds,
		clearSelection: selection.clearSelection,
		setShowBatchDeleteConfirm: selection.setShowBatchDeleteConfirm,
	})

	return {
		chats: list.chats,
		searchQuery: list.searchQuery,
		setSearchQuery: list.setSearchQuery,
		showSystemChat: list.showSystemChat,
		setShowSystemChat: list.setShowSystemChat,
		chatToEdit: operations.chatToEdit,
		setChatToEdit: operations.setChatToEdit,
		chatToDelete: operations.chatToDelete,
		setChatToDelete: operations.setChatToDelete,
		newTitle: operations.newTitle,
		setNewTitle: operations.setNewTitle,
		createNewChat: operations.createNewChat,
		importChat: operations.importChat,
		exportWorkspaceBackup: operations.exportWorkspaceBackup,
		importWorkspaceBackup: operations.importWorkspaceBackup,
		togglePin: operations.togglePin,
		saveChatTitle: operations.saveChatTitle,
		deleteChat: operations.deleteChat,
		openEditDialog: operations.openEditDialog,
		newIcon: operations.newIcon,
		setNewIcon: operations.setNewIcon,
		newColor: operations.newColor,
		setNewColor: operations.setNewColor,
		// selection
		startSelectionMode: selection.startSelectionMode,
		toggleChatSelection: selection.toggleChatSelection,
		isSelectionMode: selection.isSelectionMode,
		selectedChatIds: selection.selectedChatIds,
		batchPin: operations.batchPin,
		batchUnpin: operations.batchUnpin,
		batchDelete: operations.batchDelete,
		showBatchDeleteConfirm: selection.showBatchDeleteConfirm,
		setShowBatchDeleteConfirm: selection.setShowBatchDeleteConfirm,
		// order
		updateChatOrder: operations.updateChatOrder,
	}
}
