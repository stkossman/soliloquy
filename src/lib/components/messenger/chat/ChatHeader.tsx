import { ArrowLeft, Info, MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback } from '$lib/components/ui/avatar'
import { Button } from '$lib/components/ui/button'
import type { Chat } from '$lib/types'

interface ChatHeaderProps {
	chat: Chat
	isPinnedView: boolean
	pinnedCount: number
	onBackToNormal: () => void
}

export function ChatHeader({
	chat,
	isPinnedView,
	pinnedCount,
	onBackToNormal,
}: ChatHeaderProps) {
	const isSystemChat = chat.isSystem

	if (isPinnedView) {
		return (
			<div className='flex h-16 items-center justify-between border-b px-6 py-4 bg-background/95 backdrop-blur z-10 animate-in slide-in-from-left-2'>
				<div className='flex items-center gap-3'>
					<Button variant='ghost' size='icon' onClick={onBackToNormal}>
						<ArrowLeft className='h-5 w-5' />
					</Button>
					<div>
						<h2 className='text-sm font-semibold'>
							{pinnedCount} pinned messages
						</h2>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='flex h-16 items-center justify-between border-b px-6 py-4 bg-background/95 backdrop-blur z-10 animate-in fade-in'>
			<div className='flex items-center gap-3'>
				<Avatar className='h-9 w-9'>
					<AvatarFallback className='bg-muted text-muted-foreground'>
						{isSystemChat ? (
							<Info className='h-5 w-5' />
						) : (
							chat.title.slice(0, 2).toUpperCase()
						)}
					</AvatarFallback>
				</Avatar>
				<div>
					<h2 className='text-sm font-semibold flex items-center gap-2'>
						{chat.title}
					</h2>
					<p className='text-xs text-muted-foreground'>
						{isSystemChat ? 'Read-only' : 'Active'}
					</p>
				</div>
			</div>
			<Button variant='ghost' size='icon'>
				<MoreVertical className='h-5 w-5' />
			</Button>
		</div>
	)
}
