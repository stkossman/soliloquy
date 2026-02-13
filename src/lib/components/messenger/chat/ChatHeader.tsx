import { ArrowLeft, Info, Search } from 'lucide-react'
import { Avatar, AvatarFallback } from '$lib/components/ui/avatar'
import { Button } from '$lib/components/ui/button'
import type { Chat } from '$lib/types'
import { ChatActionsMenu } from './ChatActionsMenu'
import { ICON_MAP, type IconKey } from '@/lib/constants'

interface ChatHeaderProps {
	chat: Chat
	isPinnedView: boolean
	pinnedCount: number
	onBackToNormal: () => void
	onClearHistory: () => void
	onExport: (format: 'json' | 'md') => void
	zoomLevel: number
	onSetZoom: (level: number) => void
	onToggleSearch: () => void
}

export function ChatHeader({
	chat,
	isPinnedView,
	pinnedCount,
	onBackToNormal,
	onClearHistory,
	onExport,
	zoomLevel,
	onSetZoom,
	onToggleSearch,
}: ChatHeaderProps) {
	const isSystemChat = chat.isSystem

	const IconComponent =
		chat.icon && ICON_MAP[chat.icon as IconKey]
			? ICON_MAP[chat.icon as IconKey]
			: null

	const iconBgStyle = chat.color
		? { backgroundColor: `${chat.color}20`, color: chat.color }
		: {}

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
					{isSystemChat ? (
						<AvatarFallback className='bg-blue-500/10 text-blue-500'>
							<Info className='h-5 w-5' />
						</AvatarFallback>
					) : IconComponent ? (
						<AvatarFallback style={iconBgStyle} className='transition-colors'>
							<IconComponent className='h-5 w-5' />
						</AvatarFallback>
					) : (
						<AvatarFallback className='bg-muted text-muted-foreground'>
							{chat.title.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					)}
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
			<div className='flex items-center gap-1'>
				<Button
					variant='ghost'
					size='icon'
					onClick={onToggleSearch}
					disabled={!!isSystemChat}
					title='Search in chat (Ctrl+F)'
				>
					<Search className='h-5 w-5' />
				</Button>

				<ChatActionsMenu
					onClearHistory={onClearHistory}
					onExport={onExport}
					zoomLevel={zoomLevel}
					onSetZoom={onSetZoom}
					disabled={!!isSystemChat}
				/>
			</div>
		</div>
	)
}
