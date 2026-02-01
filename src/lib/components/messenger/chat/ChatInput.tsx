import { Check, Pencil, Send, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '$lib/components/ui/button'
import { Textarea } from '$lib/components/ui/textarea'
import type { Message } from '$lib/types'
import { ChatFormattingToolbar } from './ChatFormattingToolbar'
import { useRef, useState } from 'react'

interface ChatInputProps {
	value: string
	onChange: (val: string) => void
	onSend: () => void
	editingMessage: Message | null
	onCancelEdit: () => void
	isSystemChat: boolean
	isPinnedView: boolean
	pinnedCount: number
	onUnpinAll: () => void
}

export function ChatInput({
	value,
	onChange,
	onSend,
	editingMessage,
	onCancelEdit,
	isSystemChat,
	isPinnedView,
	pinnedCount,
	onUnpinAll,
}: ChatInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const [showToolbar, setShowToolbar] = useState(false)
	const [selectionRange, setSelectionRange] = useState<{
		start: number
		end: number
	} | null>(null)

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			onSend()
			setShowToolbar(false)
		}
	}

	const handleSelect = () => {
		const el = textareaRef.current
		if (!el) return
		if (el.selectionStart !== el.selectionEnd) {
			setShowToolbar(true)
			setSelectionRange({ start: el.selectionStart, end: el.selectionEnd })
		} else {
			setShowToolbar(false)
			setSelectionRange(null)
		}
	}

	const applyFormat = (
		format: 'bold' | 'italic' | 'strike' | 'mono' | 'spoiler' | 'link',
	) => {
		if (!textareaRef.current || !selectionRange) return

		const start = selectionRange.start
		const end = selectionRange.end
		const selectedText = value.substring(start, end)
		let newText = ''
		let offset = 0

		switch (format) {
			case 'bold':
				newText = `**${selectedText}**`
				offset = 2
				break
			case 'italic':
				newText = `*${selectedText}*`
				offset = 1
				break
			case 'strike':
				newText = `~~${selectedText}~~`
				offset = 2
				break
			case 'mono':
				newText = `\`${selectedText}\``
				offset = 1
				break
			case 'spoiler':
				newText = `||${selectedText}||`
				offset = 2
				break
			case 'link':
				newText = `[${selectedText}](url)`
				offset = 1
				break
		}

		const newValue = value.substring(0, start) + newText + value.substring(end)
		onChange(newValue)
		setShowToolbar(false)

		setTimeout(() => {
			const el = textareaRef.current
			if (el) {
				el.focus()

				if (format === 'link') {
					const urlStart = start + selectedText.length + 3
					const urlEnd = urlStart + 3
					el.setSelectionRange(urlStart, urlEnd)
				} else {
					el.setSelectionRange(start + offset, end + offset)
				}
			}
		}, 0)
	}

	if (isPinnedView) {
		return (
			<div className='border-t p-4 bg-background'>
				<Button
					variant='secondary'
					className='w-full text-destructive hover:text-destructive hover:bg-destructive/10 uppercase text-xs font-semibold tracking-wide'
					onClick={onUnpinAll}
				>
					Unpin all {pinnedCount} messages
				</Button>
			</div>
		)
	}

	if (isSystemChat) {
		return (
			<div className='border-t p-4 bg-background'>
				<div className='flex h-12 items-center justify-center rounded-xl bg-muted/20 text-xs text-muted-foreground italic'>
					This is a system chat. Read-only.
				</div>
			</div>
		)
	}

	return (
		<div className='border-t p-4 bg-background relative'>
			{showToolbar && !editingMessage && (
				<ChatFormattingToolbar onFormat={applyFormat} />
			)}

			{editingMessage && (
				<div className='flex items-center justify-between px-2 pb-2 text-xs text-primary/70 animate-in slide-in-from-bottom-2'>
					<div className='flex items-center gap-2'>
						<Pencil className='h-3 w-3' />
						<span>Editing message</span>
					</div>
					<button
						type='button'
						onClick={() => {
							onCancelEdit()
							setShowToolbar(false)
						}}
						className='hover:text-destructive transition-colors'
					>
						<X className='h-3 w-3' />
					</button>
				</div>
			)}

			<div
				className={cn(
					'flex items-end gap-2 rounded-xl border bg-muted/30 p-2 transition-all',
					editingMessage &&
						'ring-1 ring-primary/20 border-primary/20 bg-primary/5',
				)}
			>
				<Textarea
					ref={textareaRef}
					value={value}
					onChange={e => {
						onChange(e.target.value)
						if (showToolbar) setShowToolbar(false)
					}}
					onKeyDown={handleKeyDown}
					onSelect={handleSelect}
					placeholder={editingMessage ? 'Edit...' : 'Write a note...'}
					className='min-h-[20px] max-h-[200px] w-full resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0'
					rows={1}
				/>
				<Button
					size='icon'
					onClick={onSend}
					className='mb-1 h-8 w-8 shrink-0 rounded-full transition-all'
					variant={editingMessage ? 'secondary' : 'default'}
				>
					{editingMessage ? (
						<Check className='h-4 w-4' />
					) : (
						<Send className='h-4 w-4' />
					)}
				</Button>
			</div>
		</div>
	)
}
