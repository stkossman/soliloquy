import { ChevronRight } from 'lucide-react'
import type { ComponentType } from 'react'
import { Button } from '$lib/components/ui/button'
import { cn } from '$lib/utils'

interface SettingsMenuRowProps {
	icon: ComponentType<{ className?: string }>
	iconClassName: string
	title: string
	description: string
	onClick: () => void
}

export function SettingsMenuRow({
	icon: Icon,
	iconClassName,
	title,
	description,
	onClick,
}: SettingsMenuRowProps) {
	return (
		<Button
			variant='ghost'
			className='min-h-16 w-full justify-start px-3 py-3 text-left whitespace-normal'
			onClick={onClick}
		>
			<span
				className={cn(
					'flex size-10 shrink-0 items-center justify-center rounded-md',
					iconClassName,
				)}
			>
				<Icon className='size-5' />
			</span>
			<span className='min-w-0 flex-1'>
				<span className='block text-sm font-medium'>{title}</span>
				<span className='block truncate text-sm text-muted-foreground'>
					{description}
				</span>
			</span>
			<ChevronRight className='ml-auto text-muted-foreground' />
		</Button>
	)
}
