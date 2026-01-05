import {
	Download,
	FileJson,
	FileText,
	MoreVertical,
	Trash2,
} from 'lucide-react'
import { useState } from 'react'
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '$lib/components/ui/dropdown-menu'

interface ChatActionsMenuProps {
	onClearHistory: () => void
	onExport: (format: 'json' | 'md') => void
	disabled?: boolean
}

export function ChatActionsMenu({
	onClearHistory,
	onExport,
	disabled,
}: ChatActionsMenuProps) {
	const [showClearConfirm, setShowClearConfirm] = useState(false)

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild disabled={disabled}>
					<Button variant='ghost' size='icon'>
						<MoreVertical className='h-5 w-5' />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align='end' className='w-48'>
					<DropdownMenuLabel>Chat Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<Download className='mr-2 h-4 w-4' /> Export Chat
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuItem onClick={() => onExport('md')}>
								<FileText className='mr-2 h-4 w-4' /> Markdown (.md)
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onExport('json')}>
								<FileJson className='mr-2 h-4 w-4' /> JSON (.json)
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						className='text-destructive focus:text-destructive focus:bg-destructive/10'
						onClick={() => setShowClearConfirm(true)}
					>
						<Trash2 className='mr-2 h-4 w-4' /> Clear History
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Clear chat history?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete all messages in this chat. The chat
							itself will remain. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								onClearHistory()
								setShowClearConfirm(false)
							}}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							Clear History
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
