import { Calendar, ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Button } from '$lib/components/ui/button'
import { Input } from '$lib/components/ui/input'

interface ChatSearchToolbarProps {
	query: string
	onQueryChange: (val: string) => void
	currentMatch: number
	totalMatches: number
	onNext: () => void
	onPrev: () => void
	onClose: () => void
	onDateSelect: (date: Date) => void
}

export function ChatSearchToolbar({
	query,
	onQueryChange,
	currentMatch,
	totalMatches,
	onNext,
	onPrev,
	onClose,
	onDateSelect,
}: ChatSearchToolbarProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	const dateInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			if (e.shiftKey) onPrev()
			else onNext()
		}
		if (e.key === 'Escape') {
			e.preventDefault()
			onClose()
		}
	}

	return (
		<div className='flex h-12 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur animate-in slide-in-from-top-2 z-20'>
			<Search className='h-4 w-4 text-muted-foreground' />
			<Input
				ref={inputRef}
				value={query}
				onChange={e => onQueryChange(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder='Find in chat...'
				className='h-8 border-none shadow-none focus-visible:ring-0 bg-transparent px-2'
			/>

			<div className='flex items-center gap-1'>
				{totalMatches > 0 && (
					<span className='text-xs text-muted-foreground mr-2 tabular-nums'>
						{currentMatch} of {totalMatches}
					</span>
				)}

				<Button
					variant='ghost'
					size='icon'
					className='h-7 w-7'
					onClick={onPrev}
					disabled={totalMatches === 0}
					title='Previous match (Shift+Enter)'
				>
					<ChevronUp className='h-4 w-4' />
				</Button>
				<Button
					variant='ghost'
					size='icon'
					className='h-7 w-7'
					onClick={onNext}
					disabled={totalMatches === 0}
					title='Next match (Enter)'
				>
					<ChevronDown className='h-4 w-4' />
				</Button>

				<div className='mx-1 h-4 w-px bg-border' />

				<div className='relative'>
					<Button
						variant='ghost'
						size='icon'
						className='h-7 w-7'
						onClick={() => dateInputRef.current?.showPicker()}
						title='Jump to date'
					>
						<Calendar className='h-4 w-4' />
					</Button>
					<input
						ref={dateInputRef}
						type='date'
						className='absolute inset-0 opacity-0 cursor-pointer -z-10'
						onChange={e => {
							if (e.target.valueAsDate) {
								onDateSelect(e.target.valueAsDate)
							}
						}}
					/>
				</div>

				<Button
					variant='ghost'
					size='icon'
					className='h-7 w-7 hover:bg-destructive/10 hover:text-destructive'
					onClick={onClose}
				>
					<X className='h-4 w-4' />
				</Button>
			</div>
		</div>
	)
}
