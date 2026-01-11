import { MessageSquare, CheckCircle2, XCircle } from 'lucide-react'
//import { ScrollArea } from '$lib/components/ui/scroll-area'
import { Separator } from '$lib/components/ui/separator'
import { useSidebar } from '$lib/hooks/useSidebar'
import { SidebarDialogs } from './sidebar/SidebarDialogs'
import { SidebarHeader } from './sidebar/SidebarHeader'
import { SidebarItem } from './sidebar/SidebarItem'
import { useState, useEffect } from 'react'
import { cn } from '$lib/utils'

interface SidebarProps {
	activeChatId: number | null
	onChatSelect: (id: number | null) => void
}

export function Sidebar({ activeChatId, onChatSelect }: SidebarProps) {
	const logic = useSidebar()

	const [toast, setToast] = useState<{
		type: 'success' | 'error'
		message: string
	} | null>(null)

	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 3000)
			return () => clearTimeout(timer)
		}
	}, [toast])

	const handleImportWrapper = async (file: File) => {
		try {
			await logic.importChat(file, onChatSelect)
			setToast({ type: 'success', message: 'Chat imported successfully.' })
		} catch (e) {
			setToast({ type: 'error', message: 'Failed to import chat.' })
		}
	}

	return (
		<>
			<div className='relative flex h-full w-[320px] flex-col border-r bg-background'>
				<SidebarHeader
					searchQuery={logic.searchQuery}
					onSearchChange={logic.setSearchQuery}
					onCreateChat={() => logic.createNewChat(onChatSelect)}
					onImportChat={handleImportWrapper}
				/>

				<Separator />

				{toast && (
					<div
						className={cn(
							'absolute bottom-4 left-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium animate-in slide-in-from-bottom-2 fade-in duration-300',
							toast.type === 'success'
								? 'bg-green-500/10 text-green-600 border border-green-500/20 dark:text-green-400'
								: 'bg-destructive/10 text-destructive border border-destructive/20',
						)}
					>
						{toast.type === 'success' ? (
							<CheckCircle2 className='h-4 w-4' />
						) : (
							<XCircle className='h-4 w-4' />
						)}
						{toast.message}
					</div>
				)}

				<div className='flex-1 overflow-y-auto min-h-0'>
					<div className='flex flex-col gap-1 p-2'>
						{logic.chats?.map(chat => (
							<SidebarItem
								key={chat.id}
								chat={chat}
								isActive={activeChatId === chat.id}
								onSelect={() => onChatSelect(chat.id!)}
								onPin={() => logic.togglePin(chat)}
								onEdit={() => logic.openEditDialog(chat)}
								onDelete={() => logic.setChatToDelete(chat)}
							/>
						))}

						{logic.chats?.length === 0 && (
							<div className='flex flex-col items-center justify-center py-10 text-center text-muted-foreground'>
								<MessageSquare className='mb-2 h-10 w-10 opacity-20' />
								<p className='text-sm'>No notes</p>
							</div>
						)}
					</div>
				</div>
			</div>

			<SidebarDialogs
				chatToEdit={logic.chatToEdit}
				chatToDelete={logic.chatToDelete}
				newTitle={logic.newTitle}
				onNewTitleChange={logic.setNewTitle}
				onCloseEdit={() => logic.setChatToEdit(null)}
				onSaveEdit={logic.saveChatTitle}
				onCloseDelete={() => logic.setChatToDelete(null)}
				onConfirmDelete={() => logic.deleteChat(activeChatId, onChatSelect)}
			/>
		</>
	)
}
