import { Button } from '$lib/components/ui/button'

interface ChatInputStatusProps {
	isPinnedView: boolean
	pinnedCount: number
	onUnpinAll: () => void
	isSystemChat: boolean
}

export function ChatInputStatus({
	isPinnedView,
	pinnedCount,
	onUnpinAll,
	isSystemChat,
}: ChatInputStatusProps) {
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

	return null
}
