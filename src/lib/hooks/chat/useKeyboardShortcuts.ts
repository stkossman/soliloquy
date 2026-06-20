import { useEffect } from 'react'
import { isSearchShortcut } from './keyboardShortcuts/keyboardShortcuts'

interface UseKeyboardShortcutsParams {
	onOpenSearch: () => void
}

export function useKeyboardShortcuts({
	onOpenSearch,
}: UseKeyboardShortcutsParams) {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (isSearchShortcut(event)) {
				event.preventDefault()
				onOpenSearch()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [onOpenSearch])
}
