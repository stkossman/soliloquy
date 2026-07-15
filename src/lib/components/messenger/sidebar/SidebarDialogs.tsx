import type { Chat } from '$lib/types'
import { DeleteChatDialog } from './DeleteChatDialog'
import { EditChatDialog } from './EditChatDialog'

interface SidebarDialogsProps {
	chatToEdit: Chat | null
	chatToDelete: Chat | null
	newTitle: string
	onNewTitleChange: (value: string) => void
	newIcon: string
	onNewIconChange: (icon: string) => void
	newColor: string
	onNewColorChange: (color: string) => void
	onCloseEdit: () => void
	onSaveEdit: () => void
	onCloseDelete: () => void
	onConfirmDelete: () => void
}

export function SidebarDialogs({
	chatToEdit,
	chatToDelete,
	newTitle,
	onNewTitleChange,
	newIcon,
	onNewIconChange,
	newColor,
	onNewColorChange,
	onCloseEdit,
	onSaveEdit,
	onCloseDelete,
	onConfirmDelete,
}: SidebarDialogsProps) {
	return (
		<>
			<EditChatDialog
				chat={chatToEdit}
				title={newTitle}
				onTitleChange={onNewTitleChange}
				icon={newIcon}
				onIconChange={onNewIconChange}
				color={newColor}
				onColorChange={onNewColorChange}
				onClose={onCloseEdit}
				onSave={onSaveEdit}
			/>
			<DeleteChatDialog
				chat={chatToDelete}
				onClose={onCloseDelete}
				onConfirm={onConfirmDelete}
			/>
		</>
	)
}
