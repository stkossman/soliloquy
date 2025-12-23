import { db } from '$lib/db'
import { cn, formatChatDate } from '@/lib/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
import { Button } from '$lib/components/ui/button'
import { Input } from '$lib/components/ui/input'
import { ScrollArea } from '$lib/components/ui/scroll-area'
import { Separator } from '$lib/components/ui/separator'

import { MessageSquare, Pin, Plus, Search } from 'lucide-react'

interface SidebarProps {
	activeChatId: number | null
	onChatSelect: (id: number) => void
}

export function Sidebar({ activeChatId, onChatSelect }: SidebarProps) {
	const [searchQuery, setSearchQuery] = useState('')

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
	}

	return (
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
						<button
							key={chat.id}
							className={cn(
								'flex flex-col items-start gap-1 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent',
								activeChatId === chat.id && 'bg-accent'
							)}
							onClick={() => onChatSelect(chat.id!)}
						>
							<div className='flex w-full items-center justify-between'>
								<span className='font-semibold truncate w-[180px]'>{chat.title}</span>
								<span className='text-xs text-muted-foreground tabular-nums'>{formatChatDate(chat.lastModified)}</span>
							</div>

							<div className='flex w-full items-center justify-between text-muted-foreground'>
								<span className='truncate text-xs w-[200px]'>No preview</span>
								{chat.isPinned && <Pin className='h-3 w-3 rotate-45' />}
							</div>
						</button>
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
	)
}
