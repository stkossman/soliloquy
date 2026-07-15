import type { ComponentType } from 'react'
import { Button } from '$lib/components/ui/button'

interface SettingsActionRowProps {
	title: string
	description: string
	buttonLabel: string
	icon: ComponentType<{ className?: string }>
	iconClassName?: string
	onClick: () => void
	disabled?: boolean
}

export function SettingsActionRow({
	title,
	description,
	buttonLabel,
	icon: Icon,
	iconClassName,
	onClick,
	disabled,
}: SettingsActionRowProps) {
	return (
		<div className='flex min-h-16 items-center justify-between gap-6 border-b pb-4 last:border-b-0'>
			<div className='space-y-1'>
				<p className='text-sm font-medium'>{title}</p>
				<p className='text-sm text-muted-foreground'>{description}</p>
			</div>
			<Button variant='outline' size='sm' onClick={onClick} disabled={disabled}>
				<Icon className={iconClassName} />
				{buttonLabel}
			</Button>
		</div>
	)
}
