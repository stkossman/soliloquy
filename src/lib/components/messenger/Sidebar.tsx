import { db, type Chat } from '$lib/db'
import { cn, formatChatDate } from '@/lib/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
import { Button } from '$lib/components/ui/button'
import { Input } from '$lib/components/ui/input'
import { ScrollArea } from '$lib/components/ui/scroll-area'
import { Separator } from '$lib/components/ui/separator'

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger, } from '$lib/components/ui/context-menu'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '$lib/components/ui/dialog'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '$lib/components/ui/alert-dialog'

import { Label } from '$lib/components/ui/label'

import { MessageSquare, Pin, Plus, Search, Pencil, Trash2, PinOff } from 'lucide-react'

interface SidebarProps {
	activeChatId: number | null
	onChatSelect: (id: number | null) => void
}

export function Sidebar({ activeChatId, onChatSelect }: SidebarProps) {
	const [searchQuery, setSearchQuery] = useState('')

	const [chatToEdit, setChatToEdit] = useState<Chat | null>(null);
	const [chatToDelete, setChatToDelete] = useState<Chat | null>(null)
	const [newTitle, setNewTitle] = useState('');

	const chats = useLiveQuery(async () => {
		let allChats = await db.chats.toArray()

		if (searchQuery.trim()) {
			const lowerQuery = searchQuery.toLowerCase()
			allChats = allChats.filter(chat => chat.title.toLowerCase().includes(lowerQuery))
		}

		return allChats.sort((a, b) => {
			if (a.isPinned !== b.isPinned) {
				return a.isPinned ? -1 : 1
			}
			return b.lastModified.getTime() - a.lastModified.getTime()
		})
	}, [searchQuery])

	const createNewChat = async () => {
		const id = await db.chats.add({
			title: 'New Note',
			isPinned: false,
			createdAt: new Date(),
			lastModified: new Date(),
		})
		onChatSelect(id as number)
	};

	const togglePin = async (chat: Chat) => {
		await db.chats.update(chat.id!, { isPinned: !chat.isPinned });
	};

	const openEditDialog = (chat: Chat) => {
		setChatToEdit(chat);
		setNewTitle(chat.title);
	};

	const saveChatTitle = async () => {
		if (chatToEdit && newTitle.trim()) {
			await db.chats.update(chatToEdit.id!, { title: newTitle.trim() })
			setChatToEdit(null)
		}
	};

	const deleteChat = async () => {
		if (chatToDelete) {
			await db.transaction('rw', db.chats, db.messages, async () => {
				await db.messages.where({ chatId: chatToDelete.id! }).delete()
				await db.chats.delete(chatToDelete.id!)
			})

			if (activeChatId === chatToDelete.id) {
				onChatSelect(null)
			}
			setChatToDelete(null)
		}
	};

	return (
		<>
			<div className='flex h-full w-[320px] flex-col border-r bg-background'>
				<div className='p-4 space-y-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-3'>
							<Avatar className='h-9 w-9'>
								<AvatarImage src='https://github.com/shadcn.png' alt='@stkossman' />
								<AvatarFallback>SK</AvatarFallback>
							</Avatar>
							<div className='flex flex-col'>
								<span className='text-sm font-semibold'>Soliloquy</span>
								<span className='text-xs text-muted-foreground'>Local Storage</span>
							</div>
						</div>
						<Button variant='ghost' size='icon' onClick={createNewChat}>
							<Plus className='h-5 w-5' />
						</Button>
					</div>

					<div className='relative'>
						<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Search...'
							className='pl-8'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>

				<Separator />

				<ScrollArea className='flex-1'>
					<div className='flex flex-col gap-1 p-2'>
						{chats?.map(chat => (
							<ContextMenu key={chat.id}>
								<ContextMenuTrigger>
									<button
										className={cn(
											'flex flex-col items-start gap-1 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent w-full',
											activeChatId === chat.id && 'bg-accent'
										)}
										onClick={() => onChatSelect(chat.id!)}
										onContextMenu={() => onChatSelect(chat.id!)}
									>
										<div className='flex w-full items-center justify-between'>
											<span className='font-semibold truncate w-[180px]'>{chat.title}</span>
											<span className='text-xs text-muted-foreground tabular-nums'>
												{formatChatDate(chat.lastModified)}
											</span>
										</div>

										<div className='flex w-full items-center justify-between text-muted-foreground'>
											<span className='truncate text-xs w-[200px] h-4'>
												{chat.previewText || <span className='opacity-50 italic'>No messages</span>}
											</span>
											{chat.isPinned && <Pin className='h-3 w-3 rotate-45' />}
										</div>
									</button>
								</ContextMenuTrigger>

								<ContextMenuContent className='w-48'>
									<ContextMenuItem onClick={() => togglePin(chat)}>
										{chat.isPinned ? (
											<>
												<PinOff className='mr-2 h-4 w-4' /> Unpin
											</>
										) : (
											<>
												<Pin className='mr-2 h-4 w-4' /> Pin
											</>
										)}
									</ContextMenuItem>
									<ContextMenuItem onClick={() => openEditDialog(chat)}>
										<Pencil className='mr-2 h-4 w-4' /> Rename
									</ContextMenuItem>
									<ContextMenuSeparator />
									<ContextMenuItem
										className='text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/30'
										onClick={() => setChatToDelete(chat)}
									>
										<Trash2 className='mr-2 h-4 w-4' /> Delete
									</ContextMenuItem>
								</ContextMenuContent>
							</ContextMenu>
						))}

						{chats?.length === 0 && (
							<div className='flex flex-col items-center justify-center py-10 text-center text-muted-foreground'>
								<MessageSquare className='mb-2 h-10 w-10 opacity-20' />
								<p className='text-sm'>No notes</p>
							</div>
						)}
					</div>
				</ScrollArea>
			</div>

			<Dialog open={!!chatToEdit} onOpenChange={open => !open && setChatToEdit(null)}>
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
							onChange={e => setNewTitle(e.target.value)}
							className='mt-2'
							onKeyDown={e => e.key === 'Enter' && saveChatTitle()}
						/>
					</div>
					<DialogFooter>
						<Button variant='outline' onClick={() => setChatToEdit(null)}>
							Cancel
						</Button>
						<Button onClick={saveChatTitle}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={!!chatToDelete} onOpenChange={open => !open && setChatToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action is irreversible. The chat "{chatToDelete?.title}" and all its messages will be permanently deleted.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={deleteChat} className='bg-red-600 hover:bg-red-700 text-white'>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
