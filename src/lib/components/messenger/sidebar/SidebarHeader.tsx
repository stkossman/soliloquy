import { Plus, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
import { Button } from '$lib/components/ui/button'
import { Input } from '$lib/components/ui/input'

interface SidebarHeaderProps {
	searchQuery: string
	onSearchChange: (val: string) => void
	onCreateChat: () => void
}

export function SidebarHeader({
	searchQuery,
	onSearchChange,
	onCreateChat,
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
				<Button variant='ghost' size='icon' onClick={onCreateChat}>
					<Plus className='h-5 w-5' />
				</Button>
			</div>

			<div className='relative'>
				<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
				<Input
					placeholder='Search...'
					className='pl-8'
					value={searchQuery}
					onChange={e => onSearchChange(e.target.value)}
				/>
			</div>
		</div>
	)
}
