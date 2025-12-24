import { useState, useRef, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Message } from '$lib/db'
import { cn } from '@/lib/utils'
import { MessageBubble } from './MessageBubble'

import { Button } from '$lib/components/ui/button'
import { Textarea } from '$lib/components/ui/textarea'
import { Avatar, AvatarFallback } from '$lib/components/ui/avatar'
import { Send, MoreVertical, X, Check, Pencil, ArrowLeft, List, Info } from 'lucide-react'

interface ChatWindowProps {
	activeChatId: number
}

export function ChatWindow({ activeChatId }: ChatWindowProps) {
	const [inputValue, setInputValue] = useState('')
	const [editingMessage, setEditingMessage] = useState<Message | null>(null)

	const scrollViewportRef = useRef<HTMLDivElement>(null)
	const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

	const [isPinnedView, setIsPinnedView] = useState(false)
	const [activePinIndex, setActivePinIndex] = useState<number>(-1)

	const chat = useLiveQuery(() => db.chats.get(activeChatId), [activeChatId])

	const allMessages = useLiveQuery(() => {
		return db.messages.where('chatId').equals(activeChatId).sortBy('createdAt')
	}, [activeChatId])

	const pinnedMessages = useLiveQuery(() => {
		return db.messages
			.where('chatId')
			.equals(activeChatId)
			.filter(msg => !!msg.isPinned)
			.toArray()
	}, [activeChatId]);

	useEffect(() => {
		setIsPinnedView(false)
		setEditingMessage(null)
		setInputValue('')
	}, [activeChatId])

	useEffect(() => {
		if (pinnedMessages && pinnedMessages.length > 0) {
			if (activePinIndex === -1 || activePinIndex >= pinnedMessages.length) {
				setActivePinIndex(pinnedMessages.length - 1)
			}
		} else {
			setActivePinIndex(-1)
		}
	}, [pinnedMessages?.length, activeChatId])

	useEffect(() => {
		if (scrollViewportRef.current && !editingMessage && !isPinnedView) {
			scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight
		}
	}, [allMessages?.length, activeChatId, isPinnedView])

	const handlePinClick = () => {
		if (!pinnedMessages || activePinIndex === -1) return
		const targetMsg = pinnedMessages[activePinIndex]
		const el = messageRefs.current.get(targetMsg.id!)

		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'center' })
			el.classList.add('bg-primary/10', 'ring-2', 'ring-primary/20')
			setTimeout(() => el.classList.remove('bg-primary/10', 'ring-2', 'ring-primary/20'), 1000)
		}

		setActivePinIndex(prev => {
			const next = prev - 1
			return next < 0 ? pinnedMessages.length - 1 : next
		})
	}

	const currentDisplayPin = pinnedMessages && activePinIndex !== -1 ? pinnedMessages[activePinIndex] : null;

	const handleSendOrUpdate = async () => {
		if (!inputValue.trim()) return
		const text = inputValue.trim()

		if (editingMessage) {
			await db.messages.update(editingMessage.id!, { content: text, isEdited: true })
			const lastMsg = await db.messages.where('chatId').equals(activeChatId).last()
			if (lastMsg && lastMsg.id === editingMessage.id) {
				await db.chats.update(activeChatId, { previewText: text })
			}
			cancelEdit()
		} else {
			await db.transaction('rw', db.chats, db.messages, async () => {
				await db.messages.add({
					chatId: activeChatId,
					content: text,
					createdAt: new Date(),
					isEdited: false,
					isPinned: false,
				})
				await db.chats.update(activeChatId, {
					lastModified: new Date(),
					previewText: text,
				})
			})
			setInputValue('')
		}
	}

	const deleteMessage = async (id: number) => {
		await db.messages.delete(id)
		if (isPinnedView && pinnedMessages && pinnedMessages.length <= 1) {
			setIsPinnedView(false)
		}

		const lastMsg = await db.messages.where('chatId').equals(activeChatId).last()
		await db.chats.update(activeChatId, { previewText: lastMsg ? lastMsg.content : '' })
	}

	const pinMessage = async (msg: Message) => {
		await db.messages.update(msg.id!, { isPinned: !msg.isPinned })
	}

	const unpinAllMessages = async () => {
		if (!pinnedMessages) return
		await db.transaction('rw', db.messages, async () => {
			for (const msg of pinnedMessages) {
				await db.messages.update(msg.id!, { isPinned: false })
			}
		})
		setIsPinnedView(false)
	}

	const startEditing = (msg: Message) => {
		if (isPinnedView) setIsPinnedView(false)
		setEditingMessage(msg)
		setInputValue(msg.content)
	}

	const cancelEdit = () => {
		setEditingMessage(null)
		setInputValue('')
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSendOrUpdate()
		}
	}

	const messagesToRender = isPinnedView ? pinnedMessages : allMessages

	if (!chat) return <div className='flex h-full items-center justify-center'>Loading...</div>

	const isSystemChat = chat?.isSystem

	return (
		<div className='flex h-full flex-col'>
			<div className='flex h-16 items-center justify-between border-b px-6 py-4 bg-background/95 backdrop-blur z-10 transition-all'>
				{isPinnedView ? (
					<div className='flex items-center gap-3 animate-in slide-in-from-left-2'>
						<Button variant='ghost' size='icon' onClick={() => setIsPinnedView(false)}>
							<ArrowLeft className='h-5 w-5' />
						</Button>
						<div>
							<h2 className='text-sm font-semibold'>{pinnedMessages?.length || 0} pinned messages</h2>
						</div>
					</div>
				) : (
					<div className='flex items-center gap-3 animate-in fade-in'>
						<Avatar className='h-9 w-9'>
							<AvatarFallback className='bg-muted text-muted-foreground'>
								{isSystemChat ? <Info className='h-5 w-5' /> : chat.title.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div>
							<h2 className='text-sm font-semibold flex items-center gap-2'>{chat.title}</h2>
							<p className='text-xs text-muted-foreground'>
								{isSystemChat ? 'Read-only' : `${allMessages?.length || 0} messages`}
							</p>
						</div>
					</div>
				)}

				{!isPinnedView && (
					<Button variant='ghost' size='icon'>
						<MoreVertical className='h-5 w-5' />
					</Button>
				)}
			</div>

			{currentDisplayPin && !isPinnedView && (
				<div
					onClick={handlePinClick}
					className='flex items-center justify-between px-4 py-2 bg-muted/50 border-b text-xs cursor-pointer hover:bg-muted transition-colors select-none group'
				>
					<div className='flex items-center gap-3 overflow-hidden'>
						<div className='w-0.5 h-8 bg-primary rounded-full shrink-0'></div>
						<div className='flex flex-col overflow-hidden'>
							<span className='font-semibold text-primary'>Pinned Message #{activePinIndex + 1}</span>
							<span className='truncate text-muted-foreground opacity-90'>{currentDisplayPin.content}</span>
						</div>
					</div>
					<button
						onClick={e => {
							e.stopPropagation()
							setIsPinnedView(true)
						}}
						className='p-1.5 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-primary'
					>
						<List className='h-4 w-4' />
					</button>
				</div>
			)}

			<div className='flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth' ref={scrollViewportRef}>
				{messagesToRender?.map(msg => (
					<div
						key={msg.id}
						ref={el => {
							if (el) messageRefs.current.set(msg.id!, el)
							else messageRefs.current.delete(msg.id!)
						}}
						className='transition-all duration-500 rounded-2xl'
					>
						<MessageBubble message={msg} onDelete={deleteMessage} onPin={pinMessage} onEdit={startEditing} />
					</div>
				))}
			</div>

			<div className='border-t p-4 bg-background'>
				{isPinnedView ? (
					<Button
						variant='secondary'
						className='w-full text-destructive hover:text-destructive hover:bg-destructive/10 uppercase text-xs font-semibold tracking-wide'
						onClick={unpinAllMessages}
					>
						Unpin all {pinnedMessages?.length} messages
					</Button>
				) : isSystemChat ? (
					<div className='flex h-12 items-center justify-center rounded-xl bg-muted/20 text-xs text-muted-foreground italic'>
						This is a system chat. Read-only.
					</div>
				) : (
					<>
						{editingMessage && (
							<div className='flex items-center justify-between px-2 pb-2 text-xs text-primary/70 animate-in slide-in-from-bottom-2'>
								<div className='flex items-center gap-2'>
									<Pencil className='h-3 w-3' />
									<span>Editing message</span>
								</div>
								<button onClick={cancelEdit} className='hover:text-destructive transition-colors'>
									<X className='h-3 w-3' />
								</button>
							</div>
						)}

						<div
							className={cn(
								'flex items-end gap-2 rounded-xl border bg-muted/30 p-2 transition-all',
								editingMessage && 'ring-1 ring-primary/20 border-primary/20 bg-primary/5'
							)}
						>
							<Textarea
								value={inputValue}
								onChange={e => setInputValue(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder={editingMessage ? 'Edit...' : 'Write a note...'}
								className='min-h-[20px] max-h-[200px] w-full resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0'
								rows={1}
							/>
							<Button
								size='icon'
								onClick={handleSendOrUpdate}
								className='mb-1 h-8 w-8 shrink-0 rounded-full transition-all'
								variant={editingMessage ? 'secondary' : 'default'}
							>
								{editingMessage ? <Check className='h-4 w-4' /> : <Send className='h-4 w-4' />}
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	)
}
