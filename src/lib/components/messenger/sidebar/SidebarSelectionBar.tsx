import { Pin, PinOff, Trash2 } from 'lucide-react'
import { Button } from '$lib/components/ui/button'

interface SidebarSelectionBarProps {
	selectedCount: number
	onPinSelected: () => void
	onUnpinSelected: () => void
	onDeleteSelected: () => void
}

export function SidebarSelectionBar({
	selectedCount,
	onPinSelected,
	onUnpinSelected,
	onDeleteSelected,
}: SidebarSelectionBarProps) {
	if (selectedCount === 0) return null

	return (
		<div className='absolute bottom-4 left-4 right-4 bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-xl shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300 z-40'>
			<span className='text-xs font-semibold pl-2'>
				{selectedCount} selected
			</span>
			<div className='flex items-center gap-1'>
				<Button
					size='icon'
					variant='ghost'
					className='h-8 w-8 hover:bg-sidebar-foreground/20 text-sidebar-primary-foreground'
					onClick={onPinSelected}
					title='Pin Selected'
				>
					<Pin className='h-4 w-4' />
				</Button>
				<Button
					size='icon'
					variant='ghost'
					className='h-8 w-8 hover:bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
					onClick={onUnpinSelected}
					title='Unpin Selected'
				>
					<PinOff className='h-4 w-4' />
				</Button>
				<div className='w-px h-4 bg-sidebar-primary-foreground/20 mx-1'></div>
				<Button
					size='icon'
					variant='ghost'
					className='h-8 w-8 hover:bg-red-500/20 text-sidebar-primary-foreground hover:text-white'
					onClick={onDeleteSelected}
					title='Delete Selected'
				>
					<Trash2 className='h-4 w-4' />
				</Button>
			</div>
		</div>
	)
}
