import { List } from 'lucide-react'
import type { Message } from '$lib/types'

interface PinnedBarProps {
	message: Message | null
	index: number
	onClick: () => void
	onViewList: (e: React.MouseEvent) => void
}

export function PinnedBar({
	message,
	index,
	onClick,
	onViewList,
}: PinnedBarProps) {
	if (!message) return null

	return (
		<div
			onClick={onClick}
			role='button'
			tabIndex={0}
			onKeyDown={e => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					onClick()
				}
			}}
			className='flex items-center justify-between px-4 py-2 bg-muted/50 border-b text-xs cursor-pointer hover:bg-muted transition-colors select-none group'
		>
			<div className='flex items-center gap-3 overflow-hidden'>
				<div className='w-0.5 h-8 bg-primary rounded-full shrink-0'></div>
				<div className='flex flex-col overflow-hidden'>
					<span className='font-semibold text-primary'>
						Pinned Message #{index + 1}
					</span>
					<span className='truncate text-muted-foreground opacity-90'>
						{message.content}
					</span>
				</div>
			</div>
			<button
				type='button'
				onClick={e => {
					e.stopPropagation()
					onViewList(e)
				}}
				className='p-1.5 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-primary'
			>
				<List className='h-4 w-4' />
			</button>
		</div>
	)
}
