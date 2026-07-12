import { Plus, Search, Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
import { Button } from '$lib/components/ui/button'
import { Input } from '$lib/components/ui/input'

interface SidebarHeaderProps {
	searchQuery: string
	onSearchChange: (val: string) => void
	onCreateChat: () => void
	onOpenSettings: () => void
	isSelectionMode: boolean
}

export function SidebarHeader({
	searchQuery,
	onSearchChange,
	onCreateChat,
	onOpenSettings,
	isSelectionMode,
}: SidebarHeaderProps) {
	return (
		<div className='p-4 space-y-4'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<Avatar className='h-9 w-9'>
						<AvatarImage src='/logo.svg' alt='@stkossman' />
						<AvatarFallback>SK</AvatarFallback>
					</Avatar>
					<div className='flex flex-col'>
						<span className='text-sm font-semibold'>Soliloquy</span>
						<span className='text-xs text-muted-foreground'>Local Storage</span>
					</div>
				</div>

				<div className='flex items-center gap-1'>
					{!isSelectionMode && (
						<>
							<Button
								variant='ghost'
								size='icon'
								onClick={onOpenSettings}
								title='Settings'
							>
								<Settings className='h-5 w-5' />
							</Button>

							<Button
								variant='ghost'
								size='icon'
								onClick={onCreateChat}
								title='New Chat'
							>
								<Plus className='h-5 w-5' />
							</Button>
						</>
					)}
				</div>
			</div>

			<div className='relative'>
				<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
				<Input
					placeholder='Search...'
					className='pl-8 bg-background/50 border-sidebar-border focus-visible:ring-sidebar-ring'
					value={searchQuery}
					onChange={e => onSearchChange(e.target.value)}
					disabled={isSelectionMode}
				/>
			</div>
		</div>
	)
}
