import { useState, useRef, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '$lib/db'
import { MessageBubble } from './MessageBubble'

import { Button } from '$lib/components/ui/button'
import { Textarea } from '$lib/components/ui/textarea'
import { Avatar, AvatarFallback } from '$lib/components/ui/avatar'
import { Send, MoreVertical } from 'lucide-react'

interface ChatWindowProps {
	activeChatId: number
}

export function ChatWindow({ activeChatId }: ChatWindowProps) {
	const [inputValue, setInputValue] = useState('')
	const scrollViewportRef = useRef<HTMLDivElement>(null)

	const chat = useLiveQuery(() => db.chats.get(activeChatId), [activeChatId])

	const messages = useLiveQuery(() => {
		return db.messages.where('chatId').equals(activeChatId).sortBy('createdAt')
	}, [activeChatId])

	useEffect(() => {
		if (scrollViewportRef.current) {
			scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight
		}
	}, [messages])

	const sendMessage = async () => {
		if (!inputValue.trim()) return
		const text = inputValue.trim()
		setInputValue('')

		await db.transaction('rw', db.chats, db.messages, async () => {
			await db.messages.add({
				chatId: activeChatId,
				content: text,
				createdAt: new Date(),
				isEdited: false,
			})
			await db.chats.update(activeChatId, {
				lastModified: new Date(),
			})
		})
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			sendMessage()
		}
	}

	if (!chat) return <div className='flex h-full items-center justify-center'>Loading...</div>

	return (
		<div className='flex h-full flex-col'>
			<div className='flex h-16 items-center justify-between border-b px-6 py-4'>
				<div className='flex items-center gap-3'>
					<Avatar className='h-9 w-9'>
						<AvatarFallback className='bg-muted text-muted-foreground'>
							{chat.title.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div>
						<h2 className='text-sm font-semibold'>{chat.title}</h2>
						<p className='text-xs text-muted-foreground'>{messages?.length || 0} messages</p>
					</div>
				</div>
				<Button variant='ghost' size='icon'>
					<MoreVertical className='h-5 w-5' />
				</Button>
			</div>

			<div className='flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth' ref={scrollViewportRef}>
				{messages?.map(msg => (
					<MessageBubble key={msg.id} message={msg} />
				))}

				{messages?.length === 0 && (
					<div className='flex h-full items-center justify-center opacity-20'>
						<span className='text-sm'>It's empty here for now...</span>
					</div>
				)}
			</div>

			<div className='border-t p-4 bg-background'>
				<div className='flex items-end gap-2 rounded-xl border bg-muted/30 p-2 focus-within:ring-1 focus-within:ring-ring'>
					<Textarea
						value={inputValue}
						onChange={e => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder='Write a note...'
						className='min-h-[20px] max-h-[200px] w-full resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0'
						rows={1}
					/>
					<Button size='icon' onClick={sendMessage} className='mb-1 h-8 w-8 shrink-0 rounded-full'>
						<Send className='h-4 w-4' />
					</Button>
				</div>
			</div>
		</div>
	)
}
