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
import { ICON_MAP, PRESET_COLORS, type IconKey } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ScrollArea } from '$lib/components/ui/scroll-area'

interface SidebarDialogsProps {
	chatToEdit: Chat | null
	chatToDelete: Chat | null
	newTitle: string
	onNewTitleChange: (val: string) => void
	newIcon: string
	onNewIconChange: (val: string) => void
	newColor: string
	onNewColorChange: (val: string) => void
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
	const deleteButtonRef = useRef<HTMLButtonElement>(null)

	return (
		<>
			<Dialog open={!!chatToEdit} onOpenChange={open => !open && onCloseEdit()}>
				<DialogContent className='sm:max-w-[400px]'>
					<DialogHeader>
						<DialogTitle>Edit Chat</DialogTitle>
					</DialogHeader>

					<div className='py-4 space-y-5'>
						<div className='space-y-2'>
							<Label htmlFor='name'>Title</Label>
							<Input
								id='name'
								value={newTitle}
								onChange={e => onNewTitleChange(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && onSaveEdit()}
							/>
						</div>

						<div className='space-y-2'>
							<Label>Icon</Label>
							<ScrollArea className='h-[90px] w-full rounded-md border p-2'>
								<div className='grid grid-cols-6 gap-2'>
									{Object.entries(ICON_MAP).map(([key, IconComponent]) => (
										<button
											type='button'
											key={key}
											onClick={() => onNewIconChange(key)}
											className={cn(
												'flex items-center justify-center p-2 rounded-md transition-all hover:bg-muted',
												newIcon === key &&
													'bg-primary/10 ring-2 ring-primary ring-offset-1',
											)}
											title={key}
										>
											<IconComponent
												className='h-5 w-5'
												style={{
													color: newIcon === key ? newColor : undefined,
												}}
											/>
										</button>
									))}
								</div>
							</ScrollArea>
						</div>

						<div className='space-y-2'>
							<Label>Color</Label>
							<div className='flex flex-wrap gap-2'>
								{PRESET_COLORS.map(color => (
									<button
										type='button'
										key={color}
										onClick={() => onNewColorChange(color)}
										className={cn(
											'w-6 h-6 rounded-full transition-transform hover:scale-110',
											newColor === color &&
												'ring-2 ring-offset-2 ring-foreground scale-110',
										)}
										style={{ backgroundColor: color }}
										title={color}
									/>
								))}
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button variant='outline' onClick={onCloseEdit}>
							Cancel
						</Button>
						<Button onClick={onSaveEdit}>Save Changes</Button>
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
