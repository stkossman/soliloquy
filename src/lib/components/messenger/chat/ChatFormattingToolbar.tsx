import {
	Bold,
	Italic,
	Strikethrough,
	Code,
	EyeOff,
	Link as LinkIcon,
} from 'lucide-react'
import { Button } from '$lib/components/ui/button'

interface ChatFormattingToolbarProps {
	onFormat: (
		format: 'bold' | 'italic' | 'strike' | 'mono' | 'spoiler' | 'link',
	) => void
}

export function ChatFormattingToolbar({
	onFormat,
}: ChatFormattingToolbarProps) {
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault()
	}

	return (
		<div
			className='absolute -top-12 left-0 right-0 mx-auto w-fit flex items-center gap-1 p-1 rounded-lg bg-popover border shadow-md animate-in slide-in-from-bottom-2 fade-in zoom-in-95 z-50'
			onMouseDown={handleMouseDown}
		>
			<Button
				variant='ghost'
				size='icon'
				className='h-8 w-8'
				onClick={() => onFormat('bold')}
				title='Bold'
			>
				<Bold className='h-4 w-4' />
			</Button>
			<Button
				variant='ghost'
				size='icon'
				className='h-8 w-8'
				onClick={() => onFormat('italic')}
				title='Italic'
			>
				<Italic className='h-4 w-4' />
			</Button>
			<Button
				variant='ghost'
				size='icon'
				className='h-8 w-8'
				onClick={() => onFormat('strike')}
				title='Strikethrough'
			>
				<Strikethrough className='h-4 w-4' />
			</Button>
			<Button
				variant='ghost'
				size='icon'
				className='h-8 w-8'
				onClick={() => onFormat('mono')}
				title='Monospace'
			>
				<Code className='h-4 w-4' />
			</Button>
			<Button
				variant='ghost'
				size='icon'
				className='h-8 w-8'
				onClick={() => onFormat('spoiler')}
				title='Spoiler'
			>
				<EyeOff className='h-4 w-4' />
			</Button>
			<div className='w-px h-4 bg-border mx-1' />
			<Button
				variant='ghost'
				size='icon'
				className='h-8 w-8'
				onClick={() => onFormat('link')}
				title='Link'
			>
				<LinkIcon className='h-4 w-4' />
			</Button>
		</div>
	)
}
