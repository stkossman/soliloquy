import { useRef } from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '$lib/components/ui/alert-dialog'
import type { Chat } from '$lib/types'

interface DeleteChatDialogProps {
	chat: Chat | null
	onClose: () => void
	onConfirm: () => void
}

export function DeleteChatDialog({
	chat,
	onClose,
	onConfirm,
}: DeleteChatDialogProps) {
	const deleteButtonRef = useRef<HTMLButtonElement>(null)

	return (
		<AlertDialog open={!!chat} onOpenChange={open => !open && onClose()}>
			<AlertDialogContent
				onOpenAutoFocus={event => {
					event.preventDefault()
					deleteButtonRef.current?.focus()
				}}
			>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action is irreversible. The chat "{chat?.title}" and all its
						messages will be permanently deleted.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						ref={deleteButtonRef}
						onClick={onConfirm}
						className='bg-red-600 hover:bg-red-700 text-white'
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
