import { ICON_MAP, PRESET_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button } from '$lib/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '$lib/components/ui/dialog'
import { Input } from '$lib/components/ui/input'
import { Label } from '$lib/components/ui/label'
import { ScrollArea } from '$lib/components/ui/scroll-area'
import type { Chat } from '$lib/types'

interface EditChatDialogProps {
	chat: Chat | null
	title: string
	onTitleChange: (value: string) => void
	icon: string
	onIconChange: (icon: string) => void
	color: string
	onColorChange: (color: string) => void
	onClose: () => void
	onSave: () => void
}

export function EditChatDialog({
	chat,
	title,
	onTitleChange,
	icon,
	onIconChange,
	color,
	onColorChange,
	onClose,
	onSave,
}: EditChatDialogProps) {
	return (
		<Dialog open={!!chat} onOpenChange={open => !open && onClose()}>
			<DialogContent className='sm:max-w-[400px]'>
				<DialogHeader>
					<DialogTitle>Edit Chat</DialogTitle>
				</DialogHeader>

				<div className='py-4 space-y-5'>
					<div className='space-y-2'>
						<Label htmlFor='name'>Title</Label>
						<Input
							id='name'
							value={title}
							onChange={event => onTitleChange(event.target.value)}
							onKeyDown={event => event.key === 'Enter' && onSave()}
						/>
					</div>

					<div className='space-y-2'>
						<Label>Icon</Label>
						<ScrollArea className='h-[90px] w-full rounded-md border p-2'>
							<div className='grid grid-cols-6 gap-2'>
								{Object.entries(ICON_MAP).map(([key, IconComponent]) => (
									<button
										type='button'
										key={key}
										onClick={() => onIconChange(key)}
										className={cn(
											'flex items-center justify-center p-2 rounded-md transition-all hover:bg-muted',
											icon === key &&
												'bg-primary/10 ring-2 ring-primary ring-offset-1',
										)}
										title={key}
									>
										<IconComponent
											className='h-5 w-5'
											style={{ color: icon === key ? color : undefined }}
										/>
									</button>
								))}
							</div>
						</ScrollArea>
					</div>

					<div className='space-y-2'>
						<Label>Color</Label>
						<div className='flex flex-wrap gap-2'>
							{PRESET_COLORS.map(presetColor => (
								<button
									type='button'
									key={presetColor}
									onClick={() => onColorChange(presetColor)}
									className={cn(
										'w-6 h-6 rounded-full transition-transform hover:scale-110',
										color === presetColor &&
											'ring-2 ring-offset-2 ring-foreground scale-110',
									)}
									style={{ backgroundColor: presetColor }}
									title={presetColor}
								/>
							))}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={onSave}>Save Changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
