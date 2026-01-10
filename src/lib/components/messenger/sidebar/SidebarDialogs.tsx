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
import { Button } from '$lib/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '$lib/components/ui/dialog'
import { Input } from '$lib/components/ui/input'
import { Label } from '$lib/components/ui/label'
import type { Chat } from '$lib/types'

interface SidebarDialogsProps {
	chatToEdit: Chat | null
	chatToDelete: Chat | null
	newTitle: string
	onNewTitleChange: (val: string) => void
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
	onCloseEdit,
	onSaveEdit,
	onCloseDelete,
	onConfirmDelete,
}: SidebarDialogsProps) {
	const deleteButtonRef = useRef<HTMLButtonElement>(null)

	return (
		<>
			<Dialog open={!!chatToEdit} onOpenChange={open => !open && onCloseEdit()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rename Chat</DialogTitle>
					</DialogHeader>
					<div className='py-4'>
						<Label htmlFor='name' className='text-right'>
							Title
						</Label>
						<Input
							id='name'
							value={newTitle}
							onChange={e => onNewTitleChange(e.target.value)}
							className='mt-2'
							onKeyDown={e => e.key === 'Enter' && onSaveEdit()}
						/>
					</div>
					<DialogFooter>
						<Button variant='outline' onClick={onCloseEdit}>
							Cancel
						</Button>
						<Button onClick={onSaveEdit}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={!!chatToDelete}
				onOpenChange={open => !open && onCloseDelete()}
			>
				<AlertDialogContent
					onOpenAutoFocus={e => {
						e.preventDefault()
						deleteButtonRef.current?.focus()
					}}
				>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action is irreversible. The chat "{chatToDelete?.title}" and
							all its messages will be permanently deleted.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							ref={deleteButtonRef}
							onClick={onConfirmDelete}
							className='bg-red-600 hover:bg-red-700 text-white'
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
