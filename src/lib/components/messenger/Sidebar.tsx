import { MessageSquare } from 'lucide-react'
//import { ScrollArea } from '$lib/components/ui/scroll-area'
import { Separator } from '$lib/components/ui/separator'
import { useSidebar } from '$lib/hooks/useSidebar'
import { SidebarDialogs } from './sidebar/SidebarDialogs'
import { SidebarHeader } from './sidebar/SidebarHeader'
import { SidebarItem } from './sidebar/SidebarItem'

interface SidebarProps {
	activeChatId: number | null
	onChatSelect: (id: number | null) => void
}

export function Sidebar({ activeChatId, onChatSelect }: SidebarProps) {
	const logic = useSidebar()

	return (
		<>
			<div className='flex h-full w-[320px] flex-col border-r bg-background'>
				<SidebarHeader
					searchQuery={logic.searchQuery}
					onSearchChange={logic.setSearchQuery}
					onCreateChat={() => logic.createNewChat(onChatSelect)}
				/>

				<Separator />

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
